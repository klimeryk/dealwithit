import "jimp/browser/lib/jimp.js";
import { FireOutlined, SettingOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  InputNumber,
  Progress,
  Radio,
  Space,
  Switch,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

import DownloadModal from "./DownloadModal.tsx";
import FileInput from "./FileInput.tsx";
import Footer from "./Footer.tsx";
import InputImage from "./InputImage.tsx";
import SettingsDrawer from "./SettingsDrawer.tsx";
import SortableGlassesList from "./SortableGlassesList.tsx";
import { useBoundStore } from "./store/index.ts";
import Title from "./Title.tsx";

const EMOJI_GENERATION_START_MARK = "EmojiGenerationStartMark";
const EMOJI_GENERATION_END_MARK = "EmojiGenerationEndMark";

function App() {
  const gifWorker = useMemo(
    () =>
      new Worker(new URL("./worker/gif.worker.ts", import.meta.url), {
        type: "module",
      }),
    [],
  );
  const messageApi = useBoundStore((state) => state.messageApi);
  const setDrawerOpen = useBoundStore((state) => state.setDrawerOpen);
  const inputFile = useBoundStore((state) => state.inputFile);
  const setOutputImage = useBoundStore((state) => state.setOutputImage);
  const status = useBoundStore((state) => state.status);
  const setStatus = useBoundStore((state) => state.setStatus);
  const glassesList = useBoundStore((state) => state.glassesList);
  const putGlassesOnFaces = useBoundStore((state) => state.putGlassesOnFaces);
  const imageOptions = useBoundStore((state) => state.imageOptions);
  const inputImageRef = useRef<null | HTMLImageElement>(null);
  const mode = useBoundStore((state) => state.mode);
  const posthog = useBoundStore((state) => state.posthog);

  const [form] = Form.useForm();
  const lastFrameDelayEnabled = Form.useWatch(
    ["lastFrameDelay", "enabled"],
    form,
  );
  const numberOfLoops = Form.useWatch(["looping", "loops"], form);

  const [progressState, setProgressState] = useState(0);

  useEffect(() => {
    if (mode === "HEDGEHOG") {
      messageApi?.info({
        content: "Hello fellow hedgehog fan!",
        icon: <span className="mr-1 text-lg">🦔</span>,
      });
    }
  }, [mode, messageApi]);

  gifWorker.onmessage = ({ data }) => {
    if (data.type === "PROGRESS") {
      setProgressState(Math.round(data.progress));
      return;
    }

    performance.mark(EMOJI_GENERATION_END_MARK);
    const emojiMeasure = performance.measure(
      "EmojiGeneration",
      EMOJI_GENERATION_START_MARK,
      EMOJI_GENERATION_END_MARK,
    );
    posthog?.capture("user_finished_emoji_generation", {
      duration: emojiMeasure.duration,
    });

    const { gifBlob, resultDataUrl } = data;
    setOutputImage(gifBlob, resultDataUrl);
    setStatus("DONE");
  };

  function generateOutputImage() {
    if (!inputFile || !inputImageRef.current) {
      return;
    }

    const configurationOptions = form.getFieldsValue([
      ["looping"],
      ["lastFrameDelay"],
      ["frameDelay"],
      ["numberOfFrames"],
      ["size"],
    ]);

    posthog?.capture("user_started_emoji_generation", {
      ...configurationOptions,
    });

    performance.mark(EMOJI_GENERATION_START_MARK);

    gifWorker.postMessage({
      configurationOptions,
      glassesList: glassesList,
      imageOptions,
      inputImage: {
        renderedWidth: inputImageRef.current.width,
        renderedHeight: inputImageRef.current.height,
      },
      inputFile,
    });

    setProgressState(0);
    setStatus("GENERATING");
  }

  function renderInputImage() {
    async function handleInputImageLoad() {
      if (!inputImageRef.current) {
        return;
      }
      putGlassesOnFaces(inputImageRef.current);
      setStatus("READY");
    }

    return (
      <>
        <InputImage
          inputImageRef={inputImageRef}
          onInputImageLoad={handleInputImageLoad}
        />
        <SortableGlassesList />
      </>
    );
  }

  function renderForm() {
    return (
      <Form
        form={form}
        layout="vertical"
        disabled={status !== "READY"}
        initialValues={
          {
            numberOfFrames: 15,
            frameDelay: 100,
            lastFrameDelay: { enabled: true, value: 1000 },
            looping: { mode: "infinite", loops: 5 },
            size: 160,
          } as ConfigurationOptions
        }
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
          label="Largest dimension (width or height)"
          tooltip="The largest dimension of the output image - either width or height, depending on the aspect ratio."
          name="size"
        >
          <InputNumber addonAfter="px" style={{ width: "100%" }} min={1} />
        </Form.Item>
        <Button
          block
          disabled={glassesList.length === 0}
          type="primary"
          size="large"
          onClick={generateOutputImage}
          loading={status === "GENERATING"}
          icon={<FireOutlined />}
        >
          Deal with it!
        </Button>
        {status === "GENERATING" && (
          <Progress
            percent={progressState}
            showInfo={false}
            strokeColor={{ from: "#108ee9", to: "#87d068" }}
          />
        )}
      </Form>
    );
  }

  function onOpenDrawer() {
    setDrawerOpen(true);
  }

  const shouldRenderFileInput = ["START", "LOADING"].includes(status);

  return (
    <>
      <Title />
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative p-10 bg-white dark:bg-slate-900 shadow-lg sm:rounded-3xl">
          <Button
            icon={<SettingOutlined />}
            shape="circle"
            className="absolute right-0 top-0 mt-2 me-2"
            onClick={onOpenDrawer}
          />
          <div className="sm:grid grid-cols-3 gap-4">
            <div className="col-span-2 mb-4 sm:mb-0">
              {shouldRenderFileInput ? <FileInput /> : renderInputImage()}
            </div>
            {renderForm()}
          </div>
          <DownloadModal />
        </div>
      </div>
      <Footer />
      <SettingsDrawer />
    </>
  );
}

export default App;
