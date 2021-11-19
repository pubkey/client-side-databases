import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  MessageWithDirection,
  User
} from '../../../shared/types';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageListComponent implements OnChanges {
  @Input() messages: MessageWithDirection[];

  constructor(
    private elRef: ElementRef
  ) { }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.messages) {
      // scroll to button when new messages come
      await new Promise(res => setTimeout(res, 0));
      const hostDiv = this.elRef.nativeElement;
      hostDiv.scrollTop = hostDiv.scrollHeight;
    }
  }
}
