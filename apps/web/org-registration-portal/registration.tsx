"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthFrame } from "./src/components/layout/AuthFrame";

/* ---------------- SCHEMA ---------------- */
const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/org/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Unable to create account");
      }

      setSuccess("Account created successfully. You can now sign in with these credentials.");
      form.reset();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame>
      <div className="flex justify-center py-10">
        <div className="w-full max-w-md space-y-6">

          <div>
            <h2 className="text-2xl font-semibold">Create Account</h2>
            <p className="text-sm text-muted-foreground">
              Create your organization account and sign in.
            </p>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Full Name" register={form.register("fullName")} />
              <Input label="Email" register={form.register("email")} />
              <div>
                <label className="text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full h-11 border rounded-lg px-3 mt-1 pr-10"
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

              <button className="w-full h-11 bg-primary text-white rounded-lg">
                {submitting ? "Creating..." : "Create account"}
              </button>
          </form>
        </div>
      </div>
    </AuthFrame>
  );
}

/* INPUT */
function Input({ label, register }: any) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input className="w-full h-11 border rounded-lg px-3 mt-1" {...register} />
    </div>
  );
}