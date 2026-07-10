import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

function findRootEnv(startDir: string): string | null {
  const env = process.env.NODE_ENV || 'development';
  const envFileName = `.env.${env}`;

  let dir: string = startDir;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // finding specific env file
    const envPath: string = path.join(dir, envFileName);
    if (fs.existsSync(envPath)) {
      return envPath;
    }

    const parentDir: string = path.dirname(dir);
    if (parentDir === dir) {
      return null;
    }

    dir = parentDir;
  }
}

const envPath: string | null = findRootEnv(__dirname);

if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`[dotenv] Loaded environment from ${envPath}`);
  console.log(
    `[dotenv] Running in ${process.env.NODE_ENV || 'development'} mode`,
  );
} else {
  const env = process.env.NODE_ENV || 'development';
  console.warn(`[dotenv] No .env.${env} or .env file found`);
}
