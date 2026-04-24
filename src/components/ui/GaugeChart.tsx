"use client";

import { motion } from "framer-motion";

type GaugeChartProps = {
  value: number;
  label: string;
  color?: string;
};

function getGaugeColor(value: number, color?: string) {
  if (color) {
    return color;
  }

  if (value < 30) {
    return "#4CAF50";
  }

  if (value <= 60) {
    return "#F9A825";
  }

  return "#E53935";
}

export default function GaugeChart({ value, label, color }: GaugeChartProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const fillColor = getGaugeColor(clamped, color);
  const path = "M 24 84 A 36 36 0 0 1 96 84";

  return (
    <div className="relative flex h-44 w-44 items-end justify-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <path d={path} stroke="rgba(148, 163, 184, 0.28)" strokeWidth="10" strokeLinecap="round" />
        <motion.path
          d={path}
          stroke={fillColor}
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: clamped / 100 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="mb-3 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="text-4xl font-bold tracking-tight text-slate-900"
        >
          {clamped}%
        </motion.p>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">{label}</p>
      </div>
    </div>
  );
}
