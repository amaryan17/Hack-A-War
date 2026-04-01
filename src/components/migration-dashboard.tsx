/**
 * Migration Dashboard Component
 * Integrates frontend with Aegis backend for migration jobs
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Github, Play, Download, Trash2, AlertCircle } from "lucide-react";
import { aegisAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

export function MigrationDashboard() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const handleStartDemo = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    try {
      const response = await aegisAPI.startDemo();
      setJobId(response.job_id);
      setLogs([`Job ${response.job_id} started in demo mode`]);

      // Stream updates
      const eventSource = aegisAPI.createEventSource(response.job_id);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLogs((prev) => [...prev, JSON.stringify(data)]);

          if (data.status === "COMPLETED") {
            setProgress(100);
            eventSource.close();
          } else if (data.progress) {
            const percent =
              (data.progress.current_stage / data.progress.total_stages) * 100;
            setProgress(percent);
          }
        } catch (e) {
          console.error("Stream parse error:", e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start demo");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setLogs([]);
    try {
      const response = await aegisAPI.uploadZip(file);
      setJobId(response.job_id);
      setLogs([`Job ${response.job_id} created with file: ${file.name}`]);

      const eventSource = aegisAPI.createEventSource(response.job_id);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLogs((prev) => [...prev, JSON.stringify(data)]);

          if (data.status === "COMPLETED") {
            setProgress(100);
            eventSource.close();
          } else if (data.progress) {
            const percent =
              (data.progress.current_stage / data.progress.total_stages) * 100;
            setProgress(percent);
          }
        } catch (e) {
          console.error("Stream parse error:", e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadTerraform = () => {
    if (jobId) {
      window.location.href = aegisAPI.downloadTerraform(jobId);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Migration Dashboard</h2>
        <p className="text-white/60">
          Start a GCP to AWS migration job using our Aegis backend
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleStartDemo}
          disabled={loading}
          className={cn(
            "p-4 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2",
            loading
              ? "bg-violet-600/30 border-violet-500/30 text-violet-300 cursor-wait"
              : "bg-violet-600/20 border-violet-500/30 text-violet-400 hover:bg-violet-600/30"
          )}
        >
          <Play className="w-4 h-4" />
          Demo Mode
        </button>

        <label className="p-4 rounded-lg border border-blue-500/30 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          Upload ZIP
          <input
            type="file"
            accept=".zip"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            disabled={loading}
            className="hidden"
          />
        </label>
      </div>

      {/* Job ID Display */}
      {jobId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-white/5 border border-white/10"
        >
          <p className="text-white/70 text-sm mb-1">Job ID</p>
          <p className="font-mono text-green-400 break-all">{jobId}</p>
        </motion.div>
      )}

      {/* Progress Bar */}
      {jobId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/60">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Logs Display */}
      {logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-black/40 border border-white/10 max-h-64 overflow-y-auto"
        >
          <p className="text-white/70 text-sm mb-3 font-mono">Logs</p>
          <div className="space-y-1 font-mono text-xs text-white/60">
            {logs.map((log, i) => (
              <p key={i} className="line-clamp-2">
                {log}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Download Buttons */}
      {jobId && progress === 100 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-2">
          <button
            onClick={downloadTerraform}
            className="p-3 rounded-lg border border-green-500/30 bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Terraform
          </button>
        </motion.div>
      )}
    </div>
  );
}
