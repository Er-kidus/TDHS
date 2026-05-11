"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { usePortalPreferences } from "./src/components/layout/PortalPreferences";
import { setOrgAuthToken } from "./src/lib/orgApplicationApi";
import { AuthFrame } from "./src/components/layout/AuthFrame";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginClient() {
  const { language } = usePortalPreferences();
  const next = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";
    const search = new URLSearchParams(window.location.search);
    return search.get("next") ?? "/dashboard";
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      title: "sign in",
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

    const res = await fetch("/org/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }),
    });

    const body = (await res.json().catch(() => null)) as { error?: string; message?: string; token?: string } | null;

    if (!res.ok) {
      const errorMessage = body?.error || body?.message || "Login failed";
      setError(errorMessage);
      return;
    }

    if (body?.token) {
      setOrgAuthToken(body.token);
    }

    if (typeof window !== "undefined") {
      window.location.assign(next);
    }
  }

  return (
    <AuthFrame>
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-sm space-y-6">
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
            <a href="/register" className="text-primary">{copy.request}</a>
          </div>
      </div>
    </div>
    </AuthFrame>
  );
}