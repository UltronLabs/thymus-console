import { PageHeader } from "@/components/ui";

export default function Settings() {
  const key = process.env.THYMUS_API_KEY ?? "thymus-dev-key";
  return (
    <>
      <PageHeader title="API keys" subtitle="The SDK sends this as the x-api-key header when ingesting decisions." />
      <div className="px-8 max-w-2xl space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs text-muted mb-1">Ingest endpoint</div>
          <code className="font-mono text-sm text-foreground">POST /api/decisions</code>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs text-muted mb-1">API key (dev)</div>
          <code className="font-mono text-sm text-foreground">{key}</code>
          <p className="text-xs text-muted mt-2">Set <code className="font-mono">THYMUS_API_KEY</code> in the environment for production. Per-tenant keys are deferred.</p>
        </div>
      </div>
    </>
  );
}
