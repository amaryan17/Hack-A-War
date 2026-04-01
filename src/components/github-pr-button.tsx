"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitPullRequest, Loader2, CheckCircle2, ExternalLink, X, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PR_BRANCH_NAME = "aegis-migration/auto-refactor-14b";
const GITHUB_PR_URL = "https://github.com/yourusername/yourrepo/pull/1";

export function GithubPRButton() {
  const [prStage, setPrStage] = useState<number>(0); // 0 = idle, 1-3 = loading stages, 4 = done
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // error state removed to fix unused variable lint error

  const prStageLabels: Record<number, string> = {
    1: "Packaging Terraform...",
    2: "Authenticating Git...",
    3: "Creating PR...",
  };

  useEffect(() => {
    if (prStage >= 1 && prStage <= 3) {
      const timer = setTimeout(() => {
        if (prStage < 3) {
          setPrStage(prStage + 1);
        } else {
          setPrStage(4);
          setPrModalOpen(true);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [prStage]);

  const handleCreatePR = () => {
    if (prStage === 0 || prStage === 4) {
      setCopied(false);
      setPrStage(1);
    }
  };

  const handleCloseModal = () => {
    setPrModalOpen(false);
    setPrStage(0);
    setCopied(false);
  };

  const handleCopyBranch = () => {
    navigator.clipboard.writeText(PR_BRANCH_NAME);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={handleCreatePR}
        disabled={prStage >= 1 && prStage <= 3}
        className={cn(
          "relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 border flex items-center justify-center gap-2 min-w-[160px] overflow-hidden group",
          prStage >= 1 && prStage <= 3
            ? "border-violet-500/30 bg-violet-600/20 text-violet-300 cursor-wait backdrop-blur-sm"
            : "border-violet-500/30 bg-violet-600/10 text-violet-400 hover:bg-violet-600/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] backdrop-blur-sm"
        )}
      >
        <span className="relative z-10 flex items-center gap-2">
          {prStage >= 1 && prStage <= 3 ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {prStageLabels[prStage]}
            </>
          ) : (
            <>
              <GitPullRequest className="w-4 h-4" />
              Create PR
            </>
          )}
        </span>
        {prStage === 0 && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-violet-600/5 via-violet-600/10 to-violet-600/5" />
        )}
      </button>

      {/* Success Modal */}
      <AnimatePresence>
        {prModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl shadow-[0_0_60px_rgba(139,92,246,0.15)] p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
                title="Close"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                  className="w-16 h-16 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-[#39FF14]" />
                </motion.div>
              </div>

              <h3 className="font-display text-xl font-bold text-white text-center mb-2">
                Pull Request Created Successfully
              </h3>

              <div className="flex justify-center my-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyBranch}
                  className="px-4 py-2 rounded-lg bg-black/60 border border-white/10 hover:border-white/20 font-mono text-sm text-violet-400 transition-all duration-300 flex items-center gap-2 group"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#39FF14]" />
                      <span className="text-[#39FF14]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>{PR_BRANCH_NAME}</span>
                      <Copy className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </motion.button>
              </div>

              <p className="text-white/50 font-body text-sm text-center mb-8">
                Your Senior Engineers have been notified for review.
              </p>

              <div className="flex gap-3">
                <a
                  href={GITHUB_PR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-sm text-center transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  <ExternalLink className="w-4 h-4" />
                  View PR
                </a>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-transparent text-white/60 font-mono text-sm hover:text-white hover:border-white/20 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
