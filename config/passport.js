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
      callbackURL: "http://localhost:8080/api/users/auth/google/callback", // Ensure this matches your backend route
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("- Google Profile:", profile);

        const email = profile.emails?.[0]?.value || null;

        if (!email) {
          console.error("- Google Auth Error: No email received from Google");
          return done(null, false, { message: "No email received from Google" });
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName || "No Name",
            email,
            mobile: "N/A",
            birthdate: new Date("2000-01-01"),
            password: "google-auth",
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
        console.error("- Google Auth Error:", error);
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
