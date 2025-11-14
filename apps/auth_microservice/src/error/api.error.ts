import errorList from './error-list.ts';

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    console.log(`In ApiError constructor. Message: ${message}`);
  }

  static fromError(errorType): ApiError {
    if (!errorList[errorType]) {
      throw new Error(`Unknown error type: ${errorType}`);
    }
    return new ApiError(
      errorList[errorType].code,
      errorList[errorType].message,
    );
  }

  static badRequest(message: string = errorList.BAD_REQUEST.message): ApiError {
    return new ApiError(errorList.BAD_REQUEST.code, message);
  }

  static internal(message: string = errorList.INTERNAL.message): ApiError {
    return new ApiError(errorList.INTERNAL.code, message);
  }

  static forbidden(message: string = errorList.WRONG_ROLE.message): ApiError {
    return new ApiError(errorList.WRONG_ROLE.code, message);
  }

  static unauthorized(
    message: string = errorList.UNAUTHORIZED.message,
  ): ApiError {
    return new ApiError(errorList.UNAUTHORIZED.code, message);
  }

  static notFound(message: string = errorList.NOT_FOUND.message): ApiError {
    return new ApiError(errorList.NOT_FOUND.code, message);
  }
}
