import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  constructor(chatId: string, content: string) {
    this.chatId = chatId;
    this.content = content;
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
}
