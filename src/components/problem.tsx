"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BackgroundPaths } from "./ui/background-paths";
import { GlowCard } from "./ui/spotlight-card";

// Custom hook for animated counter
function useCountUp(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        setCount(progress * end);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end, duration]);

  return { count, ref };
}

function StatCard({ 
  value, suffix, prefix, label, colorClass, glowColor, delay 
}: { 
  value: number; suffix: string; prefix?: string; label: string; colorClass: string; glowColor: 'blue' | 'purple' | 'green' | 'red' | 'orange'; delay: number 
}) {
  const { count, ref } = useCountUp(value, 2.5);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      <GlowCard customSize={true} glowColor={glowColor} className="w-full flex flex-col items-center justify-center p-8 group hover:-translate-y-1 transition-all duration-300">
        <h3 className={cn("font-display text-5xl md:text-6xl font-bold mb-4 tracking-tighter drop-shadow-lg", colorClass)}>
          {prefix}{Math.floor(count)}{suffix}
        </h3>
        <p className="text-white/50 font-body font-medium text-center uppercase tracking-widest text-xs">
          {label}
        </p>
      </GlowCard>
    </motion.div>
  );
}

export function Problem() {
  return (
    <BackgroundPaths>
      <section id="problem" className="py-24 relative z-10 w-full bg-black/80">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Enterprise Migrations <br /><span className="text-[#FF4444]">Are Broken</span>
            </h2>
            <p className="text-white/50 font-body text-lg">
              The same story, every time. Months of delays, millions wasted, security holes left open.
            </p>
          </motion.div>

          {/* Stats Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <StatCard 
              value={6} suffix=" Months" label="Average manual GCP→AWS migration timeline" 
              colorClass="text-[#FFB800]" glowColor="orange" delay={0.1}
            />
            <StatCard 
              value={2.4} prefix="$" suffix="M" label="Average cost of a cloud data breach from over-permissioned IAM" 
              colorClass="text-[#FF4444]" glowColor="red" delay={0.2}
            />
            <StatCard 
              value={73} suffix="%" label="Enterprise cloud migrations that go over budget" 
              colorClass="text-[#FFB800]" glowColor="orange" delay={0.3}
            />
          </div>

          {/* Comparison Layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Old Way */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlowCard customSize={true} glowColor="red" className="w-full p-8">
                <h3 className="font-display font-bold text-xl text-[#FF4444] flex items-center mb-6">
                  <span className="mr-3 text-2xl">❌</span> The Old Way
                </h3>
                <ul className="space-y-4">
                  {[
                    "Manual consultant service mapping (weeks)",
                    "Hand-written Terraform prone to misconfiguration",
                    "FullAdminAccess IAM because nobody has time",
                    "3-week compliance audit spreadsheet nightmare",
                    "$500K+ migration engagement cost"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start text-white/40 font-body">
                      <span className="text-[#FF4444] mr-3 mt-1 text-sm opacity-60">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            </motion.div>

            {/* Aegis Way */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GlowCard customSize={true} glowColor="green" className="w-full p-8">
                <h3 className="font-display font-bold text-xl text-[#39FF14] flex items-center mb-6 text-glow-green">
                  <span className="mr-3 text-2xl">✓</span> The Aegis Way
                </h3>
                <ul className="space-y-4">
                  {[
                    "AI-driven service mapping in seconds",
                    "Terraform auto-generated from code analysis",
                    "Zero-Trust IAM mathematically derived from AST",
                    "Instant SOC-2 compliance PDF, cryptographically signed",
                    "One upload, one click, zero human bottleneck"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start text-white/80 font-body">
                      <span className="text-[#39FF14] mr-3 mt-1 text-sm font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </section>
    </BackgroundPaths>
  );
}
