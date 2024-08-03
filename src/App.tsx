import { useEffect, useState } from "react";
import "jimp/browser/lib/jimp.js";
import { BitmapImage, GifFrame, GifCodec, GifUtil } from "gifwrap";
import type { Jimp } from "@jimp/core";
import { Button, Card } from "antd";
import glassesImageUrl from "./assets/glasses.png";
import type { UploadProps } from "antd";
import { Upload } from "antd";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Jimp } = window;

let glassesImage: Jimp;

const getDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function App() {
  const [inputFile, setInputFile] = useState<File>();
  const [inputImageDataUrl, setInputImageDataUrl] = useState<string>();
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

  function renderFileInput() {
    const props: UploadProps = {
      name: "file",
      multiple: false,
      accept: "image/png, image/jpeg",
      customRequest: async (info) => {
        const selectedFile = info.file as File;
        setInputFile(selectedFile);

        const selectedFileAsDataUrl = await getDataUrl(selectedFile);
        setInputImageDataUrl(selectedFileAsDataUrl);
      },
    };
    return (
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from
          uploading company data or other banned files.
        </p>
      </Dragger>
    );
  }

  function renderInputImage() {
    function handleRemoveInputImage() {
      setInputImageDataUrl("");
      setInputFile(undefined);
    }

    return (
      <div className="flex flex-col gap-2 items-center">
        <div>
          <img className="size-40" src={inputImageDataUrl} />
        </div>
        <div>
          <Button
            type="dashed"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleRemoveInputImage}
          >
            Remove image
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shadow-xl items-center">
      <Card>
        {!inputFile && renderFileInput()}
        {inputImageDataUrl && renderInputImage()}
      </Card>
    </div>
  );
}

export default App;
