/**
 * custom typings so typescript knows about the schema-fields
 * inside of the RxDB database
 */

import type {
    RxDocument,
    RxCollection,
    RxDatabase
} from 'rxdb';
import type {
    Message,
    User
} from '../../../../../src/shared/types';

/* Message collection */
export type RxMessageDocumentType = Message;
export type RxMessageDocument = RxDocument<RxMessageDocumentType>;
export type RxMessageCollection = RxCollection<RxMessageDocumentType>;

/* User collection */
export type RxUserDocumentType = User;
export type RxUserDocument = RxDocument<RxUserDocumentType>;
export type RxUserCollection = RxCollection<RxUserDocumentType>;

export type RxChatCollections = {
    messages: RxMessageCollection,
    users: RxUserCollection
};

export type RxChatDatabase = RxDatabase<RxChatCollections>;
