import { Message } from 'src/shared/types';
import { Messages } from '../generated/client';

export const convertMessageSqlToNosql = (
  postgresMessage: Messages
): Message => {
  const { created_at, ...rest } = postgresMessage;
  return { ...rest, createdAt: Number(created_at) };
};

export const convertMessageNosqlToSql = (message: Message): Messages => {
  const { createdAt, ...rest } = message;
  return { ...rest, created_at: BigInt(createdAt) };
};
