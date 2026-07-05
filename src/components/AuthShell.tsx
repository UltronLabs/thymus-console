import { ShieldCheck } from "lucide-react";

// Split-screen auth layout (form left, brand panel right) — like mem0's login.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="mb-8 flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <span className="font-heading text-lg font-semibold text-foreground">Thymus</span>
        </div>
        {children}
      </div>

      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-slate-200 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-teal-500/10" />
        <div className="relative flex items-center gap-2 text-sm text-slate-400">
          <span className="size-1.5 rounded-full bg-emerald-400" /> memory firewall
        </div>
        <blockquote className="relative">
          <p className="font-heading text-2xl leading-snug text-white">
            &ldquo;Every agent memory layer is a database with no immune system. Thymus is the immune system.&rdquo;
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Screens every memory write for poisoning — provenance, injection, and exfil — and quarantines it before
            it ever reaches your store. Blocks OWASP ASI06.
          </p>
        </blockquote>
        <div className="relative text-xs text-slate-500">Trusted memory hygiene for AI agents</div>
      </div>
    </div>
  );
}
