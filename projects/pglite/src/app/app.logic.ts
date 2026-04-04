import {
    Observable,
    combineLatest
} from 'rxjs';
import {
    switchMap,
    map,
    shareReplay,
    startWith,
    mergeMap,
    filter
} from 'rxjs/operators';
import {
    LogicInterface
} from '../../../../src/app/logic-interface.interface';
import {
    Message,
    UserWithLastMessage,
    User,
    AddMessage,
    UserPair,
    Search
} from '../../../../src/shared/types';
import {
    DatabaseType,
    createDatabase
} from './services/database.service';
import {
    doesMessageMapUserPair,
    sortByNewestFirst
} from 'src/shared/util-server';
import { RXJS_SHARE_REPLAY_DEFAULTS } from 'rxdb';

export class Logic implements LogicInterface {
    private dbPromise: Promise<DatabaseType> = createDatabase();
    private db!: DatabaseType;

    constructor() {
        this.dbPromise.then(db => this.db = db);
    }

    getUserByName(userName$: Observable<string>): Observable<User> {
        return userName$.pipe(
            mergeMap((userName) => this.dbPromise.then(() => userName)),
            switchMap(userName => {
                return this.db.users$.pipe(
                    startWith(undefined),
                    map(() => userName)
                );
            }),
            switchMap(async (userName) => {
                const result = await this.db.db.query<User>(
                    `SELECT id, "createdAt" FROM users WHERE id = $1 LIMIT 1`,
                    [userName]
                );
                return result.rows[0] ?? null;
            }),
            filter((doc): doc is User => !!doc)
        );
    }

    getSearchResults(search$: Observable<Search>): Observable<UserWithLastMessage[]> {
        return search$.pipe(
            switchMap(search => {
                return this.db.messages$.pipe(
                    startWith(undefined),
                    map(() => search)
                );
            }),
            switchMap(async (search) => {
                const result = await this.db.db.query<Message>(
                    `SELECT id, text, "createdAt", read, sender, reciever
                     FROM messages
                     WHERE text ILIKE $1
                       AND (sender = $2 OR reciever = $2)`,
                    [`%${search.searchTerm}%`, search.ownUser.id]
                );
                return { search, messages: result.rows };
            }),
            switchMap(async ({ search, messages }) => {
                return Promise.all(
                    messages.map(async (message) => {
                        const otherUserId = message.sender === search.ownUser.id
                            ? message.reciever
                            : message.sender;
                        const userResult = await this.db.db.query<User>(
                            `SELECT id, "createdAt" FROM users WHERE id = $1 LIMIT 1`,
                            [otherUserId]
                        );
                        return {
                            user: userResult.rows[0],
                            message
                        } as UserWithLastMessage;
                    })
                );
            })
        );
    }

    getUsersWithLastMessages(ownUser$: Observable<User>): Observable<UserWithLastMessage[]> {
        const usersNotOwn$ = ownUser$.pipe(
            switchMap(ownUser => {
                return this.db.users$.pipe(
                    startWith(undefined),
                    map(() => ownUser)
                );
            }),
            switchMap(async (ownUser) => {
                const result = await this.db.db.query<User>(
                    `SELECT id, "createdAt" FROM users WHERE id != $1`,
                    [ownUser.id]
                );
                return result.rows;
            }),
            shareReplay(RXJS_SHARE_REPLAY_DEFAULTS)
        );

        const usersWithLastMessage$: Observable<UserWithLastMessage[]> = combineLatest([
            ownUser$,
            usersNotOwn$
        ]).pipe(
            map(([ownUser, usersNotOwn]) => {
                return usersNotOwn.map((user) => {
                    return this.getLastMessageOfUserPair({
                        user1: ownUser,
                        user2: user
                    }).pipe(
                        map(message => ({ user, message })),
                        shareReplay(RXJS_SHARE_REPLAY_DEFAULTS)
                    );
                });
            }),
            switchMap(streams => combineLatest(streams)),
            map(usersWithLastMessage => sortByNewestFirst(usersWithLastMessage as any))
        );

        return usersWithLastMessage$;
    }

    private getLastMessageOfUserPair(
        userPair: UserPair
    ): Observable<Message | undefined> {
        return this.db.messages$.pipe(
            startWith(undefined),
            switchMap(async () => {
                const result = await this.db.db.query<Message>(
                    `SELECT id, text, "createdAt", read, sender, reciever
                     FROM messages
                     WHERE (sender = $1 AND reciever = $2)
                        OR (sender = $2 AND reciever = $1)
                     ORDER BY "createdAt" DESC
                     LIMIT 1`,
                    [userPair.user1.id, userPair.user2.id]
                );
                return result.rows[0];
            }),
            shareReplay(RXJS_SHARE_REPLAY_DEFAULTS)
        );
    }

    public getMessagesForUserPair(
        userPair$: Observable<UserPair>
    ): Observable<Message[]> {
        return userPair$.pipe(
            switchMap(userPair => {
                return this.db.messages$.pipe(
                    startWith(undefined),
                    map(() => userPair)
                );
            }),
            switchMap(async (userPair) => {
                const result = await this.db.db.query<Message>(
                    `SELECT id, text, "createdAt", read, sender, reciever
                     FROM messages
                     WHERE (sender = $1 AND reciever = $2)
                        OR (sender = $2 AND reciever = $1)
                     ORDER BY "createdAt" ASC`,
                    [userPair.user1.id, userPair.user2.id]
                );
                return result.rows;
            })
        );
    }

    async addMessage(message: AddMessage): Promise<any> {
        await this.dbPromise;
        const m = message.message;
        await this.db.db.query(
            `INSERT INTO messages (id, text, "createdAt", read, sender, reciever)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING`,
            [m.id, m.text, m.createdAt, m.read, m.sender, m.reciever]
        );
    }

    async addUser(user: User): Promise<any> {
        await this.dbPromise;
        await this.db.db.query(
            `INSERT INTO users (id, "createdAt")
             VALUES ($1, $2)
             ON CONFLICT (id) DO NOTHING`,
            [user.id, user.createdAt]
        );
    }

    async hasData(): Promise<boolean> {
        await this.dbPromise;
        const result = await this.db.db.query<{ count: string }>(
            `SELECT COUNT(*) as count FROM users`
        );
        return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
    }
}
