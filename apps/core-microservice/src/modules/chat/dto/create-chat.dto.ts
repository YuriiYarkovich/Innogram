export class CreateChatDto {
  constructor(
    chatType: 'private' | 'group',
    title: string,
    description: string,
  ) {
    this.chatType = chatType;
    this.title = title;
    this.description = description;
  }

  private readonly chatType: 'private' | 'group';
  private readonly title: string;
  private readonly description: string;
}
