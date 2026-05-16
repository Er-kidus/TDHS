'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AiTriageEvaluator } from '@/components/ai/AiTriageEvaluator';

type Appointment = {
  id: string;
  patient_id: string;
  status: string;
  reason?: string;
  notes?: string;
  serviceType?: string;
  serviceCategory?: string;
  scheduled_at: string;
};

type Patient = {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
};

type QueueEntry = {
  queue_id: string;
  service_type?: string;
  appointment_id: string;
  position: number;
  status: string;
  estimated_wait_minutes?: number;
};

type TriageTarget = 'doctor' | 'opd' | 'lab' | 'telemedicine';
type Channel = 'web' | 'mobile' | 'ussd' | 'unknown';
type Consciousness = 'alert' | 'altered' | 'avpu_v' | 'avpu_p' | 'avpu_u';

type TriageAssessment = {
  id: string;
  patientLogicalId: string;
  symptoms: string[];
  redFlags: string[];
  vitals: {
    systolicBp?: number;
    diastolicBp?: number;
    heartRate?: number;
    respiratoryRate?: number;
    temperatureC?: number;
    oxygenSaturation?: number;
    bloodGlucoseMgDl?: number;
    painScore?: number;
    consciousness?: string;
  };
  context: {
    pregnant?: boolean;
    trimester?: number;
    chronicConditions?: string[];
    currentMedications?: string[];
    knownAllergies?: string[];
    chiefComplaint?: string;
    onsetHours?: number;
  };
  severity: string;
  score: number;
  recommendedAction: string;
  suggestions?: string[];
  aiSeverity?: string;
  aiScore?: number;
  aiConfidence?: number;
  aiFallbackUsed?: boolean;
  aiModelVersion?: string;
  aiReasons?: string[];
  createdAt: string;
};

type Props = {
  appointmentId: string;
};

type FormState = {
  frontdoorBase: string;
  queueEntryId: string;
  patientLogicalId: string;
  symptoms: string;
  redFlags: string;
  ageYears: string;
  channel: Channel;
  autoCheckIn: boolean;
  weightKg: string;
  heightCm: string;
  systolicBp: string;
  diastolicBp: string;
  heartRate: string;
  respiratoryRate: string;
  temperatureC: string;
  oxygenSaturation: string;
  bloodGlucoseMgDl: string;
  painScore: string;
  consciousness: Consciousness;
  pregnant: boolean;
  trimester: string;
  onsetHours: string;
  chronicConditions: string;
  currentMedications: string;
  knownAllergies: string;
  chiefComplaint: string;
  routeTarget: TriageTarget;
  doctorId: string;
};

type BannerState = {
  kind: 'idle' | 'ok' | 'error';
  message: string;
};

type TimelineStep = {
  title: string;
  state: 'wait' | 'done' | 'error';
  detail: string;
};

type StoredConsoleState = {
  form: FormState;
  assessment: TriageAssessment | null;
  banner: BannerState;
  timeline: TimelineStep[];
  requestPayloadText: string;
  responsePayloadText: string;
  suggestionsPayloadText: string;
};

const DEFAULT_FRONTDOOR_BASE = process.env.NEXT_PUBLIC_TRIAGE_FRONTDOOR_BASE_URL?.trim() || 'http://localhost:8090';
const STATE_KEY_PREFIX = 'tenadam-ai-triage-console';

function formatStatusLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeUrl(value: string, fallback: string) {
  const base = (value || fallback).trim();
  return base.replace(/\/$/, '');
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatHumanLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatShortValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') {
    return 'Not available';
  }
  return String(value);
}

function formatConfidence(value?: number, fallbackUsed?: boolean) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const normalized = value <= 1 ? value * 100 : value;
    return `${Math.max(0, Math.min(100, normalized)).toFixed(0)}%`;
  }
  return fallbackUsed ? 'Rules fallback' : 'Not available';
}

function confidenceProgressValue(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
}

function describeRecommendedAction(action?: string) {
  switch (action) {
    case 'immediate_emergency_review':
      return 'Immediate emergency review is recommended based on the current risk pattern and clinical instability indicators.';
    case 'urgent_clinician_review':
      return 'Urgent clinician review is recommended and the patient should remain under close observation while awaiting review.';
    case 'standard_clinician_review':
      return 'Standard clinician review is appropriate, with continued monitoring for any change in symptoms or vital signs.';
    case 'self_care_guidance':
      return 'Current findings support low-acuity guidance, but the patient should be advised to return if symptoms worsen.';
    default:
      return action ? `${formatHumanLabel(action)} is the current recommended next step.` : 'No recommendation is available yet.';
  }
}

