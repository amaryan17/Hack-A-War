"""
Aegis Migration Factory — REST API Endpoints
"""

import asyncio
import logging
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse

from core.config import settings
from services import job_service
from services.artifact_service import artifact_service
from pipeline.ingestion import ingest_zip, ingest_github, ingest_demo
from pipeline.orchestrator import PipelineOrchestrator
from models.job import JobStatus

logger = logging.getLogger("aegis.routers.jobs")

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("/upload")
async def upload_job(
    file: UploadFile = File(None),
    github_url: str = Form(None),
    demo: str = Form(None),
):
    """
    Create a new migration job.
    Accept ZIP file upload, GitHub URL, or demo mode.
    """
    try:
        is_demo = demo == "true" or (not file and not github_url)

        if is_demo:
            # Demo mode
            job_id = await job_service.create_job(
                filename="sample-gcp-demo",
                mode="demo",
            )
            await job_service.append_log(
                job_id, "SYSTEM", "INFO",
                "Demo mode activated — using sample GCP fixtures"
            )

            # Start pipeline in background
            async def run_demo():
                try:
                    await job_service.update_status(job_id, JobStatus.INGESTING.value)
                    manifest = await ingest_demo(job_id)
                    await job_service.append_log(
                        job_id, "SYSTEM", "INFO",
                        f"Ingested {manifest.total_files} files, {len(manifest.all_resources)} resources"
                    )
                    orchestrator = PipelineOrchestrator(
                        job_id=job_id,
                        manifest=manifest,
                        demo_mode=True,
                    )
                    await orchestrator.run()
                except Exception as e:
                    logger.error(f"Demo pipeline failed: {e}", exc_info=True)
                    await job_service.fail_job(job_id, str(e), "SYSTEM")

            asyncio.create_task(run_demo())

        elif github_url:
            # GitHub clone mode
            job_id = await job_service.create_job(
                filename=github_url,
                mode="github",
                github_url=github_url,
            )

            async def run_github():
                try:
                    await job_service.update_status(job_id, JobStatus.INGESTING.value)
                    await job_service.append_log(
                        job_id, "SYSTEM", "INFO",
                        f"Cloning repository: {github_url}"
                    )
                    manifest = await ingest_github(github_url, job_id)
                    await job_service.append_log(
                        job_id, "SYSTEM", "INFO",
                        f"Ingested {manifest.total_files} files, {len(manifest.all_resources)} resources"
                    )
                    orchestrator = PipelineOrchestrator(
                        job_id=job_id,
                        manifest=manifest,
                    )
                    await orchestrator.run()
                except Exception as e:
                    logger.error(f"GitHub pipeline failed: {e}", exc_info=True)
                    await job_service.fail_job(job_id, str(e), "SYSTEM")

            asyncio.create_task(run_github())

        elif file:
            # ZIP upload mode
            if not file.filename.endswith(".zip"):
                raise HTTPException(status_code=400, detail="Only .zip files are accepted")

            # Check file size
            content = await file.read()
            max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
            if len(content) > max_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit"
                )

            job_id = await job_service.create_job(
                filename=file.filename,
                mode="upload",
            )

            # Save ZIP to artifacts
            artifacts_dir = Path(settings.ARTIFACTS_DIR) / job_id
            artifacts_dir.mkdir(parents=True, exist_ok=True)
            zip_path = artifacts_dir / "upload.zip"
            with open(zip_path, "wb") as f:
                f.write(content)

            async def run_upload():
                try:
                    await job_service.update_status(job_id, JobStatus.INGESTING.value)
                    await job_service.append_log(
                        job_id, "SYSTEM", "INFO",
                        f"Processing upload: {file.filename} ({len(content)} bytes)"
                    )
                    manifest = await ingest_zip(zip_path, job_id)
                    await job_service.append_log(
                        job_id, "SYSTEM", "INFO",
                        f"Ingested {manifest.total_files} files, {len(manifest.all_resources)} resources"
                    )
                    orchestrator = PipelineOrchestrator(
                        job_id=job_id,
                        manifest=manifest,
                    )
                    await orchestrator.run()
                except Exception as e:
                    logger.error(f"Upload pipeline failed: {e}", exc_info=True)
                    await job_service.fail_job(job_id, str(e), "SYSTEM")

            asyncio.create_task(run_upload())
        else:
            raise HTTPException(
                status_code=400,
                detail="Provide a ZIP file, GitHub URL, or set demo=true"
            )

        # Return immediately with job_id
        job = await job_service.get_job(job_id)
        return {
            "job_id": job_id,
            "status": "PENDING",
            "created_at": job["created_at"] if job else "",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get full job object."""
    job = await job_service.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{job_id}/logs")
async def get_logs(job_id: str, cursor: int = 0):
    """Get logs since cursor position."""
    logs, next_cursor = await job_service.get_logs_since(job_id, cursor)
    return {"logs": logs, "next_cursor": next_cursor}


@router.get("/{job_id}/terraform")
async def download_terraform(job_id: str):
    """Download generated Terraform ZIP."""
    job = await job_service.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != JobStatus.COMPLETE.value:
        raise HTTPException(status_code=400, detail="Job not yet complete")

    zip_path = artifact_service.get_terraform_zip_path(job_id)
    if zip_path is None:
        raise HTTPException(status_code=404, detail="Terraform ZIP not found")

    return FileResponse(
        path=str(zip_path),
        media_type="application/zip",
        filename="aegis-terraform.zip",
        headers={"Content-Disposition": 'attachment; filename="aegis-terraform.zip"'},
    )


@router.get("/{job_id}/iam")
async def get_iam_policies(job_id: str):
    """Get IAM policies JSON."""
    job = await job_service.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != JobStatus.COMPLETE.value:
        raise HTTPException(status_code=400, detail="Job not yet complete")

    policies = artifact_service.get_iam_policies(job_id)
    if policies is None:
        raise HTTPException(status_code=404, detail="IAM policies not found")

    return JSONResponse(content=policies)


@router.get("/{job_id}/audit-pdf")
async def download_audit_pdf(job_id: str):
    """Download SOC-2 audit PDF."""
    job = await job_service.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != JobStatus.COMPLETE.value:
        raise HTTPException(status_code=400, detail="Job not yet complete")

    pdf_path = artifact_service.get_audit_pdf_path(job_id)
    if pdf_path is None:
        raise HTTPException(status_code=404, detail="Audit PDF not found")

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename="aegis-soc2-audit.pdf",
        headers={"Content-Disposition": 'attachment; filename="aegis-soc2-audit.pdf"'},
    )


@router.delete("/{job_id}")
async def delete_job(job_id: str):
    """Delete job and all artifacts."""
    await job_service.delete_job(job_id)
    artifact_service.delete_job_artifacts(job_id)
    return JSONResponse(status_code=204, content=None)
