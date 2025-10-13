import express, { Request, Response } from 'express';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { join } from 'path';
import router from './routes';

dotenv.config({ path: join(__dirname, '..', '..', '..', '.env') });

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

const PORT = process.env.AUTH_SERVICE_PORT;

const app = express();
app.use(`/api`, router);

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(
        `Server is running on port: ${process.env.AUTH_SERVICE_PORT}`,
      );
    });
  } catch (e) {
    console.log(e);
  }
};

start();
