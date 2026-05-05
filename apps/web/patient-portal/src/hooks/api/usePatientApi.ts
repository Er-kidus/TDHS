"use client";

import { useQuery } from "@tanstack/react-query";

type PatientMe = {
  full_name?: string;
  email?: string;
  phone?: string;
};

type Appointment = {
  id: string;
  scheduled_at: string;
  status: string;
  reason?: string;
  notes?: string;
};

export function usePatientMe() {
  return useQuery<PatientMe>({
    queryKey: ["patient", "me"],
    queryFn: async () => {
      const res = await fetch("/api/patients/me", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch patient profile");
      return res.json();
    },
  });
}

export function useMyAppointments(limit = 10) {
  return useQuery<Appointment[]>({
    queryKey: ["patient", "appointments", limit],
    queryFn: async () => {
      const res = await fetch(`/api/appointments?limit=${limit}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = (await res.json()) as unknown;
      if (!Array.isArray(data)) return [];
      return data as Appointment[];
    },
  });
}
