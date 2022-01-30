import * as fs from 'fs';
import * as path from 'path';

export type FeatureTableValue = boolean | string;
export type FeatureTableRow = {
    offlineFirst: FeatureTableValue;
    observableQueries: FeatureTableValue;
    realtimeReplication: FeatureTableValue;
    clientSideEncryption: FeatureTableValue;
    schema: FeatureTableValue;
    complexQueries: FeatureTableValue;
    multiTabSupport: FeatureTableValue;
    customConflictHandling: FeatureTableValue;
    customBackend: FeatureTableValue;
};

export type FeatureKey = keyof FeatureTableRow;

/**
 * Sort order is important
 */
export const FEATURE_TITLES: { [k in FeatureKey]: string } = {
    offlineFirst: 'Offline First',
    realtimeReplication: 'Realtime Replication',
    multiTabSupport: 'Multi Tab Support',
    observableQueries: 'Observable Queries',
    complexQueries: 'Complex Queries',
    clientSideEncryption: 'Client Side Encryption',
    schema: 'Schema Support',
    customBackend: 'Custom Backend',
    customConflictHandling: 'Custom Conflict Handling'
};

export const FEATURE_TABLE: { [projectKey: string]: FeatureTableRow } = {
    aws: {
        offlineFirst: 'No, login required',
        observableQueries: false,
        realtimeReplication: true,
        clientSideEncryption: false,
        schema: true,
        complexQueries: false,
        multiTabSupport: true,
        customConflictHandling: true,
        customBackend: false
    },
    firebase: {
        offlineFirst: 'Partially, must be online on first page load',
        observableQueries: true,
        realtimeReplication: true,
        clientSideEncryption: false,
        schema: false,
        complexQueries: true,
        multiTabSupport: true,
        customConflictHandling: false,
        customBackend: false
    },
    pouchdb: {
        offlineFirst: true,
        observableQueries: false,
        realtimeReplication: true,
        clientSideEncryption: true,
        schema: false,
        complexQueries: true,
        multiTabSupport: false,
        customConflictHandling: true,
        customBackend: false
    },
    'rxdb-pouchdb': {
        offlineFirst: true,
        observableQueries: true,
        realtimeReplication: true,
        clientSideEncryption: true,
        schema: true,
        complexQueries: true,
        multiTabSupport: true,
        customConflictHandling: true,
        customBackend: true
    },
    'rxdb-lokijs': {
        offlineFirst: true,
        observableQueries: true,
        realtimeReplication: true,
        clientSideEncryption: true,
        schema: true,
        complexQueries: true,
        multiTabSupport: true,
        customConflictHandling: false,
        customBackend: true
    },
    'rxdb-dexie': {
        offlineFirst: true,
        observableQueries: true,
        realtimeReplication: true,
        clientSideEncryption: true,
        schema: true,
        complexQueries: true,
        multiTabSupport: true,
        customConflictHandling: false,
        customBackend: true
    },
    watermelondb: {
        offlineFirst: true,
        observableQueries: true,
        realtimeReplication: 'Partially, must be implemented by hand',
        clientSideEncryption: false,
        schema: true,
        complexQueries: true,
        multiTabSupport: 'Partially, relies on online sync',
        customConflictHandling: false,
        customBackend: true
    }
};

const TABLE: string[][] = [];

const firstRow = ['Feature \\ Project'];
Object.keys(FEATURE_TABLE).forEach(projectKey => firstRow.push(projectKey));
TABLE.push(firstRow);

Object.entries(FEATURE_TITLES).forEach(([featureKey, featureTitle]) => {
    const row: string[] = [featureTitle];
    Object.values(FEATURE_TABLE).forEach((featureBlock: any) => {
        const value: FeatureTableValue = featureBlock[featureKey];
        row.push(valueToString(value));
    });
    TABLE.push(row);
});

console.dir(TABLE);
fs.writeFileSync(
    path.join(
        __dirname,
        '../',
        'feature-table.json'
    ),
    JSON.stringify(TABLE, null, 4)
);


function valueToString(value: FeatureTableValue): string {
    if (typeof value === 'string') {
        return value;
    } else {
        if (value) {
            return '**Yes**';
        } else {
            return 'No';
        }
    }
}
