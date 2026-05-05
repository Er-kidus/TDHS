"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Heart } from "lucide-react";

const registrationPortalUrl = process.env.NEXT_PUBLIC_ORG_REGISTRATION_PORTAL_URL || "http://localhost:5200";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md medical-gradient flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Tenadam</span>
        </div>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </nav>

      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Registration moved</p>
          <h1 className="text-2xl font-semibold tracking-tight">Organization registration is now in a separate portal</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The registration form has been removed from this org portal. Use the dedicated registration portal to submit onboarding details.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={registrationPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Open registration portal
              <ExternalLink className="h-4 w-4" />
            </a>

            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              Return to login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}