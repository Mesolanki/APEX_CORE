const Game = require('../model/Game_model');

const seedGameData = async (req, res) => {
    try {
        await Game.deleteMany();

        const minS = { os: "Windows 10/11 (64-bit)", cpu: "Intel Core i5-8400 / AMD Ryzen 5 2600", ram: "8 GB", gpu: "NVIDIA GTX 1060 6GB / AMD RX 580", storage: "25 GB SSD" };
        const recS = { os: "Windows 11 (64-bit)", cpu: "Intel Core i7-10700K / AMD Ryzen 7 3700X", ram: "16 GB", gpu: "NVIDIA RTX 3060 / AMD RX 6700 XT", storage: "25 GB NVMe SSD" };

        const catsList = ["GAMEPLAY", "CINEMATIC", "UI", "ENVIRONMENT"];
        const getCat = () => catsList[Math.floor(Math.random() * catsList.length)];

        // 🏎️ 50 UNIQUE CARS DATA GENERATOR
        const carModels = [
            { title: "NISSAN SKYLINE GT-R R34", genre: "STREET_ARCADE" }, { title: "TOYOTA SUPRA MK4", genre: "STREET_ARCADE" },
            { title: "MAZDA RX-7 FD3S", genre: "STREET_ARCADE" }, { title: "HONDA NSX TYPE-R", genre: "SIMULATOR" },
            { title: "PORSCHE 911 GT3 RS", genre: "SIMULATOR" }, { title: "FERRARI 488 PISTA", genre: "SIMULATOR" },
            { title: "MCLAREN 720S", genre: "SIMULATOR" }, { title: "LAMBORGHINI HURACAN EVO", genre: "SIMULATOR" },
            { title: "FORD MUSTANG SHELBY GT500", genre: "STREET_ARCADE" }, { title: "CHEVROLET CORVETTE C8", genre: "SIMULATOR" },
            { title: "SUBARU WRX STI '04", genre: "OFF_ROAD" }, { title: "MITSUBISHI LANCER EVO X", genre: "OFF_ROAD" },
            { title: "AUDI R8 V10 PLUS", genre: "SIMULATOR" }, { title: "BMW M4 COMPETITION", genre: "STREET_ARCADE" },
            { title: "MERCEDES-AMG GT R", genre: "SIMULATOR" }, { title: "ASTON MARTIN VANTAGE", genre: "SIMULATOR" },
            { title: "PAGANI HUAYRA BC", genre: "SIMULATOR" }, { title: "KOENIGSEGG JESKO", genre: "SIMULATOR" },
            { title: "BUGATTI CHIRON PUR SPORT", genre: "SIMULATOR" }, { title: "FORD F-150 RAPTOR", genre: "OFF_ROAD" },
            { title: "RAM 1500 TRX", genre: "OFF_ROAD" }, { title: "LANCIA STRATOS HF", genre: "RETRO_RACER" },
            { title: "AUDI SPORT QUATTRO S1", genre: "RETRO_RACER" }, { title: "FERRARI F40", genre: "RETRO_RACER" },
            { title: "LAMBORGHINI COUNTACH 5000QV", genre: "RETRO_RACER" }, { title: "DELOREAN DMC-12", genre: "RETRO_RACER" },
            { title: "TOYOTA AE86 TRUENO", genre: "RETRO_RACER" }, { title: "NISSAN SILVIA S15", genre: "STREET_ARCADE" },
            { title: "HONDA S2000", genre: "STREET_ARCADE" }, { title: "MAZDA MX-5 MIATA", genre: "STREET_ARCADE" },
            { title: "DODGE CHALLENGER SRT HELLCAT", genre: "STREET_ARCADE" }, { title: "DODGE VIPER ACR", genre: "SIMULATOR" },
            { title: "FORD GT '05", genre: "RETRO_RACER" }, { title: "MCLAREN F1", genre: "SIMULATOR" },
            { title: "PORSCHE CARRERA GT", genre: "RETRO_RACER" }, { title: "JAGUAR VALKYRIE", genre: "SIMULATOR" },
            { title: "ALFA ROMEO DELTA", genre: "RETRO_RACER" }, { title: "PEUGEOT 205 T16", genre: "OFF_ROAD" },
            { title: "FORD BRONCO BADLANDS", genre: "OFF_ROAD" }, { title: "JEEP WRANGLER RUBICON", genre: "OFF_ROAD" },
            { title: "SUBARU BRZ '22", genre: "STREET_ARCADE" }, { title: "TOYOTA GR86", genre: "STREET_ARCADE" },
            { title: "NISSAN Z '23", genre: "STREET_ARCADE" }, { title: "BMW M3 E46", genre: "RETRO_RACER" },
            { title: "MERCEDES-BENZ 190E", genre: "RETRO_RACER" }, { title: "VOLKSWAGEN GOLF R", genre: "STREET_ARCADE" },
            { title: "RENAULT 5 TURBO", genre: "OFF_ROAD" }, { title: "LOTUS SENNA", genre: "SIMULATOR" },
            { title: "ASTON MARTIN DB11", genre: "STREET_ARCADE" }, { title: "FERRARI LAFERRARI", genre: "SIMULATOR" }
        ];

        // High-quality Unsplash image pools for cover and screenshots
        const imagePool = [
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200",
            "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1200",
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200",
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200",
            "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=1200",
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200",
            "https://images.unsplash.com/photo-1611821064430-0d40221e95cf?q=80&w=1200",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200",
            "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?q=80&w=1200"
        ];

        // Generate 50 global market items
        const generatedMarket = carModels.map((car, index) => {
            const isFree = Math.random() > 0.85;
            const price = isFree ? "FREE" : `$${(Math.random() * 15 + 2).toFixed(2)}`;
            
            const screenshots = [];
            for (let i = 0; i < 3; i++) {
                screenshots.push({
                    category: getCat(),
                    url: imagePool[Math.floor(Math.random() * imagePool.length)]
                });
            }

            // Coordination with frontend mock data IDs
            const id = index < 6 
                ? `SYS-0${index + 1}` 
                : `CHASSIS_${(index + 1).toString().padStart(3, '0')}`;

            return {
                id,
                title: car.title,
                genre: car.genre,
                price: price,
                image: imagePool[index % imagePool.length],
                description: `Fully modeled exterior and interior with custom aerodynamics, ECU tuning capabilities, and 4K livery support for ${car.title}.`,
                highlights: [
                    "Laser-scanned dimensions",
                    "Dynamic tire degradation",
                    "Custom exhaust notes mapping"
                ],
                downloadSize: `~${(Math.random() * 5 + 1).toFixed(1)} GB`,
                version: "Engine v3.1",
                platforms: ["Windows", "SteamOS"],
                screenshots: screenshots,
                minSpecs: minS,
                recommendedSpecs: recS
            };
        });

        // 📦 ASSEMBLE FULL DATABASE SEED
        const seedData = {
            featuredAsset: {
                id: "APEX_V8_TURBO",
                title: "MIDNIGHT_RUN",
                tagline: "High-octane street racing. Push past the redline, dominate the asphalt, and build your legacy.",
                price: "FREE_TO_PLAY",
                image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop",
                description: "The flagship client: ranked street leagues, cinematic replays, and a living world map that rotates weather and traffic patterns each season.",
                highlights: [
                    "Free-to-play core loop",
                    "Anti-cheat kernel driver (opt-in beta)",
                    "Monthly livery contests"
                ],
                downloadSize: "~12 GB launcher + content",
                version: "Public beta 0.12",
                platforms: ["Windows"],
                screenshots: [
                    { category: "CINEMATIC", url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1200&auto=format&fit=crop" },
                    { category: "GAMEPLAY", url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format&fit=crop" },
                    { category: "GAMEPLAY", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop" },
                    { category: "UI", url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop" }
                ],
                minSpecs: minS,
                recommendedSpecs: recS
            },
            globalMarket: generatedMarket,
            liveEvents: [
                {
                    target: "TOKYO_EXPRESSWAY_NIGHT",
                    prize: "15,000_REP",
                    class: "S_CLASS",
                    status: "LIVE",
                    description: "Wet expressway, rolling starts, and a sudden downpour at minute twelve. Tire strategy separates podium from pavement.",
                    host: "GRID_OS Esports",
                    hostTag: "Official broadcast",
                    hostAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
                    winner: "GHOST_RIDER",
                    winnerAlias: "GHOST_RIDER",
                    winnerTime: "01:12.44",
                    runnerUp: "APEX_HUNTER",
                    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
                    coverImage: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1600&auto=format&fit=crop",
                    screenshots: [
                        { category: "EVENT", url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200&auto=format&fit=crop" },
                        { category: "PODIUM", url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop" }
                    ],
                    participants: 18420,
                    region: "APAC · Tokyo shard",
                    startsAt: "2026-03-28T20:00:00Z"
                },
                {
                    target: "QUARTER_MILE_DRAG",
                    prize: "3,200_REP",
                    class: "B_CLASS",
                    status: "LIVE",
                    description: "Bracket tree, no wheelies. Launch RPM limited — reaction time wins as much as horsepower.",
                    host: "APEX Motorsports TV",
                    hostTag: "Sponsored",
                    hostAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
                    winner: "TOKYO_DRIFTER",
                    winnerAlias: "TOKYO_DRIFTER",
                    winnerTime: "9.84s",
                    runnerUp: "GHOST_RIDER",
                    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
                    coverImage: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop",
                    screenshots: [
                        { category: "EVENT", url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop" },
                        { category: "PODIUM", url: "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop" }
                    ],
                    participants: 9602,
                    region: "EU · Drag strip",
                    startsAt: "2026-03-28T18:30:00Z"
                }
            ],
            upcomingReleases: [
                {
                    id: "DLC_01", title: "TWIN_TURBO_PACK", eta: "Q3_2026", category: "TUNING_KIT",
                    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop", status: "IN_GARAGE",
                    description: "Bolt-on twin-scroll kits, intercooler piping, and ECU maps for supported chassis.",
                    highlights: ["50+ new parts", "Heat soak simulation", "Blueprint sharing"],
                    screenshots: [{ category: "CONTENT", url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop" }]
                },
                {
                    id: "DLC_02", title: "CARBON_AERO_KIT", eta: "Q4_2026", category: "BODY_MOD",
                    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=800&auto=format&fit=crop", status: "PROTOTYPE",
                    description: "Dry carbon splitters, canards, and active aero wings with wind-tunnel readouts in the garage.",
                    highlights: ["Wind tunnel viz", "Paint carbon weave direction", "Downforce telemetry overlay"],
                    screenshots: [{ category: "CONTENT", url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format&fit=crop" }]
                }
            ],
            systemTelemetry: [
                { label: "Active Racers", value: "142,509", trend: "+12%" },
                { label: "Global Top Speed", value: "278 MPH", trend: "+5%" },
                { label: "Total Drifts Logged", value: "8.4M", trend: "+24%" }
            ],
            topDrivers: [
                {
                    rank: "01", alias: "GHOST_RIDER", time: "01:12.44", car: "CUSTOM_RSR", team: "VOID_SYNDICATE",
                    country: "JP", portrait: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
                    bio: "Qualifies on fumes, races on instinct. Known for sector 2 lines that look impossible until they’re on the leaderboard.",
                    wins: "42", podiums: "88", videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
                    screenshots: [{ category: "SHOWROOM", url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1200&auto=format&fit=crop" }],
                    signatureTrack: "Tokyo Expressway · Night"
                },
                {
                    rank: "02", alias: "APEX_HUNTER", time: "01:13.01", car: "V8_VANTAGE", team: "REDLINE_UNIT",
                    country: "UK", portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
                    bio: "Telemetry-first driver: every curb is a data point. Specializes in drying-line gambles after weather swaps.",
                    wins: "36", podiums: "71", videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
                    screenshots: [{ category: "SHOWROOM", url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format&fit=crop" }],
                    signatureTrack: "Silverstone GP · Dusk"
                }
            ],
            commsLogs: [
                { time: "04:00:12", category: "WEATHER", msg: "Heavy rain detected on Sector 4. Equip wet tires." },
                { time: "03:45:00", category: "UPDATE", msg: "Server maintenance scheduled in 2 hours." },
                { time: "02:10:05", category: "EVENT", msg: "Double REP weekend is now active!" }
            ]
        };

        const createdData = await Game.create(seedData);
        res.status(201).json({ message: "Database seeded successfully with 50 vehicles!", data: createdData });

    } catch (error) {
        res.status(500).json({ message: "Failed to seed data", error: error.message });
    }
};

const getGameData = async (req, res) => {
    try {
        const gameData = await Game.findOne();

        if (!gameData) {
            return res.status(404).json({ message: "No game data found in the database. Run the seed route first." });
        }

        res.status(200).json(gameData);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching game data", error: error.message });
    }
};

const getLiveEventByIndex = async (req, res) => {
    try {
        const idx = parseInt(req.params.index, 10);
        if (Number.isNaN(idx) || idx < 0) {
            return res.status(400).json({ message: "Invalid event index" });
        }
        const gameData = await Game.findOne();
        if (!gameData) {
            return res.status(404).json({ message: "No game data found in the database. Run the seed route first." });
        }
        const item = gameData.liveEvents?.[idx];
        if (!item) return res.status(404).json({ message: "Event not found" });
        res.status(200).json({ index: idx, item });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getDriverByRank = async (req, res) => {
    try {
        const rank = decodeURIComponent(req.params.rank || "");
        const gameData = await Game.findOne();
        if (!gameData) {
            return res.status(404).json({ message: "No game data found in the database. Run the seed route first." });
        }
        const item = gameData.topDrivers?.find(
            (d) => d.rank === rank || d.alias === rank
        );
        if (!item) return res.status(404).json({ message: "Driver not found" });
        res.status(200).json({ item });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/** category: featured | showroom | release | event | driver */
const getGameItemDetail = async (req, res) => {
    try {
        const { category, id } = req.params;
        const decodedId = decodeURIComponent(id || "");
        const gameData = await Game.findOne();

        if (!gameData) {
            return res.status(404).json({ message: "No game data found in the database. Run the seed route first." });
        }

        switch (category) {
            case "featured": {
                const fa = gameData.featuredAsset;
                if (fa && fa.id === decodedId) {
                    return res.status(200).json({ category, item: fa });
                }
                break;
            }
            case "showroom": {
                const item = gameData.globalMarket?.find((g) => g.id === decodedId);
                if (item) return res.status(200).json({ category, item });
                break;
            }
            case "release": {
                const item = gameData.upcomingReleases?.find((u) => u.id === decodedId);
                if (item) return res.status(200).json({ category, item });
                break;
            }
            case "event": {
                const idx = parseInt(decodedId, 10);
                if (!Number.isNaN(idx) && gameData.liveEvents?.[idx]) {
                    return res.status(200).json({ category, item: gameData.liveEvents[idx], index: idx });
                }
                break;
            }
            case "driver": {
                const item = gameData.topDrivers?.find(
                    (d) => d.rank === decodedId || d.alias === decodedId
                );
                if (item) return res.status(200).json({ category, item });
                break;
            }
            default:
                return res.status(400).json({ message: "Invalid category" });
        }

        return res.status(404).json({ message: "Item not found" });
    } catch (error) {
        res.status(500).json({ message: "Server error fetching item", error: error.message });
    }
};

const _genId = (prefix, len = 4) => {
    const hex = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 2 + len).toUpperCase();
    return `${prefix}_${hex}`;
};

const addMarketItem = async (req, res) => {
    try {
        const { 
            title, genre, price, image, releaseDate, description,
            screenshots, minSpecs, recommendedSpecs, downloadSize
        } = req.body;

        // Auto-generate ID if not provided
        const id = req.body.id || _genId('CHASSIS');
        
        const updateRes = await Game.updateOne({}, {
            $push: { globalMarket: { 
                id, title, genre, price, image, releaseDate, description, 
                screenshots, minSpecs, recommendedSpecs, downloadSize
            } }
        });

        if (updateRes.matchedCount === 0) {
            return res.status(404).json({ message: "Database not seeded yet." });
        }

        const gameData = await Game.findOne();

        res.status(201).json({ message: "Vehicle added to Showroom!", id, data: gameData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addLiveEvent = async (req, res) => {
    try {
        const { target, prize, eventClass, status, ...rest } = req.body;
        const gameData = await Game.findOne();

        if (!gameData) return res.status(404).json({ message: "Database not seeded yet." });

        const id = _genId('EVT');
        gameData.liveEvents.push({ id, target, prize, class: eventClass, status, ...rest });
        await gameData.save();

        res.status(201).json({ message: "Live Event added to Mainframe!", id, data: gameData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addUpcomingRelease = async (req, res) => {
    try {
        const { title, eta, type, image, status } = req.body;
        const gameData = await Game.findOne();

        if (!gameData) return res.status(404).json({ message: "Database not seeded yet." });

        const id = req.body.id || _genId('DLC');
        gameData.upcomingReleases.push({ id, title, eta, type, image, status });
        await gameData.save();

        res.status(201).json({ message: "Upcoming Release added!", id, data: gameData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const joinLiveEvent = async (req, res) => {
    try {
        const idx = parseInt(req.params.index, 10);
        if (Number.isNaN(idx) || idx < 0) {
            return res.status(400).json({ message: "Invalid event index" });
        }
        
        const { alias, team } = req.body;
        if (!alias) {
            return res.status(400).json({ message: "Alias is required to participate." });
        }

        const gameData = await Game.findOne();
        if (!gameData) {
            return res.status(404).json({ message: "No game data found." });
        }

        const event = gameData.liveEvents[idx];
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        event.registeredUsers.push({ alias, team: team || 'Independent' });
        event.participants = (event.participants || 0) + 1;
        
        await gameData.save();

        res.status(200).json({ message: "Successfully enrolled in event!", item: event });
    } catch (error) {
        res.status(500).json({ message: "Failed to enroll", error: error.message });
    }
};

const updateGameItem = async (req, res) => {
    try {
        const { category, id } = req.params;
        const updatedData = req.body;
        const decodedId = decodeURIComponent(id || "");
        console.log(`>>> [Admin]: Update attempt on ${category}/${decodedId}`);

        const gameData = await Game.findOne();
        if (!gameData) return res.status(404).json({ message: "Game data not found." });

        let arrayName;
        switch (category) {
            case "showroom": 
            case "globalMarket": arrayName = "globalMarket"; break;
            case "event":    
            case "liveEvents":   arrayName = "liveEvents"; break;
            case "release":  
            case "upcomingReleases": arrayName = "upcomingReleases"; break;
            case "featured":
                if (gameData.featuredAsset.id === decodedId) {
                    gameData.featuredAsset = { ...gameData.featuredAsset, ...updatedData };
                    await gameData.save();
                    return res.status(200).json({ message: "Featured asset updated", item: gameData.featuredAsset });
                }
                return res.status(404).json({ message: "Featured asset not found" });
            default:
                return res.status(400).json({ message: "Invalid category" });
        }

        const items = gameData[arrayName];
        console.log(`>>> [Admin]: Searching in ${arrayName} (Size: ${items.length})`);
        const itemIndex = items.findIndex(item => (item.id === decodedId || item.target === decodedId));
        if (itemIndex === -1) {
            console.warn(`>>> [Admin]: Target ${decodedId} not found in ${arrayName}`);
            return res.status(404).json({ message: "Item not found in registry" });
        }

        // Update the item by merging new data
        gameData[arrayName][itemIndex] = { ...gameData[arrayName][itemIndex].toObject(), ...updatedData };
        
        await gameData.save();
        res.status(200).json({ message: `${category} updated successfully`, item: gameData[arrayName][itemIndex] });
    } catch (error) {
        res.status(500).json({ message: "Failed to update item", error: error.message });
    }
};

const deleteGameItem = async (req, res) => {
    try {
        const { category, id } = req.params;
        const decodedId = decodeURIComponent(id || "");
        console.log(`>>> [Admin]: Delete attempt on ${category}/${decodedId}`);

        const gameData = await Game.findOne();
        if (!gameData) return res.status(404).json({ message: "Game data not found." });

        let arrayName;
        switch (category) {
            case "showroom": 
            case "globalMarket": arrayName = "globalMarket"; break;
            case "event":    
            case "liveEvents":   arrayName = "liveEvents"; break;
            case "release":  
            case "upcomingReleases": arrayName = "upcomingReleases"; break;
            default:
                return res.status(400).json({ message: "Invalid category" });
        }

        const originalLength = gameData[arrayName].length;
        gameData[arrayName] = gameData[arrayName].filter(item => (item.id !== decodedId && item.target !== decodedId));

        if (gameData[arrayName].length === originalLength) {
            return res.status(404).json({ message: "Item not found in registry" });
        }

        await gameData.save();
        res.status(200).json({ message: `${category} deleted from registry` });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete item", error: error.message });
    }
};

const incrementDownloadCount = async (req, res) => {
    try {
        const { category, id } = req.params;
        const decodedId = decodeURIComponent(id || "");
        const gameData = await Game.findOne();

        if (!gameData) return res.status(404).json({ message: "Game data not found." });

        let item;
        if (category === "featured") {
            if (gameData.featuredAsset.id === decodedId) {
                gameData.featuredAsset.downloads = (gameData.featuredAsset.downloads || 0) + 1;
                item = gameData.featuredAsset;
            }
        } else if (category === "showroom") {
            const idx = gameData.globalMarket.findIndex(g => g.id === decodedId);
            if (idx !== -1) {
                gameData.globalMarket[idx].downloads = (gameData.globalMarket[idx].downloads || 0) + 1;
                item = gameData.globalMarket[idx];
            }
        }

        if (!item) return res.status(404).json({ message: "Item not found" });

        await gameData.save();
        res.status(200).json({ message: "Download count incremented", downloads: item.downloads });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const postGameReview = async (req, res) => {
    try {
        const { category, id } = req.params;
        const { username, rating, comment } = req.body;
        const decodedId = decodeURIComponent(id || "");

        if (!username || !rating) {
            return res.status(400).json({ message: 'Username and rating are required.' });
        }

        const gameData = await Game.findOne();
        if (!gameData) return res.status(404).json({ message: "Game data not found." });

        let item;
        if (category === "featured") {
            if (gameData.featuredAsset.id === decodedId) {
                item = gameData.featuredAsset;
            }
        } else if (category === "showroom") {
            item = gameData.globalMarket.find(g => g.id === decodedId);
        }

        if (!item) return res.status(404).json({ message: "Item not found" });

        item.reviews.push({ username, rating: Number(rating), comment });
        
        const total = item.reviews.reduce((sum, r) => sum + r.rating, 0);
        item.avgRating = +(total / item.reviews.length).toFixed(1);

        await gameData.save();
        res.status(201).json({ message: 'Review submitted!', reviews: item.reviews, avgRating: item.avgRating });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    seedGameData,
    getGameData,
    getGameItemDetail,
    getLiveEventByIndex,
    getDriverByRank,
    addMarketItem,
    addLiveEvent,
    addUpcomingRelease,
    joinLiveEvent,
    incrementDownloadCount,
    postGameReview,
    updateGameItem,
    deleteGameItem
};