"use client";

import { Home, Leaf, Newspaper, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export type NavTab = "home" | "farm" | "news" | "planner";

type NavBarProps = {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
};

const items: Array<{ tab: NavTab; label: string; icon: typeof Home }> = [
  { tab: "home", label: "Home", icon: Home },
  { tab: "farm", label: "My Farm", icon: Leaf },
  { tab: "news", label: "News", icon: Newspaper },
  { tab: "planner", label: "Planner", icon: WandSparkles },
];

const routesByTab: Record<NavTab, string> = {
  home: "/",
  farm: "/dashboard",
  news: "/news",
  planner: "/planner",
};

export default function NavBar({ activeTab, onTabChange }: NavBarProps) {
  const router = useRouter();

  function handleTabClick(tab: NavTab) {
    onTabChange?.(tab);
    router.push(routesByTab[tab]);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/50 bg-[rgba(255,255,255,0.35)] px-4 pb-5 pt-3 shadow-[0_-12px_30px_rgba(46,125,50,0.08)] backdrop-blur-[16px]">
      <ul className="mx-auto grid max-w-6xl grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (
            <li key={item.tab}>
              <button
                type="button"
                onClick={() => handleTabClick(item.tab)}
                className={`flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-primary/15 text-primary shadow-[0_8px_20px_rgba(46,125,50,0.12)]"
                    : "text-slate-700 hover:bg-white/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
