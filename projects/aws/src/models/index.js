// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Message } = initSchema(schema);

export {
  User,
  Message
};