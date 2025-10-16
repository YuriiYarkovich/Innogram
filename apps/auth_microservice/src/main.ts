import express from 'express';
import router from './routes/index.ts';
import session from 'express-session';
import passport from 'passport';
import { errorHandlingMiddleware } from './middleware/error-handling.middleware.ts';
import './config/load-env.config.ts';
import { initRedis } from './config/redis.init.ts';

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

const start = async () => {
  try {
    await initRedis();
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
