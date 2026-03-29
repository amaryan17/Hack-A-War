/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BackgroundPaths } from "./ui/background-paths";
import { GlowCard } from "./ui/spotlight-card";

const tabs = [
  { id: 1, title: "Step 1: Upload" },
  { id: 2, title: "Step 2: Scan" },
  { id: 3, title: "Step 3: Translate" },
  { id: 4, title: "Step 4: IAM" },
  { id: 5, title: "Step 5: Audit" },
];

export function DemoTabs() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <BackgroundPaths>
      <section id="demo" className="py-24 bg-black/80 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.6 }}
             className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 text-glow-cyan">See It Work</h2>
            <p className="text-white/50 font-body text-lg">One upload triggers the full autonomous pipeline.</p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto custom-scrollbar border-b border-white/10 mb-12 relative">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-4 font-mono text-sm tracking-wide whitespace-nowrap transition-all duration-300 relative",
                    isActive ? "text-[#00E5FF] text-glow-cyan" : "text-white/30 hover:text-white/60"
                  )}
                >
                  {tab.title}
                  {isActive && (
                     <motion.div
                        layoutId="activeTabBottom"
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                     />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <GlowCard customSize={true} glowColor="blue" className="w-full p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-2 gap-12"
              >
                {activeTab === 1 && <Step1 />}
                {activeTab === 2 && <Step2 />}
                {activeTab === 3 && <Step3 />}
                {activeTab === 4 && <Step4 />}
                {activeTab === 5 && <Step5 />}
              </motion.div>
            </AnimatePresence>
          </GlowCard>
        </div>
      </section>
    </BackgroundPaths>
  );
}

// ── CODE BOX COMPONENT ──
function CodeBox({ title, titleColor, children, borderColor = "border-white/10" }: { 
  title: string; titleColor: string; children: React.ReactNode; borderColor?: string 
}) {
  return (
    <div className={cn("rounded-xl overflow-hidden border bg-black/60 backdrop-blur-sm", borderColor)}>
      <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b", borderColor)}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        <span className={cn("text-xs font-mono font-bold ml-2", titleColor)}>{title}</span>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="font-mono text-[11px] leading-relaxed">
          {children}
        </pre>
      </div>
    </div>
  );
}

// ── STEP CONTENTS ──

function Step1() {
  return (
    <>
      <div className="flex flex-col justify-center">
        <h3 className="font-display text-2xl font-bold mb-4 text-white">Ingestion Phase</h3>
        <p className="text-white/50 font-body leading-relaxed mb-8">
          Aegis begins by accepting your legacy Cloud Deployment via GitHub integration or direct ZIP upload. Our ingestion module parses every `.tf`, mapping dependencies to reconstruct your complete GCP architectural topology.
        </p>
      </div>
      <div className="flex flex-col space-y-4">
        <div className="w-full border-2 border-dashed border-white/10 rounded-xl bg-black/30 p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/5 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-xl">📁</span>
          </div>
          <span className="font-mono text-sm text-white/70">Drag & drop gcp-portfolio.zip</span>
        </div>
        <CodeBox title="gcp/main.tf" titleColor="text-white/50" borderColor="border-white/10">
          <span className="text-purple-400">resource</span> <span className="text-[#00E5FF]">&quot;google_compute_instance&quot; &quot;app_server&quot;</span> {"{\n"}
          {"  "}name         = <span className="text-[#39FF14]">&quot;prod-app-server&quot;</span>{"\n"}
          {"  "}machine_type = <span className="text-[#39FF14]">&quot;n2-standard-4&quot;</span>{"\n"}
          {"  "}zone         = <span className="text-[#39FF14]">&quot;us-central1-a&quot;</span>{"\n"}
          {"\n"}
          {"  "}boot_disk {"{\n"}
          {"    "}initialize_params {"{\n"}
          {"      "}image = <span className="text-[#39FF14]">&quot;debian-cloud/debian-11&quot;</span>{"\n"}
          {"    }\n  }\n}"}
        </CodeBox>
      </div>
    </>
  );
}

