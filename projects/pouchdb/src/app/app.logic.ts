import {
    Observable,
    combineLatest
} from 'rxjs';
import {
    switchMap,
    map,
    filter,
    shareReplay,
    startWith,
    mergeMap
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
    pouchDocToNormal,
    normalToPouchDoc
} from './shared';
import {
    doesMessageMapUserPair,
    sortByNewestFirst
} from 'src/shared/util-server';
import {
    logTime
} from 'src/shared/util-browser';

export class Logic implements LogicInterface {
    private dbPromise: Promise<any> = createDatabase();
    private db: DatabaseType;

    constructor() {
        this.dbPromise.then(db => this.db = db);
    }

    getUserByName(userName$: Observable<string>): Observable<User> {
        return userName$.pipe(
            // this is the first usage of this.db, so we have to await the creation
            mergeMap((userName) => this.dbPromise.then(() => userName)),
            switchMap(userName => {
                return this.db.users$.pipe(
                    filter(change => change.id === userName),
                    map(() => userName),
                    startWith(userName)
                );
            }),
            switchMap(async (userName) => {
                const docs = await this.db.users.find({
                    selector: {
                        _id: userName
                    },
                    limit: 1
                });
                const first: User = docs.docs[0] as any;
                if (!first) {
                    console.log('# user document not found ' + userName);
                    return null;
                }
                return first;
            }),
            filter(doc => !!doc),
            map(doc => pouchDocToNormal(doc))
        );
    }

    getSearchResults(search$: Observable<Search>): Observable<UserWithLastMessage[]> {
        return search$.pipe(
            switchMap(search => {
                return this.db.messages$.pipe(
                    filter(change => {
                        /*
                         * to optimise performance we only re-run the query
                         * when the change matters for the message
                         */
                        const changeDoc: Message = pouchDocToNormal(change.doc);
                        const regex = new RegExp(search.searchTerm, 'i');
                        return regex.test(changeDoc.text);
                    }),
                    map(() => search),
                    startWith(search)
                );
            }),
            switchMap(async (search) => {
                const docs = await this.db.messages.find({
                    selector: {
                        $and: [
                            {
                                text: {
                                    $regex: new RegExp(search.searchTerm, 'i')
                                }
                            },
                            matchIfUserInMessage(search.ownUser)
                        ]
                    }
                });
                const messages: Message[] = docs.docs.map((doc: any) => pouchDocToNormal(doc));
                return {
                    search,
                    messages
                };
            }),
            switchMap((searchWithMessages) => {
                const search = searchWithMessages.search;
                const messages: Message[] = searchWithMessages.messages;
                return Promise.all(
                    messages.map(async (message) => {
                        let otherUser = message.sender;
                        if (otherUser === search.ownUser.id) {
                            otherUser = message.reciever;
                        }
                        const userDoc = await this.db.users.find({
                            selector: {
                                _id: otherUser
                            },
                            limit: 1
                        });
                        const user: User = userDoc.docs[0] as any;
                        return {
                            user,
                            message
                        };
                    })
                );
            })
        );
    }

    getUsersWithLastMessages(ownUser$: Observable<User>): Observable<UserWithLastMessage[]> {
        const usersNotOwn$ = ownUser$.pipe(
            switchMap(ownUser => {
                return this.db.users$.pipe(
                    startWith(1),
                    map(() => ownUser)
                );
            }),
            switchMap(ownUser => this.db.users
                .find({
                    selector: {
                        _id: {
                            $ne: ownUser.id
                        }
                    }
                })
            ),
            map((docs: any) => docs.docs),
            map(docs => docs.map((doc: any) => pouchDocToNormal(doc))),
            shareReplay(1)
        );

        const usersWithLastMessage$: Observable<UserWithLastMessage[]> = combineLatest([
            ownUser$,
            usersNotOwn$
        ]).pipe(
            map(([ownUser, usersNotOwn]) => {
                return usersNotOwn
                    .map((user: any) => {
                        return this.getLastMessageOfUserPair({
                            user1: ownUser,
                            user2: user
                        }).pipe(
                            map(message => ({
                                user,
                                message
                            })),
                            shareReplay(1)
                        );
                    });
            }),
            switchMap(usersWithLastMessage => combineLatest(usersWithLastMessage)),
            map(usersWithLastMessage => sortByNewestFirst(usersWithLastMessage as any)) // TODO fix type
        );
        return usersWithLastMessage$;
    }

    private getLastMessageOfUserPair(
        userPair: UserPair
    ): Observable<Message | null> {
        return this.db.messages$.pipe(
            filter(change => {
                /*
                 * to optimise performance we only re-run the query
                 * when the change matters for that userPair
                 */
                const changeDoc: Message = pouchDocToNormal(change.doc);
                return doesMessageMapUserPair(
                    userPair.user1.id,
                    userPair.user2.id,
                    changeDoc
                );
            }),
            startWith(1),
            switchMap(async () => {
                const docs = await this.db.messages.find({
                    selector: matchIfUsersAreBothInMessage(userPair),
                    sort: [{ createdAt: 'desc' }],
                    limit: 1
                });
                return docs.docs[0];
            }),
            map(doc => pouchDocToNormal(doc)),
            shareReplay(1)
        );
    }

    public getMessagesForUserPair(
        userPair$: Observable<UserPair>
    ): Observable<Message[]> {
        return userPair$.pipe(
            switchMap(userPair => {
                return this.db.messages$.pipe(
                    startWith(1),
                    map(() => userPair)
                );
            }),
            switchMap(async (userPair) => {
                const docs = await this.db.messages.find({
                    selector: matchIfUsersAreBothInMessage(userPair),
                    sort: [{ createdAt: 'asc' }]
                });
                return docs.docs;
            }),
            map(docs => docs.map(doc => pouchDocToNormal(doc)))
        );
    }

    async addMessage(message: AddMessage): Promise<any> {
        await this.dbPromise;
        const doc = normalToPouchDoc(message.message);
        await this.db.messages.put(doc);
    }

    async addUser(user: User): Promise<any> {
        await this.dbPromise;
        const doc = normalToPouchDoc(user);
        await this.db.users.put(doc);
    }

    async hasData(): Promise<boolean> {
        await this.dbPromise;
        const queryResult = await this.db.users.find({
            selector: {},
            limit: 1
        });
        return queryResult.docs.length > 0;
    }
}

export function matchIfUserInMessage(user: User): any {
    return {
        $or: [
            {
                sender: { $eq: user.id }
            },
            {
                reciever: { $eq: user.id }
            }
        ]
    };
}

export function matchIfUsersAreBothInMessage(userPair: UserPair): any {
    return {
        $and: [
            /* because pouchdb has a bug with sorting by a non-selector used index
             * we have to add something to the query which is always true
             * @link https://github.com/pouchdb/pouchdb/issues/6399
             */
            {
                createdAt: {
                    $gt: true
                }
            },
            {
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
            }
        ]
    };
}
