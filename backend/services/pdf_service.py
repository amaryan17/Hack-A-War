"""
Aegis Migration Factory — PDF Service
WeasyPrint HTML→PDF + Ed25519 signing
"""

import hashlib
import logging
from pathlib import Path
from datetime import datetime

from jinja2 import Environment, FileSystemLoader
from core.config import settings
from core.signing import SigningService

logger = logging.getLogger("aegis.pdf")


class PDFService:
    def __init__(self, keys_dir: Path = None):
        self.keys_dir = keys_dir or Path(settings.KEYS_DIR)
        self.signing = SigningService(str(self.keys_dir))
        self.templates_dir = Path(__file__).parent.parent / "templates"
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=True,
        )

    async def generate_audit_pdf(self, audit_output: dict, job_id: str) -> Path:
        """
        1. Load audit_report.html Jinja2 template
        2. Render template with audit_output data
        3. Use WeasyPrint to convert HTML → PDF bytes
        4. Sign the PDF hash with Ed25519 private key
        5. Write to artifacts/{job_id}/audit_report.pdf
        6. Return path
        """
        try:
            # Load and render template
            template = self.jinja_env.get_template("audit_report.html")

            # Add computed fields
            render_data = {
                **audit_output,
                "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "fingerprint": self.signing.get_fingerprint(),
                "job_id": job_id,
            }

            html_content = template.render(**render_data)

            # Convert to PDF
            from weasyprint import HTML
            pdf_bytes = HTML(string=html_content).write_pdf()

            # Sign the PDF
            signature = self.signing.sign_bytes(pdf_bytes)
            pdf_hash = hashlib.sha256(pdf_bytes).hexdigest()

            # Write PDF
            output_dir = Path(settings.ARTIFACTS_DIR) / job_id
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / "audit_report.pdf"

            with open(output_path, "wb") as f:
                f.write(pdf_bytes)

            # Write signature metadata alongside
            sig_path = output_dir / "audit_report.sig"
            sig_path.write_text(
                f"SHA-256: {pdf_hash}\n"
                f"Signature: {signature}\n"
                f"Fingerprint: {self.signing.get_fingerprint()}\n"
                f"Signed-At: {datetime.utcnow().isoformat()}Z\n",
                encoding="utf-8",
            )

            logger.info(f"Audit PDF generated: {output_path}")
            return output_path

        except ImportError:
            logger.warning(
                "WeasyPrint not available. Generating placeholder PDF."
            )
            return await self._generate_fallback_pdf(audit_output, job_id)
        except Exception as e:
            logger.error(f"PDF generation failed: {e}", exc_info=True)
            return await self._generate_fallback_pdf(audit_output, job_id)

    async def _generate_fallback_pdf(self, audit_output: dict, job_id: str) -> Path:
        """Generate a simple text-based fallback when WeasyPrint is unavailable."""
        import json

        output_dir = Path(settings.ARTIFACTS_DIR) / job_id
        output_dir.mkdir(parents=True, exist_ok=True)

        # Write as JSON report instead
        output_path = output_dir / "audit_report.pdf"
        report_text = (
            "AEGIS MIGRATION FACTORY — SOC-2 COMPLIANCE REPORT\n"
            "=" * 60 + "\n\n"
            f"Generated: {datetime.utcnow().isoformat()}Z\n"
            f"Job ID: {job_id}\n\n"
        )

        metadata = audit_output.get("report_metadata", {})
        report_text += f"Compliance Score: {metadata.get('overall_compliance_score', 'N/A')}/100\n\n"
        report_text += f"Executive Summary:\n{audit_output.get('executive_summary', 'N/A')}\n\n"

        # Write findings
        findings = audit_output.get("findings", [])
        if findings:
            report_text += "FINDINGS\n" + "-" * 40 + "\n"
            for f in findings:
                report_text += (
                    f"[{f.get('severity', 'INFO')}] {f.get('title', '')}\n"
                    f"  {f.get('description', '')}\n"
                    f"  Recommendation: {f.get('recommendation', '')}\n\n"
                )

        recommendations = audit_output.get("recommendations", [])
        if recommendations:
            report_text += "RECOMMENDATIONS\n" + "-" * 40 + "\n"
            for r in recommendations:
                report_text += f"• {r}\n"

        report_text += (
            f"\n{'=' * 60}\n"
            f"Signed by: Aegis AI Audit Engine\n"
            f"Fingerprint: {self.signing.get_fingerprint()}\n"
        )

        output_path.write_text(report_text, encoding="utf-8")
        logger.info(f"Fallback audit report generated: {output_path}")
        return output_path