function Step2() {
  return (
    <>
      <div className="flex flex-col justify-center">
        <h3 className="font-display text-2xl font-bold mb-4 text-white">Tech Debt Analysis</h3>
        <p className="text-white/50 font-body leading-relaxed mb-8">
          The Abstract Syntax Tree is scanned for critical security flaws, deprecated modules, and structural coupling. A health score forms the baseline before any automated remediation occurs.
        </p>
      </div>
      <div className="flex flex-col items-center rounded-xl p-8 relative overflow-hidden bg-black/30 border border-white/10">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#FF4444]/20 rounded-full blur-2xl" />
        
        <div className="relative w-40 h-40 rounded-full border-[6px] border-white/10 flex items-center justify-center z-10 mb-8" 
             style={{ 
               background: "conic-gradient(var(--tw-gradient-stops))", 
               WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)",
             }}>
          <div className="absolute inset-0 bg-transparent" style={{ backgroundImage: "conic-gradient(#FF4444 34%, transparent 0)" }} />
          <div className="font-display text-4xl font-bold text-[#FF4444] bg-black w-full h-full flex items-center justify-center rounded-full drop-shadow-lg relative z-20">
            34<span className="text-lg text-white/30 mt-2">/100</span>
          </div>
        </div>

        <div className="w-full space-y-3 z-10">
          <div className="bg-[#FF4444]/10 border border-[#FF4444]/30 rounded-lg px-4 py-2 flex items-start">
            <span className="w-2 h-2 rounded-full bg-[#FF4444] animate-pulse mt-2 mr-3" />
            <div>
              <span className="text-xs font-bold text-[#FF4444] uppercase tracking-wider">Critical</span>
              <p className="text-sm font-mono text-white/80 mt-1">Monolithic service coupling detected (3 modules)</p>
            </div>
          </div>
          <div className="bg-[#FF4444]/10 border border-[#FF4444]/30 rounded-lg px-4 py-2 flex items-start">
            <span className="w-2 h-2 rounded-full bg-[#FF4444] mt-2 mr-3" />
            <div>
              <span className="text-xs font-bold text-[#FF4444] uppercase tracking-wider">Critical</span>
              <p className="text-sm font-mono text-white/80 mt-1">Deprecated google-cloud-sdk &lt; 400.0.0</p>
            </div>
          </div>
          <div className="bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg px-4 py-2 flex items-start">
            <span className="w-2 h-2 rounded-full bg-[#FFB800] mt-2 mr-3" />
            <div>
              <span className="text-xs font-bold text-[#FFB800] uppercase tracking-wider">High</span>
              <p className="text-sm font-mono text-white/80 mt-1">No retry logic on Pub/Sub consumers</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Step3() {
  return (
    <>
      <div className="flex flex-col justify-center">
         <h3 className="font-display text-2xl font-bold mb-4 text-white">AWS Translation</h3>
         <p className="text-white/50 font-body leading-relaxed mb-8">
            The heart of the pipeline. Proprietary LLM translation arrays map GCP resources directly to optimized AWS equivalents, updating API versions and standardizing tag architectures—instantly.
         </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CodeBox title="GCP (Before)" titleColor="text-[#FF4444]" borderColor="border-[#FF4444]/30">
          <span className="text-purple-400">resource</span> <span className="text-[#00E5FF]">&quot;google_compute_instance&quot; &quot;app&quot;</span> {"{\n"}
          {"  "}machine_type = <span className="text-[#39FF14]">&quot;n2-standard-4&quot;</span>{"\n"}
          ...{"\n}\n"}
          <span className="text-purple-400">resource</span> <span className="text-[#00E5FF]">&quot;google_pubsub_topic&quot; &quot;events&quot;</span> {"{ ... }\n"}
          <span className="text-purple-400">resource</span> <span className="text-[#00E5FF]">&quot;google_sql_database_instance&quot; &quot;db&quot;</span> {"{ ... }\n"}
        </CodeBox>

        <CodeBox title="AWS (After)" titleColor="text-[#39FF14]" borderColor="border-[#39FF14]/30">
          <div className="pl-2 border-l-2 border-[#39FF14]/30">
            <span className="text-purple-400">resource</span> <span className="text-[#00E5FF]">&quot;aws_instance&quot; &quot;app&quot;</span> {"{\n"}
            {"  "}instance_type = <span className="text-[#39FF14]">&quot;t3.xlarge&quot;</span>{"\n"}
            {"  "}ami           = data.aws_ami.amazon_linux.id{"\n"}
            ...{"\n}\n"}
            <span className="text-purple-400">resource</span> <span className="text-[#00E5FF]">&quot;aws_sqs_queue&quot; &quot;events&quot;</span> {"{ ... }\n"}
            <span className="text-purple-400">resource</span> <span className="text-[#00E5FF]">&quot;aws_rds_instance&quot; &quot;db&quot;</span> {"{\n"}
            {"  "}engine         = <span className="text-[#39FF14]">&quot;postgres&quot;</span>{"\n"}
            {"  "}engine_version = <span className="text-[#39FF14]">&quot;14.9&quot;</span>{"\n"}
            ...{"\n}\n"}
          </div>
        </CodeBox>
      </div>
    </>
  );
}

function Step4() {
  return (
    <>
      <div className="flex flex-col justify-center">
         <h3 className="font-display text-2xl font-bold mb-4 text-white">Zero-Trust IAM</h3>
         <p className="text-white/50 font-body leading-relaxed mb-8">
            The security agent mathematically computes the absolute minimum necessary permissions from your application codebase, eradicating <code className="text-[#FF4444] bg-[#FF4444]/10 px-1 rounded">FullAdministratorAccess</code> policies entirely.
         </p>
      </div>
      <div className="space-y-6">
        <CodeBox title="BEFORE — Dangerous" titleColor="text-[#FF4444]" borderColor="border-[#FF4444]/30">
          <span className="text-[#FF4444]/80">{`{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}`}</span>
          {"\n"}
          <span className="text-xs font-bold text-[#FF4444]">❌ FullAdministratorAccess — catastrophic blast radius</span>
        </CodeBox>

        <div className="flex justify-center my-[-10px] relative z-20">
           <div className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center font-mono text-xs text-white/40 backdrop-blur-sm">↓</div>
        </div>

        <CodeBox title="AFTER — Zero-Trust" titleColor="text-[#39FF14]" borderColor="border-[#39FF14]/30">
          <span className="text-[#39FF14]/90">{`{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject",
    "sqs:SendMessage",
    "rds:DescribeDBInstances"
  ],
  "Resource": [
    "arn:aws:s3:::app-bucket/*",
    "arn:aws:sqs:us-east-1:*:app-events"
  ]
}`}</span>
          {"\n"}
          <span className="text-xs font-bold text-[#39FF14]">✓ Least-Privilege — 98.3% attack surface reduction</span>
        </CodeBox>
      </div>
    </>
  );
}

function Step5() {
  return (
    <>
      <div className="flex flex-col justify-center">
         <h3 className="font-display text-2xl font-bold mb-4 text-white">SOC-2 Audit PDF</h3>
         <p className="text-white/50 font-body leading-relaxed mb-8">
            The orchestrator distills all migration actions into localized evidence frameworks, outputting a cryptographically signed compliance ledger ready for an external auditor.
         </p>
         <button className="self-start px-6 py-3 rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] font-mono text-sm hover:bg-[#00E5FF]/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300">
             📥 Download Audit Report
         </button>
      </div>
      
      {/* Mock PDF Document Card */}
      <div className="bg-[#f2f4f8] text-[#111827] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-8 flex flex-col relative overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
         <div className="absolute top-0 right-0 w-16 h-16 border-l pointer-events-none" style={{ borderLeftColor: "#e5e7eb", borderLeftWidth: "16px", borderBottomColor: "transparent", borderBottomWidth: "16px" }} />
         
         <div className="border-b border-[#cbd5e1] pb-4 mb-6">
            <h4 className="font-body font-bold text-lg tracking-widest text-[#0f172a] uppercase">AEGIS MIGRATION COMPLIANCE REPORT</h4>
            <p className="text-sm text-[#475569]">SOC 2 Type II — Automated Evidence Collection</p>
         </div>

         <div className="mb-6">
            <span className="px-3 py-1 bg-[#dcfce7] text-[#166534] border border-[#22c55e] rounded text-xs font-bold uppercase tracking-wider">
               ✓ COMPLIANT
            </span>
         </div>

         <div className="space-y-5 flex-1 w-full">
            {[
              { id: "CC6.1", title: "Logical Access Controls" },
              { id: "CC7.2", title: "Vulnerability Management" },
              { id: "CC8.1", title: "Encryption at Rest" }
            ].map(control => (
               <div key={control.id}>
                 <div className="flex justify-between text-xs font-bold text-[#334155] mb-1">
                    <span>{control.id} {control.title}</span>
                    <span className="text-[#15803d]">100%</span>
                 </div>
                 <div className="w-full bg-[#cbd5e1] h-2 rounded overflow-hidden">
                    <div className="bg-[#16a34a] h-full" style={{ width: "100%" }} />
                 </div>
               </div>
            ))}
         </div>

         <div className="mt-8 pt-4 border-t border-dashed border-[#cbd5e1] text-[10px] text-[#64748b] font-mono tracking-wide text-center">
            Cryptographically signed · Generated by Aegis Audit Agent
         </div>
      </div>
    </>
  );
}
