// Shared shape/defaults for TenantPolicy, mirroring thymus.policy.TrustPolicy's
// own defaults (quarantine_below=0.45, tag_below=0.70, all built-ins enabled)
// so a tenant that never touches Settings gets exactly what the SDK ships with.

export const ALL_DETECTORS = ["origin", "injection", "egress", "conflict", "rules"] as const;
export type DetectorName = (typeof ALL_DETECTORS)[number];

export type CompiledPolicy = {
  quarantineBelow: number;
  tagBelow: number;
  enabledDetectors: DetectorName[];
};

export const DEFAULT_POLICY: CompiledPolicy = {
  quarantineBelow: 0.45,
  tagBelow: 0.70,
  enabledDetectors: [...ALL_DETECTORS],
};

export function parsePolicyRow(row: {
  quarantineBelow: number;
  tagBelow: number;
  enabledDetectors: string;
}): CompiledPolicy {
  let enabled: DetectorName[];
  try {
    enabled = JSON.parse(row.enabledDetectors);
  } catch {
    enabled = [...ALL_DETECTORS];
  }
  return { quarantineBelow: row.quarantineBelow, tagBelow: row.tagBelow, enabledDetectors: enabled };
}
