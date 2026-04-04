const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    alias:      String,
    team:       String,
    enrolledAt: { type: Date, default: Date.now }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
    username:  { type: String, required: true },
    rating:    { type: Number, min: 1, max: 5, required: true },
    comment:   { type: String },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const eventSchema = new mongoose.Schema({
    // Auto-generated display ID
    eventId:      { type: String, default: '' },
    // Basic Info
    target:       { type: String, required: true },  // Event title/codename
    description:  String,
    status:       { type: String, default: 'Upcoming', enum: ['Upcoming', 'LIVE', 'Completed', 'Cancelled'] },
    eventType:    { type: String, default: 'Online', enum: ['Online', 'Offline', 'Hybrid'] },
    class:        { type: String, default: 'UNCLASSIFIED' },  // e.g tournament tier

    // Organizer / Company
    organizerName:    { type: String, default: '' },
    organizerLogo:    { type: String, default: '' },  // URL
    organizerWebsite: { type: String, default: '' },
    organizerEmail:   { type: String, default: '' },
    organizerPhone:   { type: String, default: '' },

    // Schedule & Location
    startDate:    { type: Date },
    endDate:      { type: Date },
    region:       { type: String, default: 'GLOBAL' },
    venue:        { type: String, default: '' },  // Physical venue or platform name

    // Prizes & Fees
    entryPrize:   { type: String, default: 'Free' },
    winningPrize: { type: String, default: 'TBD' },
    prizePool:    { type: String, default: '' },  // e.g "$10,000"
    prize:        { type: String, default: '' },  // legacy field

    // Media — No video, only photos
    coverImage:   { type: String, default: '' },
    photos:       [{ type: String }],  // Array of photo URLs

    // Participants & Registration
    maxParticipants:  { type: Number, default: 0 },
    participants:     { type: Number, default: 0 },
    registeredUsers:  [participantSchema],

    // Host (legacy)
    host:         { type: String, default: '' },
    hostTag:      { type: String, default: '' },
    hostAvatar:   { type: String, default: '' },

    // Podium (legacy)
    winner:       { type: String, default: '' },
    winnerAlias:  { type: String, default: '' },
    winnerTime:   { type: String, default: '' },
    runnerUp:     { type: String, default: '' },

    // Reviews
    reviews:  [reviewSchema],
    avgRating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
