# Backend Deployment Guide (Render.com)

Follow these steps to host your backend for free on **Render**.

### 1. Create a Render Account
Go to [render.com](https://render.com) and sign up using your GitHub account.

### 2. Create a "Web Service"
- Click **New +** -> **Web Service**.
- Connect your GitHub repository (`APEX_CORE`).
- Select the branch (likely `main`).

### 3. Configuration
- **Name**: `apex-core-backend` (or any name you like)
- **Root Directory**: `backend` (CRITICAL: Point to the backend folder)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### 4. Environment Variables
Click **Advanced** -> **Add Environment Variable** and add the following from your `.env` file:
- `MONGO_URI`: (Your MongoDB connection string)
- `JWT_SECRET`: (Your secret key)
- `EMAIL_USER`: (Your email)
- `EMAIL_PASS`: (Your email app password)
- `FRONTEND_URL`: `https://your-frontend-link.vercel.app` (Add this AFTER you deploy the frontend)
- `ADMIN_URL`: `https://your-admin-link.vercel.app` (Add this AFTER you deploy the admin)

### 5. Deploy
Click **Create Web Service**. Render will now build and start your server!
Once it's live, you'll get a URL like `https://apex-core-backend.onrender.com`.

> [!NOTE]
> Copy your Render URL! You will need it to configure your Frontend and Admin panels.
