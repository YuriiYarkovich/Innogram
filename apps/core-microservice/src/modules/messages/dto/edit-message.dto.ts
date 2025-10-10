import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EditMessageDto {
  constructor(content: string) {
    this.content = content;
  }

  @ApiProperty({
    example: 'Hello how are you',
    description: 'Content of the message',
  })
  @IsString()
  readonly content: string;
}
