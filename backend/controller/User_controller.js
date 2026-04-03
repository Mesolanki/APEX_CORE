const User = require("../model/User_Model.js");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper to ensure token generation doesn't crash if SECRET_KEY is missing
const generateToken = (userId, email) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error("JWT_SECRET_MISSING: Check your .env file");
    }
    // Always store a string id so JWT decode matches Mongo _id.toString() and likedBy[]
    return jwt.sign({ id: String(userId), email: email }, secretKey, { expiresIn: "1h" });
};

const addUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!username || !normalizedEmail || !password) {
            return res.status(400).json({ message: "Missing_Required_Fields" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password_Too_Short" });
        }
        const existingUser = await User.findOne({ email: normalizedEmail });
        
        if (existingUser) {
            return res.status(400).json({ message: "Email_Already_Exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: normalizedEmail,
            subject: 'GRID_OS: Your Ignition Key (OTP)',
            html: `
                <div style="font-family: monospace; background-color: #050505; color: #fff; padding: 20px;">
                    <h1 style="color: #dc2626;">GRID_OS SECURITY</h1>
                    <p>Driver ${username}, your telemetry registration requires verification.</p>
                    <p>Your 6-digit Ignition Key is: <strong style="color: #06b6d4; font-size: 24px;">${otp}</strong></p>
                    <p>This code expires in 10 minutes.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        // Note: Password hashing is handled by the Pre-Save hook in User_Model.js
        await User.create({
            username,
            email: normalizedEmail,
            password,
            otp,
            otpExpires
        });

        res.status(201).json({ message: "User_Created_Verify_OTP" });
    } catch (error) {
        console.error(">>> [Registration_Error]:", error);
        return res.status(500).json({ message: "Registration_System_Failure" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: "Missing_Required_Fields" });
        }
        
        // 1. Find the user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "Identity_Not_Found" });
        }

        // 2. Check verification status
        if (!user.isVerified) {
            return res.status(401).json({ message: "Account_Not_Verified" });
        }

        // 3. Compare Password
        // Accounts created via OAuth may not have a local password set
        if (!user.password) {
            return res.status(401).json({ message: "Use_Google_Login" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credential_Mismatch" });
        }

        // 4. Generate Token
        const token = generateToken(user._id, user.email);
        
        return res.status(200).json({ 
            message: "Login_Successful", 
            token 
        });
    } catch (error) {
        // This log will appear in your SERVER terminal to tell you why the 500 happened
        console.error(">>> [Critical_Auth_Failure]:", error.message);
        return res.status(500).json({ 
            message: "Auth_Engine_Failure", 
            error: error.message 
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid_or_Expired_OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = generateToken(user._id, user.email);
        res.status(200).json({ message: "Identity_Verified", token });
    } catch (error) {
        console.error(">>> [OTP_Error]:", error);
        res.status(500).json({ message: "Verification_System_Failure" });
    }
};
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(403).send("Access_Denied");

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) return res.status(500).send("JWT_SECRET_MISSING");
        const verified = jwt.verify(token, secretKey);
        if (verified?.id != null) verified.id = String(verified.id);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(401).send("Invalid_Token");
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user) return res.status(400).send("Invalid or expired token.");

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.redirect('http://localhost:5173/login?verified=true');
    } catch (error) {
        res.status(500).send("Verification_System_Failure");
    }
};

const googleAuthCallBack = async (req, res) => {
    try {
        const user = req.user;
        const token = generateToken(user._id, user.email);

        res.redirect(`http://localhost:5173/google-callback?token=${token}`);
    } catch (error) {
        console.error("Google_Auth_Callback_Error:", error);
        res.redirect(`http://localhost:5173/login?error=auth_failed`);
    }
};

const getUser = async (req, res) => {
    const data = await User.find({});
    return res.send(data);
};

// GET /user/profile — returns the logged-in user's full profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otpExpires -resetToken');
        if (!user) return res.status(404).json({ message: 'User_Not_Found' });

        const totalSpent = [
            ...user.enrolledEvents.map(e => e.entryFee || 0),
            ...user.purchasedGames.map(g => g.price || 0),
        ].reduce((sum, v) => sum + v, 0);

        return res.status(200).json({ user, totalSpent });
    } catch (error) {
        console.error('>>> [Profile_Error]:', error);
        return res.status(500).json({ message: 'Profile_Fetch_Failed' });
    }
};

// PATCH /user/profile — update username, avatar, bio
const updateProfile = async (req, res) => {
    try {
        const { username, avatar, bio } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username, avatar, bio },
            { new: true, runValidators: true }
        ).select('-password -otp -otpExpires -resetToken');
        return res.status(200).json({ message: 'Profile_Updated', user });
    } catch (error) {
        return res.status(500).json({ message: 'Update_Failed' });
    }
};

