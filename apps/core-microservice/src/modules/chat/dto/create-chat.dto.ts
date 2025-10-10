import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  constructor(chatType: 'private' | 'group', title: string) {
    this.chat_type = chatType;
    this.title = title;
  }

  @ApiProperty({
    example: 'private',
    description: 'Chat type',
  })
  private readonly chat_type: 'private' | 'group';
  @ApiProperty({
    example: 'Great chat',
    description: 'Chat title',
  })
  private readonly title: string;
}
