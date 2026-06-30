import type { ReactNode } from "react";

export type Trend = {
  /** signed percentage, e.g. +18 or -12; null = no comparison available */
  pct: number | null;
  label: string; // e.g. "vs last week"
};

/**
 * One consistent stat surface used across the app (dashboard, stats). Every
 * card reads the same way: big value, a label, optional sublabel, optional
 * momentum trend. Borrowed from TrustMRR's "same three metrics on every card"
 * discipline — consistency is what makes a dense screen feel calm.
 */
export function StatCard({
  label,
  value,
  sublabel,
  trend,
  icon,
}: {
  label: string;
  value: ReactNode;
  sublabel?: string;
  trend?: Trend;
  icon?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/80 dark:border dark:border-slate-700/50">
      <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-400 dark:text-slate-300">{sublabel}</p>}
      {trend && trend.pct !== null && (
        <p
          className={`mt-2 text-xs font-medium ${
            trend.pct > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : trend.pct < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-400"
          }`}
        >
          {trend.pct > 0 ? "📈 +" : trend.pct < 0 ? "📉 " : ""}
          {trend.pct}% {trend.label}
        </p>
      )}
    </div>
  );
}
