import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'dGhpcy1pcy1yZWZyZXNoLXRva2Vu...',
    description: 'Refresh token',
  })
  refreshToken: string;
}
