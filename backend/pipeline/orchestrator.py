"""
Aegis Migration Factory — Pipeline Orchestrator
Runs all 5 agents sequentially, manages state and streaming
"""

import json
import time
import asyncio
import zipfile
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

from core.config import settings
from core.claude import ClaudeClient
from pipeline.ingestion import FileManifest
from models.job import JobStatus, StageStatus
from models.agent_outputs import (
    TechDebtOutput, TranslatorOutput, ArchitectOutput,
    SecurityOutput, AuditOutput,
)
from agents.tech_debt import TechDebtScanner
from agents.translator import MigrationTranslator
from agents.architect import SolutionArchitect
from agents.security import SecurityEnforcer
from agents.audit import AuditCompiler
from services import job_service

logger = logging.getLogger("aegis.orchestrator")


class PipelineOrchestrator:
    def __init__(self, job_id: str, manifest: FileManifest, demo_mode: bool = False):
        self.job_id = job_id
        self.manifest = manifest
        self.demo_mode = demo_mode or settings.DEMO_MODE
        self.claude = ClaudeClient(
            api_key=settings.ANTHROPIC_API_KEY,
            model=settings.CLAUDE_MODEL,
        )
        self.artifacts_dir = Path(settings.ARTIFACTS_DIR) / job_id

    async def run(self) -> dict:
        """Execute all 5 agents sequentially."""
        final_output = {}

        try:
            await job_service.append_log(
                self.job_id, "SYSTEM", "INFO",
                "Aegis Migration Pipeline started"
            )

            # Agent 1: Tech Debt Scanner
            tech_debt = await self._run_agent_1()
            final_output["tech_debt"] = tech_debt.model_dump() if hasattr(tech_debt, 'model_dump') else tech_debt
            await job_service.update_output(self.job_id, "tech_debt", final_output["tech_debt"])

            # Agent 2: Migration Translator
            translator = await self._run_agent_2(tech_debt)
            final_output["translator"] = translator.model_dump() if hasattr(translator, 'model_dump') else translator
            await job_service.update_output(self.job_id, "translator", final_output["translator"])

            # Agent 3: Solution Architect
            architect = await self._run_agent_3(translator)
            final_output["architect"] = architect.model_dump() if hasattr(architect, 'model_dump') else architect
            await job_service.update_output(self.job_id, "architect", final_output["architect"])

            # Agent 4: Security Enforcer
            security = await self._run_agent_4(translator)
            final_output["security"] = security.model_dump() if hasattr(security, 'model_dump') else security
            await job_service.update_output(self.job_id, "security", final_output["security"])

            # Agent 5: Audit Compiler
            audit = await self._run_agent_5(final_output)
            final_output["audit"] = audit.model_dump() if hasattr(audit, 'model_dump') else audit
            await job_service.update_output(self.job_id, "audit", final_output["audit"])

            # Post-processing: Write artifacts
            await self._write_terraform_files(translator)
            await self._write_iam_files(security)
            await self._generate_pdf(audit)

            # Mark complete
            await job_service.update_status(self.job_id, JobStatus.COMPLETE.value)
            await job_service.append_log(
                self.job_id, "SYSTEM", "SUCCESS",
                "Pipeline complete! All artifacts generated."
            )

            return final_output

        except Exception as e:
            logger.error(f"Pipeline failed for job {self.job_id}: {e}", exc_info=True)
            await job_service.fail_job(
                self.job_id,
                str(e),
                "SYSTEM",
            )
            raise

    async def _run_agent_1(self) -> TechDebtOutput:
        """Run Tech Debt Scanner."""
        return await self._run_agent(
            agent_class=TechDebtScanner,
            stage_idx=0,
            status_name=JobStatus.SCANNING.value,
            agent_display="TechDebtScanner",
            manifest=self.manifest,
        )

    async def _run_agent_2(self, debt_output: TechDebtOutput) -> TranslatorOutput:
        """Run Migration Translator."""
        return await self._run_agent(
            agent_class=MigrationTranslator,
            stage_idx=1,
            status_name=JobStatus.TRANSLATING.value,
            agent_display="MigrationTranslator",
            manifest=self.manifest,
            debt_output=debt_output,
        )

    async def _run_agent_3(self, translator_output: TranslatorOutput) -> ArchitectOutput:
        """Run Solution Architect."""
        return await self._run_agent(
            agent_class=SolutionArchitect,
            stage_idx=2,
            status_name=JobStatus.ARCHITECTING.value,
            agent_display="SolutionArchitect",
            translator_output=translator_output,
        )

    async def _run_agent_4(self, translator_output: TranslatorOutput) -> SecurityOutput:
        """Run Security Enforcer."""
        return await self._run_agent(
            agent_class=SecurityEnforcer,
            stage_idx=3,
            status_name=JobStatus.SECURING.value,
            agent_display="SecurityEnforcer",
            manifest=self.manifest,
            translator_output=translator_output,
        )

    async def _run_agent_5(self, all_outputs: dict) -> AuditOutput:
        """Run Audit Compiler."""
        return await self._run_agent(
            agent_class=AuditCompiler,
            stage_idx=4,
            status_name=JobStatus.AUDITING.value,
            agent_display="AuditCompiler",
            all_outputs=all_outputs,
        )

    async def _run_agent(
        self,
        agent_class,
        stage_idx: int,
        status_name: str,
        agent_display: str,
        **kwargs,
    ):
        """Generic agent runner with logging, progress, and error handling."""
        start_time = time.time()

        await job_service.append_log(
            self.job_id, agent_display, "INFO",
            f"Starting {agent_display}..."
        )
        await job_service.update_status(self.job_id, status_name)
        await job_service.update_progress(
            self.job_id, stage_idx, StageStatus.RUNNING.value
        )

        try:
            if self.demo_mode:
                result = await self._load_demo_output(stage_idx, agent_class)
            else:
                # Create token callback for streaming
                async def on_token(token: str):
                    await job_service.append_log(
                        self.job_id, agent_display, "STREAM", token
                    )

                agent = agent_class(
                    claude_client=self.claude,
                    on_token=on_token,
                )
                result = await agent.run(**kwargs)

            duration_ms = int((time.time() - start_time) * 1000)

            await job_service.update_progress(
                self.job_id, stage_idx, StageStatus.COMPLETED.value,
                duration_ms=duration_ms,
            )
            await job_service.append_log(
                self.job_id, agent_display, "SUCCESS",
                f"{agent_display} completed in {duration_ms}ms"
            )

            return result

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            await job_service.update_progress(
                self.job_id, stage_idx, StageStatus.FAILED.value,
                duration_ms=duration_ms,
            )
            await job_service.fail_job(self.job_id, str(e), agent_display)
            raise

    async def _load_demo_output(self, stage_idx: int, agent_class):
        """Load pre-baked demo output with realistic delay."""
        demo_files = {
            0: "agent1_output.json",
            1: "agent2_output.json",
            2: "agent3_output.json",
            3: "agent4_output.json",
            4: "agent5_output.json",
        }

        filename = demo_files.get(stage_idx)
        demo_path = Path(__file__).parent.parent / "fixtures" / "demo_outputs" / filename

        # Simulate processing time
        delays = [3, 5, 4, 4, 3]
        delay = delays[stage_idx] if stage_idx < len(delays) else 3

        # Stream fake tokens during delay
        agent_name = agent_class.name if hasattr(agent_class, 'name') else "Agent"
        messages = [
            f"Analyzing infrastructure components...",
            f"Processing resource relationships...",
            f"Generating output...",
            f"Validating results...",
        ]
        for i, msg in enumerate(messages):
            await job_service.append_log(
                self.job_id, agent_name, "STREAM", msg
            )
            await asyncio.sleep(delay / len(messages))

        # Load pre-baked output
        if demo_path.exists():
            with open(demo_path, "r") as f:
                raw = json.load(f)
            agent_instance = agent_class.__new__(agent_class)
            return agent_instance.parse_output(raw)
        else:
            logger.warning(f"Demo file not found: {demo_path}. Using empty output.")
            agent_instance = agent_class.__new__(agent_class)
            return agent_instance.parse_output({})

    async def _write_terraform_files(self, translator_output: TranslatorOutput):
        """Write generated Terraform files and create ZIP."""
        tf_dir = self.artifacts_dir / "terraform"
        tf_dir.mkdir(parents=True, exist_ok=True)

        tf_files = translator_output.terraform_files
        for filename, content in tf_files.items():
            file_path = tf_dir / filename
            file_path.write_text(content, encoding="utf-8")
            logger.info(f"Wrote {file_path}")

        # Create terraform.zip
        zip_path = self.artifacts_dir / "terraform.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for tf_file in tf_dir.rglob("*.tf"):
                zf.write(tf_file, tf_file.name)

        logger.info(f"Created {zip_path}")

    async def _write_iam_files(self, security_output: SecurityOutput):
        """Write IAM policy files as JSON."""
        iam_dir = self.artifacts_dir / "iam"
        iam_dir.mkdir(parents=True, exist_ok=True)

        policies = security_output.iam_policies
        for i, policy in enumerate(policies):
            policy_data = policy.model_dump() if hasattr(policy, 'model_dump') else policy
            filename = f"{policy_data.get('name', f'policy_{i}')}.json"
            file_path = iam_dir / filename
            file_path.write_text(
                json.dumps(policy_data, indent=2),
                encoding="utf-8",
            )

        # Also write consolidated IAM file
        all_policies = [
            p.model_dump() if hasattr(p, 'model_dump') else p
            for p in policies
        ]
        consolidated = iam_dir / "all_policies.json"
        consolidated.write_text(
            json.dumps(all_policies, indent=2),
            encoding="utf-8",
        )
        logger.info(f"Wrote {len(policies)} IAM policies to {iam_dir}")

    async def _generate_pdf(self, audit_output: AuditOutput):
        """Generate the SOC-2 audit PDF."""
        try:
            from services.pdf_service import PDFService
            pdf_service = PDFService(keys_dir=Path(settings.KEYS_DIR))
            audit_data = audit_output.model_dump() if hasattr(audit_output, 'model_dump') else audit_output
            await pdf_service.generate_audit_pdf(audit_data, self.job_id)
            logger.info(f"Audit PDF generated for job {self.job_id}")
        except Exception as e:
            logger.error(f"PDF generation failed: {e}", exc_info=True)
            # Don't fail the pipeline for PDF issues
            await job_service.append_log(
                self.job_id, "SYSTEM", "ERROR",
                f"PDF generation failed: {e}. Other artifacts are still available."
            )
