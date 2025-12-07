import { MessageReadStatus } from '../enums/message.enum';
import { ChatStatus, ChatTypes } from '../enums/chat.enum';

export interface ReturningChatData {
  id: string;
  avatarUrl?: string;
  title: string;
  type: ChatTypes;
  participantsAmount?: number;
  lastMessageId?: string;
  lastMessageContent?: string;
  lastMessageCreatedAt?: string;
  lastMessageRead?: MessageReadStatus;
  chatStatus: ChatStatus;
  isCurrentUserAdmin?: boolean;
}

export interface FindingChatData {
  id: string;
  avatarFilename: string;
  title: string;
  type: ChatTypes;
  participantsAmount: number;
  chatStatus: ChatStatus;
  isCurrentUserAdmin?: boolean;
}
