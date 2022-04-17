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

import {
    GRAPHQL_PORT,
    GRAPHQL_PATH,
    GRAPHQL_SUBSCRIPTION_PORT,
    GRAPHQL_SUBSCRIPTION_PATH
} from '../src/app/shared';
import {
    unixInSeconds
} from '../../../src/shared/util-server';
import { Message, User } from '../../../src/shared/types';
import { graphQLSchemaFromRxSchema } from 'rxdb/plugins/replication-graphql';
import { RxUsersSchema } from './app/schemas/user.schema';
import { RxMessagesSchema } from './app/schemas/message.schema';

const exampleData: {
    users: User[];
    messages: Message[];
} = require('../../../example-data.json');

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
        messages: []
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
            feedKeys: [
                'id',
                'createdAt'
            ],
            deletedFlag: 'deleted'
        },
        messages: {
            schema: RxMessagesSchema,
            feedKeys: [
                'id',
                'createdAt'
            ],
            deletedFlag: 'deleted'
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
        feedUsers: (args: any) => {
            log('## feedUsers()');
            console.dir(args);
            const users = state.users;
            const ret = filterForFeedResult(
                users,
                args.createdAt,
                args.id,
                args.limit
            );
            log('got ' + ret.length + ' users');
            return ret;
        },
        feedMessages: (args: any) => {
            log('## feedMessages()');
            const ret = filterForFeedResult(
                state.messages,
                args.createdAt,
                args.id,
                args.limit
            );
            console.dir(args);
            log('got ' + ret.length + ' messages');
            return ret;
        },
        setMessages: (args: {
            messages: Message[]
        }) => {
            const messages: Message[] = args.messages;
            messages.forEach(message => {
                log('## addMessage() ' + message.id + ' from ' + message.sender);

                // overwrite timestamp
                message.createdAt = unixInSeconds();

                // log(message);
                addMessageToState(message);

                pubsub.publish(
                    'changedMessages',
                    {
                        changedMessages: message
                    }
                );
            });
        },
        setUsers: (args: any) => {
            log('## registerUser()');
            const time = (new Date().getTime() / 1000);
            const user = {
                id: 'u' + time,
                name: args.name,
                createdAt: time,
                deleted: false
            };

            state.users.push(user);
            pubsub.publish(
                'changedUsers',
                {
                    changedUsers: user
                }
            );
            return user;
        },
        changedUsers: () => pubsub.asyncIterator('changedUsers'),
        changedMessages: () => pubsub.asyncIterator('changedMessages')
    };

    // add start-messages to state
    root.setMessages({
        messages: startData.messages
    });


    // server graphql-endpoint
    app.use(GRAPHQL_PATH, graphqlHTTP({
        schema,
        rootValue: root,
        graphiql: true,
    }));

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
