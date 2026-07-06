"use client";

import { useState, useTransition } from "react";
import { upsertCustomRule, deleteCustomRule, type CustomRuleInput } from "@/app/actions";
import { SEVERITIES, type Severity } from "@/lib/ruleMatch";
import type { CustomRuleSpec } from "@/lib/policy";
import { Plus, Trash2, Pencil, X } from "lucide-react";

const BLANK: CustomRuleSpec = {
  ruleId: "",
  description: "",
  severity: "high",
  trustDelta: -0.5,
  flags: [],
  allOf: [[]],
  tags: [],
  enabled: true,
};

// Turn ["a","b"] <-> "a, b" for the comma-separated inputs.
const join = (xs: string[]) => xs.join(", ");
const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function CustomRules({ rules, onChanged }: { rules: CustomRuleSpec[]; onChanged: () => void }) {
  const [editing, setEditing] = useState<CustomRuleSpec | null>(null);
  const [pending, start] = useTransition();

  const save = (draft: CustomRuleSpec) =>
    start(async () => {
      await upsertCustomRule(draft as CustomRuleInput);
      setEditing(null);
      onChanged();
    });

  const remove = (ruleId: string) =>
    start(async () => {
      await deleteCustomRule(ruleId);
      onChanged();
    });

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-foreground">Custom rules</h2>
        <span className="text-xs text-muted">— co-occurrence patterns; every group must match (AND of ORs)</span>
        {!editing && (
          <button
            onClick={() => setEditing({ ...BLANK, allOf: [[]] })}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-foreground hover:bg-mutedbg"
          >
            <Plus className="size-3.5" /> New rule
          </button>
        )}
      </div>

      {rules.length === 0 && !editing && (
        <p className="text-xs text-muted">No custom rules yet. Built-in rules still apply.</p>
      )}

      {rules.map((r) => (
        <div key={r.ruleId} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
          <code className={`text-xs ${r.enabled ? "text-foreground/80" : "text-muted line-through"}`}>{r.ruleId}</code>
          <span className="text-xs text-muted truncate">{r.description}</span>
          <span className="ml-auto text-[11px] text-muted">{r.severity}</span>
          <button onClick={() => setEditing(r)} className="text-muted hover:text-foreground" aria-label="edit">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={() => remove(r.ruleId)} className="text-muted hover:text-rose-500" aria-label="delete">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}

      {editing && <RuleForm draft={editing} pending={pending} onCancel={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function RuleForm({
  draft,
  pending,
  onCancel,
  onSave,
}: {
  draft: CustomRuleSpec;
  pending: boolean;
  onCancel: () => void;
  onSave: (d: CustomRuleSpec) => void;
}) {
  const [d, setD] = useState<CustomRuleSpec>(draft);
  const set = (patch: Partial<CustomRuleSpec>) => setD((prev) => ({ ...prev, ...patch }));

  const setGroup = (i: number, value: string) =>
    setD((prev) => {
      const allOf = prev.allOf.map((g, gi) => (gi === i ? split(value) : g));
      return { ...prev, allOf };
    });

  return (
    <div className="rounded-lg border border-emerald-500/40 bg-mutedbg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-muted">Rule id</span>
          <input
            value={d.ruleId}
            onChange={(e) => set({ ruleId: e.target.value })}
            placeholder="refund_override"
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground font-mono"
          />
          <span className="text-[11px] text-muted">saved as custom.&lt;id&gt;</span>
        </label>
        <label className="block">
          <span className="text-xs text-muted">Severity</span>
          <select
            value={d.severity}
            onChange={(e) => set({ severity: e.target.value as Severity })}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
          >
            {SEVERITIES.filter((s) => s !== "none").map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-xs text-muted">Description</span>
        <input
          value={d.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Refund directive paired with an override term."
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-muted">Trust delta (negative)</span>
          <input
            type="number"
            step={0.05}
            max={0}
            value={d.trustDelta}
            onChange={(e) => set({ trustDelta: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Flags (comma-separated)</span>
          <input
            value={join(d.flags)}
            onChange={(e) => set({ flags: split(e.target.value) })}
            placeholder="financial_manipulation"
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
          />
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-xs text-muted">Term groups — a term is a substring, or a regex with an <code>re:</code> prefix. The rule fires only if every group matches.</span>
        {d.allOf.map((group, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[11px] text-muted w-10">{i === 0 ? "if" : "AND"}</span>
            <input
              value={join(group)}
              onChange={(e) => setGroup(i, e.target.value)}
              placeholder="refund, money back, reimburse"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground font-mono"
            />
            {d.allOf.length > 1 && (
              <button
                onClick={() => set({ allOf: d.allOf.filter((_, gi) => gi !== i) })}
                className="text-muted hover:text-rose-500"
                aria-label="remove group"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => set({ allOf: [...d.allOf, []] })}
          className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300"
        >
          <Plus className="size-3.5" /> add AND group
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={d.enabled} onChange={(e) => set({ enabled: e.target.checked })} className="accent-emerald-500" />
        <span className="text-foreground/80">Enabled</span>
      </label>

      <div className="flex items-center gap-2">
        <button
          disabled={pending || !d.ruleId.trim() || !d.allOf.some((g) => g.length)}
          onClick={() => onSave(d)}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
        >
          Save rule
        </button>
        <button onClick={onCancel} className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-card">
          Cancel
        </button>
      </div>
    </div>
  );
}
