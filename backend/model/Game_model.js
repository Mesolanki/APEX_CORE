const mongoose = require('mongoose');

const specsSchema = new mongoose.Schema({
    os: String,
    cpu: String,
    ram: String,
    gpu: String,
    storage: String
}, { _id: false });

const screenshotSchema = new mongoose.Schema({
    category: String,
    url: String
}, { _id: false });

const participantSchema = new mongoose.Schema({
    alias: String,
    team: String,
    enrolledAt: { type: Date, default: Date.now }
}, { _id: false });

const richGameFields = {
    releaseDate: String,
    screenshots: [screenshotSchema],
    description: String,
    highlights: [{ type: String }],
    minSpecs: specsSchema,
    recommendedSpecs: specsSchema,
    downloadSize: String,
    version: String,
    platforms: [{ type: String }]
};

const gameSchema = new mongoose.Schema({
    featuredAsset: {
        id: String,
        title: String,
        tagline: String,
        price: String,
        image: String,
        ...richGameFields
    },
    globalMarket: [{
        id: String,
        title: String,
        genre: String,
        price: String,
        image: String,
        developer:  { type: String, default: '' },
        publisher:  { type: String, default: '' },
        downloads:  { type: Number, default: 0 },
        ...richGameFields
    }],
    liveEvents: [{
        target: String,
        prize: String,
        class: String,
        status: String,
        description: String,
        host: String,
        hostTag: String,
        hostAvatar: String,
        winner: String,
        winnerAlias: String,
        winnerTime: String,
        runnerUp: String,
        videoUrl: String,
        coverImage: String,
        screenshots: [screenshotSchema],
        participants: Number,
        registeredUsers: [participantSchema],
        region: String,
        startsAt: String
    }],
    upcomingReleases: [{
        id: String,
        title: String,
        eta: String,
        type: String,
        image: String,
        status: String,
        description: String,
        highlights: [{ type: String }],
        screenshots: [screenshotSchema]
    }],
    systemTelemetry: [{ label: String, value: String, trend: String }],
    topDrivers: [{
        rank: String,
        alias: String,
        time: String,
        car: String,
        team: String,
        country: String,
        portrait: String,
        bio: String,
        wins: String,
        podiums: String,
        videoUrl: String,
        screenshots: [screenshotSchema],
        signatureTrack: String
    }],
    trackComms: [{ time: String, type: String, msg: String }]
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);