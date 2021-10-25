import {
    Observable,
    BehaviorSubject,
    combineLatest
} from 'rxjs';
import {
    map,
    mergeMap
} from 'rxjs/operators';
import {
    LogicInterface
} from './logic-interface.interface';
import {
    Message,
    UserWithLastMessage,
    User,
    AddMessage,
    UserPair,
    Search
} from '../shared/types';
import {
    sortByNewestFirst,
    mapUserMessages,
    getMessagesOfUserPair
} from 'src/shared/util-server';

export function sleep(): Promise<void> {
    return new Promise(res => setTimeout(res, 0));
}

const simulateAsync = mergeMap(async (input) => {
    await sleep();
    return input as any;
});

export class Logic implements LogicInterface {
    private users$: BehaviorSubject<User[]>;
    private messages$: BehaviorSubject<Message[]>;

    constructor() {
        this.users$ = new BehaviorSubject([] as any);
        this.messages$ = new BehaviorSubject([] as any);
    }

    getUserByName(userName$: Observable<string>): Observable<User> {
        return combineLatest([
            userName$,
            this.users$
        ]).pipe(
            simulateAsync,
            map(([userName, users]) => users.find((user: User) => user.id === userName))
        );
    }

    getSearchResults(search$: Observable<Search>): Observable<UserWithLastMessage[]> {
        return combineLatest([
            search$,
            this.messages$,
            this.users$
        ]).pipe(
            simulateAsync,
            map(([search, messages, users]) => {
                const results: UserWithLastMessage[] = (messages as Message[])
                    .filter(message => message.text.toLowerCase().includes(search.searchTerm))
                    .map(message => {
                        let otherUser = message.sender;
                        if (otherUser === search.ownUser.id) {
                            otherUser = message.reciever;
                        }
                        const user = users.find((u: User) => u.id === otherUser);
                        const ret: UserWithLastMessage = {
                            user,
                            message
                        };
                        return ret;
                    });
                return results;
            })
        );
    }

    getUsersWithLastMessages(ownUser$: Observable<User>): Observable<UserWithLastMessage[]> {
        return combineLatest([
            ownUser$,
            this.messages$,
            this.users$
        ]).pipe(
            simulateAsync,
            map(([ownUser, messages, users]) => {
                const usersWithLastMessage = mapUserMessages(
                    ownUser,
                    users,
                    messages
                ).filter(m => m.user.id !== ownUser.id);
                return usersWithLastMessage;
            }),
            map(usersWithLastMessage => sortByNewestFirst(usersWithLastMessage))
        );
    }

    getMessagesForUserPair(userPair$: Observable<UserPair>): Observable<Message[]> {
        return combineLatest([
            userPair$,
            this.messages$
        ]).pipe(
            simulateAsync,
            map(([userPair, messages]) => getMessagesOfUserPair(
                userPair.user1.id,
                userPair.user2.id,
                messages
            ))
        );
    }

    async addMessage(message: AddMessage): Promise<any> {
        const newMessages = this.messages$.getValue().slice();
        newMessages.push(message.message);
        this.messages$.next(newMessages);
    }

    async addUser(user: User): Promise<any> {
        const newUsers = this.users$.getValue().slice();
        newUsers.push(user);
        this.users$.next(newUsers);
    }

    async hasData(): Promise<boolean> {
        const users = this.users$.getValue();
        return users.length > 0;
    }
}
