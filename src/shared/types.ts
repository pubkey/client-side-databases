export interface Message {
    id: string;
    text: string;
    createdAt: number;
    read: boolean; // true if was read by the user
    sender: string;
    reciever: string;
}

export interface MessageWithDirection extends Message {
    send: boolean; // true if send, false if recieved
}

export interface AddMessage {
    sender: string;
    reciever: string;
    message: Message;
}

export interface UserPair {
    user1: User;
    user2: User;
}

export interface Search {
    searchTerm: string;
    ownUser: User;
}



export interface User {
    id: string;
    createdAt: number;
}

export interface UserWithLastMessage {
    user: User;
    message?: Message;
}


export type Metric = {
    runIdentifier?: string;
    flag: 'metric';
    key: string;
    value: number;
    unit: 'ms' | 's' | 'kb';
};
export type MetricByKey = {
    [metricKey: string]: Metric;
};

export type BuildSizeMap = {
    project: string;
    sizePlainInKiloByte: number;
    sizeGzipInKiloByte: number;
}[];
