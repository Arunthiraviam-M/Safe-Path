# SafePath AI — Setup Guide

*"Navigate Smart. Travel Safer."*

This guide assumes you have **never used MongoDB before**. Follow it top to bottom, in order, and don't skip steps. It will take about 20–30 minutes the first time.

---

## What you're setting up

Two separate applications that talk to each other:

- **`backend/`** — Node.js + Express + MongoDB. Handles accounts, login, sessions, profile, safe places, etc.
- **`frontend/`** — React (Vite) app. This is the website you actually see and click around in.

They run as two separate processes, in two separate terminal windows, at the same time.

---

## Prerequisites

Install these before starting:

1. **Node.js** (version 18 or higher) — download from https://nodejs.org (choose the LTS version). To check it's installed, open a terminal and run:
   ```
   node -v
   npm -v
   ```
   Both should print a version number.
2. **VS Code** — you already have this.
3. A free **MongoDB Atlas** account — you'll create this in Step 1 below. No credit card required for the free tier.

---

## Step 1 — Create your MongoDB Atlas database (cloud, free)

MongoDB Atlas is MongoDB's official free cloud hosting. You do not install MongoDB on your computer — it lives online, and your backend connects to it over the internet.

1. Go to **https://www.mongodb.com/cloud/atlas/register** and sign up (Google sign-in works fine).
2. When asked "What are you building?", you can skip / choose any option — it doesn't affect anything.
3. You'll be prompted to **create a cluster**. Choose:
   - **M0 (Free)** tier
   - Any cloud provider (AWS is fine)
   - Any region close to you
   - Give it any name, e.g. `SafePathCluster`
   - Click **Create Deployment** (may take 1–3 minutes to provision).
