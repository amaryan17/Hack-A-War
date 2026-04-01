"""
Aegis Migration Factory — Agent 5: Audit Compiler
SOC-2 Type II compliance assessment
"""

import json
import logging
from typing import Any

from agents.base import BaseAgent
from models.agent_outputs import AuditOutput

logger = logging.getLogger("aegis.agents.audit")

SYSTEM_PROMPT = """You are a SOC-2 Type II compliance auditor. You will analyze a cloud infrastructure migration and generate a comprehensive compliance report.

Evaluate against SOC-2 Trust Service Criteria:

CC6 — Logical and Physical Access Controls:
  CC6.1: Logical access security measures restrict access
  CC6.2: Prior to issuing credentials, registered and authorized
  CC6.3: Role-based access with least privilege
  CC6.6: Logical access security measures for system boundaries
  CC6.7: Transmission of confidential information protected
  CC6.8: Controls prevent unauthorized access

CC7 — System Operations:
  CC7.1: Detection and monitoring of vulnerabilities
  CC7.2: Monitoring infrastructure for anomalies
  CC7.3: Procedures to evaluate security events
  CC7.4: Security incidents are identified and responded to
  CC7.5: Recovery from identified security incidents

CC8 — Change Management:
  CC8.1: Infrastructure changes are authorized and documented

A1 — Availability:
  A1.1: Capacity planning and monitoring
  A1.2: Environmental threats and business continuity
  A1.3: Recovery objectives are achieved

For each criterion, provide:
- Status: SATISFIED | PARTIALLY_SATISFIED | NOT_SATISFIED
- Evidence: What in the infrastructure satisfies this criterion
- Gaps: What is missing
- Recommendations: How to remediate gaps

Risk matrix entries:
  { risk_id, description, likelihood (1-5), impact (1-5), risk_score (likelihood×impact), mitigation, residual_risk }

Respond with a JSON object matching this schema:
{
  "report_metadata": {
    "title": "Aegis Migration Factory — SOC-2 Type II Compliance Assessment",
    "generated_at": "<ISO timestamp>",
    "migration_scope": "GCP to AWS Migration",
    "auditor": "Aegis AI Audit Engine v1.0",
    "overall_compliance_score": <int>
  },
  "executive_summary": "<multi-paragraph string>",
  "trust_service_criteria": {
    "CC6": {
      "name": "Logical and Physical Access Controls",
      "overall_status": "SATISFIED|PARTIALLY_SATISFIED|NOT_SATISFIED",
      "score": <int>,
      "criteria": {
        "CC6.1": { "status": "<status>", "evidence": "<string>", "gaps": [<strings>], "recommendations": [<strings>] }
      }
    }
  },
  "findings": [
    { "finding_id": "<string>", "severity": "HIGH|MEDIUM|LOW|INFORMATIONAL", "category": "<string>", "title": "<string>", "description": "<string>", "affected_resources": [<strings>], "recommendation": "<string>", "remediation_effort": "LOW|MEDIUM|HIGH" }
  ],
  "risk_matrix": [
    { "risk_id": "<string>", "description": "<string>", "likelihood": <int>, "impact": <int>, "risk_score": <int>, "mitigation": "<string>", "residual_risk": <int> }
  ],
  "controls_satisfied": [<strings>],
  "controls_partial": [<strings>],
  "controls_failed": [<strings>],
  "recommendations": [<strings>]
}

CRITICAL: Respond ONLY with valid JSON. No markdown fences. No explanation. Just the raw JSON object."""


class AuditCompiler(BaseAgent):
    name = "AuditCompiler"
    stage_index = 4

    def get_system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def build_user_message(self, **kwargs) -> str:
        all_outputs = kwargs.get("all_outputs", {})

        tech_debt = all_outputs.get("tech_debt", {})
        translator = all_outputs.get("translator", {})
        architect = all_outputs.get("architect", {})
        security = all_outputs.get("security", {})

        # Serialize outputs safely
        def safe_dump(obj):
            if hasattr(obj, 'model_dump'):
                return obj.model_dump()
            return obj

        return (
            f"Generate a SOC-2 Type II compliance assessment for this migration.\n\n"
            f"=== Tech Debt Analysis ===\n"
            f"{json.dumps(safe_dump(tech_debt), indent=2, default=str)}\n\n"
            f"=== Terraform Translation ===\n"
            f"{json.dumps(safe_dump(translator), indent=2, default=str)}\n\n"
            f"=== Architecture & Cost ===\n"
            f"{json.dumps(safe_dump(architect), indent=2, default=str)}\n\n"
            f"=== Security & IAM ===\n"
            f"{json.dumps(safe_dump(security), indent=2, default=str)}\n\n"
            f"Produce the complete SOC-2 compliance report."
        )

    def parse_output(self, raw: dict) -> AuditOutput:
        try:
            return AuditOutput(**raw)
        except Exception as e:
            logger.warning(f"Failed to parse Audit output: {e}. Using defaults.")
            output = AuditOutput()
            output.executive_summary = raw.get("executive_summary", "")
            output.recommendations = raw.get("recommendations", [])
            if "report_metadata" in raw:
                try:
                    from models.agent_outputs import ReportMetadata
                    output.report_metadata = ReportMetadata(**raw["report_metadata"])
                except Exception:
                    pass
            return output
