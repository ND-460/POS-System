const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
require('dotenv').config();
// console.log("- GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
// console.log("- GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // console.log("- Full Google Profile Object:", JSON.stringify(profile, null, 2));

        // - Extract email safely
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        // console.log("- Extracted Email:", email);

        if (!email) {
          console.error("- Google Auth Error: No email received from Google");
          return done(null, false, { message: "No email received from Google" });
        }

        // - Check if user exists in MongoDB
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName || "No Name",
            email: email, // - Now properly extracted
            mobile: "N/A", // Default value since Google doesn't provide mobile
            birthdate: new Date("2000-01-01"), // Default birthdate
            password: "google-auth", // Placeholder password
            role: "customer",
            isVerified: true,
            loyaltyPoints: 0,
            pastOrders: [],
            specialDiscounts: [],
          });

          await user.save();
        }

        console.log("- Google Auth Successful:", user);
        return done(null, user);
      } catch (error) {
        console.error("- Google Auth Database Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


module.exports = passport;
