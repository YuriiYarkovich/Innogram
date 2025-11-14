import jwt from 'jsonwebtoken';
import '../config/load-env.config.ts';

export class JwtService {
  generateAccessJwt = (profileId: string, role: string): string => {
    return jwt.sign({ profileId, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });
  };

  generateRefreshJwt = (accountId: string): string => {
    return jwt.sign({ accountId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  };

  verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
