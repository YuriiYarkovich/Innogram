import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { Column } from 'typeorm';

export class CreateMessageDto {
  constructor(chatId: string, content: string, replyToMessageId?: string) {
    this.chatId = chatId;
    this.content = content;
    this.replyToMessageId = replyToMessageId;
  }

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to chat',
  })
  @IsUUID()
  readonly chatId: string;

  @ApiProperty({
    example: 'Hello how are you',
    description: 'Content of the message',
  })
  @IsString()
  readonly content: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the sender profile',
  })
  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @ApiProperty({
    example: '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
    description: 'Reference to the replying message',
  })
  @Column({ type: 'uuid', name: 'reply_to_message_id' })
  replyToMessageId?: string;
}
