"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePolicyKnobs, publishPolicyVersion, rollbackPolicy, type PolicyKnobsInput } from "@/app/actions";
import { ALL_DETECTORS, type CompiledPolicy, type DetectorName } from "@/lib/policy";
import { BUILTIN_RULES } from "@/lib/builtinRules";
import { SEVERITIES, TIERS, type RuleSpec, type Severity, type Tier } from "@/lib/ruleMatch";
import CustomRules from "@/components/CustomRules";
import RuleTester from "@/components/RuleTester";
import { Check, History, Radio, RotateCcw, Save, UploadCloud } from "lucide-react";

const DETECTOR_LABEL: Record<DetectorName, string> = {
  origin: "Origin trust",
  injection: "Instruction injection",
  egress: "Exfiltration",
  conflict: "Fact conflict",
  rules: "Rule library",
};

export type VersionRow = { version: number; note: string; createdAt: string };

export default function PolicyManager({
  initial,
  versions,
  hasUnpublished,
}: {
  initial: CompiledPolicy;
  versions: VersionRow[];
  hasUnpublished: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Working draft (scalar knobs) held locally; persisted on "Save draft".
  const [quarantineBelow, setQuarantineBelow] = useState(initial.quarantineBelow);
  const [tagBelow, setTagBelow] = useState(initial.tagBelow);
  const [baseTrust, setBaseTrust] = useState<Record<Tier, number>>(initial.baseTrust);
  const [floorSeverity, setFloorSeverity] = useState<Severity>(initial.floorSeverity);
  const [detectors, setDetectors] = useState<Set<DetectorName>>(new Set(initial.enabledDetectors));
  const [disabled, setDisabled] = useState<Set<string>>(new Set(initial.disabledRuleIds));
  const [note, setNote] = useState("");

  const knobs: PolicyKnobsInput = {
    quarantineBelow,
    tagBelow,
    baseTrust,
    floorSeverity,
    enabledDetectors: ALL_DETECTORS.filter((d) => detectors.has(d)),
    disabledRuleIds: [...disabled],
  };

  const dirty = JSON.stringify(knobs) !== JSON.stringify({
    quarantineBelow: initial.quarantineBelow,
    tagBelow: initial.tagBelow,
    baseTrust: initial.baseTrust,
    floorSeverity: initial.floorSeverity,
    enabledDetectors: initial.enabledDetectors,
    disabledRuleIds: initial.disabledRuleIds,
  });

  const saveDraft = () =>
    start(async () => {
      await savePolicyKnobs(knobs);
      toast.success("Draft saved — publish to push it to SDKs");
      router.refresh();
    });

  const publish = () =>
    start(async () => {
      const v = await publishPolicyVersion(note);
      setNote("");
      toast.success(`Published v${v} — SDKs pick it up on their next policy fetch`);
      router.refresh();
    });

  const rollback = (v: number) =>
    start(async () => {
      const nv = await rollbackPolicy(v);
      toast.success(`Rolled back to v${v} — republished as v${nv}`);
      router.refresh();
    });

  // Rules the tester sees: built-ins minus disabled + enabled custom, but only if
  // the rules detector is on (otherwise nothing rule-based fires).
  const testerRules: RuleSpec[] = useMemo(() => {
    if (!detectors.has("rules")) return [];
    const builtin: RuleSpec[] = BUILTIN_RULES.filter((r) => !disabled.has(r.id)).map((r) => ({
      id: r.id,
      severity: r.severity,
      trustDelta: r.trustDelta,
      flags: r.flags,
      allOf: r.allOf,
    }));
    const custom: RuleSpec[] = initial.customRules
      .filter((r) => r.enabled)
      .map((r) => ({ id: r.ruleId, severity: r.severity, trustDelta: r.trustDelta, flags: r.flags, allOf: r.allOf }));
    return [...builtin, ...custom];
  }, [detectors, disabled, initial.customRules]);

  return (
    <div className="space-y-4">
      {/* Publish bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <Radio className="size-4 text-muted" />
        <div className="text-sm text-foreground">
          Live version:{" "}
          <span className="font-medium">{initial.version ? `v${initial.version}` : "none (SDK defaults)"}</span>
        </div>
        {(hasUnpublished || dirty) && (
          <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-300">
            unpublished changes
          </span>
        )}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="version note (optional)"
          className="ml-auto rounded-lg border border-border bg-mutedbg px-3 py-1.5 text-xs text-foreground w-48"
        />
        {dirty && (
          <button
            disabled={pending}
            onClick={saveDraft}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-mutedbg disabled:opacity-50"
          >
            <Save className="size-3.5" /> Save draft
          </button>
        )}
        <button
          disabled={pending || dirty}
          title={dirty ? "Save draft first" : "Publish the draft to all SDKs"}
          onClick={publish}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
        >
          <UploadCloud className="size-3.5" /> Publish
        </button>
      </div>

      {/* Two columns on wide screens: the editor left, live feedback (tester +
          version history) sticky on the right so it's visible while editing. */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-4">

      {/* Thresholds + trust knobs */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
        <div>
          <h2 className="text-sm font-medium text-foreground mb-1">Thresholds &amp; trust</h2>
          <p className="text-xs text-muted">Scores below a threshold are quarantined/tagged. Base trust is the starting score per origin, before detectors run.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Quarantine below" value={quarantineBelow} onChange={setQuarantineBelow} />
          <NumberField label="Tag below" value={tagBelow} onChange={setTagBelow} />
        </div>
        <div>
          <span className="text-xs text-muted">Base trust by origin</span>
          <div className="mt-2 grid grid-cols-4 gap-3">
            {TIERS.map((t) => (
              <NumberField
                key={t}
                label={t}
                value={baseTrust[t]}
                onChange={(v) => setBaseTrust((prev) => ({ ...prev, [t]: v }))}
              />
            ))}
          </div>
        </div>
        <label className="block max-w-xs">
          <span className="text-xs text-muted">Floor severity (forces ≥ tag from untrusted/hostile)</span>
          <select
            value={floorSeverity}
            onChange={(e) => setFloorSeverity(e.target.value as Severity)}
            className="mt-1 w-full rounded-lg border border-border bg-mutedbg px-3 py-1.5 text-sm text-foreground"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Detectors */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <span className="text-sm font-medium text-foreground">Active detectors</span>
        <div className="grid grid-cols-2 gap-2">
          {ALL_DETECTORS.map((name) => (
            <label key={name} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={detectors.has(name)}
                onChange={() =>
                  setDetectors((prev) => {
                    const next = new Set(prev);
                    next.has(name) ? next.delete(name) : next.add(name);
                    return next;
                  })
                }
                className="accent-emerald-500"
              />
              <span className="text-foreground/80">{DETECTOR_LABEL[name]}</span>
              <code className="ml-auto text-[11px] text-muted">{name}</code>
            </label>
          ))}
        </div>
      </div>

      {/* Built-in rule library */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Built-in rules</span>
          <span className="text-xs text-muted">— {BUILTIN_RULES.length} shipped patterns; uncheck to disable one</span>
        </div>
        <div className="grid gap-2">
          {BUILTIN_RULES.map((r) => (
            <label key={r.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={!disabled.has(r.id)}
                onChange={() =>
                  setDisabled((prev) => {
                    const next = new Set(prev);
                    next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                    return next;
                  })
                }
                className="accent-emerald-500"
              />
              <code className="text-xs text-foreground/80">{r.id}</code>
              <span className="text-xs text-muted truncate">{r.description}</span>
              <span className="ml-auto text-[11px] text-muted">{r.severity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom rules */}
      <CustomRules rules={initial.customRules} onChanged={() => router.refresh()} />

      </div>{/* /left column */}

      <div className="min-w-0 space-y-4 lg:sticky lg:top-6">

      {/* Tester */}
      <RuleTester rules={testerRules} knobs={{ quarantineBelow, tagBelow, baseTrust, floorSeverity }} />

      {/* Version history */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted" />
          <span className="text-sm font-medium text-foreground">Version history</span>
        </div>
        {versions.length === 0 && <p className="text-xs text-muted">Nothing published yet.</p>}
        {versions.map((v) => (
          <div key={v.version} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
            <span className="font-medium text-foreground">v{v.version}</span>
            {v.version === initial.version && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[11px] text-emerald-600 dark:text-emerald-300">
                <Check className="size-3" /> live
              </span>
            )}
            <span className="text-xs text-muted truncate">{v.note || "—"}</span>
            <span className="ml-auto text-[11px] text-muted">{new Date(v.createdAt).toLocaleString()}</span>
            {v.version !== initial.version && (
              <button
                disabled={pending}
                onClick={() => rollback(v.version)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-foreground hover:bg-mutedbg disabled:opacity-50"
              >
                <RotateCcw className="size-3" /> Roll back
              </button>
            )}
          </div>
        ))}
      </div>

      </div>{/* /right column */}
      </div>{/* /grid */}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted capitalize">{label}</span>
      <input
        type="number"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-border bg-mutedbg px-3 py-1.5 text-sm text-foreground"
      />
    </label>
  );
}
