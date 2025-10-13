import express, { Request, Response } from 'express';
import { createClient } from 'redis';

const redisClient = createClient();
(async () => {
  redisClient.on('error', (err) => {
    console.log(`Redis client error: `, err);
  });

  redisClient.on('ready', () => {
    console.log(`Redis client started!`);
  });
  await redisClient.connect();
  await redisClient.ping();
})();

const app = express();

export default app;
