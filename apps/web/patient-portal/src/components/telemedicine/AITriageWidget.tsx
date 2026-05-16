"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Camera,
  Mic,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  Image as ImageIcon,
} from "lucide-react";

export type TriageResult = {
  urgency: "low" | "moderate" | "urgent" | "emergent";
  score: number;
  specialty: string;
  reasons: string[];
  suggestions: string[];
  imageAnalysis?: {
    detected_conditions: string[];
    recommended_specialty: string;
    confidence: number;
  };
};

interface Props {
  onComplete: (result: TriageResult, context: { symptoms: string; ageGroup: string; duration: string; severity: number }) => void;
  onSkip?: () => void;
}

const SEVERITY_LABELS = ["Very mild", "Mild", "Moderate", "Significant", "Severe", "Very severe", "Intense", "Extreme", "Unbearable", "Life-threatening"];
const AGE_GROUPS = ["Child (0–12)", "Teen (13–17)", "Adult (18–39)", "Middle-aged (40–59)", "Senior (60–74)", "Elderly (75+)"];
const DURATIONS = ["Just started (today)", "1–2 days", "3–7 days", "1–2 weeks", "More than 2 weeks", "Chronic (months+)"];

const URGENCY_CONFIG = {
  low:       { color: "bg-emerald-100 text-emerald-800 border-emerald-200",  badge: "bg-emerald-500", label: "Low Priority" },
  moderate:  { color: "bg-blue-100 text-blue-800 border-blue-200",           badge: "bg-blue-500",    label: "Moderate" },
  urgent:    { color: "bg-amber-100 text-amber-800 border-amber-200",        badge: "bg-amber-500",   label: "Urgent" },
  emergent:  { color: "bg-red-100 text-red-800 border-red-200",             badge: "bg-red-500",     label: "Emergent" },
};

export function AITriageWidget({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(3);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const STEPS = ["Symptoms", "About You", "Severity", "Photo (Optional)", "Results"];

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setError("Camera access denied. Please upload an image instead.");
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImagePreview(dataUrl);
    setImageBase64(dataUrl.split(",")[1]);
    setImageType("image/jpeg");
    stopCamera();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
      setImageType(file.type);
    };
    reader.readAsDataURL(file);
  }

  async function runTriage() {
    if (!symptoms.trim()) { setError("Please describe your symptoms."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai-symptom-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, ageGroup, duration, severity, imageBase64, imageType }),
      });
      const data = await res.json() as TriageResult & { error?: string };
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setStep(4);
      onComplete(data, { symptoms, ageGroup, duration, severity });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyse symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canProceed = [
    symptoms.trim().length > 3,
    !!ageGroup,
    true,
    true,
  ][step] ?? true;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      {/* Step indicator */}
      <div className="border-b border-border bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`ml-1.5 hidden text-xs font-medium sm:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-px w-6 sm:w-10 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Step 0: Symptoms */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">What's bothering you today?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us in your own words — no medical terms needed. The more detail, the better.
              </p>
            </div>
            <textarea
              autoFocus
              rows={4}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="e.g. I have a fever and my chest hurts when I breathe. It started two days ago and is getting worse..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {["Headache", "Fever", "Chest pain", "Cough", "Shortness of breath", "Nausea", "Fatigue", "Rash", "Back pain", "Abdominal pain"].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymptoms(p => p ? `${p}, ${s.toLowerCase()}` : s.toLowerCase())}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: About You */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">A little about you</h2>
              <p className="mt-1 text-sm text-muted-foreground">This helps us understand the right level of care you may need.</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Age group</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {AGE_GROUPS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAgeGroup(a)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${ageGroup === a ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/40"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">How long have you had these symptoms?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`rounded-xl border px-4 py-3 text-xs font-medium transition ${duration === d ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/40"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Severity */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">How severe are your symptoms?</h2>
              <p className="mt-1 text-sm text-muted-foreground">On a scale of 1–10, with 10 being the worst.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">1 — Very mild</span>
                <span className="text-sm text-muted-foreground">10 — Severe</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={e => setSeverity(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="rounded-xl border border-border bg-background p-4 text-center">
                <p className="text-4xl font-bold text-foreground">{severity}</p>
                <p className={`mt-1 text-sm font-medium ${severity >= 8 ? "text-red-600" : severity >= 5 ? "text-amber-600" : "text-emerald-600"}`}>
                  {SEVERITY_LABELS[severity - 1]}
                </p>
              </div>
              {severity >= 8 && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  For life-threatening emergencies, please call emergency services (911 or local emergency number) immediately.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Photo */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Share a photo (optional)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                If you have a visible symptom like a rash, swelling, or eye redness, a photo can help our AI provide better guidance.
              </p>
            </div>

            {!cameraOpen && !imagePreview && (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-6 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <Upload className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Upload from device</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void openCamera()}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-6 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <Camera className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Use camera</p>
                    <p className="text-xs text-muted-foreground">Take a photo directly</p>
                  </div>
                </button>
              </div>
            )}

            {cameraOpen && (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-border bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full" />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    📸 Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted/40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {imagePreview && (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Symptom photo" className="max-h-64 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white backdrop-blur transition hover:bg-slate-900/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Photo attached — AI will analyze for visible symptoms.
                </div>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

            <p className="text-xs text-muted-foreground">
              🔒 Your photo is processed securely and not stored beyond this session. The AI will never make a medical diagnosis — it assists with symptom understanding only.
            </p>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">AI Assessment Complete</h2>
                <p className="text-sm text-muted-foreground">Based on your symptoms and information</p>
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${URGENCY_CONFIG[result.urgency].color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Priority Level</p>
                  <p className="mt-0.5 text-xl font-bold">{URGENCY_CONFIG[result.urgency].label}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${URGENCY_CONFIG[result.urgency].badge} text-white`}>
                  <span className="text-lg font-bold">{result.score}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended Specialist</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{result.specialty}</p>
            </div>

            {result.imageAnalysis && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <ImageIcon className="h-3.5 w-3.5" /> Visual Symptom Analysis
                </p>
                <p className="text-sm text-foreground">
                  Detected: {result.imageAnalysis.detected_conditions.join(", ") || "No specific visual conditions detected"}
                </p>
                {result.imageAnalysis.recommended_specialty && (
                  <p className="text-sm text-muted-foreground">
                    Suggested specialist: <span className="font-medium text-foreground">{result.imageAnalysis.recommended_specialty}</span>
                  </p>
                )}
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Recommendations</p>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              ⚕️ This AI assessment is a guide only — not a medical diagnosis. A qualified healthcare professional will review and determine the appropriate care for you.
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Analysing your symptoms...</p>
              <p className="text-xs text-muted-foreground mt-1">This takes a few seconds</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Navigation */}
        {!loading && step < 4 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted/40"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              {onSkip && step === 0 && (
                <button type="button" onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition underline underline-offset-4">
                  Skip — browse all doctors
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => {
                if (step < 3) { setStep(s => s + 1); }
                else { void runTriage(); }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              {step === 3 ? (
                <><Sparkles className="h-4 w-4" /> Analyze & Find Doctor</>
              ) : (
                <>Continue <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
