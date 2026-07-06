import { verdictStyle } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-8 py-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// `delta` is the change vs the previous period (absolute count). Rendered
// neutrally — whether "more quarantines" is good or bad depends on the reader,
// so we show direction without judging it.
export function StatCard({
  label,
  value,
  accent,
  delta,
  deltaLabel,
}: {
  label: string;
  value: number | string;
  accent?: string;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <div className={`font-heading text-3xl font-semibold ${accent ?? "text-foreground"}`}>{value}</div>
        {delta !== undefined && (
          <span className="inline-flex items-center gap-0.5 text-[11px] text-muted tabular-nums">
            {delta > 0 ? (
              <ArrowUpRight className="size-3" />
            ) : delta < 0 ? (
              <ArrowDownRight className="size-3" />
            ) : (
              <Minus className="size-3" />
            )}
            {delta > 0 ? `+${delta}` : delta}
            {deltaLabel && <span className="text-muted/60 ml-0.5">{deltaLabel}</span>}
          </span>
        )}
      </div>
      <div className="mt-1 text-[13px] text-muted">{label}</div>
    </div>
  );
}

export function VerdictBadge({ verdict }: { verdict: string }) {
  const s = verdictStyle(verdict);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// `max` keeps dense tables compact: overflow collapses to "+N".
export function Flags({ flags, max }: { flags: string[]; max?: number }) {
  if (!flags.length) return <span className="text-xs text-muted/60">—</span>;
  const shown = max ? flags.slice(0, max) : flags;
  const extra = flags.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((f) => (
        <span key={f} className="rounded bg-mutedbg px-1.5 py-0.5 font-mono text-[11px] text-foreground/70 border border-border">
          {f}
        </span>
      ))}
      {extra > 0 && (
        <span title={flags.slice(shown.length).join(", ")} className="rounded px-1.5 py-0.5 text-[11px] text-muted">
          +{extra}
        </span>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="max-w-sm space-y-3">
        {icon && <div className="mx-auto grid size-10 place-items-center rounded-full bg-mutedbg text-muted">{icon}</div>}
        <div className="text-sm font-medium text-foreground">{title}</div>
        {body && <p className="text-xs text-muted">{body}</p>}
        {action && <div className="pt-1">{action}</div>}
      </div>
    </div>
  );
}
