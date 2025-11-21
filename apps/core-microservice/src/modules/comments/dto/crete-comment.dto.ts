import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateCommentDto {
  constructor(
    content: string,
    postId: string,
    isAnswer: boolean = false,
    parentCommentId: string = '',
  ) {
    this.content = content;
    this.postId = postId;
    this.isAnswer = isAnswer;
    this.parentCommentId = parentCommentId;
  }

  @ApiProperty({
    example: 'You look absolutely gorgeous today! OMG!',
    description: 'Content of the comment',
  })
  @IsString()
  readonly content: string;

  @IsString()
  readonly postId: string;

  @IsBoolean()
  readonly isAnswer?: boolean;

  @IsString()
  parentCommentId?: string;
}
