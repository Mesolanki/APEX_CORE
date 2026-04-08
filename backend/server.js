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
const mongoose = require("mongoose");
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

// 🩺 SYSTEM DIAGNOSTICS ROUTE (For Render Debugging)
app.get("/api/diagnostics", (req, res) => {
    res.json({
        status: "RUNNING",
        database: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
        environment: {
            PORT: process.env.PORT || "8050",
            FRONTEND_URL: process.env.FRONTEND_URL ? "SET" : "MISSING",
            ADMIN_URL: process.env.ADMIN_URL ? "SET" : "MISSING",
            JWT_SECRET: process.env.JWT_SECRET ? "SET" : "MISSING",
            MONGO_URI: process.env.MONGO_URI ? "SET" : "MISSING",
            EMAIL_STRATEGY: (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? "ONLINE" : "OFFLINE"
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});




const path = require("path");

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL
].filter(Boolean);

console.log(`>>> [System]: Allowed Origins initialized: ${allowedOrigins.join(", ") || "NONE (Localhost ONLY)"}`);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const isRender = origin.includes("onrender.com");
        const isLocal = origin.startsWith("http://localhost");

        if (isRender || isLocal || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`>>> [Security]: Blocked request from unauthorized origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/community', Community_router);
app.use('/api/payments', paymentRoute);
app.use('/api/games', gameRoute);
app.use('/api/events', eventRoute);
app.use('/api/drivers', driverRoute);
app.use("/user", U_route);

app.get("/", (req, res) => {
    res.json({ message: "APEX_CORE_API_ONLINE", time: new Date().toISOString() });
});

app.get("/diagnostics", (req, res) => res.redirect("/api/diagnostics"));

app.get("/backend", (req, res) => {
    console.log(`>>> [Ping]: Health connection received at ${new Date().toISOString()}`);
    res.send("Terminal_Online");
});

// 🛠️ CATCH-ALL 404 for debugging
app.use((req, res) => {
    console.warn(`>>> [404 Error]: ${req.method} ${req.url} was not found on this server.`);
    res.status(404).json({ 
        error: "Route_Not_Found", 
        path: req.url,
        instruction: "Ensure you are targeting the BACKEND URL, not the frontend."
    });
});

// 🛠️ USE SYSTEM PORT (CRITICAL FOR RENDER PROXY)
const PORT = process.env.PORT || 8050;

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n*****************************************`);
            console.log(`>>> [System]: Server Online on Port ${PORT}`);
            console.log(`>>> [System]: Listening on 0.0.0.0 (Public)`);
            console.log(`*****************************************\n`);
        });
    } catch (err) {
        console.error(">>> [Fatal]: Server failed to start due to DB connection error.");
        process.exit(1);
    }
}

startServer();

// 💓 Heartbeat to prevent log silence
setInterval(() => {
    console.log(`>>> [Heartbeat]: API is healthy at ${new Date().toISOString()}`);
}, 60000);