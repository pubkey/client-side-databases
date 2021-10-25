import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type UserMetaData = {
  readOnlyFields: 'updatedAt';
}

type MessageMetaData = {
  readOnlyFields: 'updatedAt';
}

export declare class User {
  readonly id: string;
  readonly userName: string;
  readonly createdAt: number;
  readonly updatedAt?: string;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}

export declare class Message {
  readonly id: string;
  readonly text: string;
  readonly createdAt: number;
  readonly read: boolean;
  readonly sender: string;
  readonly reciever: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Message, MessageMetaData>);
  static copyOf(source: Message, mutator: (draft: MutableModel<Message, MessageMetaData>) => MutableModel<Message, MessageMetaData> | void): Message;
}