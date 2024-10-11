import { produce } from "immer";
import { StateCreator } from "zustand";

import { AppSlice } from "./app.ts";

export interface ImageSlice {
  imageOptions: ImageOptions;
  inputFile: File | undefined;
  inputImageDataUrl: string;
  outputImage: Blob | undefined;
  outputImageDataUrl: string;
  setInputFile: (file: File) => void;
  setOutputImage: (imageBlob: Blob, imageDataUrl: string) => void;
  toggleImageOption: (field: keyof ImageOptions) => void;
}

export const createImageSlice: StateCreator<
  ImageSlice & AppSlice,
  [],
  [],
  ImageSlice
> = (set, get) => ({
  imageOptions: { flipVertically: false, flipHorizontally: false },
  inputFile: undefined,
  inputImageDataUrl: "",
  outputImage: undefined,
  outputImageDataUrl: "",

  setInputFile: async (file) => {
    const detectedMode = file.name.match(/(hedgehog|posthog)/gi)
      ? "HEDGEHOG"
      : "NORMAL";

    get().posthog.capture("user_selected_input_file", {
      mode: detectedMode,
      fileType: file.type,
    });

    const fileAsDataUrl = await getDataUrl(file);
    set(() => ({
      mode: detectedMode,
      inputFile: file,
      inputImageDataUrl: fileAsDataUrl,
      status: "DETECTING",
    }));
  },

  setOutputImage: (imageBlob, imageDataUrl) =>
    set(() => ({
      outputImage: imageBlob,
      outputImageDataUrl: imageDataUrl,
      successCount: get().successCount + 1,
    })),

  toggleImageOption: (field: keyof ImageOptions) =>
    set(
      produce((draft) => {
        draft.imageOptions[field] = !draft.imageOptions[field];
      }),
    ),
});

function getDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
