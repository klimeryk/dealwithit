import { useEffect, useState } from "react";
import "jimp/browser/lib/jimp.js";
import { BitmapImage, GifFrame, GifCodec, GifUtil } from "gifwrap";
import type { Jimp } from "@jimp/core";
import { Card, Space } from "antd";
import glassesImageUrl from "./assets/glasses.png";

const { Jimp } = window;

let glassesImage: Jimp;

function App() {
  const [outputImage, setOutputImage] = useState<string | null>(null);
  useEffect(() => {
    async function fetchData() {
      const originalGlassesImage = await Jimp.read(glassesImageUrl);
      glassesImage = originalGlassesImage.resize(
        200,
        Jimp.AUTO,
        Jimp.RESIZE_BICUBIC,
      );
    }

    fetchData();
  }, []);

  function onInputImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      // TODO: error handling
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const originalImage = await Jimp.read(reader.result as Buffer);
      const image = originalImage.resize(256, 256, Jimp.RESIZE_BICUBIC);

      const frames = [];
      let jimpFrame = image.clone().blit(glassesImage, 0, 0);
      let jimpBitmap = new BitmapImage(jimpFrame.bitmap);
      GifUtil.quantizeDekker(jimpBitmap, 256);
      let frame = new GifFrame(jimpBitmap, { delayCentisecs: 20 });
      frames.push(frame);
      jimpFrame = image.clone().blit(glassesImage, 0, 20);
      jimpBitmap = new BitmapImage(jimpFrame.bitmap);
      GifUtil.quantizeDekker(jimpBitmap, 256);
      frame = new GifFrame(jimpBitmap, { delayCentisecs: 20 });
      frames.push(frame);
      jimpFrame = image.clone().blit(glassesImage, 0, 40);
      jimpBitmap = new BitmapImage(jimpFrame.bitmap);
      GifUtil.quantizeDekker(jimpBitmap, 256);
      frame = new GifFrame(jimpBitmap, { delayCentisecs: 20 });
      frames.push(frame);

      const codec = new GifCodec();
      const gif = await codec.encodeGif(frames, { loops: 0 });

      const fileReader = new FileReader();
      fileReader.onload = () => {
        setOutputImage(fileReader.result as string);
      };
      fileReader.readAsDataURL(
        new File([gif.buffer], "", { type: "image/png" }),
      );
    };
    reader.readAsArrayBuffer(selectedFiles[0]);
  }

  function renderOutputImage() {
    if (!outputImage) {
      return <div>No image yet!</div>;
    }

    return (
      <div>
        <img src={outputImage} />
      </div>
    );
  }

  return (
    <div className="flex shadow-xl items-center">
      <Card>
        <input
          type="file"
          id="input-image"
          name="input-image"
          accept="image/png, image/jpeg"
          onChange={onInputImageChange}
        />
        {renderOutputImage()}
      </Card>
    </div>
  );
}

export default App;
