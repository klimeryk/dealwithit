import "jimp/browser/lib/jimp.js";
import type { Jimp } from "@jimp/core";
import type { Blit } from "@jimp/plugin-blit";
import type { ResizeClass } from "@jimp/plugin-resize";
import { GifCodec } from "gifwrap";

import {
  getGlassesImages,
  maybeFlipImage,
  prepareReportProgress,
  renderGlassesFrame,
} from "./utils.ts";

const { Jimp } = self;

function getProcessedImage(
  image: Jimp & ResizeClass & Blit,
  size: number,
  imageOptions: ImageOptions,
) {
  const isImageLong = image.bitmap.width >= image.bitmap.height;
  const width = isImageLong ? size : Jimp.AUTO;
  const height = isImageLong ? Jimp.AUTO : size;

  const processedImage = image
    .clone()
    .resize(width, height, Jimp.RESIZE_BICUBIC);
  maybeFlipImage(processedImage, imageOptions);

  return processedImage;
}

self.onmessage = (event: MessageEvent) => {
  const {
    configurationOptions,
    glassesList,
    inputFile,
    inputImage,
    imageOptions,
  } = event.data;
  const { looping, numberOfFrames, size } =
    configurationOptions as ConfigurationOptions;
  const { renderedWidth, renderedHeight } = inputImage;
  const reader = new FileReader();

  const reportProgress = prepareReportProgress(numberOfFrames);

  reader.onload = async () => {
    const originalImage = await Jimp.read(reader.result as Buffer);
    reportProgress();
    const image = getProcessedImage(originalImage, size, imageOptions);
    reportProgress();
    const { width, height } = image.bitmap;

    function getNumberOfLoops() {
      if (looping.mode === "infinite") {
        return 0;
      }

      return looping.loops;
    }

    const frames = [];
    const glassesImages = await getGlassesImages(glassesList, width);
    reportProgress();
    const scaleX = width / renderedWidth;
    const scaleY = height / renderedHeight;
    for (let frameNumber = 0; frameNumber < numberOfFrames + 1; ++frameNumber) {
      frames.push(
        renderGlassesFrame(
          glassesList,
          glassesImages,
          image,
          scaleX,
          scaleY,
          frameNumber,
          configurationOptions,
        ),
      );
      reportProgress();
    }

    const codec = new GifCodec();
    const gif = await codec.encodeGif(frames, { loops: getNumberOfLoops() });
    const gifBlob = new File([gif.buffer], "", { type: "image/gif" });
    reportProgress();

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
