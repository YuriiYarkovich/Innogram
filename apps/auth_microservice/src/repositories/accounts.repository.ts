import pool from '../config/db.config.ts';

export class AccountsRepository {
  async createUser() {
    const createUserQueryResult = await pool.query(`
        INSERT INTO main.users DEFAULT VALUES 
        RETURNING *;
    `);
    return createUserQueryResult.rows[0];
  }

  async createAccount(createdUser, email: string, hashPassword: string) {
    const createAccountQueryResult = await pool.query(
      `INSERT INTO main.accounts (user_id, email, password_hash, created_by)
         VALUES($1, $2, $3, $1)
         RETURNING *;
        `,
      [createdUser.id, email, hashPassword],
    );

    return createAccountQueryResult.rows[0];
  }

  async createAccountWithoutPassword(
    createdUser,
    email: string,
    provider: string,
  ) {
    const createAccountQueryResult = await pool.query(
      `INSERT INTO main.accounts (user_id, email, provider, created_by)
       VALUES ($1, $2, $3, $1)
       RETURNING *;
      `,
      [createdUser.id, email, provider],
    );

    return createAccountQueryResult.rows[0];
  }

  async createProfile(
    createdUser,
    username: string,
    displayName: string,
    birthday: string,
    bio: string,
  ) {
    const createProfileQueryResult = await pool.query(
      `
         INSERT INTO main.profiles (user_id, username, display_name, birthday, bio)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;
        `,
      [createdUser.id, username, displayName, birthday, bio],
    );
    return createProfileQueryResult.rows[0];
  }

  async createProfileFromOAuth(createdUser, displayName: string) {
    const createProfileQueryResult = await pool.query(
      `
        INSERT INTO main.profiles (user_id, username, display_name)
        VALUES ($1, $2, $2)
        RETURNING *;
      `,
      [createdUser.id, displayName],
    );
    return createProfileQueryResult.rows[0];
  }

  async findAccountByEmail(email: string): Promise<{
    id: string;
    email: string;
    password_hash: string;
    user_id: string;
    role: string;
    profile_id: string;
  }> {
    const result = await pool.query<{ id: string; email: string }>(
      `
        SELECT a.id, a.email, a.password_hash, a.user_id, u.role, p.id AS profile_id
        FROM main.accounts AS a
               LEFT JOIN main.users AS u ON a.user_id = u.id
               LEFT JOIN main.profiles AS p ON a.user_id = p.user_id 
        WHERE email = $1
      `,
      [email],
    );
    return result.rows[0];
  }

  async findProfileIdByAccountId(account_id: string) {
    const result = await pool.query(
      `
       SELECT id AS profile_id
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
