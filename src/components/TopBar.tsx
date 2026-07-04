import { ChevronsUpDown, FolderClosed } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <button className="inline-flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground/90 hover:bg-mutedbg transition-colors">
        <FolderClosed className="size-4 text-muted" />
        default-project
        <ChevronsUpDown className="size-3.5 text-muted" />
      </button>

      <div className="flex items-center gap-3">
        <a
          href="https://github.com/UltronLabs/Thymus"
          target="_blank"
          className="hidden sm:inline text-xs text-muted hover:text-foreground"
        >
          Docs
        </a>
        <ThemeToggle />
        <div className="size-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600" />
      </div>
    </header>
  );
}
