export type ServiceCategory =
  | "consultation"
  | "laboratory"
  | "imaging"
  | "pharmacy"
  | "procedure"
  | "vaccination";

export type AppointmentPriority = "routine" | "urgent" | "asap";

export type ServiceDefinition = {
  id: string;
  name: string;
  description: string;
  serviceCategory: ServiceCategory;
  serviceType: string;
  active: boolean;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  requiresAppointment: boolean;
  allowsWalkin: boolean;
  requiresCheckin: boolean;
  requiredStaffTypes: Array<{ type: string; count: number; mandatory: boolean }>;
  requiredRooms: Array<{ type: string; count: number }>;
  requiredEquipment: Array<{ type: string; count: number }>;
  canTransitionTo: string[];
};

export type ResourcePool = {
  id: string;
  type: "staff" | "room" | "equipment";
  category: string;
  label: string;
  status: "available" | "busy";
};

export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    id: "general-consultation",
    name: "General Consultation",
    description: "Service blueprint for outpatient consultation",
    serviceCategory: "consultation",
    serviceType: "general_consultation",
    active: true,
    durationMinutes: 20,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
    requiresAppointment: true,
    allowsWalkin: true,
    requiresCheckin: true,
    requiredStaffTypes: [{ type: "clinician", count: 1, mandatory: true }],
    requiredRooms: [{ type: "consultation_room", count: 1 }],
    requiredEquipment: [],
    canTransitionTo: ["blood-test", "xray"],
  },
  {
    id: "blood-test",
    name: "Blood Test",
    description: "Service blueprint for laboratory tests",
    serviceCategory: "laboratory",
    serviceType: "blood_test",
    active: true,
    durationMinutes: 15,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
    requiresAppointment: true,
    allowsWalkin: true,
    requiresCheckin: true,
    requiredStaffTypes: [{ type: "lab_technician", count: 1, mandatory: true }],
    requiredRooms: [{ type: "lab_room", count: 1 }],
    requiredEquipment: [{ type: "blood_analyzer", count: 1 }],
    canTransitionTo: ["general-consultation"],
  },
  {
    id: "xray",
    name: "X-Ray",
    description: "Service blueprint for imaging",
    serviceCategory: "imaging",
    serviceType: "xray",
    active: true,
    durationMinutes: 30,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 10,
    requiresAppointment: true,
    allowsWalkin: false,
    requiresCheckin: true,
    requiredStaffTypes: [{ type: "radiology_technician", count: 1, mandatory: true }],
    requiredRooms: [{ type: "imaging_room", count: 1 }],
    requiredEquipment: [{ type: "xray_machine", count: 1 }],
    canTransitionTo: ["general-consultation"],
  },
];

export const RESOURCE_POOLS: ResourcePool[] = [
  { id: "44444444-4444-4444-8444-444444444441", type: "staff", category: "clinician", label: "Clinician Pool A", status: "available" },
  { id: "44444444-4444-4444-8444-444444444442", type: "staff", category: "lab_technician", label: "Lab Tech Pool", status: "available" },
  { id: "44444444-4444-4444-8444-444444444443", type: "staff", category: "radiology_technician", label: "Radiology Tech Pool", status: "available" },
  { id: "44444444-4444-4444-8444-444444444444", type: "room", category: "consultation_room", label: "Consultation Room 1", status: "available" },
  { id: "44444444-4444-4444-8444-444444444445", type: "room", category: "lab_room", label: "Lab Room 1", status: "available" },
  { id: "44444444-4444-4444-8444-444444444446", type: "room", category: "imaging_room", label: "Imaging Room 1", status: "busy" },
  { id: "44444444-4444-4444-8444-444444444447", type: "equipment", category: "blood_analyzer", label: "Analyzer A", status: "available" },
  { id: "44444444-4444-4444-8444-444444444448", type: "equipment", category: "xray_machine", label: "X-Ray Unit 1", status: "available" },
];

export const ORG_RESOURCE_ASSIGNMENT_PROMPT = `You are a healthcare operations assistant.

Your job is to assign optimal resources to appointments.

Rules:
- Do not depend on specific individuals unless required
- Prioritize available and least busy resources
- Minimize waiting time
- Ensure compatibility with service type`;
