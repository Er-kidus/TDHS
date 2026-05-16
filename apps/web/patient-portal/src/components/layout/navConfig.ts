import {
  CalendarDays,
  FileText,
  FlaskConical,
  Home,
  HeartHandshake,
  HeartPulse,
  Pill,
  ClipboardList,
  BookHeart,
  Baby,
  Siren,
  Clapperboard,
  Brain,
  BarChart3,
  ReceiptText,
  Stethoscope,
  Video,
} from "lucide-react";
import type { ComponentType } from "react";
import type { Mode } from "@/stores/modeStore";

export type NavItem = {
  href: string;
  label: string;
  labelKey:
    | "nav.startSession"
    | "nav.dashboard"
    | "nav.appointments"
    | "nav.doctors"
    | "nav.medicalRecords"
    | "nav.prescriptions"
    | "nav.labResults"
    | "nav.chronicCare"
    | "nav.pregnancy"
    | "nav.recurrentMeds"
    | "nav.messages"
    | "nav.sessionHistory"
    | "nav.sessionRecordings"
    | "nav.medications"
    | "nav.healthAssistant"
    | "nav.aiAssistant"
    | "nav.reports";
  icon: ComponentType<{ className?: string }>;
  modes: Mode[];
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", labelKey: "nav.dashboard", icon: Home, modes: ["care", "telemedicine", "pharmacy"] },
  { href: "/telemedicine", label: "Talk to a Doctor", labelKey: "nav.startSession", icon: HeartHandshake, modes: ["telemedicine"] },
  { href: "/appointments", label: "My Appointments", labelKey: "nav.appointments", icon: CalendarDays, modes: ["care"] },
  { href: "/medical-records", label: "My Health Records", labelKey: "nav.medicalRecords", icon: FileText, modes: ["care"] },
  { href: "/prescriptions", label: "Prescriptions", labelKey: "nav.prescriptions", icon: ReceiptText, modes: ["care","pharmacy"] },
  { href: "/lab-results", label: "Lab Results", labelKey: "nav.labResults", icon: FlaskConical, modes: ["care"] },
  { href: "/chronic-care", label: "Chronic Care", labelKey: "nav.chronicCare", icon: BookHeart, modes: ["care"] },
  { href: "/pregnancy", label: "Pregnancy", labelKey: "nav.pregnancy", icon: Baby, modes: ["care"] },
  { href: "/recurrent-medications", label: "Recurring Medications", labelKey: "nav.recurrentMeds", icon: Siren, modes: ["care"] },
  { href: "/doctors", label: "Find a Doctor", labelKey: "nav.doctors", icon: Stethoscope, modes: ["telemedicine"] },
  { href: "/messages", label: "Care Messages", labelKey: "nav.messages", icon: HeartPulse, modes: ["telemedicine"] },
  { href: "/session-history", label: "My Visits", labelKey: "nav.sessionHistory", icon: ClipboardList, modes: ["telemedicine"] },
  { href: "/session-recordings", label: "Past Consultations", labelKey: "nav.sessionRecordings", icon: Clapperboard, modes: ["telemedicine"] },
  { href: "/medications", label: "Medications", labelKey: "nav.medications", icon: Pill, modes: ["pharmacy"] },
  { href: "/health-assistant", label: "Health Assistant", labelKey: "nav.healthAssistant", icon: Brain, modes: ["pharmacy"] },
  { href: "/ai-assistant", label: "Get Help", labelKey: "nav.aiAssistant", icon: Brain, modes: ["telemedicine"] },
  { href: "/reports", label: "Reports", labelKey: "nav.reports", icon: BarChart3, modes: ["pharmacy"] },
];

function byMode(mode: Mode) {
  return navItems.filter((item) => item.modes.includes(mode));
}

export function mobilePrimaryNavByMode(mode: Mode) {
  if (mode === "care") {
    return byMode(mode).filter((item) => ["/dashboard", "/appointments", "/prescriptions", "/lab-results", "/chronic-care"].includes(item.href)).slice(0, 5);
  }
  if (mode === "telemedicine") {
    return byMode(mode).filter((item) => ["/dashboard", "/telemedicine", "/messages", "/session-history", "/ai-assistant"].includes(item.href)).slice(0, 5);
  }
  return byMode(mode).filter((item) => ["/dashboard", "/medications", "/health-assistant", "/reports"].includes(item.href)).slice(0, 5);
}

export const quickActionsByMode: Record<Mode, { href: string; label: string; icon: ComponentType<{ className?: string }> }[]> = {
  care: [
    { href: "/appointments", label: "Book Appointment", icon: CalendarDays },
    { href: "/medical-records", label: "Open Records", icon: FileText },
    { href: "/chronic-care", label: "Chronic Care", icon: BookHeart },
    { href: "/pregnancy", label: "Pregnancy Tracker", icon: Baby },
  ],
  telemedicine: [
    { href: "/telemedicine", label: "Talk to a Doctor", icon: HeartHandshake },
    { href: "/messages", label: "Care Messages", icon: HeartPulse },
    { href: "/doctors", label: "Find a Doctor", icon: Stethoscope },
    { href: "/session-history", label: "My Visits", icon: ClipboardList },
  ],
  pharmacy: [
    { href: "/medications", label: "Medication Tracker", icon: Pill },
    { href: "/health-assistant", label: "Health Assistant", icon: Brain },
    { href: "/reports", label: "Adherence Reports", icon: BarChart3 },
  ],
};

export function navItemsByMode(mode: Mode) {
  return byMode(mode);
}
