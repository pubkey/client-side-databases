import { z } from 'zod';
import type { Prisma } from './prismaClient';
import { type TableSchema, DbSchema, Relation, ElectricClient, type HKT } from 'electric-sql/client/model';
import migrations from './migrations';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const MessagesScalarFieldEnumSchema = z.enum(['id','text','created_at','read','sender','reciever']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UsersScalarFieldEnumSchema = z.enum(['id','created_at']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// MESSAGES SCHEMA
/////////////////////////////////////////

export const MessagesSchema = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.bigint(),
  read: z.boolean(),
  sender: z.string(),
  reciever: z.string(),
})

export type Messages = z.infer<typeof MessagesSchema>

/////////////////////////////////////////
// USERS SCHEMA
/////////////////////////////////////////

export const UsersSchema = z.object({
  id: z.string(),
  created_at: z.bigint(),
})

export type Users = z.infer<typeof UsersSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// MESSAGES
//------------------------------------------------------

export const MessagesIncludeSchema: z.ZodType<Prisma.MessagesInclude> = z.object({
  users_messages_recieverTousers: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  users_messages_senderTousers: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
}).strict()

export const MessagesArgsSchema: z.ZodType<Prisma.MessagesArgs> = z.object({
  select: z.lazy(() => MessagesSelectSchema).optional(),
  include: z.lazy(() => MessagesIncludeSchema).optional(),
}).strict();

export const MessagesSelectSchema: z.ZodType<Prisma.MessagesSelect> = z.object({
  id: z.boolean().optional(),
  text: z.boolean().optional(),
  created_at: z.boolean().optional(),
  read: z.boolean().optional(),
  sender: z.boolean().optional(),
  reciever: z.boolean().optional(),
  users_messages_recieverTousers: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  users_messages_senderTousers: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
}).strict()

// USERS
//------------------------------------------------------

export const UsersIncludeSchema: z.ZodType<Prisma.UsersInclude> = z.object({
  messages_messages_recieverTousers: z.union([z.boolean(),z.lazy(() => MessagesFindManyArgsSchema)]).optional(),
  messages_messages_senderTousers: z.union([z.boolean(),z.lazy(() => MessagesFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UsersCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UsersArgsSchema: z.ZodType<Prisma.UsersArgs> = z.object({
  select: z.lazy(() => UsersSelectSchema).optional(),
  include: z.lazy(() => UsersIncludeSchema).optional(),
}).strict();

export const UsersCountOutputTypeArgsSchema: z.ZodType<Prisma.UsersCountOutputTypeArgs> = z.object({
  select: z.lazy(() => UsersCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UsersCountOutputTypeSelectSchema: z.ZodType<Prisma.UsersCountOutputTypeSelect> = z.object({
  messages_messages_recieverTousers: z.boolean().optional(),
  messages_messages_senderTousers: z.boolean().optional(),
}).strict();

export const UsersSelectSchema: z.ZodType<Prisma.UsersSelect> = z.object({
  id: z.boolean().optional(),
  created_at: z.boolean().optional(),
  messages_messages_recieverTousers: z.union([z.boolean(),z.lazy(() => MessagesFindManyArgsSchema)]).optional(),
  messages_messages_senderTousers: z.union([z.boolean(),z.lazy(() => MessagesFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UsersCountOutputTypeArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const MessagesWhereInputSchema: z.ZodType<Prisma.MessagesWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MessagesWhereInputSchema),z.lazy(() => MessagesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessagesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessagesWhereInputSchema),z.lazy(() => MessagesWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  text: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => BigIntFilterSchema),z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]) ]).optional(),
  read: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  sender: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reciever: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  users_messages_recieverTousers: z.union([ z.lazy(() => UsersRelationFilterSchema),z.lazy(() => UsersWhereInputSchema) ]).optional(),
  users_messages_senderTousers: z.union([ z.lazy(() => UsersRelationFilterSchema),z.lazy(() => UsersWhereInputSchema) ]).optional(),
}).strict();

export const MessagesOrderByWithRelationInputSchema: z.ZodType<Prisma.MessagesOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  text: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  read: z.lazy(() => SortOrderSchema).optional(),
  sender: z.lazy(() => SortOrderSchema).optional(),
  reciever: z.lazy(() => SortOrderSchema).optional(),
  users_messages_recieverTousers: z.lazy(() => UsersOrderByWithRelationInputSchema).optional(),
  users_messages_senderTousers: z.lazy(() => UsersOrderByWithRelationInputSchema).optional()
}).strict();

export const MessagesWhereUniqueInputSchema: z.ZodType<Prisma.MessagesWhereUniqueInput> = z.object({
  id: z.string().optional()
}).strict();

export const MessagesOrderByWithAggregationInputSchema: z.ZodType<Prisma.MessagesOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  text: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  read: z.lazy(() => SortOrderSchema).optional(),
  sender: z.lazy(() => SortOrderSchema).optional(),
  reciever: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MessagesCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => MessagesAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MessagesMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MessagesMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => MessagesSumOrderByAggregateInputSchema).optional()
}).strict();

export const MessagesScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MessagesScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => MessagesScalarWhereWithAggregatesInputSchema),z.lazy(() => MessagesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessagesScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessagesScalarWhereWithAggregatesInputSchema),z.lazy(() => MessagesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  text: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => BigIntWithAggregatesFilterSchema),z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]) ]).optional(),
  read: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  sender: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  reciever: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UsersWhereInputSchema: z.ZodType<Prisma.UsersWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UsersWhereInputSchema),z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UsersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UsersWhereInputSchema),z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => BigIntFilterSchema),z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]) ]).optional(),
  messages_messages_recieverTousers: z.lazy(() => MessagesListRelationFilterSchema).optional(),
  messages_messages_senderTousers: z.lazy(() => MessagesListRelationFilterSchema).optional()
}).strict();

