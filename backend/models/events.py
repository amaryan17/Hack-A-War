"""
Aegis Migration Factory — SSE Event Models
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class SSELogEvent(BaseModel):
    ts: str
    agent: str
    level: str
    message: str
    data: Dict[str, Any] = {}


class SSEProgressEvent(BaseModel):
    stage: int
    status: str
    agent: str


class SSECompleteEvent(BaseModel):
    status: str = "COMPLETE"
    job_id: str


class SSEErrorEvent(BaseModel):
    status: str = "FAILED"
    error: str
    agent: Optional[str] = None


class SSEPingEvent(BaseModel):
    ts: str
