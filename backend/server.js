// 🛠️ ABSOLUTE TOP-LEVEL ERROR CAPTURE (For Render Debugging)
process.on('uncaughtException', (err) => {
    console.error(`\n>>> [FATAL_LOAD_EXCEPTION]: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n>>> [UNHANDLED_REJECTION]:', reason);
});

console.log(`\n>>> [BOOT]: ENGINE_INITIALIZING... (Time: ${new Date().toISOString()})`);
require("dotenv").config();
const express = require("express");
const app = express();

const { connectDB } = require("./config/db.js");
const U_route = require("./routes/User_route.js");
const gameRoute = require("./routes/Game_route.js");
const cors = require("cors");
const passport = require("passport");
const Community_router = require("./routes/Post_route.js");
const paymentRoute = require("./routes/payment_route.js");
const eventRoute = require("./routes/Event_route.js");
const driverRoute = require("./routes/Driver_route.js");
require("./config/passport.js");

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length) {
    console.error(`\n>>> [CRITICAL ERROR]: The following environment variables ARE MISSING: ${missingEnvVars.join(", ")}`);
    console.error(`>>> [System]: Infrastructure cannot initialize. Have you added these to Render?`);
    process.exit(1);
}

// 🛡️ Explicitly connect to database
connectDB();




const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use('/uploads', express.static('uploads'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/community', Community_router);
app.use('/api/payments', paymentRoute);
app.use('/api/games', gameRoute);
app.use('/api/events', eventRoute);
app.use('/api/drivers', driverRoute);
app.use("/user", U_route);

app.get("/backend", (req, res) => res.send("Terminal_Online"));

// 🛠️ USE PORT FROM .ENV
const PORT = process.env.PORT || 8050;
app.listen(PORT, () => console.log(`>>> [System]: Server Online on Port ${PORT}`));