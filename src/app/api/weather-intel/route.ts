import { NextRequest, NextResponse } from "next/server";
import type { WeatherIntel, WeatherPoint } from "@/lib/types";

type OpenMeteoResponse = {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
  };
};

type WttrResponse = {
  weather?: Array<{
    date?: string;
    maxtempC?: string;
    mintempC?: string;
    hourly?: Array<{ chanceofrain?: string }>;
  }>;
};

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDayLabel(dateText?: string) {
  if (!dateText) return "Day";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export async function GET(request: NextRequest) {
  try {
    const lat = asNumber(request.nextUrl.searchParams.get("lat"), -17.8252);
    const lon = asNumber(request.nextUrl.searchParams.get("lon"), 31.0335);
    const label = request.nextUrl.searchParams.get("label") ?? "Harare, Zimbabwe";

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=auto`;
    const wttrUrl = `https://wttr.in/${lat},${lon}?format=j1`;

    const [openMeteoRes, wttrRes] = await Promise.all([
      fetch(openMeteoUrl, { cache: "no-store" }),
      fetch(wttrUrl, { cache: "no-store" }),
    ]);

    const openMeteoData = openMeteoRes.ok ? ((await openMeteoRes.json()) as OpenMeteoResponse) : ({} as OpenMeteoResponse);
    const wttrData = wttrRes.ok ? ((await wttrRes.json()) as WttrResponse) : ({} as WttrResponse);

    const points: WeatherPoint[] = [];

    for (let i = 0; i < 5; i += 1) {
      const omHigh = openMeteoData.daily?.temperature_2m_max?.[i];
      const omLow = openMeteoData.daily?.temperature_2m_min?.[i];
      const omRain = openMeteoData.daily?.precipitation_probability_max?.[i];

      const wttrDay = wttrData.weather?.[i];
      const wttrHigh = wttrDay?.maxtempC ? Number(wttrDay.maxtempC) : undefined;
      const wttrLow = wttrDay?.mintempC ? Number(wttrDay.mintempC) : undefined;
      const wttrRain = wttrDay?.hourly?.length
        ? Math.max(...wttrDay.hourly.map((hour) => Number(hour.chanceofrain ?? "0")))
        : undefined;

      const highs = [omHigh, wttrHigh].filter((v): v is number => typeof v === "number");
      const lows = [omLow, wttrLow].filter((v): v is number => typeof v === "number");
      const rains = [omRain, wttrRain].filter((v): v is number => typeof v === "number");

      points.push({
        day: normalizeDayLabel(openMeteoData.daily?.time?.[i] ?? wttrDay?.date),
        highC: highs.length ? Math.round(highs.reduce((sum, val) => sum + val, 0) / highs.length) : 0,
        lowC: lows.length ? Math.round(lows.reduce((sum, val) => sum + val, 0) / lows.length) : 0,
        rainChancePercent: rains.length ? Math.round(rains.reduce((sum, val) => sum + val, 0) / rains.length) : 0,
      });
    }

    const payload: WeatherIntel = {
      locationLabel: label,
      updatedAt: new Date().toISOString(),
      points,
      sourceNotes: [
        "Open-Meteo daily model guidance",
        "wttr.in aggregated model blend",
      ],
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Could not load weather intelligence right now." }, { status: 500 });
  }
}
