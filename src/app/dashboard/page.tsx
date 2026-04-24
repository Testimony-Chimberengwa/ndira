"use client";

import { useState } from "react";
import GaugeChart from "@/components/ui/GaugeChart";
import NavBar, { type NavTab } from "@/components/ui/NavBar";
import TreatmentCard from "@/components/ui/TreatmentCard";
import WeatherStrip from "@/components/ui/WeatherStrip";
import GlassCard from "@/components/ui/GlassCard";

const treatment = [
  {
    step: 1,
    icon: "💧",
    title: "Increase irrigation",
    description: "Keep root moisture steady for 5 days.",
    urgency: "immediate" as const,
  },
  {
    step: 2,
    icon: "🌿",
    title: "Use neem spray",
    description: "Apply in the early morning every 3 days.",
    urgency: "within_3_days" as const,
  },
  {
    step: 3,
    icon: "🧤",
    title: "Isolate affected rows",
    description: "Prevent spread while monitoring new leaves.",
    urgency: "this_week" as const,
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("farm");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <WeatherStrip city="Harare" temp={28} condition="Partly cloudy" riskNote="Watch for afternoon showers" />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Latest Diagnosis</p>
          <h1 className="mt-2 text-3xl font-bold text-emerald-950">Spider mites + drought stress</h1>
          <p className="mt-3 max-w-2xl text-slate-700">
            Estimated impact remains moderate if treatment starts in the next 48 hours.
          </p>
        </GlassCard>
        <GlassCard className="flex items-center justify-center">
          <GaugeChart value={35} label="Yield risk" color="#F9A825" />
        </GlassCard>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-emerald-950">Treatment Plan</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
          {treatment.map((step) => (
            <TreatmentCard key={step.step} {...step} />
          ))}
        </div>
      </section>

      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
