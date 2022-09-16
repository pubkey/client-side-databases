import {
    isDevMode
} from '@angular/core';

// import typings
import type {
    RxChatDatabase,
    RxChatCollections
} from '../types/rxdb.d';

import {
    GRAPHQL_PORT,
    GRAPHQL_PATH,
    GRAPHQL_SUBSCRIPTION_PORT,
    GRAPHQL_SUBSCRIPTION_PATH
} from '../shared';
export const GRAPHQL_HTTP_PATH = 'http://' + window.location.hostname + ':' + GRAPHQL_PORT + GRAPHQL_PATH;
export const GRAPHQL_WS_PATH = 'ws://' + window.location.hostname + ':' + GRAPHQL_SUBSCRIPTION_PORT + GRAPHQL_SUBSCRIPTION_PATH;

import { RxMessagesSchema } from '../schemas/message.schema';
import { RxUsersSchema } from '../schemas/user.schema';

/**
 * Instead of using the default rxdb-import,
 * we do a custom build which lets us cherry-pick
 * only the modules that we need.
 */
import {
    createRxDatabase,
    addRxPlugin,
    RxCollectionCreator,
    RxCollection,
    RxStorage
} from 'rxdb';

import {
    GraphQLSchemaFromRxSchemaInputSingleCollection,
    pullQueryBuilderFromRxSchema,
    pushQueryBuilderFromRxSchema,
    RxGraphQLReplicationState
} from 'rxdb/plugins/replication-graphql';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';

import { RxDBReplicationGraphQLPlugin } from 'rxdb/plugins/replication-graphql';
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents';
import { wrappedKeyCompressionStorage } from 'rxdb/plugins/key-compression';
import { doReplication, logTime } from 'src/shared/util-browser';


async function loadRxDBPlugins(
    baseStorage: RxStorage<any, any>
): Promise<RxStorage<any, any>> {

    addRxPlugin(RxDBLocalDocumentsPlugin);

    addRxPlugin(RxDBLeaderElectionPlugin);

    // enable replication via graphql
    addRxPlugin(RxDBReplicationGraphQLPlugin);

    /**
     * key-compression
     */
    let storage = wrappedKeyCompressionStorage({
        storage: baseStorage
    });

    /**
     * to reduce the build-size,
     * we use some modules in dev-mode only
     */
    if (isDevMode()) {
        await Promise.all([
            /**
             * Enable the dev mode plugin
             */
            await import('rxdb/plugins/dev-mode').then(
                module => {
                    addRxPlugin(module.RxDBDevModePlugin);
                }
            ),

            // we use the schema-validation only in dev-mode
            // this validates each document if it is matching the jsonschema
            await import('rxdb/plugins/validate-ajv').then(
                module => {
                    const wrappedValidateAjvStorage = module.wrappedValidateAjvStorage;
                    storage = wrappedValidateAjvStorage({
                        storage
                    });
                }
            )
        ]);
    } else {
        // in production we do not use any validation plugin
        // to reduce the build-size
    }

    return storage;
}

const collections: { [collectionName: string]: RxCollectionCreator } = {
    messages: {
        schema: RxMessagesSchema,
        methods: {}
    },
    users: {
        schema: RxUsersSchema,
        methods: {}
    }
};

/**
 * creates the database
 */
export async function createDatabase(baseStorage: RxStorage<any, any>): Promise<RxChatDatabase> {
    logTime('createDatabase()');

    const storage = await loadRxDBPlugins(baseStorage);

    const db = await createRxDatabase<RxChatCollections>({
        // name: 'chat' + new Date().getTime(),
        name: baseStorage.name + '-chat',
        storage: storage,
        eventReduce: true,
        multiInstance: true
        //        password: 'myLongAndStupidPassword'
    });

    // create collections
    await db.addCollections(collections);

    console.log('# database created');
    db.messages.$.subscribe(ev => {
        console.log('messages$ emitted:');
        console.dir(ev);
    });

    // start graphql replication
    if (doReplication()) {
        const replicationStates: {
            [k: string]: RxGraphQLReplicationState<any, any>
        } = {
            user: startGraphQLReplication(
                db.users,
                {
                    schema: RxUsersSchema,
                    checkpointFields: [
                        'id',
                        'createdAt'
                    ],
                    deletedField: 'deleted'
                }
            ),
            message: startGraphQLReplication(
                db.messages,
                {
                    schema: RxMessagesSchema,
                    checkpointFields: [
                        'id',
                        'createdAt'
                    ],
                    deletedField: 'deleted'
                }
            )
        };
    }


    logTime('createDatabase() DONE');
    return db;
}



function startGraphQLReplication<RxDocType>(
    collection: RxCollection<RxDocType>,
    input: GraphQLSchemaFromRxSchemaInputSingleCollection
): RxGraphQLReplicationState<RxDocType, any> {
    const pullQueryBuilder = pullQueryBuilderFromRxSchema(
        collection.name,
        input
    );
    const pushQueryBuilder = pushQueryBuilderFromRxSchema(
        collection.name,
        input
    );

    const replicationState: RxGraphQLReplicationState<RxDocType, any> = collection.syncGraphQL({
        url: {
            http: GRAPHQL_HTTP_PATH,
            ws: GRAPHQL_WS_PATH
        },
        push: {
            batchSize: 10,
            queryBuilder: pushQueryBuilder
        },
        pull: {
            batchSize: 10,
            queryBuilder: pullQueryBuilder
        },
        live: true,
        deletedField: input.deletedField
    });

    return replicationState;

}
