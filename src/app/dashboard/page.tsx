import GaugeChart from "@/components/ui/GaugeChart";
import NavBar from "@/components/ui/NavBar";
import TreatmentCard from "@/components/ui/TreatmentCard";
import WeatherStrip from "@/components/ui/WeatherStrip";
import GlassCard from "@/components/ui/GlassCard";

const treatment = [
  { title: "Increase irrigation", details: "Keep root moisture steady for 5 days." },
  { title: "Use neem spray", details: "Apply in the early morning every 3 days." },
  { title: "Isolate affected rows", details: "Prevent spread while monitoring new leaves." },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <WeatherStrip />
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Latest Diagnosis</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Spider mites + drought stress</h1>
          <p className="mt-3 text-slate-700">
            Estimated impact remains moderate if treatment starts in the next 48 hours.
          </p>
        </GlassCard>
        <GlassCard className="flex items-center justify-center">
          <GaugeChart value={35} />
        </GlassCard>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900">Treatment Plan</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
          {treatment.map((step, index) => (
            <TreatmentCard key={step.title} index={index + 1} title={step.title} details={step.details} />
          ))}
        </div>
      </section>

      <NavBar />
    </div>
  );
}
