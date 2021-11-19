import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  UserWithLastMessage,
  User
} from '../../../shared/types';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  @Input() usersWithLastMessage: UserWithLastMessage[];
  @Input() ownUser: User;
  @Input() otherUser: User;

  // emits the user-id when it's clicked on the left side
  @Output() userListClicked: EventEmitter<User> = new EventEmitter();

  constructor(
    private elRef: ElementRef
  ) {

  }

  onRowClick(user: User) {
    this.userListClicked.emit(user);
  }

  public scrollTop() {
    this.elRef.nativeElement.scrollTop = 0;
  }

  public trackByUserWithLastMessage(index: number, userWithLastMessage: UserWithLastMessage) {
    const messageIdString = userWithLastMessage.message ? userWithLastMessage.message.id : '';
    return userWithLastMessage.user.id + '|' + messageIdString;
  }
}
