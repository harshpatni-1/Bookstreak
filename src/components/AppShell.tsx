"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { ThemeToggle } from "./ThemeToggle";
import { TimerProvider } from "./TimerContext";
import { FloatingTimer } from "./FloatingTimer";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/shelf", label: "Shelf", icon: "📚" },
  { href: "/stats", label: "Stats", icon: "📈" },
];

export function AppShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <TimerProvider>
      <div className="min-h-screen md:flex relative">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 p-5 dark:border-slate-800 md:flex">
        <div className="mb-8 flex items-center gap-2 text-xl font-bold">
          <span>📖</span> BookStreak
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 dark:border dark:border-brand-500/30"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 pt-6">
          <ThemeToggle />
          <Link
            href="/settings"
            className="block truncate px-1 text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-300"
          >
            Signed in as {displayName} · Edit
          </Link>
          <form action={signOut}>
            <button className="w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden">
        <span className="text-lg font-bold">📖 BookStreak</span>
        <ThemeToggle compact />
      </header>

      <main className="flex-1 pb-24 md:pb-0">
        <div className="mx-auto max-w-4xl p-4 md:p-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:hidden">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                active ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <FloatingTimer />
    </div>
    </TimerProvider>
  );
}
