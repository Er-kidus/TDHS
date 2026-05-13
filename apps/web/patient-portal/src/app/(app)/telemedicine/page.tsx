import Link from "next/link";
import { TelemedicineRoomClient } from "@/components/telemedicine/TelemedicineRoomClient";
import { ArrowRight, CalendarClock, MessageSquareHeart, ShieldCheck, Sparkles, Video } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import TelemedicineRequestBoard from "@/components/telemedicine/TelemedicineRequestBoard";
import { fetchPatientResource } from "@/lib/serverApi";

type Session = {
  id: string;
  doctor_name: string;
  scheduled_at: string;
  status: string;
  connection_status: string;
};

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  rating: number;
  years_experience: number;
  available: boolean;
};

type Artifact = {
  id: string;
  session_id: string;
  summary: string;
  final_diagnosis: string;
  recording_url?: string;
};

const quickActions = [
  {
    title: "Start session",
    description: "Launch the telemedicine room, choose a practitioner, and begin a visit.",
    href: "/telemedicine",
  },
  {
    title: "Review session history",
    description: "Look back at summaries, recordings, and follow-up details.",
    href: "/session-history",
  },
  {
    title: "Open messages",
    description: "Continue care-team communication outside the live room.",
    href: "/messages",
  },
] as const;

type TelemedicinePageProps = {
  searchParams?: Promise<{
    session_id?: string;
    sessionId?: string;
    doctor_name?: string;
    doctorName?: string;
    q?: string;
  }>;
};

export default async function TelemedicinePage({ searchParams }: TelemedicinePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialSessionId = params?.session_id || params?.sessionId || "";
  const initialDoctorName = params?.doctor_name || params?.doctorName || "";
  const query = (params?.q || "").trim().toLowerCase();

  if (initialSessionId || initialDoctorName) {
    return <TelemedicineRoomClient initialSessionId={initialSessionId} initialDoctorName={initialDoctorName} />;
  }

  const sessionsData = (await fetchPatientResource("/telemedicine/sessions?limit=50")) as Session[];
  const artifactsData = (await fetchPatientResource("/telemedicine/artifacts?limit=50")) as Artifact[];
  const doctorsData = (await fetchPatientResource("/doctors?limit=50")) as Doctor[];
  const sessions = Array.isArray(sessionsData) ? sessionsData : [];
  const artifacts = Array.isArray(artifactsData) ? artifactsData : [];
  const practitioners = Array.isArray(doctorsData) ? doctorsData : [];
  const availablePractitioners = practitioners.filter((doctor) => doctor.available);
  const filteredPractitioners = query
    ? practitioners.filter((doctor) => {
        const haystack = [doctor.full_name, doctor.specialty, doctor.location].join(" ").toLowerCase();
        return haystack.includes(query);
      })
    : practitioners;

  return (
    <div className="relative space-y-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_38%)]" />

      <div className="relative rounded-4xl border border-border/70 bg-card/95 p-6 shadow-soft backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">Telemedicine</span>
              <span className="rounded-full border border-border bg-background px-3 py-1">Patient workspace</span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Start a telemedicine session</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Pick a practitioner, open a secure room, and review recent visits and artifacts from one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/telemedicine" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                <Video className="h-4 w-4" />
                Open room
              </Link>
              <Link href="/session-history" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/40">
                Review history
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-105 lg:grid-cols-1 xl:w-130 xl:grid-cols-3">
            <Card className="border-border/70 bg-background/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-muted-foreground"><Sparkles className="h-4 w-4" /> Practitioners</CardDescription>
                <CardTitle className="text-2xl text-foreground">{practitioners.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/70 bg-background/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-muted-foreground"><CalendarClock className="h-4 w-4" /> Available now</CardDescription>
                <CardTitle className="text-2xl text-foreground">{availablePractitioners.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/70 bg-background/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Visit artifacts</CardDescription>
                <CardTitle className="text-2xl text-foreground">{artifacts.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground flex items-center gap-2"><Sparkles className="h-4 w-4" /> Practitioners</CardDescription>
            <CardTitle className="text-xl text-foreground">{practitioners.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Available now</CardDescription>
            <CardTitle className="text-xl text-foreground">{availablePractitioners.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Visit artifacts</CardDescription>
            <CardTitle className="text-xl text-foreground">{artifacts.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <TelemedicineRequestBoard doctors={filteredPractitioners} />

        <div className="space-y-4">
          <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground"><CalendarClock className="h-4 w-4 text-primary" /> Sessions</CardTitle>
              <CardDescription className="text-muted-foreground">Recent telemedicine visits and room status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.length === 0 ? <p className="text-sm text-muted-foreground">No sessions available.</p> : null}
              {sessions.map((s) => (
                <article key={s.id} className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm">
                  <p className="font-medium text-foreground">{s.doctor_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.scheduled_at).toLocaleString()} • {s.status} • {s.connection_status}</p>
                  <Link href={`/telemedicine/room?session_id=${encodeURIComponent(s.id)}`} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                    Open room
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground"><MessageSquareHeart className="h-4 w-4 text-primary" /> Care summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {artifacts.length === 0 ? <p className="text-muted-foreground">No session artifacts recorded yet.</p> : null}
              {artifacts.slice(0, 3).map((artifact) => (
                <article key={artifact.id} className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">Session: {artifact.session_id}</p>
                  <p className="mt-1 text-sm text-foreground"><span className="font-medium">Summary:</span> {artifact.summary || "--"}</p>
                  <p className="mt-1 text-sm text-foreground"><span className="font-medium">Diagnosis:</span> {artifact.final_diagnosis || "--"}</p>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-foreground">Fast actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="flex items-center justify-between rounded-3xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40">
                  <span>
                    <span className="block font-medium text-foreground">{action.title}</span>
                    <span className="block text-xs text-muted-foreground">{action.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
