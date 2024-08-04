import "jimp/browser/lib/jimp.js";
import {
  DeleteOutlined,
  DownloadOutlined,
  FireOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useDraggable, useDndMonitor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Coordinates } from "@dnd-kit/utilities";
import type { Jimp } from "@jimp/core";
import type { UploadProps } from "antd";
import {
  Form,
  Radio,
  Switch,
  InputNumber,
  Button,
  Card,
  Space,
  Upload,
  Modal,
} from "antd";
import { saveAs } from "file-saver";
import { BitmapImage, GifFrame, GifCodec, GifUtil } from "gifwrap";
import { useEffect, useState, useRef } from "react";

import glassesImageUrl from "./assets/glasses.png";

const { Dragger } = Upload;
const { Jimp } = window;

let glassesImage: Jimp;

const MAX_IMAGE_SIZE = 160;

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
  const inputImageRef = useRef(null);

  const [form] = Form.useForm();
  const lastFrameDelayEnabled = Form.useWatch(
    ["lastFrameDelay", "enabled"],
    form,
  );
  const numberOfLoops = Form.useWatch(["looping", "loops"], form);

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
    async function loadGlassesImage() {
      const originalGlassesImage = await Jimp.read(glassesImageUrl);
      glassesImage = originalGlassesImage.resize(
        MAX_IMAGE_SIZE / 2,
        Jimp.AUTO,
        Jimp.RESIZE_BICUBIC,
      );
    }

    loadGlassesImage();
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

      const { looping, frameDelay, lastFrameDelay, numberOfFrames } =
        form.getFieldsValue([
          ["looping"],
          ["lastFrameDelay"],
          ["frameDelay"],
          ["numberOfFrames"],
        ]);

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
      const yMovementPerFrame = y / numberOfFrames;
      for (let frameNumber = 0; frameNumber < numberOfFrames; ++frameNumber) {
        const jimpFrame = image
          .clone()
          .blit(glassesImage, x, frameNumber * yMovementPerFrame);
        const jimpBitmap = new BitmapImage(jimpFrame.bitmap);
        GifUtil.quantizeDekker(jimpBitmap, 256);
        const frame = new GifFrame(jimpBitmap, {
          delayCentisecs: Math.round(frameDelay / 10),
        });
        frames.push(frame);
      }

      const jimpFrame = image
        .clone()
        .blit(glassesImage, x, numberOfFrames * yMovementPerFrame);
      const jimpBitmap = new BitmapImage(jimpFrame.bitmap);
      GifUtil.quantizeDekker(jimpBitmap, 256);
      const frame = new GifFrame(jimpBitmap, {
        delayCentisecs: getLastFrameDelay(),
      });
      frames.push(frame);

      const codec = new GifCodec();
      const gif = await codec.encodeGif(frames, { loops: getNumberOfLoops() });
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
          <img className="size-40" src={inputImageDataUrl} />
          <img
            className="absolute w-1/2 left-0 top-0 hover:cursor-move"
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
      <Form
        className="size-40"
        form={form}
        layout="vertical"
        initialValues={{
          numberOfFrames: 15,
          frameDelay: 100,
          lastFrameDelay: { enabled: true, value: 1000 },
          looping: { mode: "infinite", loops: 5 },
        }}
      >
        <Form.Item label="Loops" name={["looping", "mode"]}>
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="infinite">Infinite</Radio>
              <Radio value="off">Off</Radio>
              <Radio value="finite">
                <Form.Item name={["looping", "loops"]} noStyle>
                  <InputNumber
                    min={1}
                    addonAfter={numberOfLoops === 1 ? "loop" : "loops"}
                  />
                </Form.Item>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Number of frames"
          tooltip="How many frames should be rendered - more frames, smoother motion, but bigger file size."
          name="numberOfFrames"
        >
          <InputNumber addonAfter="frames" style={{ width: "100%" }} min={2} />
        </Form.Item>
        <Form.Item
          label="Frame delay"
          tooltip="How long each frame should take, in miliseconds"
          name="frameDelay"
        >
          <InputNumber addonAfter="ms" style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item
          label="Last frame delay"
          tooltip="How long the last frame should linger, for maximum awesomeness! YEAH!"
        >
          <Space>
            <Form.Item
              noStyle
              valuePropName="checked"
              name={["lastFrameDelay", "enabled"]}
            >
              <Switch />
            </Form.Item>
            <Form.Item noStyle name={["lastFrameDelay", "value"]}>
              <InputNumber
                addonAfter="ms"
                style={{ width: "100%" }}
                min={10}
                disabled={!lastFrameDelayEnabled}
              />
            </Form.Item>
          </Space>
        </Form.Item>
        <Button
          type="primary"
          size="large"
          onClick={generateOutputImage}
          loading={status === "GENERATING"}
          icon={<FireOutlined />}
        >
          Deal with it!
        </Button>
      </Form>
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
        <div className="flex flex-row gap-4">
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
