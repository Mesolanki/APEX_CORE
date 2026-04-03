const express = require("express");
const passport = require("passport");

const { addUser, getUser, deleteUser, updatUser, verifyToken, login, googleAuthCallBack, forgotPassword, resetPassword, verifyEmail, verifyOTP, adminLogin, adminSignup, getProfile, updateProfile, recordPurchase } = require("../controller/User_controller.js");

const U_route = express.Router();

U_route.post("/signup", addUser);
U_route.post("/Signup", addUser);
U_route.post("/forgot-password", forgotPassword);
U_route.post("/reset-password", resetPassword);
U_route.post("/login", login);
U_route.post("/admin-login", adminLogin);
U_route.post("/admin-signup", adminSignup);
U_route.get("/verify-email", verifyEmail);
U_route.get("/", verifyToken, getUser);
U_route.get("/profile", verifyToken, getProfile);
U_route.patch("/profile", verifyToken, updateProfile);
U_route.patch("/profile-purchase", verifyToken, recordPurchase);
U_route.delete("/:id", verifyToken, deleteUser);
U_route.patch("/:id", verifyToken, updatUser);
U_route.post("/verify-otp", verifyOTP);

    
U_route.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
U_route.get("/auth/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "http://localhost:5173/login?error=account_not_found"
    }),
    googleAuthCallBack
);
module.exports = U_route;