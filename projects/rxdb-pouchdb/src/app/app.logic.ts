import {
    Observable,
    combineLatest
} from 'rxjs';
import {
    switchMap,
    map,
    filter,
    shareReplay,
    mergeMap,
    tap
} from 'rxjs/operators';
import {
    LogicInterface
} from '../../../../src/app/logic-interface.interface';
import {
    RxChatDatabase,
    RxMessageDocument,
    RxMessageDocumentType,
    RxUserDocument,
} from './types/rxdb';
import {
    Message,
    UserWithLastMessage,
    User,
    AddMessage,
    UserPair,
    Search
} from '../../../../src/shared/types';
import {
    sortByNewestFirst
} from 'src/shared/util-server';
import type {
    MangoQuerySelector
} from 'rxdb';


export type CreateDatabaseFunction = () => Promise<RxChatDatabase>;

export class Logic implements LogicInterface {
    private dbPromise: Promise<any> = this.databaseCreator();
    private db: RxChatDatabase;
    constructor(
        private readonly databaseCreator: CreateDatabaseFunction
    ) {
        this.dbPromise.then(db => this.db = db);
    }

    getUserByName(userName$: Observable<string>): Observable<User> {
        return userName$.pipe(
            // this is the first usage of this.db, so we have to await the creation
            mergeMap((userName) => this.dbPromise.then(() => userName)),
            switchMap(userName => this.db
                .users
                .findOne(userName)
                .$
            ),
            filter(doc => !!doc),
            map(doc => {
                if (!doc) {
                    throw new Error('doc missing');
                }
                return doc.toJSON(false);
            })
        );
    }

    getSearchResults(search$: Observable<Search>): Observable<UserWithLastMessage[]> {
        const startTimeBySearch: WeakMap<Search, number> = new WeakMap();
        return search$.pipe(
            tap(search => startTimeBySearch.set(search, performance.now())),
            switchMap(search => {
                const user = search.ownUser;
                return this.db.messages
                    .find({
                        selector: {
                            $and: [
                                {
                                    text: {
                                        $regex: new RegExp(search.searchTerm, 'i')
                                    }
                                },
                                {
                                    $or: [
                                        {
                                            sender: { $eq: user.id }
                                        },
                                        {
                                            reciever: { $eq: user.id }
                                        }
                                    ]
                                }
                            ]
                        }
                    })
                    .$.pipe(
                        map(messages => ({
                            search,
                            messages
                        }))
                    );
            }),
            switchMap(async (searchWithMessages) => {
                const search = searchWithMessages.search;
                const messages: RxMessageDocument[] = searchWithMessages.messages;

                const userDocById: Map<string, Promise<RxUserDocument>> = new Map();

                const withUsers = await Promise.all(
                    messages.map(async (messageDoc) => {
                        let otherUser = messageDoc.sender;
                        if (otherUser === search.ownUser.id) {
                            otherUser = messageDoc.reciever;
                        }
                        /**
                         * Deduplicate user ids for better performance.
                         */
                        let userPromise = userDocById.get(otherUser);
                        if (!userPromise) {
                            userPromise = this.db.users.findOne(otherUser).exec(true);
                            userDocById.set(otherUser, userPromise);
                        }
                        const user = await userPromise;
                        return {
                            user: user.toJSON(false),
                            message: messageDoc.toJSON(false)
                        };
                    })
                );
                return withUsers;
            }),
        );
    }

    getUsersWithLastMessages(ownUser$: Observable<User>): Observable<UserWithLastMessage[]> {
        const usersNotOwn$ = ownUser$.pipe(
            switchMap(ownUser => this.db.users
                .find({
                    selector: {
                        id: {
                            $ne: ownUser.id
                        }
                    }
                })
                .$
            ),
            shareReplay(1)
        );
        const usersWithLastMessage$: Observable<UserWithLastMessage[]> = combineLatest([
            ownUser$,
            usersNotOwn$
        ]).pipe(
            map(([ownUser, usersNotOwn]) => usersNotOwn
                .map(user => {
                    return this.getLastMessageOfUserPair({
                        user1: ownUser,
                        user2: user.toJSON(false)
                    }).pipe(
                        map(message => ({
                            user: user.toJSON(false),
                            message: message ? message.toJSON(false) : null
                        })),
                        shareReplay(1)
                    );
                })
            ),
            switchMap(usersWithLastMessage => combineLatest(usersWithLastMessage)),
            map(usersWithLastMessage => {
                return sortByNewestFirst(usersWithLastMessage as any);
            })
        );
        return usersWithLastMessage$;
    }

    private getLastMessageOfUserPair(
        userPair: UserPair
    ): Observable<RxMessageDocument | null> {
        return this.db.messages
            .findOne({
                selector: matchIfUsersAreBothInMessage(userPair),
                sort: [
                    { createdAt: 'desc' }
                ]
            })
            .$.pipe(
                shareReplay(1)
            );
    }

    public getMessagesForUserPair(
        userPair$: Observable<UserPair>
    ): Observable<Message[]> {
        return userPair$.pipe(
            switchMap(userPair => {
                return this.db
                    .messages
                    .find({
                        selector: matchIfUsersAreBothInMessage(userPair),
                        sort: [
                            { createdAt: 'asc' }
                        ]
                    })
                    .$;
            }
            ),
            map(docs => docs.map(doc => doc.toJSON(false))),
            shareReplay()
        );
    }

    async addMessage(message: AddMessage): Promise<any> {
        await this.dbPromise;
        try {
            await this.db.messages.insert(message.message);
        } catch (err) {
            console.error('could not insert message ' + JSON.stringify(message));
            throw err;
        }
    }

    async addUser(user: User): Promise<any> {
        await this.dbPromise;
        try {
            this.db.users.insert(user);
        } catch (err) {
            console.error('could not insert user ' + JSON.stringify(user));
            throw err;
        }
    }

    async hasData(): Promise<boolean> {
        await this.dbPromise;
        const result = this.db.users.findOne().exec();
        return !!result;
    }
}

export function matchIfUsersAreBothInMessage(userPair: UserPair): MangoQuerySelector<RxMessageDocumentType> {
    return {
        $or: [
            {
                sender: {
                    $eq: userPair.user1.id
                },
                reciever: {
                    $eq: userPair.user2.id
                }
            },
            {
                sender: {
                    $eq: userPair.user2.id
                },
                reciever: {
                    $eq: userPair.user1.id
                }
            }
        ]
    };
}
