'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, Lock, Loader2, MessageCircle, Settings2, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { cn } from '../../../lib/utils';
import { useI18n } from '@/hooks/useI18n';

const tabs = [
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Bell },
  { id: 'support', label: 'Help and support', icon: MessageCircle },
] as const;

export default function SettingsPage() {
  const { locale, setLocale } = useI18n();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('security');
  const [loading, setLoading] = useState(true);
  const [savingConsent, setSavingConsent] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailDigests, setEmailDigests] = useState(true);
  const [shareLearningSamples, setShareLearningSamples] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/ai/consent', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json() as { consent?: boolean };
          setAiConsent(Boolean(data.consent));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load settings');
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const saveConsent = async (value: boolean) => {
    setSavingConsent(true);
    try {
      const response = await fetch('/api/ai/consent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: value, shareLearningSamples }),
      });
      if (!response.ok) {
        throw new Error('Failed to update AI consent');
      }
      setAiConsent(value);
      toast.success('AI consent updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update AI consent');
    } finally {
      setSavingConsent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border bg-card shadow-soft">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Settings center</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Security, privacy, and experience controls</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Tune how the portal handles AI assistance, notifications, and language preferences.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            <Settings2 className="h-4 w-4 text-primary" />
            Current locale: {locale.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'security' && (
        <Card className="border-border bg-card text-foreground">
          <CardHeader>
            <CardTitle className="text-foreground">Security</CardTitle>
            <CardDescription className="text-muted-foreground">Protect your sign-in and keep your portal sessions current.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow title="Two-factor authentication" description="Enable a second step during sign in." checked />
            <SettingRow title="Session timeout" description="Require re-authentication after inactivity." checked />
            <div className="rounded-2xl border border-amber-400/30 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Security note
              </div>
              <p className="mt-2">Keep your account profile accurate so care teams can verify identity during telemedicine visits and prescription workflows.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'privacy' && (
        <Card className="border-border bg-card text-foreground">
          <CardHeader>
            <CardTitle className="text-foreground">Privacy and AI consent</CardTitle>
            <CardDescription className="text-muted-foreground">Control how your data can be used for care, summaries, and learning.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow title="Allow AI assistance" description="Let the assistant summarize care, triage, and telemedicine sessions." checked={aiConsent} onToggle={saveConsent} loading={savingConsent} />
            <SettingRow title="Share de-identified learning samples" description="Store anonymized samples for future model improvement." checked={shareLearningSamples} onToggle={setShareLearningSamples} />
            <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Consent controls
              </div>
              <p className="mt-2">Consent is required before AI samples are stored. You can revoke it at any time.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="border-border bg-card text-foreground">
          <CardHeader>
            <CardTitle className="text-foreground">Preferences</CardTitle>
            <CardDescription className="text-muted-foreground">Set how the portal looks, sounds, and communicates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow title="Push notifications" description="Receive live reminders for appointments and results." checked={pushNotifications} onToggle={setPushNotifications} />
            <SettingRow title="Weekly email digest" description="Get a compact summary of your care activity." checked={emailDigests} onToggle={setEmailDigests} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <Label className="text-muted-foreground">Language</Label>
                <div className="mt-2 flex gap-2">
                  <ChoiceButton active={locale === 'en'} onClick={() => setLocale('en')} label="English" />
                  <ChoiceButton active={locale === 'am'} onClick={() => setLocale('am')} label="Amharic" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <Label className="text-muted-foreground">Theme</Label>
                <p className="mt-2 text-sm text-muted-foreground">Use the theme toggle in the header to switch between light and dark viewing modes.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'support' && (
        <Card className="border-border bg-card text-foreground">
          <CardHeader>
            <CardTitle className="text-foreground">Help and support</CardTitle>
            <CardDescription className="text-muted-foreground">Find the quickest path to care support and portal help.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <SupportCard title="Care chat" description="Open messages for doctor, nurse, or pharmacy support." />
            <SupportCard title="Portal guidance" description="Use the help center to learn appointments, billing, and records workflows." />
            <SupportCard title="Emergency escalation" description="Use urgent symptoms and triage pathways for faster clinical review." />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SettingRow({ title, description, checked, onToggle, loading }: { title: string; description: string; checked: boolean; onToggle?: (value: boolean) => void; loading?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4">
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={(value: boolean) => onToggle?.(Boolean(value))} disabled={loading} />
    </div>
  );
}

function ChoiceButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={cn('rounded-xl px-4 py-2 text-sm transition', active ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:bg-muted/70')}>
      {label}
    </button>
  );
}

function SupportCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
