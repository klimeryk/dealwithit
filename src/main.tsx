import { DndContext } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { PostHogProvider } from "posthog-js/react";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import ThemeSwitcher from "./ThemeSwitcher.tsx";

import "./index.css";

declare global {
  interface Window {
    Jimp: typeof import("jimp");
  }
}

const options = {
  api_host: "https://jez.emoji.build",
  ui_host: "https://eu.i.posthog.com",
  autocapture: false,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <PostHogProvider
    apiKey="phc_7SZQ8Cl3ymxNbRF8K5OLMO3VOQ51MD8Gnh6UDLU17lG"
    options={options}
  >
    <React.StrictMode>
      <DndContext modifiers={[restrictToParentElement]}>
        <ThemeSwitcher>
          <App />
        </ThemeSwitcher>
      </DndContext>
    </React.StrictMode>
  </PostHogProvider>,
);
