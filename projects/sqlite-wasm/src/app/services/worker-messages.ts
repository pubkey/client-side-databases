export type WorkerRequest = {
    id: number;
    sql: string;
    bind: (string | number | null)[];
};

export type WorkerResponse = {
    id: number;
    rows?: any[];
    error?: string;
};