export const UsersOrderByWithRelationInputSchema: z.ZodType<Prisma.UsersOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  messages_messages_recieverTousers: z.lazy(() => MessagesOrderByRelationAggregateInputSchema).optional(),
  messages_messages_senderTousers: z.lazy(() => MessagesOrderByRelationAggregateInputSchema).optional()
}).strict();

export const UsersWhereUniqueInputSchema: z.ZodType<Prisma.UsersWhereUniqueInput> = z.object({
  id: z.string().optional()
}).strict();

export const UsersOrderByWithAggregationInputSchema: z.ZodType<Prisma.UsersOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UsersCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UsersAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UsersMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UsersMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UsersSumOrderByAggregateInputSchema).optional()
}).strict();

export const UsersScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UsersScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UsersScalarWhereWithAggregatesInputSchema),z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UsersScalarWhereWithAggregatesInputSchema),z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => BigIntWithAggregatesFilterSchema),z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]) ]).optional(),
}).strict();

export const MessagesCreateInputSchema: z.ZodType<Prisma.MessagesCreateInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  users_messages_recieverTousers: z.lazy(() => UsersCreateNestedOneWithoutMessages_messages_recieverTousersInputSchema),
  users_messages_senderTousers: z.lazy(() => UsersCreateNestedOneWithoutMessages_messages_senderTousersInputSchema)
}).strict();

export const MessagesUncheckedCreateInputSchema: z.ZodType<Prisma.MessagesUncheckedCreateInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  sender: z.string(),
  reciever: z.string()
}).strict();

export const MessagesUpdateInputSchema: z.ZodType<Prisma.MessagesUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  users_messages_recieverTousers: z.lazy(() => UsersUpdateOneRequiredWithoutMessages_messages_recieverTousersNestedInputSchema).optional(),
  users_messages_senderTousers: z.lazy(() => UsersUpdateOneRequiredWithoutMessages_messages_senderTousersNestedInputSchema).optional()
}).strict();

export const MessagesUncheckedUpdateInputSchema: z.ZodType<Prisma.MessagesUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  sender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  reciever: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MessagesCreateManyInputSchema: z.ZodType<Prisma.MessagesCreateManyInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  sender: z.string(),
  reciever: z.string()
}).strict();

export const MessagesUpdateManyMutationInputSchema: z.ZodType<Prisma.MessagesUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MessagesUncheckedUpdateManyInputSchema: z.ZodType<Prisma.MessagesUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  sender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  reciever: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UsersCreateInputSchema: z.ZodType<Prisma.UsersCreateInput> = z.object({
  id: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  messages_messages_recieverTousers: z.lazy(() => MessagesCreateNestedManyWithoutUsers_messages_recieverTousersInputSchema).optional(),
  messages_messages_senderTousers: z.lazy(() => MessagesCreateNestedManyWithoutUsers_messages_senderTousersInputSchema).optional()
}).strict();

export const UsersUncheckedCreateInputSchema: z.ZodType<Prisma.UsersUncheckedCreateInput> = z.object({
  id: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  messages_messages_recieverTousers: z.lazy(() => MessagesUncheckedCreateNestedManyWithoutUsers_messages_recieverTousersInputSchema).optional(),
  messages_messages_senderTousers: z.lazy(() => MessagesUncheckedCreateNestedManyWithoutUsers_messages_senderTousersInputSchema).optional()
}).strict();

export const UsersUpdateInputSchema: z.ZodType<Prisma.UsersUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  messages_messages_recieverTousers: z.lazy(() => MessagesUpdateManyWithoutUsers_messages_recieverTousersNestedInputSchema).optional(),
  messages_messages_senderTousers: z.lazy(() => MessagesUpdateManyWithoutUsers_messages_senderTousersNestedInputSchema).optional()
}).strict();

export const UsersUncheckedUpdateInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  messages_messages_recieverTousers: z.lazy(() => MessagesUncheckedUpdateManyWithoutUsers_messages_recieverTousersNestedInputSchema).optional(),
  messages_messages_senderTousers: z.lazy(() => MessagesUncheckedUpdateManyWithoutUsers_messages_senderTousersNestedInputSchema).optional()
}).strict();

export const UsersCreateManyInputSchema: z.ZodType<Prisma.UsersCreateManyInput> = z.object({
  id: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ])
}).strict();

