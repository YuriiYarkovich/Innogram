import redisClient from '../config/redis.init.ts';
import { RedisNote, RedisSessionData } from '../types/redis.type.ts';
import { RefreshTokenObj } from '../types/tokens.type.ts';
import { JwtService } from './jwt.service.ts';

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
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '10080') * 60,
      JSON.stringify({ refreshToken, email, role }),
    );
  }

  async findRedisNote(refreshToken: string): Promise<undefined | RedisNote> {
    const payload: RefreshTokenObj = this.jwtService.verifyToken(refreshToken);
    console.log(
      `payload in find redis note method: ${JSON.stringify(payload)}`,
    );
    const accountId: string = payload.accountId;

    const keys: string[] = await redisClient.keys(`session:${accountId}:*`);

    if (!keys.length) {
      console.log(`No active sessions found for account ${accountId}`);
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
