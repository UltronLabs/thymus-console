// Shared presentation helpers for verdicts, severity, and channels.

export const VERDICT_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  admit: { label: "Admit", cls: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  tag: { label: "Tag", cls: "text-amber-300 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  quarantine: { label: "Quarantine", cls: "text-rose-300 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-400" },
};

export const SEVERITY_STYLE: Record<string, string> = {
  none: "text-slate-400",
  low: "text-sky-300",
  medium: "text-amber-300",
  high: "text-orange-300",
  critical: "text-rose-300",
};

export function verdictStyle(v: string) {
  return VERDICT_STYLE[v] ?? { label: v, cls: "text-slate-300 bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" };
}

export function parseFlags(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
