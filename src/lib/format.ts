// Shared presentation helpers. Verdict/severity colors are theme-aware
// (light text tones for light mode, brighter for dark).

export const VERDICT_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  admit: {
    label: "Admit",
    cls: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  tag: {
    label: "Tag",
    cls: "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/25",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  quarantine: {
    label: "Quarantine",
    cls: "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/25",
    dot: "bg-rose-500 dark:bg-rose-400",
  },
};

export function verdictStyle(v: string) {
  return (
    VERDICT_STYLE[v] ?? {
      label: v,
      cls: "text-muted bg-mutedbg border-border",
      dot: "bg-muted",
    }
  );
}

// taintFlags is a native Json column now — Prisma hands back a real array, not
// a string to parse. Kept as a defensive coercion (not a bare cast) since the
// value is `unknown` at the type level and callers pass it straight through
// from the DB/SSE without validating shape themselves.
export function parseFlags(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((f): f is string => typeof f === "string") : [];
}

export function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
