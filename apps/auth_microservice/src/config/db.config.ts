import { Pool, PoolConfig } from 'pg';

import { requireEnv } from '../validation/env.validation.ts';

const config: PoolConfig = {
  user: requireEnv(`POSTGRES_USER`),
  password: requireEnv('POSTGRES_PASSWORD'),
  host: requireEnv('POSTGRES_HOST'),
  port: Number(requireEnv('POSTGRES_PORT')),
  database: requireEnv('POSTGRES_DB'),
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const pool: Pool = new Pool(config);

export default pool;
