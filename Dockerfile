# =============================================================================
# Multi-Stage Dockerfile for Unified RoadmapIQ Single-Website Deployment
# Serves both React Frontend and FastAPI Backend from a single container / port.
# =============================================================================

# --- Stage 1: Build the React + Vite Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: FastAPI Backend Server ---
FROM python:3.12-slim
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application source
COPY backend/ ./backend/

# Copy compiled frontend distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Configuration
ENV PYTHONPATH=/app/backend
ENV PORT=8000

EXPOSE 8000

# Start Uvicorn bound to the environment-provided port (supports Render, Koyeb, Railway, HF Spaces)
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
