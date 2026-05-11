import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-soft">
            Loading…
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
