import { MessageInstance } from "antd/es/message/interface";
import { posthog } from "posthog-js";
import type { PostHog } from "posthog-js/react";
import { StateCreator } from "zustand";

export interface AppSlice {
  messageApi: MessageInstance | undefined;
  mode: AppMode;
  posthog: PostHog;
  status: AppStatus;
  goBackToStart: () => void;
  setMessageApi: (messageApi: MessageInstance) => void;
  setMode: (newMode: AppMode) => void;
  setStatus: (newStatus: AppStatus) => void;
}

function initializePosthog() {
  const options = {
    api_host: "https://jez.emoji.build",
    ui_host: "https://eu.i.posthog.com",
    autocapture: false,
  };
  posthog.init("phc_7SZQ8Cl3ymxNbRF8K5OLMO3VOQ51MD8Gnh6UDLU17lG", options);
  if (import.meta.env.DEV) {
    posthog.debug();
  }
  if (!posthog.has_opted_in_capturing()) {
    posthog.opt_out_capturing();
  }
  return posthog;
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  messageApi: undefined,
  mode: "NORMAL",
  status: "START",
  posthog: initializePosthog(),
  goBackToStart: () =>
    set(() => ({
      status: "START",
      inputFile: undefined,
      inputImageDataUrl: "",
      glassesList: [],
      imageOptions: {
        flipVertically: false,
        flipHorizontally: false,
      },
    })),
  setMessageApi: (messageApi) => set(() => ({ messageApi })),
  setMode: (newMode) => set(() => ({ mode: newMode })),
  setStatus: (newStatus) => set(() => ({ status: newStatus })),
});
