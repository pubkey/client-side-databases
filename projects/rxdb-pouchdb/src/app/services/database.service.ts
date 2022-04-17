import {
    isDevMode
} from '@angular/core';
import {
    SubscriptionClient
} from 'subscriptions-transport-ws';

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
    ucfirst
} from 'rxdb';

import {
    addPouchPlugin,
    PouchDB,
    getRxStoragePouch
} from 'rxdb/plugins/pouchdb';

import {
    GraphQLSchemaFromRxSchemaInputSingleCollection,
    pullQueryBuilderFromRxSchema,
    pushQueryBuilderFromRxSchema,
    RxGraphQLReplicationState
} from 'rxdb/plugins/replication-graphql';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import * as PouchdbAdapterIdb from 'pouchdb-adapter-idb';

import { RxDBReplicationGraphQLPlugin } from 'rxdb/plugins/replication-graphql';
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents';
import { RxDBKeyCompressionPlugin } from 'rxdb/plugins/key-compression';
import { doReplication, logTime } from 'src/shared/util-browser';

async function loadRxDBPlugins(): Promise<any> {

    addRxPlugin(RxDBLocalDocumentsPlugin);

    addRxPlugin(RxDBLeaderElectionPlugin);

    // enable replication via graphql
    addRxPlugin(RxDBReplicationGraphQLPlugin);

    /**
     * indexed-db adapter
     */
    addPouchPlugin(PouchdbAdapterIdb);

    /**
     * key-compression
     */
    addRxPlugin(RxDBKeyCompressionPlugin);

    /**
     * to reduce the build-size,
     * we use some modules in dev-mode only
     */
    if (isDevMode()) {
        await Promise.all([

            /**
             * Enable the dev mode plugin
             */
            import('rxdb/plugins/dev-mode').then(
                module => addRxPlugin(module.RxDBDevModePlugin)
            ),

            // we use the schema-validation only in dev-mode
            // this validates each document if it is matching the jsonschema
            import('rxdb/plugins/validate').then(
                module => addRxPlugin(module.RxDBValidatePlugin)
            ),

            // enable debug to detect slow queries
            import('pouchdb-debug' + '').then(
                module => addPouchPlugin(module['default'])
            )
        ]);
        PouchDB.debug.enable('pouchdb:find');
    } else {
        // in production we do not use any validation plugin
        // to reduce the build-size
    }
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
export async function createDatabase(): Promise<RxChatDatabase> {
    logTime('createDatabase()');
    await loadRxDBPlugins();

    const db = await createRxDatabase<RxChatCollections>({
        // name: 'chat' + new Date().getTime(),
        name: 'chat',
        storage: getRxStoragePouch('idb'),
        eventReduce: true,
        multiInstance: true
        //        password: 'myLongAndStupidPassword'
    });

    // create collections
    await db.addCollections(collections);

    // start graphql replication
    if (doReplication()) {

        const replicationStates: {
            [k: string]: RxGraphQLReplicationState<any>
        } = {
            user: startGraphQLReplication(
                db.users,
                {
                    schema: RxUsersSchema,
                    feedKeys: [
                        'id',
                        'createdAt'
                    ],
                    deletedFlag: 'deleted'
                }
            ),
            message: startGraphQLReplication(
                db.messages,
                {
                    schema: RxMessagesSchema,
                    feedKeys: [
                        'id',
                        'createdAt'
                    ],
                    deletedFlag: 'deleted'
                }
            )
        };

        // listen to websocket to trigger replication on server changes
        const wsClient = new SubscriptionClient(
            GRAPHQL_WS_PATH,
            {
                reconnect: true,
                timeout: 1000 * 60,
                connectionCallback: () => {
                    // console.log('SubscriptionClient.connectionCallback:');
                },
                reconnectionAttempts: 10000,
                inactivityTimeout: 10 * 1000,
                lazy: true
            }
        );
        Object.entries(replicationStates).forEach(([entityName, replicationState]) => {
            const typeName = ucfirst(entityName);
            const subscriptionQuery = `
        subscription onChanged${typeName}s {
            changed${typeName}s {
                deleted
            }
        }`;
            const ret = wsClient.request({
                query: subscriptionQuery
            });
            ret.subscribe({
                next(data) {
                    // console.log('subscription(' + typeName + ') emitted => trigger run');
                    // console.dir(data);
                    replicationState.run();
                },
                error(error) {
                    console.error('got error(' + typeName + '): on subscription');
                    console.dir(error);
                }
            });
        });
    }


    logTime('createDatabase() DONE');
    return db;
}



function startGraphQLReplication<RxDocType>(
    collection: RxCollection<RxDocType>,
    input: GraphQLSchemaFromRxSchemaInputSingleCollection
): RxGraphQLReplicationState<RxDocType> {
    const pullQueryBuilder = pullQueryBuilderFromRxSchema(
        collection.name,
        input,
        10
    );
    const pushQueryBuilder = pushQueryBuilderFromRxSchema(
        collection.name,
        input
    );

    const replicationState: RxGraphQLReplicationState<RxDocType> = collection.syncGraphQL({
        url: GRAPHQL_HTTP_PATH,
        push: {
            batchSize: 10,
            queryBuilder: pushQueryBuilder
        },
        pull: {
            batchSize: 10,
            queryBuilder: pullQueryBuilder
        },
        live: true,
        liveInterval: 1000 * 60 * 10,
        deletedFlag: 'deleted'
    });

    return replicationState;

}
