"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Heart, Moon, Sun, Globe } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = (await response.json()) as { error?: string; message?: string };
      return body?.error || body?.message || fallback;
    }

    const text = await response.text();
    if (text && !text.toLowerCase().includes("<!doctype")) {
      return text;
    }
  } catch {
    // Keep the original fallback when the response cannot be parsed.
  }
  return fallback;
}

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ GLOBAL STATE
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<"en" | "am">("en");

  // ✅ Load from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const storedLang = localStorage.getItem("lang");

    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
    }

    if (storedLang === "am" || storedLang === "en") {
      setLanguage(storedLang);
    }
  }, []);

  // ✅ Apply theme globally
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ✅ Save language
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  // ✅ TEXT COPY
  const copy = useMemo(() => {
    if (language === "am") {
      return {
        title: "መለያ ያስገቡ",
        email: "ኢሜይል",
        password: "የይለፍ ቃል",
        remember: "አስታውስኝ",
        forgot: "የይለፍ ቃል ረስተዋል?",
        signin: "ግባ",
        signing: "በመግባት ላይ...",
        noAccount: "መለያ የለዎትም?",
        create: "አዲስ መለያ ፍጠር",
      };
    }

    return {
      title: "Sign in  to continue",
      email: "Email",
      password: "Password",
      remember: "Remember me",
      forgot: "Forgot password?",
      signin: "Sign in",
      signing: "Signing in...",
      noAccount: "Don’t have an account?",
      create: "Create account",
    };
  }, [language]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setSubmitting(true);

    try {
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.status === 404) {
        const gatewayBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const directRes = await fetch(`${gatewayBase}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (directRes.ok) {
          const body = (await directRes.json().catch(() => ({}))) as { token?: string };
          if (body?.token) {
            document.cookie = `patient_token=${body.token}; path=/; SameSite=Lax`;
            router.push("/dashboard");
            router.refresh();
            return;
          }
        }

        res = directRes;
      }

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "Login failed"));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ✅ NAVBAR */}
      <nav className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md medical-gradient flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Tenadam</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 🌙 Theme */}
          <button
            onClick={() => setDarkMode((p) => !p)}
            className="h-8 w-8 border rounded-md flex items-center justify-center"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* 🌍 Language */}
          <button
            onClick={() => setLanguage((p) => (p === "en" ? "am" : "en"))}
            className="h-8 px-3 border rounded-md text-xs flex items-center gap-1"
          >
            <Globe size={14} />
            {language === "en" ? "አማርኛ" : "English"}
          </button>
        </div>
      </nav>

      {/* ✅ MAIN */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          <div>
            <h2 className="text-xl font-semibold">{copy.title}</h2>
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                {copy.remember}
              </label>

              <button type="button" className="text-primary hover:underline">
                {copy.forgot}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-primary text-white rounded-lg"
            >
              {submitting ? copy.signing : copy.signin}
            </button>
          </form>

          <div className="text-sm text-muted-foreground">
            {copy.noAccount}{" "}
            <Link href="/register" className="text-primary">
              {copy.create}
            </Link>
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
