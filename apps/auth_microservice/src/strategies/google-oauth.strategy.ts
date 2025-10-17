import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import passport from 'passport';
import { AuthService } from '../services/auth.service.ts';
import '../config/load-env.config.ts';
import { JwtService } from '../services/jwt.service.ts';

const authService: AuthService = new AuthService();
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
      console.log(`received profile: ${JSON.stringify(profile)}`);
      let token: string = '';
      if (foundData.isExist) {
        token = jwtService.generateAccessJwt(
          foundData.account.id,
          foundData.account.email,
          foundData.account.role,
        );
        console.log('Account exists, returning token');
      } else {
        console.log(`New account. Registration operation started!`);
        token = await authService.registerGoogleUser(
          profile.email,
          profile.displayName,
          'google',
        );
      }
      return done(null, { ...profile, token });
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
