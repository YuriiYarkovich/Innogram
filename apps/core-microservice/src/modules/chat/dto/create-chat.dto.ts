import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  constructor(
    chatType: 'private' | 'group',
    title: string,
    description: string,
    participantsIds: string[],
  ) {
    this.chat_type = chatType;
    this.title = title;
    this.description = description;
    this.participantsIds = participantsIds;
  }

  @ApiProperty({
    example: 'private',
    description: 'Chat type',
  })
  readonly chat_type: 'private' | 'group';

  @ApiProperty({
    example: 'Great chat',
    description: 'Chat title',
  })
  readonly title: string;

  @ApiProperty({
    example: 'The best chat of the best chats of the best chats',
    description: 'Description of the chat',
  })
  readonly description: string;

  @ApiProperty({
    example: [
      '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
      '27b439b8-9bbc-4425-9690-8ecc73dcbc49',
    ],
    description: 'IDs of all chat participants',
  })
  readonly participantsIds: string[];
}
