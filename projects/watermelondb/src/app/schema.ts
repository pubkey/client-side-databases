import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const userMessagesSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        {
          // 'id' is reserved by watermelon
          name: 'userId',
          type: 'string'
        },
        {
          name: 'createdAt',
          type: 'number'
        }
      ]
    }),
    tableSchema({
      name: 'messages',
      columns: [
        {
          // 'id' is reserved by watermelon
          name: 'messageId',
          type: 'string'
        },
        {
          name: 'text',
          type: 'string'
        },
        {
          name: 'createdAt',
          type: 'number',
          isIndexed: true
        },
        {
          name: 'read',
          type: 'boolean'
        },
        {
          name: 'sender',
          type: 'string'
        },
        {
          name: 'reciever',
          type: 'string'
        }
      ]
    }),
  ]
})
