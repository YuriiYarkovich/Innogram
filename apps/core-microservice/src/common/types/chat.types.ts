import { MessageReadStatus } from '../enums/message.enum';

export interface ReturningChatData {
  id: string;
  avatarUrl?: string;
  title: string;
  lastMessageContent?: string;
  lastMessageCreatedAt?: string;
  lastMessageRead?: MessageReadStatus;
}

export interface FindingChatData {
  id: string;
  avatarFilename: string;
  title: string;
}
