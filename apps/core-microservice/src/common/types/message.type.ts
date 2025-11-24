import { File as MulterFile } from 'multer';

export interface MessageToEmit {
  messageId: string;
  content: string;
  chatId: string;
  replyMessageId: string;
  files: MulterFile | undefined;
}

export interface MessageReceiverStatus {
  receiverId: string;
  readStatus: boolean;
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
