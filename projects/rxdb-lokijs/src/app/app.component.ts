import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
import {
  LogicInterface
} from '../../../../src/app/logic-interface.interface';

import {
  Logic
} from '../../../rxdb-base/src/app/app.logic';

import {
  createDatabase
} from '../../../rxdb-base/src/app/services/database.service';

const LokiIncrementalIndexedDBAdapter = require('rxdb/node_modules/lokijs/src/incremental-indexeddb-adapter');
// const LokiIndexedDBAdapter = require('lokijs/src/loki-indexed-adapter');
const useAdapter = new LokiIncrementalIndexedDBAdapter();
const baseStorage = getRxStorageLoki({
  adapter: useAdapter,
  autoloadCallback() {
    console.log('autoload done!');
  },
  autosaveCallback() {
    console.log('autosave done!');
  }
});

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'rxdb-lokijs';

  public logic: LogicInterface = new Logic(() => createDatabase(baseStorage));
}
