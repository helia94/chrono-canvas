# ChronoCanvas Backend API

A FastAPI backend for the ChronoCanvas art exploration application with LLM-powered fact-checking and PostgreSQL caching.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Request                               │
│              (decade, region, art_form)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Cache Layer (PostgreSQL)                    │
│                   Check if data exists                           │
└─────────────────────────────────────────────────────────────────┘
                    │                       │
               [Cache Hit]             [Cache Miss]
                    │                       │
                    ▼                       ▼
              Return Data    ┌─────────────────────────────────────┐
                             │    Query LLM Providers (Parallel)   │
                             │  ┌─────────┬──────────┬─────────┐   │
                             │  │ OpenAI  │Perplexity│   xAI   │   │
                             │  │ (GPT-4) │ (Sonar)  │ (Grok)  │   │
                             │  └────┬────┴────┬─────┴────┬────┘   │
                             │       │         │          │        │
                             │  2 queries each (popular + timeless)│
                             └───────┼─────────┼──────────┼────────┘
                                     │         │          │
                                     ▼         ▼          ▼
                             ┌─────────────────────────────────────┐
                             │      Claude Consensus Layer         │
                             │  - Majority vote for art selection  │
                             │  - Claude judges if no majority     │
                             │  - Writes friendly, engaging desc   │
                             └─────────────────────────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────────┐
                             │        Cache Result in DB           │
                             └─────────────────────────────────────┘
                                              │
                                              ▼
                                        Return Data
```

## Quick Start

### 1. Prerequisites

- Python 3.9+
- [uv](https://github.com/astral-sh/uv) (fast Python package manager)
- PostgreSQL database
- API keys for: OpenAI, Anthropic (Claude), Perplexity, xAI

### 2. Install uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with Homebrew
brew install uv
```

### 3. Set up PostgreSQL

```bash
# Create database
createdb chronocanvas

# Or via Docker
docker run --name chronocanvas-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chronocanvas -p 5432:5432 -d postgres
```

### 4. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your API keys and database URL
```

### 5. Install Dependencies & Run

```bash
cd backend

# Install dependencies (creates .venv automatically)
uv sync

# Run development server with auto-reload
uv run uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## Available Commands

```bash
# Development server with auto-reload
uv run uvicorn main:app --reload --port 8000

# Production server
uv run uvicorn main:app --host 0.0.0.0 --port 8000

# Run tests
uv run pytest

# Lint code
uv run ruff check .

# Format code
uv run ruff format .
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/config` | Get available regions, art forms, time periods |
| GET | `/api/art` | Get art data (uses cache + LLM) |
| DELETE | `/api/cache` | Clear all cached data |
| DELETE | `/api/cache/{decade}/{region}/{art_form}` | Invalidate specific entry |

### Query Parameters for `/api/art`

| Parameter | Required | Description |
|-----------|----------|-------------|
| `decade` | Yes | Time period (e.g., "1920", "1960") |
| `region` | Yes | Geographic region |
| `artForm` | Yes | "Visual Arts", "Music", or "Literature" |

### Example Request

```bash
curl "http://localhost:8000/api/art?decade=1920&region=Western%20Europe&artForm=Visual%20Arts"
```

### Example Response

```json
{
  "data": {
    "decade": "1920",
    "region": "Western Europe",
    "artForm": "Visual Arts",
    "popular": {
      "name": "The Persistence of Memory",
      "description": "Dalí's melting clocks became the ultimate fever dream of the art world—somehow making everyone question if their watch was lying to them. It's surrealism's greatest mic drop."
    },
    "timeless": {
      "name": "Composition with Red, Blue and Yellow",
      "description": "Mondrian stripped painting down to its bones—just lines and primary colors—and accidentally invented the aesthetic that would launch a thousand IKEA products."
    }
  },
  "found": true
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic (Claude) API key |
| `PERPLEXITY_API_KEY` | Yes | Perplexity API key |
| `XAI_API_KEY` | Yes | xAI (Grok) API key |
| `HOST` | No | Server host (default: 0.0.0.0) |
| `PORT` | No | Server port (default: 8000) |
| `DEBUG` | No | Debug mode (default: true) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |

## Project Structure

```
backend/
├── main.py           # FastAPI application entry point
├── config.py         # Settings/configuration
├── database.py       # PostgreSQL connection and models
├── cache.py          # Cache layer (read/write from DB)
├── llm_providers.py  # LLM provider classes (OpenAI, Perplexity, xAI)
├── consensus.py      # Claude consensus/synthesis layer
├── art_service.py    # Orchestrator tying it all together
├── models.py         # Pydantic models
├── data.py           # Configuration constants
├── pyproject.toml    # Project config & dependencies (uv/hatch)
└── .env.example      # Environment template
```

## How the LLM Pipeline Works

1. **Parallel Fact-Checking**: 3 providers (OpenAI, Perplexity, xAI) are queried in parallel, each answering:
   - "What was the most popular [art form] from [region] in the [decade]s?"
   - "What was the most timeless [art form] from [region] in the [decade]s?"

2. **Consensus**: 
   - If 2+ providers agree on an artwork, that's the majority choice
   - If no majority, Claude uses judgment to pick the best answer

3. **Final Writing**: Claude synthesizes all responses and writes engaging, casual descriptions focusing on surprising/juicy details

4. **Caching**: Results are stored in PostgreSQL for instant retrieval on subsequent requests

## Error Handling

- Minimum 1/3 providers must succeed for each query type
- If LLM pipeline fails, API returns `found: false`
- Database failures are logged but don't crash the server

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment options including Railway, Render, and Fly.io.

For production, you'll need:
1. A PostgreSQL database (Supabase, Railway, Render, Neon, etc.)
2. All four LLM API keys configured

### Deploy with Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install uv
RUN uv sync --frozen

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
