"""
Aegis Migration Factory — Agent 3: Solution Architect
Architecture graph + FinOps cost estimation
"""

import json
import logging
from typing import Any

from agents.base import BaseAgent
from models.agent_outputs import ArchitectOutput

logger = logging.getLogger("aegis.agents.architect")

SYSTEM_PROMPT = """You are an AWS Solutions Architect. Given a list of AWS resources from a Terraform migration, you will:
1. Generate a visual architecture graph (nodes and edges)
2. Produce a FinOps cost estimate

For the architecture graph:
- Each AWS resource becomes a node
- Edges represent dependencies and data flows
- Group nodes by AWS service category
- Include the AWS service icon identifier for frontend rendering

Node types and their icon identifiers:
  aws_instance          → EC2
  aws_eks_cluster       → EKS
  aws_lambda_function   → Lambda
  aws_s3_bucket         → S3
  aws_db_instance       → RDS
  aws_dynamodb_table    → DynamoDB
  aws_vpc               → VPC
  aws_subnet            → Subnet
  aws_security_group    → SecurityGroup
  aws_lb                → ALB
  aws_sns_topic         → SNS
  aws_sqs_queue         → SQS
  aws_iam_role          → IAM
  aws_kms_key           → KMS
  aws_cloudwatch_metric_alarm → CloudWatch
  aws_elasticache_cluster → ElastiCache
  aws_ecs_service       → ECS
  aws_route53_zone      → Route53
  aws_eip               → ElasticIP

For cost estimates, use these monthly USD approximations:
  aws_instance (t3.medium):    $30
  aws_instance (t3.large):     $60
  aws_instance (m5.xlarge):    $140
  aws_instance (m5.2xlarge):   $280
  aws_instance (c5.xlarge):    $122
  aws_eks_cluster:             $73 (control plane only)
  aws_eks_node_group (m5.xl):  $140 per node
  aws_lambda_function:         $5 (avg, 1M invocations)
  aws_s3_bucket:               $23 (avg 100GB + requests)
  aws_db_instance (db.t3.medium): $50
  aws_db_instance (db.m5.large):  $140
  aws_dynamodb_table:          $25 (avg)
  aws_lb:                      $16
  aws_sns_topic:               $0.50
  aws_sqs_queue:               $0.40
  aws_elasticache_cluster:     $50
  aws_ecs_service (Fargate):   $40
  aws_kms_key:                 $1
  aws_cloudwatch_metric_alarm: $0.10

Also include the GCP equivalent cost for comparison (FinOps savings estimate).

Respond with a JSON object matching this schema:
{
  "architecture_graph": {
    "nodes": [
      {"id": "<string>", "label": "<string>", "type": "<icon_id>", "service": "<aws_resource_type>", "group": "<category>", "x": <int>, "y": <int>}
    ],
    "edges": [
      {"id": "<string>", "source": "<node_id>", "target": "<node_id>", "label": "<string>", "type": "CONTAINS|DEPENDS_ON|ACCESSES|TRIGGERS"}
    ]
  },
  "cost_estimate": {
    "total_monthly_usd": <float>,
    "gcp_equivalent_usd": <float>,
    "monthly_savings_usd": <float>,
    "annual_savings_usd": <float>,
    "breakdown": [
      {"resource": "<string>", "type": "<string>", "monthly_usd": <float>, "category": "<string>"}
    ],
    "by_category": {"<category>": <float>}
  },
  "executive_summary": "<string>"
}

CRITICAL: Respond ONLY with valid JSON. No markdown fences. No explanation. Just the raw JSON object."""


class SolutionArchitect(BaseAgent):
    name = "SolutionArchitect"
    stage_index = 2

    def get_system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def build_user_message(self, **kwargs) -> str:
        translator_output = kwargs.get("translator_output")

        tf_files = translator_output.terraform_files if translator_output else {}
        migration_map = []
        if translator_output:
            migration_map = [
                m.model_dump() if hasattr(m, 'model_dump') else m
                for m in translator_output.migration_map
            ]

        return (
            f"Generated AWS Terraform files:\n"
            f"{json.dumps(tf_files, indent=2, default=str)}\n\n"
            f"Migration map:\n"
            f"{json.dumps(migration_map, indent=2, default=str)}\n\n"
            f"Generate the architecture graph and cost estimate."
        )

    def parse_output(self, raw: dict) -> ArchitectOutput:
        try:
            return ArchitectOutput(**raw)
        except Exception as e:
            logger.warning(f"Failed to parse Architect output: {e}. Using defaults.")
            output = ArchitectOutput()
            output.executive_summary = raw.get("executive_summary", "")
            return output
