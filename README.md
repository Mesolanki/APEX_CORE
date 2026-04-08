# 🏎️ APEX_CORE: ULTIMATE_MOTORSPORT_SYSTEM

[![Deployment Status](https://img.shields.io/badge/Render-Live-success?style=for-the-badge&logo=render)](https://apex-core-frontend.onrender.com)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](https://mongodb.com)

**APEX_CORE** is a high-performance, full-stack ecosystem designed for competitive motorsport management and community engagement. From a tactical marketplace for digital chassis to a real-time pilot social feed, it delivers a premium, cyberpunk-inspired experience.

---

## 🌐 LIVE_SERVICES

Access the live terminal links below to explore the grid:

| Service | Target URL | Description |
| :--- | :--- | :--- |
| **🕹️ Public Frontend** | [apex-core-frontend.onrender.com](https://apex-core-frontend.onrender.com) | Main marketplace, community HUB, and showroom. |
| **🛡️ Admin Dashboard** | [apex-core-admin.onrender.com](https://apex-core-admin.onrender.com) | Global asset management and telemetry analytics. |
| **📡 Backend API** | [apex-core-backend-lyoj.onrender.com](https://apex-core-backend-lyoj.onrender.com) | Core data processor and authentication engine. |

---

## 🛠️ CORE_TECHNOLOGY

### Backend (The Engine)
- **Node.js & Express**: High-speed RESTful API backbone.
- **MongoDB & Mongoose**: Scalable document storage for assets, users, and events.
- **Passport.js & JWT**: Secure session management featuring Google OAuth 2.0.
- **Nodemailer**: (Optional) Automated communication protocol.

### Frontend & Admin (The Chassis)
- **React (Vite)**: Modern component-based architecture for reactive performance.
- **Tailwind CSS (v4)**: Utility-first styling for precise, responsive tactical UI.
- **GSAP (GreenSock)**: Cinematic scroll-triggered animations and UI transitions.
- **Framer Motion**: Smooth component-level micro-interactions.
- **Lucide & React Icons**: Tactical iconography set.

---

## 🏎️ OPERATIONAL_GUIDE

### For New Pilots (Users)
1. **Initialize Link**: Visit the [Frontend](https://apex-core-frontend.onrender.com) and click **INITIATE** (Signup).
2. **Browse Chassis**: Explore the **Chassis_Deck** to view available simulators and ARCADE assets.
3. **Broadcasting**: Access the **Pilot_Syndicate** to share transmissions and engage with the global community.
4. **Live Events**: Check the **Live_Circuits** section for upcoming competitive tournaments.

### For Operatives (Admins)
1. **Access Terminal**: Login via the [Admin Dashboard](https://apex-core-admin.onrender.com).
2. **Asset CDB**: Manage the **Global Market**—add new vehicles, update specs, and manage visual capture logs.
3. **Telemetry**: View global network analytics including revenue, downloads, and system uptime.
4. **Event Management**: Deploy and monitor live competitive circuits.

---

## 🏗️ LOCAL_DEPLOYMENT

If you wish to clone the repository for local research:

1. **Install Dependencies**:
   ```bash
   # Root level
   npm install

   # Client subdirectories
   cd frontend && npm install
   cd ../admin && npm install
   cd ../backend && npm install
   ```

2. **Environment Configuration**:
   Create a `.env` in the `backend` folder:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```

3. **Ignition**:
   ```bash
   # Start Backend
   cd backend && npm start

   # Start Frontend (Separate Terminal)
   cd frontend && npm run dev

   # Start Admin (Separate Terminal)
   cd admin && npm run dev
   ```

---

## 📡 SYSTEM_DIAGNOSTICS

To check server health and database synchronization:
[https://apex-core-backend-lyoj.onrender.com/diagnostics](https://apex-core-backend-lyoj.onrender.com/diagnostics)

>© 2026 APEX_CORE_SYSTEMS // SECURED_BY_GRID_OS
