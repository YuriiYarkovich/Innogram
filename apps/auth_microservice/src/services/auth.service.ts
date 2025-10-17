import pool from '../config/db.config.ts';
import bcrypt from 'bcrypt';
import { NextFunction } from 'express';
import { AccountsRepository } from '../repositories/accounts.repository.ts';
import { ApiError } from '../error/api.error.ts';
import '../config/load-env.config.ts';
import redisClient from '../config/redis.init.ts';
import { isEmpty } from 'lodash';
import { JwtService } from './jwt.service.ts';

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
      return this.jwtService.generateAccessJwt(
        createdAccount.id,
        email,
        createdUser.role,
      );
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
  ) {
    try {
      await pool.query(`BEGIN`);
      console.log('transaction begun');

      const candidate: { isExist: boolean; account: any } =
        await this.checkIfAccountExist(email);
      if (candidate.isExist) {
        console.log(
          `Candidate found: ${JSON.stringify(candidate)}, throwing error`,
        );
        throw ApiError.badRequest('User with this email already exists');
      }

      const hashPassword = await bcrypt.hash(password, 5);

      console.log('password hashed');

      const createdUser = await this.accountsRepository.createUser();
      console.log(`user created: ${JSON.stringify(createdUser)}`);

      const createdAccount = await this.accountsRepository.createAccount(
        createdUser,
        email,
        hashPassword,
      );
      console.log(`account created: ${JSON.stringify(createdAccount)}`);

      const createdProfile = await this.accountsRepository.createProfile(
        createdUser,
        username,
        displayName,
        birthday,
        bio,
      );
      console.log(`profile created: ${JSON.stringify(createdProfile)}`);
      console.log('commit transaction');
      await this.accountsRepository.updateLastLogin(createdAccount.id);
      await pool.query('COMMIT');
      return this.jwtService.generateAccessJwt(
        createdAccount.id,
        email,
        createdUser.role,
      );
    } catch (e) {
      console.log('rollback transaction');
      await pool.query(`ROLLBACK`);
      throw e;
    }
  }

  async login(email: string, password: string) {
    const user = await this.checkIfAccountExist(email);
    if (!user.isExist) {
      console.log(`User with email not found, throwing exception!`);
      throw ApiError.badRequest(`User with email not found`);
    }

    let comparedPassword = bcrypt.compareSync(
      password,
      user.account.password_hash,
    );

    console.log('Comparing hash passwords;');
    if (!comparedPassword) {
      console.log(`wrong password, throwing exception`);
      throw ApiError.badRequest(`Wrong password!`);
    }

    let accessToken: string = '';
    let refreshToken: string = '';
    //const userCache = await redisClient.get(accessToken); //TODO move access check into access check middleware
    //if (!token || isEmpty(userCache)) {
    accessToken = this.jwtService.generateAccessJwt(
      user.account.id,
      email,
      user.account.role,
    );
    refreshToken = this.jwtService.generateRefreshJwt(user.account.id);
    await redisClient.setEx(
      accessToken,
      900,
      JSON.stringify({ email, role: user.account.role }),
    );
    await this.accountsRepository.updateLoginRefreshToken(
      user.account.user_id,
      refreshToken,
    );
    //}
    console.log(`User with email ${email} authorized!`);
    await this.accountsRepository.updateLastLogin(user.account.id);
    return { accessToken, refreshToken };
  }

  async logout(token: string) {
    const user = await redisClient.get(token);
    const userData = user ? JSON.parse(user) : null;
    if (!isEmpty(user)) {
      await redisClient.del(token);
      console.log(`User with email: ${userData.email} logged out`);
    }
    return true;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verifyToken(refreshToken);
      const account =
        await this.accountsRepository.findByRefreshToken(refreshToken);

      if (!account) {
        throw ApiError.forbidden('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.generateAccessJwt(
        account.id,
        account.email,
        account.role,
      );

      await redisClient.setEx(
        newAccessToken,
        900,
        JSON.stringify({ email: account.email, role: account.role }),
      );

      return newAccessToken;
    } catch (e) {
      console.error(`Refresh token error: ${e}`);
      throw ApiError.forbidden('Invalid or expired refresh token!');
    }
  }
}
