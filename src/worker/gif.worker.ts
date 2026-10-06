import { Buffer } from 'buffer';
import { GifCodec } from 'gifwrap';
import { Jimp, ResizeStrategy } from 'jimp';

import {
  getGlassesImages,
  type JimpImage,
  maybeFlipImage,
  prepareReportProgress,
  renderGlassesFrame,
} from './utils.ts';

// gifwrap relies on a global Buffer, which browsers don't provide
Object.assign(globalThis, { Buffer });

function getProcessedImage(image: JimpImage, size: number, imageOptions: ImageOptions) {
  const isImageLong = image.bitmap.width >= image.bitmap.height;
  const mode = ResizeStrategy.BICUBIC;

  const processedImage = image.clone();
  processedImage.resize(isImageLong ? { w: size, mode } : { h: size, mode });
  maybeFlipImage(processedImage, imageOptions);

  return processedImage;
}

self.onmessage = (event: MessageEvent) => {
  const { configurationOptions, glassesList, inputFile, inputImage, imageOptions } = event.data;
  const { looping, numberOfFrames, size } = configurationOptions as ConfigurationOptions;
  const { renderedWidth, renderedHeight } = inputImage;
  const reader = new FileReader();

  const reportProgress = prepareReportProgress(numberOfFrames);

  reader.onload = async () => {
    const originalImage = await Jimp.read(reader.result as string);
    reportProgress();
    const image = getProcessedImage(originalImage, size, imageOptions);
    reportProgress();
    const { width, height } = image.bitmap;

    function getNumberOfLoops() {
      if (looping.mode === 'infinite') {
        return 0;
      }

      return looping.loops;
    }

    const frames = [];
    const scaleX = width / renderedWidth;
    const scaleY = height / renderedHeight;
    const glassesImages = await getGlassesImages(glassesList, scaleX, scaleY);
    reportProgress();
    for (let frameNumber = 0; frameNumber < numberOfFrames + 1; ++frameNumber) {
      frames.push(
        renderGlassesFrame(glassesList, glassesImages, image, scaleX, scaleY, frameNumber, configurationOptions),
      );
      reportProgress();
    }

    const codec = new GifCodec();
    const gif = await codec.encodeGif(frames, { loops: getNumberOfLoops() });
    const gifBlob = new File([new Uint8Array(gif.buffer)], '', { type: 'image/gif' });
    reportProgress();

    const fileReader = new FileReader();
    fileReader.onload = () => {
      self.postMessage({
        type: 'OUTPUT',
        gifBlob,
        resultDataUrl: fileReader.result as string,
      });
    };
    fileReader.readAsDataURL(gifBlob);
  };
  reader.readAsDataURL(inputFile);
};
