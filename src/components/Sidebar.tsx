"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  ScrollText,
  FileCheck2,
  ShieldCheck,
  Rocket,
  KeyRound,
} from "lucide-react";

const SECTIONS: { label: string; items: { href: string; label: string; icon: typeof Rocket }[] }[] = [
  {
    label: "Setup",
    items: [
      { href: "/get-started", label: "Get started", icon: Rocket },
      { href: "/settings", label: "API keys", icon: KeyRound },
    ],
  },
  {
    label: "Activity",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/quarantine", label: "Quarantine", icon: ShieldAlert },
      { href: "/audit", label: "Audit log", icon: ScrollText },
    ],
  },
  {
    label: "Compliance",
    items: [{ href: "/evidence", label: "Evidence", icon: FileCheck2 }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600">
          <ShieldCheck className="size-5 text-white" />
        </div>
        <div>
          <div className="font-semibold leading-tight">Thymus</div>
          <div className="text-[11px] text-muted leading-tight">memory firewall</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted/70">
              {section.label}
            </div>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-mutedbg font-medium text-foreground"
                      : "text-muted hover:bg-mutedbg hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4 text-[11px] text-muted">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400" /> single-tenant · dev
        </div>
      </div>
    </aside>
  );
}
