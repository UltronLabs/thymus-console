"use client";

import { useState, useTransition } from "react";
import { updatePolicy } from "@/app/actions";
import { ALL_DETECTORS, type DetectorName, type CompiledPolicy } from "@/lib/policy";
import { Check, Save } from "lucide-react";

const DETECTOR_LABEL: Record<DetectorName, string> = {
  origin: "Origin trust",
  injection: "Instruction injection",
  egress: "Exfiltration",
  conflict: "Fact conflict",
  rules: "Rule library",
};

export default function PolicyEditor({ initial }: { initial: CompiledPolicy }) {
  const [quarantineBelow, setQuarantineBelow] = useState(initial.quarantineBelow);
  const [tagBelow, setTagBelow] = useState(initial.tagBelow);
  const [enabled, setEnabled] = useState<Set<DetectorName>>(new Set(initial.enabledDetectors));
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const toggle = (name: DetectorName) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
    setSaved(false);
  };

  const preview: CompiledPolicy = {
    quarantineBelow,
    tagBelow,
    enabledDetectors: ALL_DETECTORS.filter((d) => enabled.has(d)),
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
      <div>
        <h2 className="text-sm font-medium text-foreground mb-1">Trust policy</h2>
        <p className="text-xs text-muted">
          Tunes thresholds and which detectors run. The SDK fetches this at startup — it does not edit
          rule content (that stays in the SDK&apos;s rule packs).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-muted">Quarantine below</span>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={quarantineBelow}
            onChange={(e) => { setQuarantineBelow(Number(e.target.value)); setSaved(false); }}
            className="mt-1 w-full rounded-lg border border-border bg-mutedbg px-3 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Tag below</span>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={tagBelow}
            onChange={(e) => { setTagBelow(Number(e.target.value)); setSaved(false); }}
            className="mt-1 w-full rounded-lg border border-border bg-mutedbg px-3 py-1.5 text-sm text-foreground"
          />
        </label>
      </div>

      <div>
        <span className="text-xs text-muted">Active detectors</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ALL_DETECTORS.map((name) => (
            <label key={name} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={enabled.has(name)}
                onChange={() => toggle(name)}
                className="accent-emerald-500"
              />
              <span className="text-foreground/80">{DETECTOR_LABEL[name]}</span>
              <code className="ml-auto text-[11px] text-muted">{name}</code>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              await updatePolicy(quarantineBelow, tagBelow, preview.enabledDetectors);
              setSaved(true);
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
        >
          <Save className="size-3.5" /> Save
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <Check className="size-3.5" /> saved — SDKs will pick this up on next fetch_policy() call
          </span>
        )}
      </div>

      <div>
        <span className="text-xs text-muted">Compiled (what GET /api/policy returns)</span>
        <pre className="mt-1 overflow-x-auto rounded-lg border border-border bg-mutedbg px-3 py-2 text-[11px] font-mono text-foreground/80">
{JSON.stringify(preview, null, 2)}
        </pre>
      </div>
    </div>
  );
}
