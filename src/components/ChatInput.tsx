"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowUp, Loader2, Mic } from "lucide-react";

type ChatInputProps = {
  onSubmit: (description: string) => void;
  isLoading: boolean;
};

type FormValues = {
  description: string;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export default function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { description: "" } });
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const speechRecognition = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      recognitionRef.current?.stop();
    };
  }, []);

  function showToast(message: string) {
    setToast(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2800);
  }

  function startSpeechRecognition() {
    if (!speechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      showToast("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new speechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";

      if (transcript) {
        setValue("description", transcript, { shouldValidate: true, shouldDirty: true });
        clearErrors("description");
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast("Could not capture voice input. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  function handleChipClick(text: string) {
    setValue("description", text, { shouldValidate: true, shouldDirty: true });
    clearErrors("description");
  }

  function handleFormSubmit(values: FormValues) {
    if (values.description.trim().length < 10) {
      setError("description", {
        type: "minLength",
        message: "Please describe the problem in more detail",
      });
      return;
    }

    onSubmit(values.description.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {toast ? (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 shadow-lg">
          {toast}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <textarea
            rows={3}
            placeholder="Describe what you see on your crops — leaves, soil, colour, insects…"
            className="min-h-[150px] w-full resize-none rounded-[24px] border border-white/60 bg-[rgba(255,255,255,0.45)] p-5 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-500 focus:border-emerald-200 focus:ring-2 focus:ring-primary/20"
            {...register("description", {
              required: "Please describe the problem in more detail",
              minLength: {
                value: 10,
                message: "Please describe the problem in more detail",
              },
            })}
          />
          {errors.description ? (
            <p className="mt-2 text-sm font-medium text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "Yellow maize leaves",
            "Holes in my tobacco",
            "Soil dry, plants wilting",
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="rounded-full border border-white/70 bg-white/50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-white/75"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={startSpeechRecognition}
            aria-pressed={isListening}
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/50 text-emerald-900 transition hover:bg-white/75"
          >
            {isListening ? <span className="absolute h-4 w-4 animate-ping rounded-full bg-red-500/70" /> : null}
            {isListening ? <span className="absolute h-2.5 w-2.5 rounded-full bg-red-600" /> : null}
            <Mic className="relative h-5 w-5" />
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 text-white shadow-[0_10px_20px_rgba(22,101,52,0.25)] transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
