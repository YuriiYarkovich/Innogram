import redisClient from '../config/redis.init.ts';
import { RedisNote, RedisSessionData } from '../types/redis.type.ts';
import { RefreshTokenObj } from '../types/tokens.type.ts';
import { JwtService } from './jwt.service.ts';
import { requireEnv } from '../validation/env.validation.ts';

export class RedisService {
  readonly jwtService: JwtService = new JwtService();

  async setDataToRedis(
    sessionKey: string,
    refreshToken: string,
    email: string,
    role: string,
  ) {
    await redisClient.setEx(
      sessionKey,
      parseInt(requireEnv(`JWT_REFRESH_EXPIRES_IN`)) * 60,
      JSON.stringify({ refreshToken, email, role }),
    );
  }

  async findRedisNote(refreshToken: string): Promise<undefined | RedisNote> {
    const payload: RefreshTokenObj = this.jwtService.verifyToken(refreshToken);
    const accountId: string = payload.accountId;

    const keys: string[] = await redisClient.keys(`session:${accountId}:*`);

    if (!keys.length) {
      return undefined;
    }

    for (const key of keys) {
      const session: RedisSessionData = JSON.parse(
        (await redisClient.get(key)) || `{}`,
      );
      if (session.refreshToken === refreshToken) {
        return { role: session.role, key };
      }
    }
    return undefined;
  }
}
