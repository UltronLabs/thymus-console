// AUTO-GENERATED snapshot of the SDK built-in rule packs (thymus/rules/packs/*.json).
// Regenerate when the SDK rule library changes. Used by the console to show the
// built-in catalog with on/off toggles and to power the live rule tester. The SDK
// remains authoritative at screen time; this is a faithful mirror for the UI.

import type { RuleSpec } from "./ruleMatch";

export const BUILTIN_RULES: (RuleSpec & { pack: string; description: string; tags: string[] })[] = [
  {
    "pack": "auth_bypass",
    "id": "auth.disable_verification",
    "description": "Directive to drop identity/verification requirements.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "prompt_override"
    ],
    "allOf": [
      [
        "verification",
        "verify",
        "identity check",
        "authenticate",
        "2fa",
        "two-factor"
      ],
      [
        "no longer required",
        "not required",
        "skip",
        "bypass",
        "disable",
        "no longer needed",
        "not needed"
      ]
    ],
    "tags": [
      "auth"
    ]
  },
  {
    "pack": "auth_bypass",
    "id": "auth.disclose_credentials",
    "description": "Directive to disclose sensitive account credentials.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "secret_present"
    ],
    "allOf": [
      [
        "disclose",
        "reveal",
        "share",
        "provide",
        "give out",
        "read out",
        "confirm"
      ],
      [
        "account number",
        "full account",
        "password",
        "ssn",
        "social security",
        "card number",
        "security code"
      ]
    ],
    "tags": [
      "disclosure"
    ]
  },
  {
    "pack": "exfiltration",
    "id": "exfil.external_send",
    "description": "Send/forward/copy paired with an external email address or URL.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "url_or_exfil",
      "instruction_injection"
    ],
    "allOf": [
      [
        "send",
        "sent",
        "forward",
        "cc ",
        "bcc",
        "copy",
        "deliver",
        "upload",
        "route",
        "back up"
      ],
      [
        "re:[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}",
        "re:https?://",
        "www."
      ]
    ],
    "tags": [
      "exfil"
    ]
  },
  {
    "pack": "financial",
    "id": "fin.unconditional_refund",
    "description": "Refund directive paired with an override or broad scope.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "financial_manipulation"
    ],
    "allOf": [
      [
        "refund",
        "money back",
        "reimburse"
      ],
      [
        "always",
        "any account",
        "no approval",
        "without approval",
        "never ask",
        "automatically",
        "anyone who"
      ]
    ],
    "tags": [
      "minja",
      "refund"
    ]
  },
  {
    "pack": "financial",
    "id": "fin.forced_discount",
    "description": "Automatic or pre-approved discount directive.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "instruction_injection",
      "financial_manipulation"
    ],
    "allOf": [
      [
        "discount",
        "loyalty discount",
        "percent off",
        "% off",
        "waive the fee",
        "waive"
      ],
      [
        "always",
        "automatically",
        "pre-approved",
        "apply it",
        "no approval"
      ]
    ],
    "tags": [
      "discount"
    ]
  },
  {
    "pack": "financial",
    "id": "fin.billing_override",
    "description": "Directive to change billing, plan, or rate going forward.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "instruction_injection",
      "fact_conflict",
      "financial_manipulation"
    ],
    "allOf": [
      [
        "bill",
        "billed",
        "billing",
        "enterprise rate",
        "charge them",
        "rate"
      ],
      [
        "from now on",
        "going forward",
        "instead",
        "no longer",
        "not on the"
      ]
    ],
    "tags": [
      "billing",
      "slow-poison"
    ]
  },
  {
    "pack": "manipulation",
    "id": "manip.forced_recommendation",
    "description": "Directive to always recommend/promote a specific provider.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "instruction_injection"
    ],
    "allOf": [
      [
        "recommend",
        "promote",
        "steer",
        "push",
        "endorse",
        "always suggest"
      ],
      [
        "always",
        "regardless",
        "whenever",
        "no matter",
        "every time"
      ]
    ],
    "tags": [
      "manipulation",
      "upsell"
    ]
  },
  {
    "pack": "safety_suppression",
    "id": "safety.suppress_escalation",
    "description": "Directive not to escalate, report, or flag issues.",
    "severity": "high",
    "trustDelta": -0.55,
    "flags": [
      "instruction_injection",
      "prompt_override"
    ],
    "allOf": [
      [
        "escalate",
        "report",
        "flag",
        "raise a ticket",
        "notify",
        "alert"
      ],
      [
        "do not",
        "don't",
        "never",
        "silently",
        "no longer",
        "stop",
        "suppress"
      ]
    ],
    "tags": [
      "safety"
    ]
  },
  {
    "pack": "secrets_pii",
    "id": "secret.api_key_material",
    "description": "Memory contains API-key / token-like material.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "secret_present"
    ],
    "allOf": [
      [
        "api key",
        "api_key",
        "apikey",
        "secret key",
        "access token",
        "bearer ",
        "private key"
      ],
      [
        "re:[a-z0-9_\\-]{20,}"
      ]
    ],
    "tags": [
      "secrets"
    ]
  },
  {
    "pack": "secrets_pii",
    "id": "pii.ssn",
    "description": "Memory contains a US Social Security Number pattern.",
    "severity": "high",
    "trustDelta": -0.4,
    "flags": [
      "pii_present"
    ],
    "allOf": [
      [
        "re:\\b\\d{3}-\\d{2}-\\d{4}\\b"
      ]
    ],
    "tags": [
      "pii"
    ]
  }
];
