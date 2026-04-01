"""
Aegis Migration Factory — Streaming Endpoints
SSE + WebSocket for real-time pipeline updates
"""

import json
import asyncio
import logging
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

from core.redis_client import get_redis
from services import job_service
from models.job import JobStatus

logger = logging.getLogger("aegis.routers.stream")

router = APIRouter(tags=["streaming"])


@router.get("/api/jobs/{job_id}/stream")
async def stream_job(job_id: str):
    """
    Server-Sent Events endpoint.
    Streams logs, progress updates, and completion/failure events.
    """

    async def event_generator():
        cursor = 0
        last_status = None
        ping_counter = 0

        while True:
            try:
                # Check job status
                job = await job_service.get_job(job_id)

                if job is None:
                    yield _sse_event("error", {
                        "status": "FAILED",
                        "error": "Job not found",
                    })
                    break

                current_status = job.get("status", "")

                # Send status change event
                if current_status != last_status:
                    last_status = current_status

                    if current_status == JobStatus.COMPLETE.value:
                        yield _sse_event("complete", {
                            "status": "COMPLETE",
                            "job_id": job_id,
                        })
                        break

                    if current_status == JobStatus.FAILED.value:
                        yield _sse_event("error", {
                            "status": "FAILED",
                            "error": job.get("error", "Unknown error"),
                            "agent": "",
                        })
                        break

                # Send new logs
                logs, next_cursor = await job_service.get_logs_since(job_id, cursor)
                for log_entry in logs:
                    yield _sse_event("log", log_entry)

                    # Send progress events for non-STREAM log levels
                    if log_entry.get("level") != "STREAM":
                        progress = job.get("progress", {})
                        current_stage = progress.get("current_stage", 0)
                        stages = progress.get("stages", [])
                        agent_name = stages[current_stage]["name"] if current_stage < len(stages) else ""
                        stage_status = stages[current_stage]["status"] if current_stage < len(stages) else ""

                        yield _sse_event("progress", {
                            "stage": current_stage,
                            "status": stage_status,
                            "agent": agent_name,
                        })

                cursor = next_cursor

                # Ping every ~15 seconds (75 iterations × 200ms)
                ping_counter += 1
                if ping_counter >= 75:
                    yield _sse_event("ping", {
                        "ts": datetime.utcnow().isoformat() + "Z",
                    })
                    ping_counter = 0

                await asyncio.sleep(0.2)  # Poll every 200ms

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"SSE error for job {job_id}: {e}")
                yield _sse_event("error", {
                    "status": "FAILED",
                    "error": str(e),
                })
                break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


@router.websocket("/ws/jobs/{job_id}")
async def websocket_job(websocket: WebSocket, job_id: str):
    """
    WebSocket endpoint for real-time job updates.
    Subscribes to Redis pub/sub channel for the job.
    """
    await websocket.accept()

    redis = await get_redis()
    pubsub = None

    try:
        if redis:
            pubsub = redis.pubsub()
            await pubsub.subscribe(f"job:{job_id}:events")

            while True:
                # Check for pub/sub messages
                message = await pubsub.get_message(
                    ignore_subscribe_messages=True,
                    timeout=0.1,
                )

                if message and message["type"] == "message":
                    data = message["data"]
                    if isinstance(data, bytes):
                        data = data.decode("utf-8")
                    try:
                        parsed = json.loads(data)
                        await websocket.send_json(parsed)

                        # Close on completion or failure
                        if parsed.get("type") in ("complete", "error"):
                            break
                    except json.JSONDecodeError:
                        await websocket.send_text(data)

                await asyncio.sleep(0.05)
        else:
            # Fallback: poll Redis directly if pub/sub unavailable
            cursor = 0
            while True:
                job = await job_service.get_job(job_id)
                if job is None:
                    await websocket.send_json({
                        "type": "error",
                        "error": "Job not found",
                    })
                    break

                logs, next_cursor = await job_service.get_logs_since(job_id, cursor)
                for log_entry in logs:
                    await websocket.send_json({"type": "log", **log_entry})
                cursor = next_cursor

                status = job.get("status", "")
                if status == JobStatus.COMPLETE.value:
                    await websocket.send_json({
                        "type": "complete",
                        "status": "COMPLETE",
                        "job_id": job_id,
                    })
                    break
                elif status == JobStatus.FAILED.value:
                    await websocket.send_json({
                        "type": "error",
                        "status": "FAILED",
                        "error": job.get("error", ""),
                    })
                    break

                await asyncio.sleep(0.2)

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for job {job_id}")
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {e}")
    finally:
        if pubsub:
            try:
                await pubsub.unsubscribe(f"job:{job_id}:events")
                await pubsub.close()
            except Exception:
                pass


def _sse_event(event_type: str, data: dict) -> str:
    """Format a Server-Sent Event string."""
    json_data = json.dumps(data, default=str)
    return f"event: {event_type}\ndata: {json_data}\n\n"
