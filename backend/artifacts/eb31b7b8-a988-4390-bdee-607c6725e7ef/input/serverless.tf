# =============================================================================
# Serverless — Cloud Functions, Pub/Sub
# =============================================================================

resource "google_cloudfunctions_function" "image_processor" {
  name        = "image-processor"
  description = "Processes uploaded images — resize and optimize"
  runtime     = "python39"

  available_memory_mb   = 512
  source_archive_bucket = google_storage_bucket.media_assets.name
  source_archive_object = "functions/image-processor.zip"
  entry_point           = "process_image"
  timeout               = 120

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.image_uploads.name
  }

  environment_variables = {
    BUCKET_NAME = google_storage_bucket.media_assets.name
    DB_HOST     = google_sql_database_instance.postgres.private_ip_address
  }

  service_account_email = google_service_account.app_sa.email
}

resource "google_pubsub_topic" "image_uploads" {
  name = "image-uploads"

  message_retention_duration = "86400s"
}

resource "google_pubsub_subscription" "image_sub" {
  name  = "image-uploads-sub"
  topic = google_pubsub_topic.image_uploads.name

  ack_deadline_seconds = 30

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.image_uploads.id
    max_delivery_attempts = 5
  }
}
