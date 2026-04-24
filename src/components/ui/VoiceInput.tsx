"use client";

type VoiceInputProps = {
  onTranscript: (text: string) => void;
};

type SpeechRecognitionWindow = Window & {
  webkitSpeechRecognition?: new () => SpeechRecognition;
};

type SpeechRecognition = {
  lang: string;
  start: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
};

type SpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  function startVoiceCapture() {
    const speechWindow = window as SpeechRecognitionWindow;
    const Speech = speechWindow.webkitSpeechRecognition;

    if (!Speech) {
      return;
    }

    const recognition = new Speech();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    recognition.start();
  }

  return (
    <button
      type="button"
      onClick={startVoiceCapture}
      className="rounded-xl border border-white/60 bg-white/50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
    >
      Voice
    </button>
  );
}
