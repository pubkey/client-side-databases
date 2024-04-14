import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogicInterface } from '../../../../src/app/logic-interface.interface';

import { Logic } from './app.logic';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'electric';

  public logic: LogicInterface;

  constructor(logic: Logic) {
    this.logic = logic;
  }
}
