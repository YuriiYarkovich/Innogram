import pool from '../config/db.config.ts';
import bcrypt from 'bcrypt';
import { NextFunction } from 'express';
import { AccountsRepository } from '../repositories/accounts.repository.ts';
import { ApiError } from '../error/api.error.ts';
import '../config/load-env.config.ts';
import redisClient from '../config/redis.init.ts';
import { isEmpty } from 'lodash';
import { JwtService } from './jwt.service.ts';
import { isNumberObject } from 'node:util/types';

export class AuthService {
  readonly accountsRepository: AccountsRepository = new AccountsRepository();
  readonly jwtService: JwtService = new JwtService();

  isLoggedIn(req, res, next: NextFunction) {
    req.user ? next() : res.sendStatus(401);
  }

  async checkIfAccountExist(email: string) {
    const candidate = await this.accountsRepository.findAccountByEmail(email);
    console.log('Founding candidate request executed');
    if (candidate) return { isExist: true, account: candidate };
    return { isExist: false, account: undefined };
  }

  async registerGoogleUser(
    email: string,
    displayName: string,
    provider: string,
  ) {
    try {
      await pool.query(`BEGIN`);
      console.log('transaction begun');
      const createdUser = await this.accountsRepository.createUser();
      console.log(`user created: ${JSON.stringify(createdUser)}`);

      const createdAccount =
        await this.accountsRepository.createAccountWithoutPassword(
          createdUser,
          email,
          provider,
        );
      console.log(`account created: ${JSON.stringify(createdAccount)}`);

      const createdProfile =
        await this.accountsRepository.createProfileFromOAuth(
          createdUser,
          displayName,
        );
      console.log(`profile created: ${JSON.stringify(createdProfile)}`);

      console.log('commit transaction');
      await this.accountsRepository.updateLastLogin(createdAccount.id);
      await pool.query('COMMIT');
      return true;
    } catch (e) {
      console.log('rollback transaction');
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
  ) {
    try {
      await pool.query(`BEGIN`);
      console.log('transaction begun');

      const candidate: { isExist: boolean; account: any } =
        await this.checkIfAccountExist(email);

      if (candidate.isExist) {
        throw ApiError.badRequest('User with this email already exists');
      }

      const hashPassword = await bcrypt.hash(password, 5);

      const createdUser = await this.accountsRepository.createUser();

      const createdAccount = await this.accountsRepository.createAccount(
        createdUser,
        email,
        hashPassword,
      );

      const createdProfile = await this.accountsRepository.createProfile(
        createdUser,
        username,
        displayName,
        birthday,
        bio,
      );

      await this.accountsRepository.updateLastLogin(createdAccount.id);
      await pool.query('COMMIT');

      const accessToken = this.jwtService.generateAccessJwt(
        createdProfile.id,
        createdUser.role,
      );
      const refreshToken = this.jwtService.generateRefreshJwt(
        createdAccount.id,
      );

      const sessionKey = `session:${createdAccount.id}:${deviceId}`;

      await this.setDataToRedis(
        sessionKey,
        refreshToken,
        email,
        createdUser.role,
      );

      return { accessToken, refreshToken };
    } catch (e) {
      console.log('rollback transaction');
      await pool.query(`ROLLBACK`);
      throw e;
    }
  }

  getSessionKey(accountId: string, deviceId: string): string {
    return `session:${accountId}:${deviceId}`;
  }

  async login(email: string, password: string, deviceId: string) {
    const userData = await this.checkIfAccountExist(email);
    if (!userData || !userData.isExist || !userData.account) {
      throw ApiError.badRequest(`User with email not found`);
    }

    let comparedPassword = bcrypt.compareSync(
      password,
      userData.account.password_hash,
    );

    if (!comparedPassword) {
      throw ApiError.badRequest(`Wrong password!`);
    }

    const accountId = userData.account.id;
    const userRole = userData.account.role;

    const sessionKey = this.getSessionKey(accountId, deviceId);
    const existingSession = await redisClient.get(sessionKey);

    let accessToken: string = '';
    let refreshToken: string = '';

    if (existingSession) {
      console.log(`User ${email} already logged in on this device.`);
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
      userData.account.profile_id,
      userRole,
    );

    await this.setDataToRedis(sessionKey, refreshToken, email, userRole);

    console.log(`User ${email} authorized on device ${deviceId}`);
    await this.accountsRepository.updateLastLogin(userData.account.id);
    return { accessToken, refreshToken };
  }

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

  async logout(refreshToken: string) {
    const payload = this.jwtService.verifyToken(refreshToken);
    console.log(`payload in logout method: ${JSON.stringify(payload)}`);
    const accountId = payload.account_id;

    const keys = await redisClient.keys(`session:${accountId}:*`);

    if (!keys.length) {
      console.log(`No active sessions found for account ${accountId}`);
      return false;
    }

    for (const key of keys) {
      const session = JSON.parse((await redisClient.get(key)) || `{}`);
      if (session.refreshToken === refreshToken) {
        await redisClient.del(key);
        console.log(
          `Account ${accountId} logged out from device session ${key}`,
        );
        return true;
      }
    }

    console.log(`Refresh token not found in active sessions`);
    return false;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      console.log(
        `Refreshing access token. Received refresh token: ${refreshToken}`,
      );
      this.jwtService.verifyToken(refreshToken);
      const foundDataFromRedis = await redisClient.get(refreshToken);

      if (!foundDataFromRedis) {
        throw ApiError.forbidden('Invalid refresh token');
      }

      const account = JSON.parse(foundDataFromRedis);

      const user: {
        profileId: string;
        role: string;
      } = { profileId: account.profile_id, role: account.role };

      const newAccessToken = this.jwtService.generateAccessJwt(
        account.profile_id,
        account.role,
      );

      return { user, newAccessToken };
    } catch (e) {
      throw ApiError.forbidden(e.message);
    }
  }

  async validateToken(token: string) {
    try {
      if (!token) throw ApiError.unauthorized('No access token!');

      console.log(`Validating token: ${token}`);
      let decoded: string = '';
      try {
        decoded = this.jwtService.verifyToken(token);
      } catch (e) {
        if (e.name === 'TokenExpiredError') {
          throw ApiError.unauthorized('Access token expired!');
        }
        throw ApiError.unauthorized('Invalid access token!');
      }

      return JSON.stringify(decoded);
    } catch (e) {
      console.log(`Validation method error: ${e}`);
      throw e;
    }
  }
}
