# RoadmapIQ – Deployment Guide: Vercel (Frontend) + Render (Backend)

Deploy **RoadmapIQ** for **100% FREE** with:
- **Frontend** hosted on **Vercel** (Global edge CDN, instant loads, zero sleep)
- **Backend** hosted on **Render** (Python FastAPI REST API + RAG Engine + SQLite)

---

## 📋 Architecture Overview

```mermaid
flowchart LR
    Browser["User Web Browser"]
    Vercel["Frontend on VERCEL\n(https://roadmapiq.vercel.app)\nReact 18 + Vite + Tailwind"]
    Render["Backend on RENDER\n(https://roadmapiq-api.onrender.com)\nFastAPI + SQLite + RAG Engine"]

    Browser -->|Loads UI & Assets| Vercel
    Browser -->|API Calls (VITE_API_BASE_URL)| Render
    Render -->|Returns JSON & RAG Data| Browser
```

---

## 🚀 STEP 1: Deploy Backend on Render (Do this first)

You must deploy the backend first to get your backend URL (e.g. `https://roadmapiq-backend.onrender.com`).

1. **Sign in to Render**:
   - Go to [render.com](https://render.com) and log in with your **GitHub** account.

2. **Create New Web Service**:
   - Click the blue **New +** button in the top right $\rightarrow$ select **Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Connect and choose: **`i-indhugit/RoadmapIQ`**.

3. **Configure the Web Service**:
   | Setting | Value |
   |---|---|
   | **Name** | `roadmapiq-backend` *(or any unique name)* |
   | **Region** | Choose closest to you (e.g., *Singapore* or *Frankfurt*) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | **Python 3** |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | **Free** ($0/month) |

4. **Add Environment Variables**:
   Click **Advanced** $\rightarrow$ **Add Environment Variable**:
   - `PYTHONPATH` = `.`
   - `CORS_ORIGINS` = `["*"]`
   - *(Optional)* `GEMINI_API_KEY` = *(Your Gemini API key if using cloud AI)*

5. **Deploy**:
   - Click **Create Web Service**.
   - Wait ~2 minutes for the build to finish.
   - **Copy your Render backend URL** from the top of the page:
     `https://roadmapiq-backend.onrender.com` (example)

---

## ⚡ STEP 2: Deploy Frontend on Vercel

1. **Sign in to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your **GitHub** account.

2. **Import Project**:
   - Click **Add New...** $\rightarrow$ **Project**.
   - Find and click **Import** next to **`i-indhugit/RoadmapIQ`**.

3. **Configure the Project**:
   - **Framework Preset**: **Vite** (Vercel will detect it automatically).
   - **Root Directory**: Click **Edit** and select **`frontend`** $\rightarrow$ click **Continue**.
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).

4. **Add Environment Variable (Crucial Step)**:
   Expand the **Environment Variables** section and add:
   - **Name / Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-render-app.onrender.com/api`
     *(Replace `your-render-app` with your actual Render URL from Step 1. Ensure you include `/api` at the end!)*

5. **Deploy**:
   - Click **Deploy**.
   - In ~45 seconds, Vercel will complete the build and give you your live URL:
     `https://roadmapiq.vercel.app`!

---

## 🔍 How to Verify Everything is Working

1. Open your Vercel URL in your browser: `https://your-app.vercel.app`.
2. Open DevTools (press `F12` $\rightarrow$ **Network** tab).
3. If Render was asleep, the first request might take ~30–45s to wake up (the frontend timeout has been set to 60s so it won't fail).
4. Once awake, all tabs (**Discover**, **Assess**, **My Journey**, **My Growth**) will load their data smoothly!
