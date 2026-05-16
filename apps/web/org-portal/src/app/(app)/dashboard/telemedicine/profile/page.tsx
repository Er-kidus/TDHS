"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Globe2,
  ShieldCheck,
  Clock,
  Star,
  Languages,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Award,
  Zap,
} from "lucide-react";

type TelemedicineProfile = {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  telemedicine_enabled: boolean;
  telemedicine_specialty?: string;
  telemedicine_rate?: number;
  telemedicine_currency?: string;
  telemedicine_modes?: string[];
  sub_specialty?: string;
  years_experience?: number;
  languages_spoken?: string[];
  online_status?: string;
  session_capacity?: number;
  availability_schedule?: Record<string, { am: boolean; pm: boolean }>;
  certifications?: string[];
  areas_of_expertise?: string[];
  emergency_support?: boolean;
  consultation_types?: string[];
  profile_completeness?: number;
};

type ApiPayload = Record<string, unknown> | string | null;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "am", label: "Amharic (አማርኛ)" },
  { code: "om", label: "Oromo (Afaan Oromoo)" },
  { code: "so", label: "Somali (Soomaali)" },
  { code: "ti", label: "Tigrinya (ትግርኛ)" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "fr", label: "French (Français)" },
];
const SPECIALTIES = [
  "General Practice", "Internal Medicine", "Pediatrics", "Cardiology",
  "Dermatology", "Psychiatry / Mental Health", "Obstetrics & Gynecology",
  "Orthopedics", "Neurology", "Oncology", "Emergency Medicine",
  "Family Medicine", "Infectious Diseases", "Endocrinology", "Urology",
  "Ophthalmology", "ENT (Ear, Nose & Throat)", "Pulmonology",
  "Gastroenterology", "Nephrology", "Other",
];

async function readJsonResponse(response: Response): Promise<ApiPayload> {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text) as ApiPayload; }
  catch { return text; }
}

function getErrorMessage(payload: ApiPayload, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload.error;
    if (typeof error === "string" && error.trim()) return error;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return fallback;
}

function computeCompleteness(fields: {
  telemedicineEnabled: boolean;
  specialty: string;
  subSpecialty: string;
  yearsExp: string;
  languages: string[];
  modes: string[];
  capacity: string;
  certifications: string;
  expertise: string;
}): number {
  let score = 0;
  if (fields.telemedicineEnabled) score += 15;
  if (fields.specialty) score += 20;
  if (fields.subSpecialty) score += 10;
  if (fields.yearsExp && Number(fields.yearsExp) > 0) score += 10;
  if (fields.languages.length > 0) score += 10;
  if (fields.modes.length > 0) score += 10;
  if (fields.capacity) score += 5;
  if (fields.certifications.trim()) score += 10;
  if (fields.expertise.trim()) score += 10;
  return Math.min(100, score);
}

