import { NextResponse } from "next/server";
import { getDiagnosisFromGemini } from "@/lib/gemini";
import type { DiagnoseRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DiagnoseRequest;

    if (!body?.message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const response = await getDiagnosisFromGemini(body.message);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Unable to process diagnosis." }, { status: 500 });
  }
}
