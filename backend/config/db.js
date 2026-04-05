const mongoose = require("mongoose");

// 🛠️ USE URI FROM .ENV
const uri = process.env.MONGO_URI;


// 🛠️ EXPLICIT DB INITIALIZATION
const connectDB = async () => {
    try {
        if (!uri) {
            throw new Error("MONGO_URI_UNDEFINED");
        }
        
        // Log masked URI for verification
        const maskedUri = uri.replace(/\/\/.*@/, "//****:****@").split("?")[0];
        console.log(`>>> [System]: Attempting connection to ${maskedUri}...`);

        await mongoose.connect(uri);
        console.log(">>> [System]: Connection to Database Established");
    } catch (error) {
        console.error(">>> [Critical_Error]: Database Connection Failed:", error.message);
        process.exit(1); 
    }
};

module.exports = { connectDB, connection: mongoose.connection };