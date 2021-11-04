import { Component } from '@angular/core';
import {
  LogicInterface
} from '../../../../src/app/logic-interface.interface';

import {
  Logic
} from '../../../rxdb/src/app/app.logic';

import {
  createDatabase
} from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'rxdb-lokijs';

  public logic: LogicInterface = new Logic(createDatabase);
}
