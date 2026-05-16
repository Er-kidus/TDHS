import { useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck, Sparkles } from "lucide-react";

interface MedSafeAiProps {
  medication: string;
  dosage: string;
  patientConditions?: string[];
  patientAllergies?: string[];
  isPregnant?: boolean;
}

export function MedSafeAi({
  medication,
  dosage,
  patientConditions = [],
  patientAllergies = [],
  isPregnant = false,
}: MedSafeAiProps) {
  const [safetyReport, setSafetyReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!medication) return;
    setLoading(true);
    setError("");
    setSafetyReport("");
    
    try {
      const res = await fetch("/api/ai/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "medsafe_check",
          message: `Check safety for medication: ${medication} (${dosage}). Patient conditions: ${patientConditions.join(", ") || "None"}. Allergies: ${patientAllergies.join(", ") || "None"}. Pregnant: ${isPregnant ? "Yes" : "No"}. Provide potential drug interactions, allergy warnings, and pregnancy safety rating.`,
        }),
      });
      if (!res.ok) throw new Error("Failed to run MedSafe check");
      const data = await res.json();
      setSafetyReport(data.reply || "No issues detected.");
    } catch (e: any) {
      setError(e.message || "An error occurred during safety check.");
    } finally {
      setLoading(false);
    }
  };

  if (!medication) return null;

  return (
    <div className="rounded-xl border border-sky-500/20 bg-sky-50 dark:bg-sky-950/10 p-4 space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-500" />
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">MedSafe AI Check</h4>
        </div>
        {!loading && !safetyReport && (
          <button
            type="button"
            onClick={handleCheck}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze Safety
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin text-sky-500" /> Checking interactions and contraindications...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded-lg">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {safetyReport && !loading && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="rounded-lg bg-white/60 dark:bg-slate-900/40 p-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-200/50 dark:border-slate-800/50 max-h-60 overflow-y-auto">
            {safetyReport}
          </div>
          <button
            type="button"
            onClick={handleCheck}
            className="mt-2 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" /> Re-analyze
          </button>
        </div>
      )}
    </div>
  );
}
