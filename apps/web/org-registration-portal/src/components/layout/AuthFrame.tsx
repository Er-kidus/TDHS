import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl medical-gradient text-white shadow-soft">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Tenadam</p>
              <p className="text-xs text-muted-foreground">Organization portal</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/login" className="rounded-lg px-3 py-1.5 hover:bg-muted">Login</Link>
            <Link to="/register" className="rounded-lg px-3 py-1.5 hover:bg-muted">Sign up</Link>
            <Link to="/request-access" className="rounded-lg px-3 py-1.5 hover:bg-muted">Request Access</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t bg-background/90">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span>Tenadam Digital Healthcare</span>
          <span>Secure organization onboarding</span>
        </div>
      </footer>
    </div>
  );
}
