import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../error/api.error.ts';

export function errorHandlingMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err instanceof Error) {
    console.error('Unhandled error stack:', err.stack);
  } else {
    console.error('Unhandled non-Error thrown:', err);
  }

  return res.status(500).json({ message: 'Unexpected error!' });
}
