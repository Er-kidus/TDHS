import React, { createContext, useContext, useState } from "react";

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "M" | "F";
  phone: string;
  allergies: string[];
  bloodType: string;
  status: "active" | "admitted" | "discharged" | "emergency";
}

interface PatientContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (p: Patient | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <PatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
};
