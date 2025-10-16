import { createClient } from 'redis';

const redisClient = createClient();

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
