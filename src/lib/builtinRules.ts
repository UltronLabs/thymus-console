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
    "pack": "exfiltration",
    "id": "exfil.shortener_link",
    "description": "Stored action directive around a URL-shortener link.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "url_or_exfil",
      "instruction_injection"
    ],
    "allOf": [
      [
        "bit.ly/",
        "tinyurl.com",
        "t.co/",
        "goo.gl/",
        "is.gd/",
        "rebrand.ly"
      ],
      [
        "click",
        "visit",
        "open",
        "go to",
        "check",
        "use this link"
      ]
    ],
    "tags": [
      "exfil",
      "phishing"
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
    "pack": "impersonation",
    "id": "imper.false_authority",
    "description": "Claim that the content comes from an internal authority.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "impersonation"
    ],
    "allOf": [
      [
        "this message is from",
        "sent by the",
        "on behalf of the",
        "official notice from",
        "instructed by the",
        "authorized by the"
      ],
      [
        "it department",
        "it team",
        "security team",
        "system administrator",
        "compliance team",
        "ceo",
        "management",
        "support team",
        "fraud department"
      ]
    ],
    "tags": [
      "authority",
      "phishing"
    ]
  },
  {
    "pack": "impersonation",
    "id": "imper.persona_switch",
    "description": "Directive to adopt an unrestricted or elevated persona.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "prompt_override",
      "impersonation"
    ],
    "allOf": [
      [
        "you are now",
        "act as",
        "pretend to be",
        "roleplay as",
        "behave as if",
        "switch to"
      ],
      [
        "unrestricted",
        "developer mode",
        "dan mode",
        "no rules",
        "no guidelines",
        "no restrictions",
        "admin mode",
        "god mode",
        "jailbroken",
        "without limitations"
      ]
    ],
    "tags": [
      "jailbreak"
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
    "pack": "obfuscation",
    "id": "obf.encoded_directive",
    "description": "Decode-and-comply directive around encoded content.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "obfuscation"
    ],
    "allOf": [
      [
        "decode",
        "base64",
        "unhex",
        "rot13",
        "from hex"
      ],
      [
        "and follow",
        "then execute",
        "and run",
        "and comply",
        "hidden instructions",
        "secret instructions",
        "the instructions inside",
        "and do what it says"
      ]
    ],
    "tags": [
      "evasion"
    ]
  },
  {
    "pack": "obfuscation",
    "id": "obf.encoded_blob",
    "description": "Memory contains a long base64-like payload.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "obfuscation",
      "secret_present"
    ],
    "allOf": [
      [
        "re:[A-Za-z0-9+/=]{80,}"
      ]
    ],
    "tags": [
      "evasion"
    ]
  },
  {
    "pack": "obfuscation",
    "id": "obf.zero_width",
    "description": "Memory contains zero-width/invisible characters.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "obfuscation",
      "instruction_injection"
    ],
    "allOf": [
      [
        "re:[\u200b\u200c\u200d\u2060\ufeff]"
      ]
    ],
    "tags": [
      "evasion"
    ]
  },
  {
    "pack": "ops_redirect",
    "id": "ops.address_redirect",
    "description": "Redirect shipments to another address with a broad/standing scope.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "ops_redirect"
    ],
    "allOf": [
      [
        "ship",
        "deliver",
        "send the package",
        "reroute",
        "redirect"
      ],
      [
        "different address",
        "this address instead",
        "new address",
        "alternate address",
        "to the following address"
      ],
      [
        "all orders",
        "any order",
        "every order",
        "always",
        "from now on",
        "regardless"
      ]
    ],
    "tags": [
      "logistics",
      "minja"
    ]
  },
  {
    "pack": "ops_redirect",
    "id": "ops.status_forgery",
    "description": "Mark orders/tasks with a false status, skipping the real check.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "instruction_injection",
      "ops_redirect"
    ],
    "allOf": [
      [
        "mark",
        "record",
        "log",
        "flag"
      ],
      [
        "as delivered",
        "as complete",
        "as verified",
        "as resolved",
        "as approved",
        "as passed"
      ],
      [
        "without",
        "skip",
        "regardless",
        "even if",
        "automatically",
        "no need to"
      ]
    ],
    "tags": [
      "logistics"
    ]
  },
  {
    "pack": "persistence",
    "id": "persist.self_propagate",
    "description": "Instruction to copy/repeat itself into memory or every future output.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "persistence"
    ],
    "allOf": [
      [
        "add this",
        "copy this",
        "include this",
        "repeat this",
        "store this",
        "carry this"
      ],
      [
        "to memory",
        "into your memory",
        "in every",
        "every response",
        "every reply",
        "all future conversations",
        "verbatim"
      ]
    ],
    "tags": [
      "worm",
      "agentic"
    ]
  },
  {
    "pack": "persistence",
    "id": "persist.standing_forward",
    "description": "Creating a standing forwarding/auto-reply/copy rule.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "persistence",
      "url_or_exfil"
    ],
    "allOf": [
      [
        "auto-reply",
        "auto reply",
        "forwarding rule",
        "forward all",
        "copy every message",
        "bcc"
      ],
      [
        "set up",
        "create",
        "enable",
        "from now on",
        "permanently",
        "all future",
        "every incoming"
      ]
    ],
    "tags": [
      "exfil",
      "persistence"
    ]
  },
  {
    "pack": "policy_override",
    "id": "policy.claimed_change",
    "description": "Claim that a business policy has changed, aimed at a sensitive area.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "instruction_injection",
      "policy_override"
    ],
    "allOf": [
      [
        "policy has changed",
        "new policy",
        "policy update",
        "effective immediately",
        "policy is now",
        "updated policy"
      ],
      [
        "refund",
        "return",
        "discount",
        "pricing",
        "billing",
        "access",
        "verification",
        "approval",
        "shipping",
        "escalation"
      ]
    ],
    "tags": [
      "policy",
      "minja"
    ]
  },
  {
    "pack": "policy_override",
    "id": "policy.disregard_previous",
    "description": "Directive to disregard or supersede previous instructions/policy.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "prompt_override",
      "policy_override"
    ],
    "allOf": [
      [
        "disregard",
        "ignore",
        "override",
        "supersede",
        "replaces"
      ],
      [
        "previous instructions",
        "prior instructions",
        "earlier instructions",
        "previous policy",
        "all previous",
        "original instructions",
        "standing policy"
      ]
    ],
    "tags": [
      "policy"
    ]
  },
  {
    "pack": "privilege_escalation",
    "id": "priv.role_grant",
    "description": "Directive asserting or granting elevated privileges for a user.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "privilege_escalation"
    ],
    "allOf": [
      [
        "admin",
        "administrator",
        "superuser",
        "root access",
        "elevated privilege",
        "full access"
      ],
      [
        "grant",
        "treat this user",
        "treat them",
        "is now an",
        "has been promoted",
        "should be given",
        "give this user",
        "consider them",
        "mark them as",
        "now has"
      ]
    ],
    "tags": [
      "minja",
      "privilege"
    ]
  },
  {
    "pack": "privilege_escalation",
    "id": "priv.check_bypass",
    "description": "Directive to skip or disable a permission/approval control.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "privilege_escalation"
    ],
    "allOf": [
      [
        "permission check",
        "access control",
        "approval step",
        "authorization",
        "role check",
        "admin approval"
      ],
      [
        "skip",
        "bypass",
        "disable",
        "not required",
        "no longer required",
        "without",
        "ignore"
      ]
    ],
    "tags": [
      "privilege"
    ]
  },
  {
    "pack": "prompt_extraction",
    "id": "extract.system_prompt",
    "description": "Directive to reveal the system prompt / internal configuration.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "instruction_injection",
      "prompt_extraction"
    ],
    "allOf": [
      [
        "reveal",
        "print",
        "share",
        "repeat",
        "output",
        "display",
        "disclose",
        "show"
      ],
      [
        "system prompt",
        "your instructions",
        "initial prompt",
        "your configuration",
        "hidden prompt",
        "developer message",
        "tool definitions",
        "your rules"
      ]
    ],
    "tags": [
      "extraction"
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
  },
  {
    "pack": "secrets_pii",
    "id": "secret.private_key_block",
    "description": "Memory contains a PEM private-key block header.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "secret_present"
    ],
    "allOf": [
      [
        "begin rsa private key",
        "begin private key",
        "begin openssh private key",
        "begin ec private key",
        "begin pgp private key"
      ]
    ],
    "tags": [
      "secrets"
    ]
  },
  {
    "pack": "secrets_pii",
    "id": "secret.cloud_key",
    "description": "Memory contains a recognizable cloud/service credential.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "secret_present"
    ],
    "allOf": [
      [
        "re:\\bAKIA[0-9A-Z]{16}\\b",
        "re:\\bgh[pousr]_[A-Za-z0-9]{20,}\\b",
        "re:\\bxox[baprs]-[A-Za-z0-9-]{10,}\\b",
        "re:\\bsk-[A-Za-z0-9]{20,}\\b"
      ]
    ],
    "tags": [
      "secrets"
    ]
  },
  {
    "pack": "secrets_pii",
    "id": "pii.payment_card",
    "description": "Memory contains a payment-card-formatted number.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "pii_present"
    ],
    "allOf": [
      [
        "re:\\b\\d{4}[ -]\\d{4}[ -]\\d{4}[ -]\\d{3,4}\\b"
      ]
    ],
    "tags": [
      "pii"
    ]
  },
  {
    "pack": "secrets_pii",
    "id": "pii.password_disclosure",
    "description": "Memory stores a literal password/PIN value.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "secret_present",
      "pii_present"
    ],
    "allOf": [
      [
        "password is ",
        "passcode is ",
        "the pin is ",
        "password: ",
        "pin code is "
      ]
    ],
    "tags": [
      "secrets"
    ]
  },
  {
    "pack": "tool_abuse",
    "id": "tool.shell_command",
    "description": "Execute directive paired with shell-command material.",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "tool_abuse"
    ],
    "allOf": [
      [
        "run",
        "execute",
        "launch",
        "invoke",
        "always use the command"
      ],
      [
        "rm -rf",
        "curl ",
        "wget ",
        "chmod ",
        "powershell",
        "cmd.exe",
        "/bin/sh",
        "bash -c",
        "sudo ",
        "mkfifo",
        "nc -e",
        "base64 -d"
      ]
    ],
    "tags": [
      "tool",
      "agentic"
    ]
  },
  {
    "pack": "tool_abuse",
    "id": "tool.pipe_to_shell",
    "description": "Download-and-execute pattern (pipe to shell).",
    "severity": "critical",
    "trustDelta": -0.6,
    "flags": [
      "instruction_injection",
      "tool_abuse",
      "url_or_exfil"
    ],
    "allOf": [
      [
        "download",
        "fetch",
        "curl",
        "wget",
        "get the script"
      ],
      [
        "| bash",
        "| sh",
        "pipe to bash",
        "pipe it to sh",
        "sh -c",
        "and execute it",
        "then run it"
      ]
    ],
    "tags": [
      "tool",
      "agentic"
    ]
  },
  {
    "pack": "tool_abuse",
    "id": "tool.destructive_op",
    "description": "Broad destructive data operation directive.",
    "severity": "high",
    "trustDelta": -0.5,
    "flags": [
      "instruction_injection",
      "tool_abuse"
    ],
    "allOf": [
      [
        "delete",
        "drop",
        "wipe",
        "truncate",
        "remove"
      ],
      [
        "all records",
        "entire database",
        "all files",
        "every table",
        "without backup",
        "production database"
      ]
    ],
    "tags": [
      "tool"
    ]
  }
];
