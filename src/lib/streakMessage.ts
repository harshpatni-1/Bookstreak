export function streakMessage(
  current: number,
  longest: number,
  opts?: { lastFrozen?: boolean; freezes?: number },
): string {
  if (opts?.lastFrozen && current > 0) {
    return `❄️ A freeze saved your ${current}-day streak. ${opts.freezes ?? 0} left — read today to refreeze.`;
  }
  if (current === 0) return "Read today to start a new streak. One page counts.";
  if (current === 1) return "Day one. The hardest day is behind you.";
  if (current < 4) return `${current} days in a row — momentum is building.`;
  if (current < 7) return `${current}-day streak. You're forming the habit.`;
  if (current < 14) return `🔥 ${current} days straight. Don't break the chain!`;
  if (current >= longest) return `🏆 ${current} days — your best streak ever!`;
  return `🔥 ${current}-day streak. Best is ${longest}. Keep climbing.`;
}
