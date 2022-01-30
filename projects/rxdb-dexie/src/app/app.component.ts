import { AfterViewChecked, ChangeDetectionStrategy, Component, DoCheck } from '@angular/core';
import {
  LogicInterface
} from '../../../../src/app/logic-interface.interface';

import {
  Logic
} from './app.logic';

import {
  createDatabase
} from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'rxdb-dexie';

  public logic: LogicInterface = new Logic(createDatabase);
}
