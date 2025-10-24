import jwt from 'jsonwebtoken';
import '../config/load-env.config.ts';

export class JwtService {
  generateAccessJwt = (profileId: string, role: string) => {
    return jwt.sign({ profileId, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });
  };

  generateRefreshJwt = (account_id: string) => {
    return jwt.sign({ account_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  };

  verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
