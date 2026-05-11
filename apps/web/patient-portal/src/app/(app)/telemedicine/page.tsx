import Link from "next/link";
import { TelemedicineRoomClient } from "@/components/telemedicine/TelemedicineRoomClient";
import { ArrowRight, CalendarClock, MessageSquareHeart, Sparkles, Video } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
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
  }>;
};

export default async function TelemedicinePage({ searchParams }: TelemedicinePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialSessionId = params?.session_id || params?.sessionId || "";
  const initialDoctorName = params?.doctor_name || params?.doctorName || "";

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

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Telemedicine</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Start a telemedicine session</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Use this page as your telemedicine entry point from the sidebar. Start a room, pick practitioners, and review session outcomes.
            </p>
          </div>
          <Link href="/telemedicine" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Video className="h-4 w-4" />
            Open room
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground">Practitioners</CardDescription>
            <CardTitle className="text-xl text-foreground">{practitioners.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground">Available now</CardDescription>
            <CardTitle className="text-xl text-foreground">{availablePractitioners.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground">Visit artifacts</CardDescription>
            <CardTitle className="text-xl text-foreground">{artifacts.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="border-border bg-card text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Sparkles className="h-4 w-4 text-primary" /> Practitioners</CardTitle>
            <CardDescription className="text-muted-foreground">Select a registered practitioner to start or continue a telemedicine session.</CardDescription>
          </CardHeader>
          <CardContent>
            {practitioners.length === 0 ? <p className="text-sm text-muted-foreground">No practitioners registered yet.</p> : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {practitioners.map((doctor) => (
                <article key={doctor.id} className="rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-muted/40">
                  <p className="font-medium text-foreground">{doctor.full_name}</p>
                  <p className="text-sm text-muted-foreground">{doctor.specialty} • {doctor.location}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Rating: {doctor.rating} • {doctor.years_experience} years</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className={"text-xs " + (doctor.available ? "text-primary" : "text-muted-foreground")}>{doctor.available ? "Available" : "Unavailable"}</p>
                    <Link href={`/telemedicine?doctor_name=${encodeURIComponent(doctor.full_name)}`} className="inline-flex text-sm text-primary hover:underline">
                      Start
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border bg-card text-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground"><CalendarClock className="h-4 w-4 text-primary" /> Sessions</CardTitle>
              <CardDescription className="text-muted-foreground">Recent telemedicine visits and room status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.length === 0 ? <p className="text-sm text-muted-foreground">No sessions available.</p> : null}
              {sessions.map((s) => (
                <article key={s.id} className="rounded-2xl border border-border bg-background p-3">
                  <p className="font-medium text-foreground">{s.doctor_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.scheduled_at).toLocaleString()} • {s.status} • {s.connection_status}</p>
                  <Link href={`/telemedicine?session_id=${encodeURIComponent(s.id)}`} className="mt-2 inline-flex text-sm text-primary hover:underline">
                    Open room
                  </Link>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground"><MessageSquareHeart className="h-4 w-4 text-primary" /> Care summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {artifacts.length === 0 ? <p className="text-muted-foreground">No session artifacts recorded yet.</p> : null}
              {artifacts.slice(0, 3).map((artifact) => (
                <article key={artifact.id} className="rounded-2xl border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Session: {artifact.session_id}</p>
                  <p className="mt-1 text-sm text-foreground"><span className="font-medium">Summary:</span> {artifact.summary || "--"}</p>
                  <p className="mt-1 text-sm text-foreground"><span className="font-medium">Diagnosis:</span> {artifact.final_diagnosis || "--"}</p>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-foreground">
            <CardHeader>
              <CardTitle className="text-foreground">Fast actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground hover:border-primary/40 hover:bg-muted/40">
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