export const UsersUpdateManyMutationInputSchema: z.ZodType<Prisma.UsersUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UsersUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const BigIntFilterSchema: z.ZodType<Prisma.BigIntFilter> = z.object({
  equals: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  in: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n).array(), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt).array() ]).optional(),
  notIn: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n).array(), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt).array() ]).optional(),
  lt: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  lte: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  gt: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  gte: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  not: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => NestedBigIntFilterSchema) ]).optional(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const UsersRelationFilterSchema: z.ZodType<Prisma.UsersRelationFilter> = z.object({
  is: z.lazy(() => UsersWhereInputSchema).optional(),
  isNot: z.lazy(() => UsersWhereInputSchema).optional()
}).strict();

export const MessagesCountOrderByAggregateInputSchema: z.ZodType<Prisma.MessagesCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  text: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  read: z.lazy(() => SortOrderSchema).optional(),
  sender: z.lazy(() => SortOrderSchema).optional(),
  reciever: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MessagesAvgOrderByAggregateInputSchema: z.ZodType<Prisma.MessagesAvgOrderByAggregateInput> = z.object({
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MessagesMaxOrderByAggregateInputSchema: z.ZodType<Prisma.MessagesMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  text: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  read: z.lazy(() => SortOrderSchema).optional(),
  sender: z.lazy(() => SortOrderSchema).optional(),
  reciever: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MessagesMinOrderByAggregateInputSchema: z.ZodType<Prisma.MessagesMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  text: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  read: z.lazy(() => SortOrderSchema).optional(),
  sender: z.lazy(() => SortOrderSchema).optional(),
  reciever: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MessagesSumOrderByAggregateInputSchema: z.ZodType<Prisma.MessagesSumOrderByAggregateInput> = z.object({
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const BigIntWithAggregatesFilterSchema: z.ZodType<Prisma.BigIntWithAggregatesFilter> = z.object({
  equals: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  in: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n).array(), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt).array() ]).optional(),
  notIn: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n).array(), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt).array() ]).optional(),
  lt: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  lte: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  gt: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  gte: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  not: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => NestedBigIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedBigIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBigIntFilterSchema).optional(),
  _max: z.lazy(() => NestedBigIntFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const MessagesListRelationFilterSchema: z.ZodType<Prisma.MessagesListRelationFilter> = z.object({
  every: z.lazy(() => MessagesWhereInputSchema).optional(),
  some: z.lazy(() => MessagesWhereInputSchema).optional(),
  none: z.lazy(() => MessagesWhereInputSchema).optional()
}).strict();

export const MessagesOrderByRelationAggregateInputSchema: z.ZodType<Prisma.MessagesOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersCountOrderByAggregateInputSchema: z.ZodType<Prisma.UsersCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UsersAvgOrderByAggregateInput> = z.object({
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UsersMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersMinOrderByAggregateInputSchema: z.ZodType<Prisma.UsersMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersSumOrderByAggregateInputSchema: z.ZodType<Prisma.UsersSumOrderByAggregateInput> = z.object({
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UsersCreateNestedOneWithoutMessages_messages_recieverTousersInputSchema: z.ZodType<Prisma.UsersCreateNestedOneWithoutMessages_messages_recieverTousersInput> = z.object({
  create: z.union([ z.lazy(() => UsersCreateWithoutMessages_messages_recieverTousersInputSchema),z.lazy(() => UsersUncheckedCreateWithoutMessages_messages_recieverTousersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutMessages_messages_recieverTousersInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional()
}).strict();

export const UsersCreateNestedOneWithoutMessages_messages_senderTousersInputSchema: z.ZodType<Prisma.UsersCreateNestedOneWithoutMessages_messages_senderTousersInput> = z.object({
  create: z.union([ z.lazy(() => UsersCreateWithoutMessages_messages_senderTousersInputSchema),z.lazy(() => UsersUncheckedCreateWithoutMessages_messages_senderTousersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutMessages_messages_senderTousersInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const BigIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BigIntFieldUpdateOperationsInput> = z.object({
  set: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  increment: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  decrement: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  multiply: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  divide: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const UsersUpdateOneRequiredWithoutMessages_messages_recieverTousersNestedInputSchema: z.ZodType<Prisma.UsersUpdateOneRequiredWithoutMessages_messages_recieverTousersNestedInput> = z.object({
  create: z.union([ z.lazy(() => UsersCreateWithoutMessages_messages_recieverTousersInputSchema),z.lazy(() => UsersUncheckedCreateWithoutMessages_messages_recieverTousersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutMessages_messages_recieverTousersInputSchema).optional(),
  upsert: z.lazy(() => UsersUpsertWithoutMessages_messages_recieverTousersInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UsersUpdateWithoutMessages_messages_recieverTousersInputSchema),z.lazy(() => UsersUncheckedUpdateWithoutMessages_messages_recieverTousersInputSchema) ]).optional(),
}).strict();

export const UsersUpdateOneRequiredWithoutMessages_messages_senderTousersNestedInputSchema: z.ZodType<Prisma.UsersUpdateOneRequiredWithoutMessages_messages_senderTousersNestedInput> = z.object({
  create: z.union([ z.lazy(() => UsersCreateWithoutMessages_messages_senderTousersInputSchema),z.lazy(() => UsersUncheckedCreateWithoutMessages_messages_senderTousersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutMessages_messages_senderTousersInputSchema).optional(),
  upsert: z.lazy(() => UsersUpsertWithoutMessages_messages_senderTousersInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UsersUpdateWithoutMessages_messages_senderTousersInputSchema),z.lazy(() => UsersUncheckedUpdateWithoutMessages_messages_senderTousersInputSchema) ]).optional(),
}).strict();

export const MessagesCreateNestedManyWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesCreateNestedManyWithoutUsers_messages_recieverTousersInput> = z.object({
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema).array(),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessagesCreateManyUsers_messages_recieverTousersInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const MessagesCreateNestedManyWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesCreateNestedManyWithoutUsers_messages_senderTousersInput> = z.object({
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema).array(),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessagesCreateManyUsers_messages_senderTousersInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const MessagesUncheckedCreateNestedManyWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesUncheckedCreateNestedManyWithoutUsers_messages_recieverTousersInput> = z.object({
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema).array(),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessagesCreateManyUsers_messages_recieverTousersInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const MessagesUncheckedCreateNestedManyWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesUncheckedCreateNestedManyWithoutUsers_messages_senderTousersInput> = z.object({
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema).array(),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessagesCreateManyUsers_messages_senderTousersInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const MessagesUpdateManyWithoutUsers_messages_recieverTousersNestedInputSchema: z.ZodType<Prisma.MessagesUpdateManyWithoutUsers_messages_recieverTousersNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema).array(),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessagesUpsertWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUpsertWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessagesCreateManyUsers_messages_recieverTousersInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessagesUpdateWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUpdateWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessagesUpdateManyWithWhereWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUpdateManyWithWhereWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessagesScalarWhereInputSchema),z.lazy(() => MessagesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const MessagesUpdateManyWithoutUsers_messages_senderTousersNestedInputSchema: z.ZodType<Prisma.MessagesUpdateManyWithoutUsers_messages_senderTousersNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema).array(),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessagesUpsertWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUpsertWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessagesCreateManyUsers_messages_senderTousersInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessagesUpdateWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUpdateWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessagesUpdateManyWithWhereWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUpdateManyWithWhereWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessagesScalarWhereInputSchema),z.lazy(() => MessagesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const MessagesUncheckedUpdateManyWithoutUsers_messages_recieverTousersNestedInputSchema: z.ZodType<Prisma.MessagesUncheckedUpdateManyWithoutUsers_messages_recieverTousersNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema).array(),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessagesUpsertWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUpsertWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessagesCreateManyUsers_messages_recieverTousersInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessagesUpdateWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUpdateWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessagesUpdateManyWithWhereWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUpdateManyWithWhereWithoutUsers_messages_recieverTousersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessagesScalarWhereInputSchema),z.lazy(() => MessagesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const MessagesUncheckedUpdateManyWithoutUsers_messages_senderTousersNestedInputSchema: z.ZodType<Prisma.MessagesUncheckedUpdateManyWithoutUsers_messages_senderTousersNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema).array(),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MessagesUpsertWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUpsertWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MessagesCreateManyUsers_messages_senderTousersInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MessagesWhereUniqueInputSchema),z.lazy(() => MessagesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MessagesUpdateWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUpdateWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MessagesUpdateManyWithWhereWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUpdateManyWithWhereWithoutUsers_messages_senderTousersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MessagesScalarWhereInputSchema),z.lazy(() => MessagesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedBigIntFilterSchema: z.ZodType<Prisma.NestedBigIntFilter> = z.object({
  equals: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  in: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n).array(), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt).array() ]).optional(),
  notIn: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n).array(), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt).array() ]).optional(),
  lt: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  lte: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  gt: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  gte: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  not: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => NestedBigIntFilterSchema) ]).optional(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedBigIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBigIntWithAggregatesFilter> = z.object({
  equals: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  in: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n).array(), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt).array() ]).optional(),
  notIn: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n).array(), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt).array() ]).optional(),
  lt: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  lte: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  gt: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  gte: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]).optional(),
  not: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => NestedBigIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedBigIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBigIntFilterSchema).optional(),
  _max: z.lazy(() => NestedBigIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const UsersCreateWithoutMessages_messages_recieverTousersInputSchema: z.ZodType<Prisma.UsersCreateWithoutMessages_messages_recieverTousersInput> = z.object({
  id: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  messages_messages_senderTousers: z.lazy(() => MessagesCreateNestedManyWithoutUsers_messages_senderTousersInputSchema).optional()
}).strict();

export const UsersUncheckedCreateWithoutMessages_messages_recieverTousersInputSchema: z.ZodType<Prisma.UsersUncheckedCreateWithoutMessages_messages_recieverTousersInput> = z.object({
  id: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  messages_messages_senderTousers: z.lazy(() => MessagesUncheckedCreateNestedManyWithoutUsers_messages_senderTousersInputSchema).optional()
}).strict();

export const UsersCreateOrConnectWithoutMessages_messages_recieverTousersInputSchema: z.ZodType<Prisma.UsersCreateOrConnectWithoutMessages_messages_recieverTousersInput> = z.object({
  where: z.lazy(() => UsersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UsersCreateWithoutMessages_messages_recieverTousersInputSchema),z.lazy(() => UsersUncheckedCreateWithoutMessages_messages_recieverTousersInputSchema) ]),
}).strict();

