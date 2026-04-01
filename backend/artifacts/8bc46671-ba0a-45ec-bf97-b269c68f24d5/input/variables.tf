# =============================================================================
# Variables
# =============================================================================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "aegis-prod-123456"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "ssh_public_key" {
  description = "SSH public key for instance access"
  type        = string
  default     = "ssh-rsa AAAAB3NzaC1yc2EAAA... admin@aegis"
  sensitive   = true
}
