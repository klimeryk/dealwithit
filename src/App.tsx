import "jimp/browser/lib/jimp.js";
import {
  DownloadOutlined,
  FireOutlined,
  GithubOutlined,
  PlusCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { closestCenter, DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Alert,
  Card,
  Form,
  Radio,
  Switch,
  InputNumber,
  Button,
  Progress,
  Space,
  Typography,
  Modal,
  message,
} from "antd";
import { saveAs } from "file-saver";
import party from "party-js";
import { usePostHog } from "posthog-js/react";
import { useEffect, useMemo, useState, useRef } from "react";

import FileInput from "./FileInput.tsx";
import InputImage from "./InputImage.tsx";
import { restrictToParentWithOffset } from "./lib/drag-modifiers.ts";
import { detectFaces } from "./lib/face-detection.ts";
import { getDefaultGlasses } from "./lib/glasses.ts";
import { byId } from "./lib/id-utils.ts";
import { generateOutputFilename, getSuccessMessage } from "./lib/utils.ts";
import SettingsDrawer from "./SettingsDrawer.tsx";
import SortableGlassesItem from "./SortableGlassesItem.tsx";
import Title from "./Title.tsx";

const { Text, Link } = Typography;

const EMOJI_GENERATION_START_MARK = "EmojiGenerationStartMark";
const EMOJI_GENERATION_END_MARK = "EmojiGenerationEndMark";

function getDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

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
    "START" | "LOADING" | "DETECTING" | "READY" | "GENERATING" | "DONE"
  >("START");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [inputFile, setInputFile] = useState<File>();
  const [inputImageDataUrl, setInputImageDataUrl] = useState("");
  const [outputImage, setOutputImage] = useState<Blob>();
  const [outputImageDataUrl, setOutputImageDataUrl] = useState("");
  const [glassesList, setGlassesList] = useState<Glasses[]>([]);
  const [imageOptions, setImageOptions] = useState<ImageOptions>({
    flipVertically: false,
    flipHorizontally: false,
  });
  const inputImageRef = useRef<null | HTMLImageElement>(null);
  const outputImageRef = useRef<null | HTMLImageElement>(null);
  const [mode, setMode] = useState<"NORMAL" | "HEDGEHOG">("NORMAL");
  const posthog = usePostHog();

  const [form] = Form.useForm();
  const lastFrameDelayEnabled = Form.useWatch(
    ["lastFrameDelay", "enabled"],
    form,
  );
  const numberOfLoops = Form.useWatch(["looping", "loops"], form);

  const [progressState, setProgressState] = useState(0);

  useEffect(() => {
    if (mode === "HEDGEHOG") {
      messageApi.info({
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
    setOutputImage(gifBlob);
    setOutputImageDataUrl(resultDataUrl);
    setSuccessCount(successCount + 1);
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

  function renderOutputImage() {
    return (
      <div className="flex flex-col items-center">
        <img ref={outputImageRef} src={outputImageDataUrl} />
      </div>
    );
  }

  function renderFileInput() {
    async function handleExampleClick(
      event: React.MouseEvent<HTMLElement, MouseEvent>,
    ) {
      const imageUrl = event.currentTarget.dataset.url as string;
      const response = await fetch(imageUrl);
      const data = await response.blob();
      const metadata = {
        type: "image/jpeg",
      };
      const file = new File([data], "example.jpg", metadata);
      handleFileSelected(file);
    }
    async function handleFileSelected(selectedFile: File) {
      setStatus("LOADING");
      setInputFile(selectedFile);
      const detectedMode = selectedFile.name.match(/(hedgehog|posthog)/gi)
        ? "HEDGEHOG"
        : "NORMAL";
      setMode(detectedMode);

      posthog?.capture("user_selected_input_file", {
        mode: detectedMode,
        fileType: selectedFile.type,
      });

      const selectedFileAsDataUrl = await getDataUrl(selectedFile);
      setInputImageDataUrl(selectedFileAsDataUrl);
      setStatus("DETECTING");
    }

    return (
      <FileInput
        disabled={status === "LOADING"}
        onExampleClick={handleExampleClick}
        onFileSelected={handleFileSelected}
      />
    );
  }

  function goBackToStart() {
    setStatus("START");
    setInputImageDataUrl("");
    setInputFile(undefined);
    setImageOptions({ flipVertically: false, flipHorizontally: false });
    setGlassesList([]);
  }

  function renderInputImage() {
    function handleRemoveInputImage() {
      posthog?.capture("user_removed_input_image");

      goBackToStart();
    }

    function handleInputImageError() {
      messageApi.warning(
        "The file could not be loaded - make sure it's a valid image file.",
      );
      posthog?.capture("user_uploaded_invalid_input_image");

      goBackToStart();
    }

    async function handleInputImageLoad() {
      if (!inputImageRef.current) {
        return;
      }
      const newGlassesList = detectFaces(inputImageRef.current);
      posthog?.capture("face_detection_done", {
        numberOfGlasses: newGlassesList.length,
      });
      setGlassesList(newGlassesList);
      setStatus("READY");
    }

    function handleImageOptionsChange(
      event: React.MouseEvent<HTMLElement, MouseEvent>,
    ) {
      const field = event.currentTarget.dataset.field as string;
      posthog?.capture("user_flipped_image", {
        flip: field,
      });
      function getNewValue() {
        if (field === "flipVertically" || field === "flipHorizontally") {
          return !imageOptions[field];
        }
      }
      setImageOptions(
        Object.assign({}, imageOptions, { [field as string]: getNewValue() }),
      );
    }

    function handleDragEnd({ delta, active }: DragEndEvent) {
      posthog?.capture("user_dragged_glasses");

      setGlassesList((currentGlassesList) => {
        const index = currentGlassesList.findIndex(byId(active.id as nanoId));
        if (index === -1) {
          return currentGlassesList;
        }
        const newGlassesList = [...currentGlassesList];
        const { x, y } = newGlassesList[index].coordinates;
        newGlassesList[index].coordinates = {
          x: x + delta.x,
          y: y + delta.y,
        };
        return newGlassesList;
      });
    }

    function renderGlassesItem(glasses: Glasses) {
      function handleGlassesDirectionChange(
        id: nanoId,
        direction: GlassesDirection,
      ) {
        posthog?.capture("user_changed_glasses_direction", {
          direction,
        });
        const index = glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        const newGlassesList = [...glassesList];
        newGlassesList[index].direction = direction;
        setGlassesList(newGlassesList);
      }
      function handleGlassesStyleChange(id: nanoId, styleUrl: string) {
        posthog?.capture("user_changed_glasses_style", {
          styleUrl,
        });
        const index = glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        const newGlassesList = [...glassesList];
        newGlassesList[index].styleUrl = styleUrl;
        setGlassesList(newGlassesList);
      }
      function handleGlassesFlipChange(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
      ) {
        const id = event.currentTarget.dataset.id as nanoId;
        const index = glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        const field = event.currentTarget.dataset.field as string;
        posthog?.capture("user_flipped_glasses", {
          flip: field,
        });
        const newGlassesList = [...glassesList];
        if (field !== "flipHorizontally" && field !== "flipVertically") {
          return;
        }
        newGlassesList[index][field] = !newGlassesList[index][field];
        setGlassesList(newGlassesList);
      }
      function handleGlassesSelectionChange(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
      ) {
        posthog?.capture("user_selected_glasses");
        const id = event.currentTarget.dataset.id as nanoId;
        const index = glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        let previouslySelectedId;
        const newGlassesList = glassesList.map((glasses) => {
          if (glasses.isSelected) {
            previouslySelectedId = glasses.id;
          }
          glasses.isSelected = false;
          return glasses;
        });
        if (previouslySelectedId !== id) {
          newGlassesList[index].isSelected = true;
        }
        setGlassesList(newGlassesList);
      }
      function handleRemoveGlasses(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
      ) {
        posthog?.capture("user_removed_glasses");
        const id = event.currentTarget.dataset.id as nanoId;
        const index = glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        const newGlassesList = [...glassesList];
        newGlassesList.splice(index, 1);
        setGlassesList(newGlassesList);
      }
      return (
        <SortableGlassesItem
          key={glasses.id}
          glasses={glasses}
          onDirectionChange={handleGlassesDirectionChange}
          onFlipChange={handleGlassesFlipChange}
          onSelectionChange={handleGlassesSelectionChange}
          onStyleChange={handleGlassesStyleChange}
          onRemove={handleRemoveGlasses}
        />
      );
    }

    function handleGlassesSizeChange(id: nanoId, size: Size) {
      posthog?.capture("user_resized_glasses");
      const index = glassesList.findIndex(byId(id));
      if (index === -1) {
        return;
      }
      const newGlassesList = [...glassesList];
      newGlassesList[index].size = size;
      setGlassesList(newGlassesList);
    }

    function handleGlassesItemDragEnd({ active, over }: DragEndEvent) {
      posthog?.capture("user_reordered_glasses");
      const oldId = active.id as nanoId;
      const newId = over?.id as nanoId;
      const oldIndex = glassesList.findIndex(byId(oldId));
      const newIndex = glassesList.findIndex(byId(newId));
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      const newGlassesList = arrayMove(glassesList, oldIndex, newIndex);
      setGlassesList(newGlassesList);
    }

    function handleAddGlasses() {
      posthog?.capture("user_added_glasses");
      const newGlassesList = [...glassesList];
      newGlassesList.push(getDefaultGlasses());
      setGlassesList(newGlassesList);
    }

    const cardStyles = {
      body: {
        padding: 0,
      },
    };

    return (
      <>
        <DndContext
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentWithOffset]}
        >
          <InputImage
            imageOptions={imageOptions}
            inputImageDataUrl={inputImageDataUrl}
            inputImageRef={inputImageRef}
            glassesList={glassesList}
            onGlassesSizeChange={handleGlassesSizeChange}
            onInputImageError={handleInputImageError}
            onInputImageLoad={handleInputImageLoad}
            onImageOptionsChange={handleImageOptionsChange}
            onRemoveInputImage={handleRemoveInputImage}
          />
        </DndContext>
        <Card
          className="mt-2"
          size="small"
          title="Glasses"
          styles={cardStyles}
          loading={status === "DETECTING"}
          extra={
            <Button
              size="small"
              icon={<PlusCircleOutlined />}
              onClick={handleAddGlasses}
            >
              Add
            </Button>
          }
        >
          <DndContext
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            collisionDetection={closestCenter}
            onDragEnd={handleGlassesItemDragEnd}
          >
            <SortableContext
              items={glassesList}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {glassesList.map(renderGlassesItem)}
                {glassesList.length === 0 && (
                  <Alert
                    className="rounded-b-md"
                    banner
                    message="No glasses!?"
                    description="How can you deal with it without any glasses? How about adding at least one pair?"
                    type="warning"
                    action={
                      <Button
                        size="small"
                        icon={<PlusCircleOutlined />}
                        onClick={handleAddGlasses}
                      >
                        Add
                      </Button>
                    }
                  />
                )}
              </ul>
            </SortableContext>
          </DndContext>
        </Card>
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

  function handleDrawerClose() {
    setDrawerOpen(false);
  }

  function closeModal() {
    posthog?.capture("user_closed_download_modal");
    setStatus("READY");
  }

  function downloadOutput() {
    posthog?.capture("user_downloaded_emoji");
    if (outputImage && inputFile) {
      saveAs(outputImage, generateOutputFilename(inputFile));
    }
    closeModal();
  }

  function onModalOpenChange(open: boolean) {
    if (open && outputImageRef.current) {
      posthog?.capture("user_opened_download_modal");

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

  const shouldRenderFileInput = ["START", "LOADING"].includes(status);

  return (
    <>
      <Title />
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        {contextHolder}
        <div className="relative p-10 bg-white dark:bg-slate-900 shadow-lg sm:rounded-3xl">
          <Button
            icon={<SettingOutlined />}
            shape="circle"
            className="absolute right-0 top-0 mt-2 me-2"
            onClick={onOpenDrawer}
          />
          <div className="sm:grid grid-cols-3 gap-4">
            <div className="col-span-2 mb-4 sm:mb-0">
              {shouldRenderFileInput ? renderFileInput() : renderInputImage()}
            </div>
            {renderForm()}
          </div>
          <Modal
            title={getSuccessMessage(successCount)}
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
      <div className="text-center">
        <Text className="sm:flex justify-center gap-1" type="secondary">
          <div>
            Made with passion by{" "}
            <Link href="https://klimer.eu/" target="_blank">
              Igor Klimer
            </Link>
            .
          </div>
          <div>
            Source code on
            <Link
              className="ms-2"
              href="https://github.com/klimeryk/dealwithit"
              target="_blank"
            >
              <GithubOutlined className="mr-1" />
              GitHub
            </Link>
            .
          </div>
        </Text>
      </div>
      <SettingsDrawer isOpen={isDrawerOpen} onClose={handleDrawerClose} />
    </>
  );
}

export default App;
