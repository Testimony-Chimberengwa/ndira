"use client";

import { useEffect, useMemo, useState } from "react";
import { CloudRain, Thermometer } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import type { FarmLocation, WeatherIntel } from "@/lib/types";

type WeatherConsensusPanelProps = {
  location?: FarmLocation | null;
};

export default function WeatherConsensusPanel({ location }: WeatherConsensusPanelProps) {
  const [intel, setIntel] = useState<WeatherIntel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadWeatherIntel() {
      setIsLoading(true);
      try {
        const lat = location?.latitude ?? -17.8252;
        const lon = location?.longitude ?? 31.0335;
        const label = encodeURIComponent(location?.label ?? "Harare, Zimbabwe");
        const response = await fetch(`/api/weather-intel?lat=${lat}&lon=${lon}&label=${label}`);

        if (!response.ok) {
          throw new Error("weather-intel-request-failed");
        }

        const data = (await response.json()) as WeatherIntel;
        if (mounted) {
          setIntel(data);
        }
      } catch {
        if (mounted) {
          setIntel(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWeatherIntel();

    return () => {
      mounted = false;
    };
  }, [location?.label, location?.latitude, location?.longitude]);

  const maxTemp = useMemo(() => {
    if (!intel?.points.length) return 40;
    return Math.max(...intel.points.map((point) => point.highC), 40);
  }, [intel?.points]);

  if (isLoading) {
    return (
      <GlassCard className="p-5">
        <p className="text-sm font-semibold text-emerald-900">Building local weather intelligence...</p>
      </GlassCard>
    );
  }

  if (!intel || !intel.points.length) {
    return (
      <GlassCard className="p-5">
        <p className="text-sm font-semibold text-amber-800">Weather intelligence is unavailable right now.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Weather Dashboard</p>
        <p className="mt-1 text-sm font-semibold text-emerald-950">Model blend for {intel.locationLabel}</p>
        <p className="mt-1 text-xs text-slate-500">Updated {new Date(intel.updatedAt).toLocaleString()}</p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/70 bg-white/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <Thermometer className="h-4 w-4" />
            Temperature Trend
          </div>
          <div className="space-y-2">
            {intel.points.map((point) => (
              <div key={point.day} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{point.day}</span>
                  <span>{point.lowC}°C - {point.highC}°C</span>
                </div>
                <div className="h-2 rounded-full bg-emerald-100">
                  <div
                    className="h-2 rounded-full bg-emerald-600"
                    style={{ width: `${Math.max(12, Math.round((point.highC / maxTemp) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <CloudRain className="h-4 w-4" />
            Rain Risk Graph
          </div>
          <div className="grid grid-cols-5 gap-2">
            {intel.points.map((point) => (
              <div key={`rain-${point.day}`} className="flex flex-col items-center gap-1 text-[11px] text-slate-600">
                <div className="flex h-20 w-full items-end rounded-xl bg-emerald-50 p-1">
                  <div
                    className="w-full rounded-md bg-amber-400"
                    style={{ height: `${Math.max(6, point.rainChancePercent)}%` }}
                  />
                </div>
                <span>{point.day}</span>
                <span className="font-semibold text-amber-700">{point.rainChancePercent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sources</p>
        {intel.sourceNotes.map((note) => (
          <p key={note} className="text-xs text-slate-600">• {note}</p>
        ))}
      </div>
    </GlassCard>
  );
}
