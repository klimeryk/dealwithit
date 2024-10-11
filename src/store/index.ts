import { create } from "zustand";

import { AppSlice, createAppSlice } from "./slices/app.ts";
import { createGlassesSlice, GlassesSlice } from "./slices/glasses.ts";
import { createImageSlice, ImageSlice } from "./slices/image.ts";
import { createThemeSlice, ThemeSlice } from "./slices/theme.ts";

export const useBoundStore = create<
  AppSlice & GlassesSlice & ImageSlice & ThemeSlice
>((...a) => ({
  ...createAppSlice(...a),
  ...createGlassesSlice(...a),
  ...createImageSlice(...a),
  ...createThemeSlice(...a),
}));
