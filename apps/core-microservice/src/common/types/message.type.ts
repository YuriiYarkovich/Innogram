export interface MessageToEmit {
  messageId: string;
  receiverProfileIds: string[];
  content: string;
  chatId: string;
  replyMessageId: string;
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