export const UsersCreateWithoutMessages_messages_senderTousersInputSchema: z.ZodType<Prisma.UsersCreateWithoutMessages_messages_senderTousersInput> = z.object({
  id: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  messages_messages_recieverTousers: z.lazy(() => MessagesCreateNestedManyWithoutUsers_messages_recieverTousersInputSchema).optional()
}).strict();

export const UsersUncheckedCreateWithoutMessages_messages_senderTousersInputSchema: z.ZodType<Prisma.UsersUncheckedCreateWithoutMessages_messages_senderTousersInput> = z.object({
  id: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  messages_messages_recieverTousers: z.lazy(() => MessagesUncheckedCreateNestedManyWithoutUsers_messages_recieverTousersInputSchema).optional()
}).strict();

export const UsersCreateOrConnectWithoutMessages_messages_senderTousersInputSchema: z.ZodType<Prisma.UsersCreateOrConnectWithoutMessages_messages_senderTousersInput> = z.object({
  where: z.lazy(() => UsersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UsersCreateWithoutMessages_messages_senderTousersInputSchema),z.lazy(() => UsersUncheckedCreateWithoutMessages_messages_senderTousersInputSchema) ]),
}).strict();

export const UsersUpsertWithoutMessages_messages_recieverTousersInputSchema: z.ZodType<Prisma.UsersUpsertWithoutMessages_messages_recieverTousersInput> = z.object({
  update: z.union([ z.lazy(() => UsersUpdateWithoutMessages_messages_recieverTousersInputSchema),z.lazy(() => UsersUncheckedUpdateWithoutMessages_messages_recieverTousersInputSchema) ]),
  create: z.union([ z.lazy(() => UsersCreateWithoutMessages_messages_recieverTousersInputSchema),z.lazy(() => UsersUncheckedCreateWithoutMessages_messages_recieverTousersInputSchema) ]),
}).strict();

