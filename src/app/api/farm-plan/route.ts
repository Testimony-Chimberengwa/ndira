import { NextRequest, NextResponse } from "next/server";
import type { FarmPlanResult } from "@/lib/types";
import { runOpenRouterText, safeJsonParse } from "@/lib/openrouter-generic";

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "google/gemma-4-31b-it:free";
const OPENROUTER_MODEL_FALLBACK = process.env.OPENROUTER_PLANNER_MODEL ?? "qwen/qwen3.5-9b";
const OPENROUTER_IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL ?? "google/gemini-2.5-flash-image";

type FarmPlanRequest = {
  prompt: string;
  imageDataUrl?: string;
  imageName?: string;
};

function buildFallbackIllustrationUrl(prompt: string) {
  const seed = Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&seed=${seed}&nologo=true`;
}

function extractImageUrl(raw: string) {
  const match = raw.match(/https?:\/\/[^\s)]+\.(png|jpg|jpeg|webp)/i);
  return match?.[0];
}

function buildFallbackPlan(prompt: string): Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed"> {
  return {
    planTitle: "Practical Farm Layout Plan",
    summary:
      "This layout prioritizes easy movement, drainage, and production flow. Start with low-cost zoning and scale structures after the first harvest cycle.",
    layoutZones: [
      { name: "Production Core", purpose: "Main crop or coop zone near water access", areaPercent: 40 },
      { name: "Water and Drainage", purpose: "Rainwater direction, soak pit, and drainage channels", areaPercent: 20 },
      { name: "Storage and Handling", purpose: "Feed/tool storage and post-harvest handling", areaPercent: 20 },
      { name: "Expansion Strip", purpose: "Future beds, nursery, or livestock extension", areaPercent: 20 },
    ],
    budgetSplit: {
      soilAndBeds: 35,
      irrigation: 25,
      livestockOrStructures: 25,
      storageAndPaths: 15,
    },
    weeklyActions: [
      "Mark farm boundaries and map traffic paths to reduce soil compaction.",
      "Set a drainage line before expanding beds or coop floor footprint.",
      "Build one storage point first to protect feed, tools, and seed.",
      "Phase upgrades in two-week sprints and measure labor/time savings.",
    ],
    illustrationPrompt: `Top-down farm redesign concept: ${prompt}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FarmPlanRequest;

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const system =
      "You are an expert farm planner and rural infrastructure consultant. Return only JSON.";
    const user = `Create a practical farm layout plan for this request:\n${body.prompt}\n\nCurrent farm photo provided: ${body.imageDataUrl ? `Yes (${body.imageName ?? "uploaded image"})` : "No"}.\n\nReturn strict JSON with keys: planTitle, summary, layoutZones (array of {name,purpose,areaPercent}), budgetSplit ({soilAndBeds,irrigation,livestockOrStructures,storageAndPaths}), weeklyActions (array of strings), illustrationPrompt.`;

    let plan: Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed">;

    try {
      const rawPlan = await runOpenRouterText({
        model: OPENROUTER_MODEL,
        system,
        user,
        temperature: 0.35,
        maxTokens: 1400,
      });
      plan = safeJsonParse<Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed">>(rawPlan);
    } catch {
      try {
        const rawPlanFallback = await runOpenRouterText({
          model: OPENROUTER_MODEL_FALLBACK,
          system,
          user,
          temperature: 0.35,
          maxTokens: 1400,
        });
        plan = safeJsonParse<Omit<FarmPlanResult, "illustrationUrl" | "fallbackUsed">>(rawPlanFallback);
      } catch {
        plan = buildFallbackPlan(body.prompt);
      }
    }

    let illustrationUrl = buildFallbackIllustrationUrl(plan.illustrationPrompt);
    let fallbackUsed = true;

    try {
      const rawImage = await runOpenRouterText({
        model: OPENROUTER_IMAGE_MODEL,
        system: "You generate farm illustration outputs. Return an image URL if available.",
        user: `Generate one polished top-down farm concept illustration for: ${plan.illustrationPrompt}. If an image URL is available, output it directly.`,
        temperature: 0.2,
        maxTokens: 400,
      });

      const extracted = extractImageUrl(rawImage);
      if (extracted) {
        illustrationUrl = extracted;
        fallbackUsed = false;
      }
    } catch {
      fallbackUsed = true;
    }

    const payload: FarmPlanResult = {
      ...plan,
      illustrationUrl,
      fallbackUsed,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Farm plan generation failed:", error);
    return NextResponse.json({ error: "Could not generate farm plan right now." }, { status: 500 });
  }
}
