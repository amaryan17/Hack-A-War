"use client";

import { motion } from "framer-motion";
import { Play, Search, Cloud, Clock, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { BackgroundPaths } from "./ui/background-paths";

// A node on the canvas recreating the n8n UI style exactly
const N8nNode = ({
  x, y, title, subtitle, icon: Icon, color = "#00E5FF", status = "success", time = "0.2s", delay = 0, hasInput = true, hasOutput = true
}: {
  x: number, y: number, title: string, subtitle: string, icon: React.ElementType, color?: string, status?: "success" | "executing", time?: string, delay?: number, hasInput?: boolean, hasOutput?: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4, delay }}
    className="absolute bg-[#1a1c23] rounded-[8px] w-[260px] border border-white/10 flex flex-col shadow-2xl z-10"
    style={{ left: x, top: y }}
  >
    {/* Top Header Section */}
    <div className="flex flex-row p-3 items-center relative overflow-hidden h-[60px]">
      {/* Colorful left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: color }} />

      {/* Icon box */}
      <div className="w-8 h-8 rounded-md flex justify-center items-center ml-2" style={{ backgroundColor: `${color}20`, color: color }}>
        <Icon size={18} strokeWidth={2.5} />
      </div>

      {/* Text labels */}
      <div className="ml-3 flex flex-col justify-center flex-1">
        <span className="text-white text-[13px] font-bold leading-tight drop-shadow-md">{title}</span>
        <span className="text-white/60 text-[11px] font-medium mt-[2px]">{subtitle}</span>
      </div>

      {/* Right Corner Dot */}
      <div className="w-[14px] h-[14px] rounded-full bg-[#1a1c23] border-[2px] flex items-center justify-center mr-1" style={{ borderColor: color }}>
        <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>

    {/* Bottom Status Section */}
    <div className="px-3 py-1.5 bg-black/40 border-t border-white/[0.05] rounded-b-[8px] flex items-center h-[28px]">
      {status === "success" ? (
        <span className="text-[#39FF14] text-[11px] flex items-center gap-[6px] font-bold tracking-wide">
          <CheckCircle2 size={12} strokeWidth={3} /> Success ({time})
        </span>
      ) : (
        <span className="text-[#FFB800] text-[11px] flex items-center gap-[6px] font-bold tracking-wide">
          <Loader2 size={12} strokeWidth={3} className="animate-spin" /> Executing AI...
        </span>
      )}
    </div>

    {/* Ports for visual wiring */}
    {hasInput && (
      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white border border-[#2a2d36] rounded-full z-20" />
    )}
    {hasOutput && (
      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white border border-[#2a2d36] rounded-full z-20" />
    )}
  </motion.div>
);

// Draws a dashed SVG wire matching the n8n aesthetic
const Wire = ({ start, end, color = "#00E5FF", dashDelay = 0 }: { start: [number, number], end: [number, number], color?: string, dashDelay?: number }) => {
  const [startX, startY] = start;
  const [endX, endY] = end;

  // Straight segment out, branch in middle
  const ctrl1X = startX + 40;
  const ctrl2X = endX - 40;
  const path = `M ${startX} ${startY} C ${ctrl1X} ${startY}, ${ctrl2X} ${endY}, ${endX} ${endY}`;

  return (
    <g>
      {/* Dimmed background path */}
      <path d={path} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
      {/* Colored dashed line overlay */}
      <motion.path
        initial={{ strokeDashoffset: -100, opacity: 0 }}
        whileInView={{ strokeDashoffset: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: dashDelay }}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
    </g>
  );
};

export function Pipeline() {
  return (
    <BackgroundPaths>
      <section id="pipeline" className="py-24 bg-[#0D0F14] relative z-10 w-full overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Autonomous Agent Pipeline
            </h2>
            <p className="text-white/50 font-body text-lg max-w-2xl mx-auto">
              Visualizing the GCP-to-AWS factory workflow in real-time execution.
            </p>
          </motion.div>

          {/* Diagram Canvas Container (scrollable on mobile) */}
          <div className="w-full overflow-x-auto custom-scrollbar pb-12 relative flex justify-center">
            <div className="relative min-w-[1300px] h-[520px] mt-4 bg-[#14151A]/80 rounded-2xl border border-white/[0.03] shadow-inner overflow-hidden">

              {/* SVG Wires Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <Wire start={[310, 244]} end={[370, 244]} color="#39FF14" dashDelay={0.3} />
                <Wire start={[630, 244]} end={[690, 244]} color="#A78BFA" dashDelay={0.4} />
                <Wire start={[950, 244]} end={[1020, 144]} color="#00E5FF" dashDelay={0.5} />
                <Wire start={[950, 244]} end={[1020, 344]} color="#00E5FF" dashDelay={0.5} />
              </svg>

              {/* N8N UI NODES */}

              {/* Node 1 */}
              <N8nNode
                x={50} y={200}
                title="Tech Debt Scanner" subtitle="Cleans Legacy & Python/TF"
                icon={Search} color="#39FF14" delay={0.1}
                hasInput={false}
              />

              {/* Node 2 */}
              <N8nNode
                x={370} y={200}
                title="Migration Translator" subtitle="Maps Dependencies to AWS"
                icon={Cloud} color="#A78BFA" delay={0.2}
              />

              {/* Node 3 */}
              <N8nNode
                x={690} y={200}
                title="Solution Architect" subtitle="Designs Target AWS Arch"
                icon={Play} color="#00E5FF" delay={0.3}
              />

              {/* Node 4 (Top Branch) */}
              <N8nNode
                x={1020} y={100}
                title="Security Enforcer" subtitle="Validates IAM & Policies"
                icon={ShieldCheck} color="#FFB800" status="executing" delay={0.4}
                hasOutput={false}
              />

              {/* Node 5 (Bottom Branch) */}
              <N8nNode
                x={1020} y={300}
                title="Audit Compiler" subtitle="Generates Compliance Reports"
                icon={CheckCircle2} color="#00E5FF" status="executing" delay={0.5}
                hasOutput={false}
              />

            </div>
          </div>
        </div>
      </section>
    </BackgroundPaths>
  );
}
