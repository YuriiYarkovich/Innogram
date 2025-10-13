import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): any {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error(
      `Exception: ${exception.message}, status: ${exception.status}, stack: ${exception.stack}`,
    );

    const responseBody = {
      status: httpStatus,
      message: `Internal server error`,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
