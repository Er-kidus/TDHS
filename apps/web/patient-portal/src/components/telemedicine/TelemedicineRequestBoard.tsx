'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarClock, Search, Video } from 'lucide-react';

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  rating: number;
  years_experience: number;
  available: boolean;
};

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown> | string | null;
  } catch {
    return text;
  }
}

export default function TelemedicineRequestBoard({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [requestingDoctorId, setRequestingDoctorId] = useState('');

  const filteredDoctors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return doctors;
    return doctors.filter((doctor) => [doctor.full_name, doctor.specialty, doctor.location].join(' ').toLowerCase().includes(needle));
  }, [doctors, query]);

  async function requestPractitioner(doctor: Doctor) {
    setRequestingDoctorId(doctor.id);
    try {
      const response = await fetch('/api/telemedicine/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctor.id,
          doctor_name: doctor.full_name,
          scheduled_at: new Date().toISOString(),
          preferred_mode: 'video',
          requested_amount: 0,
          requested_currency: 'ETB',
          notes: `Patient requested ${doctor.full_name} from the telemedicine directory.`,
        }),
      });
      const payload = await readJson(response);
      if (!response.ok) {
        const message = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'Unable to request practitioner';
        throw new Error(message);
      }
      const sessionId = payload && typeof payload === 'object' && 'id' in payload ? String(payload.id || '') : '';
      router.push(`/telemedicine/room?session_id=${encodeURIComponent(sessionId)}&doctor_name=${encodeURIComponent(doctor.full_name)}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to request practitioner');
    } finally {
      setRequestingDoctorId('');
    }
  }

  return (
    <section className="rounded-4xl border border-border/70 bg-card/95 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Request a practitioner</p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">Choose a doctor and start the visit automatically</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">A request creates the telemedicine session right away and sends it to the doctor queue for review.</p>
        </div>
        <div className="w-full max-w-md">
          <label className="sr-only" htmlFor="telemedicine-doctor-search">Search practitioners</label>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input id="telemedicine-doctor-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, specialty, or location" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <article key={doctor.id} className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{doctor.full_name}</p>
                <p className="text-sm text-muted-foreground">{doctor.specialty} • {doctor.location}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${doctor.available ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {doctor.available ? 'Available' : 'Offline'}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Rating: {doctor.rating} • {doctor.years_experience} years</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className={`text-xs font-medium ${doctor.available ? 'text-primary' : 'text-muted-foreground'}`}>
                {doctor.available ? 'Ready for a visit' : 'Request anyway'}
              </p>
              <button
                type="button"
                onClick={() => void requestPractitioner(doctor)}
                disabled={requestingDoctorId === doctor.id}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Video className="h-4 w-4" />
                {requestingDoctorId === doctor.id ? 'Requesting...' : 'Request visit'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredDoctors.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No practitioners match that search.</p> : null}
    </section>
  );
}