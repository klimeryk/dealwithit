import { StateCreator } from "zustand";

export interface AppSlice {
  status: Status;
  setStatus: (newStatus: Status) => void;
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  status: "START",
  setStatus: (newStatus) => set(() => ({ status: newStatus })),
});
