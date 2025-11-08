import { create } from "zustand";
import { TripForm, AIPlan } from "./types";

type S = {
  form?: TripForm;
  setForm: (f: TripForm) => void;
  aiPlan?: AIPlan;
  setAIPlan: (p: AIPlan) => void;
};

export const useTrip = create<S>((set) => ({
  setForm: (form) => set({ form }),
  setAIPlan: (aiPlan) => set({ aiPlan }),
}));
