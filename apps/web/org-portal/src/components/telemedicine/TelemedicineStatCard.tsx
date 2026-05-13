type TelemedicineStatCardProps = {
  label: string;
  value: string;
  tone?: "neutral" | "accent" | "success";
};

const toneClassNames: Record<
  NonNullable<TelemedicineStatCardProps["tone"]>,
  string
> = {
  neutral:
    "border-white/10 bg-gradient-to-br from-slate-900 to-slate-950",
  accent:
    "border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-slate-950",
  success:
    "border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-slate-950",
};

export function TelemedicineStatCard({
  label,
  value,
  tone = "neutral",
}: TelemedicineStatCardProps) {
  return (
    <div
      className={`rounded-[28px] border p-5 shadow-2xl backdrop-blur-xl ${toneClassNames[tone]}`}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}