const express = require('express');
import {
    Express
} from 'express';
import {
    graphqlHTTP
} from 'express-graphql'
const cors = require('cors');
import { PubSub } from 'graphql-subscriptions';
import {
    buildSchema,
    execute,
    subscribe
} from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';

import { graphQLSchemaFromRxSchema } from 'rxdb/plugins/replication-graphql';
import { lastOfArray } from 'rxdb';
import {
    GRAPHQL_PATH, GRAPHQL_PORT,
    GRAPHQL_SUBSCRIPTION_PATH,
    GRAPHQL_SUBSCRIPTION_PORT
} from 'src/shared/util-graphql';
import { Message, User } from 'src/shared/types';
import { RxUsersSchema } from './src/app/schemas/user.schema';
import { RxMessagesSchema } from './src/app/schemas/message.schema';

import { exampleData } from '../../example-data';

function log(msg: any) {
    const prefix = '# GraphQL Server: ';
    if (typeof msg === 'string') {
        console.log(prefix + msg);
    } else {
        console.log(prefix + JSON.stringify(msg, null, 2));
    }
}

function sortByCreatedAtAndPrimary(a: any, b: any): 1 | 0 | -1 {
    if (a.createdAt > b.createdAt) {
        return 1;
    }
    if (a.createdAt < b.createdAt) {
        return -1;
    }

    if (a.createdAt === b.createdAt) {
        if (a.id > b.id) { return 1; }
        if (a.id < b.id) {
            return -1;
        } else {
            return 0;
        }
    }
    throw new Error('this should never happen');
}

declare interface FeedItem {
    createdAt: number;
    id: string;
}

export function filterForFeedResult(
    items: FeedItem[],
    minCreatedAt: number,
    lastId: string,
    limit: number
): FeedItem[] {
    items = items.sort(sortByCreatedAtAndPrimary);
    const filterForMinUpdatedAtAndId = items.filter(doc => {
        if (doc.createdAt < minCreatedAt) { return false; }
        if (doc.createdAt > minCreatedAt) { return true; }
        if (doc.createdAt === minCreatedAt) {
            if (doc.id > lastId) {
                return true;
            } else {
                return false;
            }
        }
    });
    const limited = filterForMinUpdatedAtAndId.slice(0, limit);
    return limited;
}

declare type WithDeleted<T> = T & { deleted: boolean };

