import { NextRequest, NextResponse } from "next/server";
import { diagnoseCrop } from "@/lib/openrouter";
import type { DiagnosisResult, DiagnoseRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DiagnoseRequest;

    if (!body?.description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const diagnosis: DiagnosisResult = await diagnoseCrop(body);
    return NextResponse.json(diagnosis, { status: 200 });
  } catch (error) {
    console.error("Diagnosis failed:", error);
    return NextResponse.json({ error: "Diagnosis failed. Please try again." }, { status: 500 });
  }
}
