type TelemedicinePractitionerCardProps = {
  fullName: string;
  specialty?: string;
  role: string;
  active: boolean;
  email?: string;
};

export function TelemedicinePractitionerCard({
  fullName,
  specialty,
  role,
  active,
  email,
}: TelemedicinePractitionerCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold text-white">
            {fullName}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {specialty || "General"} • {role}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {email || "no-email"}
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            active
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-slate-500/15 text-slate-400"
          }`}
        >
          {active ? "Online" : "Offline"}
        </div>
      </div>
    </article>
  );
}