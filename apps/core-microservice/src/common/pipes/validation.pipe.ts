import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
  ValidationError,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

class ValidationException extends HttpException {
  constructor(response) {
    super(response, HttpStatus.BAD_REQUEST);
    this.message = response;
  }

  message: string;
  name: string;
}

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }
    const obj: unknown = plainToInstance(metadata.metatype, value);
    let errors: ValidationError[] = [];
    if (obj instanceof Object) {
      errors = await validate(obj);
    }

    if (errors && errors.length) {
      const messages: string = errors
        .map((err: ValidationError): string =>
          Object.values(err.constraints ?? {}).join(', '),
        )
        .join('; ');

      throw new ValidationException(`Validation failed: ${messages}`);
    }
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
