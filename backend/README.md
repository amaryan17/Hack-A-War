# Aegis Migration Factory — Backend

**AI-powered GCP to AWS migration pipeline**

## Quick Start

### With Docker (Recommended)
```bash
# 1. Create .env from example
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 2. Start everything
docker-compose up --build

# API is now at http://localhost:8000
```

### Without Docker
```bash
# 1. Install Python 3.11+
# 2. Install dependencies
pip install -r requirements.txt

# 3. Start Redis (required)
redis-server

# 4. Create .env
cp .env.example .env

# 5. Run
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Demo Mode (No API Key Required)
```bash
DEMO_MODE=true docker-compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/jobs/upload` | Upload ZIP, GitHub URL, or start demo |
| `GET` | `/api/jobs/{id}` | Get job status & output |
| `GET` | `/api/jobs/{id}/logs?cursor=0` | Get logs since cursor |
| `GET` | `/api/jobs/{id}/stream` | SSE real-time stream |
| `WS` | `/ws/jobs/{id}` | WebSocket real-time stream |
| `GET` | `/api/jobs/{id}/terraform` | Download Terraform ZIP |
| `GET` | `/api/jobs/{id}/iam` | Download IAM policies JSON |
| `GET` | `/api/jobs/{id}/audit-pdf` | Download SOC-2 audit PDF |
| `GET` | `/api/health` | Health check |

## Architecture

```
POST /upload → create_job → ingest (ZIP/GitHub/demo)
                           ↓
                    PipelineOrchestrator.run()
                    ├─ Agent 1: TechDebtScanner
                    ├─ Agent 2: MigrationTranslator
                    ├─ Agent 3: SolutionArchitect
                    ├─ Agent 4: SecurityEnforcer
                    └─ Agent 5: AuditCompiler
                           ↓
                    Write artifacts (Terraform, IAM, PDF)
                           ↓
                    Mark job COMPLETE
```

## Project Structure

```
backend/
├── main.py                    # FastAPI entry point
├── core/
│   ├── config.py              # Pydantic settings
│   ├── redis_client.py        # Async Redis wrapper
│   ├── claude.py              # Anthropic Claude client
│   └── signing.py             # Ed25519 PDF signing
├── models/
│   ├── job.py                 # Job/progress/log models
│   ├── agent_outputs.py       # Typed agent output models
│   └── events.py              # SSE event schemas
├── services/
│   ├── job_service.py         # Job CRUD + Redis state
│   ├── pdf_service.py         # WeasyPrint PDF + signing
│   └── artifact_service.py    # File I/O for artifacts
├── pipeline/
│   ├── hcl_parser.py          # Terraform HCL parser
│   ├── ingestion.py           # ZIP/GitHub/demo ingestion
│   └── orchestrator.py        # 5-agent pipeline runner
├── agents/
│   ├── base.py                # Abstract base agent
│   ├── tech_debt.py           # Agent 1: Tech Debt Scanner
│   ├── translator.py          # Agent 2: Migration Translator
│   ├── architect.py           # Agent 3: Solution Architect
│   ├── security.py            # Agent 4: Security Enforcer
│   └── audit.py               # Agent 5: Audit Compiler
├── routers/
│   ├── jobs.py                # REST API endpoints
│   └── stream.py              # SSE + WebSocket streaming
├── templates/
│   └── audit_report.html      # Jinja2 PDF template
├── fixtures/
│   ├── sample-gcp/            # Demo GCP Terraform files
│   └── demo_outputs/          # Pre-baked agent outputs
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```
