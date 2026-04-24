import Link from "next/link";
import { Activity, Home, Leaf, Settings } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "#", label: "Farm", icon: Leaf },
  { href: "#", label: "Settings", icon: Settings },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-6xl rounded-t-3xl border border-white/60 bg-white/40 px-3 pb-6 pt-3 backdrop-blur-2xl">
      <ul className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white/60"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
