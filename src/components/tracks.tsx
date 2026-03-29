"use client";

import { motion } from "framer-motion";
import { TRACKS_DATA } from "@/lib/data";
import { BackgroundPaths } from "./ui/background-paths";
import { GlowCard } from "./ui/spotlight-card";

export function Tracks() {
  return (
    <BackgroundPaths>
      <section id="tracks" className="py-24 bg-black/80">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.6 }}
             className="mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Engineered Across <br /><span className="text-[#00E5FF] text-glow-cyan">Every Track</span>
            </h2>
            <p className="text-white/50 font-body text-lg">
              Aegis Migration Factory doesn&apos;t compete in one domain. It dominates six.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {TRACKS_DATA.map((row, idx) => (
               <motion.div
                 key={idx}
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 0.5, delay: idx * 0.1 }}
               >
                 <GlowCard customSize={true} glowColor="blue" className="w-full p-6 group">
                   <div className="grid grid-cols-1 md:grid-cols-[150px_250px_1fr_120px] gap-6 items-center">
                     {/* Track Number Badge */}
                     <div>
                       <span className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-xs tracking-wider shadow-[0_0_10px_rgba(0,229,255,0.1)] group-hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-shadow">
                         {row.track}
                       </span>
                     </div>

                     {/* Track Name */}
                     <div>
                       <h4 className="font-display font-bold text-white text-lg">
                         {row.name}
                       </h4>
                     </div>

                     {/* Description */}
                     <div>
                       <p className="font-body text-white/50 text-sm leading-relaxed">
                         {row.description}
                       </p>
                     </div>

                     {/* Covered Badge */}
                     <div className="md:justify-self-end">
                       <div className="flex items-center space-x-2 text-[#39FF14] font-mono text-xs font-bold border border-[#39FF14]/30 px-3 py-1.5 rounded bg-[#39FF14]/5">
                         <span>✓</span>
                         <span>COVERED</span>
                       </div>
                     </div>
                   </div>
                 </GlowCard>
               </motion.div>
            ))}
          </div>
        </div>
      </section>
    </BackgroundPaths>
  );
}
