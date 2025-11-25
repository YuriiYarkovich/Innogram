export interface ReturningChatData {
  id: string;
  avatarUrl?: string;
  title: string;
  lastMessageContent?: string;
  lastMessageCreatedAt?: string;
  lastMessageRead?: boolean;
}

export interface FindingChatData {
  id: string;
  avatarFilename: string;
  title: string;
}
