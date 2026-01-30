import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePostDto {
  constructor(content: string) {
    this.content = content;
  }

  @ApiProperty({
    example: `Today chilin' in Paris`,
    description: 'Content of the post',
  })
  @IsString()
  readonly content: string;
}
