import type {
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
            type: 'string',
            maxLength: 40
        },
        text: {
            type: 'string'
        },
        createdAt: {
            type: 'number',
            minimum: 0,
            maximum: 100000000000000,
            multipleOf: 1
        },
        read: {
            description: 'true if was read by the reciever',
            type: 'boolean'
        },
        sender: {
            type: 'string',
            ref: 'users',
            maxLength: 40
        },
        reciever: {
            type: 'string',
            ref: 'users',
            maxLength: 40
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
