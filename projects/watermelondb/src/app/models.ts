import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export class UserModel extends Model {
  static table = 'users';

  @text('userId') userId: string;
  @field('createdAt') createdAt: number;
}

export class MessageModel extends Model {
  static table = 'messages';

  @text('messageId') messageId: string;
  @text('text') text: string;
  @field('createdAt') createdAt: number;
  @field('read') read: boolean;
  @text('sender') sender: string;
  @text('reciever') reciever: string;
}
