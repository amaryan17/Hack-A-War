"""
Aegis Migration Factory — Agent 2: Migration Translator
Translates GCP Terraform to AWS Terraform
"""

import json
import logging
from typing import Any

from agents.base import BaseAgent
from models.agent_outputs import TranslatorOutput

logger = logging.getLogger("aegis.agents.translator")

SYSTEM_PROMPT = """You are an expert cloud migration engineer. You translate GCP Terraform resources to equivalent AWS Terraform resources with production-grade quality.

Use this COMPLETE GCP→AWS mapping table:

COMPUTE:
  google_compute_instance           → aws_instance
  google_compute_instance_template  → aws_launch_template
  google_compute_instance_group     → aws_autoscaling_group
  google_compute_autoscaler         → aws_autoscaling_policy
  google_compute_disk               → aws_ebs_volume

CONTAINERS:
  google_container_cluster          → aws_eks_cluster
  google_container_node_pool        → aws_eks_node_group

SERVERLESS:
  google_cloudfunctions_function    → aws_lambda_function
  google_cloudfunctions2_function   → aws_lambda_function (with container)
  google_cloud_run_service          → aws_ecs_service (Fargate)
  google_app_engine_application     → aws_elastic_beanstalk_application

STORAGE:
  google_storage_bucket             → aws_s3_bucket
  google_storage_bucket_object      → aws_s3_object
  google_storage_bucket_iam_binding → aws_s3_bucket_policy
  google_filestore_instance         → aws_efs_file_system

DATABASE:
  google_sql_database_instance      → aws_db_instance
  google_sql_database               → aws_db_instance (database param)
  google_bigtable_instance          → aws_dynamodb_table
  google_bigquery_dataset           → aws_glue_catalog_database
  google_bigquery_table             → aws_glue_catalog_table
  google_spanner_instance           → aws_rds_cluster (Aurora)
  google_datastore_index            → aws_dynamodb_table
  google_memcache_instance          → aws_elasticache_cluster (memcached)
  google_redis_instance             → aws_elasticache_cluster (redis)

NETWORKING:
  google_compute_network            → aws_vpc
  google_compute_subnetwork         → aws_subnet
  google_compute_firewall           → aws_security_group
  google_compute_router             → aws_vpn_gateway
  google_compute_vpn_gateway        → aws_vpn_gateway
  google_compute_address            → aws_eip
  google_compute_global_address     → aws_eip
  google_compute_forwarding_rule    → aws_lb_listener
  google_compute_target_pool        → aws_lb_target_group
  google_compute_backend_service    → aws_lb
  google_compute_url_map            → aws_lb_listener_rule
  google_dns_managed_zone           → aws_route53_zone
  google_dns_record_set             → aws_route53_record
  google_compute_ssl_certificate    → aws_acm_certificate

MESSAGING:
  google_pubsub_topic               → aws_sns_topic
  google_pubsub_subscription        → aws_sqs_queue

IAM:
  google_service_account            → aws_iam_role
  google_service_account_key        → aws_iam_access_key
  google_project_iam_binding        → aws_iam_policy_attachment
  google_project_iam_member         → aws_iam_role_policy
  google_kms_key_ring               → aws_kms_key
  google_kms_crypto_key             → aws_kms_key

MONITORING:
  google_monitoring_alert_policy    → aws_cloudwatch_metric_alarm
  google_logging_metric             → aws_cloudwatch_log_metric_filter
  google_monitoring_dashboard       → aws_cloudwatch_dashboard

MACHINE TYPE MAPPING:
  n1-standard-1  → t3.medium
  n1-standard-2  → t3.large
  n1-standard-4  → m5.xlarge
  n1-standard-8  → m5.2xlarge
  n2-standard-2  → t3.large
  n2-standard-4  → m5.xlarge
  n2-standard-8  → m5.2xlarge
  n2-standard-16 → m5.4xlarge
  e2-medium      → t3.medium
  e2-standard-2  → t3.large
  c2-standard-4  → c5.xlarge

REGION MAPPING:
  us-central1    → us-east-1
  us-east1       → us-east-1
  us-west1       → us-west-2
  us-west2       → us-west-2
  europe-west1   → eu-west-1
  europe-west2   → eu-west-2
  asia-east1     → ap-northeast-1
  asia-southeast1 → ap-southeast-1
  australia-southeast1 → ap-southeast-2

Generate complete, valid, production-ready HCL Terraform code.
Output exactly 4 files: main.tf, variables.tf, outputs.tf, provider.tf
All resources must use variables, not hardcoded values.
Add description comments above each resource block.

Respond with a JSON object matching this schema:
{
  "terraform_files": {
    "provider.tf": "<complete HCL string>",
    "variables.tf": "<complete HCL string>",
    "main.tf": "<complete HCL string>",
    "outputs.tf": "<complete HCL string>"
  },
  "migration_map": [
    {
      "gcp_resource": "<gcp_type.name>",
      "aws_resource": "<aws_type.name>",
      "gcp_type": "<gcp_resource_type>",
      "aws_type": "<aws_resource_type>",
      "notes": "<mapping notes>"
    }
  ],
  "unmapped_resources": [],
  "terraform_version": "~> 1.6"
}

CRITICAL: Respond ONLY with valid JSON. No markdown fences. No explanation. Just the raw JSON object."""


class MigrationTranslator(BaseAgent):
    name = "MigrationTranslator"
    stage_index = 1

    def get_system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def build_user_message(self, **kwargs) -> str:
        manifest = kwargs.get("manifest")
        debt_output = kwargs.get("debt_output")

        resources_json = json.dumps(manifest.all_resources, indent=2, default=str)
        file_contents = "\n".join(
            f"=== {k} ===\n{v}" for k, v in manifest.tf_files.items()
        )

        msg = (
            f"Translate these GCP Terraform resources to AWS:\n\n"
            f"Resources found:\n{resources_json}\n\n"
            f"Raw GCP Terraform files:\n{file_contents}"
        )

        if debt_output:
            msg += (
                f"\n\nTech Debt Analysis (for context — fix these issues in translation):\n"
                f"Health Score: {debt_output.overall_health_score}/100\n"
                f"Recommendations: {json.dumps(debt_output.recommendations, default=str)}"
            )

        return msg

    def parse_output(self, raw: dict) -> TranslatorOutput:
        try:
            return TranslatorOutput(**raw)
        except Exception as e:
            logger.warning(f"Failed to parse Translator output fully: {e}. Using defaults.")
            output = TranslatorOutput()
            output.terraform_files = raw.get("terraform_files", {})
            output.migration_map = [
                {"gcp_resource": m.get("gcp_resource", ""),
                 "aws_resource": m.get("aws_resource", ""),
                 "gcp_type": m.get("gcp_type", ""),
                 "aws_type": m.get("aws_type", ""),
                 "notes": m.get("notes", "")}
                for m in raw.get("migration_map", [])
            ]
            return output
