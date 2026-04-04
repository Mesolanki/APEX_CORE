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

const reviewSchema = new mongoose.Schema({
    username:  { type: String, required: true },
    rating:    { type: Number, min: 1, max: 5, required: true },
    comment:   { type: String },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const trackCommSchema = new mongoose.Schema({
    time: String,
    category: String,
    msg: String
}, { _id: false });

const telemetrySchema = new mongoose.Schema({
    label: String,
    value: String,
    trend: String
}, { _id: false });

const releaseSchema = new mongoose.Schema({
    id: String,
    title: String,
    eta: String,
    category: String,
    image: String,
    status: String,
    description: String,
    highlights: [{ type: String }],
    screenshots: [screenshotSchema]
}, { _id: false });

const driverSchema = new mongoose.Schema({
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
    platforms: [{ type: String }],
    downloads:  { type: Number, default: 0 },
    reviews:  [reviewSchema],
    avgRating: { type: Number, default: 0 },
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
        ...richGameFields
    }],
    liveEvents: [{
        id: String,
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
        startsAt: String,
        reviews: [reviewSchema],
        avgRating: { type: Number, default: 0 }
    }],
    upcomingReleases: [releaseSchema],
    systemTelemetry: [telemetrySchema],
    topDrivers: [driverSchema],
    commsLogs: [trackCommSchema]
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);