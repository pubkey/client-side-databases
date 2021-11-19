import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  Message,
  MessageWithDirection,
  UserWithLastMessage,
  User,
  AddMessage
} from '../../../shared/types';

import {
  MessageInputComponent
} from '../message-input/message-input.component';
import {
  UserListComponent
} from '../user-list/user-list.component';
import { unixInSeconds } from 'src/shared/util-server';
import { now } from 'src/shared/util-browser';

@Component({
  selector: 'app-chat-layout',
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatLayoutComponent {
  public userName: string;

  private messagesInternal: Message[];
  @Input() get messages(): Message[] {
    return this.messagesInternal;
  }
  set messages(val: Message[]) {
    if (!val) { val = []; }
    this.messagesInternal = val;
    this.messagesWithDirection = val.map(m => {
      const ret: MessageWithDirection = {
        ...m,
        send: m.reciever === this.ownUser.id
      };
      return ret;
    });
  }

  public messagesWithDirection: MessageWithDirection[];

  @Input() usersWithLastMessage: UserWithLastMessage[];

  @Input() ownUser: User;
  @Input() otherUser: User;

  @Input() searchResults: UserWithLastMessage[];

  // emits user-name when it is entered into the intro-input
  @Output() userNameSubmit: EventEmitter<string> = new EventEmitter();

  // emits the user when it's clicked on the left side
  @Output() userListClicked: EventEmitter<User> = new EventEmitter();

  // emits the search-term when the search-input is used
  @Output() searchChange: EventEmitter<string> = new EventEmitter();

  // emits the message when a new message was submited
  @Output() messageSubmit: EventEmitter<AddMessage> = new EventEmitter();


  @ViewChild('messageInputElement') messageInputElement: MessageInputComponent;
  @ViewChild('userListElement') userListElement: UserListComponent;

  private temporaryMessageMap: Map<string, string> = new Map();

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  public onUserNameSubmit(event: any) {
    const newName = event.name;
    if (newName === this.userName) {
      return;
    }
    this.userName = event.name;
    this.userNameSubmit.emit(event.name);
  }

  /**
   * runs when the chat-partner is changed
   */
  public async onUserListClicked(user: User) {
    if (this.otherUser && (this.otherUser.id === user.id)) {
      return;
    }
    const previousUser = this.otherUser;

    if (this.messageInputElement) {
      const inputValue = this.messageInputElement.getValue();
      this.temporaryMessageMap.set(previousUser.id, inputValue);
      this.messageInputElement.resetValue();
    }

    this.otherUser = user;
    if (this.temporaryMessageMap.has(this.otherUser.id)) {
      this.messageInputElement.setValue(
        this.temporaryMessageMap.get(this.otherUser.id) as any
      );
    }

    await this.cdr.detectChanges();
    if (this.messageInputElement) {
      this.messageInputElement.focus();
    }

    this.userListClicked.emit(user);
  }

  public onSearchChange(searchTerm: string) {
    if (typeof searchTerm !== 'string') {
      return;
    }
    // console.log('ChatLayoutComponent.onSearchChange(' + searchTerm + ')');
    this.searchChange.emit(searchTerm);
  }

  public onMessageSubmit(messageText: string) {
    // console.log('ChatLayoutComponent.onMessageSubmit()');

    // scroll left side to top
    this.userListElement.scrollTop();
    const message: AddMessage = {
      reciever: this.otherUser.id,
      sender: this.ownUser.id,
      message: {
        // use time in ms so fast-sending messages does not result in duplicate ids
        id: now() + '',
        read: true,
        reciever: this.otherUser.id,
        sender: this.ownUser.id,
        text: messageText,
        createdAt: now()
      }
    };

    this.messageSubmit.emit(message);
  }

  public onSearchResultClick(user: User) {
    // console.log('ChatLayoutComponent.onSearchResultClick()');
    this.onUserListClicked(user);
  }
}
