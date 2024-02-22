import { collectionData } from 'rxfire/firestore';
import { Observable, combineLatest, forkJoin, from } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { LogicInterface } from '../../../../src/app/logic-interface.interface';
import {
  AddMessage,
  Message,
  Search,
  User,
  UserPair,
  UserWithLastMessage,
} from '../../../../src/shared/types';

import {
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import { RXJS_SHARE_REPLAY_DEFAULTS } from 'rxdb';
import { sortByNewestFirst } from 'src/shared/util-server';
import { Electric } from './generated/client';
import { ElectricService } from './services/electric.service';
import {
  convertMessageNosqlToSql,
  convertMessageSqlToNosql,
} from './util/convertMessageType';

export class Logic implements LogicInterface {
  private electric: Electric;
  constructor(private electricService: ElectricService) {
    this.init();
  }

  async init() {
    this.electric = this.electricService.getDb();
  }

  getUserByName(userName$: Observable<string>): Observable<User> {
    return userName$.pipe(
      mergeMap((userName) =>
        from(
          this.electric.db.users.findUnique({
            where: {
              id: userName,
            },
          })
        ).pipe(
          map((user) =>
            user
              ? {
                  id: user.id,
                  createdAt: Number(user.created_at), // Convert BigInt to number
                }
              : null
          ),
          filter((user): user is User => user !== null)
        )
      )
    );
  }

  /**
   *
   * @param search$
   * @returns
   */
  getSearchResults(
    search$: Observable<Search>
  ): Observable<UserWithLastMessage[]> {
    return search$.pipe(
      mergeMap((search) => {
        const regex = new RegExp(search.searchTerm, 'i');
        return combineLatest([
          collectionData(
            query(
              this.messages,
              where('sender', '==', search.ownUser.id),
              orderBy('createdAt', 'desc')
            )
          ),
          collectionData(
            query(
              this.messages,
              where('reciever', '==', search.ownUser.id),
              orderBy('createdAt', 'desc')
            )
          ),
        ]).pipe(
          map(([ar1, ar2]: any) => {
            const ret: Message[] = ar1.concat(ar2);
            return ret;
          }),
          /**
           * Firebase emits the result of the above collectionData() multiple times,
           * even if nothing has changed. So we have to filter out
           * the non-first emits to not trigger the search multiple times.
           */
          distinctUntilChanged((prev: any[], curr: any[]) => {
            return prev.length === curr.length;
          }),
          map((messages) =>
            messages.filter((message) => regex.test(message.text))
          ),
          switchMap((messages) => {
            return Promise.all(
              messages.map(async (messageDoc) => {
                let otherUser = messageDoc.sender;
                if (otherUser === search.ownUser.id) {
                  otherUser = messageDoc.reciever;
                }
                const docRef = doc(this.users, otherUser);
                const userDoc = await getDoc(docRef);
                const user: User = userDoc.data() as any;
                const ret: UserWithLastMessage = {
                  user,
                  message: messageDoc,
                };
                return ret;
              })
            );
          })
        );
      })
    );
  }

  /**
   *
   * @param ownUser$
   * @returns
   */
  getUsersWithLastMessages(
    ownUser$: Observable<User>
  ): Observable<UserWithLastMessage[]> {
    const usersNotOwn$ = ownUser$.pipe(
      switchMap((ownUser) =>
        from(
          this.electric.db.users.findMany({
            where: {
              id: { not: ownUser.id },
            },
          })
        ).pipe(
          map(
            (users) =>
              users.map((user) => ({
                id: user.id,
                createdAt: Number(user.created_at),
              })) as User[]
          )
        )
      ),
      shareReplay(RXJS_SHARE_REPLAY_DEFAULTS)
    );

    const usersWithLastMessage$: Observable<Observable<UserWithLastMessage>[]> =
      combineLatest([ownUser$, usersNotOwn$]).pipe(
        map(([ownUser, usersNotOwn]) => {
          return usersNotOwn.map((user) => {
            const ret2 = this.getLastMessageOfUserPair(
              ownUser.id,
              user.id
            ).pipe(
              map((message) => ({
                user,
                message: message ? message : undefined,
              })),
              shareReplay(RXJS_SHARE_REPLAY_DEFAULTS)
            );
            return ret2;
          });
        })
      );

    const ret: Observable<UserWithLastMessage[]> = usersWithLastMessage$.pipe(
      switchMap((usersWithLastMessage) => combineLatest(usersWithLastMessage)),
      map((usersWithLastMessage) => sortByNewestFirst(usersWithLastMessage))
    );

    return ret;
  }

  private getLastMessageOfUserPair(
    userId1: string,
    userId2: string
  ): Observable<Message | undefined> {
    return from(
      this.electric.db.messages.findFirst({
        where: {
          OR: [
            { sender: userId1, reciever: userId2 },
            { sender: userId2, reciever: userId1 },
          ],
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 1,
      })
    ).pipe(
      map((result) => {
        return result ? convertMessageSqlToNosql(result) : undefined;
      })
    );
  }

  /**
   *
   * @param userPair$
   * @returns
   */
  getMessagesForUserPair(
    userPair$: Observable<UserPair>
  ): Observable<Message[]> {
    return userPair$.pipe(
      switchMap((userPair) =>
        forkJoin({
          messagesFromUser1ToUser2: from(
            this.electric.db.messages.findMany({
              where: {
                AND: [
                  { sender: userPair.user1.id },
                  { reciever: userPair.user2.id },
                ],
              },
              orderBy: {
                created_at: 'desc',
              },
            })
          ),
          messagesFromUser2ToUser1: from(
            this.electric.db.messages.findMany({
              where: {
                AND: [
                  { sender: userPair.user2.id },
                  { reciever: userPair.user1.id },
                ],
              },
              orderBy: {
                created_at: 'desc',
              },
            })
          ),
        })
      ),
      map(({ messagesFromUser1ToUser2, messagesFromUser2ToUser1 }) => {
        const allMessages = [
          ...messagesFromUser1ToUser2,
          ...messagesFromUser2ToUser1,
        ];
        const convertedMessages = allMessages.map(convertMessageSqlToNosql);
        return convertedMessages.sort((a, b) => b.createdAt - a.createdAt);
      })
    );
  }

  /**
   *
   * @param message
   * @returns
   */
  async addMessage(message: AddMessage): Promise<void> {
    const convertedMessage = convertMessageNosqlToSql(message.message);
    await this.electric.db.messages.create({
      data: convertedMessage,
    });
  }

  /**
   *
   * @param user
   * @returns
   */
  async addUser(user: User): Promise<any> {
    const docRef = doc(this.users, user.id);
    const insert = await setDoc(docRef, user);
    return insert;
  }

  /**
   *
   * @returns
   */
  async hasData(): Promise<boolean> {
    const docs = await getDocs(query(this.users, limit(1)));
    return docs.size > 0;
  }
}