export const UsersUpdateWithoutMessages_messages_recieverTousersInputSchema: z.ZodType<Prisma.UsersUpdateWithoutMessages_messages_recieverTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  messages_messages_senderTousers: z.lazy(() => MessagesUpdateManyWithoutUsers_messages_senderTousersNestedInputSchema).optional()
}).strict();

export const UsersUncheckedUpdateWithoutMessages_messages_recieverTousersInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateWithoutMessages_messages_recieverTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  messages_messages_senderTousers: z.lazy(() => MessagesUncheckedUpdateManyWithoutUsers_messages_senderTousersNestedInputSchema).optional()
}).strict();

export const UsersUpsertWithoutMessages_messages_senderTousersInputSchema: z.ZodType<Prisma.UsersUpsertWithoutMessages_messages_senderTousersInput> = z.object({
  update: z.union([ z.lazy(() => UsersUpdateWithoutMessages_messages_senderTousersInputSchema),z.lazy(() => UsersUncheckedUpdateWithoutMessages_messages_senderTousersInputSchema) ]),
  create: z.union([ z.lazy(() => UsersCreateWithoutMessages_messages_senderTousersInputSchema),z.lazy(() => UsersUncheckedCreateWithoutMessages_messages_senderTousersInputSchema) ]),
}).strict();

export const UsersUpdateWithoutMessages_messages_senderTousersInputSchema: z.ZodType<Prisma.UsersUpdateWithoutMessages_messages_senderTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  messages_messages_recieverTousers: z.lazy(() => MessagesUpdateManyWithoutUsers_messages_recieverTousersNestedInputSchema).optional()
}).strict();

export const UsersUncheckedUpdateWithoutMessages_messages_senderTousersInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateWithoutMessages_messages_senderTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  messages_messages_recieverTousers: z.lazy(() => MessagesUncheckedUpdateManyWithoutUsers_messages_recieverTousersNestedInputSchema).optional()
}).strict();

export const MessagesCreateWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesCreateWithoutUsers_messages_recieverTousersInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  users_messages_senderTousers: z.lazy(() => UsersCreateNestedOneWithoutMessages_messages_senderTousersInputSchema)
}).strict();

export const MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  sender: z.string()
}).strict();

export const MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesCreateOrConnectWithoutUsers_messages_recieverTousersInput> = z.object({
  where: z.lazy(() => MessagesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema) ]),
}).strict();

export const MessagesCreateManyUsers_messages_recieverTousersInputEnvelopeSchema: z.ZodType<Prisma.MessagesCreateManyUsers_messages_recieverTousersInputEnvelope> = z.object({
  data: z.lazy(() => MessagesCreateManyUsers_messages_recieverTousersInputSchema).array(),
  skipDuplicates: z.boolean().optional()
}).strict();

export const MessagesCreateWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesCreateWithoutUsers_messages_senderTousersInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  users_messages_recieverTousers: z.lazy(() => UsersCreateNestedOneWithoutMessages_messages_recieverTousersInputSchema)
}).strict();

export const MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesUncheckedCreateWithoutUsers_messages_senderTousersInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  reciever: z.string()
}).strict();

export const MessagesCreateOrConnectWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesCreateOrConnectWithoutUsers_messages_senderTousersInput> = z.object({
  where: z.lazy(() => MessagesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema) ]),
}).strict();

export const MessagesCreateManyUsers_messages_senderTousersInputEnvelopeSchema: z.ZodType<Prisma.MessagesCreateManyUsers_messages_senderTousersInputEnvelope> = z.object({
  data: z.lazy(() => MessagesCreateManyUsers_messages_senderTousersInputSchema).array(),
  skipDuplicates: z.boolean().optional()
}).strict();

