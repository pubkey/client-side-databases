import {
    Observable,
    combineLatest
} from 'rxjs';
import {
    switchMap,
    map,
    shareReplay,
    mergeMap,
    filter,
    tap
} from 'rxjs/operators';
import {
    LogicInterface
} from '../../../../src/app/logic-interface.interface';
import {
    createDatabase
} from './services/database.service';
import { Collection, Database, Q } from '@nozbe/watermelondb';
import {
    Message,
    UserWithLastMessage,
    User,
    AddMessage,
    UserPair,
    Search
} from '../../../../src/shared/types';
import {
    lastOfArray,
    sortByNewestFirst
} from 'src/shared/util-server';
import { MessageModel, UserModel } from './models';


export class Logic implements LogicInterface {
    private dbPromise: Promise<Database> = createDatabase();
    private db: Database;

    constructor() {
        this.dbPromise.then(db => this.db = db);
    }

    private get userCollection(): Collection<UserModel> {
        return this.db.get<UserModel>('users');
    }
    private get messageCollection(): Collection<MessageModel> {
        return this.db.get<MessageModel>('messages');
    }

    getUserByName(userName$: Observable<string>): Observable<User> {
        return userName$.pipe(
            // this is the first usage of this.db, so we have to await the creation
            mergeMap((userName) => this.dbPromise.then(() => userName)),
            switchMap((userName: string) => {
                const query = this.userCollection.query(
                    Q.where('userId', Q.eq(userName))
                );
                const obs: Observable<UserModel[]> = query.observe() as any;
                return obs.pipe(
                    map(list => list[0]),
                    filter(firstDoc => {
                        if (!firstDoc) {
                            console.warn('# user document not found ' + userName);
                        } else {
                            console.log('# user document found! ' + userName);
                        }
                        return !!firstDoc;
                    })
                );
            }),
            map((doc: UserModel) => {
                const ret: User = {
                    createdAt: doc.createdAt,
                    id: doc.userId
                };
                return ret;
            }),
            filter(doc => !!doc) as any
        );
    }
    getSearchResults(search$: Observable<Search>): Observable<UserWithLastMessage[]> {
        return search$.pipe(
            switchMap(search => {
                const user = search.ownUser;
                const query = this.messageCollection.query(
                    Q.and(
                        Q.where('text', Q.like('%' + search.searchTerm + '%')),
                        Q.or(
                            Q.where('sender', Q.eq(user.id)),
                            Q.where('reciever', Q.eq(user.id))
                        )
                    )
                );
                const obs: Observable<MessageModel[]> = query.observe() as any;
                return obs.pipe(
                    map(messageModels => messageModels.map(messageModel => messageModelToMessage(messageModel))),
                    map(messages => {
                        return {
                            search,
                            messages
                        }
                    })
                );
            }),
            switchMap(async (searchWithMessages) => {
                const search = searchWithMessages.search;
                const messages: Message[] = searchWithMessages.messages;
                const withUsers = await Promise.all(
                    messages.map(async (message) => {
                        let otherUser = message.sender;
                        if (otherUser === search.ownUser.id) {
                            otherUser = message.reciever;
                        }
                        const userModel = await this.userCollection.query(
                            Q.where('userId', Q.eq(otherUser))
                        ).fetch();
                        return {
                            user: userModelToUser(userModel[0]),
                            message
                        };
                    })
                );
                return withUsers;
            })
        );
    }
    getUsersWithLastMessages(ownUser$: Observable<User>): Observable<UserWithLastMessage[]> {

        const usersNotOwn$: Observable<UserModel[]> = ownUser$.pipe(
            switchMap((ownUser: User) => {
                const query = this.userCollection.query(
                    Q.where('userId', Q.notEq(ownUser.id))
                ).observe();
                return query as any;
            }) as any,
            shareReplay(1)
        );

        const usersWithLastMessage$: Observable<UserWithLastMessage[]> = combineLatest([
            ownUser$,
            usersNotOwn$
        ]).pipe(
            map(([ownUser, usersNotOwn]) => {
                const obs = usersNotOwn.map(user => {
                    const ret = this.getLastMessageOfUserPair({
                        user1: ownUser,
                        user2: userModelToUser(user)
                    }).pipe(
                        map(message => ({
                            user: userModelToUser(user),
                            message: message ? message : undefined
                        })),
                        shareReplay(1)
                    );
                    return ret;
                });
                return obs;
            }),
            switchMap(usersWithLastMessage => combineLatest(usersWithLastMessage)),
            map(usersWithLastMessage => {
                return sortByNewestFirst(usersWithLastMessage as any);
            })
        );

        return usersWithLastMessage$;
    }

