"""
Aegis Migration Factory — Agent 1: Tech Debt Scanner
Analyzes GCP infrastructure for technical debt, security issues, and deprecated patterns
"""

import json
import logging
from typing import Any

from agents.base import BaseAgent
from models.agent_outputs import TechDebtOutput

logger = logging.getLogger("aegis.agents.tech_debt")

SYSTEM_PROMPT = """You are a senior cloud architect specializing in GCP infrastructure analysis.
You will receive a list of GCP Terraform resources and raw file contents.
Your job is to perform a comprehensive technical debt analysis.

Analyze for:
1. DEPRECATED APIs: google_compute_project_metadata_item, old SSL policies, deprecated machine types (n1-standard-* prefer n2), deprecated disk types
2. SECURITY ISSUES: hardcoded secrets in variables, overly permissive firewall rules (allow 0.0.0.0/0 on sensitive ports), missing CMEK encryption, public buckets, missing VPC Service Controls
3. COUPLING ISSUES: resources in wrong modules, cross-project dependencies, missing variable abstractions, hardcoded project IDs
4. DEPRECATED PATTERNS: old-style provider blocks, missing required_providers, no backend configuration, legacy interpolation syntax ${...}
5. MISSING BEST PRACTICES: no labels/tags, no lifecycle rules on buckets, no deletion_protection on databases, no backup policies

For each file, provide a health_score (0-100) where:
  90-100: Production ready
  70-89:  Minor issues
  50-69:  Significant debt
  0-49:   Critical issues

Respond with a JSON object matching this schema:
{
  "overall_health_score": <int>,
  "files": {
    "<filename>": {
      "health_score": <int>,
      "issues": [
        {
          "severity": "HIGH|MEDIUM|LOW",
          "type": "DEPRECATED_API|SECURITY|COUPLING|MISSING_BEST_PRACTICE",
          "resource": "<resource_address>",
          "description": "<description>",
          "suggestion": "<suggestion>"
        }
      ]
    }
  },
  "summary": {
    "total_issues": <int>,
    "critical": <int>,
    "high": <int>,
    "medium": <int>,
    "low": <int>,
    "deprecated_resources": [<strings>],
    "security_violations": [<strings>],
    "resource_inventory": { "<category>": <count> }
  },
  "recommendations": [<strings>]
}

CRITICAL: Respond ONLY with valid JSON. No markdown fences. No explanation. Just the raw JSON object."""


class TechDebtScanner(BaseAgent):
    name = "TechDebtScanner"
    stage_index = 0

    def get_system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def build_user_message(self, **kwargs) -> str:
        manifest = kwargs.get("manifest")
        resources_json = json.dumps(manifest.all_resources, indent=2, default=str)
        file_contents = "\n".join(
            f"=== {k} ===\n{v}" for k, v in manifest.tf_files.items()
        )
        return (
            f"Analyze these GCP Terraform resources:\n{resources_json}\n\n"
            f"Raw file contents:\n{file_contents}"
        )

    def parse_output(self, raw: dict) -> TechDebtOutput:
        try:
            return TechDebtOutput(**raw)
        except Exception as e:
            logger.warning(f"Failed to parse TechDebt output fully: {e}. Using defaults.")
            output = TechDebtOutput()
            output.overall_health_score = raw.get("overall_health_score", 50)
            output.recommendations = raw.get("recommendations", [])
            return output
