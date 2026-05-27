import jwt from 'jsonwebtoken';
import '../config/load-env.config';
import { RefreshTokenObj } from '../types/tokens.type';

export class JwtService {
  generateAccessJwt = (profileId: string, role: string): string => {
    const accesstockenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN;
    console.log(`accesstockenExpiresIn: ${accesstockenExpiresIn}`);
    return jwt.sign({ profileId, role }, process.env.JWT_SECRET, {
      expiresIn: accesstockenExpiresIn,
    });
  };

  generateRefreshJwt = (accountId: string): string => {
    const refreshtockenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;
    console.log(`refreshtockenExpiresIn: ${refreshtockenExpiresIn}`);
    return jwt.sign({ accountId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  };

  verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  decodeRefreshTokenPayload(refreshToken: string): RefreshTokenObj | null {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET,
        { ignoreExpiration: true },
      ) as RefreshTokenObj;
      if (!payload?.accountId) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }
}
