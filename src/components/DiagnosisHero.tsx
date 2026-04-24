"use client";

import { Lightbulb } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GaugeChart from "@/components/ui/GaugeChart";
import type { DiagnosisResult } from "@/lib/types";

type DiagnosisHeroProps = {
  diagnosis: DiagnosisResult;
};

function getSeverityStyles(severity: DiagnosisResult["severity"]) {
  switch (severity) {
    case "low":
      return "bg-emerald-100 text-emerald-800";
    case "medium":
      return "bg-amber-100 text-amber-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "critical":
      return "bg-red-100 text-red-700";
    default:
      return "bg-emerald-100 text-emerald-800";
  }
}

export default function DiagnosisHero({ diagnosis }: DiagnosisHeroProps) {
  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="space-y-5">
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-emerald-950">
            {diagnosis.pest_or_disease}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {diagnosis.confidence_percent}% confident
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityStyles(diagnosis.severity)}`}>
              {diagnosis.severity}
            </span>
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-600">{diagnosis.summary}</p>

        <div className="flex justify-center py-2">
          <GaugeChart
            value={diagnosis.estimated_yield_loss_percent}
            label="Yield at risk"
          />
        </div>

        <div className="rounded-[20px] border border-amber-200 bg-amber-50/70 p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Local remedy</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{diagnosis.local_remedy}</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
