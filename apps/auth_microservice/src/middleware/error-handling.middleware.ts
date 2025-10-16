import { ApiError as apiError } from '../error/api.error';

export function errorHandlingMiddleware(req, res, err) {
  console.log('Error message in middleware: ' + err.message);
  if (err instanceof apiError) {
    console.log(
      `returning instance of Api error, code: ${err.statusCode}, message: ${err.message}`,
    );
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.log(`returning unknown error`);
  return res.status(500).json({ message: 'Unexpected error!' });
}
