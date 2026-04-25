import type { DiagnosisResult } from "@/lib/types";

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.1-8b-instruct:free";
const OPENROUTER_FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
  "qwen/qwen3.5-9b",
  "mistralai/ministral-8b-2512",
  "openrouter/auto",
];
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000";
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE ?? "Ndira";

function stripJsonCodeFences(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

async function generateWithOpenRouter(systemContext: string, prompt: string) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY environment variable.");
  }

  const modelsToTry = [OPENROUTER_MODEL, ...OPENROUTER_FALLBACK_MODELS.filter((model) => model !== OPENROUTER_MODEL)];
  const errors: string[] = [];

  for (const model of modelsToTry) {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": OPENROUTER_SITE_URL,
        "X-Title": OPENROUTER_TITLE,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemContext },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      errors.push(`${model}: ${response.status} ${errorText}`);
      continue;
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      errors.push(`${model}: empty response`);
      continue;
    }

    return content;
  }

  throw new Error(`OpenRouter could not generate a response. Tried: ${errors.join(" | ")}`);
}

export async function diagnoseCrop(input: {
  description: string;
  cropType?: string;
  region?: string;
  soilCondition?: string;
}): Promise<DiagnosisResult> {
  const systemContext =
    "You are Ndira, an expert agronomist specializing in sub-Saharan African smallholder farming. You have deep knowledge of crops grown in Zimbabwe and the surrounding region including maize, tobacco, groundnuts, sorghum, sweet potatoes, and vegetables. When given a farmer's description of their crop problem, you must respond ONLY with a valid JSON object - no markdown, no explanation, no backticks. The JSON must follow this exact structure:\n{\n  pest_or_disease: string,\n  confidence_percent: number,\n  severity: 'low' | 'medium' | 'high' | 'critical',\n  estimated_yield_loss_percent: number,\n  summary: string (2 sentences max),\n  treatment_steps: [\n    { step: number, icon: string (single emoji), title: string, description: string, urgency: 'immediate' | 'within_3_days' | 'this_week' }\n  ],\n  prevention_tip: string,\n  local_remedy: string (affordable, locally available solution)\n}";

  const prompt = `${systemContext}\n\nFarmer input:\n- Description: ${input.description}\n- Crop type: ${input.cropType ?? "Not provided"}\n- Region: ${input.region ?? "Not provided"}\n- Soil condition: ${input.soilCondition ?? "Not provided"}\n\nReturn only valid JSON.`;

  const rawText = await generateWithOpenRouter(systemContext, prompt);
  const normalizedText = stripJsonCodeFences(rawText);

  return JSON.parse(normalizedText) as DiagnosisResult;
}

export async function getDiagnosisFromOpenRouter(message: string): Promise<DiagnosisResult> {
  return diagnoseCrop({ description: message });
}