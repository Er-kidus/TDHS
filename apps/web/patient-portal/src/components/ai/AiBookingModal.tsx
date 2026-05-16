'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MapPin, Send, Sparkles, User, X } from 'lucide-react';

type Role = 'user' | 'model';

interface Message {
  role: Role;
  content: string;
  isBooking?: boolean;
}

interface OrgOption {
  id: string;
  name: string;
  address?: string;
  services: string[];
  latitude?: number;
  longitude?: number;
}

interface BookingAction {
  type: 'book';
  appointmentType: 'in-person' | 'telemedicine';
  facilityId: string;
  facilityName: string;
  serviceType: string;
  scheduledAt: string;
  reason?: string;
}

function toDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const WELCOME = "Hello! I'm your appointment assistant. What would you like to visit the clinic or hospital for today?";

export function AiBookingModal({ onClose, onBooked }: { onClose: () => void; onBooked: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'model', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [patientLocation, setPatientLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [pendingAction, setPendingAction] = useState<BookingAction | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/organizations').then(r => r.json()).then((data: unknown) => {
      if (Array.isArray(data)) setOrgs(data as OrgOption[]);
    }).catch(() => {});

    fetch('/api/services').then(r => r.json()).then((data: unknown) => {
      if (Array.isArray(data)) {
        const svcNames = (data as Array<{ name?: string }>).map(s => s.name ?? '').filter(Boolean);
        setServices(svcNames);
      }
    }).catch(() => {});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setPatientLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {},
        { timeout: 6000 }
      );
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction]);

  const orgsWithDistance = patientLocation
    ? [...orgs].sort((a, b) => {
        if (!a.latitude || !b.latitude) return 0;
        return toDistanceKm(patientLocation.lat, patientLocation.lon, a.latitude, a.longitude!) -
               toDistanceKm(patientLocation.lat, patientLocation.lon, b.latitude, b.longitude!);
      }).map(o => ({
        ...o,
        distanceKm: o.latitude ? toDistanceKm(patientLocation.lat, patientLocation.lon, o.latitude, o.longitude!) : undefined,
      }))
    : orgs.map(o => ({ ...o, distanceKm: undefined }));

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    setPendingAction(null);

    try {
      const res = await fetch('/api/ai-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          organizations: orgsWithDistance,
          services,
          patientLat: patientLocation?.lat,
          patientLon: patientLocation?.lon,
        }),
      });
      const data = (await res.json()) as { message?: string; action?: BookingAction };
      const reply: Message = { role: 'model', content: data.message ?? 'I had trouble processing that.' };
      setMessages(prev => [...prev, reply]);
      if (data.action?.type === 'book') {
        setPendingAction(data.action);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, orgsWithDistance, services, patientLocation]);

  const confirmBooking = async () => {
    if (!pendingAction) return;
    setBooking(true);
    try {
      const org = orgs.find(o => o.id === pendingAction.facilityId) || orgs.find(o => o.name.toLowerCase() === pendingAction.facilityName.toLowerCase());
      const safeDate = new Date(pendingAction.scheduledAt).toISOString();
      const isTelemedicine = pendingAction.appointmentType === 'telemedicine' || pendingAction.serviceType.toLowerCase().includes('telemedicine');

      let res;
      if (isTelemedicine) {
        res = await fetch('/api/telemedicine/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduled_at: safeDate,
            preferred_mode: 'video',
            notes: pendingAction.reason || `AI-booked telemedicine: ${pendingAction.serviceType.replace(/_/g, ' ')}`,
          }),
        });
      } else {
        res = await fetch('/api/appointments/ai-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledAt: safeDate,
            serviceType: pendingAction.serviceType,
            serviceCategory: 'consultation',
            reason: pendingAction.reason ?? '',
            priority: 'routine',
            appointmentType: 'in-person',
            facilityId: org?.id,
            facilityName: pendingAction.facilityName,
            facilityAddress: org?.address ?? '',
            location: pendingAction.facilityName,
          }),
        });
      }
      if (res.ok) {
        setBookingDone(true);
        setPendingAction(null);
        setMessages(prev => [...prev, {
          role: 'model',
          content: `✅ Your appointment has been successfully booked at **${pendingAction.facilityName}**.`,
        }]);
        setTimeout(() => {
          onBooked();
          onClose();
        }, 3000);
      } else {
        const errBody = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: `❌ Could not book: ${errBody.error || 'Server error'}. Please try a different time or date.` 
        }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: '❌ Booking failed due to a network error. Please try again.' }]);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-2xl bg-slate-950 border border-white/10 shadow-2xl relative">
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 p-5 backdrop-blur flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-300/80">AI Appointment Assistant</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Book with conversational AI</h2>
            <p className="mt-1 text-sm text-slate-400">
              {patientLocation ? '📍 Location detected — nearest clinics shown first' : 'Tell me what you need and I\'ll find the best available appointment'}
            </p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat */}
        <div className="flex flex-1 flex-col overflow-hidden bg-slate-950/60 p-4">
          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && (
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20">
                    <Bot className="h-4 w-4 text-sky-300" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-sky-500 text-white rounded-tr-sm'
                    : 'bg-white/8 text-slate-100 rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20">
                  <Bot className="h-4 w-4 text-sky-300" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white/8 px-4 py-2.5 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}

            {pendingAction && !bookingDone && (
              <div className="mx-auto max-w-sm rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-sm text-white">
                <p className="font-semibold text-sky-300 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Confirm Booking</p>
                <div className="mt-2 space-y-1 text-slate-300 text-xs">
                  <p>📍 {pendingAction.facilityName}</p>
                  <p>🏥 {pendingAction.serviceType.replace(/_/g, ' ')}</p>
                  <p>📅 {new Date(pendingAction.scheduledAt).toLocaleString()}</p>
                  {pendingAction.reason && <p>📝 {pendingAction.reason}</p>}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={confirmBooking}
                    disabled={booking}
                    className="flex-1 rounded-xl bg-sky-500 py-2 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-60"
                  >
                    {booking ? 'Booking...' : 'Confirm & Book'}
                  </button>
                  <button onClick={() => setPendingAction(null)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/10 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {['I need a general consultation', 'Book a cardiology appointment', 'I need lab tests', 'Schedule telemedicine'].map(p => (
                <button key={p} onClick={() => sendMessage(p)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10 transition">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="mt-4 flex items-center gap-2">
            {patientLocation && (
              <MapPin className="h-4 w-4 shrink-0 text-sky-400" />
            )}
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }}
              placeholder="Type your message..."
              className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            />
            <button
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white hover:bg-sky-400 disabled:opacity-40 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
