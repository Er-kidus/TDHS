import Link from "next/link";
import { ArrowRight, CalendarClock, HeartHandshake, MessageSquareHeart, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { fetchPatientResource } from "@/lib/serverApi";
import { AITriageSection } from "@/components/telemedicine/AITriageSection";

type Session = {
  id: string;
  doctor_name: string;
  scheduled_at: string;
  status: string;
  connection_status: string;
  ai_urgency_level?: string;
};

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  rating: number;
  years_experience: number;
  available: boolean;
  online?: boolean;
  sub_specialty?: string;
  languages?: string[];
  consultation_modes?: string[];
  emergency_support?: boolean;
  current_sessions?: number;
  session_capacity?: number;
};

type Artifact = {
  id: string;
  session_id: string;
  summary: string;
  final_diagnosis: string;
  recording_url?: string;
};

type TelemedicinePageProps = {
  searchParams?: Promise<{
    session_id?: string;
    sessionId?: string;
    doctor_name?: string;
    doctorName?: string;
  }>;
};

const ENDED_STATUSES = new Set(["ended", "completed", "cancelled", "rejected", "expired"]);

export default async function TelemedicinePage({ searchParams }: TelemedicinePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialSessionId = params?.session_id || params?.sessionId || "";
  const initialDoctorName = params?.doctor_name || params?.doctorName || "";

  // If joining a specific room, render room client
  if (initialSessionId || initialDoctorName) {
    const { TelemedicineRoomClient } = await import("@/components/telemedicine/TelemedicineRoomClient");
    return <TelemedicineRoomClient initialSessionId={initialSessionId} initialDoctorName={initialDoctorName} />;
  }

  const [sessionsData, artifactsData, doctorsData] = await Promise.all([
    fetchPatientResource("/telemedicine/sessions?limit=50") as Promise<Session[]>,
    fetchPatientResource("/telemedicine/artifacts?limit=50") as Promise<Artifact[]>,
    fetchPatientResource("/doctors?limit=100") as Promise<Doctor[]>,
  ]);

  const sessions   = Array.isArray(sessionsData)  ? sessionsData  : [];
  const artifacts  = Array.isArray(artifactsData) ? artifactsData : [];
  const doctors    = Array.isArray(doctorsData)   ? doctorsData   : [];

  const activeSessions       = sessions.filter(s => !ENDED_STATUSES.has(s.status?.toLowerCase()));
  const availableDoctors     = doctors.filter(d => d.available);

  return (
    <div className="relative space-y-6 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_45%),radial-gradient(circle_at_top_right,hsl(var(--accent)/0.18),transparent_40%)]" />

      {/* Hero banner */}
      <div className="relative rounded-2xl border border-border/70 bg-card/95 p-6 shadow-soft backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Telemedicine
              </span>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Patient Workspace
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Talk to a Doctor
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Describe your symptoms and our AI will help find the right doctor for you — then connect you in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" />
                Get AI Help
              </Link>
              <Link
                href="/session-history"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/40"
              >
                My Visits
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3 lg:w-96 lg:grid-cols-1 xl:w-[420px] xl:grid-cols-3">
            <Card className="border-border/70 bg-background/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-4 w-4" /> Doctors
                </CardDescription>
                <CardTitle className="text-2xl text-foreground">{doctors.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/70 bg-background/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="h-4 w-4" /> Available
                </CardDescription>
                <CardTitle className="text-2xl text-foreground">{availableDoctors.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/70 bg-background/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" /> Visits
                </CardDescription>
                <CardTitle className="text-2xl text-foreground">{artifacts.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Triage Section (interactive client component) */}
      <AITriageSection doctors={doctors} />

      {/* Right column sidebar — active sessions + care summaries */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Active sessions */}
        <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CalendarClock className="h-4 w-4 text-primary" /> Active Consultations
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your pending and in-progress visits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSessions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <HeartHandshake className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No active sessions. Use the AI assistant above to start a new visit.
                </p>
              </div>
            ) : null}
            {activeSessions.map(s => (
              <article key={s.id} className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{s.doctor_name || "Assigned Doctor"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.scheduled_at).toLocaleString()} • {s.status} • {s.connection_status}
                    </p>
                  </div>
                  {s.ai_urgency_level && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      s.ai_urgency_level === "emergent" ? "bg-red-100 text-red-700" :
                      s.ai_urgency_level === "urgent"   ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {s.ai_urgency_level}
                    </span>
                  )}
                </div>
                <Link
                  href={`/telemedicine/room?session_id=${encodeURIComponent(s.id)}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Join room <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Care summaries */}
          <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MessageSquareHeart className="h-4 w-4 text-primary" /> Past Consultations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {artifacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No visit records yet.</p>
              ) : null}
              {artifacts.slice(0, 3).map(artifact => (
                <article key={artifact.id} className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">Visit: {artifact.session_id?.slice(0, 8).toUpperCase()}</p>
                  <p className="mt-1 text-sm text-foreground">
                    <span className="font-medium">Summary:</span> {artifact.summary || "—"}
                  </p>
                  {artifact.final_diagnosis && (
                    <p className="mt-1 text-sm text-foreground">
                      <span className="font-medium">Notes:</span> {artifact.final_diagnosis}
                    </p>
                  )}
                </article>
              ))}
              {artifacts.length > 3 && (
                <Link href="/session-history" className="text-sm text-primary hover:underline">
                  View all {artifacts.length} visits →
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { title: "Get AI Help", description: "Let our AI guide you to the right care.", href: "/ai-assistant" },
                { title: "Past Consultations", description: "Review your visit history and summaries.", href: "/session-history" },
                { title: "Care Messages", description: "Continue conversations with your care team.", href: "/messages" },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40"
                >
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
