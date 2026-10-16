import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import {
  LogicInterface
} from '../../../../src/app/logic-interface.interface';

import {
  Logic
} from '../../../rxdb-base/src/app/app.logic';

import {
  createDatabase
} from '../../../rxdb-base/src/app/services/database.service';

const baseStorage = getRxStorageLocalstorage();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'rxdb-localstorage';

  public logic: LogicInterface = new Logic(() => createDatabase(baseStorage));
}
