import { ApiError } from '../error/api.error.ts';

import { Response } from 'express';

export function errorHandlingMiddleware(err: unknown, res: Response) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err instanceof Error) console.log(`returning unknown ${err.stack}`);
  return res.status(500).json({ message: 'Unexpected error!' });
}
