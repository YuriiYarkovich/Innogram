import { ApiError } from '../error/api.error.ts';
import { JwtService } from '../services/jwt.service.ts';

const jwtService: JwtService = new JwtService();

export async function CheckTokenMiddleware(req, res, next) {
  try {
    const token = req.cookies.accessToken;
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
  } catch (e) {
    console.error(`Auth middleware error: ${e}`);
    throw ApiError.internal('Internal auth error!');
  }
}
