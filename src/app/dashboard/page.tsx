"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, Globe2, MapPin, Shield, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import DiagnosisHero from "@/components/DiagnosisHero";
import NavBar from "@/components/ui/NavBar";
import TreatmentCard from "@/components/ui/TreatmentCard";
import WeatherStrip from "@/components/ui/WeatherStrip";
import GlassCard from "@/components/ui/GlassCard";
import type { DiagnosisResult, FarmLocation } from "@/lib/types";
import { formatFarmLocation } from "@/lib/location";
import WeatherConsensusPanel from "@/components/WeatherConsensusPanel";

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

type StoredContext = {
  location?: FarmLocation | null;
};

function buildEducationPoint(diagnosis: DiagnosisResult) {
  if (diagnosis.severity === "critical" || diagnosis.severity === "high") {
    return "High-risk crops need daily checks. Remove severely infected plants early, clean tools between rows, and avoid moving from sick plants to healthy ones without sanitation.";
  }

  return "Check the underside of leaves every morning. Most crop problems are easier to stop when you catch the first spots, holes, or curling before they spread.";
}

function buildNewsLinks(diagnosis: DiagnosisResult) {
  const query = encodeURIComponent(`${diagnosis.pest_or_disease} Zimbabwe agriculture`);

  return [
    {
      title: "Crop disease news",
      href: `https://news.google.com/search?q=${query}`,
    },
    {
      title: "Weather and farming news",
      href: "https://news.google.com/search?q=Zimbabwe%20weather%20agriculture",
    },
    {
      title: "Maize and field advice",
      href: "https://news.google.com/search?q=maize%20farming%20advice%20Africa",
    },
  ];
}

export default function DashboardPage() {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [farmLocation, setFarmLocation] = useState<FarmLocation | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("ndira_last_diagnosis");
    const storedContext = window.localStorage.getItem("ndira_last_context");

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

      if (storedContext) {
        try {
          const parsedContext = JSON.parse(storedContext) as StoredContext;
          setFarmLocation(parsedContext.location ?? null);
        } catch {
          setFarmLocation(null);
        }
      }
    } catch {
      router.push("/");
    }
  }, [router]);

  const treatmentSteps = useMemo(() => diagnosis?.treatment_steps ?? [], [diagnosis]);
  const locationLabel = formatFarmLocation(farmLocation);
  const educationPoint = diagnosis ? buildEducationPoint(diagnosis) : "";
  const newsLinks = useMemo(() => (diagnosis ? buildNewsLinks(diagnosis) : []), [diagnosis]);

  function handleStartNewDiagnosis() {
    window.localStorage.removeItem("ndira_last_diagnosis");
    window.localStorage.removeItem("ndira_last_context");
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
          <GlassCard className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Farm location</p>
              <p className="truncate text-sm font-semibold text-emerald-950">{locationLabel}</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.35 }}>
          <WeatherStrip
            city={locationLabel}
            temp={28}
            condition="Partly cloudy"
            riskNote="Watch for afternoon showers"
            lat={farmLocation?.latitude}
            lon={farmLocation?.longitude}
          />
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.38 }}>
          <WeatherConsensusPanel location={farmLocation} />
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

        <motion.section initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.6 }}>
          <GlassCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Education point</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{educationPoint}</p>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <motion.section initial="hidden" animate="show" variants={pageVariants} transition={{ ...pageTransition, delay: 0.7 }}>
          <GlassCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Globe2 className="h-4 w-4" />
              </div>
              <div className="w-full">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Browse news</p>
                <div className="mt-3 space-y-2">
                  {newsLinks.map((link) => (
                    <a
                      key={link.title}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-white/80"
                    >
                      <span>{link.title}</span>
                      <ExternalLink className="h-4 w-4 text-emerald-700" />
                    </a>
                  ))}
                </div>
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
        <NavBar activeTab="farm" />
      </div>
    </main>
  );
}
