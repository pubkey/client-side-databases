import { Message } from 'src/shared/types';
import { Messages } from '../generated/client';

export const convertMessageType = (postgresMessage: Messages): Message => {
  const { created_at, ...rest } = postgresMessage;
  return { ...rest, createdAt: Number(created_at) };
};
