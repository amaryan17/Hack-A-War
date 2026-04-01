"""
Aegis Migration Factory — Job Models
Pydantic models for Job lifecycle management
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    PENDING = "PENDING"
    INGESTING = "INGESTING"
    SCANNING = "SCANNING"
    TRANSLATING = "TRANSLATING"
    ARCHITECTING = "ARCHITECTING"
    SECURING = "SECURING"
    AUDITING = "AUDITING"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"


class StageStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class StageInfo(BaseModel):
    name: str
    status: StageStatus = StageStatus.PENDING
    duration_ms: Optional[int] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class JobProgress(BaseModel):
    current_stage: int = 0
    total_stages: int = 5
    stages: List[StageInfo] = Field(default_factory=lambda: [
        StageInfo(name="Tech Debt Scanner"),
        StageInfo(name="Migration Translator"),
        StageInfo(name="Solution Architect"),
        StageInfo(name="Security Enforcer"),
        StageInfo(name="Audit Compiler"),
    ])


class JobMeta(BaseModel):
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    filename: Optional[str] = None
    mode: str = "upload"  # "upload" | "github" | "demo"
    error: Optional[str] = None
    github_url: Optional[str] = None


class JobCreate(BaseModel):
    filename: Optional[str] = None
    github_url: Optional[str] = None
    demo: bool = False


class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: JobProgress
    created_at: str
    meta: JobMeta
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class JobUploadResponse(BaseModel):
    job_id: str
    status: str
    created_at: str


class LogEvent(BaseModel):
    ts: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    agent: str
    level: str  # INFO | SUCCESS | ERROR | STREAM
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)


class LogPage(BaseModel):
    logs: List[Dict[str, Any]]
    next_cursor: int
