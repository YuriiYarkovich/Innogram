import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  constructor(chat_id: string, reply_to_message_id: string, content: string) {
    this.reply_to_message_id = reply_to_message_id;
    this.chat_id = chat_id;
    this.content = content;
  }

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to chat',
  })
  readonly chat_id: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to replying message',
  })
  readonly reply_to_message_id: string;

  @ApiProperty({
    example: 'Hello how are you',
    description: 'Content of the message',
  })
  readonly content: string;
}
