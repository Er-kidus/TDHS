import { Download, Share2 } from "lucide-react";

const timeline = [
  { date: "2026-04-01", title: "Follow-up Visit", type: "Visit Summary", detail: "Blood pressure stable. Continue current plan." },
  { date: "2026-03-25", title: "Lipid Panel", type: "Lab Report", detail: "LDL slightly elevated; lifestyle advice provided." },
  { date: "2026-03-10", title: "Initial Consultation", type: "Diagnosis", detail: "Primary hypertension diagnosed." },
];

export default function MedicalRecordsPage() {
  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Medical Records</h1>
        <p className="text-sm text-muted-foreground mt-1">Patient history timeline, diagnoses, and visit documents.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Filter by keyword" />
          <select aria-label="Filter record type" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option>All record types</option>
            <option>Diagnosis</option>
            <option>Procedure</option>
            <option>Visit Summary</option>
            <option>Lab Report</option>
          </select>
          <input aria-label="Filter by record date" type="date" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="space-y-3">
          {timeline.map((entry) => (
            <article key={entry.date + entry.title} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{entry.date} • {entry.type}</p>
                  <h3 className="font-semibold mt-1">{entry.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" /> PDF</button>
                  <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent inline-flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> Share</button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{entry.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
