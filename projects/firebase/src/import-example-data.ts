import * as firebase from 'firebase/app';
import {
    Firestore,
    CollectionReference,
    getFirestore,
    collection,
    connectFirestoreEmulator,
    getDocs,
    doc,
    setDoc
} from 'firebase/firestore';
import {
    Message,
    User
} from '../../../src/shared/types';
import {
    FIREBASE_CREDENTIALS,
    MESSAGES_COLLECTION,
    USERS_COLLECTION
} from './firebase-config';

export type Database = Firestore;
export type Collection = CollectionReference;

const exampleData: {
    users: User[];
    messages: Message[];
} = require('../../../example-data.json');

async function importExampleDataset(db: Firestore) {

    const usersCollection = collection(db, USERS_COLLECTION);
    const messagesCollection = collection(db, MESSAGES_COLLECTION);


    const messages = await getDocs(messagesCollection);
    if (messages.docs.length > 0) {
        console.log('importExampleDataset() there is already some data, so skip importing new one.');
        return;
    }

    // enable this to insert test-data into the remote collections
    const data = exampleData;
    await Promise.all(
        data.users.map(
            async (user) => {
                const docRef = doc(usersCollection, user.id);
                await setDoc(
                    docRef,
                    user
                );
            })
    );
    await Promise.all(data.messages.map(
        async (message) => {
            const docRef = doc(messagesCollection, message.id);
            await setDoc(
                docRef,
                message
            );
        })
    );
}


async function waitForConnection(db: Firestore) {
    while (true) {
        try {
            const messagesCollection = collection(db, MESSAGES_COLLECTION);
            await getDocs(messagesCollection);
            return;
        } catch (err) {
            console.log('waitForConnection() error -> retry in one second');
            // console.dir(err);
            await new Promise(res => setTimeout(res, 1000));
        }
    }
}

async function run() {
    console.log('initDatabase()');
    const app = firebase.initializeApp(FIREBASE_CREDENTIALS);
    const DB = getFirestore(app);

    /**
     * @link https://firebase.google.com/docs/emulator-suite/connect_and_prototype#web-version-9_1
     */
    await connectFirestoreEmulator(DB, 'localhost', 8080);

    await waitForConnection(DB);

    console.log('importExampleDataset()');
    await importExampleDataset(DB);

    // wait some time to ensure the replication is in sync
    await new Promise(res => setTimeout(res, 3 * 1000));
}


run();
