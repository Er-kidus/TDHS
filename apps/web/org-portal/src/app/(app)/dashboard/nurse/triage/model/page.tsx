'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type TriageModelStatus = {
  enabled: boolean;
  modelVersion?: string;
  scorerBaseUrl?: string;
  timeoutMs?: number;
  lastActivatedAt?: string;
  auditEvents?: TriageModelAuditEvent[];
};

type TriageModelAuditEvent = {
  action?: string;
  modelVersion?: string;
  scorerBaseUrl?: string;
  actor?: string;
  reason?: string;
  at?: string;
  result?: string;
};

const DEFAULT_FRONTDOOR_BASE = process.env.NEXT_PUBLIC_TRIAGE_FRONTDOOR_URL || 'http://localhost:8090';

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/$/, '');
}

function buildHeaders(role: string, actorId: string, token: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Frontdoor-Role': role || 'admin',
  };

  if (actorId.trim()) {
    headers['X-Actor-Id'] = actorId.trim();
  }
  if (token.trim()) {
    headers['X-Model-Admin-Token'] = token.trim();
  }

  return headers;
}

function statusFields(status: TriageModelStatus) {
  return [
    ['Enabled', String(status.enabled)],
    ['Model Version', status.modelVersion || '-'],
    ['Scorer Base URL', status.scorerBaseUrl || '-'],
    ['Timeout', status.timeoutMs ? `${status.timeoutMs}ms` : '-'],
    ['Last Activated', status.lastActivatedAt || '-'],
  ] as const;
}

