/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { 
  Database, 
  Server, 
  Cloud, 
  Shield, 
  Workflow, 
  Cpu, 
  ArrowRight,
  ChevronRight,
  Lock,
  FileCode
} from "lucide-react";
import { BackgroundPaths } from "./ui/background-paths";
import { GlowCard } from "./ui/spotlight-card";

const Layer = ({ title, items, color }: { title: string; items: { icon: React.ElementType; label: string; sublabel: string }[]; color: string }) => (
  <div className="flex flex-col gap-4 w-full">
    <div className="flex items-center gap-2 mb-2 px-2">
      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }} />
      <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white/50 uppercase">{title}</span>
    </div>
    <div className="flex flex-col gap-4">
      {items.map((item, idx) => (
        <motion.div
           key={idx}
           initial={{ opacity: 0, x: -20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5, delay: idx * 0.1 }}
        >
          <GlowCard 
            customSize={true} 
            glowColor={color === "#00E5FF" ? "blue" : "purple"}
            className="p-4 flex items-center justify-between group cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                <item.icon size={18} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wide">{item.label}</span>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-tight">{item.sublabel}</span>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               <ChevronRight size={14} className="text-cyan-400" />
            </div>
          </GlowCard>
        </motion.div>
      ))}
    </div>
  </div>
);

export function Architecture() {
  const gcpLayer = [
    { icon: Cloud, label: "GCP Portfolio", sublabel: "Legacy Ingest" },
    { icon: Database, label: "BigTable / Spanner", sublabel: "Stateful Layers" },
    { icon: Workflow, label: "GCP Pub/Sub", sublabel: "Event Bus" }
  ];

  const orchestratorLayer = [
    { icon: Cpu, label: "AI Translation Engine", sublabel: "Claude 3.5 Sonnet" },
    { icon: Workflow, label: "Agentic Mapper", sublabel: "Service Translation" },
    { icon: Shield, label: "Security Enforcer", sublabel: "Zero-Trust Agent" }
  ];

  const targetLayer = [
    { icon: Server, label: "AWS Infrastructure", sublabel: "EKS / Lambda" },
    { icon: Lock, label: "Amazon IAM", sublabel: "Mathematically Least Privilege" },
    { icon: FileCode, label: "Signed Audit Vault", sublabel: "SOC-2 Artifacts" }
  ];

  return (
    <BackgroundPaths>
      <section id="architecture" className="py-24 bg-black/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tighter">
              Factory <span className="text-cyan-400">Architecture Matrix</span>
            </h2>
            <p className="text-white/40 font-body text-lg max-w-2xl mx-auto">
              Deployment traffic flows traverse the AI orchestration layer before outputting finalized AWS artifacts.
            </p>
          </motion.div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 relative overflow-hidden">
            {/* Flow Lines Background */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              <svg className="w-full h-full opacity-20" overflow="visible">
                <path d="M 400 200 L 800 200" stroke="#00E5FF" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                <path d="M 400 400 L 800 400" stroke="#00E5FF" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                <path d="M 400 600 L 800 600" stroke="#00E5FF" strokeWidth="1" strokeDasharray="4 4" fill="none" />
              </svg>
            </div>

            <Layer title="Source: GCP" items={gcpLayer} color="#A78BFA" />
            <div className="relative">
               <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-24 opacity-20 translate-x-12 lg:translate-x-0">
                  <ArrowRight size={20} className="text-cyan-400" />
                  <ArrowRight size={20} className="text-cyan-400" />
                  <ArrowRight size={20} className="text-cyan-400" />
               </div>
               <Layer title="Orchestrator: Aegis" items={orchestratorLayer} color="#00E5FF" />
               <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-24 opacity-20 -translate-x-12 lg:-translate-x-0">
                  <ArrowRight size={20} className="text-cyan-400" />
                  <ArrowRight size={20} className="text-cyan-400" />
                  <ArrowRight size={20} className="text-cyan-400" />
               </div>
            </div>
            <Layer title="Target: AWS" items={targetLayer} color="#39FF14" />
          </div>

          {/* Final Callout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 p-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm text-center"
          >
             <span className="font-mono text-xs text-cyan-400 uppercase tracking-[0.2em] block mb-2">Outcome Engine</span>
             <p className="text-white/60 font-body text-sm max-w-xl mx-auto italic">
                {"\""}Every transaction is cryptographically signed and validated against SOC-2 Type II evidence frameworks across the entire cloud topology.{"\""}
             </p>
          </motion.div>
        </div>
      </section>
    </BackgroundPaths>
  );
}
