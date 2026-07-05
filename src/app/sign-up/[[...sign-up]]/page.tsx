"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import AuthShell from "@/components/AuthShell";

export default function SignUpPage() {
  const { resolvedTheme } = useTheme();
  return (
    <AuthShell>
      <SignUp
        appearance={{
          baseTheme: resolvedTheme === "dark" ? dark : undefined,
          elements: { rootBox: "w-full flex justify-center", card: "shadow-none" },
        }}
      />
    </AuthShell>
  );
}
