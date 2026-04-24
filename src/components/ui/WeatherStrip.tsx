import { CloudSun, Droplets, ThermometerSun } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function WeatherStrip() {
  return (
    <GlassCard className="flex items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-2 text-slate-800">
        <CloudSun className="h-5 w-5 text-amber" />
        <span className="text-sm font-semibold">Harare</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700">
        <ThermometerSun className="h-5 w-5 text-primary" />
        <span className="text-sm">28 deg C</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700">
        <Droplets className="h-5 w-5 text-sky-600" />
        <span className="text-sm">Humidity 42%</span>
      </div>
    </GlassCard>
  );
}
