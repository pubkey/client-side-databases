import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LogicInterface
} from '../../../../src/app/logic-interface.interface';

import {
  Logic
} from './app.logic';
import {
  createDatabase
} from './services/database.service';

import {
  addPouchPlugin,
  PouchDB,
  getRxStoragePouch
} from 'rxdb/plugins/pouchdb';

/**
 * indexed-db adapter
 */
import * as PouchdbAdapterIdb from 'pouchdb-adapter-idb';
addPouchPlugin(PouchdbAdapterIdb);
const baseStorage = getRxStoragePouch('idb');


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'rxdb';

  public logic: LogicInterface = new Logic(() => createDatabase(baseStorage));
}
