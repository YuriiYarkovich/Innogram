import { ApiProperty } from '@nestjs/swagger';

export class EditMessageDto {
  constructor(content: string) {
    this.content = content;
  }

  @ApiProperty({
    example: 'Hello how are you',
    description: 'Content of the message',
  })
  readonly content: string;
}
