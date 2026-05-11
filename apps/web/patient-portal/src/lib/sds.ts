export type ServiceCategory =
  | "consultation"
  | "laboratory"
  | "imaging"
  | "pharmacy"
  | "procedure"
  | "vaccination";

export type Priority = "routine" | "urgent" | "asap";

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

export type FacilityDefinition = {
  id: string;
  name: string;
  address: string;
  department?: string;
  latitude: number;
  longitude: number;
  nearbyHospitals: Array<{ id: string; name: string; address: string; latitude: number; longitude: number }>;
  days: Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
  startTime: string;
  endTime: string;
  slotDuration: number;
  capacityPerSlot: number;
};

export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    id: "general-consultation",
    name: "General Consultation",
    description: "In-person clinician consultation",
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
    description: "In-person laboratory blood collection and analysis",
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
    description: "In-person radiology imaging",
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

export const FACILITY_DEFINITIONS: FacilityDefinition[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Default Organization Main Clinic",
    address: "Bole Road, Addis Ababa",
    department: "Outpatient",
    latitude: 8.9806,
    longitude: 38.7578,
    nearbyHospitals: [
      {
        id: "a4f8e1cf-5a76-44de-96ea-5f73f5416da0",
        name: "St. Paul's Hospital Millennium Medical College",
        address: "Addis Ababa",
        latitude: 9.037,
        longitude: 38.7469,
      },
      {
        id: "7ba0c493-37b2-47ec-9f4a-696f3ca688f8",
        name: "Tikur Anbessa Specialized Hospital",
        address: "Lideta, Addis Ababa",
        latitude: 9.0095,
        longitude: 38.7633,
      },
      {
        id: "3e6b6d5b-13ec-4d19-8dfd-7cb2a8ad15ef",
        name: "Myungsung Christian Medical Center",
        address: "Addis Ababa",
        latitude: 8.9852,
        longitude: 38.7995,
      },
    ],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    startTime: "08:00",
    endTime: "17:00",
    slotDuration: 15,
    capacityPerSlot: 1,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "North Regional Clinic Lab Center",
    address: "Mekelle Ring Road",
    department: "Laboratory",
    latitude: 13.4967,
    longitude: 39.4769,
    nearbyHospitals: [
      {
        id: "962f7cd0-2e54-4e47-b298-88f9ed6e12c1",
        name: "Ayder Comprehensive Specialized Hospital",
        address: "Mekelle",
        latitude: 13.5015,
        longitude: 39.4826,
      },
      {
        id: "dbfa6f3a-79bb-46f4-a743-4cb5915fdafd",
        name: "Mekelle General Hospital",
        address: "Mekelle",
        latitude: 13.4932,
        longitude: 39.4732,
      },
      {
        id: "8dd5ad3e-ce11-4f6d-9221-e728b4090410",
        name: "Quiha Hospital",
        address: "Mekelle",
        latitude: 13.4828,
        longitude: 39.515,
      },
    ],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "08:30",
    endTime: "16:30",
    slotDuration: 15,
    capacityPerSlot: 2,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "City Hospital Imaging Unit",
    address: "Kazanchis Medical Block",
    department: "Radiology",
    latitude: 9.0227,
    longitude: 38.7613,
    nearbyHospitals: [
      {
        id: "6f9df3db-6e4e-40fe-938e-8f7bdb0a38bd",
        name: "Black Lion Hospital",
        address: "Addis Ababa",
        latitude: 9.0098,
        longitude: 38.7626,
      },
      {
        id: "95846f67-b84d-4999-b32c-2e4ed4677652",
        name: "Yekatit 12 Hospital Medical College",
        address: "Addis Ababa",
        latitude: 9.0397,
        longitude: 38.7586,
      },
      {
        id: "e90db8f1-fafd-443f-b57d-5c17d5c6283c",
        name: "Betezata General Hospital",
        address: "Addis Ababa",
        latitude: 9.0192,
        longitude: 38.7723,
      },
    ],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "09:00",
    endTime: "18:00",
    slotDuration: 30,
    capacityPerSlot: 1,
  },
];

export const APPOINTMENT_AI_PROMPT_PHYSICAL_ONLY = `You are an intelligent healthcare appointment scheduling assistant for physical (in-person) visits only.

You do not support virtual appointments.

Goal:
- Book appointments
- Reschedule appointments
- Optimize scheduling based on availability and preferences

Hard rules:
- Do not include virtual or online appointments
- Do not require selecting a doctor
- Always assign a physical facility/location
- Always ensure slot availability`;
