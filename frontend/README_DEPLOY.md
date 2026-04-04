# Frontend Deployment Guide (Vercel)

Follow these steps to host your frontend for free on **Vercel**.

### 1. Create a Vercel Account
Go to [vercel.com](https://vercel.com) and sign up using your GitHub account.

### 2. Connect Your Project
- Click **Add New** -> **Project**.
- Select the `APEX_CORE` repository.

### 3. Build & Development Settings
- **Project Name**: `apex-core-frontend`
- **Framework Preset**: `Vite` (Should be auto-detected)
- **Root Directory**: `frontend` (CRITICAL: Point to the frontend folder)

### 4. Environment Variables
Add the following variable:
- `VITE_API_URL`: (Paste your Render backend URL, e.g., `https://apex-core-backend.onrender.com`)

### 5. Deploy
Click **Deploy**. Your site will be live in ~2 minutes!
Once it's live, go to your **Render** dashboard and add your new Vercel URL to the `FRONTEND_URL` environment variable.

---

# Admin Dashboard Deployment (Vercel)

Repeat the same steps as above, but:
- **Project Name**: `apex-core-admin`
- **Root Directory**: `admin`
- Add the same `VITE_API_URL` environment variable.
- After deployment, add the admin URL to the `ADMIN_URL` environment variable in your **Render** dashboard.
