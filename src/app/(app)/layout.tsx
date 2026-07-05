import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

// Chrome for the authenticated app. Route protection is enforced by src/proxy.ts
// (Clerk middleware); this layout just provides the shell.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
