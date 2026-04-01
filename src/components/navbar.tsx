"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { GithubPRButton } from "./github-pr-button";

const navLinks = [
  { href: "#problem", label: "Problem" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#demo", label: "Demo" },
  { href: "#tracks", label: "Tracks" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500",
          scrolled
            ? "py-3"
            : "py-5"
        )}
      >
        <div className={cn(
          "max-w-7xl mx-auto px-6 flex items-center justify-between rounded-2xl transition-all duration-500",
          scrolled
            ? "bg-black/40 backdrop-blur-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] mx-6 px-6 py-3"
            : "bg-transparent py-0"
        )}>
          {/* Logo */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#39FF14]/20 border border-white/10 group-hover:border-[#00E5FF]/50 transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00E5FF] group-hover:text-[#39FF14] transition-colors duration-500">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-white via-[#00E5FF] to-[#39FF14] bg-[length:200%_auto] animate-[gradient_4s_linear_infinite] group-hover:from-white group-hover:via-white group-hover:to-[#00E5FF] transition-all duration-500" style={{ fontFamily: 'var(--font-display)' }}>
              AEGIS
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="relative px-4 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#00E5FF] group-hover:w-3/4 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <GithubPRButton />

            <button className="relative px-5 py-2 rounded-xl text-sm font-medium text-white/90 overflow-hidden group transition-all duration-300 border border-white/10 hover:border-[#00E5FF]/40 bg-white/[0.03] hover:bg-[#00E5FF]/10 backdrop-blur-sm">
              <span className="relative z-10 flex items-center gap-2">
                View on GitHub
                <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300">→</span>
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#00E5FF]/5 via-[#00E5FF]/10 to-[#00E5FF]/5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/70 hover:text-white transition-colors p-2"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                className="text-2xl font-medium text-white/70 hover:text-[#00E5FF] transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
