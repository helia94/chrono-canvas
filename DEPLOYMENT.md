# ChronoCanvas Deployment Guide

This guide covers deploying both the Python backend and React frontend.

## Architecture

```
┌─────────────────┐      API calls      ┌──────────────────┐
│  React Frontend │  ────────────────>  │  Python Backend  │
│  (Lovable/Vercel│  <────────────────  │  (FastAPI)       │
│   /Netlify)     │      JSON data      │                  │
└─────────────────┘                     └──────────────────┘
```

## Quick Start (Local Development)

### 1. Start the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 2. Start the Frontend

```bash
# In a separate terminal, from project root
npm install
npm run dev
```

Frontend runs at: http://localhost:8080 (or 5173)

---

## Backend Deployment Options

### 🏆 Recommended: Railway (Easiest + Free Tier)

**Why Railway?**
- One-click deploys from GitHub
- Free tier: $5/month credit (~500 hours)
- Auto-detects Python
- Great for prototypes

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Set root directory to `backend`
5. Add environment variable: `PORT=8000`
6. Deploy!

**Your backend URL will be:** `https://your-app.up.railway.app`

---

### Alternative: Render (Free Tier with Cold Starts)

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repo
4. Settings:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Deploy

**Note:** Free tier spins down after 15 min of inactivity (30s cold start)

---

### Alternative: Fly.io

```bash
cd backend
fly launch
fly deploy
```

---

### Alternative: PythonAnywhere (Simple, Free)

1. Create account at [pythonanywhere.com](https://pythonanywhere.com)
2. Upload backend files via web interface
3. Set up WSGI to point to FastAPI app
4. Configure virtual environment

---

## Frontend Deployment

### Option 1: Lovable (If using Lovable)

1. In Lovable project settings, add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
2. Deploy as usual

### Option 2: Vercel

1. Connect GitHub repo to Vercel
2. Add environment variable in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
3. Deploy

### Option 3: Netlify

1. Connect GitHub repo to Netlify
2. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend
```
PORT=8000
CORS_ORIGINS=https://your-frontend-url.com
```

---

## Cost Summary

| Platform | Backend | Frontend | Total/Month |
|----------|---------|----------|-------------|
| Railway + Vercel | Free-$5 | Free | $0-5 |
| Render + Netlify | Free | Free | $0 |
| Fly.io + Vercel | Free | Free | $0 |
| PythonAnywhere + Netlify | Free | Free | $0 |

**Recommended for production:** Railway ($5/mo) + Vercel (free) = $5/month

---

## Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Check that `CORS_ORIGINS` in backend includes your frontend URL
2. In `backend/main.py`, update the `allow_origins` list

### API Not Connecting
1. Check if `VITE_API_URL` is set correctly
2. Ensure backend is running and accessible
3. Check browser Network tab for errors

### Backend Import Errors
If using Python 3.9 or earlier:
- The codebase uses `Optional[Type]` syntax for compatibility
- If you see `TypeError: unsupported operand type(s) for |`, upgrade to Python 3.10+

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/config` | GET | Get regions, art forms, time periods |
| `/api/art` | GET | Get art data (with fallback) |
| `/api/art/exact` | GET | Get art data (exact match only) |

Query params for `/api/art`:
- `decade` (required): "1920", "1960", etc.
- `region` (required): "Western Europe", "East Asia", etc.
- `artForm` (required): "Visual Arts", "Music", "Literature"

