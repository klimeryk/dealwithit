import "jimp/browser/lib/jimp.js";
import type { Jimp } from "@jimp/core";
import type { Blit } from "@jimp/plugin-blit";
import type { ResizeClass } from "@jimp/plugin-resize";
import { BitmapImage, GifFrame, GifCodec, GifUtil } from "gifwrap";

import { getNumberOfSteps } from "../lib/utils.ts";

const { Jimp } = self;

let glassesImage: Jimp & ResizeClass & Blit;

function getResizedImage(image: Jimp & ResizeClass & Blit, size: number) {
  const isImageLong = image.bitmap.width >= image.bitmap.height;
  const width = isImageLong ? size : Jimp.AUTO;
  const height = isImageLong ? Jimp.AUTO : size;

  return image.clone().resize(width, height, Jimp.RESIZE_BICUBIC);
}

self.onmessage = (event: MessageEvent) => {
  const { configurationOptions, glasses, inputFile, inputImage } = event.data;
  const { looping, lastFrameDelay, frameDelay, numberOfFrames, size } =
    configurationOptions;
  const { x, y, url: glassesImageUrl } = glasses;
  const { renderedWidth, renderedHeight } = inputImage;
  const reader = new FileReader();

  let stepNumber = 0;
  const numberOfSteps = getNumberOfSteps(numberOfFrames);
  function reportProgress() {
    ++stepNumber;
    self.postMessage({
      type: "PROGRESS",
      progress: (stepNumber / numberOfSteps) * 100,
    });
  }

  reader.onload = async () => {
    if (!glassesImage) {
      glassesImage = await Jimp.read(glassesImageUrl);
    }
    const originalImage = await Jimp.read(reader.result as Buffer);
    reportProgress();
    const image = getResizedImage(originalImage, size);
    reportProgress();
    const { width, height } = image.bitmap;

    function getNumberOfLoops() {
      if (looping.mode === "infinite") {
        return 0;
      }

      return looping.loops;
    }

    function getLastFrameDelay() {
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

    const frames = [];
    const scaledGlassesImage = glassesImage
      .clone()
      .resize(width / 2, Jimp.AUTO, Jimp.RESIZE_BICUBIC);
    reportProgress();
    const scaledX = (width / renderedWidth) * x;
    const scaledY = (height / renderedHeight) * y;
    const yMovementPerFrame = scaledY / numberOfFrames;
    for (let frameNumber = 0; frameNumber < numberOfFrames; ++frameNumber) {
      const jimpFrame = image
        .clone()
        .blit(scaledGlassesImage, scaledX, frameNumber * yMovementPerFrame);
      const jimpBitmap = new BitmapImage(jimpFrame.bitmap);
      GifUtil.quantizeDekker(jimpBitmap, 256);
      const frame = new GifFrame(jimpBitmap, {
        delayCentisecs: Math.round(frameDelay / 10),
      });
      frames.push(frame);
      reportProgress();
    }

    const jimpFrame = image
      .clone()
      .blit(scaledGlassesImage, scaledX, numberOfFrames * yMovementPerFrame);
    const jimpBitmap = new BitmapImage(jimpFrame.bitmap);
    GifUtil.quantizeDekker(jimpBitmap, 256);
    const frame = new GifFrame(jimpBitmap, {
      delayCentisecs: getLastFrameDelay(),
    });
    frames.push(frame);
    reportProgress();

    const codec = new GifCodec();
    const gif = await codec.encodeGif(frames, { loops: getNumberOfLoops() });
    const gifBlob = new File([gif.buffer], "", { type: "image/gif" });

    const fileReader = new FileReader();
    fileReader.onload = () => {
      self.postMessage({
        type: "OUTPUT",
        gifBlob,
        resultDataUrl: fileReader.result as string,
      });
    };
    fileReader.readAsDataURL(gifBlob);
  };
  reader.readAsArrayBuffer(inputFile);
};
