"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ChevronDown, Terminal, Server, ShieldCheck, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Live Token Counter ─────────────────────────────────────── */
function TokenCounter() {
  const [tokens, setTokens] = useState(142980);
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 5));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[10px] text-cyan-400/70 tabular-nums">
      INFERENCE: {tokens.toLocaleString()} TOKENS
    </div>
  );
}

/* ── Waveform Animation ──────────────────────────────────────── */
function Waveform() {
  return (
    <div className="flex items-center gap-[2px] h-3 w-12">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-cyan-400/80 rounded-full"
          animate={{
            height: [4, 12, 6, 10, 4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Neural Pulse Widget ─────────────────────────────────────── */
export function AIStatusWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Main Trigger ── */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group relative flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-500 overflow-hidden",
          isOpen 
            ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
            : "border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]"
        )}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Scanning Ray */}
        <motion.div 
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent w-1/2 -skew-x-12 pointer-events-none"
        />
        
        {/* Live Indicator */}
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
          <motion.div 
            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-cyan-400/50"
          />
        </div>

        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">Aegis Core</span>
          <span className="text-xs font-bold text-white/90">SYST: ACTIVE</span>
        </div>

        <div className="h-6 w-px bg-white/10 mx-1" />

        <Waveform />

        <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-white/30"
        >
            <ChevronDown size={14} />
        </motion.div>
      </motion.button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(34,211,238,0.1)] p-5 z-[100] overflow-hidden"
          >
            {/* Background Grid Decoration */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                    <BrainCircuit className="text-cyan-400" size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">AI Neural Engine</h4>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">v4.2.0-STABLE | BEDROCK-V3</p>
                  </div>
                </div>
                <TokenCounter />
              </div>

              {/* Status Modules */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatusModule icon={<ShieldCheck size={14}/>} label="Security" status="Shielded" color="text-green-400" />
                <StatusModule icon={<Gauge size={14}/>} label="Latency" status="24ms" color="text-cyan-400" />
                <StatusModule icon={<Server size={14}/>} label="Load" status="12.4%" color="text-amber-400" />
                <StatusModule icon={<Terminal size={14}/>} label="Pipeline" status="Online" color="text-violet-400" />
              </div>

              {/* Memory Usage Visualization */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-white/40">NEURAL LOAD</span>
                  <span className="text-cyan-400">847 GFLOPS</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 relative"
                  >
                    <motion.div 
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-white/30 skew-x-12"
                    />
                  </motion.div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,1)] animate-pulse" />
                  <span className="text-[10px] font-mono text-white/50">SYSTEM_HEALTH: NOMINAL</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-mono text-cyan-400 hover:text-white transition-colors"
                >
                  [ DISMISS ]
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusModule({ icon, label, status, color }: { icon: React.ReactNode, label: string, status: string, color: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1 hover:bg-white/[0.08] transition-colors group cursor-default">
      <div className="text-white/30 group-hover:text-white/60 transition-colors">{icon}</div>
      <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{label}</div>
      <div className={cn("text-xs font-bold", color)}>{status}</div>
    </div>
  );
}
