import { createClient } from 'redis';
import { requireEnv } from '../validation/env.validation';

const redisUrl: string | undefined = requireEnv('REDIS_URL');
const redisClient = createClient({
  url: redisUrl ? redisUrl : 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.on('ready', () => {
  console.log('Redis client started!');
});

export async function initRedis() {
  await redisClient.connect();
  await redisClient.ping();
  return redisClient;
}

export default redisClient;
