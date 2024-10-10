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
  onInputImageError: () => void;
  onInputImageLoad: () => void;
  onImageOptionsChange: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => void;
  onRemoveInputImage: () => void;

  imageOptions: ImageOptions;
  inputImageDataUrl: string;
  inputImageRef: React.RefObject<HTMLImageElement>;
}

function InputImage({
  onInputImageError,
  onInputImageLoad,
  onImageOptionsChange,
  onRemoveInputImage,
  imageOptions,
  inputImageDataUrl,
  inputImageRef,
}: InputImageProps) {
  const imageStyle = {
    transform: getFlipTransform(imageOptions),
  };

  const glassesList = useBoundStore((state) => state.glassesList);
  const updateCoordinates = useBoundStore((state) => state.updateCoordinates);

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
            onError={onInputImageError}
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
              onClick={onImageOptionsChange}
            />
            <Button
              title="Flip image vertically"
              size="small"
              icon={<FlipV />}
              data-field="flipVertically"
              onClick={onImageOptionsChange}
            />
          </div>
          <Button
            type="dashed"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={onRemoveInputImage}
          >
            Remove image
          </Button>
        </div>
      </div>
    </DndContext>
  );
}

export default InputImage;
