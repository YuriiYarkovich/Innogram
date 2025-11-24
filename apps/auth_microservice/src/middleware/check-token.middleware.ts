import { ApiError } from '../error/api.error.ts';
import { JwtService } from '../services/jwt.service.ts';
import { Request, Response, NextFunction } from 'express';

const jwtService: JwtService = new JwtService();

export function CheckTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token: string = req.cookies.accessToken;
  if (!token) throw ApiError.unauthorized('No access token!');

  let decoded: string = '';
  try {
    decoded = jwtService.verifyToken(token);
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired!');
    }
    throw ApiError.unauthorized('Invalid access token!');
  }

  req.user = JSON.parse(decoded);
  next();
}
