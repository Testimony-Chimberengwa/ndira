"use client";

import type { MouseEventHandler, PropsWithChildren } from "react";
import { motion } from "framer-motion";

type GlassCardProps = PropsWithChildren<{
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}>;

export default function GlassCard({ children, className = "", onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-[24px] border border-white/50 bg-[rgba(255,255,255,0.35)] p-6 text-slate-800 shadow-[0_14px_30px_rgba(46,125,50,0.08)] backdrop-blur-[16px] ${className}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.35)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.5)",
        borderRadius: "24px",
      }}
    >
      {children}
    </motion.div>
  );
}