export const MessagesUpsertWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesUpsertWithWhereUniqueWithoutUsers_messages_recieverTousersInput> = z.object({
  where: z.lazy(() => MessagesWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessagesUpdateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUncheckedUpdateWithoutUsers_messages_recieverTousersInputSchema) ]),
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_recieverTousersInputSchema) ]),
}).strict();

export const MessagesUpdateWithWhereUniqueWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesUpdateWithWhereUniqueWithoutUsers_messages_recieverTousersInput> = z.object({
  where: z.lazy(() => MessagesWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MessagesUpdateWithoutUsers_messages_recieverTousersInputSchema),z.lazy(() => MessagesUncheckedUpdateWithoutUsers_messages_recieverTousersInputSchema) ]),
}).strict();

export const MessagesUpdateManyWithWhereWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesUpdateManyWithWhereWithoutUsers_messages_recieverTousersInput> = z.object({
  where: z.lazy(() => MessagesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MessagesUpdateManyMutationInputSchema),z.lazy(() => MessagesUncheckedUpdateManyWithoutMessages_messages_recieverTousersInputSchema) ]),
}).strict();

export const MessagesScalarWhereInputSchema: z.ZodType<Prisma.MessagesScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MessagesScalarWhereInputSchema),z.lazy(() => MessagesScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessagesScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessagesScalarWhereInputSchema),z.lazy(() => MessagesScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  text: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => BigIntFilterSchema),z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]) ]).optional(),
  read: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  sender: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reciever: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const MessagesUpsertWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesUpsertWithWhereUniqueWithoutUsers_messages_senderTousersInput> = z.object({
  where: z.lazy(() => MessagesWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MessagesUpdateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUncheckedUpdateWithoutUsers_messages_senderTousersInputSchema) ]),
  create: z.union([ z.lazy(() => MessagesCreateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUncheckedCreateWithoutUsers_messages_senderTousersInputSchema) ]),
}).strict();

export const MessagesUpdateWithWhereUniqueWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesUpdateWithWhereUniqueWithoutUsers_messages_senderTousersInput> = z.object({
  where: z.lazy(() => MessagesWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MessagesUpdateWithoutUsers_messages_senderTousersInputSchema),z.lazy(() => MessagesUncheckedUpdateWithoutUsers_messages_senderTousersInputSchema) ]),
}).strict();

export const MessagesUpdateManyWithWhereWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesUpdateManyWithWhereWithoutUsers_messages_senderTousersInput> = z.object({
  where: z.lazy(() => MessagesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MessagesUpdateManyMutationInputSchema),z.lazy(() => MessagesUncheckedUpdateManyWithoutMessages_messages_senderTousersInputSchema) ]),
}).strict();

export const MessagesCreateManyUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesCreateManyUsers_messages_recieverTousersInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  sender: z.string()
}).strict();

export const MessagesCreateManyUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesCreateManyUsers_messages_senderTousersInput> = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),
  read: z.boolean(),
  reciever: z.string()
}).strict();

export const MessagesUpdateWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesUpdateWithoutUsers_messages_recieverTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  users_messages_senderTousers: z.lazy(() => UsersUpdateOneRequiredWithoutMessages_messages_senderTousersNestedInputSchema).optional()
}).strict();

export const MessagesUncheckedUpdateWithoutUsers_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesUncheckedUpdateWithoutUsers_messages_recieverTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  sender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MessagesUncheckedUpdateManyWithoutMessages_messages_recieverTousersInputSchema: z.ZodType<Prisma.MessagesUncheckedUpdateManyWithoutMessages_messages_recieverTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  sender: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MessagesUpdateWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesUpdateWithoutUsers_messages_senderTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  users_messages_recieverTousers: z.lazy(() => UsersUpdateOneRequiredWithoutMessages_messages_recieverTousersNestedInputSchema).optional()
}).strict();

export const MessagesUncheckedUpdateWithoutUsers_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesUncheckedUpdateWithoutUsers_messages_senderTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  reciever: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MessagesUncheckedUpdateManyWithoutMessages_messages_senderTousersInputSchema: z.ZodType<Prisma.MessagesUncheckedUpdateManyWithoutMessages_messages_senderTousersInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.union([ z.bigint().gte(-9223372036854775808n).lte(9223372036854775807n), z.number().int().gte(Number.MIN_SAFE_INTEGER).lte(Number.MAX_SAFE_INTEGER).transform(BigInt) ]),z.lazy(() => BigIntFieldUpdateOperationsInputSchema) ]).optional(),
  read: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  reciever: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const MessagesFindFirstArgsSchema: z.ZodType<Prisma.MessagesFindFirstArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  where: MessagesWhereInputSchema.optional(),
  orderBy: z.union([ MessagesOrderByWithRelationInputSchema.array(),MessagesOrderByWithRelationInputSchema ]).optional(),
  cursor: MessagesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: MessagesScalarFieldEnumSchema.array().optional(),
}).strict() as z.ZodType<Prisma.MessagesFindFirstArgs>

export const MessagesFindFirstOrThrowArgsSchema: z.ZodType<Prisma.MessagesFindFirstOrThrowArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  where: MessagesWhereInputSchema.optional(),
  orderBy: z.union([ MessagesOrderByWithRelationInputSchema.array(),MessagesOrderByWithRelationInputSchema ]).optional(),
  cursor: MessagesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: MessagesScalarFieldEnumSchema.array().optional(),
}).strict() as z.ZodType<Prisma.MessagesFindFirstOrThrowArgs>

