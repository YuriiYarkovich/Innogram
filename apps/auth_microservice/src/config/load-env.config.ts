import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

function findRootEnv(startDir: string): string | null {
  let dir = startDir;

  while (true) {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      return envPath;
    }

    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      return null;
    }

    dir = parentDir;
  }
}

const envPath = findRootEnv(__dirname);

if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`[dotenv] Loaded .env from ${envPath}`);
} else {
  console.warn('[dotenv] No .env file found');
}
