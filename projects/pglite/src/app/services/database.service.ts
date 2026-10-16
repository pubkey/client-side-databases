import { PGlite } from '@electric-sql/pglite';
import { live, PGliteWithLive } from '@electric-sql/pglite/live';

export const DATABASE_NAME = 'chat-pglite';

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at DOUBLE PRECISION NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        created_at DOUBLE PRECISION NOT NULL,
        read BOOLEAN NOT NULL,
        sender TEXT NOT NULL,
        reciever TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS messages_sender_reciever_created_at
        ON messages (sender, reciever, created_at);
    CREATE INDEX IF NOT EXISTS messages_created_at
        ON messages (created_at);
`;

/**
 * The angular build does not resolve the wasm and data files
 * via import.meta.url, so they are copied as assets (see angular.json)
 * and passed to PGlite by hand.
 */
async function loadAssets() {
    const [pgliteWasmModule, initdbWasmModule, fsBundle] = await Promise.all([
        WebAssembly.compileStreaming(fetch('/pglite.wasm')),
        WebAssembly.compileStreaming(fetch('/initdb.wasm')),
        fetch('/pglite.data').then(response => response.blob())
    ]);
    return { pgliteWasmModule, initdbWasmModule, fsBundle };
}

export async function createDatabase(): Promise<PGliteWithLive> {
    const db = await PGlite.create({
        ...await loadAssets(),
        /**
         * Persist the data into IndexedDB.
         * relaxedDurability stays disabled so that each write
         * is directly flushed, to make a fair comparison
         * with the other persistent databases.
         */
        dataDir: 'idb://' + DATABASE_NAME,
        relaxedDurability: false,
        extensions: {
            live
        }
    });
    await db.exec(SCHEMA);
    return db;
}
