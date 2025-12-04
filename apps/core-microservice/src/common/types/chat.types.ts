import { MessageReadStatus } from '../enums/message.enum';
import { ChatStatus } from '../enums/chat.enum';

export interface ReturningChatData {
  id: string;
  avatarUrl?: string;
  title: string;
  lastMessageContent?: string;
  lastMessageCreatedAt?: string;
  lastMessageRead?: MessageReadStatus;
  chatStatus: ChatStatus;
}

export interface FindingChatData {
  id: string;
  avatarFilename: string;
  title: string;
  chatStatus: ChatStatus;
}
