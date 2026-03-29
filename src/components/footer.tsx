"use client";

import { BackgroundPaths } from "./ui/background-paths";

export function Footer() {
  return (
    <BackgroundPaths>
      <footer className="relative bg-black/80 overflow-hidden py-16">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none overflow-hidden">
           <span className="font-display font-bold text-[25vw] leading-none text-white whitespace-nowrap">AEGIS</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center">
           <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-wider mb-2">
              Aegis Migration Factory
           </h2>
           <p className="font-body text-white/50 mb-1">
              Built for <span className="text-[#00E5FF]">HACK&apos;A&apos;WAR GenAI × AWS</span>
           </p>
           <p className="font-body text-white/30 text-sm mb-8">
              Ramaiah Institute of Technology · 2026
           </p>

           <div className="flex flex-wrap justify-center gap-3 mb-12">
              {["Next.js", "Amazon Bedrock", "Claude 3.5", "Python FastAPI", "Framer Motion"].map(tech => (
                 <span key={tech} className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-xs font-mono text-white/40 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all duration-300">
                    {tech}
                 </span>
              ))}
           </div>

           <div className="text-[#39FF14] font-mono text-sm border-t border-white/10 w-full max-w-sm pt-8">
              <span className="animate-pulse mr-2">█</span> Zero human intervention required.
           </div>
        </div>
      </footer>
    </BackgroundPaths>
  );
}
