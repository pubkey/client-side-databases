/**
 * inserts test-data to the couchdb server
 */
import got from 'got';
import PouchDBModule from 'pouchdb-core';
import PouchDbFindModule from 'pouchdb-find';
import PouchDbAdapterMemory from 'pouchdb-adapter-memory';
import PouchReplicationPlugin from 'pouchdb-replication';
import PouchdbAdapterHttp from 'pouchdb-adapter-http';
import { PouchDBInstance } from 'rxdb';
import { COUCHDB_PATH, normalToPouchDoc } from './app/shared';

import { Message, User } from '../../../src/shared/types';
const exampleData: {
    users: User[];
    messages: Message[];
} = require('../../../example-data.json');

const PouchDB: any = PouchDBModule;
PouchDB.plugin(PouchDbFindModule);
PouchDB.plugin(PouchDbAdapterMemory);
PouchDB.plugin(PouchReplicationPlugin);
PouchDB.plugin(PouchdbAdapterHttp);

const pouchdbUsers: PouchDBInstance = new PouchDB(
    'users',
    {
        adapter: 'memory'
    }
);
const pouchdbMessages: PouchDBInstance = new PouchDB(
    'messages',
    {
        adapter: 'memory'
    }
);

async function run() {

    let serverUp = false;
    while (!serverUp) {
        try {
            const response = await got(COUCHDB_PATH).json();
            console.dir(response);
            serverUp = true;
        } catch (err) {
            console.log('couchdb server not up at ' + COUCHDB_PATH);
        }
    }

    // add test-data to local db
    const data = exampleData;
    await pouchdbUsers.bulkDocs(
        data.users.map(user => {
            return normalToPouchDoc(user);
        })
    );
    await pouchdbMessages.bulkDocs(
        data.messages.map(message => {
            return normalToPouchDoc(message);
        })
    );


    // sync test-data upwards
    pouchdbUsers.sync(COUCHDB_PATH + 'users');
    pouchdbMessages.sync(COUCHDB_PATH + 'messages');

    console.log('TEST-DATA inserted');
}


run();
