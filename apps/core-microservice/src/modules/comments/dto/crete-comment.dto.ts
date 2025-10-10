import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
  constructor(content: string) {
    this.content = content;
  }

  @ApiProperty({
    example: 'You look absolutely gorgeous today! OMG!',
    description: 'Content of the comment',
  })
  @IsString()
  readonly content: string;
}
