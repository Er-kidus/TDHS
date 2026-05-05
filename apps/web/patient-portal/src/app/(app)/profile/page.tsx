'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { AlertCircle, ArrowRight, Loader2, MessageSquareHeart, Save, UserRound } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { cn } from '../../../lib/utils';

type PatientProfile = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  profile?: {
    birthDate?: string;
    gender?: string;
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
    careNotes?: string;
    triage?: {
      severity?: string;
      symptoms?: string[];
      lastVitals?: string;
      followUp?: string;
    };
  };
};

const tabs = [
  { id: 'demographics', label: 'Demographics', icon: UserRound },
  { id: 'triage', label: 'Triage File', icon: AlertCircle },
  { id: 'support', label: 'Support', icon: MessageSquareHeart },
] as const;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('demographics');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<PatientProfile>({});

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [careNotes, setCareNotes] = useState('');
  const [severity, setSeverity] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [lastVitals, setLastVitals] = useState('');
  const [followUp, setFollowUp] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/patients/me', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Unable to load profile');
        }

        const data = (await response.json()) as PatientProfile;

        setProfile(data);

        setFullName(data.fullName ?? '');
        setEmail(data.email ?? '');
        setPhone(data.phone ?? '');
        setBirthDate(data.profile?.birthDate ?? '');
        setGender(data.profile?.gender ?? '');
        setBloodType(data.profile?.bloodType ?? '');
        setAllergies((data.profile?.allergies ?? []).join(', '));
        setChronicConditions((data.profile?.chronicConditions ?? []).join('\n'));
        setCareNotes(data.profile?.careNotes ?? '');
        setSeverity(data.profile?.triage?.severity ?? '');
        setSymptoms((data.profile?.triage?.symptoms ?? []).join(', '));
        setLastVitals(data.profile?.triage?.lastVitals ?? '');
        setFollowUp(data.profile?.triage?.followUp ?? '');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/patients/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          profile: {
            ...profile.profile,
            birthDate,
            gender,
            bloodType,
            allergies: allergies.split(',').map((x) => x.trim()).filter(Boolean),
            chronicConditions: chronicConditions.split('\n').map((x) => x.trim()).filter(Boolean),
            careNotes,
            triage: {
              ...(profile.profile?.triage ?? {}),
              severity,
              symptoms: symptoms.split(',').map((x) => x.trim()).filter(Boolean),
              lastVitals,
              followUp,
            },
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Patient profile</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Manage your identity & care file
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep your medical and contact data up to date for better care coordination.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="grid gap-3 md:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              <ArrowRight className="ml-auto h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      {activeTab === 'demographics' && (
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
            <CardDescription>Personal and contact information</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" value={fullName} onChange={setFullName} />
            <Field label="Email" value={email} onChange={setEmail} />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Birth date" value={birthDate} onChange={setBirthDate} type="date" />
            <Field label="Gender" value={gender} onChange={setGender} />
            <Field label="Blood type" value={bloodType} onChange={setBloodType} />

            <div className="md:col-span-2">
              <Field label="Allergies" value={allergies} onChange={setAllergies} />
            </div>

            <div className="md:col-span-2">
              <Label>Chronic conditions</Label>
              <Textarea
                value={chronicConditions}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setChronicConditions(e.target.value)}
                className="mt-2 min-h-28"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'triage' && (
        <Card>
          <CardHeader>
            <CardTitle>Triage File</CardTitle>
            <CardDescription>Clinical context for care teams</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Severity" value={severity} onChange={setSeverity} />
            <Field label="Last vitals" value={lastVitals} onChange={setLastVitals} />
            <Field label="Symptoms" value={symptoms} onChange={setSymptoms} />
            <Field label="Follow up" value={followUp} onChange={setFollowUp} />

            <div className="md:col-span-2">
              <Label>Care notes</Label>
              <Textarea
                value={careNotes}
                onChange={(e) => setCareNotes(e.target.value)}
                className="mt-2 min-h-28"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'support' && (
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Help and assistance options</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Contact care team via messages</p>
            <p>• Use triage for urgent symptoms</p>
            <p>• Update profile for better diagnosis accuracy</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-2"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}