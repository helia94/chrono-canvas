# ChronoCanvas

An interactive art exploration application that lets you discover art through time and regions.

## Tech Stack

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Backend:**
- FastAPI (Python)
- PostgreSQL
- LLM providers (OpenAI, Anthropic, Perplexity, xAI)

## Quick Start

### Frontend Only (uses production API)

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will connect to the production API at `https://chronocanvas-api-production.up.railway.app` by default.

### Frontend with Local Backend

If you want to run the backend locally:

```sh
# Terminal 1 - Start the backend
cd backend
cp .env.example .env  # Configure your API keys
uv sync
uv run uvicorn main:app --reload --port 8000

# Terminal 2 - Start the frontend with local API
cp .env.example .env
# Edit .env and uncomment: VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

## Environment Variables

### Frontend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://chronocanvas-api-production.up.railway.app` | Backend API URL |

To use local backend, create `.env`:
```
VITE_API_URL=http://localhost:8000
```

### Backend

See [backend/README.md](./backend/README.md) for backend environment variables and setup.

## Project Structure

```
chrono-canvas/
├── src/                  # Frontend React application
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   └── pages/            # Page components
├── backend/              # FastAPI backend
│   └── README.md         # Backend documentation
├── .env.example          # Frontend environment template
└── README.md             # This file
```

## Deployment

- **Frontend**: Deployed via Lovable/Vercel
- **Backend**: Deployed on Railway at `https://chronocanvas-api-production.up.railway.app`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
