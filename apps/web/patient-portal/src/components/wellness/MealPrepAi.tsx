import { useState } from "react";
import { Utensils, Loader2, Sparkles, AlertTriangle } from "lucide-react";

interface MealPrepAiProps {
  context: string;
}

export function MealPrepAi({ context }: MealPrepAiProps) {
  const [mealPlan, setMealPlan] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setMealPlan("");
    try {
      const res = await fetch("/api/ai/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "diet_assistant",
          message: `Generate a safe and healthy meal plan based on this context: ${context}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate meal plan");
      const data = await res.json();
      setMealPlan(data.reply || "No meal plan generated.");
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-orange-500/10 p-2">
          <Utensils className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">AI Meal Planner</h3>
          <p className="text-xs text-muted-foreground">Personalized nutrition based on your condition.</p>
        </div>
      </div>

      {!mealPlan && !loading && (
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 text-white px-4 py-2 text-sm font-medium hover:bg-orange-600 transition"
        >
          <Sparkles className="h-4 w-4" />
          Generate Plan
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <p className="text-xs text-muted-foreground animate-pulse">Creating your safe meal plan...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {mealPlan && !loading && (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="rounded-xl bg-secondary/50 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {mealPlan}
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
