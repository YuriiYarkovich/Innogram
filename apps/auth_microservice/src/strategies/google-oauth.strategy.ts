import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import passport from 'passport';
import { AuthService } from '../services/auth.service.ts';
import '../config/load-env.config.ts';
import { JwtService } from '../services/jwt.service.ts';
import { ApiError } from '../error/api.error.ts';
import { RedisService } from '../services/redis.service.ts';
import { AccountWithProfileId } from '../types/account.types.ts';

const authService: AuthService = new AuthService();
const redisService: RedisService = new RedisService();
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

      const account: AccountWithProfileId | undefined = foundData.isExist
        ? foundData.account
        : (await authService.checkIfAccountExist(profile.email)).account;

      if (!account) {
        throw ApiError.internal();
      }

      newAccessToken = jwtService.generateAccessJwt(
        account.profileId,
        account.role,
      );
      newRefreshToken = jwtService.generateRefreshJwt(account.id);

      const deviceId: string =
        (request.query.deviceId as string) || 'unknown-device';

      const sessionKey: string = authService.getSessionKey(
        account?.id,
        deviceId,
      );
      await redisService.setDataToRedis(
        sessionKey,
        newRefreshToken,
        profile.email,
        account.role,
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
  if (user) done(null, user);
});
