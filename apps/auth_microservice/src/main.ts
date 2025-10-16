import express from 'express';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { join } from 'path';
import router from './routes';
import session from 'express-session';
import passport from 'passport';
import { errorHandlingMiddleware } from './middleware/error-handling.middleware';

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
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, //TODO change to secure after switching to httpS
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(`/api`, router);
app.use(errorHandlingMiddleware);

const start = () => {
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
