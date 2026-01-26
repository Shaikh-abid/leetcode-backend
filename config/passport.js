import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import User from "../modals/UserModal.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      proxy: true // 👈 ADD THIS LINE (Crucial for Render)
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user); // User found, proceed
        }

        // 2. Check if email exists (link Google to existing email account)
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // 3. Create new user
        const newUser = new User({
          username:
            profile.displayName.split(" ").join("").toLowerCase() +
            Math.floor(Math.random() * 1000), // Generate unique username
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0].value,
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);


export default passport;
