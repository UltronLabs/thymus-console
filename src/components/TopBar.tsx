"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function TopBar() {
  const { resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <OrganizationSwitcher
        hidePersonal={false}
        afterCreateOrganizationUrl="/"
        afterSelectOrganizationUrl="/"
        afterSelectPersonalUrl="/"
        appearance={{
          baseTheme: resolvedTheme === "dark" ? dark : undefined,
          elements: {
            rootBox: "flex items-center",
            organizationSwitcherTrigger:
              "rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground/90 hover:bg-mutedbg transition-colors",
          },
        }}
      />

      <a
        href="https://github.com/UltronLabs/Thymus"
        target="_blank"
        className="text-xs text-muted hover:text-foreground"
      >
        Docs
      </a>
    </header>
  );
}
