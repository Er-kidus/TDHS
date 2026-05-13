import Link from "next/link";
import { ArrowRight, CalendarClock, ShieldCheck, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { fetchPatientResource } from "@/lib/serverApi";

type Session = {
  id: string;
  doctor_name: string;
  scheduled_at: string;
  status: string;
};

export default async function SessionHistoryPage() {
  const data = (await fetchPatientResource("/telemedicine/sessions?limit=100")) as Session[];
  const sessions = Array.isArray(data) ? data : [];
  const completed = sessions.filter((session) => session.status.toLowerCase().includes("complete")).length;
  const active = sessions.filter((session) => /progress|live|open|connected/i.test(session.status)).length;

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 p-4 md:p-6">
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Session lifecycle</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Session history</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Review past visits, follow the status of each telemedicine session, and jump directly back into a live room when needed.</p>
          </div>
          <Link href="/telemedicine" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Video className="h-4 w-4" />
            Open telemedicine
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><CalendarClock className="h-4 w-4" /> Total sessions</CardDescription>
            <CardTitle className="text-xl">{sessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Completed</CardDescription>
            <CardTitle className="text-xl">{completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><Video className="h-4 w-4" /> Active or open</CardDescription>
            <CardTitle className="text-xl">{active}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        {sessions.length === 0 ? <p className="text-sm text-muted-foreground">No telemedicine sessions.</p> : null}
        {sessions.map((s) => (
          <article key={s.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{s.doctor_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.scheduled_at).toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{s.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/telemedicine/room?session_id=${encodeURIComponent(s.id)}`} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-muted/40">
                Re-open room <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/session-recordings?session_id=${encodeURIComponent(s.id)}`} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-muted/40">
                View recordings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
