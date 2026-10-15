import {
    Observable
} from 'rxjs';
import {
    switchMap,
    map,
    shareReplay,
    filter,
    startWith
} from 'rxjs/operators';
import {
    LogicInterface
} from '../../../../src/app/logic-interface.interface';
import {
    createDatabase,
    SQLiteDatabase,
    TableName
} from './services/database.service';
import {
    Message,
    UserWithLastMessage,
    User,
    AddMessage,
    UserPair,
    Search
} from '../../../../src/shared/types';

type UserRow = {
    id: string;
    created_at: number;
};

type MessageRow = {
    id: string;
    text: string;
    created_at: number;
    read: number;
    sender: string;
    reciever: string;
};

/**
 * A user row joined with the (optional) last message
 * of the conversation with that user.
 */
type UserWithMessageRow = {
    user_id: string;
    user_created_at: number;
    message_id: string | null;
    text: string | null;
    created_at: number | null;
    read: number | null;
    sender: string | null;
    reciever: string | null;
};

const USER_WITH_MESSAGE_COLUMNS = `
    u.id AS user_id,
    u.created_at AS user_created_at,
    m.id AS message_id,
    m.text,
    m.created_at,
    m.read,
    m.sender,
    m.reciever
`;

export class Logic implements LogicInterface {
    private db: SQLiteDatabase = createDatabase();

    /**
     * SQLite has no observable queries,
     * so we re-run the query each time one of the
     * given tables has been written to.
     */
    private observeQuery<T>(tables: TableName[], sql: string, bind: (string | number | null)[]): Observable<T[]> {
        return this.db.changes$.pipe(
            filter(table => tables.includes(table)),
            startWith(null),
            switchMap(() => this.db.query<T>(sql, bind))
        );
    }

    getUserByName(userName$: Observable<string>): Observable<User> {
        return userName$.pipe(
            switchMap(userName => this.observeQuery<UserRow>(
                ['users'],
                'SELECT * FROM users WHERE id = ?1',
                [userName]
            ).pipe(
                map(rows => rows[0]),
                filter(row => {
                    if (!row) {
                        console.warn('# user document not found ' + userName);
                    } else {
                        console.log('# user document found! ' + userName);
                    }
                    return !!row;
                })
            )),
            map(row => userRowToUser(row))
        );
    }

    getSearchResults(search$: Observable<Search>): Observable<UserWithLastMessage[]> {
        return search$.pipe(
            switchMap(search => this.observeQuery<UserWithMessageRow>(
                ['users', 'messages'],
                `SELECT ${USER_WITH_MESSAGE_COLUMNS}
                FROM messages m
                JOIN users u ON u.id = CASE WHEN m.sender = ?1 THEN m.reciever ELSE m.sender END
                WHERE (m.sender = ?1 OR m.reciever = ?1)
                AND m.text LIKE ?2
                ORDER BY m.created_at ASC`,
                [search.ownUser.id, '%' + search.searchTerm + '%']
            )),
            map(rows => rows.map(row => userWithMessageRowToUserWithLastMessage(row)))
        );
    }

    getUsersWithLastMessages(ownUser$: Observable<User>): Observable<UserWithLastMessage[]> {
        return ownUser$.pipe(
            switchMap(ownUser => this.observeQuery<UserWithMessageRow>(
                ['users', 'messages'],
                `SELECT ${USER_WITH_MESSAGE_COLUMNS}
                FROM users u
                LEFT JOIN messages m ON m.id = (
                    SELECT id FROM messages
                    WHERE (sender = ?1 AND reciever = u.id)
                    OR (sender = u.id AND reciever = ?1)
                    ORDER BY created_at DESC
                    LIMIT 1
                )
                WHERE u.id <> ?1
                ORDER BY COALESCE(m.created_at, 0) DESC`,
                [ownUser.id]
            )),
            map(rows => rows.map(row => userWithMessageRowToUserWithLastMessage(row))),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    getMessagesForUserPair(userPair$: Observable<UserPair>): Observable<Message[]> {
        return userPair$.pipe(
            switchMap(userPair => this.observeQuery<MessageRow>(
                ['messages'],
                `SELECT * FROM messages
                WHERE (sender = ?1 AND reciever = ?2)
                OR (sender = ?2 AND reciever = ?1)
                ORDER BY created_at ASC`,
                [userPair.user1.id, userPair.user2.id]
            )),
            map(rows => rows.map(row => messageRowToMessage(row))),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    async addMessage(message: AddMessage): Promise<any> {
        await this.db.write(
            'messages',
            `INSERT INTO messages (id, text, created_at, read, sender, reciever)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                message.message.id,
                message.message.text,
                message.message.createdAt,
                message.message.read ? 1 : 0,
                message.message.sender,
                message.message.reciever
            ]
        );
    }

    async addUser(user: User): Promise<any> {
        await this.db.write(
            'users',
            'INSERT INTO users (id, created_at) VALUES (?, ?)',
            [user.id, user.createdAt]
        );
    }

    async hasData(): Promise<boolean> {
        const rows = await this.db.query('SELECT id FROM users LIMIT 1');
        return rows.length > 0;
    }
}

function userRowToUser(row: UserRow): User {
    return {
        id: row.id,
        createdAt: row.created_at
    };
}

function messageRowToMessage(row: MessageRow): Message {
    return {
        id: row.id,
        text: row.text,
        createdAt: row.created_at,
        read: !!row.read,
        sender: row.sender,
        reciever: row.reciever
    };
}

function userWithMessageRowToUserWithLastMessage(row: UserWithMessageRow): UserWithLastMessage {
    const ret: UserWithLastMessage = {
        user: {
            id: row.user_id,
            createdAt: row.user_created_at
        }
    };
    if (row.message_id) {
        ret.message = {
            id: row.message_id,
            text: row.text as string,
            createdAt: row.created_at as number,
            read: !!row.read,
            sender: row.sender as string,
            reciever: row.reciever as string
        };
    }
    return ret;
}
