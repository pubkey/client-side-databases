import { Component } from '@angular/core';
import {
  LogicInterface
} from '../../../../src/app/logic-interface.interface';

import {
  Logic
} from './app.logic';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'firebase';

  public logic: LogicInterface = new Logic();
}
