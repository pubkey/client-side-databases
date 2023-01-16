import {
    RxJsonSchema
} from 'rxdb';
import { RxUserDocumentType } from '../types/rxdb';
export const RxUsersSchema: RxJsonSchema<RxUserDocumentType> = {
    title: 'user schema',
    description: 'describes a user',
    version: 0,
    keyCompression: true,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            description: 'the id is also the displayName',
            type: 'string',
            maxLength: 40
        },
        createdAt: {
            type: 'number'
        }
    }
};
