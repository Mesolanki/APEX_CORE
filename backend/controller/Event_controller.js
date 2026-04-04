const Event = require("../model/Event_model.js");

const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        // Auto-generate a display ID
        const eventId = `EVT_${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newEvent = new Event({ ...req.body, eventId });
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const joinEvent = async (req, res) => {
    try {
        const { alias, team, userId } = req.body;
        if (!alias) {
            return res.status(400).json({ message: "Alias is required to participate." });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        event.registeredUsers.push({ alias, team: team || 'Independent' });
        event.participants = (event.participants || 0) + 1;
        await event.save();

        // Log enrollment to the user's profile if logged in
        if (userId) {
            try {
                const User = require('../model/User_Model.js');
                const entryFee = parseFloat((event.entryPrize || '0').replace(/[^0-9.]/g, '')) || 0;
                await User.findByIdAndUpdate(userId, {
                    $push: {
                        enrolledEvents: {
                            eventId:   event._id.toString(),
                            eventName: event.target,
                            alias,
                            team:      team || 'Independent',
                            entryFee,
                            enrolledAt: new Date()
                        }
                    }
                });
            } catch (e) {
                console.warn('>>> [Profile Log Warning]: Could not log enrollment to user profile', e.message);
            }
        }

        res.status(200).json({ message: "Successfully enrolled in event!", item: event });
    } catch (error) {
        res.status(500).json({ message: "Failed to enroll", error: error.message });
    }
};

const postReview = async (req, res) => {
    try {
        const { username, rating, comment } = req.body;
        if (!username || !rating) {
            return res.status(400).json({ message: 'Username and rating are required.' });
        }
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.reviews.push({ username, rating: Number(rating), comment });

        // Recalculate average rating
        const total = event.reviews.reduce((sum, r) => sum + r.rating, 0);
        event.avgRating = +(total / event.reviews.length).toFixed(1);

        await event.save();
        res.status(201).json({ message: 'Review submitted!', reviews: event.reviews, avgRating: event.avgRating });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, joinEvent, postReview };

