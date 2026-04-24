import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DiagnoseResponse } from "@/lib/types";

const apiKey = process.env.GEMINI_API_KEY;

const model = apiKey
  ? new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-1.5-flash" })
  : null;

const fallbackDiagnosis: DiagnoseResponse = {
  diagnosis: "Potential nutrient deficiency with mild pest pressure.",
  confidence: 78,
  riskLevel: "medium",
  treatment: [
    { title: "Inspect leaf undersides", details: "Check for mites or aphids before spraying." },
    { title: "Adjust irrigation", details: "Keep soil evenly moist for 3 to 5 days." },
    { title: "Apply balanced foliar feed", details: "Use a low-dose micronutrient spray in the evening." },
  ],
};

export async function getDiagnosisFromGemini(message: string): Promise<DiagnoseResponse> {
  if (!model) {
    return fallbackDiagnosis;
  }

  const prompt = `You are an agronomy assistant. Return strict JSON with keys diagnosis, confidence (0-100), riskLevel (low|medium|high), treatment (array of 3 steps with title and details). Farmer message: ${message}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const parsed = JSON.parse(text) as DiagnoseResponse;
    return parsed;
  } catch {
    return fallbackDiagnosis;
  }
}
