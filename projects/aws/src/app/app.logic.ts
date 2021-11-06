import {
    Observable,
    combineLatest,
    Subject
} from 'rxjs';
import {
    switchMap,
    map,
    filter,
    shareReplay,
    startWith
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

import { DataStore } from '@aws-amplify/datastore';

import {
    User as AWSUser,
    Message as AWSMessage
} from '../models';
import {
    unixTimestampToGraphql,
    graphQLTimestampToUnix
} from 'projects/rxdb-pouchdb/src/app/shared';
import {
    sortByNewestFirst,
    sortMessagesByDateNewestFirst,
    doesMessageMapUserPair
} from 'src/shared/util-server';

export class Logic implements LogicInterface {
    public userChanged$: Observable<any>;
    public messageChanged$: Observable<any>;

    constructor() {
        const userChangedSubject$ = new Subject();
        DataStore.observe(AWSUser as any).subscribe(user => {
            userChangedSubject$.next(user);
        });
        this.userChanged$ = userChangedSubject$.asObservable().pipe(
            startWith(1),
            shareReplay()
        );

        const messageChangedSubject$ = new Subject();
        DataStore.observe(AWSMessage as any).subscribe(user => {
            messageChangedSubject$.next(user);
        });
        this.messageChanged$ = messageChangedSubject$.asObservable().pipe(
            startWith(1),
            shareReplay()
        );
    }

    getUserByName(userName$: Observable<string>): Observable<User> {
        return userName$.pipe(
            switchMap(userName => {
                return this.userChanged$.pipe(
                    map(() => userName)
                );
            }),
            switchMap(async (userName) => {
                const docs: AWSUser[] = await DataStore.query(
                    AWSUser as any,
                    u => (u.userName as any)('eq', userName),
                    {
                        limit: 1
                    }
                );
                const firstDoc = docs[0];
                if (!firstDoc) {
                    return null as any;
                }
                return awsUserToNormal(firstDoc);
            }),
            filter(doc => !!doc)
        );
    }

    getSearchResults(search$: Observable<Search>): Observable<UserWithLastMessage[]> {
        return search$.pipe(
            switchMap(search => {
                return this.messageChanged$.pipe(
                    map(() => search)
                );
            }),
            switchMap(async (search) => {
                const docs: AWSMessage[] = await DataStore.query(
                    AWSMessage as any,
                    m => m.text('contains', search.searchTerm)
                );
                const messages = docs.map(m => awsMessageToNormal(m));
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
                        const userDocs: AWSUser[] = await DataStore.query(
                            AWSUser as any,
                            u => u.userName('eq', otherUser),
                            {
                                limit: 1
                            }
                        );
                        const user = awsUserToNormal(userDocs[0]);
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
        const usersNotOwn$: Observable<User[]> = ownUser$.pipe(
            switchMap(
                ownUser => this.userChanged$.pipe(
                    map(() => ownUser)
                )
            ),
            switchMap(async (ownUser) => {
                const docs: AWSUser[] = await DataStore.query(
                    AWSUser as any,
                    u => u.userName('ne', ownUser.id)
                );
                return docs;
            }),
            map(docs => docs.map(doc => awsUserToNormal(doc))),
            shareReplay(1)
        );

        const usersWithLastMessage$: Observable<
            Observable<UserWithLastMessage>[]
        > = combineLatest([
            ownUser$,
            usersNotOwn$
        ]).pipe(
            map(([ownUser, usersNotOwn]) => {
                return usersNotOwn.map(user => {
                    const pair: UserPair = {
                        user1: ownUser,
                        user2: user
                    };
                    const ret2 = this.getLastMessageOfUserPair(pair).pipe(
                        map(message => {
                            return {
                                user,
                                message: message ? message : undefined
                            };
                        }),
                        shareReplay(1)
                    );
                    return ret2;
                });
            })
        );
        const ret: Observable<UserWithLastMessage[]> = usersWithLastMessage$.pipe(
            switchMap(usersWithLastMessage => combineLatest(usersWithLastMessage)),
            map(usersWithLastMessage => sortByNewestFirst(usersWithLastMessage))
        );
        return ret;
    }

    private getLastMessageOfUserPair(
        userPair: UserPair
    ): Observable<Message | null> {
        return this.messageChanged$.pipe(
            filter(messageEvent => {
                if (!messageEvent.element) {
                    return true;
                }
                const message: Message = messageEvent.element;
                return doesMessageMapUserPair(
                    userPair.user1.id,
                    userPair.user2.id,
                    message
                );
            }),
            switchMap(async () => {
                /**
                 * TODO fix sorting
                 * @link https://github.com/aws-amplify/amplify-js/issues/4652
                 */
                const docs1: AWSMessage[] = await DataStore.query(
                    AWSMessage as any,
                    m => m
                        .sender('eq', userPair.user1.id)
                        .reciever('eq', userPair.user2.id)
                );
                const docs2: AWSMessage[] = await DataStore.query(
                    AWSMessage as any,
                    m => m
                        .reciever('eq', userPair.user1.id)
                        .sender('eq', userPair.user2.id)
                );
                const messages = docs1
                    .concat(docs2)
                    .map(m => awsMessageToNormal(m));
                const newest = sortMessagesByDateNewestFirst(messages);
                return newest[0];
            })
        );
    }

    public getMessagesForUserPair(
        userPair$: Observable<UserPair>
    ): Observable<Message[]> {
        return userPair$.pipe(
            switchMap(userPair => {
                return this.messageChanged$.pipe(
                    filter(messageEvent => {
                        if (!messageEvent.element) {
                            return true;
                        }
                        const message: Message = messageEvent.element;
                        return doesMessageMapUserPair(
                            userPair.user1.id,
                            userPair.user2.id,
                            message
                        );
                    }),
                    map(() => userPair)
                );
            }),
            switchMap(async (userPair) => {
                const docs1: AWSMessage[] = await DataStore.query(
                    AWSMessage as any,
                    m => m.sender('eq', userPair.user1.id).reciever('eq', userPair.user2.id)
                );
                const docs2: AWSMessage[] = await DataStore.query(
                    AWSMessage as any,
                    m => m.reciever('eq', userPair.user1.id).sender('eq', userPair.user2.id)
                );
                const all: AWSMessage[] = docs1.concat(docs2);
                const messages = all.map(m => awsMessageToNormal(m));
                const sorted = sortMessagesByDateNewestFirst(messages).reverse();
                return sorted;
            })
        );
    }

    async addMessage(message: AddMessage): Promise<any> {
        await DataStore.save(
            new AWSMessage({
                read: false,
                createdAt: unixTimestampToGraphql(new Date().getTime()),
                reciever: message.reciever,
                sender: message.sender,
                text: message.message.text
            })
        );
    }

    async addUser(user: User): Promise<any> {
        await DataStore.save(
            new AWSUser({
                userName: user.id,
                createdAt: unixTimestampToGraphql(
                    user.createdAt
                )
            })
        );
    };

    async hasData(): Promise<boolean> {
        const userDocs: AWSUser[] = await DataStore.query(
            AWSUser as any,
            u => (u.createdAt as any)('gt', 0),
            {
                limit: 1
            }
        );
        return userDocs.length > 0;
    }
}

export function awsUserToNormal(u: AWSUser): User {
    if (!u) { throw new Error('user missing'); }
    return {
        id: u.userName,
        createdAt: graphQLTimestampToUnix(u.createdAt)
    };
}

export function awsMessageToNormal(m: AWSMessage): Message {
    if (!m) { throw new Error('message missing'); }
    return {
        id: m.id,
        createdAt: graphQLTimestampToUnix(m.createdAt),
        read: m.read,
        reciever: m.reciever,
        sender: m.sender,
        text: m.text
    };
}
