"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createApiKey, revokeApiKey } from "@/app/actions";
import { Check, Copy, KeyRound, Trash2 } from "lucide-react";

type Key = { id: string; keyPrefix: string; createdAt: Date; revokedAt: Date | null };

export default function ApiKeyManager({ initialKeys }: { initialKeys: Key[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const active = keys.filter((k) => !k.revokedAt);

  return (
    <div className="space-y-4">
      {justCreated && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border border-border bg-mutedbg px-3 py-2 font-mono text-xs text-foreground">
              {justCreated}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(justCreated);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-border hover:bg-mutedbg"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-muted" />}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Ingest keys</h2>
          <button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const raw = await createApiKey();
                setJustCreated(raw);
                setKeys((k) => [
                  { id: crypto.randomUUID(), keyPrefix: raw.slice(0, 12), createdAt: new Date(), revokedAt: null },
                  ...k,
                ]);
                toast.success("API key created — copy it now, it won't be shown again");
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            <KeyRound className="size-3.5" /> New key
          </button>
        </div>

        {active.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">No active keys. Create one to connect the SDK.</p>
        ) : (
          <ul className="divide-y divide-border">
            {active.map((k) => (
              <li key={k.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <code className="font-mono text-sm text-foreground">{k.keyPrefix}…</code>
                  <div className="text-[11px] text-muted mt-0.5">
                    created {new Date(k.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() =>
                    start(async () => {
                      await revokeApiKey(k.id);
                      setKeys((prev) => prev.filter((x) => x.id !== k.id));
                      toast.success(`Key ${k.keyPrefix}… revoked`);
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-2.5 py-1.5 text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="size-3.5" /> Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
