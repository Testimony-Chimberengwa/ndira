"use client";

import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudSun, SunMedium } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

type WeatherStripProps = {
  city: string;
  temp: number;
  condition: string;
  riskNote: string;
  lat?: number;
  lon?: number;
};

type OpenMeteoResponse = {
  current_weather?: {
    temperature: number;
    weathercode: number;
  };
};

const DEFAULT_LAT = -17.8252;
const DEFAULT_LON = 31.0335;

function getConditionFromCode(code: number) {
  if (code === 0) return "Sunny";
  if (code === 1 || code === 2) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Drizzly";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Rainy";
  if (code >= 95) return "Stormy";
  return "Mild";
}

function getRiskNote(condition: string, temp: number) {
  if (condition === "Rainy" || condition === "Stormy") {
    return "Field access may be limited";
  }

  if (temp >= 30) {
    return "Heat stress risk is rising";
  }

  if (condition === "Foggy") {
    return "Watch for fungal pressure";
  }

  return "Good conditions for monitoring";
}

function getWeatherIcon(condition: string) {
  if (condition === "Sunny" || condition === "Partly cloudy" || condition === "Mild") {
    return SunMedium;
  }

  if (condition === "Cloudy") {
    return CloudSun;
  }

  return Cloud;
}

export default function WeatherStrip({
  city,
  temp,
  condition,
  riskNote,
  lat = DEFAULT_LAT,
  lon = DEFAULT_LON,
}: WeatherStripProps) {
  const [weather, setWeather] = useState({ temp, condition, riskNote });

  useEffect(() => {
    let isMounted = true;

    async function loadWeather() {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = (await response.json()) as OpenMeteoResponse;
        const current = data.current_weather;

        if (!current || !isMounted) {
          return;
        }

        const nextCondition = getConditionFromCode(current.weathercode);
        setWeather({
          temp: Math.round(current.temperature),
          condition: nextCondition,
          riskNote: getRiskNote(nextCondition, current.temperature),
        });
      } catch {
        if (isMounted) {
          setWeather({ temp, condition, riskNote });
        }
      }
    }

    loadWeather();

    return () => {
      isMounted = false;
    };
  }, [condition, lat, lon, riskNote, temp]);

  const Icon = useMemo(() => getWeatherIcon(weather.condition), [weather.condition]);

  return (
    <GlassCard className="flex items-center gap-4 px-4 py-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-emerald-950">{city}</p>
        <p className="text-sm text-slate-600">
          {weather.temp}°C <span className="mx-1 text-slate-400">•</span> {weather.condition}
        </p>
      </div>

      <p className="max-w-[10rem] text-right text-xs font-semibold leading-5 text-amber-700">
        {weather.riskNote}
      </p>
    </GlassCard>
  );
}
