import type { Jimp } from "@jimp/core";
import type { Blit } from "@jimp/plugin-blit";
import { BitmapImage, GifFrame, GifUtil } from "gifwrap";

export function prepareReportProgress(numberOfFrames: number) {
  let stepNumber = 0;
  const numberOfSteps = numberOfFrames + 4;
  return function reportProgress() {
    ++stepNumber;
    self.postMessage({
      type: "PROGRESS",
      progress: (stepNumber / numberOfSteps) * 100,
    });
  };
}

function getLastFrameDelay({
  looping,
  lastFrameDelay,
  frameDelay,
}: ConfigurationOptions) {
  if (looping.mode === "off") {
    // If you waited for a day, you deserve to see this workaround...
    // Since there is no way to not loop a gif using gifwrap,
    // let's just put a reeeeaaaaallly long delay after the last frame.
    return 8640000;
  }

  return Math.round(
    (lastFrameDelay.enabled && lastFrameDelay.value > 0
      ? lastFrameDelay.value
      : frameDelay) / 10,
  );
}

export function renderGlassesFrame(
  glassesList: Glasses[],
  glassesImage: Jimp,
  originalImage: Jimp & Blit,
  scaleX: number,
  scaleY: number,
  frameNumber: number,
  configurationOptions: ConfigurationOptions,
) {
  const { numberOfFrames, frameDelay } = configurationOptions;
  const jimpFrame = originalImage.clone();
  for (const glassesInstance of glassesList) {
    const scaledX = scaleX * glassesInstance.coordinates.x;
    const scaledY = scaleY * glassesInstance.coordinates.y;
    const yMovementPerFrame = scaledY / numberOfFrames;
    jimpFrame.blit(glassesImage, scaledX, frameNumber * yMovementPerFrame);
  }
  const jimpBitmap = new BitmapImage(jimpFrame.bitmap);
  GifUtil.quantizeDekker(jimpBitmap, 256);
  return new GifFrame(jimpBitmap, {
    delayCentisecs:
      frameNumber !== numberOfFrames
        ? Math.round(frameDelay / 10)
        : getLastFrameDelay(configurationOptions),
  });
}
