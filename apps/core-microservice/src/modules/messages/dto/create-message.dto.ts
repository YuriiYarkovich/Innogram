export class CreateMessageDto {
  constructor(chat_id: string, reply_to_message_id: string, content: string) {
    this.reply_to_message_id = reply_to_message_id;
    this.chat_id = chat_id;
    this.content = content;
  }

  public readonly chat_id: string;
  private readonly reply_to_message_id: string;
  private readonly content: string;
}
