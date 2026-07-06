// Faithful TS mirror of the SDK's rule match + policy decision, so the Settings
// "rule tester" can show what WILL happen without a Python round-trip. The SDK
// (thymus/rules/loader.py + thymus/policy.py) stays authoritative at real screen
// time; this must track its semantics exactly:
//   - a pattern is a case-insensitive substring, or a regex if prefixed "re:"
//   - all_of is AND-of-ORs: every group must have ≥1 matching pattern
//   - score = base_trust[tier] + Σ trust_delta of firing rules, clamped [0,1]
//   - verdict from thresholds, then a severity floor for attacker-reachable origins

export type RuleSpec = {
  id: string;
  severity: Severity;
  trustDelta: number;
  flags: string[];
  allOf: string[][]; // groups of patterns
};

export const SEVERITIES = ["none", "low", "medium", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];
const SEV_RANK: Record<Severity, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };

export const TIERS = ["trusted", "standard", "untrusted", "hostile"] as const;
export type Tier = (typeof TIERS)[number];

export type Verdict = "admit" | "tag" | "quarantine";

function matchPattern(pattern: string, textLower: string): boolean {
  if (pattern.startsWith("re:")) {
    try {
      return new RegExp(pattern.slice(3), "i").test(textLower);
    } catch {
      return false; // an invalid regex simply never fires (mirrors a broken rule being inert)
    }
  }
  return textLower.includes(pattern.toLowerCase());
}

export function ruleFires(rule: RuleSpec, textLower: string): boolean {
  if (!rule.allOf.length) return false;
  return rule.allOf.every((group) => group.some((p) => matchPattern(p, textLower)));
}

export type PolicyKnobs = {
  quarantineBelow: number;
  tagBelow: number;
  baseTrust: Record<Tier, number>;
  floorSeverity: Severity;
};

export type TestResult = {
  score: number;
  verdict: Verdict;
  severity: Severity;
  firing: { id: string; severity: Severity; trustDelta: number }[];
};

// Mirrors TrustPolicy.decide restricted to what a rule-only test can know. Only
// rule detectors contribute here (the tester scopes to rules), which is exactly
// what the UI advertises.
export function evaluate(rules: RuleSpec[], text: string, tier: Tier, knobs: PolicyKnobs): TestResult {
  const t = (text || "").toLowerCase();
  const firing = rules.filter((r) => ruleFires(r, t));

  const base = knobs.baseTrust[tier] ?? 0.8;
  const score = Math.max(0, Math.min(1, base + firing.reduce((a, r) => a + r.trustDelta, 0)));

  const severity: Severity = firing.reduce<Severity>(
    (max, r) => (SEV_RANK[r.severity] > SEV_RANK[max] ? r.severity : max),
    "none",
  );

  let verdict: Verdict = score < knobs.quarantineBelow ? "quarantine" : score < knobs.tagBelow ? "tag" : "admit";

  const attackerOrigin = tier === "untrusted" || tier === "hostile";
  if (attackerOrigin && SEV_RANK[severity] >= SEV_RANK[knobs.floorSeverity]) {
    const floor: Verdict = severity === "critical" ? "quarantine" : "tag";
    const RANK: Record<Verdict, number> = { admit: 0, tag: 1, quarantine: 2 };
    if (RANK[floor] > RANK[verdict]) verdict = floor;
  }

  return {
    score,
    verdict,
    severity,
    firing: firing.map((r) => ({ id: r.id, severity: r.severity, trustDelta: r.trustDelta })),
  };
}
