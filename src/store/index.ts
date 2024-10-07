import { create } from "zustand";

import { createThemeSlice, ThemeSlice } from "./slices/theme.ts";

export const useBoundStore = create<ThemeSlice>((...a) => ({
  ...createThemeSlice(...a),
}));