export const MessagesFindManyArgsSchema: z.ZodType<Prisma.MessagesFindManyArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  where: MessagesWhereInputSchema.optional(),
  orderBy: z.union([ MessagesOrderByWithRelationInputSchema.array(),MessagesOrderByWithRelationInputSchema ]).optional(),
  cursor: MessagesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: MessagesScalarFieldEnumSchema.array().optional(),
}).strict() as z.ZodType<Prisma.MessagesFindManyArgs>

export const MessagesAggregateArgsSchema: z.ZodType<Prisma.MessagesAggregateArgs> = z.object({
  where: MessagesWhereInputSchema.optional(),
  orderBy: z.union([ MessagesOrderByWithRelationInputSchema.array(),MessagesOrderByWithRelationInputSchema ]).optional(),
  cursor: MessagesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.MessagesAggregateArgs>

export const MessagesGroupByArgsSchema: z.ZodType<Prisma.MessagesGroupByArgs> = z.object({
  where: MessagesWhereInputSchema.optional(),
  orderBy: z.union([ MessagesOrderByWithAggregationInputSchema.array(),MessagesOrderByWithAggregationInputSchema ]).optional(),
  by: MessagesScalarFieldEnumSchema.array(),
  having: MessagesScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.MessagesGroupByArgs>

export const MessagesFindUniqueArgsSchema: z.ZodType<Prisma.MessagesFindUniqueArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  where: MessagesWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.MessagesFindUniqueArgs>

export const MessagesFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.MessagesFindUniqueOrThrowArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  where: MessagesWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.MessagesFindUniqueOrThrowArgs>

export const UsersFindFirstArgsSchema: z.ZodType<Prisma.UsersFindFirstArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(),UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: UsersScalarFieldEnumSchema.array().optional(),
}).strict() as z.ZodType<Prisma.UsersFindFirstArgs>

export const UsersFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UsersFindFirstOrThrowArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(),UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: UsersScalarFieldEnumSchema.array().optional(),
}).strict() as z.ZodType<Prisma.UsersFindFirstOrThrowArgs>

export const UsersFindManyArgsSchema: z.ZodType<Prisma.UsersFindManyArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(),UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: UsersScalarFieldEnumSchema.array().optional(),
}).strict() as z.ZodType<Prisma.UsersFindManyArgs>

