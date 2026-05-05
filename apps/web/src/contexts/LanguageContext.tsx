import React, { createContext, useContext, useState, useCallback } from "react";

type Language = "en" | "am";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  "app.name": { en: "Tenadam Digital Healthcare", am: "ተናደም ዲጂታል ጤና" },
  "app.tagline": { en: "Enterprise Healthcare Platform", am: "የድርጅት ጤና ስርዓት" },
  "nav.dashboard": { en: "Dashboard", am: "ዳሽቦርድ" },
  "nav.patients": { en: "Patients", am: "ታካሚዎች" },
  "nav.appointments": { en: "Appointments", am: "ቀጠሮዎች" },
  "nav.clinical": { en: "Clinical", am: "ክሊኒካል" },
  "nav.lab": { en: "Laboratory", am: "ላቦራቶሪ" },
  "nav.pharmacy": { en: "Pharmacy", am: "ፋርማሲ" },
  "nav.billing": { en: "Billing", am: "ክፍያ" },
  "nav.ward": { en: "Ward", am: "ክፍል" },
  "nav.emergency": { en: "Emergency", am: "ድንገተኛ" },
  "nav.admin": { en: "Admin", am: "አስተዳዳሪ" },
  "nav.superadmin": { en: "Super Admin", am: "ዋና አስተዳዳሪ" },
  "nav.audit": { en: "Audit & AI", am: "ኦዲት እና AI" },
  "nav.portal": { en: "Patient Portal", am: "የታካሚ ፖርታል" },
  "nav.registration": { en: "Registration", am: "ምዝገባ" },
  "login.title": { en: "Sign in to your account", am: "ወደ መለያዎ ይግቡ" },
  "login.email": { en: "Email or Username", am: "ኢሜይል ወይም የተጠቃሚ ስም" },
  "login.password": { en: "Password", am: "የይለፍ ቃል" },
  "login.remember": { en: "Remember me", am: "አስታውሰኝ" },
  "login.forgot": { en: "Forgot password?", am: "የይለፍ ቃል ረሰተዋል?" },
  "login.signin": { en: "Sign In", am: "ግባ" }, 
  "login.system_status": { en: "System Status", am: "የስርዓት ሁኔታ" },
  "login.operational": { en: "All systems operational", am: "ሁሉም ስርዓቶች እየሰሩ ናቸው" },
  "common.search": { en: "Search...", am: "ፈልግ..." },
  "common.online": { en: "Online", am: "በመስመር ላይ" },
  "common.offline": { en: "Offline", am: "ከመስመር ውጭ" },
  "common.syncing": { en: "Syncing...", am: "በማመሳሰል ላይ..." },
  "common.new_patient": { en: "New Patient", am: "አዲስ ታካሚ" },
  "common.today": { en: "Today", am: "ዛሬ" },
  "common.queue": { en: "Queue", am: "ሰልፍ" },
  "common.actions": { en: "Actions", am: "ድርጊቶች" },
  "common.status": { en: "Status", am: "ሁኔታ" },
  "common.name": { en: "Name", am: "ስም" },
  "common.save": { en: "Save", am: "አስቀምጥ" },
  "common.cancel": { en: "Cancel", am: "ሰርዝ" },
  "common.next": { en: "Next", am: "ቀጣይ" },
  "common.back": { en: "Back", am: "ተመለስ" },
  "common.submit": { en: "Submit", am: "አስገባ" },
  "common.view": { en: "View", am: "ይመልከቱ" },
  "common.edit": { en: "Edit", am: "አርትዕ" },
  "common.delete": { en: "Delete", am: "ሰርዝ" },
  "dashboard.welcome": { en: "Welcome back", am: "እንኳን ደህና መጡ" },
  "dashboard.total_patients": { en: "Total Patients", am: "ጠቅላላ ታካሚዎች" },
  "dashboard.today_appointments": { en: "Today's Appointments", am: "የዛሬ ቀጠሮዎች" },
  "dashboard.in_queue": { en: "In Queue", am: "በሰልፍ ላይ" },
  "dashboard.active_cases": { en: "Active Cases", am: "ንቁ ጉዳዮች" },
  "patient.id": { en: "Patient ID", am: "የታካሚ መለያ" },
  "patient.demographics": { en: "Demographics", am: "ስነ-ሕዝብ" },
  "patient.history": { en: "Medical History", am: "የሕክምና ታሪክ" },
  "patient.documents": { en: "Documents", am: "ሰነዶች" },
  "patient.vitals": { en: "Vitals", am: "ውጤቶች" },
  "patient.allergies": { en: "Allergies", am: "አለርጂዎች" },
  "role.reception": { en: "Reception", am: "አቀባበል" },
  "role.doctor": { en: "Doctor", am: "ሐኪም" },
  "role.nurse": { en: "Nurse", am: "ነርስ" },
  "role.admin": { en: "Admin", am: "አስተዳዳሪ" },
  "role.superadmin": { en: "Super Admin", am: "ዋና አስተዳዳሪ" },
  "role.pharmacist": { en: "Pharmacist", am: "ፋርማሲስት" },
  "role.lab": { en: "Lab Technician", am: "የላብ ቴክኒሻን" },
  "role.patient": { en: "Patient", am: "ታካሚ" },
  "offline.banner": { en: "You are currently offline. Changes will sync when connection is restored.", am: "አሁን ከመስመር ውጭ ነዎት። ግንኙነት ሲመለስ ለውጦች ይመሳሰላሉ።" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string) => {
      return translations[key]?.[language] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
