import { fetchPatientResource } from "@/lib/serverApi";

type Artifact = {
  id: string;
  session_id: string;
  summary: string;
  final_diagnosis: string;
  recording_url?: string;
  transcript_url?: string;
};

export default async function SessionRecordingsPage() {
  const data = (await fetchPatientResource("/telemedicine/artifacts?limit=100")) as Artifact[];
  const artifacts = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Session Recordings</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {artifacts.length === 0 ? <p className="text-sm text-muted-foreground">No recordings available.</p> : null}
        {artifacts.map((a) => (
          <article key={a.id} className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Session: {a.session_id}</p>
            <p className="text-sm mt-1"><span className="font-medium">Summary:</span> {a.summary || "--"}</p>
            <p className="text-sm mt-1"><span className="font-medium">Final diagnosis:</span> {a.final_diagnosis || "--"}</p>
            <div className="mt-2 flex gap-3 text-sm">
              {a.recording_url ? <a className="text-primary hover:underline" href={a.recording_url}>Recording</a> : null}
              {a.transcript_url ? <a className="text-primary hover:underline" href={a.transcript_url}>Transcript</a> : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
