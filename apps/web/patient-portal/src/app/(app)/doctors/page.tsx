import { fetchPatientResource } from "@/lib/serverApi";

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  rating: number;
  years_experience: number;
  available: boolean;
  online?: boolean;
};

export default async function PractionerPage() {
  const data = (await fetchPatientResource("/doctors?limit=50")) as Doctor[];
  const practitioners = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-300/80">Practioners</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Practioner Directory</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Browse all organization clinical staff registered as doctor or nurse, and check current online status.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {practitioners.length === 0 ? <p className="text-sm text-slate-400">No practitioners found.</p> : null}
        {practitioners.map((practitioner) => {
          const online = Boolean(practitioner.online ?? practitioner.available);
          return (
            <article key={practitioner.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white">{practitioner.full_name}</h3>
                <span className={"rounded-full px-2 py-1 text-[11px] font-medium " + (online ? "bg-emerald-400/20 text-emerald-300" : "bg-slate-500/20 text-slate-300")}>
                  {online ? "Online" : "Offline"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{practitioner.specialty || "General Practice"}</p>
              <p className="text-xs text-slate-400">{practitioner.location || "Organization"}</p>
              <p className="mt-2 text-xs text-slate-400">Rating: {practitioner.rating} • {practitioner.years_experience} years</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