// PATCH /user/profile-purchase — log a game purchase
const recordPurchase = async (req, res) => {
    try {
        const { gameId, gameTitle, price, image } = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                purchasedGames: { gameId, gameTitle, price: parseFloat(price) || 0, image, purchasedAt: new Date() }
            }
        });
        return res.status(200).json({ message: 'Purchase_Recorded' });
    } catch (error) {
        return res.status(500).json({ message: 'Record_Failed' });
    }
};

const deleteUser = async (req, res) => {
    const id = req.params.id;
    const data = await User.findByIdAndDelete(id);
    return res.send({ message: "Identity_Purged", data });
};

const updatUser = async (req, res) => {
    const id = req.params.id;
    const data = await User.findByIdAndUpdate(id, req.body, { new: true });
    return res.send(data);
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) return res.status(404).json({ message: "Identity_Not_Found" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetToken = resetToken;
        await user.save();

        console.log(`>>> [System]: Reset Token for ${normalizedEmail}: ${resetToken}`);

        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: normalizedEmail,
            subject: 'GRID_OS: Ignition Key Recovery',
            html: `
                <div style="font-family: monospace; background-color: #050505; color: #fff; padding: 20px; border: 1px solid #7f1d1d; border-radius: 8px;">
                    <h1 style="color: #dc2626; text-transform: uppercase; font-style: italic;">GRID_OS <span style="color: #fff;">SECURITY</span></h1>
                    <p>Driver, a request to dispatch spare keys was initiated.</p>
                    <p>Click the secure link below to install a new ignition code:</p>
                    <a href="${resetLink}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-top: 15px; border-radius: 4px;">INSTALL NEW KEYS</a>
                    <p style="margin-top: 25px; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">If you did not request this, abort and ignore this transmission.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`>>> [System]: Recovery transmission dispatched to ${normalizedEmail}`);

        res.status(200).json({ message: "Recovery_Link_Sent" });
    } catch (error) {
        console.error(">>> [Recovery_System_Error]:", error);
        res.status(500).json({ message: "Recovery_System_Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({ resetToken: token });

        if (!user) return res.status(400).json({ message: "Invalid_or_Expired_Token" });

        user.password = newPassword;
        user.resetToken = undefined;
        await user.save();

        res.status(200).json({ message: "Access_Key_Updated" });
    } catch (error) {
        res.status(500).json({ message: "Reset_Failure" });
    }
};

const adminSignup = async (req, res) => {
    try {
        const { username, email, password, adminSecret } = req.body;
        const normalizedEmail = normalizeEmail(email);
        
        // Optional: Simple secret key check if you want to restrict who can create an admin
        // if (adminSecret !== 'supersecretkey') return res.status(403).json({ message: "Invalid_Secret" });

        if (!username || !normalizedEmail || !password) return res.status(400).json({ message: "Missing_Required_Fields" });
        if (password.length < 6) return res.status(400).json({ message: "Password_Too_Short" });

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) return res.status(400).json({ message: "Email_Already_Exists" });

        await User.create({
            username,
            email: normalizedEmail,
            password,
            isVerified: true, // Auto-verify admin
            role: 'admin'
        });

        res.status(201).json({ message: "Admin_Created_Successfully" });
    } catch (error) {
        console.error(">>> [Admin_Reg_Error]:", error);
        res.status(500).json({ message: "System_Failure", error: error.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password) return res.status(400).json({ message: "Missing_Required_Fields" });

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(404).json({ message: "Identity_Not_Found" });
        if (user.role !== 'admin') return res.status(403).json({ message: "Access_Denied_Not_Admin" });
        if (!user.isVerified) return res.status(401).json({ message: "Account_Not_Verified" });
        if (!user.password) return res.status(401).json({ message: "Use_Google_Login" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Credential_Mismatch" });

        const token = generateToken(user._id, user.email);
        return res.status(200).json({ message: "Admin_Login_Successful", token, user: { username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        console.error(">>> [Admin_Auth_Error]:", error.message);
        return res.status(500).json({ message: "Auth_Engine_Failure", error: error.message });
    }
};

module.exports = { 
    addUser, login, verifyOTP, 
    getUser, deleteUser, updatUser, verifyToken, googleAuthCallBack, forgotPassword, resetPassword, verifyEmail,
    adminLogin, adminSignup, getProfile, updateProfile, recordPurchase
};