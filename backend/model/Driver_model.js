const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driverId: { type: String, default: '' },
    alias: { type: String, required: true },
    rank: { type: Number, default: 0 },
    country: String,
    team: String,
    car: String,
    portrait: String,
    winRate: String,
    status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
