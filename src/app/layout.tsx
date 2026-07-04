import type { Metadata } from "next";
import { Inter, Fustat, DM_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ThemeProvider } from "@/components/ThemeProvider";

// Match mem0's dashboard: Inter (body), Fustat (headings), DM Mono (code).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fustat = Fustat({ subsets: ["latin"], variable: "--font-fustat", display: "swap" });
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thymus Console",
  description: "Trust & hygiene for AI agent memory — audit, quarantine, evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${fustat.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0">
              <TopBar />
              <main className="flex-1 min-w-0">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
