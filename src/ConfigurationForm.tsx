import { FireOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  InputNumber,
  Progress,
  Radio,
  Space,
  Switch,
} from "antd";
import { useMemo, useState } from "react";

import { useBoundStore } from "./store/index.ts";

const EMOJI_GENERATION_START_MARK = "EmojiGenerationStartMark";
const EMOJI_GENERATION_END_MARK = "EmojiGenerationEndMark";

interface ConfigurationFormProps {
  inputImageRef: React.RefObject<HTMLImageElement>;
}

export default function ConfigurationForm({
  inputImageRef,
}: ConfigurationFormProps) {
  const gifWorker = useMemo(
    () =>
      new Worker(new URL("./worker/gif.worker.ts", import.meta.url), {
        type: "module",
      }),
    [],
  );

  const inputFile = useBoundStore((state) => state.inputFile);
  const setOutputImage = useBoundStore((state) => state.setOutputImage);
  const glassesList = useBoundStore((state) => state.glassesList);
  const imageOptions = useBoundStore((state) => state.imageOptions);
  const posthog = useBoundStore((state) => state.posthog);
  const status = useBoundStore((state) => state.status);
  const setStatus = useBoundStore((state) => state.setStatus);

  const [form] = Form.useForm();
  const lastFrameDelayEnabled = Form.useWatch(
    ["lastFrameDelay", "enabled"],
    form,
  );
  const numberOfLoops = Form.useWatch(["looping", "loops"], form);

  const [progressState, setProgressState] = useState(0);

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
              disabled={!lastFrameDelayEnabled || status !== "READY"}
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
