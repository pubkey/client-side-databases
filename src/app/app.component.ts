import {
  ChangeDetectionStrategy,
  Component,
  OnInit
} from '@angular/core';

import {
  LogicInterface
} from './logic-interface.interface';

import {
  Logic
} from './app.logic';

export function simulateAsync(): Promise<void> {
  return new Promise(res => setTimeout(res, 0));
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'blueprint';

  public logic: LogicInterface = new Logic();

  constructor() {
  }

  ngOnInit() { }
}
