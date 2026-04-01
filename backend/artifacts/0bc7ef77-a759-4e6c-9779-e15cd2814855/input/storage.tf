# =============================================================================
# Storage — Cloud Storage Buckets
# INTENTIONAL: Public media bucket, no CMEK, no lifecycle on logs bucket
# =============================================================================

# INTENTIONAL ISSUE: Public access enabled
resource "google_storage_bucket" "media_assets" {
  name          = "${var.project_id}-media-assets"
  location      = "US"
  storage_class = "STANDARD"
  force_destroy = true

  uniform_bucket_level_access = false

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }

  # INTENTIONAL: No CMEK encryption configured
}

resource "google_storage_bucket" "backups" {
  name          = "${var.project_id}-backups"
  location      = var.region
  storage_class = "NEARLINE"
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 90
    }
  }

  versioning {
    enabled = true
  }
}

# INTENTIONAL ISSUE: No lifecycle rules on logs bucket
resource "google_storage_bucket" "logs" {
  name          = "${var.project_id}-application-logs"
  location      = var.region
  storage_class = "STANDARD"
  force_destroy = false

  uniform_bucket_level_access = true

  # INTENTIONAL: Missing lifecycle rules — logs will accumulate forever
  # INTENTIONAL: No CMEK encryption
}
