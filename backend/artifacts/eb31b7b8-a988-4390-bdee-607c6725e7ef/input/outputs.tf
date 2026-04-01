# =============================================================================
# Outputs
# =============================================================================

output "app_server_ip" {
  description = "External IP of the application server"
  value       = google_compute_address.app_ip.address
}

output "postgres_connection" {
  description = "PostgreSQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
  sensitive   = true
}

output "redis_host" {
  description = "Redis instance host"
  value       = google_redis_instance.cache.host
}

output "gke_endpoint" {
  description = "GKE cluster endpoint"
  value       = google_container_cluster.gke_cluster.endpoint
  sensitive   = true
}

output "vpc_id" {
  description = "VPC network ID"
  value       = google_compute_network.vpc.id
}

output "media_bucket" {
  description = "Media assets bucket name"
  value       = google_storage_bucket.media_assets.name
}

output "image_processor_url" {
  description = "Image processor function URL"
  value       = google_cloudfunctions_function.image_processor.https_trigger_url
}