export async function run() {
    const startData = exampleData;
    const state: {
        users: WithDeleted<User>[],
        messages: WithDeleted<Message>[]
    } = {
        users: startData.users.map(user => {
            const userWithDeleted = Object.assign({ deleted: false }, user);
            return userWithDeleted;
        }),
        messages: startData.messages.map(user => {
            const userWithDeleted = Object.assign({ deleted: false }, user);
            return userWithDeleted;
        })
    };
    // to faster access all messages for a specific user,
    // we index the message by user-id here
    const messagesByUser: { [userId: string]: Message[] } = {};
    const getMessageArrayOfUser = (userId: string) => {
        if (!messagesByUser[userId]) {
            messagesByUser[userId] = [];
        }
        return messagesByUser[userId];
    };
    const addMessageToState = (message: Message) => {
        const messageWithDeleted = Object.assign({ deleted: false }, message);
        state.messages.push(messageWithDeleted);
        getMessageArrayOfUser(message.sender).push(message);
        getMessageArrayOfUser(message.reciever).push(message);
    };

    const app: Express = express();
    // cache options request
    app.options('*', (req, res, done) => {
        if (req.method === 'OPTIONS') {
            log('OPTIONS request');
            const headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, PUT, OPTIONS, DELETE',
                'Access-Control-Allow-Credentials': 'false',
                'Access-Control-Max-Age': '86400',
                'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
            };
            res.writeHead(200, headers);
            res.end();
        } else {
            done();
        }
    });
    app.use(cors());


    const generatedSchema = graphQLSchemaFromRxSchema({
        users: {
            schema: RxUsersSchema,
            checkpointFields: [
                'id',
                'createdAt'
            ],
            deletedField: 'deleted'
        },
        messages: {
            schema: RxMessagesSchema,
            checkpointFields: [
                'id',
                'createdAt'
            ],
            deletedField: 'deleted'
        }
    });
    const graphQLSchema = generatedSchema.asString;
    console.log('GraphQL schema:');
    console.log(graphQLSchema);
    const schema = buildSchema(graphQLSchema);

    const pubsub = new PubSub();

    // The root provides a resolver function for each API endpoint
    const root = {
        info: () => 1,
        pullUsers: (args: any) => {
            console.dir(args);
            const users = state.users;
            const lastId = args.checkpoint ? args.checkpoint.id : '';
            const minCreatedAt = args.checkpoint ? args.checkpoint.createdAt : 0;


            const retDocs = filterForFeedResult(
                users,
                minCreatedAt,
                lastId,
                args.limit
            );

            const last = lastOfArray(retDocs);
            const ret = {
                documents: retDocs,
                checkpoint: last ? {
                    id: last.id,
                    createdAt: last.createdAt
                } : {
                    id: lastId,
                    createdAt: minCreatedAt
                }
            };
            return ret;
        },
        pullMessages: (args: any) => {
            const lastId = args.checkpoint ? args.checkpoint.id : '';
            const minCreatedAt = args.checkpoint ? args.checkpoint.createdAt : 0;
            const retDocs = filterForFeedResult(
                state.messages,
                minCreatedAt,
                lastId,
                args.limit
            );
            console.dir(args);
            const last = lastOfArray(retDocs);
            const ret = {
                documents: retDocs,
                checkpoint: last ? {
                    id: last.id,
                    createdAt: last.createdAt
                } : {
                    id: lastId,
                    createdAt: minCreatedAt
                }
            };
            return ret;
        },
        pushUsers: (args: any) => {
            log('## pushUsers()');

            const rows: any[] = args.usersPushRow;
            let lastCheckpoint = {
                id: '',
                createdAt: 0
            };

            const conflicts: any[] = [];
            const writtenDocs: any[] = [];
            rows.forEach(row => {
                const docId = row.newDocumentState.id;
                const docCurrentMaster = state.users.find(d => d.id === docId);

                /**
                 * Detect conflicts.
                 */
                if (
                    docCurrentMaster &&
                    row.assumedMasterState &&
                    docCurrentMaster.createdAt !== row.assumedMasterState.createdAt
                ) {
                    conflicts.push(docCurrentMaster);
                    return;
                }

                const doc = row.newDocumentState;
                state.users = state.users.filter(d => d.id !== doc.id);
                state.users.push(doc);

                lastCheckpoint.id = doc.id;
                lastCheckpoint.createdAt = doc.createdAt;
                writtenDocs.push(doc);
            });

            pubsub.publish(
                'pushUser',
                {
                    streamUser: {
                        documents: writtenDocs,
                        checkpoint: lastCheckpoint
                    }
                }
            );
            console.log('## current documents: ' + state.users.length);
            console.log('## conflicts:');
            console.log(JSON.stringify(conflicts, null, 4));

            return conflicts;
        },
        pushMessages: (args: any) => {
            log('## pushMessages()');

            const rows: any[] = args.messagesPushRow;
            let lastCheckpoint = {
                id: '',
                createdAt: 0
            };

            const conflicts: any[] = [];
            const writtenDocs: any[] = [];
            rows.forEach(row => {
                const docId = row.newDocumentState.id;
                const docCurrentMaster = state.messages.find(d => d.id === docId);

                /**
                 * Detect conflicts.
                 */
                if (
                    docCurrentMaster &&
                    row.assumedMasterState &&
                    docCurrentMaster.createdAt !== row.assumedMasterState.createdAt
                ) {
                    conflicts.push(docCurrentMaster);
                    return;
                }

                const doc = row.newDocumentState;
                state.messages = state.messages.filter(d => d.id !== doc.id);
                state.messages.push(doc);

                lastCheckpoint.id = doc.id;
                lastCheckpoint.createdAt = doc.createdAt;
                writtenDocs.push(doc);
            });

            pubsub.publish(
                'pushMessage',
                {
                    streamMessage: {
                        documents: writtenDocs,
                        checkpoint: lastCheckpoint
                    }
                }
            );
            console.log('## current documents: ' + state.messages.length);
            console.log('## conflicts:');
            console.log(JSON.stringify(conflicts, null, 4));

            return conflicts;
        },
        changedUsers: () => pubsub.asyncIterator('changedUsers'),
        changedMessages: () => pubsub.asyncIterator('changedMessages')
    };

    // server graphql-endpoint
    app.use(
        GRAPHQL_PATH,
        // TODO remove 'as any'
        (graphqlHTTP as any)({
            schema,
            rootValue: root,
            graphiql: true,
        })
    );

    app.listen(GRAPHQL_PORT, () => {
        log('Started graphql-endpoint at http://localhost:' +
            GRAPHQL_PORT + GRAPHQL_PATH
        );
    });

    const appSubscription = express();
    appSubscription.use(cors);
    const serverSubscription = createServer(appSubscription);
    serverSubscription.listen(GRAPHQL_SUBSCRIPTION_PORT, () => {
        log(
            'Started graphql-subscription endpoint at http://localhost:' +
            GRAPHQL_SUBSCRIPTION_PORT + GRAPHQL_SUBSCRIPTION_PATH
        );
        const subServer = new SubscriptionServer(
            {
                execute,
                subscribe,
                schema,
                rootValue: root
            },
            {
                server: serverSubscription,
                path: GRAPHQL_SUBSCRIPTION_PATH,
            }
        );
        return subServer;
    });


    // comment this in for testing of the subscriptions
    /*
    setInterval(() => {
        const flag = new Date().getTime();
        pubsub.publish(
            'humanChanged',
            {
                humanChanged: {
                    id: 'foobar-' + flag,
                    name: 'name-' + flag
                }
            }
        );
        console.log('published humanChanged ' + flag);
    }, 1000);*/
}

run();