export default function NurseTriageModelPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_FRONTDOOR_BASE);
  const [role, setRole] = useState('admin');
  const [actorId, setActorId] = useState('');
  const [token, setToken] = useState('');
  const [modelVersion, setModelVersion] = useState('');
  const [timeoutMs, setTimeoutMs] = useState('1500');
  const [scorerBaseUrl, setScorerBaseUrl] = useState('');
  const [activateReason, setActivateReason] = useState('');
  const [rollbackReason, setRollbackReason] = useState('');
  const [status, setStatus] = useState<TriageModelStatus | null>(null);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<{ kind: 'ok' | 'error' | ''; text: string }>({ kind: '', text: '' });

  useEffect(() => {
    void refreshStatus(false);
  }, []);

  async function refreshStatus(showMessage = true) {
    try {
      setError('');
      console.log("Fetching status with headers:", buildHeaders(role, actorId, token));
      const response = await fetch(`${normalizeBaseUrl(baseUrl)}/v1/frontdoor/triage/model/status`, {
        method: 'GET',
        headers: buildHeaders(role, actorId, token),
      });
      if (!response.ok) {
        throw new Error(`status request failed with ${response.status}`);
      }
      const data = (await response.json()) as TriageModelStatus;
      setStatus(data);
      if (showMessage) {
        setBanner({ kind: 'ok', text: 'Status refreshed.' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh status';
      setError(message);
      setBanner({ kind: 'error', text: message });
    }
  }

  async function activateModel() {
    try {
      setError('');
      const response = await fetch(`${normalizeBaseUrl(baseUrl)}/v1/frontdoor/triage/model/activate`, {
        method: 'POST',
        headers: buildHeaders(role, actorId, token),
        body: JSON.stringify({
          modelVersion: modelVersion.trim(),
          scorerBaseUrl: scorerBaseUrl.trim(),
          timeoutMs: Number(timeoutMs || '1500'),
          reason: activateReason.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error(`activate failed with ${response.status}`);
      }
      const data = (await response.json()) as TriageModelStatus;
      setStatus(data);
      setBanner({ kind: 'ok', text: 'Model activated.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate model';
      setError(message);
      setBanner({ kind: 'error', text: message });
    }
  }

  async function rollbackModel() {
    try {
      setError('');
      const response = await fetch(`${normalizeBaseUrl(baseUrl)}/v1/frontdoor/triage/model/rollback`, {
        method: 'POST',
        headers: buildHeaders(role, actorId, token),
        body: JSON.stringify({
          reason: rollbackReason.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error(`rollback failed with ${response.status}`);
      }
      const data = (await response.json()) as TriageModelStatus;
      setStatus(data);
      setBanner({ kind: 'ok', text: 'Rollback completed.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rollback model';
      setError(message);
      setBanner({ kind: 'error', text: message });
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(2,132,199,0.22),transparent_36%),radial-gradient(circle_at_100%_0%,rgba(101,163,13,0.18),transparent_30%),linear-gradient(180deg,#f0f9ff_0%,#f8fafc_50%,#eef2ff_100%)] p-4 md:p-6">
      <div className="mx-auto grid max-w-6xl gap-4">
        <section className="rounded-3xl border border-white/30 bg-linear-to-r from-sky-800 via-cyan-700 to-lime-700 p-5 text-white shadow-[0_22px_56px_rgba(3,105,161,0.28)]">
          <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[0.74rem] font-bold uppercase tracking-[0.08em]">Advisory AI Control</span>
          <h1 className="mt-2 text-2xl font-semibold md:text-[1.9rem]">Triage Model Lifecycle Console</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/95 md:text-[0.95rem]">
            Activate or roll back advisory triage models with operator metadata and secured headers. This console mirrors the imported admin flow and stays pointed at the front-door service.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/dashboard/nurse/triage" className="rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
              Back to Triage
            </Link>
            <Link href="/dashboard/nurse/triage/history" className="rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-white">
              History
            </Link>
          </div>
        </section>

        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {banner.kind ? <p className={`rounded-2xl border px-3 py-2 text-sm ${banner.kind === 'ok' ? 'border-lime-300 bg-lime-50 text-lime-900' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{banner.text}</p> : null}

        <section className="grid gap-4 xl:grid-cols-2">
          <Card title="Access Context" subtitle="Headers are sent to model status, activate, and rollback endpoints.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Front Door Base URL" value={baseUrl} onChange={setBaseUrl} placeholder="http://localhost:8090" />
              <Field label="Role" value={role} onChange={setRole} placeholder="admin" />
              <Field label="Actor ID" value={actorId} onChange={setActorId} placeholder="ops-user-1" />
              <Field label="Admin Token (optional)" value={token} onChange={setToken} placeholder="optional token" />
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void refreshStatus(true)} className={buttonClass('blue')}>
                Refresh Status
              </button>
            </div>
          </Card>

          <Card title="Activate Model" subtitle="Health probe runs server-side before activation completes.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Model Version" value={modelVersion} onChange={setModelVersion} placeholder="baseline-20260328-01" />
              <Field label="Timeout (ms)" value={timeoutMs} onChange={setTimeoutMs} type="number" placeholder="1500" />
            </div>
            <Field label="Scorer Base URL" value={scorerBaseUrl} onChange={setScorerBaseUrl} placeholder="http://localhost:8090" />
            <TextareaField label="Reason" value={activateReason} onChange={setActivateReason} placeholder="Reason for activation" />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void activateModel()} className={buttonClass('teal')}>
                Activate Model
              </button>
            </div>
          </Card>
        </section>

        <section className="grid gap-4">
          <Card title="Rollback" subtitle="Rolls back to the previous activated model config from persisted history.">
            <TextareaField label="Rollback Reason" value={rollbackReason} onChange={setRollbackReason} placeholder="Reason for rollback" />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void rollbackModel()} className={buttonClass('amber')}>
                Rollback Model
              </button>
            </div>
          </Card>

          <Card title="Current Model Status" subtitle="Live status returned from the front-door service.">
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {status ? statusFields(status).map(([label, value]) => <KeyValue key={label} label={label} value={value} />) : <p className="text-sm text-slate-500">No status loaded yet.</p>}
            </div>
          </Card>

          <Card title="Audit Trail" subtitle="Most recent model lifecycle events first.">
            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.08em] text-slate-500">
                    <th className="border-b border-slate-200 px-3 py-2">At</th>
                    <th className="border-b border-slate-200 px-3 py-2">Action</th>
                    <th className="border-b border-slate-200 px-3 py-2">Model</th>
                    <th className="border-b border-slate-200 px-3 py-2">Actor</th>
                    <th className="border-b border-slate-200 px-3 py-2">Reason</th>
                    <th className="border-b border-slate-200 px-3 py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {(status?.auditEvents || []).length > 0 ? [...(status?.auditEvents || [])].sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))).map((event, index) => (
                    <tr key={`${event.at || 'event'}-${index}`} className="align-top">
                      <td className="border-b border-slate-200 px-3 py-2">{event.at || '-'}</td>
                      <td className="border-b border-slate-200 px-3 py-2">{event.action || '-'}</td>
                      <td className="border-b border-slate-200 px-3 py-2">{event.modelVersion || '-'}</td>
                      <td className="border-b border-slate-200 px-3 py-2">{event.actor || '-'}</td>
                      <td className="border-b border-slate-200 px-3 py-2">{event.reason || '-'}</td>
                      <td className="border-b border-slate-200 px-3 py-2">{event.result || '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-3 py-4 text-slate-500" colSpan={6}>No audit events yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[20px] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mb-4 text-sm text-slate-500">{subtitle}</p>
      {children}
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>
      <input
        aria-label={label}
        title={label}
        placeholder={placeholder || label}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>
      <textarea
        aria-label={label}
        title={label}
        placeholder={placeholder || label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 border-b border-dashed border-slate-200 py-1 last:border-b-0">
      <strong className="text-[0.75rem] uppercase tracking-[0.08em] text-slate-500">{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function buttonClass(accent: 'blue' | 'teal' | 'amber') {
  const classes = {
    blue: 'bg-[linear-gradient(135deg,#0284c7,#0ea5e9)]',
    teal: 'bg-[linear-gradient(135deg,#0f766e,#14b8a6)]',
    amber: 'bg-[linear-gradient(135deg,#f59e0b,#ea580c)]',
  }[accent];

  return ['rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105', classes].join(' ');
}
