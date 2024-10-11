import { DeleteOutlined } from "@ant-design/icons";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { Button } from "antd";

import GlassesDraggable from "./GlassesDraggable.tsx";
import FlipH from "./icons/FlipH.tsx";
import FlipV from "./icons/FlipV.tsx";
import { restrictToParentWithOffset } from "./lib/drag-modifiers.ts";
import { getFlipTransform } from "./lib/utils.ts";
import { useBoundStore } from "./store/index.ts";

interface InputImageProps {
  onInputImageLoad: () => void;

  inputImageRef: React.RefObject<HTMLImageElement>;
}

function InputImage({ onInputImageLoad, inputImageRef }: InputImageProps) {
  const messageApi = useBoundStore((state) => state.messageApi);
  const posthog = useBoundStore((state) => state.posthog);
  const goBackToStart = useBoundStore((state) => state.goBackToStart);
  const imageOptions = useBoundStore((state) => state.imageOptions);
  const toggleImageOption = useBoundStore((state) => state.toggleImageOption);
  const inputImageDataUrl = useBoundStore((state) => state.inputImageDataUrl);
  const glassesList = useBoundStore((state) => state.glassesList);
  const updateCoordinates = useBoundStore((state) => state.updateCoordinates);

  const imageStyle = {
    transform: getFlipTransform(imageOptions),
  };

  function handleImageOptionsChange(
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) {
    const field = event.currentTarget.dataset.field as string;
    if (field !== "flipVertically" && field !== "flipHorizontally") {
      return;
    }

    toggleImageOption(field);
  }

  function handleRemoveInputImage() {
    posthog.capture("user_removed_input_image");

    goBackToStart();
  }

  function handleInputImageError() {
    messageApi?.warning(
      "The file could not be loaded - make sure it's a valid image file.",
    );
    posthog.capture("user_uploaded_invalid_input_image");

    goBackToStart();
  }

  function handleDragEnd({ delta, active }: DragEndEvent) {
    updateCoordinates(active.id as nanoId, delta);
  }

  function renderGlasses(glasses: Glasses) {
    return (
      <GlassesDraggable
        key={glasses.id}
        glasses={glasses}
        inputImageRef={inputImageRef}
      />
    );
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentWithOffset]}
    >
      <div className="flex flex-col gap-2 items-center">
        <div className="relative">
          <img
            style={imageStyle}
            ref={inputImageRef}
            src={inputImageDataUrl}
            onError={handleInputImageError}
            onLoad={onInputImageLoad}
          />
          {glassesList.map(renderGlasses)}
        </div>
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            <Button
              title="Flip image horizontally"
              size="small"
              icon={<FlipH />}
              data-field="flipHorizontally"
              onClick={handleImageOptionsChange}
            />
            <Button
              title="Flip image vertically"
              size="small"
              icon={<FlipV />}
              data-field="flipVertically"
              onClick={handleImageOptionsChange}
            />
          </div>
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
    </DndContext>
  );
}

export default InputImage;
