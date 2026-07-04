"use client";

import { useTransition } from "react";
import { reviewDecision, type ReviewOutcome } from "@/app/actions";
import { Check, Trash2, ShieldCheck } from "lucide-react";

const ACTIONS: { outcome: ReviewOutcome; label: string; icon: typeof Check; cls: string }[] = [
  { outcome: "released", label: "Release", icon: Check, cls: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10" },
  { outcome: "marked_safe", label: "Mark safe", icon: ShieldCheck, cls: "border-sky-500/40 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10" },
  { outcome: "deleted", label: "Delete", icon: Trash2, cls: "border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10" },
];

export default function ReviewButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      {ACTIONS.map(({ outcome, label, icon: Icon, cls }) => (
        <button
          key={outcome}
          disabled={pending}
          onClick={() => start(() => reviewDecision(id, outcome))}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${cls}`}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
