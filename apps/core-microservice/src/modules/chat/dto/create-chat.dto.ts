export class CreateChatDto {
  constructor(chatType: 'private' | 'group', title: string) {
    this.chatType = chatType;
    this.title = title;
  }

  private readonly chatType: 'private' | 'group';
  private readonly title: string;
}