export const UsersAggregateArgsSchema: z.ZodType<Prisma.UsersAggregateArgs> = z.object({
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(),UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UsersAggregateArgs>

export const UsersGroupByArgsSchema: z.ZodType<Prisma.UsersGroupByArgs> = z.object({
  where: UsersWhereInputSchema.optional(),
  orderBy: z.union([ UsersOrderByWithAggregationInputSchema.array(),UsersOrderByWithAggregationInputSchema ]).optional(),
  by: UsersScalarFieldEnumSchema.array(),
  having: UsersScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UsersGroupByArgs>

export const UsersFindUniqueArgsSchema: z.ZodType<Prisma.UsersFindUniqueArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UsersFindUniqueArgs>

export const UsersFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UsersFindUniqueOrThrowArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UsersFindUniqueOrThrowArgs>

export const MessagesCreateArgsSchema: z.ZodType<Prisma.MessagesCreateArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  data: z.union([ MessagesCreateInputSchema,MessagesUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.MessagesCreateArgs>

export const MessagesUpsertArgsSchema: z.ZodType<Prisma.MessagesUpsertArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  where: MessagesWhereUniqueInputSchema,
  create: z.union([ MessagesCreateInputSchema,MessagesUncheckedCreateInputSchema ]),
  update: z.union([ MessagesUpdateInputSchema,MessagesUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.MessagesUpsertArgs>

export const MessagesCreateManyArgsSchema: z.ZodType<Prisma.MessagesCreateManyArgs> = z.object({
  data: MessagesCreateManyInputSchema.array(),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.MessagesCreateManyArgs>

export const MessagesDeleteArgsSchema: z.ZodType<Prisma.MessagesDeleteArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  where: MessagesWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.MessagesDeleteArgs>

export const MessagesUpdateArgsSchema: z.ZodType<Prisma.MessagesUpdateArgs> = z.object({
  select: MessagesSelectSchema.optional(),
  include: MessagesIncludeSchema.optional(),
  data: z.union([ MessagesUpdateInputSchema,MessagesUncheckedUpdateInputSchema ]),
  where: MessagesWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.MessagesUpdateArgs>

export const MessagesUpdateManyArgsSchema: z.ZodType<Prisma.MessagesUpdateManyArgs> = z.object({
  data: z.union([ MessagesUpdateManyMutationInputSchema,MessagesUncheckedUpdateManyInputSchema ]),
  where: MessagesWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.MessagesUpdateManyArgs>

export const MessagesDeleteManyArgsSchema: z.ZodType<Prisma.MessagesDeleteManyArgs> = z.object({
  where: MessagesWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.MessagesDeleteManyArgs>

export const UsersCreateArgsSchema: z.ZodType<Prisma.UsersCreateArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  data: z.union([ UsersCreateInputSchema,UsersUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.UsersCreateArgs>

export const UsersUpsertArgsSchema: z.ZodType<Prisma.UsersUpsertArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereUniqueInputSchema,
  create: z.union([ UsersCreateInputSchema,UsersUncheckedCreateInputSchema ]),
  update: z.union([ UsersUpdateInputSchema,UsersUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.UsersUpsertArgs>

export const UsersCreateManyArgsSchema: z.ZodType<Prisma.UsersCreateManyArgs> = z.object({
  data: UsersCreateManyInputSchema.array(),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.UsersCreateManyArgs>

export const UsersDeleteArgsSchema: z.ZodType<Prisma.UsersDeleteArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UsersDeleteArgs>

export const UsersUpdateArgsSchema: z.ZodType<Prisma.UsersUpdateArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  data: z.union([ UsersUpdateInputSchema,UsersUncheckedUpdateInputSchema ]),
  where: UsersWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UsersUpdateArgs>

export const UsersUpdateManyArgsSchema: z.ZodType<Prisma.UsersUpdateManyArgs> = z.object({
  data: z.union([ UsersUpdateManyMutationInputSchema,UsersUncheckedUpdateManyInputSchema ]),
  where: UsersWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UsersUpdateManyArgs>

export const UsersDeleteManyArgsSchema: z.ZodType<Prisma.UsersDeleteManyArgs> = z.object({
  where: UsersWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UsersDeleteManyArgs>

interface MessagesGetPayload extends HKT {
  readonly _A?: boolean | null | undefined | Prisma.MessagesArgs
  readonly type: Prisma.MessagesGetPayload<this['_A']>
}

interface UsersGetPayload extends HKT {
  readonly _A?: boolean | null | undefined | Prisma.UsersArgs
  readonly type: Prisma.UsersGetPayload<this['_A']>
}

export const tableSchemas = {
  messages: {
    fields: new Map([
      [
        "id",
        "VARCHAR"
      ],
      [
        "text",
        "TEXT"
      ],
      [
        "created_at",
        "INT8"
      ],
      [
        "read",
        "BOOL"
      ],
      [
        "sender",
        "VARCHAR"
      ],
      [
        "reciever",
        "VARCHAR"
      ]
    ]),
    relations: [
      new Relation("users_messages_recieverTousers", "reciever", "id", "users", "messages_recieverTousers", "one"),
      new Relation("users_messages_senderTousers", "sender", "id", "users", "messages_senderTousers", "one"),
    ],
    modelSchema: (MessagesCreateInputSchema as any)
      .partial()
      .or((MessagesUncheckedCreateInputSchema as any).partial()),
    createSchema: MessagesCreateArgsSchema,
    createManySchema: MessagesCreateManyArgsSchema,
    findUniqueSchema: MessagesFindUniqueArgsSchema,
    findSchema: MessagesFindFirstArgsSchema,
    updateSchema: MessagesUpdateArgsSchema,
    updateManySchema: MessagesUpdateManyArgsSchema,
    upsertSchema: MessagesUpsertArgsSchema,
    deleteSchema: MessagesDeleteArgsSchema,
    deleteManySchema: MessagesDeleteManyArgsSchema
  } as TableSchema<
    z.infer<typeof MessagesCreateInputSchema>,
    Prisma.MessagesCreateArgs['data'],
    Prisma.MessagesUpdateArgs['data'],
    Prisma.MessagesFindFirstArgs['select'],
    Prisma.MessagesFindFirstArgs['where'],
    Prisma.MessagesFindUniqueArgs['where'],
    Omit<Prisma.MessagesInclude, '_count'>,
    Prisma.MessagesFindFirstArgs['orderBy'],
    Prisma.MessagesScalarFieldEnum,
    MessagesGetPayload
  >,
  users: {
    fields: new Map([
      [
        "id",
        "VARCHAR"
      ],
      [
        "created_at",
        "INT8"
      ]
    ]),
    relations: [
      new Relation("messages_messages_recieverTousers", "", "", "messages", "messages_recieverTousers", "many"),
      new Relation("messages_messages_senderTousers", "", "", "messages", "messages_senderTousers", "many"),
    ],
    modelSchema: (UsersCreateInputSchema as any)
      .partial()
      .or((UsersUncheckedCreateInputSchema as any).partial()),
    createSchema: UsersCreateArgsSchema,
    createManySchema: UsersCreateManyArgsSchema,
    findUniqueSchema: UsersFindUniqueArgsSchema,
    findSchema: UsersFindFirstArgsSchema,
    updateSchema: UsersUpdateArgsSchema,
    updateManySchema: UsersUpdateManyArgsSchema,
    upsertSchema: UsersUpsertArgsSchema,
    deleteSchema: UsersDeleteArgsSchema,
    deleteManySchema: UsersDeleteManyArgsSchema
  } as TableSchema<
    z.infer<typeof UsersCreateInputSchema>,
    Prisma.UsersCreateArgs['data'],
    Prisma.UsersUpdateArgs['data'],
    Prisma.UsersFindFirstArgs['select'],
    Prisma.UsersFindFirstArgs['where'],
    Prisma.UsersFindUniqueArgs['where'],
    Omit<Prisma.UsersInclude, '_count'>,
    Prisma.UsersFindFirstArgs['orderBy'],
    Prisma.UsersScalarFieldEnum,
    UsersGetPayload
  >,
}

export const schema = new DbSchema(tableSchemas, migrations)
export type Electric = ElectricClient<typeof schema>
