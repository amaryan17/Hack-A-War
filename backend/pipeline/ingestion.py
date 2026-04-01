"""
Aegis Migration Factory — File Ingestion
ZIP + GitHub repo parser → FileManifest
"""

import json
import zipfile
import shutil
import logging
from pathlib import Path
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from pipeline.hcl_parser import parse_hcl, get_resource_summary
from core.config import settings

logger = logging.getLogger("aegis.ingestion")


@dataclass
class FileManifest:
    tf_files: Dict[str, str] = field(default_factory=dict)        # filename → raw HCL
    tf_parsed: Dict[str, dict] = field(default_factory=dict)      # filename → parsed dict
    python_files: Dict[str, str] = field(default_factory=dict)    # filename → raw Python
    json_files: Dict[str, dict] = field(default_factory=dict)     # filename → parsed JSON
    all_resources: List[dict] = field(default_factory=list)        # flat list of GCP resources
    resource_summary: Dict[str, int] = field(default_factory=dict) # counts by type
    source_type: str = "zip"
    total_files: int = 0


async def ingest_zip(zip_path: Path, job_id: str) -> FileManifest:
    """Extract ZIP and walk directory to build FileManifest."""
    extract_dir = Path(settings.ARTIFACTS_DIR) / job_id / "input"
    extract_dir.mkdir(parents=True, exist_ok=True)

    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(extract_dir)
        logger.info(f"Extracted ZIP to {extract_dir}")
    except Exception as e:
        logger.error(f"ZIP extraction failed: {e}")
        raise RuntimeError(f"Failed to extract ZIP: {e}")

    manifest = _walk_directory(extract_dir)
    manifest.source_type = "zip"
    return manifest


async def ingest_github(repo_url: str, job_id: str) -> FileManifest:
    """Clone GitHub repo and walk directory to build FileManifest."""
    import tempfile

    clone_dir = Path(tempfile.gettempdir()) / f"{job_id}_repo"

    try:
        import git
        logger.info(f"Cloning {repo_url} to {clone_dir}")
        git.Repo.clone_from(repo_url, str(clone_dir), depth=1)

        manifest = _walk_directory(clone_dir)
        manifest.source_type = "github"
        return manifest
    except Exception as e:
        logger.error(f"GitHub clone failed: {e}")
        raise RuntimeError(f"Failed to clone repository: {e}")
    finally:
        # Clean up cloned repo
        if clone_dir.exists():
            try:
                shutil.rmtree(clone_dir)
            except Exception:
                pass


async def ingest_demo(job_id: str) -> FileManifest:
    """Load the sample GCP fixtures for demo mode."""
    fixtures_dir = Path(__file__).parent.parent / "fixtures" / "sample-gcp"

    if not fixtures_dir.exists():
        logger.warning("Demo fixtures not found, creating minimal manifest")
        return FileManifest(source_type="demo", total_files=0)

    # Copy fixtures to job input directory
    input_dir = Path(settings.ARTIFACTS_DIR) / job_id / "input"
    input_dir.mkdir(parents=True, exist_ok=True)

    try:
        shutil.copytree(fixtures_dir, input_dir, dirs_exist_ok=True)
    except Exception as e:
        logger.warning(f"Failed to copy demo fixtures: {e}")

    manifest = _walk_directory(fixtures_dir)
    manifest.source_type = "demo"
    return manifest


def _walk_directory(path: Path) -> FileManifest:
    """Walk directory recursively and build FileManifest."""
    manifest = FileManifest()
    total_files = 0

    for file_path in path.rglob("*"):
        if file_path.is_dir():
            continue
        if file_path.name.startswith("."):
            continue

        total_files += 1
        relative_name = file_path.name
        # Use path relative to root if nested
        try:
            rel = file_path.relative_to(path)
            if len(rel.parts) > 1:
                relative_name = str(rel)
        except ValueError:
            pass

        suffix = file_path.suffix.lower()

        try:
            if suffix == ".tf":
                content = file_path.read_text(encoding="utf-8", errors="replace")
                manifest.tf_files[relative_name] = content

                parsed, resources = parse_hcl(content, relative_name)
                if parsed:
                    manifest.tf_parsed[relative_name] = parsed
                manifest.all_resources.extend(resources)

            elif suffix == ".py":
                content = file_path.read_text(encoding="utf-8", errors="replace")
                manifest.python_files[relative_name] = content

            elif suffix == ".json":
                content = file_path.read_text(encoding="utf-8", errors="replace")
                try:
                    manifest.json_files[relative_name] = json.loads(content)
                except json.JSONDecodeError:
                    logger.warning(f"JSON parse failed for {relative_name}")

        except Exception as e:
            logger.warning(f"Error processing {relative_name}: {e}")
            continue

    manifest.total_files = total_files
    manifest.resource_summary = get_resource_summary(manifest.all_resources)
    logger.info(
        f"Ingestion complete: {total_files} files, "
        f"{len(manifest.tf_files)} .tf, "
        f"{len(manifest.all_resources)} resources"
    )
    return manifest
