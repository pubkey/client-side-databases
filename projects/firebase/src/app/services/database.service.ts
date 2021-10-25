import {
    Injectable
} from '@angular/core';

import * as firebase from 'firebase/app';
import {
    Firestore,
    CollectionReference,
    getFirestore,
    enableMultiTabIndexedDbPersistence,
    collection,
    connectFirestoreEmulator,
    disableNetwork
} from 'firebase/firestore';
import { doReplication } from 'src/shared/util-browser';
import {
    FIREBASE_CREDENTIALS,
    MESSAGES_COLLECTION,
    USERS_COLLECTION
} from '../../firebase-config';

export type Database = Firestore;
export type Collection = CollectionReference;
let DB: Database;

/**
 * This is run via APP_INITIALIZER in app.module.ts
 */
export async function initDatabase() {
    console.log('initDatabase()');
    const app = firebase.initializeApp(FIREBASE_CREDENTIALS);
    DB = getFirestore(app);

    if (doReplication()) {
        /**
         * @link https://firebase.google.com/docs/emulator-suite/connect_and_prototype#web-version-9_1
         */
        connectFirestoreEmulator(DB, 'localhost', 8080);
        await enableMultiTabIndexedDbPersistence(DB);
    } else {
        await enableMultiTabIndexedDbPersistence(DB);
        await disableNetwork(DB);
    }
}

export function getDatabase(): Database {
    return DB;
}


export function getUsersCollection(): Collection {
    return collection(DB, USERS_COLLECTION);
}

export function getMessagesCollection(): Collection {
    return collection(DB, MESSAGES_COLLECTION);
}

@Injectable()
export class DatabaseService {
}
