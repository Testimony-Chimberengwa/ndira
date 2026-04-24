export interface DiagnosisResult {
  pest_or_disease: string;
  confidence_percent: number;
  severity: "low" | "medium" | "high" | "critical";
  estimated_yield_loss_percent: number;
  summary: string;
  treatment_steps: {
    step: number;
    icon: string;
    title: string;
    description: string;
    urgency: "immediate" | "within_3_days" | "this_week";
  }[];
  prevention_tip: string;
  local_remedy: string;
}
