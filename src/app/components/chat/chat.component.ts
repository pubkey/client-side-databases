import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  Observable,
  Subject,
  combineLatest
} from 'rxjs';
import {
  map,
  shareReplay,
  first,
  tap
} from 'rxjs/operators';

import {
  Message,
  UserWithLastMessage,
  User,
  AddMessage,
  UserPair
} from '../../../shared/types';

import {
  LogicInterface
} from '../../logic-interface.interface';
import { addExampleData, logMetricMeasurement, now } from 'src/shared/util-browser';
import { getExampleDataset } from 'src/shared/data-generator';
import { wait } from 'async-test-util';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit {

  @Input() logic: LogicInterface;

  /**
   * a unique value
   * to identify this open browser tab
   * for ping-pongs etc
   */
  private instanceId: string = Math.floor(Math.random() * 100000000) + '';

  // into interface
  public userName$: Subject<string> = new Subject();
  public searchTerm$: Subject<string> = new Subject();
  public ownUser$: Observable<User>;
  public otherUser$: Subject<User> = new Subject();
  public addMessage$: Subject<AddMessage>;

  // from interface
  public showSearchResults$: Observable<UserWithLastMessage[] | null>;
  public showLeftBar$: Observable<UserWithLastMessage[] | null>;
  public showMessages$: Observable<Message[] | null>;

  // performance measurement flags
  private pingTime = 0;
  private searchTime = 0;
  private lastMessageInsertTime = 0;
  private lastUserPairChanged = 0;
  private firstLeftBarEmitDone = false;
  private lastMessageText: string;

  constructor() {
    logMetricMeasurement(
      'FIRST_ANGULAR_COMPONENT_RENDER',
      performance.now(),
      'ms'
    );

    /**
     * Add estimage storage size to the window object
     * so it can be triggered by testcafe
     */
    (window as any).storageSizeMetric = async () => {
      /**
       * Can happen in testcafe tests when origin not secure
       *
       * @link https://stackoverflow.com/a/64658460/3443137
       */
      if (!navigator.storage) {
        console.log(Object.keys(navigator));
        throw new Error('storageSizeMetric() navigator.storage not here');
      }
      const estimate = await navigator.storage.estimate();
      // looks like indexedDB: 22377552 bytes
      const idbSize: number = (estimate as any).usageDetails.indexedDB;
      const kilobytes = idbSize / 1024;
      logMetricMeasurement(
        'STORAGE_SIZE',
        kilobytes,
        'kb'
      );

    };
  }

  async ngOnInit() {
    // when own userName changes, get the user-object
    this.ownUser$ = this.logic.getUserByName(
      this.userName$
    ).pipe(
      shareReplay(1)
    );

    // when ownUser changes, get items for the left bar
    this.showLeftBar$ = this.logic.getUsersWithLastMessages(this.ownUser$).pipe(
      tap(() => {
        if (!this.firstLeftBarEmitDone) {
          this.firstLeftBarEmitDone = true;
          logMetricMeasurement(
            'FIRST_FULL_RENDER',
            performance.now(),
            'ms'
          );
        }
      })
    );

    // when one user changes, display new messages
    const userChanged$: Observable<UserPair> = combineLatest([
      this.ownUser$,
      this.otherUser$
    ]).pipe(
      tap(() => this.lastUserPairChanged = performance.now()),
      map(([user1, user2]) => ({
        user1,
        user2
      })),
      shareReplay(1)
    );
    this.showMessages$ = this.logic.getMessagesForUserPair(userChanged$).pipe(
      tap((messages) => {
        if (this.lastUserPairChanged !== 0) {
          const dif = performance.now() - this.lastUserPairChanged;
          this.lastUserPairChanged = 0;

          if (messages[0] && messages[0].sender === 'millie') {
            logMetricMeasurement(
              'USER_PAIR_CHANGED_TO_MESSAGE_LIST',
              dif,
              'ms'
            );
          }
        }
        if (this.lastMessageInsertTime !== 0) {
          const dif = performance.now() - this.lastMessageInsertTime;
          this.lastMessageInsertTime = 0;

          if (this.lastMessageText === 'MESSAGE_INSERT_TO_MESSAGE_LIST_CHANGE') {
            logMetricMeasurement(
              'MESSAGE_INSERT_TO_MESSAGE_LIST_CHANGE',
              dif,
              'ms'
            );
          }
        }
      }),
      tap(messages => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.text.startsWith('ping:')) {
          const instanceId = lastMessage.text.split(':')[1];

          if (instanceId === this.instanceId) {
            return;
          }
          console.log('ping message was created, sending pong');
          const messageId = now();
          const add = {
            reciever: lastMessage.sender,
            sender: lastMessage.reciever,
            message: {
              id: messageId + '',
              read: false,
              reciever: lastMessage.sender,
              sender: lastMessage.reciever,
              createdAt: messageId,
              text: 'pong:' + this.instanceId
            }
          };
          console.log('add');
          console.dir(add);
          this.logic.addMessage(add);
        }
        if (this.pingTime !== 0 && lastMessage && lastMessage.text.startsWith('pong:')) {
          const instanceId = lastMessage.text.split(':')[1];
          if (instanceId === this.instanceId) {
            return;
          }
          console.log('pong was recieved');
          const time = performance.now() - this.pingTime;
          this.pingTime = 0;
          console.log('pong time: ' + time + 'ms');
        }
      })
    );

    // when searchTerm changes, show new results
    const searchChanged$ = combineLatest([
      this.ownUser$,
      this.searchTerm$
    ]).pipe(
      map(([ownUser, searchTerm]) => ({ ownUser, searchTerm }))
    );
    this.showSearchResults$ = this.logic.getSearchResults(searchChanged$).pipe(
      tap(() => {
        const searchResultTime = performance.now() - this.searchTime;
        logMetricMeasurement(
          'SEARCH_RESULT_TIME',
          searchResultTime,
          'ms'
        );
      })
    );


    if (addExampleData()) {
      console.log('addExampleData() true');
      const hasData = await this.logic.hasData();
      console.log('hasData(): ' + hasData);
      if (hasData) {
        return;
      }
      const data = getExampleDataset();
      await Promise.all(
        data.messages.map(message => this.logic.addMessage({
          message: {
            id: now() + '',
            createdAt: now(),
            read: false,
            reciever: message.reciever,
            sender: message.sender,
            text: message.text
          },
          reciever: message.reciever,
          sender: message.sender
        }))
      );
      await Promise.all(
        data.users.map(async (user) => {
          try {
            await this.logic.addUser(user);
          } catch (err) {
            console.error('addExampleData() could not add user ' + user.id);
            console.dir(user);
            throw err;
          }
        })
      );
      console.log('addExampleData() DONE');
    }
  }

  onUserNameSubmit(userName: string) {
    this.userName$.next(userName);
  }

  async onUserListClicked(user: User) {
    const own = await this.ownUser$.pipe(first()).toPromise();
    if (!own) {
      throw new Error('own user not given');
    }
    if (own.id === user.id) {
      throw new Error(
        'other user is equal to own user: #' + user.id
      );
    }
    this.otherUser$.next(user);
  }

  onSearchChange(searchTerm: string) {
    this.searchTime = performance.now();
    this.searchTerm$.next(searchTerm);
  }

  async onMessageSubmit(message: AddMessage) {
    const startTime = performance.now();

    /**
     * Insert 20 messages with non-bulk request,
     * in serial.
     * and measure the time.
     */
    if (message.message.text === 'INSERT_20_MESSAGES_SERIAL') {
      for (let count = 0; count < 20; count++) {
        const messageNr = count + 1;
        await this.logic.addMessage({
          message: {
            id: 'insert:20-serial-' + messageNr + '-' + startTime,
            read: false,
            reciever: message.reciever,
            sender: message.sender,
            text: 'message (serial) ' + messageNr + ' of 20',
            createdAt: now()
          },
          reciever: message.reciever,
          sender: message.sender
        });

        /**
         * Wait at least one tick to simulate
         * real world behavior.
         */
        await wait(0);
      }
      const endTime = performance.now() - startTime;
      logMetricMeasurement(
        message.message.text,
        endTime,
        'ms'
      );
      return;
    } else if (message.message.text === 'INSERT_20_MESSAGES_PARALLEL') {
      await Promise.all(
        new Array(20)
          .fill(0)
          .map(async (_i, idx) => {
            const messageNr = idx + 1;
            await this.logic.addMessage({
              message: {
                id: 'insert:20-parallel-' + messageNr + '-' + startTime,
                read: false,
                reciever: message.reciever,
                sender: message.sender,
                text: 'message (parallel) ' + messageNr + ' of 20',
                createdAt: now()
              },
              reciever: message.reciever,
              sender: message.sender
            });
          })
      );
      const endTime = performance.now() - startTime;
      logMetricMeasurement(
        message.message.text,
        endTime,
        'ms'
      );

      return;
    } else if (message.message.text === 'INSERT_MANY_MESSAGES') {
      const howMuchIsMany = 150;
      await Promise.all(
        new Array(howMuchIsMany)
          .fill(0)
          .map(async (_i, idx) => {
            const messageNr = idx + 1;
            await this.logic.addMessage({
              message: {
                id: 'insert:20-many-' + messageNr + '-' + startTime,
                read: false,
                reciever: message.reciever,
                sender: message.sender,
                text: 'message (many) ' + messageNr + ' of ' + howMuchIsMany,
                createdAt: now()
              },
              reciever: message.reciever,
              sender: message.sender
            });
          })
      );
      const endTime = performance.now() - startTime;
      logMetricMeasurement(
        message.message.text,
        endTime,
        'ms'
      );
      return;
    } else if (message.message.text === 'INSERT_1_MESSAGE') {
      await this.logic.addMessage({
        message: {
          id: 'insert:1-' + startTime,
          read: false,
          reciever: message.reciever,
          sender: message.sender,
          text: 'insert one message',
          createdAt: now()
        },
        reciever: message.reciever,
        sender: message.sender
      });
      const endTime = performance.now() - startTime;
      logMetricMeasurement(
        message.message.text,
        endTime,
        'ms'
      );
      return;
    } else if (message.message.text === 'ping') {
      message.message.text = 'ping:' + this.instanceId;
      console.log('ping message created, waiting for pong');
      this.pingTime = startTime;
    }

    this.lastMessageInsertTime = startTime;
    this.lastMessageText = message.message.text;
    return this.logic.addMessage(message);
  }
}
