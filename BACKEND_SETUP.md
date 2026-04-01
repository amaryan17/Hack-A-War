# Backend Setup & Integration Guide

## Overview

The **Aegis Migration Factory** backend is a FastAPI application that handles:
- **Migration Job Creation** - Accept ZIP files, GitHub URLs, or demo mode
- **Real-time Streaming** - Server-Sent Events for live progress updates
- **GCP to AWS Migration** - Analyze infrastructure and generate Terraform configurations
- **Artifact Management** - Manage downloads (Terraform, IAM, PDFs)

## Architecture

```
┌─────────────────────────────────────────┐
│   Next.js Frontend (Vercel)             │
│   - Dashboard UI                        │
│   - File Upload                         │
│   - Real-time Progress                  │
└────────────────┬────────────────────────┘
                 │
                 │ HTTP + SSE
                 │
┌────────────────▼────────────────────────┐
│   FastAPI Backend (Local/Docker)        │
│   - /api/jobs/upload                    │
│   - /api/jobs/{id}/stream               │
│   - Artifact downloads                  │
└────────────────┬────────────────────────┘
                 │
                 │ Redis (state)
                 │ Anthropic API (Claude)
                 │
        ┌────────▼────────┐
        │  Services       │
        │  - Ingestion    │
        │  - Pipeline     │
        │  - Artifacts    │
        └─────────────────┘
```

## Quick Start - Local Development

### Prerequisites
- Docker & Docker Compose (easiest)
- OR: Python 3.11+, Redis, Anthropic API key

### Option 1: Run with Docker (Recommended)

```bash
cd backend

# Start Redis + FastAPI
docker-compose up --build

# Backend runs at: http://localhost:8000
```

### Option 2: Run Locally (Python)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start Redis (in separate terminal)
redis-server

# Set environment variables
export ANTHROPIC_API_KEY="your-key-here"
export DEMO_MODE=true  # For testing without API key

# Run backend
uvicorn main:app --reload --port 8000
```

### Option 3: Fix Python Dependency Issues

If you encounter Rust compiler errors with `pydantic-core`:

```bash
# Update requirements to use pre-built wheels
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --only-binary :all:
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Anthropic (Claude API)
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Redis
REDIS_URL=redis://localhost:6379

# FastAPI
DEBUG=false
DEMO_MODE=true

# Limits
MAX_UPLOAD_SIZE_MB=500
```

## Frontend Integration

The frontend is **already configured** to call the backend:

1. **Environment**: `NEXT_PUBLIC_API_URL=http://localhost:8000` (.env.local)
2. **API Client**: `src/lib/api.ts` - All BackendAPI calls
3. **Component**: `src/components/migration-dashboard.tsx` - UI for jobs

### Using the API

```typescript
import { aegisAPI } from "@/lib/api";

// Start demo job
const job = await aegisAPI.startDemo();

// Upload ZIP
const job = await aegisAPI.uploadZip(file);

// Stream progress
const eventSource = aegisAPI.createEventSource(job.job_id);
eventSource.onmessage = (e) => {
  console.log(JSON.parse(e.data));
};
```

## Endpoints Reference

### POST /api/jobs/upload
Create a new migration job.

**Body (multipart/form-data):**
```
file: <File>          # ZIP file (optional)
github_url: <string>  # GitHub URL (optional)
demo: "true"          # Demo mode (optional)
```

**Response:**
```json
{
  "job_id": "uuid-string",
  "filename": "sample.zip",
  "mode": "upload",
  "status": "PENDING",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### GET /api/jobs/{job_id}/stream
Stream job progress updates via Server-Sent Events.

**Response (SSE stream):**
```
data: {"status": "RUNNING", "stage": "Analyzing..."}
data: {"status": "COMPLETED", "progress": {"current_stage": 5, "total_stages": 5}}
```

### GET /api/jobs/{job_id}
Get job details.

### GET /api/jobs/{job_id}/terraform
Download generated Terraform configuration (ZIP file).

### GET /api/jobs/{job_id}/iam
Download IAM policy JSON.

### GET /api/jobs/{job_id}/audit-pdf
Download audit PDF report.

## Testing the Connection

### From Frontend
```bash
cd .
npm run dev

# Visit http://localhost:3000
# Click "Demo Mode" button - should create a job
```

### From Command Line
```bash
# Test backend health
curl http://localhost:8000/

# Expected: {"name": "Aegis Migration Factory", "version": "1.0.0", "status": "ok"}
```

## Deployment

### Frontend (Vercel)
Already deployed! Updates automatically on git push.
- Live: https://aegis-landing-ten.vercel.app

### Backend Options

**Option A: Railway/Render (Recommended)**
1. Push `backend/` to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy
5. Update `NEXT_PUBLIC_API_URL` in frontend

**Option B: Docker on Your Server**
```bash
docker build -t aegis-backend ./backend
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=... \
  -e REDIS_URL=redis://... \
  aegis-backend
```

**Option C: Kubernetes**
See `backend/Dockerfile` for image configuration.

## Troubleshooting

**"Connection refused" error?**
- Is backend running? `curl http://localhost:8000/`
- Wrong port? Check `.env.local` `NEXT_PUBLIC_API_URL`

**"Redis unavailable"?**
- Backend runs without Redis (in-memory mode)
- For production, set `REDIS_URL` env var

**CORS issues?**
- Backend has `CORSMiddleware` with `allow_origins=["*"]`
- Should work from any frontend

**Claude API key errors?**
- Check `ANTHROPIC_API_KEY` is set
- Use `DEMO_MODE=true` to skip API key requirement

## File Structure

```
backend/
├── main.py              # FastAPI app entry
├── core/                # Config, Redis, signing
├── routers/             # API endpoints (jobs, stream)
├── models/              # Data models
├── services/            # Business logic
├── pipeline/            # Migration pipeline
├── agents/              # Claude agents
├── Dockerfile           # Container image
├── docker-compose.yml   # Redis + FastAPI stack
└── requirements.txt     # Python dependencies
```

## Next Steps

1. **Start the backend** using Docker or Python
2. **Visit frontend**: http://localhost:3000
3. **Click "Demo Mode"** to test the integration
4. **Deploy backend** to production service (Railway, Render, etc.)
5. **Update** `NEXT_PUBLIC_API_URL` for production backend URL

---

Need help? Check the logs or GitHub issues!
