// Shared shape/defaults for a tenant's compiled policy — the JSON GET /api/policy
// returns and the SDK's remote_engine() consumes. Defaults mirror
// thymus.policy.TrustPolicy so a tenant that never opens Settings gets exactly
// what the SDK ships with.

import type { Severity, Tier } from "./ruleMatch";
import { SEVERITIES, TIERS } from "./ruleMatch";

export const ALL_DETECTORS = ["origin", "injection", "egress", "conflict", "rules"] as const;
export type DetectorName = (typeof ALL_DETECTORS)[number];

// A custom rule as served to the SDK / edited in the UI (camelCase; the API
// serves this shape and the SDK maps it to the pack format).
export type CustomRuleSpec = {
  ruleId: string;
  description: string;
  severity: Severity;
  trustDelta: number;
  flags: string[];
  allOf: string[][];
  tags: string[];
  enabled: boolean;
};

export type CompiledPolicy = {
  quarantineBelow: number;
  tagBelow: number;
  baseTrust: Record<Tier, number>;
  floorSeverity: Severity;
  enabledDetectors: DetectorName[];
  disabledRuleIds: string[];
  customRules: CustomRuleSpec[];
  version: number | null;
};

export const DEFAULT_BASE_TRUST: Record<Tier, number> = {
  trusted: 0.95,
  standard: 0.8,
  untrusted: 0.5,
  hostile: 0.2,
};

export const DEFAULT_POLICY: CompiledPolicy = {
  quarantineBelow: 0.45,
  tagBelow: 0.7,
  baseTrust: { ...DEFAULT_BASE_TRUST },
  floorSeverity: "high",
  enabledDetectors: [...ALL_DETECTORS],
  disabledRuleIds: [],
  customRules: [],
  version: null,
};

// These fields are native Json columns — Prisma already hands back a parsed
// value, not a string to JSON.parse. Still defensive (unknown at the type
// level, and a fresh TenantPolicy/CustomRule row can be null/absent).
function jsonOr<T>(v: unknown, fallback: T): T {
  return v === null || v === undefined ? fallback : (v as T);
}

function asSeverity(v: unknown): Severity {
  return SEVERITIES.includes(v as Severity) ? (v as Severity) : "high";
}

function normalizeBaseTrust(v: Partial<Record<Tier, number>>): Record<Tier, number> {
  const out = { ...DEFAULT_BASE_TRUST };
  for (const t of TIERS) if (typeof v?.[t] === "number") out[t] = v[t] as number;
  return out;
}

// The working (draft) TenantPolicy row + its CustomRule rows → CompiledPolicy.
// `version` is the row's activeVersion, i.e. what's currently published.
export function compileWorking(
  row: {
    quarantineBelow: number;
    tagBelow: number;
    enabledDetectors: unknown;
    baseTrust: unknown;
    floorSeverity: string;
    disabledRuleIds: unknown;
    activeVersion: number | null;
  } | null,
  rules: {
    ruleId: string;
    description: string;
    severity: string;
    trustDelta: number;
    flags: unknown;
    allOf: unknown;
    tags: unknown;
    enabled: boolean;
  }[],
): CompiledPolicy {
  if (!row) return { ...DEFAULT_POLICY, customRules: rules.map(mapRule) };
  return {
    quarantineBelow: row.quarantineBelow,
    tagBelow: row.tagBelow,
    baseTrust: normalizeBaseTrust(jsonOr(row.baseTrust, DEFAULT_BASE_TRUST)),
    floorSeverity: asSeverity(row.floorSeverity),
    enabledDetectors: jsonOr<DetectorName[]>(row.enabledDetectors, [...ALL_DETECTORS]),
    disabledRuleIds: jsonOr<string[]>(row.disabledRuleIds, []),
    customRules: rules.map(mapRule),
    version: row.activeVersion ?? null,
  };
}

function mapRule(r: {
  ruleId: string;
  description: string;
  severity: string;
  trustDelta: number;
  flags: unknown;
  allOf: unknown;
  tags: unknown;
  enabled: boolean;
}): CustomRuleSpec {
  return {
    ruleId: r.ruleId,
    description: r.description,
    severity: asSeverity(r.severity),
    trustDelta: r.trustDelta,
    flags: jsonOr<string[]>(r.flags, []),
    allOf: jsonOr<string[][]>(r.allOf, []),
    tags: jsonOr<string[]>(r.tags, []),
    enabled: r.enabled,
  };
}
