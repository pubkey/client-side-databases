import {
  Message,
  User
} from './types';


import { exampleData } from '../../example-data';

/**
 * returns a complete set of users with messages
 */
export function getExampleDataset(): {
  messages: Message[];
  users: User[];
} {
  return exampleData as any;
}
