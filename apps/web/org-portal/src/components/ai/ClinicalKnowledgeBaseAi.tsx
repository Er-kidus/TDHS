import { useState } from "react";
import { BookOpen, Search, Loader2, Lightbulb, Sparkles } from "lucide-react";

export function ClinicalKnowledgeBaseAi() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults("");

    try {
      const res = await fetch("/api/ai/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "clinical_knowledge_base",
          message: `Search clinical knowledge base for: ${query}. Use semantic search principles, reference guidelines, and standard RxCUI/ICD-10 where applicable.`,
        }),
      });
      if (!res.ok) throw new Error("Failed to search knowledge base");
      const data = await res.json();
      setResults(data.reply || "No relevant clinical guidelines found.");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-500/10 p-2">
          <BookOpen className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Clinical Knowledge Base AI</h2>
          <p className="text-xs text-muted-foreground">Search evidence-based guidelines and RxCUI references.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center rounded-xl border border-border bg-background px-3 py-1.5 focus-within:ring-2 focus-within:ring-violet-500/50">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symptoms, drugs, guidelines..."
            className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Ask AI
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {results && !loading && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-slate-800">AI Summary & References</p>
            </div>
            <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto pl-6">
              {results}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
