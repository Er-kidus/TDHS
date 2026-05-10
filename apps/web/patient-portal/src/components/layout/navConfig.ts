import {
  CalendarDays,
  FileText,
  FlaskConical,
  Home,
  MessageSquare,
  Pill,
  ClipboardList,
  BookHeart,
  Baby,
  Siren,
  Video,
  Clapperboard,
  Brain,
  BarChart3,
  ReceiptText,
  Stethoscope,
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
  { href: "/dashboard", label: "Dashboard", labelKey: "nav.dashboard", icon: Home, modes: ["care", "telemedicine", "pharmacy"] },
  { href: "/telemedicine", label: "Start Session", labelKey: "nav.startSession", icon: Video, modes: ["telemedicine"] },
  { href: "/appointments", label: "Appointments", labelKey: "nav.appointments", icon: CalendarDays, modes: ["care"] },
  { href: "/medical-records", label: "Medical Records", labelKey: "nav.medicalRecords", icon: FileText, modes: ["care"] },
  { href: "/prescriptions", label: "Prescriptions", labelKey: "nav.prescriptions", icon: ReceiptText, modes: ["care","pharmacy"] },
  { href: "/lab-results", label: "Lab Results", labelKey: "nav.labResults", icon: FlaskConical, modes: ["care"] },
  { href: "/chronic-care", label: "Chronic Care", labelKey: "nav.chronicCare", icon: BookHeart, modes: ["care"] },
  { href: "/pregnancy", label: "Pregnancy", labelKey: "nav.pregnancy", icon: Baby, modes: ["care"] },
  { href: "/recurrent-medications", label: "Recurrent Medications", labelKey: "nav.recurrentMeds", icon: Siren, modes: ["care"] },
  { href: "/doctors", label: "Doctors", labelKey: "nav.doctors", icon: Stethoscope, modes: ["telemedicine"] },
  { href: "/messages", label: "Messages", labelKey: "nav.messages", icon: MessageSquare, modes: ["telemedicine"] },
  { href: "/session-history", label: "Session History", labelKey: "nav.sessionHistory", icon: ClipboardList, modes: ["telemedicine"] },
  { href: "/session-recordings", label: "Session Recordings", labelKey: "nav.sessionRecordings", icon: Clapperboard, modes: ["telemedicine"] },
  { href: "/medications", label: "Medications", labelKey: "nav.medications", icon: Pill, modes: ["pharmacy"] },
  { href: "/health-assistant", label: "Health Assistant", labelKey: "nav.healthAssistant", icon: Brain, modes: ["pharmacy"] },
  { href: "/ai-assistant", label: "AI Assistant", labelKey: "nav.aiAssistant", icon: Brain, modes: ["telemedicine"] },
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
    { href: "/telemedicine", label: "Join Visit", icon: Video },
    { href: "/messages", label: "Open Consult Chat", icon: MessageSquare },
    { href: "/doctors", label: "Find Clinician", icon: Stethoscope },
    { href: "/session-history", label: "Session History", icon: ClipboardList },
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
