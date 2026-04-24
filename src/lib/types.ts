export type DiagnoseRequest = {
  message: string;
};

export type TreatmentStep = {
  title: string;
  details: string;
};

export type DiagnoseResponse = {
  diagnosis: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  treatment: TreatmentStep[];
};
