"""
Aegis Migration Factory — Artifact Service
File I/O for generated artifacts
"""

import json
import shutil
import logging
from pathlib import Path
from typing import Optional, Dict, Any

from core.config import settings

logger = logging.getLogger("aegis.artifacts")


class ArtifactService:
    def __init__(self):
        self.base_dir = Path(settings.ARTIFACTS_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def get_job_dir(self, job_id: str) -> Path:
        """Get the artifacts directory for a job."""
        job_dir = self.base_dir / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        return job_dir

    def get_terraform_zip_path(self, job_id: str) -> Optional[Path]:
        """Get path to terraform.zip if it exists."""
        path = self.base_dir / job_id / "terraform.zip"
        return path if path.exists() else None

    def get_audit_pdf_path(self, job_id: str) -> Optional[Path]:
        """Get path to audit_report.pdf if it exists."""
        path = self.base_dir / job_id / "audit_report.pdf"
        return path if path.exists() else None

    def get_iam_policies(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Load IAM policies JSON."""
        consolidated = self.base_dir / job_id / "iam" / "all_policies.json"
        if consolidated.exists():
            try:
                return json.loads(consolidated.read_text(encoding="utf-8"))
            except Exception as e:
                logger.warning(f"Failed to load IAM policies: {e}")

        # Fallback: load individual policy files
        iam_dir = self.base_dir / job_id / "iam"
        if not iam_dir.exists():
            return None

        policies = []
        for f in iam_dir.glob("*.json"):
            if f.name == "all_policies.json":
                continue
            try:
                policies.append(json.loads(f.read_text(encoding="utf-8")))
            except Exception:
                pass

        return policies if policies else None

    def delete_job_artifacts(self, job_id: str) -> bool:
        """Delete all artifacts for a job."""
        job_dir = self.base_dir / job_id
        if job_dir.exists():
            try:
                shutil.rmtree(job_dir)
                logger.info(f"Deleted artifacts for job {job_id}")
                return True
            except Exception as e:
                logger.error(f"Failed to delete artifacts for {job_id}: {e}")
                return False
        return True

    def list_job_artifacts(self, job_id: str) -> Dict[str, bool]:
        """List which artifacts exist for a job."""
        job_dir = self.base_dir / job_id
        return {
            "terraform_zip": (job_dir / "terraform.zip").exists(),
            "audit_pdf": (job_dir / "audit_report.pdf").exists(),
            "iam_policies": (job_dir / "iam").exists(),
            "input": (job_dir / "input").exists(),
            "terraform": (job_dir / "terraform").exists(),
        }


# Singleton instance
artifact_service = ArtifactService()
