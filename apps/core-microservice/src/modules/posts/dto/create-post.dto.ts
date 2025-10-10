import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  constructor(content: string) {
    this.content = content;
  }

  @ApiProperty({
    example: `Today chilin' in Paris`,
    description: 'Content of the post',
  })
  readonly content: string;
}
