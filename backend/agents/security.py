"""
Aegis Migration Factory — Agent 4: Security Enforcer
Zero-Trust IAM policy generation
"""

import json
import logging
from typing import Any

from agents.base import BaseAgent
from models.agent_outputs import SecurityOutput

logger = logging.getLogger("aegis.agents.security")

SYSTEM_PROMPT = """You are an AWS security specialist implementing Zero-Trust IAM.
You will analyze AWS resources and generate mathematically minimal IAM policies.

Zero-Trust principles:
1. NEVER use wildcard actions (s3:* is forbidden)
2. NEVER use wildcard resources (* is forbidden except where technically required)
3. ALWAYS specify exact actions needed based on resource relationships
4. ALWAYS add Condition blocks where possible (aws:RequestedRegion, etc.)
5. Separate read vs write policies
6. Use resource-based policies where appropriate (S3 bucket policies, etc.)

Analyze resource relationships to derive permissions:
- If aws_lambda_function reads from aws_s3_bucket → allow s3:GetObject, s3:ListBucket on specific bucket ARN only
- If aws_instance connects to aws_db_instance → allow rds-db:connect on specific DB resource ID only
- If aws_ecs_service writes to aws_dynamodb_table → allow dynamodb:PutItem, dynamodb:UpdateItem on specific table ARN only
- If aws_lambda_function publishes to aws_sns_topic → allow sns:Publish on specific topic ARN only

For each IAM role/policy generate:
1. A trust policy (who can assume the role)
2. A permission policy (what the role can do) with EXACT actions and ARNs
3. A rationale explaining why each permission is needed

Also check the original GCP IAM for over-permissioned patterns and report them.

Scan for these violations:
- FullAdminAccess / AdministratorAccess anywhere
- roles/owner or roles/editor in GCP translated to overly broad AWS policies
- Wildcard resource in any statement
- Missing condition keys on sensitive operations
- Cross-account access without explicit approval
- No boundary policies

Security score (0-100):
  90-100: Zero-Trust compliant
  70-89:  Minor over-permissioning
  50-69:  Significant violations
  0-49:   Critical security failures

Respond with a JSON object matching this schema:
{
  "security_score": <int>,
  "iam_policies": [
    {
      "name": "<string>",
      "type": "IAM_ROLE",
      "resource": "<aws_resource_address>",
      "trust_policy": { "Version": "2012-10-17", "Statement": [...] },
      "permission_policies": [
        {
          "PolicyName": "<string>",
          "PolicyDocument": { "Version": "2012-10-17", "Statement": [...] },
          "rationale": "<string>"
        }
      ],
      "terraform_resource": "<HCL string>"
    }
  ],
  "violations": [
    {
      "severity": "HIGH|MEDIUM|LOW",
      "resource": "<string>",
      "description": "<string>",
      "original_gcp": "<string>",
      "recommended_aws": "<string>"
    }
  ],
  "recommendations": [<strings>]
}

CRITICAL: Respond ONLY with valid JSON. No markdown fences. No explanation. Just the raw JSON object."""


class SecurityEnforcer(BaseAgent):
    name = "SecurityEnforcer"
    stage_index = 3

    def get_system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def build_user_message(self, **kwargs) -> str:
        manifest = kwargs.get("manifest")
        translator_output = kwargs.get("translator_output")

        aws_tf = translator_output.terraform_files if translator_output else {}
        migration_map = []
        if translator_output:
            migration_map = [
                m.model_dump() if hasattr(m, 'model_dump') else m
                for m in translator_output.migration_map
            ]

        # Get original GCP IAM info
        gcp_iam_resources = [
            r for r in (manifest.all_resources if manifest else [])
            if "iam" in r.get("type", "").lower() or "service_account" in r.get("type", "").lower()
        ]

        return (
            f"AWS Terraform files to secure:\n"
            f"{json.dumps(aws_tf, indent=2, default=str)}\n\n"
            f"Migration map:\n"
            f"{json.dumps(migration_map, indent=2, default=str)}\n\n"
            f"Original GCP IAM resources:\n"
            f"{json.dumps(gcp_iam_resources, indent=2, default=str)}\n\n"
            f"Generate Zero-Trust IAM policies for all resources."
        )

    def parse_output(self, raw: dict) -> SecurityOutput:
        try:
            return SecurityOutput(**raw)
        except Exception as e:
            logger.warning(f"Failed to parse Security output: {e}. Using defaults.")
            output = SecurityOutput()
            output.security_score = raw.get("security_score", 50)
            output.recommendations = raw.get("recommendations", [])
            return output
