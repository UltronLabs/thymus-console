"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown, Settings, BookOpen, LifeBuoy, LogOut } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";

const EMAIL = "admin@getthymus.com";

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const item =
    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-foreground/80 hover:bg-mutedbg hover:text-foreground transition-colors";

  return (
    <div ref={ref} className="relative border-t border-border p-2.5">
      {open && (
        <div className="absolute bottom-full left-2.5 right-2.5 mb-2 rounded-xl border border-border bg-card p-1.5 shadow-xl">
          <div className="px-2.5 py-1.5 text-[11px] text-muted truncate">{EMAIL}</div>

          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-xs text-muted">Theme</span>
            <ThemeSwitch />
          </div>

          <div className="my-1 h-px bg-border" />

          <Link href="/settings" onClick={() => setOpen(false)} className={item}>
            <Settings className="size-4 text-muted" /> Settings
          </Link>
          <a href="https://github.com/UltronLabs/Thymus" target="_blank" className={item}>
            <BookOpen className="size-4 text-muted" /> Developer docs
          </a>
          <a href="https://github.com/UltronLabs/Thymus/issues" target="_blank" className={item}>
            <LifeBuoy className="size-4 text-muted" /> Help
          </a>

          <div className="my-1 h-px bg-border" />
          <button className={`${item} w-full`}>
            <LogOut className="size-4 text-muted" /> Log out
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-mutedbg transition-colors"
      >
        <div className="size-7 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600" />
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate text-xs font-medium text-foreground">Thymus Admin</div>
          <div className="truncate text-[11px] text-muted">{EMAIL}</div>
        </div>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted" />
      </button>
    </div>
  );
}
