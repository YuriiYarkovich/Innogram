import pool from '../config/db.config.ts';
import { User } from '../types/user.types.ts';
import { Account, AccountWithProfileId } from '../types/account.types.ts';
import { QueryResult } from 'pg';
import { Profile } from '../types/profile.type.ts';

export class AccountsRepository {
  async createUser(): Promise<User> {
    const createUserQueryResult: QueryResult<User> = await pool.query(`
        INSERT INTO main.users DEFAULT VALUES 
        RETURNING id, role;
    `);
    return createUserQueryResult.rows[0];
  }

  async createAccount(
    createdUser: User,
    email: string,
    hashPassword: string,
  ): Promise<Account> {
    const createAccountQueryResult: QueryResult<Account> = await pool.query(
      `INSERT INTO main.accounts (user_id, email, password_hash, created_by)
         VALUES($1, $2, $3, $1)
         RETURNING id, user_id AS userId, email, provider;
        `,
      [createdUser.id, email, hashPassword],
    );

    return createAccountQueryResult.rows[0];
  }

  async createAccountWithoutPassword(
    createdUser: User,
    email: string,
    provider: string,
  ): Promise<Account> {
    const createAccountQueryResult: QueryResult<Account> = await pool.query(
      `INSERT INTO main.accounts (user_id, email, provider, created_by)
       VALUES ($1, $2, $3, $1)
       RETURNING *;
      `,
      [createdUser.id, email, provider],
    );

    return createAccountQueryResult.rows[0];
  }

  async createProfile(
    createdUser: User,
    username: string,
    displayName: string,
    birthday: string,
    bio: string,
  ): Promise<Profile> {
    const createProfileQueryResult: QueryResult<Profile> = await pool.query(
      `
        INSERT INTO main.profiles (user_id, username, display_name, birthday, bio)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id AS userId, username, display_name AS displayName, 
          birthday, bio, avatar_url AS avatarUrl, is_public AS isPublic, deleted;
      `,
      [createdUser.id, username, displayName, birthday, bio],
    );
    return createProfileQueryResult.rows[0];
  }

  async createProfileFromOAuth(
    createdUser: User,
    displayName: string,
  ): Promise<Profile> {
    const createProfileQueryResult: QueryResult<Profile> = await pool.query(
      `
        INSERT INTO main.profiles (user_id, username, display_name)
        VALUES ($1, $2, $2)
        RETURNING id, user_id AS userId, username, display_name AS displayName,
          birthday, bio, avatar_url AS avatarUrl, is_public AS isPublic, deleted;
      `,
      [createdUser.id, displayName],
    );
    return createProfileQueryResult.rows[0];
  }

  async findAccountByEmail(email: string): Promise<AccountWithProfileId> {
    const result: QueryResult<AccountWithProfileId> = await pool.query(
      `
        SELECT a.id, a.email, a.user_id AS userId, u.role, p.id AS profileId
        FROM main.accounts AS a
               LEFT JOIN main.users AS u ON a.user_id = u.id
               LEFT JOIN main.profiles AS p ON a.user_id = p.user_id 
        WHERE email = $1
      `,
      [email],
    );
    return result.rows[0];
  }

  async findProfileIdByAccountId(
    account_id: string,
  ): Promise<{ profileId: string }> {
    const result: QueryResult<{ profileId: string }> = await pool.query(
      `
       SELECT id AS profileId
       FROM main.profiles
       WHERE user_id=(SELECT user_id FROM main.accounts WHERE id=$1)
      `,
      [account_id],
    );

    return result.rows[0];
  }

  async updateLastLogin(accountId: string) {
    await pool.query(
      `
       UPDATE main.accounts
       SET last_login_at=NOW()
       WHERE id=$1
      `,
      [accountId],
    );
  }
}
