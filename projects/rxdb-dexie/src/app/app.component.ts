import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import {
  LogicInterface
} from '../../../../src/app/logic-interface.interface';
import {
  createDatabase
} from '../../../rxdb-base/src/app/services/database.service';

import {
  Logic
} from '../../../rxdb-base/src/app/app.logic';

const baseStorage = getRxStorageDexie();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'rxdb-dexie';

  public logic: LogicInterface = new Logic(() => createDatabase(baseStorage));
}
