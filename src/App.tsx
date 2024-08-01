import { useEffect, useState } from "react";
import "jimp/browser/lib/jimp.js";
import { BitmapImage, GifFrame, GifCodec, GifUtil } from "gifwrap";
import glassesImageUrl from "./assets/glasses.png";

const { Jimp } = window;

let glassesImage = null;

function App() {
  const [outputImage, setOutputImage] = useState(null);
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

  function handleGifLoad(event) {
    setOutputImage(event.target.result);
  }

  async function handleInputImageLoad(event) {
    const originalImage = await Jimp.read(event.target.result);
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
    const gif = await codec.encodeGif(frames, { loops: 3 });

    console.log("got gif!");

    const fileReader = new FileReader();
    fileReader.onload = handleGifLoad;
    fileReader.readAsDataURL(new File([gif.buffer], "", { type: "image/png" }));
  }

  function onInputImageChange(event) {
    const reader = new FileReader();
    reader.onload = handleInputImageLoad;
    reader.readAsArrayBuffer(event.target.files[0]);
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
    <div>
      <input
        type="file"
        id="input-image"
        name="input-image"
        accept="image/png, image/jpeg"
        onChange={onInputImageChange}
      />
      {renderOutputImage()}
    </div>
  );
}

export default App;
