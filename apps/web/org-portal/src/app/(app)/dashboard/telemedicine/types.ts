export type Doctor = {
  id: string;
  full_name: string;
  email: string;
  specialty: string;
  license_number: string;
  verified: boolean;
};

export type OrgUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization_name?: string;
  active?: boolean;
  telemedicine_enabled?: boolean;
  telemedicine_modes?: string[];
};

export type Practitioner = {
  id: string;
  full_name: string;
  email?: string;
  specialty?: string;
  role: string;
  active: boolean;
  source: "org_doctors" | "org_users";
  telemedicineEnabled: boolean;
  telemedicineModes: string[];
};

export type QueueSession = {
  id: string;
  patient_id: string;
  doctor_id?: string;
  doctor_name: string;
  scheduled_at: string;
  preferred_mode?: "video" | "voice" | "chat";
  requested_amount?: number;
  requested_currency?: string;
  status: string;
  connection_status: string;
  notes?: string;
  ai_urgency_level?: string;
  ai_triage_score?: number;
  ai_specialty?: string;
};

export type Patient = {
  id: string;
  full_name: string;
  phone?: string;
};

export type OrgMe = {
  id: string;
  role: string;
  email?: string;
};

export type TelemedicineMessage = {
  id: string;
  sender: string;
  channel: string;
  content: string;
  created_at?: string;
};

export type Artifact = {
  id: string;
  session_id: string;
  patient_id: string;
  summary: string;
  final_diagnosis: string;
  recording_url?: string;
  transcript_url?: string;
  follow_up_needed: boolean;
};

export type TranscriptLine = {
  id: string;
  speaker: string;
  text: string;
  source: "voice" | "manual";
  createdAt: string;
};

export type ApiPayload =
  | Record<string, unknown>
  | string
  | null;

export type SpeechRecognitionAlternativeLike = {
  transcript?: string;
};

export type SpeechRecognitionResultLike = {
  isFinal?: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
};

export type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultLike[];
};

export type SpeechRecognitionErrorEventLike = {
  error?: string;
};

export type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};