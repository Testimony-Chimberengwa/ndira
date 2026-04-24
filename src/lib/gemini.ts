import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DiagnosisResult } from "@/lib/types";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const modelNames = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-2.0-flash"];

export async function diagnoseCrop(input: {
  description: string;
  cropType?: string;
  region?: string;
  soilCondition?: string;
}): Promise<DiagnosisResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
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
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("404") && !message.includes("not found")) {
        throw error;
      }
    }
  }

  throw new Error("Unable to generate diagnosis with the available Gemini models.");
}

export async function getDiagnosisFromGemini(message: string): Promise<DiagnosisResult> {
  return diagnoseCrop({ description: message });
}
