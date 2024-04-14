import { Message, User } from 'src/shared/types';
import { Messages, Users } from '../generated/client';

export const convertTypeSqlToNosql = <T extends User | Message>(
  postgresRecord: { created_at: bigint } & Omit<T, 'createdAt'>
): T => {
  const { created_at, ...rest } = postgresRecord;
  return { ...rest, createdAt: Number(created_at) } as unknown as T;
};

export const convertTypeNosqlToSql = <T extends Users | Messages>(
  noSqlRecord: Message | User
): T => {
  const { createdAt, ...rest } = noSqlRecord;
  return { ...rest, created_at: BigInt(createdAt) } as unknown as T;
};