function buildVitalsSummary(form: FormState) {
  const parts = [
    form.heartRate ? `HR ${form.heartRate} bpm` : '',
    form.respiratoryRate ? `RR ${form.respiratoryRate}/min` : '',
    form.oxygenSaturation ? `SpO2 ${form.oxygenSaturation}%` : '',
    form.temperatureC ? `Temp ${form.temperatureC} C` : '',
    form.systolicBp || form.diastolicBp ? `BP ${form.systolicBp || '-'}/${form.diastolicBp || '-'}` : '',
    form.bloodGlucoseMgDl ? `Glucose ${form.bloodGlucoseMgDl} mg/dL` : '',
    form.painScore ? `Pain ${form.painScore}/10` : '',
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : 'No vital signs have been entered yet.';
}

function suggestTarget(appointment: Appointment): TriageTarget {
  const text = `${appointment.reason || ''} ${appointment.notes || ''} ${appointment.serviceType || ''} ${appointment.serviceCategory || ''}`.toLowerCase();
  if (text.includes('lab')) return 'lab';
  if (text.includes('tele')) return 'telemedicine';
  if (text.includes('opd')) return 'opd';
  return 'doctor';
}

function routeStatusForTarget(target: TriageTarget, severity: string) {
  const normalizedSeverity = severity.toLowerCase();
  if (normalizedSeverity === 'red' || normalizedSeverity === 'orange' || normalizedSeverity === 'emergent' || normalizedSeverity === 'high') {
    return 'doctor_waiting';
  }

  switch (target) {
    case 'lab':
      return 'lab_waiting';
    case 'telemedicine':
      return 'telemedicine_waiting';
    case 'opd':
      return 'opd_waiting';
    default:
      return 'doctor_waiting';
  }
}

function staffTypeForTarget(target: TriageTarget) {
  return target === 'lab' ? 'lab' : 'doctor';
}

function createEmptyForm(): FormState {
  return {
    frontdoorBase: DEFAULT_FRONTDOOR_BASE,
    queueEntryId: '',
    patientLogicalId: '',
    symptoms: '',
    redFlags: '',
    ageYears: '',
    channel: 'web',
    autoCheckIn: false,
    weightKg: '',
    heightCm: '',
    systolicBp: '',
    diastolicBp: '',
    heartRate: '',
    respiratoryRate: '',
    temperatureC: '',
    oxygenSaturation: '',
    bloodGlucoseMgDl: '',
    painScore: '',
    consciousness: 'alert',
    pregnant: false,
    trimester: '0',
    onsetHours: '0',
    chronicConditions: '',
    currentMedications: '',
    knownAllergies: '',
    chiefComplaint: '',
    routeTarget: 'doctor',
    doctorId: '',
  };
}

function buildDefaultForm(appointment: Appointment, queueEntry: QueueEntry | null): FormState {
  const base = createEmptyForm();
  const queueEntryId = queueEntry?.queue_id || queueEntry?.appointment_id || appointment.id;
  const reasonText = appointment.reason || '';
  const noteText = appointment.notes || '';
  const combinedText = [reasonText, noteText].filter(Boolean).join(', ');

  return {
    ...base,
    queueEntryId,
    patientLogicalId: appointment.patient_id,
    symptoms: combinedText,
    chiefComplaint: reasonText,
    routeTarget: suggestTarget(appointment),
  };
}

async function requestJson(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('Content-Type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const details = typeof body === 'string' ? body : JSON.stringify(body);
    console.error('🚨 SERVER ERROR RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      body: body,
      details
    });
    throw new Error(`${response.status} ${response.statusText}: ${details}`);
  }

  return body;
}

