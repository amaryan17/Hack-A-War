"""
Aegis Migration Factory — HCL Parser
python-hcl2 wrapper + resource normalizer
"""

import io
import logging
from typing import Dict, List, Any, Tuple, Optional

logger = logging.getLogger("aegis.hcl")


def parse_hcl(content: str, filename: str = "unknown.tf") -> Tuple[Optional[Dict], List[Dict]]:
    """
    Parse HCL content using python-hcl2.
    Returns (parsed_dict, list_of_resources).
    If parsing fails, returns (None, []).
    """
    try:
        import hcl2
        parsed = hcl2.load(io.StringIO(content))
        resources = extract_resources(parsed, filename)
        return parsed, resources
    except Exception as e:
        logger.warning(f"HCL parse failed for {filename}: {e}")
        # Try fallback regex extraction
        resources = extract_resources_regex(content, filename)
        return None, resources


def extract_resources(parsed: Dict, filename: str) -> List[Dict]:
    """Extract GCP resource blocks from parsed HCL dict."""
    resources = []
    resource_blocks = parsed.get("resource", [])

    for block in resource_blocks:
        if isinstance(block, dict):
            for resource_type, instances in block.items():
                if isinstance(instances, dict):
                    for instance_name, config in instances.items():
                        resources.append({
                            "type": resource_type,
                            "name": instance_name,
                            "config": config if isinstance(config, dict) else {},
                            "file": filename,
                        })
                elif isinstance(instances, list):
                    for item in instances:
                        if isinstance(item, dict):
                            for instance_name, config in item.items():
                                resources.append({
                                    "type": resource_type,
                                    "name": instance_name,
                                    "config": config if isinstance(config, dict) else {},
                                    "file": filename,
                                })
    return resources


def extract_resources_regex(content: str, filename: str) -> List[Dict]:
    """
    Fallback: extract resource blocks using regex when HCL parsing fails.
    """
    import re
    resources = []
    pattern = r'resource\s+"([^"]+)"\s+"([^"]+)"\s*\{'
    for match in re.finditer(pattern, content):
        resource_type = match.group(1)
        resource_name = match.group(2)
        resources.append({
            "type": resource_type,
            "name": resource_name,
            "config": {},
            "file": filename,
        })
    return resources


def get_resource_summary(resources: List[Dict]) -> Dict[str, int]:
    """Categorize resources by service type."""
    categories = {
        "compute": ["google_compute_instance", "google_compute_instance_template",
                     "google_compute_instance_group", "google_compute_autoscaler",
                     "google_compute_disk", "aws_instance", "aws_launch_template"],
        "containers": ["google_container_cluster", "google_container_node_pool",
                        "aws_eks_cluster", "aws_eks_node_group"],
        "serverless": ["google_cloudfunctions_function", "google_cloudfunctions2_function",
                        "google_cloud_run_service", "google_app_engine_application",
                        "aws_lambda_function", "aws_ecs_service"],
        "storage": ["google_storage_bucket", "google_storage_bucket_object",
                     "google_filestore_instance", "aws_s3_bucket", "aws_efs_file_system"],
        "database": ["google_sql_database_instance", "google_sql_database",
                      "google_bigtable_instance", "google_bigquery_dataset",
                      "google_spanner_instance", "google_redis_instance",
                      "google_memcache_instance", "aws_db_instance", "aws_dynamodb_table",
                      "aws_elasticache_cluster", "aws_rds_cluster"],
        "networking": ["google_compute_network", "google_compute_subnetwork",
                        "google_compute_firewall", "google_compute_router",
                        "google_compute_address", "google_compute_global_address",
                        "google_compute_forwarding_rule", "google_dns_managed_zone",
                        "google_dns_record_set", "aws_vpc", "aws_subnet",
                        "aws_security_group", "aws_lb", "aws_route53_zone"],
        "iam": ["google_service_account", "google_project_iam_binding",
                 "google_project_iam_member", "google_kms_key_ring",
                 "google_kms_crypto_key", "aws_iam_role", "aws_kms_key"],
        "messaging": ["google_pubsub_topic", "google_pubsub_subscription",
                       "aws_sns_topic", "aws_sqs_queue"],
        "monitoring": ["google_monitoring_alert_policy", "google_logging_metric",
                        "aws_cloudwatch_metric_alarm"],
    }

    summary = {}
    for resource in resources:
        rtype = resource.get("type", "")
        categorized = False
        for category, types in categories.items():
            if rtype in types:
                summary[category] = summary.get(category, 0) + 1
                categorized = True
                break
        if not categorized:
            summary["other"] = summary.get("other", 0) + 1

    return summary
