"use client";

import { useRef, useState } from "react";

type Props = {
  displayName: string;
  current: number;
  longest: number;
  finished: number;
  pages: number;
  /** map of YYYY-MM-DD -> session count, recent weeks */
  counts: Record<string, number>;
  year: number;
};

const W = 1080;
const H = 1080;

/**
 * Renders a shareable square image of the reader's year — streak, books, pages,
 * and a contribution heatmap — entirely on a <canvas> (no dependencies). This is
 * the growth loop: a spreadsheet can't make something people want to post.
 */
function draw(canvas: HTMLCanvasElement, p: Props) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background gradient (brand).
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#205fe0");
  g.addColorStop(1, "#1c3a76");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 36px system-ui, -apple-system, sans-serif";
  ctx.fillText("📖 BookStreak", 80, 130);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 52px system-ui, sans-serif";
  ctx.fillText(`${p.displayName}'s ${p.year}`, 80, 210);

  // Big streak number.
  ctx.font = "800 240px system-ui, sans-serif";
  ctx.fillText(`${p.current}`, 76, 470);
  ctx.font = "600 48px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("day streak 🔥", 80, 530);

  // Secondary stats row.
  const stats: [string, string][] = [
    [`${p.finished}`, "books finished"],
    [`${p.pages.toLocaleString()}`, "pages read"],
    [`${p.longest}`, "longest streak"],
  ];
  let x = 80;
  for (const [val, label] of stats) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 64px system-ui, sans-serif";
    ctx.fillText(val, x, 660);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "400 30px system-ui, sans-serif";
    ctx.fillText(label, x, 705);
    x += 330;
  }

  // Heatmap grid (17 weeks x 7 days), most recent on the right.
  const weeks = 17;
  const cell = 44;
  const gap = 8;
  const gridW = weeks * (cell + gap) - gap;
  const startX = (W - gridW) / 2;
  const startY = 800;

  const today = new Date();
  const shades = ["rgba(255,255,255,0.15)", "#bcd9ff", "#599cff", "#ffffff"];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const daysBack = (weeks - 1 - w) * 7 + (6 - d);
      const dt = new Date(today);
      dt.setDate(dt.getDate() - daysBack);
      const key = dt.toISOString().slice(0, 10);
      const c = p.counts[key] ?? 0;
      const shade = c === 0 ? shades[0] : c === 1 ? shades[1] : c === 2 ? shades[2] : shades[3];
      ctx.fillStyle = shade;
      const rx = startX + w * (cell + gap);
      const ry = startY + d * (cell + gap);
      ctx.beginPath();
      ctx.roundRect(rx, ry, cell, cell, 8);
      ctx.fill();
    }
  }

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "400 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Honest reading streaks · bookstreak.app", W / 2, 1030);
  ctx.textAlign = "left";
}

export function ShareStreakCard(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function render() {
    const c = canvasRef.current;
    if (c) draw(c, props);
  }

  function openModal() {
    setOpen(true);
    // draw after the canvas mounts
    requestAnimationFrame(render);
  }

  async function toBlob(): Promise<Blob | null> {
    const c = canvasRef.current;
    if (!c) return null;
    return new Promise((resolve) => c.toBlob((b) => resolve(b), "image/png"));
  }

  async function share() {
    setStatus(null);
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], "bookstreak.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "My reading streak",
          text: `I'm on a ${props.current}-day reading streak on BookStreak 🔥`,
        });
        return;
      } catch {
        /* user cancelled — fall through to download */
      }
    }
    download(blob);
  }

  function download(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookstreak-${props.year}.png`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Saved to your device ✓");
  }

  async function downloadClick() {
    const blob = await toBlob();
    if (blob) download(blob);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        📤 Share my year
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Share your reading year"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-bold">Share your year</h2>
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="aspect-square w-full rounded-xl"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={share}
                className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Share
              </button>
              <button
                onClick={downloadClick}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium dark:border-slate-700"
              >
                Download
              </button>
            </div>
            {status && <p className="mt-3 text-center text-xs text-slate-500">{status}</p>}
          </div>
        </div>
      )}
    </>
  );
}
