"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Database } from "lucide-react";

export default function SeedButton({ subtle }: { subtle?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch("/api/seed", { method: "POST" });
          router.refresh();
        })
      }
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        subtle
          ? "border border-slate-700 text-slate-300 hover:bg-slate-800"
          : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
      }`}
    >
      <Database className="size-4" />
      {pending ? "Seeding…" : "Load demo data"}
    </button>
  );
}
