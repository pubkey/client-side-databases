import { UserWithLastMessage, Message, User } from './types';

export function randomOfArray<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
export function randomBoolean(): boolean {
  return Math.random() >= 0.5;
}

export function lastOfArray<T>(ar: T[]): T {
  return ar[ar.length - 1];
}


export function unixInSeconds(): number {
  return Math.floor(new Date().getTime() / 1000);
}

export function sortByNewestFirst(
  usersWithLastMessage: UserWithLastMessage[]
): UserWithLastMessage[] {
  return usersWithLastMessage.sort(
    (a, b) => {
      const messageTimeA = a.message ? a.message.createdAt : 0;
      const messageTimeB = b.message ? b.message.createdAt : 0;

      if (messageTimeA === messageTimeB) {
        return 0;
      }

      if (messageTimeA > messageTimeB) {
        return -1;
      } else {
        return 1;
      }
    }
  );
}

export function doesMessageMapUserPair(
  id1: string,
  id2: string,
  message: Message
): boolean {
  if (message.sender === id1 && message.reciever === id2) {
    return true;
  }
  if (message.sender === id2 && message.reciever === id1) {
    return true;
  }
  return false;
}


export function sortMessagesByDateNewestFirst(messages: Message[]): Message[] {
  return messages.sort(
    (a, b) => {
      const messageTimeA = a.createdAt;
      const messageTimeB = b.createdAt;

      if (messageTimeA === messageTimeB) {
        return 0;
      }

      if (messageTimeA > messageTimeB) {
        return -1;
      } else {
        return 1;
      }
    }
  );
}


export function mapUserMessages(
  ownUser: User,
  users: User[],
  messages: Message[]
): UserWithLastMessage[] {
  // reverse because we search from behind
  const reverseMessages = messages.slice().reverse();

  const ret = users.map(user => {
    const lastMessage = reverseMessages
      .find(message => doesMessageMapUserPair(
        ownUser.id,
        user.id,
        message
      ));
    return {
      user,
      message: lastMessage
    };
  });
  return ret;
}

export function getMessagesOfUserPair(
  id: string,
  id2: string,
  messages: Message[]
): Message[] {
  const ret = messages.filter(message => doesMessageMapUserPair(
    id, id2, message
  ));
  return ret;
}

export function isUserInMessage(user: User, message: Message): boolean {
  return user.id === message.sender || user.id === message.reciever;
}


/**
 * @link https://stackoverflow.com/a/8837505/3443137
 */
export function sortArrayByKey<T>(array: T[], key: string): T[] {
  return array.sort((a: T, b: T) => {
    const x = (a as any)[key];
    const y = (b as any)[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
};
