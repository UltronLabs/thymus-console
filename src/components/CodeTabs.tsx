"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeTabs({ tabs }: { tabs: { label: string; code: string }[] }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const code = tabs[active].code;

  return (
    <div className="rounded-xl border border-border bg-mutedbg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-2">
        <div className="flex">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActive(i)}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                i === active
                  ? "border-emerald-500 text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="grid size-7 place-items-center rounded-md text-muted hover:text-foreground hover:bg-background transition-colors"
          aria-label="Copy"
        >
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  );
}
