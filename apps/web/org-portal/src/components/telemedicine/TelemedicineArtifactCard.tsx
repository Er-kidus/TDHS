type TelemedicineArtifactCardProps = {
  sessionId: string;
  patientId: string;
  summary: string;
  diagnosis: string;
  followUpNeeded: boolean;
};

export function TelemedicineArtifactCard({
  sessionId,
  patientId,
  summary,
  diagnosis,
  followUpNeeded,
}: TelemedicineArtifactCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Consultation Artifact
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Session: {sessionId}
          </p>

          <p className="text-sm text-slate-400">
            Patient: {patientId}
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            followUpNeeded
              ? "bg-amber-500/15 text-amber-300"
              : "bg-emerald-500/15 text-emerald-300"
          }`}
        >
          {followUpNeeded ? "Follow-up" : "Completed"}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Summary
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {summary || "--"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Diagnosis
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {diagnosis || "--"}
          </p>
        </div>
      </div>
    </article>
  );
}