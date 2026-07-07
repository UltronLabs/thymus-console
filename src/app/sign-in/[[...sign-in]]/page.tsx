"use client";

import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn
        appearance={{
          elements: { rootBox: "w-full flex justify-center", card: "shadow-none" },
        }}
      />
    </AuthShell>
  );
}
