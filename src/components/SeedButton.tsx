"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Database, Trash2 } from "lucide-react";
import { clearDecisions } from "@/app/actions";

export default function SeedButton({ subtle }: { subtle?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="inline-flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await fetch("/api/seed", { method: "POST" });
            toast.success("Demo data loaded");
            router.refresh();
          })
        }
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          subtle
            ? "border border-border text-foreground/80 hover:bg-mutedbg"
            : "bg-emerald-500 text-white hover:bg-emerald-400"
        }`}
      >
        <Database className="size-4" />
        {pending ? "Seeding…" : "Load demo data"}
      </button>
      {subtle && (
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              if (!confirm("Delete all decisions for this workspace? This cannot be undone.")) return;
              const n = await clearDecisions();
              toast.success(`Cleared ${n} decision${n === 1 ? "" : "s"}`);
              router.refresh();
            })
          }
          title="Delete all decisions for this workspace"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-mutedbg hover:text-rose-600 dark:hover:text-rose-300 transition-colors disabled:opacity-50"
        >
          <Trash2 className="size-4" />
          Clear
        </button>
      )}
    </div>
  );
}
