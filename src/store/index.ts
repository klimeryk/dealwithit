import { create } from 'zustand';

import { type AppSlice, createAppSlice } from './slices/app.ts';
import { createFaceDetectionSlice, type FaceDetectionSlice } from './slices/face-detection.ts';
import { createGlassesSlice, type GlassesSlice } from './slices/glasses.ts';
import { createImageSlice, type ImageSlice } from './slices/image.ts';
import { createThemeSlice, type ThemeSlice } from './slices/theme.ts';

export const useBoundStore = create<AppSlice & FaceDetectionSlice & GlassesSlice & ImageSlice & ThemeSlice>((...a) => ({
  ...createAppSlice(...a),
  ...createFaceDetectionSlice(...a),
  ...createGlassesSlice(...a),
  ...createImageSlice(...a),
  ...createThemeSlice(...a),
}));
