"""
Aegis Migration Factory — Job Service
Job CRUD + Redis state management
"""

import json
import uuid
import logging
from datetime import datetime
from typing import Optional, Any, Dict, List, Tuple

from core.redis_client import (
    redis_set, redis_get, redis_get_json,
    redis_lpush, redis_lrange, redis_llen,
    redis_publish, redis_delete, redis_keys,
)
from models.job import JobStatus, JobProgress, JobMeta, StageStatus

logger = logging.getLogger("aegis.jobs")


async def create_job(filename: str = None, mode: str = "upload", github_url: str = None) -> str:
    """Create a new job in Redis. Returns job_id (UUID4)."""
    job_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    meta = JobMeta(
        created_at=now,
        filename=filename,
        mode=mode,
        github_url=github_url,
    )
    progress = JobProgress()

    await redis_set(f"job:{job_id}:status", JobStatus.PENDING.value)
    await redis_set(f"job:{job_id}:meta", meta.model_dump())
    await redis_set(f"job:{job_id}:progress", progress.model_dump())
    await redis_set(f"job:{job_id}:output", {})

    logger.info(f"Job created: {job_id} (mode={mode}, filename={filename})")
    return job_id


async def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    """Get full job object from Redis."""
    status = await redis_get(f"job:{job_id}:status")
    if status is None:
        return None

    meta = await redis_get_json(f"job:{job_id}:meta") or {}
    progress = await redis_get_json(f"job:{job_id}:progress") or {}
    output = await redis_get_json(f"job:{job_id}:output") or {}

    return {
        "job_id": job_id,
        "status": status,
        "progress": progress,
        "created_at": meta.get("created_at", ""),
        "meta": meta,
        "output": output if status == JobStatus.COMPLETE.value else None,
        "error": meta.get("error") if status == JobStatus.FAILED.value else None,
    }


async def update_status(job_id: str, status: str):
    """Update job status."""
    await redis_set(f"job:{job_id}:status", status)
    await _publish_event(job_id, {
        "type": "status",
        "status": status,
        "ts": datetime.utcnow().isoformat() + "Z",
    })
    logger.info(f"Job {job_id}: status → {status}")


async def append_log(
    job_id: str, agent: str, level: str, message: str, data: dict = None
):
    """Append a log event to the job's log list."""
    event = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "agent": agent,
        "level": level,
        "message": message,
        "data": data or {},
    }
    await redis_lpush(f"job:{job_id}:logs", event)
    # Also publish for real-time WebSocket subscribers
    await _publish_event(job_id, {"type": "log", **event})


async def update_output(job_id: str, key: str, value: Any):
    """Update a specific key in the job output."""
    output = await redis_get_json(f"job:{job_id}:output") or {}
    output[key] = value
    await redis_set(f"job:{job_id}:output", output)


async def update_progress(
    job_id: str,
    stage_idx: int,
    status: str,
    duration_ms: int = None,
):
    """Update progress for a specific stage."""
    progress = await redis_get_json(f"job:{job_id}:progress")
    if progress is None:
        progress = JobProgress().model_dump()

    stages = progress.get("stages", [])
    if stage_idx < len(stages):
        stages[stage_idx]["status"] = status
        now = datetime.utcnow().isoformat() + "Z"

        if status == StageStatus.RUNNING.value:
            stages[stage_idx]["started_at"] = now
        elif status in (StageStatus.COMPLETED.value, StageStatus.FAILED.value):
            stages[stage_idx]["completed_at"] = now
            if duration_ms is not None:
                stages[stage_idx]["duration_ms"] = duration_ms

        progress["current_stage"] = stage_idx
        progress["stages"] = stages

    await redis_set(f"job:{job_id}:progress", progress)

    # Publish progress event for SSE/WebSocket
    agent_name = stages[stage_idx]["name"] if stage_idx < len(stages) else "Unknown"
    await _publish_event(job_id, {
        "type": "progress",
        "stage": stage_idx,
        "status": status,
        "agent": agent_name,
        "duration_ms": duration_ms,
        "ts": datetime.utcnow().isoformat() + "Z",
    })


async def fail_job(job_id: str, error: str, agent: str):
    """Mark job as failed with error details."""
    await update_status(job_id, JobStatus.FAILED.value)

    meta = await redis_get_json(f"job:{job_id}:meta") or {}
    meta["error"] = f"[{agent}] {error}"
    await redis_set(f"job:{job_id}:meta", meta)

    await append_log(job_id, agent, "ERROR", f"Pipeline failed: {error}")
    await _publish_event(job_id, {
        "type": "error",
        "status": "FAILED",
        "error": error,
        "agent": agent,
        "ts": datetime.utcnow().isoformat() + "Z",
    })

    logger.error(f"Job {job_id} FAILED at {agent}: {error}")


async def get_logs_since(job_id: str, cursor: int) -> Tuple[List[Dict], int]:
    """Get logs since cursor position. Returns (logs, next_cursor)."""
    total = await redis_llen(f"job:{job_id}:logs")
    if cursor >= total:
        return [], cursor

    raw_logs = await redis_lrange(f"job:{job_id}:logs", cursor, total - 1)
    logs = []
    for raw in raw_logs:
        try:
            if isinstance(raw, str):
                logs.append(json.loads(raw))
            else:
                logs.append(raw)
        except json.JSONDecodeError:
            logs.append({"message": raw, "level": "INFO", "agent": "SYSTEM", "ts": ""})

    return logs, total


async def delete_job(job_id: str):
    """Delete all Redis keys for a job."""
    keys = await redis_keys(f"job:{job_id}:*")
    for key in keys:
        await redis_delete(key)
    logger.info(f"Job {job_id} deleted from Redis")


async def _publish_event(job_id: str, event: dict):
    """Publish event to the job's pub/sub channel."""
    await redis_publish(f"job:{job_id}:events", event)
