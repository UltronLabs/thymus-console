"use client";

import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

const OPTIONS = [
  { key: "system", icon: Monitor, label: "System" },
  { key: "light", icon: Sun, label: "Light" },
  { key: "dark", icon: Moon, label: "Dark" },
] as const;

// 3-way segmented System / Light / Dark switch (like OpenAI's account menu).
export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
      {OPTIONS.map(({ key, icon: Icon, label }) => {
        const active = mounted && theme === key;
        return (
          <button
            key={key}
            title={label}
            aria-label={label}
            onClick={() => setTheme(key)}
            className={`grid size-6 place-items-center rounded-md transition-colors ${
              active ? "bg-mutedbg text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
