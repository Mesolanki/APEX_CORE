const Driver = require("../model/Driver_model.js");

const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ points: -1 });
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDriver = async (req, res) => {
    try {
        const newDriver = new Driver(req.body);
        const savedDriver = await newDriver.save();
        res.status(201).json(savedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateDriver = async (req, res) => {
    try {
        const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDriver) return res.status(404).json({ message: "Driver not found" });
        res.status(200).json(updatedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteDriver = async (req, res) => {
    try {
        const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
        if (!deletedDriver) return res.status(404).json({ message: "Driver not found" });
        res.status(200).json({ message: "Driver deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDrivers, createDriver, updateDriver, deleteDriver };