export function TriageFormClient({ appointmentId }: Props) {
  const storageKey = `${STATE_KEY_PREFIX}:${appointmentId}`;
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<{id: string, full_name: string}[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [form, setForm] = useState<FormState>(createEmptyForm());
  const [assessment, setAssessment] = useState<TriageAssessment | null>(null);
  const [banner, setBanner] = useState<BannerState>({ kind: 'idle', message: '' });
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [requestPayloadText, setRequestPayloadText] = useState('No run yet.');
  const [responsePayloadText, setResponsePayloadText] = useState('No run yet.');
  const [suggestionsPayloadText, setSuggestionsPayloadText] = useState('No run yet.');

  useEffect(() => {
    if (loading || typeof window === 'undefined') {
      return;
    }

    const payload: StoredConsoleState = {
      form,
      assessment,
      banner,
      timeline,
      requestPayloadText,
      responsePayloadText,
      suggestionsPayloadText,
    };
    window.sessionStorage.setItem(storageKey, JSON.stringify(payload));
  }, [assessment, banner, form, loading, requestPayloadText, responsePayloadText, storageKey, suggestionsPayloadText, timeline]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [appointmentRes, patientsRes, queuesRes, doctorsRes] = await Promise.all([
        fetch(`/api/appointments/${encodeURIComponent(appointmentId)}`, { cache: 'no-store' }),
        fetch('/api/org/patients?limit=300', { cache: 'no-store' }),
        fetch('/api/org/queues', { cache: 'no-store' }),
        fetch('/api/org/doctors', { cache: 'no-store' }),
      ]);

      if (!appointmentRes.ok) {
        const body = (await appointmentRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Failed to load appointment');
      }

      const appointmentData = (await appointmentRes.json()) as Appointment;
      const patientsData = (await patientsRes.json().catch(() => [])) as unknown;
      const queuesData = (await queuesRes.json().catch(() => [])) as unknown;
      const doctorsData = (await doctorsRes.json().catch(() => [])) as unknown;
      const patientItems = Array.isArray(patientsData) ? (patientsData as Patient[]) : [];
      const queueItems = Array.isArray(queuesData) ? (queuesData as QueueEntry[]) : [];
      const doctorItems = Array.isArray(doctorsData) ? (doctorsData as {id: string, full_name: string}[]) : [];
      const matchedPatient = patientItems.find((item) => item.id === appointmentData.patient_id) || null;
      const matchedQueue = queueItems.find((item) => item.appointment_id === appointmentId) || null;
      const defaultForm = buildDefaultForm(appointmentData, matchedQueue);

      setAppointment(appointmentData);
      setPatient(matchedPatient);
      setQueueEntry(matchedQueue);
      setDoctors(doctorItems);

      if (typeof window !== 'undefined') {
        const raw = window.sessionStorage.getItem(storageKey);
        if (raw) {
          try {
            const stored = JSON.parse(raw) as Partial<StoredConsoleState>;
            if (stored.form) {
              setForm({
                ...defaultForm,
                ...stored.form,
                frontdoorBase: normalizeUrl(stored.form.frontdoorBase || defaultForm.frontdoorBase, DEFAULT_FRONTDOOR_BASE),
                patientLogicalId: stored.form.patientLogicalId?.trim() ? stored.form.patientLogicalId : defaultForm.patientLogicalId,
                queueEntryId: stored.form.queueEntryId?.trim() ? stored.form.queueEntryId : defaultForm.queueEntryId,
              });
            } else {
              setForm(defaultForm);
            }
            setAssessment(stored.assessment ?? null);
            setBanner(stored.banner ?? { kind: 'idle', message: '' });
            setTimeline(Array.isArray(stored.timeline) ? stored.timeline : []);
            setRequestPayloadText(stored.requestPayloadText || 'No run yet.');
            setResponsePayloadText(stored.responsePayloadText || 'No run yet.');
            setSuggestionsPayloadText(stored.suggestionsPayloadText || 'No run yet.');
          } catch {
            window.sessionStorage.removeItem(storageKey);
            setForm(defaultForm);
            setAssessment(null);
            setBanner({ kind: 'idle', message: '' });
            setTimeline([]);
            setRequestPayloadText('No run yet.');
            setResponsePayloadText('No run yet.');
            setSuggestionsPayloadText('No run yet.');
          }
        } else {
          setForm(defaultForm);
          setAssessment(null);
          setBanner({ kind: 'idle', message: '' });
          setTimeline([]);
          setRequestPayloadText('No run yet.');
          setResponsePayloadText('No run yet.');
          setSuggestionsPayloadText('No run yet.');
        }
      } else {
        setForm(defaultForm);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load triage form');
    } finally {
      setLoading(false);
    }
  }, [appointmentId, storageKey]);

  useEffect(() => {
    void load();
  }, [load]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addTimelineStep(step: TimelineStep) {
    setTimeline((current) => [...current, step]);
  }

  function clearRunState() {
    setBanner({ kind: 'idle', message: '' });
    setTimeline([]);
    setAssessment(null);
    setRequestPayloadText('No run yet.');
    setResponsePayloadText('No run yet.');
    setSuggestionsPayloadText('No run yet.');
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(storageKey);
    }
  }

 function collectInput() {
  const toOptionalNumber = (v: string) =>
    v && v.trim() !== '' ? Number(v) : undefined;

  const vitals = {
    systolicBp: toOptionalNumber(form.systolicBp),
    diastolicBp: toOptionalNumber(form.diastolicBp),
    heartRate: toOptionalNumber(form.heartRate),
    respiratoryRate: toOptionalNumber(form.respiratoryRate),
    temperatureC: toOptionalNumber(form.temperatureC),
    oxygenSaturation: toOptionalNumber(form.oxygenSaturation),
    bloodGlucoseMgDl: toOptionalNumber(form.bloodGlucoseMgDl),
    painScore: toOptionalNumber(form.painScore),
    consciousness: form.consciousness || undefined,
    weightKg: toOptionalNumber(form.weightKg),
    heightCm: toOptionalNumber(form.heightCm),
  };

  // Filter out undefined values to prevent JSON unmarshaling errors
  const filteredVitals = Object.fromEntries(
    Object.entries(vitals).filter(([_, value]) => value !== undefined)
  );

  const context = {
    pregnant: form.pregnant,
    trimester: toOptionalNumber(form.trimester),
    chronicConditions: splitList(form.chronicConditions),
    currentMedications: splitList(form.currentMedications),
    knownAllergies: splitList(form.knownAllergies),
    chiefComplaint: form.chiefComplaint.trim(),
    onsetHours: toOptionalNumber(form.onsetHours) ? Math.floor(toOptionalNumber(form.onsetHours)!) : undefined,
  };

  // Filter out undefined values from context
  const filteredContext = Object.fromEntries(
    Object.entries(context).filter(([_, value]) => value !== undefined)
  );

  return {
    frontdoorBase: normalizeUrl(form.frontdoorBase, DEFAULT_FRONTDOOR_BASE),
    queueEntryId: form.queueEntryId.trim(),
    patientLogicalId: form.patientLogicalId.trim() || appointment?.patient_id || '',
    symptoms: splitList(form.symptoms),
    redFlags: splitList(form.redFlags),
    ageYears: toOptionalNumber(form.ageYears),
    channel: form.channel,
    vitals: filteredVitals,
    context: filteredContext,
    autoCheckIn: form.autoCheckIn,
    routeTarget: form.routeTarget,
  };
}

  async function updateAppointment(nextAssessment: TriageAssessment, checkInResult?: Record<string, unknown>, target: TriageTarget = form.routeTarget) {
    if (!appointment) {
      return null;
    }

    const nextStatus = routeStatusForTarget(target, nextAssessment.severity);
    const vitalSummary = [
      `temp=${form.temperatureC || 'n/a'}`,
      `hr=${form.heartRate || 'n/a'}`,
      `rr=${form.respiratoryRate || 'n/a'}`,
      `spo2=${form.oxygenSaturation || 'n/a'}`,
      `bp=${form.systolicBp || 'n/a'}/${form.diastolicBp || 'n/a'}`,
      `glucose=${form.bloodGlucoseMgDl || 'n/a'}`,
      `pain=${form.painScore || 'n/a'}`,
      `consciousness=${form.consciousness}`,
    ].join('; ');

    const mergedNotes = [
      appointment.notes || '',
      `[Triage Console] severity=${nextAssessment.severity}; score=${nextAssessment.score}; route=${formatStatusLabel(target)}; chief_complaint=${form.chiefComplaint || 'none'}; channel=${form.channel}; auto_check_in=${form.autoCheckIn}`,
      `[Vitals] ${vitalSummary}`,
      `[Context] age=${form.ageYears || 'n/a'}; weight_kg=${form.weightKg || 'n/a'}; height_cm=${form.heightCm || 'n/a'}; pregnant=${form.pregnant}; trimester=${form.trimester || 'n/a'}; onset_hours=${form.onsetHours || 'n/a'}; allergies=${form.knownAllergies || 'none'}; chronic_conditions=${form.chronicConditions || 'none'}; medications=${form.currentMedications || 'none'}`,
      checkInResult ? `[Check-In] ${JSON.stringify(checkInResult)}` : '',
      `[AI] score=${nextAssessment.score}; severity=${nextAssessment.severity}; recommended_action=${nextAssessment.recommendedAction}; ai_severity=${nextAssessment.aiSeverity || 'n/a'}; ai_score=${nextAssessment.aiScore ?? 0}; confidence=${nextAssessment.aiConfidence ?? 0}; model=${nextAssessment.aiModelVersion || 'n/a'}`,
      nextAssessment.suggestions?.length ? `[Suggestions] ${nextAssessment.suggestions.join(' | ')}` : '',
    ].filter(Boolean).join('\n');

    const response = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        notes: mergedNotes,
        assignedStaffType: staffTypeForTarget(target),
        doctor_id: form.doctorId || undefined,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || 'Failed to update triage status');
    }

    return response.json().catch(() => null);
  }

  async function runTriageScoring() {
    setSaving(true);
    setError(null);
    clearRunState();

    try {
      const input = collectInput();
      if (!input.patientLogicalId) {
        throw new Error('patientLogicalId is required');
      }
      if (!input.symptoms.length) {
        throw new Error('at least one symptom is required');
      }

      const requestPayload = {
        patientLogicalId: input.patientLogicalId,
        symptoms: input.symptoms,
        redFlags: input.redFlags,
        ageYears: input.ageYears ?? 0,
        channel: input.channel,
        vitals: input.vitals,
        context: input.context,
      };
      // 🔍 DEV DEBUG LOG (HUMAN READABLE)
console.group("🧪 TRIAGE REQUEST DEBUG");
console.log("Endpoint:", `${input.frontdoorBase}/v1/frontdoor/triage/assess`);
console.log("Raw Form State:", form);
console.log("Collected Input:", input);
console.log("Final Request Payload:", requestPayload);
console.log("JSON Payload:", JSON.stringify(requestPayload, null, 2));
console.groupEnd();
      setRequestPayloadText(JSON.stringify(requestPayload, null, 2));

      const output: Record<string, unknown> = {};

      addTimelineStep({ title: 'Triage Score', state: 'wait', detail: 'Calling /v1/frontdoor/triage/assess...' });
      const nextAssessment = (await requestJson(`${input.frontdoorBase}/v1/frontdoor/triage/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      })) as TriageAssessment;

      setAssessment(nextAssessment);
      setSuggestionsPayloadText(JSON.stringify(nextAssessment.suggestions || [], null, 2));
      addTimelineStep({
        title: 'Triage Score',
        state: 'done',
        detail: `Score ${nextAssessment.score}, severity ${nextAssessment.severity}`,
      });
      output.assessment = nextAssessment;

      setResponsePayloadText(JSON.stringify(output, null, 2));
      setBanner({ kind: 'ok', message: 'AI triage result is ready for review.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addTimelineStep({ title: 'Error', state: 'error', detail: message });
      setBanner({ kind: 'error', message });
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function sendAssessmentToDoctor(target: TriageTarget = form.routeTarget) {
    if (!assessment) {
      setBanner({ kind: 'error', message: 'Run Check Result first before sending to doctor.' });
      setError('Run Check Result first before sending to doctor.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const input = collectInput();
      const output: Record<string, unknown> = { assessment };

      addTimelineStep({ title: 'Review Complete', state: 'done', detail: 'Using the latest triage result for routing.' });

      if (input.autoCheckIn) {
        if (!input.queueEntryId) {
          throw new Error('queueEntryId is required when Auto Check-In First = Yes');
        }

        addTimelineStep({ title: 'Check-In', state: 'wait', detail: 'Calling /v1/frontdoor/checkins...' });
        const checkedIn = (await requestJson(`${input.frontdoorBase}/v1/frontdoor/checkins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queueEntryId: input.queueEntryId }),
        })) as Record<string, unknown>;

        output.checkIn = checkedIn;
        addTimelineStep({
          title: 'Check-In',
          state: 'done',
          detail: `Queue ${String(checkedIn.id || input.queueEntryId)} is now ${String(checkedIn.status || 'checked-in')}`,
        });
      }

      addTimelineStep({ title: 'Appointment', state: 'wait', detail: 'Applying reviewed triage result to the current appointment...' });
      const appointmentUpdate = await updateAppointment(assessment, output.checkIn as Record<string, unknown> | undefined, target);
      output.appointment = appointmentUpdate;
      addTimelineStep({ title: 'Appointment', state: 'done', detail: `Appointment updated to ${formatStatusLabel(routeStatusForTarget(target, assessment.severity))}` });

      setResponsePayloadText(JSON.stringify(output, null, 2));
      setBanner({ kind: 'ok', message: 'Reviewed triage result sent to doctor successfully.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addTimelineStep({ title: 'Error', state: 'error', detail: message });
      setBanner({ kind: 'error', message });
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading triage console...</p>;
  }

  if (!appointment) {
    return <p className="text-sm text-red-600">{error || 'Appointment not found'}</p>;
  }

  const score = Math.max(0, Math.min(100, Number(assessment?.score || 0)));
  const severity = String(assessment?.severity || 'unknown').toLowerCase();
  const severityClass = severity === 'emergent' || severity === 'high' ? 'bg-rose-100 text-rose-700 border-rose-200' : severity === 'moderate' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  const routeLabel = formatStatusLabel(routeStatusForTarget('doctor', assessment?.severity || ''));
  const confidenceValue = confidenceProgressValue(assessment?.aiConfidence);
  const confidenceText = formatConfidence(assessment?.aiConfidence, assessment?.aiFallbackUsed);
  const primaryRecommendation = describeRecommendedAction(assessment?.recommendedAction);
  const symptomSummary = splitList(form.symptoms).join(', ') || 'No symptom summary entered.';
  const allergySummary = splitList(form.knownAllergies).join(', ') || 'No known allergies documented.';
  const reasonsSummary = assessment?.aiReasons?.length ? assessment.aiReasons.join(' | ') : assessment?.aiFallbackUsed ? 'AI scoring service did not return a model response, so rule-based triage logic was used.' : 'No explicit reasoning details were returned.';

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 md:p-6">
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <article className="rounded-[20px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-slate-900">Patient</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p><span className="font-semibold text-slate-900">Name:</span> {patient?.full_name || appointment.patient_id}</p>
          <p><span className="font-semibold text-slate-900">Appointment:</span> {new Date(appointment.scheduled_at).toLocaleString()}</p>
          <p><span className="font-semibold text-slate-900">Status:</span> {formatStatusLabel(appointment.status)}</p>
          <p><span className="font-semibold text-slate-900">Queue:</span> {queueEntry?.position ?? '-'}</p>
          <p><span className="font-semibold text-slate-900">Queue Status:</span> {queueEntry?.status ? formatStatusLabel(queueEntry.status) : 'unassigned'}</p>
        </div>
      </article>

      <article className="rounded-[20px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Triage Form</h2>
          <LabeledField label="Symptoms (comma-separated)">
            <textarea title="Symptoms" placeholder="Symptoms" value={form.symptoms} onChange={(event) => setField('symptoms', event.target.value)} />
          </LabeledField>
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledField label="Red Flags (comma-separated)">
              <input title="Red Flags" placeholder="Red Flags" value={form.redFlags} onChange={(event) => setField('redFlags', event.target.value)} />
            </LabeledField>
            <LabeledField label="Age (years)">
              <input title="Age" placeholder="Age" type="number" min="0" max="120" value={form.ageYears} onChange={(event) => setField('ageYears', event.target.value)} />
            </LabeledField>
          </div>
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <LabeledField label="Auto Check-In First">
              <select title="Auto Check-In First" value={String(form.autoCheckIn)} onChange={(event) => setField('autoCheckIn', event.target.value === 'true')}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </LabeledField>
          </div>
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <LabeledField label="Chief Complaint">
              <input title="Chief Complaint" placeholder="Chief Complaint" value={form.chiefComplaint} onChange={(event) => setField('chiefComplaint', event.target.value)} />
            </LabeledField>
            <LabeledField label="Symptom Onset (hours)">
              <input title="Symptom Onset" placeholder="Symptom Onset" type="number" min="0" value={form.onsetHours} onChange={(event) => setField('onsetHours', event.target.value)} />
            </LabeledField>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <LabeledField label="Weight (kg)">
              <input title="Weight" placeholder="Weight" type="number" min="0" step="0.1" value={form.weightKg} onChange={(event) => setField('weightKg', event.target.value)} />
            </LabeledField>
            <LabeledField label="Height (cm)">
              <input title="Height" placeholder="Height" type="number" min="0" step="0.1" value={form.heightCm} onChange={(event) => setField('heightCm', event.target.value)} />
            </LabeledField>
            <LabeledField label="Systolic BP">
              <input title="Systolic BP" placeholder="Systolic BP" type="number" min="0" value={form.systolicBp} onChange={(event) => setField('systolicBp', event.target.value)} />
            </LabeledField>
            <LabeledField label="Diastolic BP">
              <input title="Diastolic BP" placeholder="Diastolic BP" type="number" min="0" value={form.diastolicBp} onChange={(event) => setField('diastolicBp', event.target.value)} />
            </LabeledField>
            <LabeledField label="Heart Rate">
              <input title="Heart Rate" placeholder="Heart Rate" type="number" min="0" value={form.heartRate} onChange={(event) => setField('heartRate', event.target.value)} />
            </LabeledField>
            <LabeledField label="Respiratory Rate">
              <input title="Respiratory Rate" placeholder="Respiratory Rate" type="number" min="0" value={form.respiratoryRate} onChange={(event) => setField('respiratoryRate', event.target.value)} />
            </LabeledField>
            <LabeledField label="Temperature (C)">
              <input title="Temperature" placeholder="Temperature" type="number" min="0" step="0.1" value={form.temperatureC} onChange={(event) => setField('temperatureC', event.target.value)} />
            </LabeledField>
            <LabeledField label="SpO2 (%)">
              <input title="SpO2" placeholder="SpO2" type="number" min="0" max="100" value={form.oxygenSaturation} onChange={(event) => setField('oxygenSaturation', event.target.value)} />
            </LabeledField>
            <LabeledField label="Blood Glucose (mg/dL)">
              <input title="Blood Glucose" placeholder="Blood Glucose" type="number" min="0" value={form.bloodGlucoseMgDl} onChange={(event) => setField('bloodGlucoseMgDl', event.target.value)} />
            </LabeledField>
            <LabeledField label="Pain Score (0-10)">
              <input title="Pain Score" placeholder="Pain Score" type="number" min="0" max="10" value={form.painScore} onChange={(event) => setField('painScore', event.target.value)} />
            </LabeledField>
            <LabeledField label="Consciousness">
              <select title="Consciousness" value={form.consciousness} onChange={(event) => setField('consciousness', event.target.value as Consciousness)}>
                <option value="alert">alert</option>
                <option value="altered">altered</option>
                <option value="avpu_v">avpu_v</option>
                <option value="avpu_p">avpu_p</option>
                <option value="avpu_u">avpu_u</option>
              </select>
            </LabeledField>
            <LabeledField label="Pregnant">
              <select title="Pregnant" value={String(form.pregnant)} onChange={(event) => setField('pregnant', event.target.value === 'true')}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </LabeledField>
            <LabeledField label="Trimester (0 if N/A)">
              <input title="Trimester" placeholder="Trimester" type="number" min="0" max="3" value={form.trimester} onChange={(event) => setField('trimester', event.target.value)} />
            </LabeledField>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <LabeledField label="Chronic Conditions (comma-separated)">
              <input title="Chronic Conditions" placeholder="Chronic Conditions" value={form.chronicConditions} onChange={(event) => setField('chronicConditions', event.target.value)} />
            </LabeledField>
            <LabeledField label="Current Medications (comma-separated)">
              <input title="Current Medications" placeholder="Current Medications" value={form.currentMedications} onChange={(event) => setField('currentMedications', event.target.value)} />
            </LabeledField>
            <LabeledField label="Known Allergies (comma-separated)">
              <input title="Known Allergies" placeholder="Known Allergies" value={form.knownAllergies} onChange={(event) => setField('knownAllergies', event.target.value)} />
            </LabeledField>
            <LabeledField label="Assign Doctor">
              <select title="Assign Doctor" value={form.doctorId} onChange={(event) => setField('doctorId', event.target.value)}>
                <option value="">-- Any Doctor --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.full_name}</option>
                ))}
              </select>
            </LabeledField>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => void runTriageScoring()} disabled={saving} className={primaryButtonClass('teal')}>
              Check Result
            </button>
            <button type="button" onClick={() => void sendAssessmentToDoctor('doctor')} disabled={saving || !assessment} className={primaryButtonClass('blue')}>
              Send to Doctor
            </button>
            <button type="button" onClick={() => clearRunState()} disabled={saving} className={primaryButtonClass('amber')}>
              Reset Output
            </button>
          </div>

          <div className="mt-6">
            <AiTriageEvaluator
              symptoms={form.symptoms}
              chiefComplaint={form.chiefComplaint}
              ageYears={form.ageYears}
              chronicConditions={form.chronicConditions}
              knownAllergies={form.knownAllergies}
              vitals={{
                heartRate: form.heartRate,
                systolicBp: form.systolicBp,
                diastolicBp: form.diastolicBp,
                oxygenSaturation: form.oxygenSaturation,
                temperatureC: form.temperatureC,
                respiratoryRate: form.respiratoryRate,
                painScore: form.painScore,
              }}
            />
          </div>
      </article>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[20px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-slate-900">Triage Assessment Report</h2>
          <div className={banner.kind === 'error' ? 'mt-3 block rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700' : banner.kind === 'ok' ? 'mt-3 block rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700' : 'mt-3 hidden'}>
            {banner.message}
          </div>
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Status</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {assessment ? 'AI analysis is complete and ready for clinician review.' : 'Run Check Result to generate the triage assessment report.'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Risk Summary</p>
                  <p className="mt-1 text-sm text-slate-600">A quick view of urgency, score, and routing outcome.</p>
                </div>
                <div className={['inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.04em]', severityClass].join(' ')}>
                  {assessment ? formatHumanLabel(assessment.severity) : 'No severity yet'}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <ReportMetric label="Clinical Score" value={assessment ? `${score} / 100` : 'Not available'} />
                <ReportMetric label="Recommended Action" value={assessment ? formatHumanLabel(assessment.recommendedAction) : 'Not available'} />
                <ReportMetric label="Routing" value={assessment ? routeLabel : 'Not available'} />
                <ReportMetric label="AI Severity" value={assessment ? formatShortValue(assessment.aiSeverity ? formatHumanLabel(assessment.aiSeverity) : '') : 'Not available'} />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <span>Risk score</span>
                  <span>{assessment ? `${score}%` : '0%'}</span>
                </div>
                <div className="mt-2 grid h-3 grid-cols-10 gap-1 overflow-hidden rounded-full bg-slate-200 p-0.5">
                  {Array.from({ length: 10 }, (_, index) => {
                    const filledSegments = assessment ? Math.max(0, Math.ceil(score / 10)) : 0;
                    const filled = index < filledSegments;
                    return (
                      <span
                        key={`risk-segment-${index}`}
                        className={filled ? 'rounded-full bg-[linear-gradient(90deg,#16a34a,#f59e0b,#dc2626)]' : 'rounded-full bg-slate-200'}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Clinical Interpretation</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {assessment ? primaryRecommendation : 'No clinical interpretation is available yet.'}
              </p>
              <div className="mt-4 grid gap-3">
                {(assessment?.suggestions?.length ? assessment.suggestions : ['No clinical suggestions returned yet.']).map((suggestion, index) => (
                  <div key={`${suggestion}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-900">Guidance {index + 1}:</span> {suggestion}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Patient Overview</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <ReportMetric label="Chief Complaint" value={form.chiefComplaint || 'Not recorded'} />
                <ReportMetric label="Symptoms" value={symptomSummary} />
                <ReportMetric label="Vitals Summary" value={buildVitalsSummary(form)} />
                <ReportMetric label="Consciousness" value={formatHumanLabel(form.consciousness)} />
                <ReportMetric label="Allergies" value={allergySummary} />
                <ReportMetric label="Onset" value={form.onsetHours ? `${form.onsetHours} hours` : 'Not recorded'} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Model and Confidence</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <ReportMetric label="Model" value={assessment ? formatShortValue(assessment.aiModelVersion || (assessment.aiFallbackUsed ? 'Rules-based fallback' : '')) : 'Not available'} />
                <ReportMetric label="Confidence" value={assessment ? confidenceText : 'Not available'} />
                <ReportMetric label="AI Score" value={assessment ? formatShortValue(assessment.aiScore) : 'Not available'} />
                <ReportMetric label="Reasoning Source" value={assessment ? (assessment.aiFallbackUsed ? 'Rule-based fallback with AI assist disabled or unavailable' : 'AI scorer response') : 'Not available'} />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <span>Confidence</span>
                  <span>{assessment ? confidenceText : '0%'}</span>
                </div>
                <div className="mt-2 grid h-3 grid-cols-10 gap-1 overflow-hidden rounded-full bg-slate-200 p-0.5">
                  {Array.from({ length: 10 }, (_, index) => {
                    const filledSegments = assessment ? Math.max(0, Math.ceil(confidenceValue / 10)) : 0;
                    const filled = index < filledSegments;
                    return (
                      <span
                        key={`confidence-segment-${index}`}
                        className={filled ? 'rounded-full bg-[linear-gradient(90deg,#0f766e,#0284c7)]' : 'rounded-full bg-slate-200'}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[20px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-slate-900">Assessment Narrative</h2>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Primary Recommendation</p>
            <p className="mt-2 leading-7">{assessment ? primaryRecommendation : 'No recommendation yet.'}</p>

            <div className="my-4 h-px bg-slate-200" />

            <p className="font-semibold text-slate-900">Reasoning and Safety Notes</p>
            <p className="mt-2 leading-7">{reasonsSummary}</p>

            <div className="my-4 h-px bg-slate-200" />

            <p className="font-semibold text-slate-900">System Route</p>
            <p className="mt-2 leading-7">{assessment ? `This assessment is aligned to ${routeLabel}.` : 'No route has been prepared yet.'}</p>

            <div className="my-4 h-px bg-slate-200" />

            <p className="font-semibold text-slate-900">Recorded Inputs</p>
            <p className="mt-2 leading-7">
              {assessment
                ? `Age ${form.ageYears || 'not recorded'}, weight ${form.weightKg || 'not recorded'} kg, height ${form.heightCm || 'not recorded'} cm, complaint "${form.chiefComplaint || 'not recorded'}", symptoms ${symptomSummary}.`
                : 'No inputs have been analyzed yet.'}
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>
      <div className="[&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-300 [&>input]:bg-white [&>input]:px-3 [&>input]:py-2 [&>input]:text-sm [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:border-slate-300 [&>select]:bg-white [&>select]:px-3 [&>select]:py-2 [&>select]:text-sm [&>textarea]:min-h-24 [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-slate-300 [&>textarea]:bg-white [&>textarea]:px-3 [&>textarea]:py-2 [&>textarea]:text-sm">
        {children}
      </div>
    </label>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function primaryButtonClass(accent: 'teal' | 'blue' | 'amber') {
  const palette = {
    teal: 'bg-[linear-gradient(135deg,#0f766e,#14b8a6)]',
    blue: 'bg-[linear-gradient(135deg,#1d4ed8,#2563eb)]',
    amber: 'bg-[linear-gradient(135deg,#b45309,#ea580c)]',
  }[accent];

  return [
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50',
    palette,
  ].join(' ');
}
