import { useState } from "react";
import { Brain, Loader2, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface AiTriageEvaluatorProps {
  symptoms: string;
  chiefComplaint: string;
  ageYears?: string;
  chronicConditions?: string;
  knownAllergies?: string;
  vitals?: {
    heartRate?: string;
    systolicBp?: string;
    diastolicBp?: string;
    oxygenSaturation?: string;
    temperatureC?: string;
    respiratoryRate?: string;
    painScore?: string;
  };
  onAiSuggestion?: (suggestion: { severity?: string; recommendation?: string; flags?: string[] }) => void;
}

export function AiTriageEvaluator({
  symptoms,
  chiefComplaint,
  ageYears,
  chronicConditions,
  knownAllergies,
  vitals = {},
  onAiSuggestion,
}: AiTriageEvaluatorProps) {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [ran, setRan] = useState(false);

  const handleEvaluate = async () => {
    if (!symptoms && !chiefComplaint) return;
    setLoading(true);
    setError("");
    setReport("");

    const vitalsStr = [
      vitals.heartRate && `HR: ${vitals.heartRate} bpm`,
      vitals.respiratoryRate && `RR: ${vitals.respiratoryRate}/min`,
      vitals.oxygenSaturation && `SpO2: ${vitals.oxygenSaturation}%`,
      vitals.temperatureC && `Temp: ${vitals.temperatureC}°C`,
      (vitals.systolicBp || vitals.diastolicBp) && `BP: ${vitals.systolicBp || "-"}/${vitals.diastolicBp || "-"} mmHg`,
      vitals.painScore && `Pain: ${vitals.painScore}/10`,
    ].filter(Boolean).join(", ") || "Not recorded";

    const prompt = `You are a clinical triage AI assistant. Evaluate this patient's triage data and provide a structured assessment.

Chief Complaint: ${chiefComplaint || "Not documented"}
Symptoms: ${symptoms || "Not documented"}
Age: ${ageYears ? `${ageYears} years` : "Not recorded"}
Chronic Conditions: ${chronicConditions || "None"}
Known Allergies: ${knownAllergies || "None"}
Vital Signs: ${vitalsStr}

Provide a structured triage evaluation:
1. SEVERITY LEVEL: (Green/Yellow/Orange/Red) with brief justification
2. RED FLAGS IDENTIFIED: List any concerning symptoms or vital sign abnormalities
3. RECOMMENDED ACTION: (Self-care / Standard review / Urgent review / Immediate emergency)
4. CLINICAL SUGGESTIONS: 2-3 specific clinical actions the nurse should take now
5. ESCALATION TRIGGERS: Conditions that would require immediate upgrade of triage level

Be concise (under 250 words). Use clinical language. Flag critical findings prominently.`;

    try {
      const res = await fetch("/api/ai/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "triage_evaluator", message: prompt }),
      });
      if (!res.ok) throw new Error(`AI service error (${res.status})`);
      const data = await res.json() as { reply?: string; error?: string };
      if (data.error) throw new Error(data.error);
      setReport(data.reply || "No evaluation returned.");
      setRan(true);

      // Try to extract severity and pass back to parent
      if (onAiSuggestion) {
        const text = data.reply || "";
        const redMatch = /\bRed\b/i.test(text);
        const orangeMatch = /\bOrange\b/i.test(text);
        const yellowMatch = /\bYellow\b/i.test(text);
        const severity = redMatch ? "Red" : orangeMatch ? "Orange" : yellowMatch ? "Yellow" : "Green";
        onAiSuggestion({ severity });
      }
    } catch (e: any) {
      setError(e.message || "Failed to run AI triage evaluation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-400/20 bg-violet-50/60 dark:bg-violet-950/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-violet-500/10">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            AI Triage Evaluator
          </span>
          {ran && (
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">
              Evaluated
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={!symptoms && !chiefComplaint}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-40 transition"
            >
              <Sparkles className="h-3 w-3" />
              {ran ? "Re-evaluate" : "Evaluate"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1.5 hover:bg-violet-500/10 transition"
          >
            {expanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {!symptoms && !chiefComplaint && (
            <p className="text-xs text-muted-foreground">
              Enter symptoms and chief complaint above, then click Evaluate to run AI triage assessment.
            </p>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              Running AI triage evaluation...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {report && !loading && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="rounded-lg bg-white/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 p-3">
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 mb-2 flex items-center gap-1">
                  <Brain className="h-3.5 w-3.5" /> AI Assessment
                </p>
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {report}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                AI assessment is advisory only. Clinical judgment takes precedence. Not for emergency use without physician oversight.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
