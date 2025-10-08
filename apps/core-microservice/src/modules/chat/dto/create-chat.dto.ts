export class CreateChatDto {
  constructor(chatType: 'private' | 'group', title: string) {
    this.chat_type = chatType;
    this.title = title;
  }

  private readonly chat_type: 'private' | 'group';
  private readonly title: string;
}
