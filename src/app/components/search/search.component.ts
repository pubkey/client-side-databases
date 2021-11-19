import {
  Component,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  UserWithLastMessage,
  User
} from '../../../shared/types';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {

  @Input() results: UserWithLastMessage[] | null;

  @Output() change: EventEmitter<string> = new EventEmitter();
  @Output() resultClick: EventEmitter<User> = new EventEmitter();

  @ViewChild('inputElementRef', { static: true }) inputElementRef: ElementRef;

  public focused = false;
  public lastValue = '';

  constructor() { }

  getValue(): string {
    return this.inputElementRef.nativeElement.value.toLowerCase().trim();
  }

  async resetValue() {
    await new Promise(res => setTimeout(res, 100));
    this.inputElementRef.nativeElement.value = '';
    this.results = null;
    this.focused = false;
    this.lastValue = '';
  }

  onKeyUp() {
    const value = this.getValue();
    if (
      value === this.lastValue
    ) {
      return;
    }
    this.lastValue = value;
    // this.results = [];
    if (value !== '') {
      this.change.emit(value);
    }
  }

  onUserListClicked(user: User) {
    this.resultClick.emit(user);
  }


}
