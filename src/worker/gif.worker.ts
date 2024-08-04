import "jimp/browser/lib/jimp.js";
import type { Jimp } from "@jimp/core";
import type { ResizeClass } from "@jimp/plugin-resize";
import { BitmapImage, GifFrame, GifCodec, GifUtil } from "gifwrap";

const { Jimp } = self;

const DEFAULT_IMAGE_SIZE = 160;

let glassesImage: Jimp & ResizeClass;

self.onmessage = (event: MessageEvent) => {
  const { configurationOptions, glasses, inputFile } = event.data;
  const { looping, lastFrameDelay, frameDelay, numberOfFrames, size } =
    configurationOptions;
  const { x, y, url: glassesImageUrl } = glasses;
  const reader = new FileReader();
  reader.onload = async () => {
    if (!glassesImage) {
      glassesImage = await Jimp.read(glassesImageUrl);
    }
    const originalImage = await Jimp.read(reader.result as Buffer);
    const image = originalImage.resize(
      size.width,
      size.height,
      Jimp.RESIZE_BICUBIC,
    );

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
      .resize(size.width / 2, Jimp.AUTO, Jimp.RESIZE_BICUBIC);
    const scaledX = (size.height / DEFAULT_IMAGE_SIZE) * x;
    const scaledY = (size.width / DEFAULT_IMAGE_SIZE) * y;
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

    const codec = new GifCodec();
    const gif = await codec.encodeGif(frames, { loops: getNumberOfLoops() });
    const gifBlob = new File([gif.buffer], "", { type: "image/gif" });

    const fileReader = new FileReader();
    fileReader.onload = () => {
      self.postMessage({ gifBlob, resultDataUrl: fileReader.result as string });
    };
    fileReader.readAsDataURL(gifBlob);
  };
  reader.readAsArrayBuffer(inputFile);
};
