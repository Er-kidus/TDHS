import Link from "next/link";

const protocols = [
  {
    title: "Red (Resuscitation)",
    actions: [
      "Immediate clinician escalation",
      "Airway, breathing, circulation first",
      "Prepare emergency transfer pathway",
    ],
  },
  {
    title: "Orange (Very Urgent)",
    actions: [
      "Fast-track to doctor review",
      "Capture full vitals within minutes",
      "Flag chest pain, dyspnea, altered consciousness",
    ],
  },
  {
    title: "Yellow (Urgent)",
    actions: [
      "Complete triage intake and route",
      "Monitor for deterioration",
      "Document risk factors and allergies",
    ],
  },
  {
    title: "Green (Standard)",
    actions: [
      "Routine triage and OPD flow",
      "Document baseline vitals",
      "Share guidance and follow-up instructions",
    ],
  },
];

export default function NurseTriageProtocolsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 p-4 md:p-6">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Nurse workspace</p>
        <h1 className="mt-1 text-xl font-semibold">Triage Protocols</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quick-reference escalation and routing guidance for triage staff.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/dashboard/nurse/triage" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">Back to board</Link>
          <Link href="/dashboard/nurse/triage/history" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">History</Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        {protocols.map((protocol) => (
          <article key={protocol.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">{protocol.title}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {protocol.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
