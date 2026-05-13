type TelemedicineQueuePreviewCardProps = {
  index: number;
  patientName: string;
  patientId: string;
  mode: string;
};

export function TelemedicineQueuePreviewCard({
  index,
  patientName,
  patientId,
  mode,
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

            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              {mode}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
          #{index + 1}
        </div>
      </div>
    </div>
  );
}