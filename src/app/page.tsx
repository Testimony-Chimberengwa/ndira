import ChatInput from "@/components/ChatInput";
import DiagnosisHero from "@/components/DiagnosisHero";
import NavBar from "@/components/ui/NavBar";
import WeatherStrip from "@/components/ui/WeatherStrip";

export default function Home() {
  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <DiagnosisHero />
      <div className="mt-6">
        <ChatInput />
      </div>
      <div className="mt-6">
        <WeatherStrip />
      </div>
      <NavBar />
    </div>
  );
}
