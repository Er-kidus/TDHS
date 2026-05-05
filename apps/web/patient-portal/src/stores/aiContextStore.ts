import { create } from "zustand";
import type { Mode } from "@/stores/modeStore";

type AiContext = {
  mode: Mode;
  page: string;
  patientName: string;
  medications: string[];
  appointments: string[];
  setContext: (ctx: Partial<Omit<AiContext, "setContext">>) => void;
};

export const useAiContextStore = create<AiContext>((set) => ({
  mode: "care",
  page: "/dashboard",
  patientName: "",
  medications: [],
  appointments: [],
  setContext: (ctx) => set((state) => ({ ...state, ...ctx })),
}));