4. **Create a database user** (you'll be prompted automatically after the cluster is created):
   - Username: e.g. `safepath_admin`
   - Password: click **Autogenerate Secure Password** and **copy it somewhere safe** — you'll need it in Step 3. (Avoid `@`, `/`, or `%` in a manual password — they break connection strings.)
   - Click **Create Database User**.
5. **Allow network access**:
   - You'll see a "Where would you like to connect from?" step.
   - Click **Add My Current IP Address**, AND also click **Allow Access from Anywhere** (`0.0.0.0/0`) — simplest for local development. (For a real production deployment later, you'd restrict this.)
   - Click **Finish and Close**.
6. **Get your connection string**:
   - On the Atlas dashboard, click **Connect** on your cluster.
   - Choose **Drivers**.
   - Select **Node.js** as the driver.
   - Copy the connection string shown. It looks like:
     ```
     mongodb+srv://safepath_admin:<password>@safepathcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the actual password you copied in step 4.
   - Add `safepath_ai` as the database name right after `.net/` so it looks like:
     ```
     mongodb+srv://safepath_admin:YOUR_PASSWORD@safepathcluster.xxxxx.mongodb.net/safepath_ai?retryWrites=true&w=majority
     ```
   - **Keep this string** — you'll paste it into `.env` in Step 3.

That's it — your database exists. You never have to install or run MongoDB yourself; the `safepath_ai` database and its collections (`users`, `safe_places`, `journeys`, `settings`, `location_history`) will be created automatically the first time your backend writes to them.

---

## Step 2 — Open the project in VS Code

1. Create a folder on your computer, e.g. `SafePath-AI`.
2. Unzip/copy everything from this project into that folder. You should end up with:
   ```
   SafePath-AI/
     backend/
     frontend/
     README.md
   ```
3. Open VS Code → **File → Open Folder** → select `SafePath-AI`.
4. Open a terminal inside VS Code: **Terminal → New Terminal**.

---

## Step 3 — Configure and run the backend

1. In the VS Code terminal:
   ```
   cd backend
   npm install
   ```
   This downloads all backend dependencies (Express, Mongoose, JWT, bcrypt, etc.) — takes a minute.

2. Create your environment file:
   - Find the file `backend/.env.example`.
   - Make a **copy** of it in the same folder, named exactly `.env` (no `.example`).
   - Open `.env` and fill it in:
     ```
     MONGO_URI=mongodb+srv://safepath_admin:YOUR_PASSWORD@safepathcluster.xxxxx.mongodb.net/safepath_ai?retryWrites=true&w=majority
     JWT_SECRET=any_long_random_string_you_make_up_here_123456
     PORT=5000
     CLIENT_URL=http://localhost:5173
     NODE_ENV=development
     ```
   - `MONGO_URI` = the connection string from Step 1.
   - `JWT_SECRET` = literally any long random text — mash your keyboard, or use a phrase like `s@fepath-super-secret-key-2026-xyz`. This is what signs your login tokens; keep it private and never commit it to GitHub.

3. Start the backend:
   ```
   npm run dev
   ```
   You should see in the terminal:
   ```
   MongoDB connected: safepathcluster-shard-...
   SafePath AI backend running on http://localhost:5000
   ```
   If you instead see a MongoDB connection error, double-check your password (no `<` `>` characters left in it) and that you allowed network access from anywhere in Atlas.

4. Leave this terminal running. Test it's alive by opening **http://localhost:5000/api/health** in your browser — you should see `{"status":"ok", ...}`.

---

## Step 4 — Configure and run the frontend

1. Open a **second** terminal in VS Code (click the `+` in the terminal panel, or **Terminal → New Terminal**) — keep the backend one running in the first.
2. In the new terminal:
   ```
   cd frontend
   npm install
   npm run dev
   ```
3. You'll see something like:
   ```
   VITE ready in ... ms
   ➜  Local:   http://localhost:5173/
   ```
4. Open **http://localhost:5173** in your browser. You should land on the SafePath AI login page.

---

## Step 5 — Try it out

1. Click **Register**, fill in the form, submit.
2. You'll be logged in automatically and land on the Dashboard.
3. Click around: Safe Places, About Us, your profile (top right), Settings, the SOS button (bottom right), Share Location (bottom center).
4. Close the browser tab and reopen `http://localhost:5173` — you should still be logged in. This is the **HTTP-only cookie + sliding 30-day session** working: no `localStorage` is used anywhere; the browser and backend handle it via a secure cookie you can't see or tamper with from JavaScript.
5. In MongoDB Atlas, click **Browse Collections** on your cluster — you'll see your new user appear in the `safepath_ai.users` collection, with `lastLogin`, `lastActive`, and `sessionExpiry` fields.

---

## How the authentication / session system works (so you understand what you're running)

- **Register/Login**: password is hashed with `bcrypt` before it's ever saved — the plain password is never stored.
- **Session token**: on login, the backend signs a JWT and sends it as an `httpOnly` cookie. JavaScript in the browser **cannot read this cookie** — that's what makes it more secure than `localStorage`.
- **Sliding expiration**: every authenticated API request (loading the dashboard, clicking a page, etc.) passes through `backend/middleware/auth.js`, which re-signs a fresh 30-day token and re-sets the cookie automatically. So as long as you visit within any 30-day window, you stay logged in indefinitely. If you don't open the app for 30 straight days, the token simply expires and you're redirected to `/login`.
- **Logout**: clears the cookie server-side.

---

## Project structure reference

```
SafePath-AI/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   User, SafePlace, Journey, LocationHistory, Settings
│   ├── middleware/auth.js        Sliding-expiration JWT verification
│   ├── controllers/              Route logic (auth, profile, settings, etc.)
│   ├── routes/                   Express route definitions
│   ├── utils/                    Token signing, validators
│   ├── server.js                 App entry point
│   └── .env                      Your secrets (create this — not committed to git)
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx    Auth state — reads from cookie via /auth/me, no localStorage
    │   ├── services/                  Axios API calls
    │   ├── routes/ProtectedRoute.jsx  Redirects to /login if not authenticated
    │   ├── layouts/DashboardLayout.jsx
    │   ├── components/                Sidebar, SOSButton, LocationShareButton, MapView
    │   └── pages/                     Login, Register, Dashboard, SafePlaces, AboutUs, Profile, Settings
    └── vite.config.js
```

---

## Next steps / things to know

- **Safe Places data**: the Safe Places page currently shows sample data in the frontend. The backend endpoint `GET /api/safe-places?lng=..&lat=..` is fully built and queries MongoDB with a geospatial `2dsphere` index — you just need to `POST /api/safe-places` some real entries (police stations, hospitals, etc. with real coordinates) to see it return live results. You can do this with a tool like Postman, or a small seed script.
- **ML routing** (recommending the *safest* route): not built yet, by design — the architecture (Journey model, safetyScore field, etc.) is ready for it to be added later.
- **Deploying publicly**: the frontend is ready for Vercel (`npm run build` produces a `dist/` folder). The backend can be deployed to any Node host (Render, Railway, Fly.io) — just set the same environment variables there, and update `CLIENT_URL` in the backend `.env` and `VITE_API_URL` in a frontend `.env` to point at your deployed backend URL.

If anything doesn't start correctly, check the terminal output first — both servers print clear error messages (e.g. missing `.env`, wrong Mongo password, port already in use).
