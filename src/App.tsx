import "jimp/browser/lib/jimp.js";
import {
  DeleteOutlined,
  DownloadOutlined,
  FireOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useDraggable, useDroppable, useDndMonitor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Coordinates } from "@dnd-kit/utilities";
import type { Jimp } from "@jimp/core";
import type { UploadProps } from "antd";
import { Button, Card, Upload, Modal } from "antd";
import { saveAs } from "file-saver";
import { BitmapImage, GifFrame, GifCodec, GifUtil } from "gifwrap";
import { useEffect, useState } from "react";

import glassesImageUrl from "./assets/glasses.png";

const { Dragger } = Upload;
const { Jimp } = window;

let glassesImage: Jimp;

const MAX_IMAGE_SIZE = 160;
const NUMBER_OF_FRAMES_FOR_GLASSES = 15;
const LAST_FRAME_DELAY = 100;

const getDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function App() {
  const [status, setStatus] = useState<
    "START" | "UPLOADING" | "READY" | "GENERATING" | "DONE"
  >("START");
  const [inputFile, setInputFile] = useState<File>();
  const [inputImageDataUrl, setInputImageDataUrl] = useState("");
  const [outputImage, setOutputImage] = useState<Blob>();
  const [outputImageDataUrl, setOutputImageDataUrl] = useState("");
  const [{ x, y }, setGlassesCoordinates] = useState<Coordinates>({
    x: 35,
    y: 54,
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: "imageDroppable",
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
  } = useDraggable({
    id: "glassesDraggable",
  });

  useDndMonitor({
    onDragEnd({ delta }) {
      setGlassesCoordinates(({ x, y }) => {
        return {
          x: x + delta.x,
          y: y + delta.y,
        };
      });
    },
  });

  useEffect(() => {
    async function fetchData() {
      const originalGlassesImage = await Jimp.read(glassesImageUrl);
      glassesImage = originalGlassesImage.resize(
        MAX_IMAGE_SIZE / 2,
        Jimp.AUTO,
        Jimp.RESIZE_BICUBIC,
      );
    }

    fetchData();
  }, []);

  function generateOutputImage() {
    if (!inputFile) {
      return;
    }

    setStatus("GENERATING");

    const reader = new FileReader();
    reader.onload = async () => {
      const originalImage = await Jimp.read(reader.result as Buffer);
      const image = originalImage.resize(
        MAX_IMAGE_SIZE,
        MAX_IMAGE_SIZE,
        Jimp.RESIZE_BICUBIC,
      );

      const frames = [];
      const yMovementPerFrame = y / NUMBER_OF_FRAMES_FOR_GLASSES;
      for (
        let frameNumber = 0;
        frameNumber < NUMBER_OF_FRAMES_FOR_GLASSES;
        ++frameNumber
      ) {
        const jimpFrame = image
          .clone()
          .blit(glassesImage, x, frameNumber * yMovementPerFrame);
        const jimpBitmap = new BitmapImage(jimpFrame.bitmap);
        GifUtil.quantizeDekker(jimpBitmap, 256);
        const frame = new GifFrame(jimpBitmap, { delayCentisecs: 20 });
        frames.push(frame);
      }

      const jimpFrame = image
        .clone()
        .blit(
          glassesImage,
          x,
          NUMBER_OF_FRAMES_FOR_GLASSES * yMovementPerFrame,
        );
      const jimpBitmap = new BitmapImage(jimpFrame.bitmap);
      GifUtil.quantizeDekker(jimpBitmap, 256);
      const frame = new GifFrame(jimpBitmap, {
        delayCentisecs: LAST_FRAME_DELAY,
      });
      frames.push(frame);

      const codec = new GifCodec();
      const gif = await codec.encodeGif(frames, { loops: 0 });
      const gifBlob = new File([gif.buffer], "", { type: "image/gif" });
      setOutputImage(gifBlob);

      const fileReader = new FileReader();
      fileReader.onload = () => {
        setOutputImageDataUrl(fileReader.result as string);
        setStatus("DONE");
      };
      fileReader.readAsDataURL(gifBlob);
    };
    reader.readAsArrayBuffer(inputFile);
  }

  function renderOutputImage() {
    if (!outputImageDataUrl) {
      return <div>No image yet!</div>;
    }

    return (
      <div className="flex flex-col items-center">
        <img src={outputImageDataUrl} />
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
        setStatus("UPLOADING");

        const selectedFileAsDataUrl = await getDataUrl(selectedFile);
        setInputImageDataUrl(selectedFileAsDataUrl);
        setStatus("READY");
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
      setStatus("START");
      setInputImageDataUrl("");
      setInputFile(undefined);
    }

    const style = {
      transform: CSS.Translate.toString(transform),
      left: x,
      top: y,
    };

    return (
      <div className="flex flex-col gap-2 items-center">
        <div className="relative">
          <img
            className="size-40"
            src={inputImageDataUrl}
            ref={setDroppableRef}
          />
          <img
            className="absolute w-1/2 left-0 top-0"
            src={glassesImageUrl}
            ref={setDraggableRef}
            style={style}
            {...listeners}
            {...attributes}
          />
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

  function renderForm() {
    return (
      <div className="flex-1">
        <div className="flex flex-col items-end">
          <Button
            type="primary"
            size="large"
            onClick={generateOutputImage}
            loading={status === "GENERATING"}
            icon={<FireOutlined />}
          >
            Deal with it!
          </Button>
        </div>
      </div>
    );
  }

  function closeModal() {
    setStatus("READY");
  }

  function downloadOutput() {
    if (outputImage) {
      saveAs(outputImage, "dealwithit.gif");
    }
    closeModal();
  }

  return (
    <div className="flex shadow-xl items-center">
      <Card>
        <div className="w-[32rem] flex flex-row gap-4">
          <div className="flex">
            {status === "START" && renderFileInput()}
            {status !== "START" && renderInputImage()}
          </div>
          {status !== "START" && renderForm()}
        </div>
      </Card>
      <Modal
        title="Here's your shiny new emoji!"
        open={status === "DONE"}
        onCancel={closeModal}
        footer={[
          <Button
            key="download"
            type="primary"
            onClick={downloadOutput}
            icon={<DownloadOutlined />}
          >
            Download
          </Button>,
        ]}
        width={304}
      >
        {renderOutputImage()}
      </Modal>
    </div>
  );
}

export default App;
