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

export interface FarmLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  label?: string;
}

export interface DiagnoseRequest {
  description: string;
  cropType?: string;
  region?: string;
  soilCondition?: string;
  location?: FarmLocation;
  imageDataUrl?: string;
  imageName?: string;
}

export interface NewsArticle {
  title: string;
  link: string;
  source: string;
  publishedAt?: string;
  summary?: string;
}

export interface WeatherPoint {
  day: string;
  highC: number;
  lowC: number;
  rainChancePercent: number;
}

export interface WeatherIntel {
  locationLabel: string;
  updatedAt: string;
  points: WeatherPoint[];
  sourceNotes: string[];
}

export interface PlannerZone {
  name: string;
  purpose: string;
  areaPercent: number;
}

export interface FarmPlanResult {
  planTitle: string;
  summary: string;
  layoutZones: PlannerZone[];
  budgetSplit: {
    soilAndBeds: number;
    irrigation: number;
    livestockOrStructures: number;
    storageAndPaths: number;
  };
  weeklyActions: string[];
  detailedCosts: {
    item: string;
    estimatedCost: string;
    description: string;
  }[];
  materialSourcing: {
    material: string;
    sourceLink: string;
    note: string;
  }[];
  illustrationPrompt: string;
  illustrationUrl: string;
  fallbackUsed: boolean;
}
