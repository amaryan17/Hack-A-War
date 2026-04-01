# =============================================================================
# Aegis Sample GCP Infrastructure — Main Resources
# This fixture has INTENTIONAL issues for the Tech Debt Scanner to find
# =============================================================================

terraform {
  required_version = ">= 1.3.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.80"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# App Server — uses deprecated n1-standard machine type
resource "google_compute_instance" "app_server" {
  name         = "prod-app-server"
  machine_type = "n1-standard-4"
  zone         = "${var.region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      size  = 50
      type  = "pd-ssd"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.public_subnet.id
    access_config {
      nat_ip = google_compute_address.app_ip.address
    }
  }

  metadata = {
    ssh-keys = "admin:${var.ssh_public_key}"
  }

  service_account {
    email  = google_service_account.app_sa.email
    scopes = ["cloud-platform"]
  }

  tags = ["http-server", "https-server"]
}

# Worker Server — also uses n1 (deprecated)
resource "google_compute_instance" "worker" {
  name         = "prod-worker"
  machine_type = "n1-standard-2"
  zone         = "${var.region}-b"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      size  = 30
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.private_subnet.id
  }

  service_account {
    email  = google_service_account.app_sa.email
    scopes = ["cloud-platform"]
  }
}

# Cloud SQL PostgreSQL — no deletion_protection (intentional issue)
resource "google_sql_database_instance" "postgres" {
  name             = "prod-postgres-14"
  database_version = "POSTGRES_14"
  region           = var.region

  settings {
    tier              = "db-n1-standard-2"
    availability_type = "REGIONAL"
    disk_size         = 100
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.vpc.id
    }

    backup_configuration {
      enabled            = true
      point_in_time_recovery_enabled = true
    }

    maintenance_window {
      day  = 7
      hour = 3
    }
  }

  # INTENTIONAL: No deletion_protection
}

resource "google_sql_database" "app_db" {
  name     = "aegis_app"
  instance = google_sql_database_instance.postgres.name
}

# Redis Cache
resource "google_redis_instance" "cache" {
  name           = "app-cache"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region

  authorized_network = google_compute_network.vpc.id

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }
}

# GKE Cluster
resource "google_container_cluster" "gke_cluster" {
  name     = "prod-cluster"
  location = "${var.region}-a"

  initial_node_count       = 1
  remove_default_node_pool = true

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.private_subnet.name

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name     = "primary-pool"
  cluster  = google_container_cluster.gke_cluster.name
  location = "${var.region}-a"

  node_count = 3

  node_config {
    machine_type = "n2-standard-4"
    disk_size_gb = 50

    service_account = google_service_account.gke_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]

    metadata = {
      disable-legacy-endpoints = "true"
    }
  }

  autoscaling {
    min_node_count = 2
    max_node_count = 10
  }
}
