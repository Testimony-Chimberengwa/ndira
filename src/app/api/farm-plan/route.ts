import { NextRequest, NextResponse } from "next/server";
import type { FarmPlanResult } from "@/lib/types";
import { runOpenRouterText, runOpenRouterVision, safeJsonParse } from "@/lib/openrouter-generic";

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-lite-preview-02-05:free";
const OPENROUTER_VISION_MODEL = process.env.OPENROUTER_VISION_MODEL ?? "google/gemini-2.0-flash-lite-preview-02-05:free";
const OPENROUTER_FB1 = process.env.OPENROUTER_PLANNER_MODEL ?? "google/gemma-4-31b-it:free";
const OPENROUTER_FB2 = process.env.OPENROUTER_FALLBACK_MODEL_2 ?? "meta-llama/llama-3.2-3b-instruct:free";

type FarmPlanRequest = {
  prompt: string;
  imageDataUrl?: string;
  imageName?: string;
};

function buildIllustrationUrl(prompt: string) {
  const seed = Math.floor(Math.random() * 999999);
  const cleanPrompt = prompt.replace(/[^\w\s,.-]/gi, "").slice(0, 300);
  const enhancedPrompt = `Detailed 3D isometric farm layout, professional agriculture design: ${cleanPrompt}`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=768&seed=${seed}&nologo=true`;
}

function buildFallbackPlan(prompt: string): Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed"> {
  return {
    planTitle: `Baseline Plan: ${prompt.slice(0, 40)}`,
    summary:
      "All available AI models are currently at their free usage limit. This is a generic baseline. Please try again in 10-15 minutes for a full AI-generated redesign.",
    layoutZones: [
      { name: "Primary Production", purpose: "Main activity area", areaPercent: 50 },
      { name: "Infrastructure", purpose: "Storage and access", areaPercent: 30 },
      { name: "Buffer Zone", purpose: "Drainage and expansion", areaPercent: 20 },
    ],
    budgetSplit: {
      soilAndBeds: 40,
      irrigation: 30,
      livestockOrStructures: 20,
      storageAndPaths: 10,
    },
    weeklyActions: [
      "Assess the land and mark boundaries.",
      "Identify water sources and drainage paths.",
      "Clear the primary production zone.",
    ],
    detailedCosts: [
      { item: "Initial Setup", estimatedCost: "Check local prices", description: "Basic materials for start" },
    ],
    materialSourcing: [
      { material: "Local Supplies", sourceLink: `https://www.google.com/search?q=farm+supplies+near+me`, note: "Search for local suppliers" },
    ],
    illustrationPrompt: `Generic farm layout: ${prompt}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FarmPlanRequest;

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const system =
      "You are an expert farm planner. Return only strict JSON. Analyze any provided image for specific farm details.";
    const userPrompt = `Request: ${body.prompt}\n\nReturn JSON with keys: planTitle, summary, layoutZones (array of {name,purpose,areaPercent}), budgetSplit ({soilAndBeds,irrigation,livestockOrStructures,storageAndPaths}), weeklyActions (array of strings), detailedCosts (array of {item,estimatedCost,description}), materialSourcing (array of {material,sourceLink,note}), illustrationPrompt.`;

    let plan: Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed"> | null = null;
    let fallbackUsed = false;

    // Try primary vision/text
    try {
      let raw: string;
      if (body.imageDataUrl) {
        raw = await runOpenRouterVision({ model: OPENROUTER_VISION_MODEL, system, user: userPrompt, imageDataUrl: body.imageDataUrl, temperature: 0.35, maxTokens: 2500 });
      } else {
        raw = await runOpenRouterText({ model: OPENROUTER_MODEL, system, user: userPrompt, temperature: 0.35, maxTokens: 2500 });
      }
      plan = safeJsonParse<Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed">>(raw);
    } catch (e1) {
      console.warn("Primary AI failed, trying FB1:", e1);
      // Try FB1 (Gemma 4)
      try {
        const raw = await runOpenRouterText({ model: OPENROUTER_FB1, system, user: userPrompt, temperature: 0.3, maxTokens: 2500 });
        plan = safeJsonParse<Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed">>(raw);
      } catch (e2) {
        console.warn("FB1 failed, trying FB2:", e2);
        // Try FB2 (Llama 3.2)
        try {
          const raw = await runOpenRouterText({ model: OPENROUTER_FB2, system, user: userPrompt, temperature: 0.3, maxTokens: 2500 });
          plan = safeJsonParse<Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed">>(raw);
        } catch (e3) {
          console.error("All AI fallbacks failed:", e3);
          plan = buildFallbackPlan(body.prompt);
          fallbackUsed = true;
        }
      }
    }

    if (!plan) plan = buildFallbackPlan(body.prompt);

    const illustrationUrl = buildIllustrationUrl(plan.illustrationPrompt);
    return NextResponse.json({ ...plan, illustrationUrl, fallbackUsed });
  } catch (error) {
    console.error("Critical error in farm-plan route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
