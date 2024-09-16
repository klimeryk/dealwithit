import type { Bitmap, Jimp } from "@jimp/core";
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

function getMovementForFrame(
  direction: GlassesDirection,
  { width: imageWidth, height: imageHeight }: Bitmap,
  { width: glassesWidth, height: glassesHeight }: Bitmap,
  scaledX: number,
  scaledY: number,
  frameNumber: number,
  numberOfFrames: number,
) {
  if (direction === "up") {
    const yMovementPerFrame = (scaledY + glassesHeight) / numberOfFrames;
    return { x: scaledX, y: frameNumber * yMovementPerFrame - glassesHeight };
  }
  if (direction === "down") {
    const yMovementPerFrame = (imageHeight - scaledY) / numberOfFrames;
    return {
      x: scaledX,
      y: imageHeight - frameNumber * yMovementPerFrame,
    };
  }
  if (direction === "left") {
    const xMovementPerFrame = (scaledX + glassesWidth) / numberOfFrames;
    return { x: frameNumber * xMovementPerFrame - glassesWidth, y: scaledY };
  } else {
    const xMovementPerFrame = (imageWidth - scaledX) / numberOfFrames;
    return {
      x: imageWidth - frameNumber * xMovementPerFrame,
      y: scaledY,
    };
  }
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
  for (const glasses of glassesList) {
    const scaledX = scaleX * glasses.coordinates.x;
    const scaledY = scaleY * glasses.coordinates.y;
    const movement = getMovementForFrame(
      glasses.direction,
      originalImage.bitmap,
      glassesImage.bitmap,
      scaledX,
      scaledY,
      frameNumber,
      numberOfFrames,
    );
    jimpFrame.blit(glassesImage, movement.x, movement.y);
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
