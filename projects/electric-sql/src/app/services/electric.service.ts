import { Injectable } from '@angular/core';
import { LIB_VERSION } from 'electric-sql/version';
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';
import { authToken } from '../auth';

import { uniqueTabId } from 'electric-sql/util';
import { environment } from '../environments/environment';
import { Electric, schema } from '../generated/client';

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

  // Provide methods to interact with the electric database
}
