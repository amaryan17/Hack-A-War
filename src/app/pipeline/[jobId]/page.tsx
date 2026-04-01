"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePipeline } from "@/hooks/usePipeline";
import { aegisAPI } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import {
  Search,
  Cloud,
  Play,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Download,
  AlertCircle,
  X,
} from "lucide-react";

const STAGE_ICONS = [Search, Cloud, Play, ShieldCheck, CheckCircle2];
const STAGE_COLORS = ["#39FF14", "#A78BFA", "#00E5FF", "#FFB800", "#00E5FF"];

export default function PipelinePage() {
  const params = useParams();
  const jobId = params?.jobId as string;
  const {
    status,
    progress,
    logs,
    output,
    error,
    isLoading,
    loadJob,
  } = usePipeline();

  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId) {
      loadJob(jobId);
    }
  }, [jobId, loadJob]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const isComplete = status === "COMPLETE";
  const isFailed = status === "FAILED";

  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      <Navbar />
      <main className="flex-grow flex flex-col w-full max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Migration Pipeline
          </h1>
          <p className="text-white/50 font-mono text-sm">
            Job: {jobId?.slice(0, 8)}...
            <span
              className={`ml-3 px-2 py-0.5 rounded text-xs font-bold ${
                isComplete
                  ? "bg-[#39FF14]/20 text-[#39FF14]"
                  : isFailed
                  ? "bg-red-500/20 text-red-400"
                  : "bg-[#00E5FF]/20 text-[#00E5FF]"
              }`}
            >
              {status || "LOADING..."}
            </span>
          </p>
        </div>

        {/* Pipeline Stage Visualizer */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {progress.stages.map((stage, i) => {
            const Icon = STAGE_ICONS[i];
            const color = STAGE_COLORS[i];
            const isRunning = stage.status === "running";
            const isDone = stage.status === "completed";
            const hasFailed = stage.status === "failed";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border p-4 transition-all duration-300 ${
                  isDone
                    ? "border-[#39FF14]/40 bg-[#39FF14]/5"
                    : hasFailed
                    ? "border-red-500/40 bg-red-500/5"
                    : isRunning
                    ? "border-[#FFB800]/40 bg-[#FFB800]/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <span className="text-white text-xs font-bold truncate">
                    {stage.name}
                  </span>
                </div>
                <div className="text-[11px] font-mono">
                  {isDone ? (
                    <span className="text-[#39FF14] flex items-center gap-1">
                      <CheckCircle2 size={10} /> Done
                      {stage.duration_ms && (
                        <span className="text-white/30 ml-1">
                          ({(stage.duration_ms / 1000).toFixed(1)}s)
                        </span>
                      )}
                    </span>
                  ) : hasFailed ? (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle size={10} /> Failed
                    </span>
                  ) : isRunning ? (
                    <span className="text-[#FFB800] flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> Running...
                    </span>
                  ) : (
                    <span className="text-white/20">Pending</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Two column: Terminal | Results */}
        <div className="grid lg:grid-cols-2 gap-6 flex-1">
          {/* Live Terminal */}
          <div className="flex flex-col rounded-xl border border-white/10 bg-black overflow-hidden">
            <div className="flex items-center px-4 py-3 bg-[#131b2c] border-b border-white/10">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="w-full text-center text-xs font-mono text-white/30">
                aegis-pipeline — live
              </div>
            </div>
            <div
              ref={terminalRef}
              className="flex-1 p-4 overflow-y-auto max-h-[500px] custom-scrollbar"
            >
              {logs
                .filter((l) => l.level !== "STREAM")
                .map((log, i) => (
                  <div
                    key={i}
                    className={`font-mono text-[12px] leading-relaxed ${
                      log.level === "SUCCESS"
                        ? "text-[#39FF14]"
                        : log.level === "ERROR"
                        ? "text-red-400"
                        : log.agent === "SYSTEM"
                        ? "text-[#00E5FF]"
                        : "text-white/70"
                    }`}
                  >
                    <span className="text-white/20 mr-2">
                      {log.ts?.slice(11, 19) || ""}
                    </span>
                    <span className="text-white/40 mr-2">
                      [{log.agent}]
                    </span>
                    {log.message}
                  </div>
                ))}
              {isLoading && (
                <div className="font-mono text-[12px] text-[#00E5FF] animate-pulse mt-1">
                  █
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <span className="text-sm font-bold text-white">Results</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-[500px] custom-scrollbar">
              {isComplete && output ? (
                <div className="space-y-6">
                  {/* Health Score */}
                  {output.tech_debt && (
                    <div>
                      <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                        Tech Debt Score
                      </h4>
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-3xl font-bold ${
                            (output.tech_debt as Record<string, unknown>)
                              .overall_health_score! >= 70
                              ? "text-[#39FF14]"
                              : (
                                  output.tech_debt as Record<string, unknown>
                                ).overall_health_score! >= 50
                              ? "text-[#FFB800]"
                              : "text-red-400"
                          }`}
                        >
                          {String(
                            (output.tech_debt as Record<string, unknown>)
                              .overall_health_score ?? "?"
                          )}
                        </div>
                        <span className="text-white/30 text-sm">/100</span>
                      </div>
                    </div>
                  )}

                  {/* Cost Savings */}
                  {output.architect && (
                    <div>
                      <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                        Monthly Cost
                      </h4>
                      <div className="text-2xl font-bold text-[#39FF14]">
                        $
                        {String(
                          (
                            (output.architect as Record<string, unknown>)
                              .cost_estimate as Record<string, unknown>
                          )?.total_monthly_usd ?? "—"
                        )}
                        <span className="text-sm text-white/30 ml-2">
                          /month
                        </span>
                      </div>
                      <div className="text-sm text-[#39FF14]/70 mt-1">
                        Saving $
                        {String(
                          (
                            (output.architect as Record<string, unknown>)
                              .cost_estimate as Record<string, unknown>
                          )?.monthly_savings_usd ?? "0"
                        )}
                        /mo vs GCP
                      </div>
                    </div>
                  )}

                  {/* Security Score */}
                  {output.security && (
                    <div>
                      <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                        Security Score
                      </h4>
                      <div className="text-3xl font-bold text-[#39FF14]">
                        {String(
                          (output.security as Record<string, unknown>)
                            .security_score ?? "?"
                        )}
                        <span className="text-white/30 text-sm">/100</span>
                      </div>
                    </div>
                  )}

                  {/* Download Buttons */}
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
                      Download Artifacts
                    </h4>
                    <a
                      href={aegisAPI.downloadTerraform(jobId)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] font-mono text-sm hover:bg-[#00E5FF]/20 transition-all"
                    >
                      <Download size={16} />
                      Terraform ZIP
                    </a>
                    <a
                      href={aegisAPI.downloadIAM(jobId)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[#FFB800]/30 bg-[#FFB800]/10 text-[#FFB800] font-mono text-sm hover:bg-[#FFB800]/20 transition-all"
                    >
                      <Download size={16} />
                      IAM Policies JSON
                    </a>
                    <a
                      href={aegisAPI.downloadAuditPDF(jobId)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[#39FF14]/30 bg-[#39FF14]/10 text-[#39FF14] font-mono text-sm hover:bg-[#39FF14]/20 transition-all"
                    >
                      <Download size={16} />
                      SOC-2 Audit PDF
                    </a>
                  </div>
                </div>
              ) : isFailed ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <AlertCircle size={48} className="text-red-400 mb-4" />
                  <p className="text-red-400 font-bold text-lg mb-2">
                    Pipeline Failed
                  </p>
                  <p className="text-white/40 text-sm max-w-xs">
                    {error || "An error occurred during processing."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Loader2
                    size={48}
                    className="text-[#00E5FF] animate-spin mb-4"
                  />
                  <p className="text-white/50 text-sm">
                    Running pipeline...
                  </p>
                  <p className="text-white/20 text-xs mt-1">
                    Results will appear here when complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
