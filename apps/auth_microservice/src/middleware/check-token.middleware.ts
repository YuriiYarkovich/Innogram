import { ApiError } from '../error/api.error.ts';
import { JwtService } from '../services/jwt.service.ts';
import redisClient from '../config/redis.init.ts';

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

    const userData = await redisClient.get(token);
    if (!userData) {
      throw ApiError.unauthorized('Session expired!');
    }

    req.user = JSON.parse(userData);
    next();
  } catch (e) {
    console.error(`Auth middleware error: ${e}`);
    throw ApiError.internal('Internal auth error!');
  }
}