    private getLastMessageOfUserPair(
        userPair: UserPair
    ): Observable<Message | null> {
        const query = this.messageCollection.query(
            Q.or(
                Q.and(
                    Q.where('sender', Q.eq(userPair.user1.id)),
                    Q.where('reciever', Q.eq(userPair.user2.id))
                ),
                Q.and(
                    Q.where('sender', Q.eq(userPair.user2.id)),
                    Q.where('reciever', Q.eq(userPair.user1.id))
                )
            ),
            //            Q.experimentalSortBy('createdAt', Q.desc)
        );
        const obs: Observable<MessageModel[]> = query.observe() as any;
        return obs.pipe(
            map((messageModels: MessageModel[]) => messageModels.map(messageModel => messageModelToMessage(messageModel))),
            // experimentalSortBy does not work with lokijs adapter, so we sort by hand
            map(messages => sortMessagesByCreatedAt(messages)),
            map(messages => lastOfArray(messages))
        );
    }

    getMessagesForUserPair(userPair$: Observable<UserPair>): Observable<Message[]> {
        return userPair$.pipe(
            switchMap((userPair: any) => {
                const query = this.messageCollection.query(
                    Q.or(
                        Q.and(
                            Q.where('sender', Q.eq(userPair.user1.id)),
                            Q.where('reciever', Q.eq(userPair.user2.id))
                        ),
                        Q.and(
                            Q.where('sender', Q.eq(userPair.user2.id)),
                            Q.where('reciever', Q.eq(userPair.user1.id))
                        )
                    ),
                    //                  Q.experimentalSortBy('createdAt', Q.desc)
                );
                const obs: Observable<MessageModel[]> = query.observe() as any;
                return obs;
            }) as any,
            map((messageModels: MessageModel[]) => messageModels.map(messageModel => messageModelToMessage(messageModel))),
            // experimentalSortBy does not work with lokijs adapter, so we sort by hand
            map(messages => sortMessagesByCreatedAt(messages)),
            shareReplay()
        );
    }
    async addMessage(message: AddMessage): Promise<any> {
        await this.db.write(async () => {
            this.messageCollection.create(messageModel => {
                messageModel.messageId = message.message.id;
                messageModel.text = message.message.text;
                messageModel.createdAt = message.message.createdAt;
                messageModel.read = message.message.read;
                messageModel.sender = message.message.sender;
                messageModel.reciever = message.message.reciever;
            });
        });
    }

    async addUser(user: User): Promise<any> {
        await this.db.write(async () => {
            this.userCollection.create(userModel => {
                userModel.userId = user.id;
                userModel.createdAt = user.createdAt;
            });
        });
    }

    async hasData(): Promise<boolean> {
        await this.dbPromise;
        // TODO limit=1 is not supported with lokijs adapter atm in watermelondb
        const users = await this.userCollection.query(
        ).fetch();
        return users.length > 0;
    }

}


export function sortMessagesByCreatedAt(
    messages: Message[]
): Message[] {
    const ret = messages.sort(
        (a, b) => {
            const messageTimeA = a.createdAt;
            const messageTimeB = b.createdAt;

            if (messageTimeA === messageTimeB) {
                return 0;
            }

            if (messageTimeA > messageTimeB) {
                return 1;
            } else {
                return -1;
            }
        }
    );
    return ret;
}


function messageModelToMessage(messageModel: MessageModel): Message {
    return {
        id: messageModel.messageId,
        read: messageModel.read,
        reciever: messageModel.reciever,
        sender: messageModel.sender,
        text: messageModel.text,
        createdAt: messageModel.createdAt
    };
}

function userModelToUser(userModel: UserModel): User {
    return {
        id: userModel.userId,
        createdAt: userModel.createdAt
    };
}
