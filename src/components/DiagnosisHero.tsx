"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";

export default function DiagnosisHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard className="relative overflow-hidden p-8">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Ndira Assistant</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Smart crop diagnosis for every field.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-700">
          Describe symptoms in plain language and get an actionable treatment plan backed by AI.
        </p>
      </GlassCard>
    </motion.section>
  );
}
