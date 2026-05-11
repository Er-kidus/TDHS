import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "care" | "telemedicine" | "pharmacy";

type ModeStore = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

export const useModeStore = create<ModeStore>()(
  persist(
    (set) => ({
      mode: "care",
      setMode: (mode) => set({ mode }),
    }),
    { name: "tenadam-patient-mode" }
  )
);
