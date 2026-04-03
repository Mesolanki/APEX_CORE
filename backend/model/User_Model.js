const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    password: { type: String, required: false },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetToken: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    // Activity tracking
    enrolledEvents: [{
        eventId:   { type: String },
        eventName: { type: String },
        alias:     { type: String },
        team:      { type: String },
        entryFee:  { type: Number, default: 0 },
        enrolledAt:{ type: Date, default: Date.now }
    }],
    purchasedGames: [{
        gameId:    { type: String },
        gameTitle: { type: String },
        price:     { type: Number, default: 0 },
        image:     { type: String, default: '' },
        purchasedAt:{ type: Date, default: Date.now }
    }]
});

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    if (!this.password) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
module.exports = User;