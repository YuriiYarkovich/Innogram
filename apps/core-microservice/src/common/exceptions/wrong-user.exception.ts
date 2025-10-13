import { HttpException, HttpStatus } from '@nestjs/common';

export class WrongUserException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
