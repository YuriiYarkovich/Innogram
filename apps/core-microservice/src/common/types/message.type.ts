export interface MessageToEmit {
  messageId: string;
  receiverProfileIds: string[];
  content: string;
  chatId: string;
  replyMessageId: string;
}
