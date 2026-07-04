import { verdictStyle } from "@/lib/format";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-800/80 px-8 py-5">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4">
      <div className={`text-3xl font-semibold ${accent ?? "text-white"}`}>{value}</div>
      <div className="text-[13px] text-slate-400 mt-1">{label}</div>
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
  if (!flags.length) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((f) => (
        <span key={f} className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300 font-mono">
          {f}
        </span>
      ))}
    </div>
  );
}
