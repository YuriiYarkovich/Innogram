import { ApiError } from '../error/api.error.ts';
import { Request, NextFunction, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';

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

export function handleError(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Data validation error!',
      errors: errors.array().map((e: ValidationError) => ({
        field: (e as any).param ?? (e as any).location ?? 'unknown',
        message: e.msg,
      })),
    });
  }
  next();
}
