import jwt from 'jsonwebtoken';
import '../config/load-env.config.ts';

export class JwtService {
  generateAccessJwt = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });
  };

  generateRefreshJwt = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  };

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
