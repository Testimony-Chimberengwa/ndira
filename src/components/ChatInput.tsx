"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import VoiceInput from "@/components/ui/VoiceInput";
import GlassCard from "@/components/ui/GlassCard";
import type { DiagnoseRequest, DiagnoseResponse } from "@/lib/types";

type FormData = {
  message: string;
};

export default function ChatInput() {
  const { register, handleSubmit, setValue, reset } = useForm<FormData>();
  const [result, setResult] = useState<DiagnoseResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      const { data } = await axios.post<DiagnoseResponse, { data: DiagnoseResponse }, DiagnoseRequest>(
        "/api/diagnose",
        { message: values.message }
      );
      setResult(data);
      reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label htmlFor="message" className="block text-lg font-bold text-slate-900">
          What is happening in your field?
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Example: My maize leaves are yellow and I see tiny webbing below the leaves."
          className="w-full rounded-2xl border border-white/70 bg-white/60 p-4 text-sm outline-none ring-primary/40 placeholder:text-slate-500 focus:ring"
          {...register("message", { required: true })}
        />

        <div className="flex items-center justify-between gap-3">
          <VoiceInput onTranscript={(text) => setValue("message", text)} />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Diagnosing..." : "Diagnose"}
          </button>
        </div>
      </form>

      {result ? (
        <div className="mt-6 rounded-2xl border border-white/70 bg-white/50 p-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">AI Assessment</p>
          <p className="mt-2 text-slate-800">{result.diagnosis}</p>
        </div>
      ) : null}
    </GlassCard>
  );
}
