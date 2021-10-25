import {
    RxJsonSchema
} from 'rxdb';
import type { RxMessageDocumentType } from '../types/rxdb';
export const RxMessagesSchema: RxJsonSchema<RxMessageDocumentType> = {
    title: 'messages schema',
    description: 'describes a message',
    version: 0,
    keyCompression: true,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string'
        },
        text: {
            type: 'string'
        },
        createdAt: {
            type: 'number'
        },
        read: {
            description: 'true if was read by the reciever',
            type: 'boolean'
        },
        sender: {
            type: 'string',
            ref: 'users'
        },
        reciever: {
            type: 'string',
            ref: 'users'
        }
    },
    indexes: [
        'createdAt'
    ],
    required: [
        'text',
        'createdAt',
        'read',
        'sender',
        'reciever'
    ]
};
