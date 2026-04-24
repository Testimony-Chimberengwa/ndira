type GaugeChartProps = {
  value: number;
};

export default function GaugeChart({ value }: GaugeChartProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const dashOffset = 339.292 - (339.292 * clamped) / 100;

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="54" stroke="rgba(0,0,0,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="#F9A825"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="339.292"
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-primary">{clamped}%</p>
        <p className="text-xs uppercase tracking-widest text-slate-600">Risk</p>
      </div>
    </div>
  );
}
