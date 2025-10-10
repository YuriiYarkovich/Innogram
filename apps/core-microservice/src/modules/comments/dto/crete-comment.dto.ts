import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  constructor(content: string) {
    this.content = content;
  }

  @ApiProperty({
    example: 'You look absolutely gorgeous today! OMG!',
    description: 'Content of the comment',
  })
  readonly content: string;
}
