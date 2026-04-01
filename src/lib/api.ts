/**
 * Aegis Migration Factory — API Client
 * Connects Next.js frontend to FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Job {
  job_id: string;
  status: string;
  progress: JobProgress;
  created_at: string;
  meta: JobMeta;
  output?: Record<string, unknown>;
  error?: string;
}

export interface JobProgress {
  current_stage: number;
  total_stages: number;
  stages: StageInfo[];
}

export interface StageInfo {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  duration_ms?: number;
  started_at?: string;
  completed_at?: string;
}

export interface JobMeta {
  created_at: string;
  filename?: string;
  mode: string;
  error?: string;
  github_url?: string;
}

export interface LogEntry {
  ts: string;
  agent: string;
  level: "INFO" | "SUCCESS" | "ERROR" | "STREAM";
  message: string;
  data?: Record<string, unknown>;
}

export interface LogPage {
  logs: LogEntry[];
  next_cursor: number;
}

export interface UploadResponse {
  job_id: string;
  status: string;
  created_at: string;
}

export const aegisAPI = {
  /**
   * Upload a ZIP file to start a migration job
   */
  uploadZip: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/jobs/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }

    return res.json();
  },

  /**
   * Start a migration from a GitHub repository URL
   */
  uploadGithub: async (url: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("github_url", url);

    const res = await fetch(`${API_BASE}/api/jobs/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "GitHub import failed" }));
      throw new Error(err.detail || "GitHub import failed");
    }

    return res.json();
  },

  /**
   * Start a demo migration using sample GCP fixtures
   */
  startDemo: async (): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("demo", "true");

    const res = await fetch(`${API_BASE}/api/jobs/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Demo start failed" }));
      throw new Error(err.detail || "Demo start failed");
    }

    return res.json();
  },

  /**
   * Get full job object by ID
   */
  getJob: async (jobId: string): Promise<Job> => {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
    if (!res.ok) {
      throw new Error("Job not found");
    }
    return res.json();
  },

  /**
   * Get logs since cursor position
   */
  getLogs: async (jobId: string, cursor: number = 0): Promise<LogPage> => {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}/logs?cursor=${cursor}`);
    if (!res.ok) {
      throw new Error("Failed to fetch logs");
    }
    return res.json();
  },

  /**
   * Get Terraform ZIP download URL
   */
  downloadTerraform: (jobId: string): string => {
    return `${API_BASE}/api/jobs/${jobId}/terraform`;
  },

  /**
   * Get IAM JSON download URL
   */
  downloadIAM: (jobId: string): string => {
    return `${API_BASE}/api/jobs/${jobId}/iam`;
  },

  /**
   * Get Audit PDF download URL
   */
  downloadAuditPDF: (jobId: string): string => {
    return `${API_BASE}/api/jobs/${jobId}/audit-pdf`;
  },

  /**
   * Create SSE EventSource for real-time streaming
   */
  createEventSource: (jobId: string): EventSource => {
    return new EventSource(`${API_BASE}/api/jobs/${jobId}/stream`);
  },

  /**
   * Create WebSocket connection for real-time streaming
   */
  createWebSocket: (jobId: string): WebSocket => {
    const wsBase = API_BASE.replace("http", "ws");
    return new WebSocket(`${wsBase}/ws/jobs/${jobId}`);
  },

  /**
   * Delete a job and its artifacts
   */
  deleteJob: async (jobId: string): Promise<void> => {
    await fetch(`${API_BASE}/api/jobs/${jobId}`, { method: "DELETE" });
  },

  /**
   * Health check
   */
  health: async (): Promise<{ status: string; redis: string; version: string }> => {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
  },
};
