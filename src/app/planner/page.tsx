"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, WandSparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import NavBar from "@/components/ui/NavBar";
import type { FarmPlanResult } from "@/lib/types";

type PlannerRequest = {
  prompt: string;
  imageDataUrl?: string;
  imageName?: string;
};

export default function PlannerPage() {
  const [prompt, setPrompt] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FarmPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const budgetEntries = useMemo(() => {
    if (!result) return [] as Array<{ label: string; value: number }>;
    return [
      { label: "Soil and beds", value: result.budgetSplit.soilAndBeds },
      { label: "Irrigation", value: result.budgetSplit.irrigation },
      { label: "Livestock/structures", value: result.budgetSplit.livestockOrStructures },
      { label: "Storage and paths", value: result.budgetSplit.storageAndPaths },
    ];
  }, [result]);

  async function handleGeneratePlan() {
    if (!prompt.trim()) {
      setError("Tell the AI what kind of farm plan or redesign you want.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const payload: PlannerRequest = {
        prompt: prompt.trim(),
        imageDataUrl: imageDataUrl ?? undefined,
        imageName: imageName ?? undefined,
      };

      const response = await fetch("/api/farm-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("farm-plan-request-failed");
      }

      const data = (await response.json()) as FarmPlanResult;
      setResult(data);
    } catch {
      setError("Could not generate a plan right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function onFileChange(event: import("react").ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : null;
      setImageDataUrl(value);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Planner Lab</p>
        <h1 className="mt-2 text-2xl font-bold text-emerald-950">AI Farm Illustration & Redesign</h1>
        <p className="mt-1 text-sm text-slate-600">Ask how to plan your farm, or upload a current farm photo and request a redesign.</p>
      </header>

      <GlassCard className="space-y-4 p-5">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          placeholder="Example: Redesign my chicken coop area with better drainage, feed storage and a vegetable strip nearby."
          className="w-full rounded-2xl border border-white/70 bg-white/60 p-4 text-sm leading-6 text-slate-800 outline-none focus:border-emerald-200"
        />

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-white/80">
          <ImagePlus className="h-4 w-4" />
          Upload current farm photo
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </label>

        {imageDataUrl ? (
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/60 p-2">
            <Image src={imageDataUrl} alt={imageName ?? "Farm photo"} width={1200} height={700} unoptimized className="w-full rounded-xl object-cover" />
          </div>
        ) : null}

        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={handleGeneratePlan}
          disabled={isLoading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-800 px-6 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
          Generate plan and illustration
        </button>
      </GlassCard>

      {result ? (
        <section className="mt-4 space-y-4">
          <GlassCard className="p-5">
            <h2 className="text-lg font-bold text-emerald-950">{result.planTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{result.summary}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Weekly Actions</p>
            <div className="mt-2 space-y-1">
              {result.weeklyActions.map((step) => (
                <p key={step} className="text-sm text-slate-700">• {step}</p>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Budget Graph</p>
            <div className="mt-3 space-y-2">
              {budgetEntries.map((entry) => (
                <div key={entry.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{entry.label}</span>
                    <span>{entry.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-emerald-100">
                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.max(8, entry.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">AI Illustration</p>
            <p className="mt-1 text-xs text-slate-500">
              {result.fallbackUsed
                ? "Generated with backup image rendering pipeline."
                : "Generated from OpenRouter image model output."}
            </p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/70 bg-white/60 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.illustrationUrl} alt="AI farm layout illustration" className="w-full rounded-xl object-cover" />
            </div>
          </GlassCard>
        </section>
      ) : null}

      <NavBar activeTab="planner" />
    </main>
  );
}
