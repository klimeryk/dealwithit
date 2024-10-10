import { StateCreator } from "zustand";

export interface AppSlice {
  mode: AppMode;
  status: AppStatus;
  setMode: (newMode: AppMode) => void;
  setStatus: (newStatus: AppStatus) => void;
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  mode: "NORMAL",
  status: "START",
  setMode: (newMode) => set(() => ({ mode: newMode })),
  setStatus: (newStatus) => set(() => ({ status: newStatus })),
});
