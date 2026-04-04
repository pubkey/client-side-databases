import { PGlite } from '@electric-sql/pglite';
import { Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RXJS_SHARE_REPLAY_DEFAULTS } from 'rxdb';
import { logTime } from 'src/shared/util-browser';

export interface DatabaseType {
    db: PGlite;
    users$: Observable<void>;
    messages$: Observable<void>;
}

/**
 * Creates the PGlite database with IndexedDB persistence,
 * initializes tables and change-notification triggers.
 */
export async function createDatabase(): Promise<DatabaseType> {
    logTime('createDatabase()');

    const db = new PGlite('idb://chat-db');
    await db.waitReady;

    logTime('create tables');
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            "createdAt" BIGINT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            "createdAt" BIGINT NOT NULL,
            read BOOLEAN NOT NULL,
            sender TEXT NOT NULL,
            reciever TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages ("createdAt");

        CREATE OR REPLACE FUNCTION notify_users_change()
        RETURNS trigger AS $$
        BEGIN
            PERFORM pg_notify('users_change', '');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE FUNCTION notify_messages_change()
        RETURNS trigger AS $$
        BEGIN
            PERFORM pg_notify('messages_change', '');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS users_change_trigger ON users;
        CREATE TRIGGER users_change_trigger
        AFTER INSERT OR UPDATE OR DELETE ON users
        FOR EACH ROW EXECUTE FUNCTION notify_users_change();

        DROP TRIGGER IF EXISTS messages_change_trigger ON messages;
        CREATE TRIGGER messages_change_trigger
        AFTER INSERT OR UPDATE OR DELETE ON messages
        FOR EACH ROW EXECUTE FUNCTION notify_messages_change();
    `);
    logTime('create tables DONE');

    const usersSubject = new Subject<void>();
    const messagesSubject = new Subject<void>();

    await db.listen('users_change', () => {
        usersSubject.next();
    });
    await db.listen('messages_change', () => {
        messagesSubject.next();
    });

    logTime('createDatabase() DONE');
    return {
        db,
        users$: usersSubject.asObservable().pipe(
            shareReplay(RXJS_SHARE_REPLAY_DEFAULTS)
        ),
        messages$: messagesSubject.asObservable().pipe(
            shareReplay(RXJS_SHARE_REPLAY_DEFAULTS)
        )
    };
}
