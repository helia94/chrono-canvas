# ChronoCanvas Backend API

A FastAPI backend for the ChronoCanvas art exploration application.

## Quick Start

### Local Development

1. **Create a virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. **Access the API:**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Redoc: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/config` | Get available regions, art forms, and time periods |
| GET | `/api/art` | Get art data with fallback (query params: `decade`, `region`, `artForm`) |
| GET | `/api/art/exact` | Get art data exact match only |

### Example Requests

```bash
# Get configuration
curl http://localhost:8000/api/config

# Get art data
curl "http://localhost:8000/api/art?decade=1920&region=Western%20Europe&artForm=Visual%20Arts"
```

## Deployment Options

### Option 1: Railway (Recommended - Free Tier Available)

Railway offers the easiest deployment with a free tier.

1. **Create account at [railway.app](https://railway.app)**

2. **Deploy from GitHub:**
   - Connect your GitHub repository
   - Select the `backend` folder as the root directory
   - Railway auto-detects Python and deploys

3. **Or deploy via CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

4. **Set environment variables in Railway dashboard:**
   - `PORT` (Railway sets this automatically)
   - `CORS_ORIGINS` (your frontend URL)

**Pricing:** Free tier includes $5/month credit, ~500 hours of runtime

---

### Option 2: Render (Free Tier Available)

1. **Create account at [render.com](https://render.com)**

2. **Create a new Web Service:**
   - Connect your GitHub repo
   - Set root directory to `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Configure:**
   - Add environment variables
   - Set instance type to "Free"

**Pricing:** Free tier spins down after inactivity (cold starts ~30s)

---

### Option 3: Fly.io (Free Tier Available)

1. **Install flyctl:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy:**
   ```bash
   cd backend
   fly launch
   fly deploy
   ```

**Pricing:** Free tier includes 3 shared-cpu-1x VMs

---

### Option 4: PythonAnywhere (Free Tier Available)

Good for simple Python apps without complex dependencies.

1. **Create account at [pythonanywhere.com](https://www.pythonanywhere.com)**

2. **Upload your code** via their web interface or Git

3. **Configure WSGI** to point to your FastAPI app

**Pricing:** Free tier with limitations (one web app, limited CPU)

---

### Option 5: Vercel (Serverless)

Deploy as serverless functions using Vercel's Python runtime.

1. **Create `vercel.json` in backend folder:**
   ```json
   {
     "builds": [
       { "src": "main.py", "use": "@vercel/python" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "main.py" }
     ]
   }
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

**Note:** Requires some adaptation for serverless (stateless).

---

## Frontend Integration

After deploying, update the frontend environment variable:

1. **Create `.env` file in project root:**
   ```
   VITE_API_URL=https://your-deployed-backend-url.com
   ```

2. **For Lovable deployment:**
   - Set the `VITE_API_URL` environment variable in Lovable's settings
   - The frontend will automatically use this URL

## Project Structure

```
backend/
├── main.py           # FastAPI application entry point
├── models.py         # Pydantic models for request/response
├── data.py           # Mock data (to be replaced with DB logic)
├── requirements.txt  # Python dependencies
├── Procfile          # For Heroku/Railway deployment
├── runtime.txt       # Python version specification
└── README.md         # This file
```

## Future Improvements

- [ ] Add database integration (PostgreSQL/SQLite)
- [ ] Implement caching for API responses
- [ ] Add authentication for admin endpoints
- [ ] Integrate with external art APIs (Wikipedia, Artsy, etc.)

