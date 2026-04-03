const mongoose = require('mongoose');

const POST_CATEGORIES = ['GENERAL', 'EVENTS', 'DRIVERS', 'GARAGE', 'TECH', 'LFG'];

const postSchema = new mongoose.Schema({
    username: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: POST_CATEGORIES,
        default: 'GENERAL'
    },
    mediaUrl: { type: String },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'none'],
        default: 'none'
    },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    comments: [{
        username: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        likes: { type: Number, default: 0 },
        likedBy: { type: [String], default: [] }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);