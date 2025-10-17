import jwt from 'jsonwebtoken';
import '../config/load-env.config.ts';

export class JwtService {
  generateAccessJwt = (profile_id, role) => {
    return jwt.sign({ profile_id, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });
  };

  generateRefreshJwt = (account_id) => {
    return jwt.sign({ account_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  };

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
