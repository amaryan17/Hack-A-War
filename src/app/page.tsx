"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Problem } from "@/components/problem";
import { Pipeline } from "@/components/pipeline";
import { DemoTabs } from "@/components/demo-tabs";
import { MigrationDashboard } from "@/components/migration-dashboard";
import { Tracks } from "@/components/tracks";
import { Footer } from "@/components/footer";

const sectionVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.8, 
    } 
  },
};

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={{
        ...sectionVariants,
        visible: {
          ...sectionVariants.visible,
          transition: {
            ...sectionVariants.visible.transition,
            delay,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      <Navbar />
      <main className="flex-grow flex flex-col w-full">
        <Hero />
        <AnimatedSection>
          <Problem />
        </AnimatedSection>
        <AnimatedSection>
          <Pipeline />
        </AnimatedSection>
        <AnimatedSection>
          <DemoTabs />
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <MigrationDashboard />
        </AnimatedSection>

        <AnimatedSection>
          <Tracks />
        </AnimatedSection>
      </main>
      <AnimatedSection>
        <Footer />
      </AnimatedSection>
    </div>
  );
}
