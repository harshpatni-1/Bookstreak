// Tiny dependency-free confetti burst for milestone celebrations.
export function burstConfetti() {
  if (typeof document === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#3478f6", "#f59e0b", "#10b981", "#ef4444", "#a855f7"];
  const root = document.createElement("div");
  root.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(root);

  for (let i = 0; i < 80; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.floor(Math.random() * 6);
    const left = Math.random() * 100;
    const delay = Math.random() * 0.2;
    const dur = 1.2 + Math.random() * 1;
    p.style.cssText = `position:absolute;top:-12px;left:${left}vw;width:${size}px;height:${size}px;background:${
      colors[i % colors.length]
    };opacity:0.9;border-radius:${Math.random() > 0.5 ? "50%" : "1px"};transform:rotate(${
      Math.random() * 360
    }deg);animation:bs-fall ${dur}s ${delay}s ease-in forwards`;
    root.appendChild(p);
  }

  if (!document.getElementById("bs-confetti-style")) {
    const style = document.createElement("style");
    style.id = "bs-confetti-style";
    style.textContent =
      "@keyframes bs-fall{to{transform:translateY(105vh) rotate(720deg);opacity:0}}";
    document.head.appendChild(style);
  }

  setTimeout(() => root.remove(), 2600);
}
