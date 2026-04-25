"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowUp, Camera, Loader2, MapPin, Mic, RotateCcw, Trash2 } from "lucide-react";
import type { FarmLocation } from "@/lib/types";
import { formatFarmLocation, reverseGeocodeFarmLocation } from "@/lib/location";

type DiagnosisSubmission = {
  description: string;
  location?: FarmLocation | null;
  imageDataUrl?: string;
  imageName?: string;
};

type ChatInputProps = {
  onSubmit: (payload: DiagnosisSubmission) => void;
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

type BrowserWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const MAX_IMAGE_SIZE_MB = 6;

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
  const [farmLocation, setFarmLocation] = useState<FarmLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState("Detecting your farm location...");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const speechRecognition = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const speechWindow = window as BrowserWithSpeechRecognition;
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

  useEffect(() => {
    async function detectLocation() {
      if (!navigator.geolocation) {
        setLocationStatus("Location sharing is not supported. Using Harare by default.");
        return;
      }

      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const resolvedLocation = await reverseGeocodeFarmLocation(position.coords.latitude, position.coords.longitude);
            setFarmLocation(resolvedLocation);
            setLocationStatus(
              resolvedLocation ? `Using ${formatFarmLocation(resolvedLocation)}` : "Using your farm location"
            );
          } catch {
            setFarmLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              label: "Your farm",
            });
            setLocationStatus("Using your live farm location");
          } finally {
            setIsDetectingLocation(false);
          }
        },
        () => {
          setFarmLocation(null);
          setLocationStatus("Location not shared. Using Harare, Zimbabwe.");
          setIsDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }

    void detectLocation();
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

  function triggerImagePicker() {
    fileInputRef.current?.click();
  }

  function handleImageChange(event: import("react").ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      showToast(`Image is too large. Please upload a file under ${MAX_IMAGE_SIZE_MB}MB.`);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;

      if (result) {
        setImageDataUrl(result);
        setImageName(file.name);
        clearErrors("description");
      }
    };

    reader.onerror = () => {
      showToast("Could not read the selected image.");
    };

    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageDataUrl(null);
    setImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function retryLocationDetection() {
    if (!navigator.geolocation) {
      setFarmLocation(null);
      setLocationStatus("Location sharing is not supported. Using Harare, Zimbabwe.");
      setIsDetectingLocation(false);
      return;
    }

    setLocationStatus("Detecting your farm location...");
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const resolvedLocation = await reverseGeocodeFarmLocation(position.coords.latitude, position.coords.longitude);
          setFarmLocation(resolvedLocation);
          setLocationStatus(resolvedLocation ? `Using ${formatFarmLocation(resolvedLocation)}` : "Using your farm location");
        } catch {
          setFarmLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            label: "Your farm",
          });
          setLocationStatus("Using your live farm location");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setFarmLocation(null);
        setLocationStatus("Location not shared. Using Harare, Zimbabwe.");
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  function handleFormSubmit(values: FormValues) {
    const description = values.description.trim();
    if (description.length < 10 && !imageDataUrl) {
      setError("description", {
        type: "minLength",
        message: "Please describe the problem or add a crop image",
      });
      return;
    }

    onSubmit({
      description,
      location: farmLocation,
      imageDataUrl: imageDataUrl ?? undefined,
      imageName: imageName ?? undefined,
    });
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
            {...register("description")}
          />
          {errors.description ? (
            <p className="mt-2 text-sm font-medium text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {["Yellow maize leaves", "Holes in my tobacco", "Soil dry, plants wilting"].map((chip) => (
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

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startSpeechRecognition}
            aria-pressed={isListening}
            className="relative flex h-12 items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 text-emerald-900 transition hover:bg-white/75"
          >
            {isListening ? <span className="absolute h-4 w-4 animate-ping rounded-full bg-red-500/70" /> : null}
            {isListening ? <span className="absolute h-2.5 w-2.5 rounded-full bg-red-600" /> : null}
            <Mic className="relative h-5 w-5" />
            <span className="text-sm font-semibold">Voice</span>
          </button>

          <button
            type="button"
            onClick={triggerImagePicker}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 text-sm font-semibold text-emerald-900 transition hover:bg-white/75"
          >
            <Camera className="h-5 w-5" />
            Add photo
          </button>

          <button
            type="button"
            onClick={retryLocationDetection}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 text-sm font-semibold text-emerald-900 transition hover:bg-white/75"
          >
            <RotateCcw className="h-5 w-5" />
            {isDetectingLocation ? "Finding location..." : "Refresh location"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-2">
            <MapPin className="h-4 w-4 text-emerald-700" />
            {locationStatus}
          </span>
          {imageName ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-emerald-900">
              Photo attached: {imageName}
              <button type="button" onClick={clearImage} className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </span>
          ) : null}
        </div>

        {imageDataUrl ? (
          <div className="overflow-hidden rounded-[20px] border border-white/70 bg-white/50 p-2">
            <Image
              src={imageDataUrl}
              alt={imageName ?? "Selected crop"}
              width={1200}
              height={800}
              unoptimized
              className="max-h-56 w-full rounded-[16px] object-cover"
            />
          </div>
        ) : null}

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-xs font-medium text-slate-500">
            {imageDataUrl ? "Image and location will be sent with your diagnosis." : "Add a photo for better visual diagnosis."}
          </div>

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