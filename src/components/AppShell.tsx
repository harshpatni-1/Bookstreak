"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";
import { ThemeToggle } from "./ThemeToggle";
import { TimerProvider } from "./TimerContext";
import { FloatingTimer } from "./FloatingTimer";
import { HomeIcon, ShelfIcon, StatsIcon, SettingsIcon } from "./icons";

/**
 * Navigation. Real SVG icons rather than emoji — a screen reader announces
 * "house building" for 🏠, and emoji ignore currentColor so they can't respond
 * to high-contrast mode. Settings is included here because it was previously
 * reachable only from a small text link in the desktop sidebar.
 */
const NAV = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/shelf", label: "Shelf", Icon: ShelfIcon },
  { href: "/stats", label: "Stats", Icon: StatsIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export function AppShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Exact-or-subpath match, so /settings/billing still lights up Settings but
  // /dashboard never matches on a bare prefix collision.
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <TimerProvider>
      {/* First focusable element on the page — invisible until focused. */}
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <div className="relative min-h-screen md:flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-surface p-5 md:flex">
          <div className="mb-8 flex items-center gap-2 text-xl font-bold text-fg">
            <span aria-hidden="true">📖</span> BookStreak
          </div>

          <nav aria-label="Main" className="space-y-1">
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`tap flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-fg-muted hover:bg-surface-2 hover:text-fg"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            <ThemeToggle />
            <p className="truncate px-1 text-xs text-fg-subtle">
              Signed in as {displayName}
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="tap w-full rounded-xl border-2 border-hairline py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-3 md:hidden">
          <span className="text-lg font-bold text-fg">
            <span aria-hidden="true">📖</span> BookStreak
          </span>
          <ThemeToggle compact />
        </header>

        <main id="main" tabIndex={-1} className="flex-1 pb-24 outline-none md:pb-0">
          <div className="mx-auto max-w-4xl p-4 md:p-8">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-hairline bg-surface md:hidden"
        >
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`tap relative flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  active ? "text-accent" : "text-fg-subtle"
                }`}
              >
                {/* Active indicator sits on the top edge so the label stays put. */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-accent"
                  />
                )}
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <FloatingTimer />
      </div>
    </TimerProvider>
  );
}
