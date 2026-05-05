import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type DoctorWorkflowPriority = "routine" | "urgent" | "asap";

export type PrescriptionRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
  status: "draft" | "pending_dispense" | "dispensed";
  createdAt: string;
  updatedAt: string;
};

export type LabOrderRecord = {
  id: string;
  orderId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  testName: string;
  indication: string;
  priority: DoctorWorkflowPriority;
  status: "pending_collection" | "received_in_lab" | "pending_review" | "finalized" | "critical";
  verificationStatus: "unverified" | "verified";
  sampleLabel: string;
  confirmedAt?: string;
  results?: {
    value: string;
    notes?: string;
    enteredAt: string;
    patientIdReentry: string;
  };
  criticalAlert: boolean;
  acknowledgedByDoctor: boolean;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FollowUpRecord = {
  id: string;
  sourceAppointmentId: string;
  followUpAppointmentId: string;
  patientId: string;
  scheduledAt: string;
  reason: string;
  notes?: string;
  createdAt: string;
};

export type VisitSummaryRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  summary: string;
  disposition: string;
  createdAt: string;
};

export type DoctorWorkflowStore = {
  prescriptions: PrescriptionRecord[];
  labOrders: LabOrderRecord[];
  followUps: FollowUpRecord[];
  visitSummaries: VisitSummaryRecord[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "doctor-workflow.json");

function emptyStore(): DoctorWorkflowStore {
  return {
    prescriptions: [],
    labOrders: [],
    followUps: [],
    visitSummaries: [],
  };
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function newLabOrderId() {
  return `LAB-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(emptyStore(), null, 2), "utf8");
  }
}

export async function readDoctorWorkflowStore(): Promise<DoctorWorkflowStore> {
  await ensureDataFile();
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DoctorWorkflowStore>;
    return {
      prescriptions: Array.isArray(parsed.prescriptions) ? parsed.prescriptions : [],
      labOrders: Array.isArray(parsed.labOrders) ? parsed.labOrders : [],
      followUps: Array.isArray(parsed.followUps) ? parsed.followUps : [],
      visitSummaries: Array.isArray(parsed.visitSummaries) ? parsed.visitSummaries : [],
    };
  } catch {
    return emptyStore();
  }
}

export async function writeDoctorWorkflowStore(store: DoctorWorkflowStore) {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function appendPrescription(
  input: Omit<PrescriptionRecord, "id" | "createdAt" | "updatedAt" | "status"> & { status?: PrescriptionRecord["status"] },
) {
  const store = await readDoctorWorkflowStore();
  const now = new Date().toISOString();
  const record: PrescriptionRecord = {
    id: newId("rx"),
    status: input.status || "pending_dispense",
    createdAt: now,
    updatedAt: now,
    appointmentId: input.appointmentId,
    patientId: input.patientId,
    medication: input.medication,
    dosage: input.dosage,
    frequency: input.frequency,
    durationDays: input.durationDays,
    instructions: input.instructions,
  };
  store.prescriptions.unshift(record);
  await writeDoctorWorkflowStore(store);
  return record;
}

export async function appendLabOrder(
  input: Omit<
    LabOrderRecord,
    "id" | "createdAt" | "updatedAt" | "orderId" | "status" | "verificationStatus" | "sampleLabel" | "criticalAlert" | "acknowledgedByDoctor"
  > & {
    orderId?: string;
    status?: LabOrderRecord["status"];
    verificationStatus?: LabOrderRecord["verificationStatus"];
    sampleLabel?: string;
    criticalAlert?: boolean;
    acknowledgedByDoctor?: boolean;
  },
) {
  const store = await readDoctorWorkflowStore();
  const now = new Date().toISOString();
  const record: LabOrderRecord = {
    id: newId("lab"),
    orderId: input.orderId || newLabOrderId(),
    status: input.status || "pending_collection",
    createdAt: now,
    updatedAt: now,
    appointmentId: input.appointmentId,
    patientId: input.patientId,
    patientName: input.patientName,
    patientDob: input.patientDob,
    testName: input.testName,
    indication: input.indication,
    priority: input.priority,
    verificationStatus: input.verificationStatus || "unverified",
    sampleLabel: input.sampleLabel || "",
    confirmedAt: input.confirmedAt,
    results: input.results,
    criticalAlert: input.criticalAlert || false,
    acknowledgedByDoctor: input.acknowledgedByDoctor || false,
    acknowledgedAt: input.acknowledgedAt,
  };
  store.labOrders.unshift(record);
  await writeDoctorWorkflowStore(store);
  return record;
}

export async function updateLabOrder(orderId: string, updater: (current: LabOrderRecord) => LabOrderRecord) {
  const store = await readDoctorWorkflowStore();
  const index = store.labOrders.findIndex((item) => item.orderId === orderId);
  if (index < 0) {
    return null;
  }
  const updated = updater(store.labOrders[index]);
  store.labOrders[index] = {
    ...updated,
    updatedAt: new Date().toISOString(),
  };
  await writeDoctorWorkflowStore(store);
  return store.labOrders[index];
}

export async function appendFollowUp(input: Omit<FollowUpRecord, "id" | "createdAt">) {
  const store = await readDoctorWorkflowStore();
  const record: FollowUpRecord = {
    id: newId("followup"),
    createdAt: new Date().toISOString(),
    sourceAppointmentId: input.sourceAppointmentId,
    followUpAppointmentId: input.followUpAppointmentId,
    patientId: input.patientId,
    scheduledAt: input.scheduledAt,
    reason: input.reason,
    notes: input.notes,
  };
  store.followUps.unshift(record);
  await writeDoctorWorkflowStore(store);
  return record;
}

export async function appendVisitSummary(input: Omit<VisitSummaryRecord, "id" | "createdAt">) {
  const store = await readDoctorWorkflowStore();
  const record: VisitSummaryRecord = {
    id: newId("visit"),
    createdAt: new Date().toISOString(),
    appointmentId: input.appointmentId,
    patientId: input.patientId,
    summary: input.summary,
    disposition: input.disposition,
  };
  store.visitSummaries.unshift(record);
  await writeDoctorWorkflowStore(store);
  return record;
}
