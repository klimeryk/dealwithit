import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DndContext } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

declare global {
  interface Window {
    Jimp: typeof import("jimp");
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DndContext modifiers={[restrictToParentElement]}>
      <App />
    </DndContext>
  </React.StrictMode>,
);
