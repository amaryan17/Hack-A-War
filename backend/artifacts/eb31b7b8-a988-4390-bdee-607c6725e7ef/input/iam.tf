# =============================================================================
# IAM — Service Accounts, Bindings, KMS
# INTENTIONAL: roles/editor over-permissioning
# =============================================================================

resource "google_service_account" "app_sa" {
  account_id   = "app-service-account"
  display_name = "Application Service Account"
  description  = "Service account for the application servers"
}

resource "google_service_account" "gke_sa" {
  account_id   = "gke-service-account"
  display_name = "GKE Node Service Account"
  description  = "Service account for GKE node pool"
}

# INTENTIONAL ISSUE: roles/editor is overly permissive
resource "google_project_iam_binding" "app_editor" {
  project = var.project_id
  role    = "roles/editor"

  members = [
    "serviceAccount:${google_service_account.app_sa.email}",
  ]
}

resource "google_project_iam_binding" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"

  members = [
    "serviceAccount:${google_service_account.app_sa.email}",
    "serviceAccount:${google_service_account.gke_sa.email}",
  ]
}

resource "google_kms_key_ring" "main" {
  name     = "aegis-keyring"
  location = var.region
}

resource "google_kms_crypto_key" "db_key" {
  name     = "database-encryption-key"
  key_ring = google_kms_key_ring.main.id

  rotation_period = "7776000s" # 90 days

  lifecycle {
    prevent_destroy = true
  }
}
