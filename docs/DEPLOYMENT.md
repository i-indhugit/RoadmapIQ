# RoadmapIQ – Single-Website Free Deployment Guide

Deploy **RoadmapIQ** (React Frontend + FastAPI Backend + Centralized RAG Knowledge Base + SQLite Database) on **ONE single website for 100% FREE** with:
- **One single URL** (e.g. `https://roadmapiq.onrender.com` or `https://roadmapiq.koyeb.app`)
- **Zero CORS issues** (Frontend and Backend run on the same domain)
- **Automatic SSL / HTTPS**
- **Unified routing**: `/` serves the React SPA, `/api/...` serves the backend API, `/docs` serves the interactive Swagger API documentation.

---

## 🌟 Method 1: Render.com (Recommended – 100% Free, 3 Minutes)

Render offers a 100% free Web Service tier connected directly to your GitHub repository.

### Step-by-Step Instructions:

1. **Sign in to Render**:
   - Go to [render.com](https://render.com) and log in with your GitHub account.

2. **Create New Web Service**:
   - Click **New +** in the top navigation bar and select **Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Connect and select your repository: **`i-indhugit/RoadmapIQ`**.

3. **Configure the Settings**:
   - **Name**: `roadmapiq` (or any name you choose)
   - **Region**: Choose the closest region (e.g. *Singapore* or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: **Python 3**
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: **Free** ($0/month)

4. **Environment Variables**:
   Click **Advanced** $\rightarrow$ **Add Environment Variable**:
   | Key | Value | Notes |
   |---|---|---|
   | `PYTHONPATH` | `backend` | Required for Python module imports |
   | `CORS_ORIGINS` | `["*"]` | Allows web browser calls |
   | `GEMINI_API_KEY` | *(Optional)* | Your Google Gemini API key if using cloud AI synthesis |

5. **Deploy**:
   - Click **Create Web Service**.
   - Render will automatically install Python packages, build the React production bundle, and start the unified server.
   - Once complete, you will receive your live URL: **`https://roadmapiq.onrender.com`**!

---

## 🚀 Method 2: Hugging Face Spaces (100% Free Forever, 16 GB RAM, Never Sleeps!)

Hugging Face Spaces provides a free Docker hosting environment with **16 GB RAM** and **2 vCPUs** that **never goes to sleep**.

### Step-by-Step Instructions:

1. Go to [huggingface.co](https://huggingface.co) and sign in (or create a free account).
2. Click your profile picture $\rightarrow$ **New Space**.
3. Set:
   - **Space name**: `RoadmapIQ`
   - **License**: `mit`
   - **Space SDK**: **Docker** $\rightarrow$ **Blank**
   - **Visibility**: **Public**
4. Click **Create Space**.
5. Connect your GitHub repository or push this repository to your Hugging Face Space git remote:
   ```bash
   git remote add space https://huggingface.co/spaces/<your-username>/RoadmapIQ
   git push space main
   ```
6. Hugging Face will automatically detect the root `Dockerfile`, build the React frontend and FastAPI backend, and give you a free, permanent URL (e.g. `https://<your-username>-roadmapiq.hf.space`)!

---

## ⚡ Method 3: Koyeb (100% Free Eco Tier – No Cold Start)

Koyeb provides a free Eco tier with fast NVMe and zero cold-start delay.

1. Sign up at [koyeb.com](https://www.koyeb.com) using your GitHub account.
2. Click **Create App** $\rightarrow$ **GitHub**.
3. Select `i-indhugit/RoadmapIQ`.
4. Choose **Dockerfile** deployment (it will automatically use the included `Dockerfile`).
5. Select the **Free** instance type.
6. Click **Deploy**. Your app will be live at `https://<your-app>.koyeb.app`.

---

## 🛠️ How It Works Under The Hood

RoadmapIQ is engineered as a **unified Single-Page Application server**:
1. When a user opens `https://your-app.onrender.com/`, FastAPI inspects the compiled `frontend/dist` directory and streams `index.html`.
2. Any client-side route navigation (`/discover`, `/journey`, `/assess`, `/growth`) falls back to `index.html` so React Router handles navigation seamlessly without 404 errors.
3. Static files (`/assets/*.js`, `/assets/*.css`) are mounted and cached by FastAPI.
4. All API requests use relative paths (`/api/...`), completely eliminating CORS errors and separate server configurations.
