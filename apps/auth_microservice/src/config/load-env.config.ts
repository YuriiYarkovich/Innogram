import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

function findRootEnv(startDir: string): string | null {
  let dir: string = startDir;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const envPath: string = path.join(dir, '.env');
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
  console.log(`[dotenv] Loaded .env from ${envPath}`);
} else {
  console.warn('[dotenv] No .env file found');
}
