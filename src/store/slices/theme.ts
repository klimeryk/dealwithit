import { StateCreator } from "zustand";

export type ThemeMode = "dark" | "light";

export interface ThemeSlice {
  themeMode: ThemeMode;
  setThemeMode: (newTheme: ThemeMode) => void;
}

function getInitialThemeModePreference(): ThemeMode {
  const savedThemeMode = localStorage.getItem("theme");
  if (
    savedThemeMode &&
    (savedThemeMode === "light" || savedThemeMode === "dark")
  ) {
    return savedThemeMode;
  }

  if (window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }

  const contentThemeMode = window.getComputedStyle(
    document.documentElement,
  ).content;
  if (
    contentThemeMode &&
    (contentThemeMode === "light" || contentThemeMode === "dark")
  ) {
    return contentThemeMode;
  }

  return "light";
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set) => ({
  themeMode: getInitialThemeModePreference(),
  setThemeMode: (newThemeMode) => set(() => ({ themeMode: newThemeMode })),
});