export default function TelemedicineProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState<TelemedicineProfile | null>(null);

  // Core fields
  const [telemedicineEnabled, setTelemedicineEnabled] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<"online" | "busy" | "offline">("offline");
  const [specialty, setSpecialty] = useState("");
  const [subSpecialty, setSubSpecialty] = useState("");
  const [telemedicineRate, setTelemedicineRate] = useState("");
  const [telemedicineCurrency, setTelemedicineCurrency] = useState("ETB");
  const [telemedicineModes, setTelemedicineModes] = useState<string[]>(["video", "voice", "chat"]);

  // Enhanced fields
  const [yearsExp, setYearsExp] = useState("");
  const [languages, setLanguages] = useState<string[]>(["en"]);
  const [sessionCapacity, setSessionCapacity] = useState("1");
  const [certifications, setCertifications] = useState("");
  const [expertise, setExpertise] = useState("");
  const [emergencySupport, setEmergencySupport] = useState(false);
  const [availSchedule, setAvailSchedule] = useState<Record<string, { am: boolean; pm: boolean }>>(
    Object.fromEntries(DAYS.map(d => [d, { am: false, pm: false }]))
  );

  const completeness = computeCompleteness({
    telemedicineEnabled, specialty, subSpecialty, yearsExp, languages,
    modes: telemedicineModes, capacity: sessionCapacity, certifications, expertise,
  });

  useEffect(() => { void loadProfile(); }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/org/me/telemedicine", { cache: "no-store" });
      const payload = await readJsonResponse(res);
      if (!res.ok) throw new Error(getErrorMessage(payload, "Unable to load profile"));
      const item = (payload || {}) as TelemedicineProfile;
      setProfile(item);
      setTelemedicineEnabled(Boolean(item.telemedicine_enabled));
      setOnlineStatus((item.online_status as "online" | "busy" | "offline") || "offline");
      setSpecialty(item.telemedicine_specialty || "");
      setSubSpecialty(item.sub_specialty || "");
      setTelemedicineRate(item.telemedicine_rate ? String(item.telemedicine_rate) : "");
      setTelemedicineCurrency(item.telemedicine_currency || "ETB");
      setTelemedicineModes(item.telemedicine_modes?.length ? item.telemedicine_modes : ["video", "voice", "chat"]);
      setYearsExp(item.years_experience ? String(item.years_experience) : "");
      setLanguages(item.languages_spoken?.length ? item.languages_spoken : ["en"]);
      setSessionCapacity(item.session_capacity ? String(item.session_capacity) : "1");
      setCertifications(item.certifications?.join("\n") || "");
      setExpertise(item.areas_of_expertise?.join(", ") || "");
      setEmergencySupport(Boolean(item.emergency_support));
      if (item.availability_schedule && Object.keys(item.availability_schedule).length > 0) {
        setAvailSchedule(item.availability_schedule as Record<string, { am: boolean; pm: boolean }>);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load profile");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode(mode: string) {
    setTelemedicineModes(cur => {
      if (cur.includes(mode)) {
        const next = cur.filter(m => m !== mode);
        return next.length > 0 ? next : cur;
      }
      return [...cur, mode];
    });
  }

  function toggleLanguage(code: string) {
    setLanguages(cur =>
      cur.includes(code) ? (cur.length > 1 ? cur.filter(l => l !== code) : cur) : [...cur, code]
    );
  }

  function toggleSchedule(day: string, period: "am" | "pm") {
    setAvailSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [period]: !prev[day]?.[period] },
    }));
  }

  async function saveProfile() {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/org/me/telemedicine", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telemedicine_enabled: telemedicineEnabled,
          online_status: onlineStatus,
          telemedicine_specialty: specialty.trim(),
          sub_specialty: subSpecialty.trim(),
          telemedicine_rate: Number(telemedicineRate) || 0,
          telemedicine_currency: telemedicineCurrency.trim().toUpperCase(),
          telemedicine_modes: telemedicineModes,
          years_experience: Number(yearsExp) || 0,
          languages_spoken: languages,
          session_capacity: Number(sessionCapacity) || 1,
          certifications: certifications.split("\n").map(s => s.trim()).filter(Boolean),
          areas_of_expertise: expertise.split(",").map(s => s.trim()).filter(Boolean),
          emergency_support: emergencySupport,
          availability_schedule: availSchedule,
          profile_completeness: completeness,
        }),
      });
      const payload = await readJsonResponse(res);
      if (!res.ok) throw new Error(getErrorMessage(payload, "Unable to update profile"));
      setStatus("Profile saved successfully.");
      await loadProfile();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  }

  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    busy: "bg-amber-500",
    offline: "bg-slate-400",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      {/* Header */}
      <header className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
              <Stethoscope className="h-3.5 w-3.5" />
              Telemedicine Profile
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{profile?.full_name || "Your Profile"}</h1>
            <p className="text-sm text-muted-foreground">
              Configure your telemedicine identity so the AI can match you with the right patients.
            </p>
          </div>
          {/* Completeness ring */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${completeness * 3.6}deg, hsl(var(--muted)) 0deg)`,
              }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card">
                <span className="text-lg font-bold">{completeness}%</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Profile Complete</span>
            {completeness < 70 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                <AlertCircle className="h-3 w-3" /> Below 70% — AI matching may be limited
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Status messages */}
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      {status && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {status}
        </p>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Section 1: Availability & Status */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" /> Availability & Status
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Telemedicine Toggle */}
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Telemedicine Active</p>
                    <p className="text-xs text-muted-foreground">Enable yourself for patient matching</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTelemedicineEnabled(v => !v)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${telemedicineEnabled ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${telemedicineEnabled ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* Online Status */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-2 text-sm font-medium">Online Status</p>
                <div className="flex gap-2">
                  {(["online", "busy", "offline"] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setOnlineStatus(s)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${onlineStatus === s ? "bg-primary text-primary-foreground" : "border border-border bg-background hover:bg-muted/40"}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${statusColors[s]}`} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Capacity */}
              <div className="rounded-xl border border-border bg-background p-4">
                <label className="mb-1.5 block text-sm font-medium">Max Simultaneous Sessions</label>
                <select
                  value={sessionCapacity}
                  onChange={e => setSessionCapacity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? "session" : "sessions"}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Emergency Support */}
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-4">
              <input
                type="checkbox"
                id="emergency-support"
                checked={emergencySupport}
                onChange={e => setEmergencySupport(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <div>
                <label htmlFor="emergency-support" className="text-sm font-medium cursor-pointer">
                  Available for Emergency Consultations
                </label>
                <p className="text-xs text-muted-foreground">
                  Patients with urgent/emergent triage scores will be able to reach you first.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Specialty & Expertise */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Award className="h-4 w-4 text-primary" /> Specialty & Expertise
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Primary Specialty *</label>
                <select
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="">Select specialty...</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Sub-Specialty</label>
                <input
                  value={subSpecialty}
                  onChange={e => setSubSpecialty(e.target.value)}
                  placeholder="e.g. Pediatric Cardiology, Sports Medicine"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Years of Experience *</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={yearsExp}
                  onChange={e => setYearsExp(e.target.value)}
                  placeholder="e.g. 8"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Consultation Rate</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={telemedicineRate}
                    onChange={e => setTelemedicineRate(e.target.value)}
                    placeholder="0"
                    className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
                  />
                  <input
                    value={telemedicineCurrency}
                    onChange={e => setTelemedicineCurrency(e.target.value.toUpperCase())}
                    placeholder="ETB"
                    maxLength={4}
                    className="h-10 w-20 rounded-lg border border-border bg-background px-3 text-sm text-center"
                  />
                </div>
              </div>
            </div>

            {/* Areas of Expertise */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Areas of Expertise <span className="text-muted-foreground/60">(comma-separated)</span>
              </label>
              <input
                value={expertise}
                onChange={e => setExpertise(e.target.value)}
                placeholder="e.g. Hypertension, Diabetes Management, Maternal Care"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>

            {/* Certifications */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Certifications & Qualifications <span className="text-muted-foreground/60">(one per line)</span>
              </label>
              <textarea
                rows={3}
                value={certifications}
                onChange={e => setCertifications(e.target.value)}
                placeholder={"MD — Addis Ababa University\nBoard Certified Cardiologist\nAdvanced Cardiac Life Support (ACLS)"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
          </section>

          {/* Section 3: Consultation Modes & Languages */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Globe2 className="h-4 w-4 text-primary" /> Consultation Modes & Languages
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Supported Consultation Modes *</p>
                <div className="flex flex-wrap gap-2">
                  {(["video", "voice", "chat"] as const).map(mode => (
                    <label
                      key={mode}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        telemedicineModes.includes(mode)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={telemedicineModes.includes(mode)}
                        onChange={() => toggleMode(mode)}
                        className="sr-only"
                      />
                      {mode === "video" ? "📹" : mode === "voice" ? "🎙️" : "💬"}
                      <span className="capitalize">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Languages Spoken *</p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <label
                      key={lang.code}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                        languages.includes(lang.code)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={languages.includes(lang.code)}
                        onChange={() => toggleLanguage(lang.code)}
                        className="sr-only"
                      />
                      {lang.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Availability Schedule */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" /> Weekly Availability Schedule
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground">Day</th>
                    <th className="pb-2 px-4 text-center text-xs font-medium text-muted-foreground">Morning (AM)</th>
                    <th className="pb-2 px-4 text-center text-xs font-medium text-muted-foreground">Afternoon (PM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DAYS.map(day => (
                    <tr key={day}>
                      <td className="py-2 pr-4 font-medium">{day}</td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={availSchedule[day]?.am || false}
                          onChange={() => toggleSchedule(day, "am")}
                          className="h-4 w-4 accent-primary"
                        />
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={availSchedule[day]?.pm || false}
                          onChange={() => toggleSchedule(day, "pm")}
                          className="h-4 w-4 accent-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex flex-wrap gap-3 pb-6">
            <button
              onClick={() => void saveProfile()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Saving...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> Save Telemedicine Profile</>
              )}
            </button>
            <button
              onClick={() => void loadProfile()}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted/40"
            >
              Refresh
            </button>

            {/* Completeness warning */}
            {completeness < 70 && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Complete at least 70% of your profile to be visible to AI-matched patients.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
