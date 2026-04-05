const passport = require('passport');
const User = require('../model/User_Model.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
require("dotenv").config(); // 🛠️ Load env variables

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// 🛠️ AUTOMATIC CALLBACK URL DISCOVERY
const rawUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:8050";
const cleanUrl = rawUrl.replace(/\/+$/, "");
const callbackURL = `${cleanUrl}/user/auth/google/callback`;

if (clientID && clientSecret) {
    console.log(`>>> [System]: Google OAuth Callback URI is: ${callbackURL}`);
    
    passport.use(new GoogleStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL
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
