"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldAlert, ScrollText, FileCheck2, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quarantine", label: "Quarantine", icon: ShieldAlert },
  { href: "/audit", label: "Audit log", icon: ScrollText },
  { href: "/evidence", label: "Evidence", icon: FileCheck2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-slate-800/80 bg-slate-900/40 flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-slate-800/80">
        <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 grid place-items-center">
          <ShieldCheck className="size-5 text-slate-950" />
        </div>
        <div>
          <div className="font-semibold leading-tight">Thymus</div>
          <div className="text-[11px] text-slate-500 leading-tight">memory firewall</div>
        </div>
      </div>

      <nav className="p-3 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm mb-1 transition-colors ${
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400" /> default-project
        </div>
        <div className="mt-1">single-tenant · dev</div>
      </div>
    </aside>
  );
}
