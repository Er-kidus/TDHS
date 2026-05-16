import { useState } from "react";
import { Activity, Loader2, Sparkles, AlertTriangle } from "lucide-react";

interface ExerciseAiProps {
  context: string;
}

export function ExerciseAi({ context }: ExerciseAiProps) {
  const [exercisePlan, setExercisePlan] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setExercisePlan("");
    try {
      const res = await fetch("/api/ai/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "health_recommender",
          message: `Generate a safe and healthy exercise routine based on this context: ${context}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate exercise plan");
      const data = await res.json();
      setExercisePlan(data.reply || "No exercise plan generated.");
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-teal-500/10 p-2">
          <Activity className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">AI Exercise Planner</h3>
          <p className="text-xs text-muted-foreground">Safe physical activities tailored to you.</p>
        </div>
      </div>

      {!exercisePlan && !loading && (
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 text-white px-4 py-2 text-sm font-medium hover:bg-teal-600 transition"
        >
          <Sparkles className="h-4 w-4" />
          Generate Routine
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          <p className="text-xs text-muted-foreground animate-pulse">Creating your safe exercise plan...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {exercisePlan && !loading && (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="rounded-xl bg-secondary/50 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {exercisePlan}
          </div>
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
          >
            <Sparkles className="h-4 w-4" />
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
