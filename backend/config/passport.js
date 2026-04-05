const passport = require('passport');
const User = require('../model/User_Model.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
require("dotenv").config(); // 🛠️ Load env variables

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientID && clientSecret) {
    passport.use(new GoogleStrategy({
        // 🛠️ USE GOOGLE SECRETS FROM .ENV
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:8050"}/user/auth/google/callback`
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userEmail = profile.emails[0].value;
                let user = await User.findOne({ email: userEmail });

                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.isVerified = true;
                        await user.save();
                    }
                    return done(null, user);
                } else {
                    const newUser = await User.create({
                        username: profile.displayName || userEmail.split('@')[0],
                        email: userEmail,
                        googleId: profile.id,
                        password: crypto.randomBytes(16).toString('hex'),
                        isVerified: true
                    });
                    return done(null, newUser);
                }
            } catch (err) {
                return done(err, null);
            }
        }));
} else {
    console.warn(">>> [Warning]: Google OAuth secrets (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) missing. Identity_Strategy effectively offline.");
}
