import pool from '../database/db.config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { join } from 'path';
import dotenv from 'dotenv';
import { NextFunction } from 'express';
import { AccountsRepository } from '../repositories/accounts.repository';

dotenv.config({ path: join(__dirname, '..', '..', '..', '.env') });

export class AuthService {
  readonly accountsRepository: AccountsRepository = new AccountsRepository();

  generateJwt = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

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
      await pool.query('COMMIT');
      return this.generateJwt(createdAccount.id, email, createdUser.role);
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
        throw new Error('User with this email already exists'); //TODO implement exception class and handling
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
      await pool.query('COMMIT');
      return this.generateJwt(createdAccount.id, email, createdUser.role);
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
      throw new Error(`User with email not found`); //TODO implement exception class and handling
    }

    let comparedPassword = bcrypt.compareSync(
      password,
      user.account.password_hash,
    );

    console.log('Comparing hash passwords;');
    if (!comparedPassword) {
      console.log(`wrong password, throwing exception`);
      throw new Error(`Wrong password!`); //TODO implement exception class and handling
    }
    console.log('Account authorized!');
    return this.generateJwt(user.account.id, email, user.account.role);
  }
}
