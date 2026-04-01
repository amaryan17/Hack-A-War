"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  aegisAPI,
  type Job,
  type JobProgress,
  type LogEntry,
  type StageInfo,
} from "@/lib/api";

export interface PipelineState {
  jobId: string | null;
  status: string;
  progress: JobProgress;
  logs: LogEntry[];
  output: Record<string, unknown> | null;
  error: string | null;
  isLoading: boolean;
}

const DEFAULT_PROGRESS: JobProgress = {
  current_stage: 0,
  total_stages: 5,
  stages: [
    { name: "Tech Debt Scanner", status: "pending" },
    { name: "Migration Translator", status: "pending" },
    { name: "Solution Architect", status: "pending" },
    { name: "Security Enforcer", status: "pending" },
    { name: "Audit Compiler", status: "pending" },
  ],
};

export function usePipeline() {
  const [state, setState] = useState<PipelineState>({
    jobId: null,
    status: "",
    progress: DEFAULT_PROGRESS,
    logs: [],
    output: null,
    error: null,
    isLoading: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  /**
   * Connect to the SSE stream for a job
   */
  const connectStream = useCallback((jobId: string) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = aegisAPI.createEventSource(jobId);
      eventSourceRef.current = es;

      es.addEventListener("log", (event) => {
        try {
          const data: LogEntry = JSON.parse(event.data);
          // Filter out STREAM events that are too granular for display
          // But still show them in the terminal
          setState((prev) => ({
            ...prev,
            logs: [...prev.logs, data],
          }));
        } catch {
          // ignore parse errors
        }
      });

      es.addEventListener("progress", (event) => {
        try {
          const data = JSON.parse(event.data);
          setState((prev) => {
            const newStages = [...prev.progress.stages];
            if (data.stage < newStages.length) {
              newStages[data.stage] = {
                ...newStages[data.stage],
                status: data.status,
              };
            }
            return {
              ...prev,
              progress: {
                ...prev.progress,
                current_stage: data.stage,
                stages: newStages,
              },
            };
          });
        } catch {
          // ignore
        }
      });

      es.addEventListener("complete", (event) => {
        try {
          const data = JSON.parse(event.data);
          setState((prev) => ({
            ...prev,
            status: "COMPLETE",
            isLoading: false,
          }));
          // Fetch final job output
          fetchJobOutput(jobId);
        } catch {
          // ignore
        }
        es.close();
      });

      es.addEventListener("error", (event) => {
        // SSE error event - could be connection error or job failure
        if (event instanceof MessageEvent) {
          try {
            const data = JSON.parse(event.data);
            setState((prev) => ({
              ...prev,
              status: "FAILED",
              error: data.error || "Pipeline failed",
              isLoading: false,
            }));
          } catch {
            // Connection error, not a job error
          }
        }
        es.close();
      });

      es.onerror = () => {
        // SSE connection lost — fall back to polling
        es.close();
        startPolling(jobId);
      };
    } catch {
      // SSE not available — fall back to polling
      startPolling(jobId);
    }
  }, []);

  /**
   * Fallback: poll for job status and logs
   */
  const startPolling = useCallback((jobId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    let cursor = 0;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const job = await aegisAPI.getJob(jobId);

        setState((prev) => ({
          ...prev,
          status: job.status,
          progress: job.progress || prev.progress,
        }));

        // Fetch new logs
        const logPage = await aegisAPI.getLogs(jobId, cursor);
        if (logPage.logs.length > 0) {
          setState((prev) => ({
            ...prev,
            logs: [...prev.logs, ...logPage.logs],
          }));
          cursor = logPage.next_cursor;
        }

        // Stop polling on terminal states
        if (job.status === "COMPLETE" || job.status === "FAILED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setState((prev) => ({
            ...prev,
            status: job.status,
            output: job.output || null,
            error: job.error || null,
            isLoading: false,
          }));
        }
      } catch {
        // Ignore polling errors
      }
    }, 1000);
  }, []);

  /**
   * Fetch completed job output
   */
  const fetchJobOutput = useCallback(async (jobId: string) => {
    try {
      const job = await aegisAPI.getJob(jobId);
      setState((prev) => ({
        ...prev,
        output: job.output || null,
      }));
    } catch {
      // ignore
    }
  }, []);

  /**
   * Start a ZIP upload job
   */
  const startUpload = useCallback(
    async (file: File) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        status: "PENDING",
        logs: [],
        output: null,
        error: null,
        progress: DEFAULT_PROGRESS,
      }));

      try {
        const response = await aegisAPI.uploadZip(file);
        setState((prev) => ({
          ...prev,
          jobId: response.job_id,
          status: response.status,
        }));
        connectStream(response.job_id);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          status: "FAILED",
          error: err instanceof Error ? err.message : "Upload failed",
        }));
      }
    },
    [connectStream]
  );

  /**
   * Start a GitHub import job
   */
  const startGithub = useCallback(
    async (url: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        status: "PENDING",
        logs: [],
        output: null,
        error: null,
        progress: DEFAULT_PROGRESS,
      }));

      try {
        const response = await aegisAPI.uploadGithub(url);
        setState((prev) => ({
          ...prev,
          jobId: response.job_id,
          status: response.status,
        }));
        connectStream(response.job_id);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          status: "FAILED",
          error: err instanceof Error ? err.message : "GitHub import failed",
        }));
      }
    },
    [connectStream]
  );

  /**
   * Start a demo job (no upload needed)
   */
  const startDemo = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      status: "PENDING",
      logs: [],
      output: null,
      error: null,
      progress: DEFAULT_PROGRESS,
    }));

    try {
      const response = await aegisAPI.startDemo();
      setState((prev) => ({
        ...prev,
        jobId: response.job_id,
        status: response.status,
      }));
      connectStream(response.job_id);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        status: "FAILED",
        error: err instanceof Error ? err.message : "Demo start failed",
      }));
    }
  }, [connectStream]);

  /**
   * Load an existing job by ID
   */
  const loadJob = useCallback(
    async (jobId: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        jobId,
      }));

      try {
        const job = await aegisAPI.getJob(jobId);
        setState((prev) => ({
          ...prev,
          status: job.status,
          progress: job.progress || DEFAULT_PROGRESS,
          output: job.output || null,
          error: job.error || null,
          isLoading: job.status !== "COMPLETE" && job.status !== "FAILED",
        }));

        // If job is still running, connect to stream
        if (job.status !== "COMPLETE" && job.status !== "FAILED") {
          connectStream(jobId);
        }

        // Load existing logs
        const logPage = await aegisAPI.getLogs(jobId, 0);
        setState((prev) => ({
          ...prev,
          logs: logPage.logs,
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          status: "FAILED",
          error: "Failed to load job",
        }));
      }
    },
    [connectStream]
  );

  return {
    ...state,
    startUpload,
    startGithub,
    startDemo,
    loadJob,
  };
}
