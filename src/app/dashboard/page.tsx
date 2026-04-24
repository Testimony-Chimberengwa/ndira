"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import DiagnosisHero from "@/components/DiagnosisHero";
import NavBar, { type NavTab } from "@/components/ui/NavBar";
import TreatmentCard from "@/components/ui/TreatmentCard";
import WeatherStrip from "@/components/ui/WeatherStrip";
import GlassCard from "@/components/ui/GlassCard";
import type { DiagnosisResult } from "@/lib/types";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const pageTransition = { duration: 0.35 };

function isDiagnosisResult(value: unknown): value is DiagnosisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DiagnosisResult>;

  return (
    typeof candidate.pest_or_disease === "string" &&
    typeof candidate.confidence_percent === "number" &&
    typeof candidate.severity === "string" &&
    typeof candidate.estimated_yield_loss_percent === "number" &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.treatment_steps) &&
    typeof candidate.prevention_tip === "string" &&
    typeof candidate.local_remedy === "string"
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavTab>("farm");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("ndira_last_diagnosis");

    if (!stored) {
      router.push("/");
      return;
    }

    try {
      const parsed: unknown = JSON.parse(stored);

      if (!isDiagnosisResult(parsed)) {
        router.push("/");
        return;
      }

      setDiagnosis(parsed);
    } catch {
      router.push("/");
    }
  }, [router]);

  const treatmentSteps = useMemo(() => diagnosis?.treatment_steps ?? [], [diagnosis]);

  function handleStartNewDiagnosis() {
    window.localStorage.removeItem("ndira_last_diagnosis");
    router.push("/");
  }

  if (!diagnosis) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[480px] px-4 pb-24 pt-4">
      <div className="space-y-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={pageVariants}
          transition={{ ...pageTransition, delay: 0.1 }}
          className="flex items-center justify-between pt-1"
        >
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-[rgba(255,255,255,0.35)] text-emerald-900 backdrop-blur-[16px]"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-sm font-semibold tracking-[0.2em] text-emerald-900">Diagnosis Ready</h1>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.2 }}>
          <DiagnosisHero diagnosis={diagnosis} />
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.3 }}>
          <WeatherStrip city="Harare" temp={28} condition="Partly cloudy" riskNote="Watch for afternoon showers" />
        </motion.div>

        <motion.section initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.4 }}>
          <h2 className="mb-3 text-xl font-bold text-emerald-950">Your Action Plan</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [scroll-snap-type:x_mandatory]">
            {treatmentSteps.map((step) => (
              <div key={step.step} className="snap-start shrink-0">
                <TreatmentCard {...step} />
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.5 }}>
          <GlassCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Prevention Tip</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{diagnosis.prevention_tip}</p>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <motion.div initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.6 }}>
          <button
            type="button"
            onClick={handleStartNewDiagnosis}
            className="flex h-14 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(46,125,50,0.24)] transition hover:bg-emerald-900"
          >
            Start a new diagnosis
          </button>
        </motion.div>
      </div>

      <div className="pt-4">
        <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  );
}
