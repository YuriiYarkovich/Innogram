import { ApiError } from '../error/api.error.ts';
import { Request, NextFunction, Response } from 'express';
import {
  FieldValidationError,
  Result,
  ValidationError,
  validationResult,
} from 'express-validator';

export function errorHandlingMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ApiError) {
    console.log(
      `returning instance of Api error, code: ${err.statusCode}, message: ${err.message}`,
    );
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err instanceof Error) console.log(`returning unknown ${err.stack}`);
  return res.status(500).json({ message: 'Unexpected error!' });
}
