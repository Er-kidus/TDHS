import Link from "next/link";
import { ArrowRight, FileText, PlayCircle, RadioTower } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
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
  const withRecording = artifacts.filter((artifact) => Boolean(artifact.recording_url)).length;
  const withTranscript = artifacts.filter((artifact) => Boolean(artifact.transcript_url)).length;

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 p-4 md:p-6">
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Visit artifacts</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Session recordings</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Stored visit artifacts, recordings, and transcripts are grouped here so patients can revisit the clinical trail of a session.</p>
          </div>
          <Link href="/session-history" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <RadioTower className="h-4 w-4" />
            Session history
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /> Total artifacts</CardDescription>
            <CardTitle className="text-xl">{artifacts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><PlayCircle className="h-4 w-4" /> With recordings</CardDescription>
            <CardTitle className="text-xl">{withRecording}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /> With transcripts</CardDescription>
            <CardTitle className="text-xl">{withTranscript}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        {artifacts.length === 0 ? <p className="text-sm text-muted-foreground">No recordings available.</p> : null}
        {artifacts.map((artifact) => (
          <article key={artifact.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Session {artifact.session_id}</p>
                <p className="mt-1 text-sm"><span className="font-medium">Summary:</span> {artifact.summary || "--"}</p>
                <p className="mt-1 text-sm"><span className="font-medium">Final diagnosis:</span> {artifact.final_diagnosis || "--"}</p>
              </div>
              <div className="flex gap-2">
                {artifact.recording_url ? <a className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-muted/40" href={artifact.recording_url}>Recording <ArrowRight className="h-4 w-4" /></a> : null}
                {artifact.transcript_url ? <a className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-muted/40" href={artifact.transcript_url}>Transcript <ArrowRight className="h-4 w-4" /></a> : null}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
