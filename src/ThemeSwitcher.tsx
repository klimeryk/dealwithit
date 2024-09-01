import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { ConfigProvider, Segmented, theme } from "antd";
import { useEffect, useState } from "react";

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

function ThemeSwitcher({ children }: Props) {
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
      <Segmented
        className="absolute top-0 right-0 mr-2 mt-2"
        onChange={onThemeModeChange}
        defaultValue={themeMode}
        options={[
          { value: "light", icon: <SunOutlined /> },
          { value: "dark", icon: <MoonOutlined /> },
        ]}
      />
      {children}
    </ConfigProvider>
  );
}

export default ThemeSwitcher;
