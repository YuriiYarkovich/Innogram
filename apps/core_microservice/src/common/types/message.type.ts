import {
  MessageReadStatus,
  MessageVisibilityStatus,
} from '../enums/message.enum';

export interface ReceivingMessage {
  id?: string;
  senderId: string;
  chatId?: string;
  receiverId?: string;
  replyToMessageId?: string;
  content: string;
  files?: {
    buffer: ArrayBuffer;
    originalname: string;
    mimetype: string;
    size: number;
  }[];
}

export interface FindingMessageData {
  id: string;
  chatId: string;
  replyingMessage?: ReplyingMessage;
  authorProfileId: string;
  authorUsername: string;
  authorAvatarFilename?: string;
  content: string;
  createdAt: string;
  read: MessageReadStatus;
  isEdited: boolean;
  assets: { filename: string; order: number }[];
}

export interface ReplyingMessage {
  id: string;
  chatId: string;
  authorUsername: string;
  content: string;
  visibleStatus: MessageVisibilityStatus;
}

export interface ReturningMessageData {
  id: string;
  replyingMessage?: ReplyingMessage;
  chatId: string;
  authorProfileId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
  messageAssets?: { url: string | undefined; order: number }[];
  read: MessageReadStatus;
  isEdited: boolean;
}

export interface MessageReceiver {
  profileId: string;
  readStatus: MessageReadStatus;
}
