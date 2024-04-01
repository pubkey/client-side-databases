import { Injectable } from '@angular/core';
import { LIB_VERSION } from 'electric-sql/version';
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';

import { uniqueTabId } from 'electric-sql/util';
import { Electric, schema } from '../generated/client';

@Injectable({
  providedIn: 'root',
})
export class ElectricService {
  private electric: Electric;

  async initElectricDB() {
    const { tabId } = uniqueTabId();
    const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`;
    const conn = await ElectricDatabase.init(scopedDbName, '/assets/');
    this.electric = await electrify(conn, schema);
  }

  getDb() {
    return this.electric;
  }
}
