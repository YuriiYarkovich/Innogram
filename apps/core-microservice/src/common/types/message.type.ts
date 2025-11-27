import { File as MulterFile } from 'multer';
import { MessageReadStatus } from '../enums/message.enum';

export interface ReceivingMessage {
  senderId: string;
  content: string;
  chatId: string;
  replyMessageId?: string;
  files: MulterFile[] | undefined;
}

export interface FindingMessageData {
  id: string;
  chatId: string;
  respondingMessageId?: string;
  authorUsername: string;
  authorAvatarFilename?: string;
  content: string;
  createdAt: string;
}

export interface ReturningMessageData {
  id: string;
  respondingMessageId?: string;
  chatId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
  messageAssetsUrls?: string[];
}

export interface MessageReceiver {
  profileId: string;
  readStatus: MessageReadStatus;
}

export interface MessageToEmitToEnteredUser {
  messageId: string;
  content: string;
  chatId: string;
  replyMessageId: string | undefined;
}

export interface MessageToEdit {
  messageId: string;
  updatedContent: string;
  chatId: string;
  files: MulterFile | undefined;
}

export interface MessageToDelete {
  messageId: string;
  chatId: string;
}
