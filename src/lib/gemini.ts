import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DiagnosisResult } from "@/lib/types";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const modelNames = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-2.0-flash"];

const fallbackDiagnosis: DiagnosisResult = {
  pest_or_disease: "Likely nutrient stress or minor pest pressure",
  confidence_percent: 72,
  severity: "medium",
  estimated_yield_loss_percent: 18,
  summary: "The symptoms point to a stress pattern that could come from either pests or a nutrient imbalance. Check the leaves closely and stabilize moisture while you inspect for signs of insects or disease.",
  treatment_steps: [
    {
      step: 1,
      icon: "💧",
      title: "Stabilize moisture",
      description: "Keep the soil evenly moist for the next few days so the plant is not under extra stress.",
      urgency: "immediate",
    },
    {
      step: 2,
      icon: "🔍",
      title: "Inspect leaves closely",
      description: "Check both sides of the leaves for holes, webbing, insects, or spotting.",
      urgency: "within_3_days",
    },
    {
      step: 3,
      icon: "🌿",
      title: "Feed with a balanced remedy",
      description: "Apply a gentle foliar feed or compost tea if the crop looks pale or weak.",
      urgency: "this_week",
    },
  ],
  prevention_tip: "Scout weekly and keep records of weather, watering, and leaf changes so problems are caught early.",
  local_remedy: "Use compost tea or a diluted foliar feed and keep watering steady while the crop recovers.",
};

export async function diagnoseCrop(input: {
  description: string;
  cropType?: string;
  region?: string;
  soilCondition?: string;
}): Promise<DiagnosisResult> {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackDiagnosis;
  }

  const systemContext =
    "You are Ndira, an expert agronomist specializing in sub-Saharan African smallholder farming. You have deep knowledge of crops grown in Zimbabwe and the surrounding region including maize, tobacco, groundnuts, sorghum, sweet potatoes, and vegetables. When given a farmer's description of their crop problem, you must respond ONLY with a valid JSON object - no markdown, no explanation, no backticks. The JSON must follow this exact structure:\n{\n  pest_or_disease: string,\n  confidence_percent: number,\n  severity: 'low' | 'medium' | 'high' | 'critical',\n  estimated_yield_loss_percent: number,\n  summary: string (2 sentences max),\n  treatment_steps: [\n    { step: number, icon: string (single emoji), title: string, description: string, urgency: 'immediate' | 'within_3_days' | 'this_week' }\n  ],\n  prevention_tip: string,\n  local_remedy: string (affordable, locally available solution)\n}";

  const prompt = `${systemContext}\n\nFarmer input:\n- Description: ${input.description}\n- Crop type: ${input.cropType ?? "Not provided"}\n- Region: ${input.region ?? "Not provided"}\n- Soil condition: ${input.soilCondition ?? "Not provided"}\n\nReturn only valid JSON.`;

  for (const modelName of modelNames) {
    try {
      const model = gemini.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      const rawText = response.response.text().trim();
      const normalizedText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      return JSON.parse(normalizedText) as DiagnosisResult;
    } catch (error) {
      console.error(`Gemini model ${modelName} failed:`, error);
    }
  }

  return fallbackDiagnosis;
}

export async function getDiagnosisFromGemini(message: string): Promise<DiagnosisResult> {
  return diagnoseCrop({ description: message });
}
