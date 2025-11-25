import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsString } from 'class-validator';
import { ChatTypes } from '../../../common/enums/chat.enum';

export class CreateChatDto {
  constructor(
    title: string,
    otherParticipantsIds: string[],
    chatType: ChatTypes,
  ) {
    this.chatType = chatType;
    this.title = title;
    this.otherParticipantsIds = otherParticipantsIds;
  }

  @ApiProperty({
    example: 'private',
    description: 'Chat type',
  })
  @IsString()
  @IsIn(['private', 'group'])
  readonly chatType: ChatTypes;

  @ApiProperty({
    example: 'Great chat',
    description: 'Chat title',
  })
  @IsString()
  readonly title: string;

  @ApiProperty({
    example: [
      '444b2df4-d3f6-4dc3-a7e4-5f1bff9ce441',
      '27b439b8-9bbc-4425-9690-8ecc73dcbc49',
    ],
    description: 'IDs of all chat participants',
  })
  @IsArray()
  readonly otherParticipantsIds: string[];
}
