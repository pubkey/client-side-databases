import { Subject } from 'rxjs';
import { WorkerRequest, WorkerResponse } from './worker-messages';

export type TableName = 'users' | 'messages';

/**
 * Small wrapper around the SQLite WebWorker
 * that runs queries via postMessage().
 * SQLite itself has no observable queries, so writes
 * emit the changed table into changes$ and the queries
 * are re-run by the application logic.
 */
export class SQLiteDatabase {
    public readonly changes$ = new Subject<TableName>();

    private worker = new Worker(new URL('./sqlite.worker', import.meta.url), { type: 'module', name: 'sqlite-worker' });
    private lastRequestId = 0;
    private pending = new Map<number, { resolve: (rows: any[]) => void; reject: (err: Error) => void }>();

    constructor() {
        this.worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
            const handlers = this.pending.get(data.id);
            if (!handlers) {
                return;
            }
            this.pending.delete(data.id);
            if (data.error) {
                handlers.reject(new Error(data.error));
            } else {
                handlers.resolve(data.rows as any[]);
            }
        };
    }

    query<T>(sql: string, bind: (string | number | null)[] = []): Promise<T[]> {
        const id = ++this.lastRequestId;
        return new Promise<T[]>((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            const request: WorkerRequest = { id, sql, bind };
            this.worker.postMessage(request);
        });
    }

    async write(table: TableName, sql: string, bind: (string | number | null)[]): Promise<void> {
        await this.query(sql, bind);
        this.changes$.next(table);
    }
}

export function createDatabase(): SQLiteDatabase {
    return new SQLiteDatabase();
}
