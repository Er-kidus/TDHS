"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Globe, Heart, Moon, Sun } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = useMemo(() => search.get("next") ?? "/dashboard", [search]);
  const registrationPortalUrl = process.env.NEXT_PUBLIC_ORG_REGISTRATION_PORTAL_URL || "http://localhost:5200";

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [darkMode, setDarkMode] = useState(false);

  

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const copy = useMemo(() => {
    if (language === "am") {
      return {
        title: "የሰራተኞች መግቢያ",
        subtitle: "በድርጅትዎ መለያ ይግቡ።",
        email: "ኢሜይል",
        password: "የይለፍ ቃል",
        signIn: "ግባ",
        signing: "በመግባት ላይ...",
        request: "የድርጅት ምዝገባ ይጠይቁ",
        needAccount: "መለያ ያስፈልግዎታል?",
      };
    }
    return {
      title: "Staff sign in",
      subtitle: "Use your organization credentials to continue.",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      signing: "Signing in...",
      request: "Request organization onboarding",
      needAccount: "Need an account?",
    };
  }, [language]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  async function onSubmit(values: FormValues) {
    setError(null);

    async function readErrorMessage(response: Response) {
      let errorMessage = "Login failed";
      try {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = (await response.json()) as { error?: string; message?: string };
          errorMessage = body?.error || body?.message || errorMessage;
        } else {
          const text = await response.text();
          if (text && !text.toLowerCase().includes("<!doctype")) {
            errorMessage = text;
          }
        }
      } catch {
        // Keep default message if response is not parseable.
      }
      return errorMessage;
    }

    let res = await fetch("/api/org/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const errorMessage = await readErrorMessage(res);
      setError(errorMessage);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ✅ NAVBAR PLACEHOLDER */}
      <nav className="w-full h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md medical-gradient flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Tenadam</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setDarkMode((p) => !p)}
            className="h-8 w-8 border rounded-md flex items-center justify-center"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLanguage((p) => (p === "en" ? "am" : "en"))}
            className="h-8 px-3 border rounded-md text-xs flex items-center gap-1"
          >
            <Globe className="h-3.5 w-3.5" />
            {language === "en" ? "አማርኛ" : "English"}
          </button>
        </div>
      </nav>

      {/* ✅ MAIN LOGIN */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          <div>
            <h2 className="text-xl font-semibold">{copy.title}</h2>
            <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
          </div>

          {error && (
            <div className="text-sm text-destructive border p-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="text-sm">{copy.email}</label>
              <input
                type="email"
                className="w-full h-11 border rounded-lg px-3 mt-1"
                {...form.register("email")}
              />
            </div>

            <div>
              <label className="text-sm">{copy.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-11 border rounded-lg px-3 pr-10 mt-1"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              className="w-full h-11 bg-primary text-white rounded-lg"
            >
              {form.formState.isSubmitting ? copy.signing : copy.signIn}
            </button>
          </form>

          <div className="text-sm text-muted-foreground">
            {copy.needAccount}{" "}
            <a href={registrationPortalUrl} target="_blank" rel="noreferrer" className="text-primary">
              {copy.request}
            </a>
          </div>
        </motion.div>
      </div>

      {/* ✅ FOOTER */}
      <footer className="h-12 border-t flex items-center justify-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tenadam Health Technologies
      </footer>
    </div>
  );
}