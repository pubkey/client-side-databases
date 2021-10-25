import {
  Message,
  User
} from './types';


import * as EXAMPLE_DATA from '../../example-data.json';

/**
 * returns a complete set of users with messages
 */
export function getExampleDataset(): {
  messages: Message[];
  users: User[];
} {
  return EXAMPLE_DATA;
}
