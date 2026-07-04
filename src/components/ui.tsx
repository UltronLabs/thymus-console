import { verdictStyle } from "@/lib/format";

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

export function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className={`font-heading text-3xl font-semibold ${accent ?? "text-foreground"}`}>{value}</div>
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

export function Flags({ flags }: { flags: string[] }) {
  if (!flags.length) return <span className="text-xs text-muted/60">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((f) => (
        <span key={f} className="rounded bg-mutedbg px-1.5 py-0.5 font-mono text-[11px] text-foreground/70 border border-border">
          {f}
        </span>
      ))}
    </div>
  );
}
