import { NextFunction } from 'express';
import pool from '../database/db.config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '..', '..', '..', '.env') });

interface Account {
  id: string;
  email: string;
}

export class AuthService {
  generateJwt = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

  async register(
    email: string,
    password: string,
    username: string,
    displayName: string,
    birthday: string,
    bio: string,
    next: NextFunction,
  ) {
    try {
      await pool.query(`BEGIN`);
      console.log('transaction begun');
      const result = await pool.query<{ id: string; email: string }>(
        `SELECT id, email FROM main.accounts
       WHERE email=$1
      `,
        [email],
      );
      const candidate = result.rows[0];
      console.log('Founding candidate request executed');
      if (candidate) {
        console.log(
          `Candidate found: ${JSON.stringify(candidate)}, throwing error`,
        );
        throw new Error('User with this email already exists'); //TODO implement errors handling
      }

      const hashPassword = await bcrypt.hash(password, 5);

      console.log('password hashed');
      const createUserQueryResult = await pool.query(`
        INSERT INTO main.users DEFAULT VALUES 
        RETURNING *;
    `);
      const createdUser = createUserQueryResult.rows[0];
      console.log(`user created: ${JSON.stringify(createdUser)}`);
      const createAccountQueryResult = await pool.query(
        `INSERT INTO main.accounts (user_id, email, password_hash, created_by)
         VALUES($1, $2, $3, $4)
         RETURNING *;
        `,
        [createdUser.id, email, hashPassword, createdUser.id],
      );
      const createdAccount = createAccountQueryResult.rows[0];
      console.log(`account created: ${JSON.stringify(createdAccount)}`);
      const createProfileQueryResult = await pool.query(
        `
         INSERT INTO main.profiles (user_id, username, display_name, birthday, bio)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;
        `,
        [createdUser.id, username, displayName, birthday, bio],
      );
      const createdProfile = createProfileQueryResult.rows[0];
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
}
