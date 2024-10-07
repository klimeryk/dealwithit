import { ConfigProvider, theme } from "antd";
import { createContext, useEffect, useState } from "react";

type ThemeContextType = {
  setTheme: (theme: string) => void;
  theme: string;
};

const defaultContextValue = {
  setTheme: () => {},
  theme: "",
};

export const ThemeContext =
  createContext<ThemeContextType>(defaultContextValue);

type Props = {
  children: React.ReactNode;
};

function getInitialThemeModePreference() {
  const savedThemeMode = localStorage.getItem("theme");
  if (savedThemeMode) {
    return savedThemeMode;
  }

  if (window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }

  return window.getComputedStyle(document.documentElement).content;
}

export function ThemeSwitcher({ children }: Props) {
  const [themeMode, setThemeMode] = useState(getInitialThemeModePreference());
  const isDarkMode = themeMode === "dark";
  useEffect(() => {
    if (isDarkMode) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  function onThemeModeChange(newThemeMode: string) {
    setThemeMode(newThemeMode);
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <ThemeContext.Provider
        value={{ setTheme: onThemeModeChange, theme: themeMode }}
      >
        {children}
      </ThemeContext.Provider>
    </ConfigProvider>
  );
}
