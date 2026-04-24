import { CheckCircle2 } from "lucide-react";

type TreatmentCardProps = {
  index: number;
  title: string;
  details: string;
};

export default function TreatmentCard({ index, title, details }: TreatmentCardProps) {
  return (
    <div className="glass-card min-w-[220px] rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-xl bg-primary px-3 py-1 text-sm font-bold text-white">{index}</span>
        <CheckCircle2 className="h-5 w-5 text-primary" />
      </div>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-700">{details}</p>
    </div>
  );
}
