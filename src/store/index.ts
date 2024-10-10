import { create } from "zustand";

import { AppSlice, createAppSlice } from "./slices/app.ts";
import { createGlassesSlice, GlassesSlice } from "./slices/glasses.ts";
import { createThemeSlice, ThemeSlice } from "./slices/theme.ts";

export const useBoundStore = create<AppSlice & GlassesSlice & ThemeSlice>(
  (...a) => ({
    ...createAppSlice(...a),
    ...createGlassesSlice(...a),
    ...createThemeSlice(...a),
  }),
);
