import { ConfigProvider, message, theme } from "antd";
import { useEffect } from "react";

import { useBoundStore } from "./store/index.ts";

type Props = {
  children: React.ReactNode;
};

export function ThemeSwitcher({ children }: Props) {
  const [messageApi, contextHolder] = message.useMessage();
  const setMessageApi = useBoundStore((state) => state.setMessageApi);
  const themeMode = useBoundStore((state) => state.themeMode);
  const isDarkMode = themeMode === "dark";
  useEffect(() => {
    if (isDarkMode) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
    setMessageApi(messageApi);
  }, [isDarkMode, setMessageApi, messageApi]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      {contextHolder}
      {children}
    </ConfigProvider>
  );
}
