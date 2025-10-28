import pool from '../config/db.config.ts';
import bcrypt from 'bcrypt';
import { AccountsRepository } from '../repositories/accounts.repository.ts';
import { ApiError } from '../error/api.error.ts';
import '../config/load-env.config.ts';
import redisClient from '../config/redis.init.ts';
import { JwtService } from './jwt.service.ts';
import {
  Account,
  AccountWithProfileId,
  ExistingAccount,
} from '../types/account.types.ts';
import { User } from '../types/user.types.ts';
import { Profile } from '../types/profile.type.ts';
import { RefreshTokenObj } from '../types/tokens.type.ts';
import { RedisNote } from '../types/redis.type.ts';
import { RedisService } from './redis.service.ts';

export class AuthService {
  readonly accountsRepository: AccountsRepository = new AccountsRepository();
  readonly jwtService: JwtService = new JwtService();
  readonly redisService: RedisService = new RedisService();

  async checkIfAccountExist(email: string): Promise<ExistingAccount> {
    const candidate: AccountWithProfileId =
      await this.accountsRepository.findAccountByEmail(email);
    if (candidate) return { isExist: true, account: candidate };
    return { isExist: false, account: undefined };
  }

  async registerGoogleUser(
    email: string,
    displayName: string,
    provider: string,
  ): Promise<boolean> {
    try {
      await pool.query(`BEGIN`);
      const createdUser: User = await this.accountsRepository.createUser();

      const createdAccount: Account =
        await this.accountsRepository.createAccountWithoutPassword(
          createdUser,
          email,
          provider,
        );
      await this.accountsRepository.createProfileFromOAuth(
        createdUser,
        displayName,
      );

      await this.accountsRepository.updateLastLogin(createdAccount.id);
      await pool.query('COMMIT');
      return true;
    } catch (e) {
      await pool.query(`ROLLBACK`);
      throw e;
    }
  }

  async register(
    email: string,
    password: string,
    username: string,
    displayName: string,
    birthday: string,
    bio: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      await pool.query(`BEGIN`);
      console.log('transaction begun');

      const candidate: { isExist: boolean; account: any } =
        await this.checkIfAccountExist(email);

      if (candidate.isExist) {
        throw ApiError.badRequest('User with this email already exists');
      }

      const hashPassword: string = await bcrypt.hash(password, 5);

      const createdUser: User = await this.accountsRepository.createUser();

      const createdAccount: Account =
        await this.accountsRepository.createAccount(
          createdUser,
          email,
          hashPassword,
        );

      const createdProfile: Profile =
        await this.accountsRepository.createProfile(
          createdUser,
          username,
          displayName,
          birthday,
          bio,
        );

      await this.accountsRepository.updateLastLogin(createdAccount.id);
      await pool.query('COMMIT');

      const accessToken: string = this.jwtService.generateAccessJwt(
        createdProfile.id,
        createdUser.role,
      );
      const refreshToken: string = this.jwtService.generateRefreshJwt(
        createdAccount.id,
      );

      const sessionKey = `session:${createdAccount.id}:${deviceId}`;

      await this.redisService.setDataToRedis(
        sessionKey,
        refreshToken,
        email,
        createdUser.role,
      );

      return { accessToken, refreshToken };
    } catch (e) {
      await pool.query(`ROLLBACK`);
      throw e;
    }
  }

  getSessionKey(accountId: string, deviceId: string): string {
    return `session:${accountId}:${deviceId}`;
  }

  async login(
    email: string,
    password: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userData: ExistingAccount = await this.checkIfAccountExist(email);
    if (!userData || !userData.isExist || !userData.account) {
      throw ApiError.badRequest(`User with email not found`);
    }

    let comparedPassword: boolean = bcrypt.compareSync(
      password,
      userData.account.passwordHash,
    );

    if (!comparedPassword) {
      throw ApiError.badRequest(`Wrong password!`);
    }

    const accountId: string = userData.account.id;
    const userRole: string = userData.account.role;

    const sessionKey: string = this.getSessionKey(accountId, deviceId);
    const existingSession: string | null = await redisClient.get(sessionKey);

    let accessToken: string = '';
    let refreshToken: string = '';

    if (existingSession) {
      const sessionData: {
        sessionKey: string;
        refreshToken: string;
        email: string;
        role: string;
      } = JSON.parse(existingSession);
      refreshToken = sessionData.refreshToken;
    } else {
      refreshToken = this.jwtService.generateRefreshJwt(userData.account.id);
    }

    accessToken = this.jwtService.generateAccessJwt(
      userData.account.profileId,
      userRole,
    );

    await this.redisService.setDataToRedis(
      sessionKey,
      refreshToken,
      email,
      userRole,
    );

    await this.accountsRepository.updateLastLogin(userData.account.id);
    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string): Promise<boolean> {
    const redisNote: RedisNote | undefined =
      await this.redisService.findRedisNote(refreshToken);
    if (redisNote) {
      await redisClient.del(redisNote.key);
      return true;
    }

    return false;
  }

  async refreshAccessToken(refreshToken: string) {
    const redisNote: RedisNote | undefined =
      await this.redisService.findRedisNote(refreshToken);

    if (!redisNote) {
      throw ApiError.forbidden('Invalid refresh token');
    }

    const decoded: RefreshTokenObj = this.jwtService.verifyToken(refreshToken);

    const foundProfileIdObject: { profileId: string } =
      await this.accountsRepository.findProfileIdByAccountId(decoded.accountId);

    const profileId: string = foundProfileIdObject.profileId;

    const newAccessToken: string = this.jwtService.generateAccessJwt(
      profileId,
      redisNote.role,
    );

    const user: { profileId: string; role: string } = {
      profileId: profileId,
      role: redisNote.role,
    };
    return { user, newAccessToken };
  }

  validateToken(token: string): string {
    if (!token) throw ApiError.unauthorized('No access token!');

    let decoded: string = '';
    try {
      decoded = this.jwtService.verifyToken(token);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Access token expired!');
      }
      throw ApiError.unauthorized('Invalid access token!');
    }

    return decoded;
  }
}
