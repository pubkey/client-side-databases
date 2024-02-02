import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageBoxComponent {

  constructor() { }
}
