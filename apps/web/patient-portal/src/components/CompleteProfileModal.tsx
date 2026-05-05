"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  gender: z.string().min(1),
  birthDate: z.string().min(1),
  address: z.string().min(1),
  maritalStatus: z.string().min(1),
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(1),
  preferredLanguage: z.string().min(1),
});

type Values = z.infer<typeof schema>;

export function CompleteProfileModal({ open }: { open: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: "",
      birthDate: "",
      address: "",
      maritalStatus: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      preferredLanguage: "",
    },
  });

  async function onSubmit(values: Values) {
    setError(null);
    setSaving(true);
    try {
      const patch = {
        gender: values.gender,
        birthDate: values.birthDate,
        address: [{ text: values.address }],
        maritalStatus: { text: values.maritalStatus },
        contact: [
          {
            name: { text: values.emergencyContactName },
            telecom: [{ system: "phone", value: values.emergencyContactPhone }],
          },
        ],
        communication: [{ language: { text: values.preferredLanguage } }],
      };

      const res = await fetch("/api/patients/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: patch }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to save profile");
      }

      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70 sm:p-8"
          >
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Complete your profile
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              A few details help personalize your care experience.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Gender</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur focus:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
                    {...form.register("gender")}
                  >
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Birth date</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur focus:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
                    {...form.register("birthDate")}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Address</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur focus:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
                  {...form.register("address")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Marital status</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur focus:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
                    {...form.register("maritalStatus")}
                  >
                    <option value="">Select…</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Preferred language</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur focus:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
                    placeholder="e.g. English"
                    {...form.register("preferredLanguage")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Emergency contact</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur focus:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
                    placeholder="Full name"
                    {...form.register("emergencyContactName")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Emergency phone</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none backdrop-blur focus:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
                    placeholder="Phone number"
                    {...form.register("emergencyContactPhone")}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 dark:bg-white dark:text-zinc-900"
              >
                {saving ? "Saving…" : "Save & continue"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
