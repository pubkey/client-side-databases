/// <reference lib="webworker" />

/**
 * SQLite runs inside of a WebWorker because the OPFS
 * storage (opfs-sahpool VFS) is only available in workers.
 * The opfs-sahpool VFS does not require COOP/COEP headers
 * which is why it is used instead of the plain 'opfs' VFS.
 */
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import type { Database } from '@sqlite.org/sqlite-wasm';
import { WorkerRequest, WorkerResponse } from './worker-messages';

const DATABASE_NAME = 'chat-sqlite-wasm';

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        read INTEGER NOT NULL,
        sender TEXT NOT NULL,
        reciever TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS messages_sender_reciever_created_at
        ON messages (sender, reciever, created_at);
    CREATE INDEX IF NOT EXISTS messages_created_at
        ON messages (created_at);
`;

async function openDatabase(): Promise<Database> {
    /**
     * The angular build does not resolve the wasm file via import.meta.url,
     * so it is copied as an asset (see angular.json) and located by hand.
     */
    const sqlite3 = await (sqlite3InitModule as any)({
        locateFile: (file: string) => '/' + file
    }) as Awaited<ReturnType<typeof sqlite3InitModule>>;
    /**
     * When the page is reloaded, the worker of the previous page
     * might still hold the OPFS access handles for a short time,
     * so we retry until they are released.
     */
    let lastError: any;
    for (let attempt = 0; attempt < 50; attempt++) {
        try {
            const poolUtil = await sqlite3.installOpfsSAHPoolVfs({
                name: DATABASE_NAME
            });
            const db = new poolUtil.OpfsSAHPoolDb('/' + DATABASE_NAME + '.sqlite3');
            db.exec(SCHEMA);
            return db;
        } catch (err) {
            lastError = err;
            await new Promise(res => setTimeout(res, 100));
        }
    }
    throw lastError;
}

const dbPromise = openDatabase();

addEventListener('message', async ({ data }: MessageEvent<WorkerRequest>) => {
    let response: WorkerResponse;
    try {
        const db = await dbPromise;
        const rows = db.exec({
            sql: data.sql,
            bind: data.bind,
            rowMode: 'object',
            returnValue: 'resultRows'
        });
        response = { id: data.id, rows };
    } catch (err: any) {
        response = { id: data.id, error: err && err.message ? err.message : String(err) };
    }
    postMessage(response);
});
