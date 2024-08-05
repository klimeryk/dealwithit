import "jimp/browser/lib/jimp.js";
import {
  DeleteOutlined,
  DownloadOutlined,
  FireOutlined,
  GithubOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useDraggable, useDndMonitor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Coordinates } from "@dnd-kit/utilities";
import type { UploadProps } from "antd";
import {
  Form,
  Radio,
  Switch,
  InputNumber,
  Button,
  Space,
  Upload,
  Modal,
  message,
} from "antd";
import { saveAs } from "file-saver";
import party from "party-js";
import { useMemo, useState, useRef } from "react";

import glassesImageUrl from "./assets/glasses.png";

const { Dragger } = Upload;

const getDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function App() {
  const gifWorker = useMemo(
    () =>
      new Worker(new URL("./worker/gif.worker.ts", import.meta.url), {
        type: "module",
      }),
    [],
  );
  const [messageApi, contextHolder] = message.useMessage();
  const [status, setStatus] = useState<
    "START" | "READY" | "GENERATING" | "DONE"
  >("START");
  const [inputFile, setInputFile] = useState<File>();
  const [inputImageDataUrl, setInputImageDataUrl] = useState("");
  const [outputImage, setOutputImage] = useState<Blob>();
  const [outputImageDataUrl, setOutputImageDataUrl] = useState("");
  const [{ x, y }, setGlassesCoordinates] = useState<Coordinates>({
    x: 35,
    y: 54,
  });
  const outputImageRef = useRef<null | HTMLImageElement>(null);
  const [mode, setMode] = useState<"NORMAL" | "HEDGEHOG">("NORMAL");

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

  gifWorker.onmessage = ({ data }) => {
    const { gifBlob, resultDataUrl } = data;
    setOutputImage(gifBlob);
    setOutputImageDataUrl(resultDataUrl);
    setStatus("DONE");
  };

  function generateOutputImage() {
    if (!inputFile) {
      return;
    }

    const configurationOptions = form.getFieldsValue([
      ["looping"],
      ["lastFrameDelay"],
      ["frameDelay"],
      ["numberOfFrames"],
      ["size"],
    ]);

    gifWorker.postMessage({
      configurationOptions,
      glasses: { x, y, url: glassesImageUrl },
      inputFile,
    });

    setStatus("GENERATING");
  }

  function renderOutputImage() {
    return (
      <div className="flex flex-col items-center">
        <img ref={outputImageRef} src={outputImageDataUrl} />
      </div>
    );
  }

  function renderFileInput() {
    const props: UploadProps = {
      className: "flex flex-1",
      name: "file",
      multiple: false,
      accept: "image/png, image/jpeg",
      showUploadList: false,
      customRequest: async (info) => {
        const selectedFile = info.file as File;
        setInputFile(selectedFile);
        if (selectedFile.name.match(/(hedgehog|posthog)/gi)) {
          setMode("HEDGEHOG");
          messageApi.info({
            content: "Hello fellow hedgehog fan!",
            icon: <span className="mr-1 text-lg">🦔</span>,
          });
        } else {
          setMode("NORMAL");
        }

        const selectedFileAsDataUrl = await getDataUrl(selectedFile);
        setInputImageDataUrl(selectedFileAsDataUrl);
        setStatus("READY");
      },
    };
    return (
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <SmileOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">Works best with square images!</p>
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
        className="w-40"
        form={form}
        layout="vertical"
        disabled={status === "START"}
        initialValues={{
          numberOfFrames: 15,
          frameDelay: 100,
          lastFrameDelay: { enabled: true, value: 1000 },
          looping: { mode: "infinite", loops: 5 },
          size: { width: 160, height: 160 },
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
          <InputNumber
            addonAfter="ms"
            style={{ width: "100%" }}
            min={0}
            step={10}
          />
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
                step={100}
                disabled={!lastFrameDelayEnabled || status === "START"}
              />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item
          label="Width"
          tooltip="Width of the output GIF"
          name={["size", "width"]}
        >
          <InputNumber addonAfter="px" style={{ width: "100%" }} min={1} />
        </Form.Item>
        <Form.Item
          label="Height"
          tooltip="Height of the output GIF"
          name={["size", "height"]}
        >
          <InputNumber addonAfter="px" style={{ width: "100%" }} min={1} />
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

  function onModalOpenChange(open: boolean) {
    if (open && outputImageRef.current) {
      if (mode === "HEDGEHOG") {
        const hedgehog = document.createElement("span");
        hedgehog.innerText = "🦔";
        hedgehog.style.fontSize = "48px";
        const heart = document.createElement("span");
        heart.innerText = "💖";
        heart.style.fontSize = "24px";
        party.confetti(outputImageRef.current, { shapes: [hedgehog, heart] });
      } else {
        party.confetti(outputImageRef.current);
      }
    }
  }

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <span className="absolute mx-auto py-4 flex border w-fit bg-gradient-to-r blur-xl from-blue-500 via-teal-500 to-pink-500 bg-clip-text text-6xl box-content font-extrabold text-transparent text-center select-none">
          Deal With It GIF emoji generator
        </span>
        <h1 className="relative top-0 w-fit h-auto py-4 justify-center flex bg-gradient-to-r items-center from-blue-500 via-teal-500 to-pink-500 bg-clip-text text-6xl font-extrabold text-transparent text-center select-auto">
          Deal With It GIF emoji generator
        </h1>
      </div>
      <h3 className="leading-relaxed text-base text-center text-gray-500">
        All done artisanally and securely in your browser.
      </h3>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        {contextHolder}
        <div className="relative p-10 bg-white shadow-lg sm:rounded-3xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              {status === "START" && renderFileInput()}
              {status !== "START" && renderInputImage()}
            </div>
            {renderForm()}
          </div>
          <Modal
            title="Here's your shiny new emoji!"
            open={status === "DONE"}
            onCancel={closeModal}
            destroyOnClose
            afterOpenChange={onModalOpenChange}
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
      </div>
      <h3 className="leading-relaxed text-base text-center text-gray-500">
        <a href="https://github.com/klimeryk/dealwithit" target="_blank">
          <GithubOutlined className="mr-1" />
          View source code on GitHub
        </a>
      </h3>
    </>
  );
}

export default App;
