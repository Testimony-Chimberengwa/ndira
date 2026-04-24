import GlassCard from "@/components/ui/GlassCard";

type TreatmentCardProps = {
  step: number;
  icon: string;
  title: string;
  description: string;
  urgency: "immediate" | "within_3_days" | "this_week";
};

const urgencyStyles: Record<TreatmentCardProps["urgency"], string> = {
  immediate: "bg-red-100 text-red-700",
  within_3_days: "bg-amber-100 text-amber-800",
  this_week: "bg-emerald-100 text-emerald-800",
};

const urgencyLabels: Record<TreatmentCardProps["urgency"], string> = {
  immediate: "Immediate",
  within_3_days: "Within 3 days",
  this_week: "This week",
};

export default function TreatmentCard({ step, icon, title, description, urgency }: TreatmentCardProps) {
  return (
    <GlassCard className="min-w-[220px] p-5">
      <div className="flex items-start justify-between">
        <span className="text-2xl leading-none">{icon}</span>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          Step {step}
        </span>
      </div>

      <h4 className="mt-4 text-base font-bold text-emerald-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${urgencyStyles[urgency]}`}>
          {urgencyLabels[urgency]}
        </span>
      </div>
    </GlassCard>
  );
}
