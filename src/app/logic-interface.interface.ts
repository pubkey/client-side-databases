import {
    Observable
} from 'rxjs';
import {
    Message,
    UserWithLastMessage,
    User,
    AddMessage,
    UserPair,
    Search
} from '../shared/types';

export interface LogicInterface {
    getUserByName(
        userName$: Observable<string>
    ): Observable<User>;
    getSearchResults(
        search$: Observable<Search>
    ): Observable<UserWithLastMessage[]>;
    getUsersWithLastMessages(
        ownUser$: Observable<User>
    ): Observable<UserWithLastMessage[]>;
    getMessagesForUserPair(
        userPair$: Observable<UserPair>
    ): Observable<Message[]>;
    // add a message to the database
    addMessage(
        message: AddMessage
    ): Promise<any>;
    // Add a user to the database
    addUser(user: User): Promise<any>;

    /**
     * Returns true if there are already and
     * users or messages in the database.
     * Used to determine if example data must be imported
     */
    hasData(): Promise<boolean>;
}
