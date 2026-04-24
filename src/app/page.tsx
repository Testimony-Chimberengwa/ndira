"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { motion } from "framer-motion";
import ChatInput from "@/components/ChatInput";
import GlassCard from "@/components/ui/GlassCard";
import NavBar, { type NavTab } from "@/components/ui/NavBar";
import type { DiagnosisResult } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(description: string) {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post<DiagnosisResult>("/api/diagnose", { description });
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ndira_last_diagnosis", JSON.stringify(data));
      }
      router.push("/dashboard");
    } catch {
      setError("Diagnosis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 pb-28 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute left-[-5%] top-16 h-72 w-72 rounded-full bg-emerald-300/35 blur-3xl"
          animate={{ x: [0, 18, 0], y: [0, 12, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-[-8%] top-28 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl"
          animate={{ x: [0, -16, 0], y: [0, 14, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl"
          animate={{ x: [0, 10, 0], y: [0, -12, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-start pt-6">
        <header className="flex flex-col items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-primary shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-[32px] font-bold leading-none text-primary">Ndira</h1>
          <p className="mt-2 text-sm text-slate-600">Your AI farming assistant</p>
        </header>

        <section className="mt-8 w-full">
          <GlassCard className="relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
            {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}
            <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
          </GlassCard>
        </section>

        <p className="mt-4 text-center text-sm text-slate-500">Trusted by farmers across Zimbabwe 🌱</p>
      </div>

      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
