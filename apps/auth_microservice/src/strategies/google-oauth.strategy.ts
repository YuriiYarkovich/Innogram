import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import passport from 'passport';
import { AuthService } from '../services/auth.service.ts';
import '../config/load-env.config.ts';
import redisClient from '../config/redis.init.ts';
import { JwtService } from '../services/jwt.service.ts';
import { AccountsRepository } from '../repositories/accounts.repository.ts';

const authService: AuthService = new AuthService();
const accountsRepository: AccountsRepository = new AccountsRepository();
const jwtService: JwtService = new JwtService();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      const foundData = await authService.checkIfAccountExist(profile.email);
      console.log(`Received google profile: ${JSON.stringify(profile)}`);
      let newAccessToken: string = '';
      let newRefreshToken: string = '';

      if (foundData.isExist) {
        console.log('Account exists, returning token');
      } else {
        console.log(`New account. Registration operation started!`);
        await authService.registerGoogleUser(
          profile.email,
          profile.displayName,
          'google',
        );
      }

      const account = foundData.isExist
        ? foundData.account
        : (await authService.checkIfAccountExist(profile.email)).account;

      newAccessToken = jwtService.generateAccessJwt(
        account.profile_id,
        account.role,
      );
      newRefreshToken = jwtService.generateRefreshJwt(account.id);

      await redisClient.setEx(
        newRefreshToken,
        900,
        JSON.stringify({ email: account.email, role: account.role }),
      );

      return done(null, {
        ...profile,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
