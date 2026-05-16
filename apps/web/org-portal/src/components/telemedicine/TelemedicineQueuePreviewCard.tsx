type TelemedicineQueuePreviewCardProps = {
  index: number;
  patientName: string;
  patientId: string;
  mode: string;
  urgency?: string;
  specialty?: string;
  score?: number;
};

const URGENCY_COLORS: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  moderate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  urgent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  emergent: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export function TelemedicineQueuePreviewCard({
  index,
  patientName,
  patientId,
  mode,
  urgency,
  specialty,
  score,
}: TelemedicineQueuePreviewCardProps) {
  return (
    <div className="group rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 transition hover:border-cyan-400/30 hover:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-white">
            {patientName || patientId}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {mode}
            </p>
            {urgency && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${URGENCY_COLORS[urgency] || URGENCY_COLORS.low}`}>
                {urgency} {score ? `(${score})` : ''}
              </span>
            )}
          </div>
          {specialty && (
            <p className="mt-1.5 text-xs text-slate-300">
              <span className="font-medium text-slate-400">AI Match:</span> {specialty}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
          #{index + 1}
        </div>
      </div>
    </div>
  );
}