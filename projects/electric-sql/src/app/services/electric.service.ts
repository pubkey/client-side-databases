import { Injectable } from '@angular/core';
import { LIB_VERSION } from 'electric-sql/version';
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';
import { authToken } from '../auth';

import { uniqueTabId } from 'electric-sql/util';
// import { environment } from '../../environments/environment';
import { Electric, schema } from '../generated/client';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ElectricService {
  private electric: Electric;

  async initElectricDB() {
    const config = {
      auth: {
        token: authToken(),
      },
      debug: environment.DEV,
      url: environment.ELECTRIC_SERVICE,
    };

    const { tabId } = uniqueTabId();
    const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`;

    const conn = await ElectricDatabase.init(scopedDbName);
    this.electric = await electrify(conn, schema, config);
  }

  getDb() {
    return this.electric;
  }

  async syncDb() {
    // Resolves when the shape subscription has been established.
    const usersShape = await this.electric.db.users.sync();
    // Resolves when the data has been synced into the local database.
    await usersShape.synced;
    const messagesShape = await this.electric.db.messages.sync();
    await messagesShape.synced;
  }
}
