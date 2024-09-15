import { DeleteOutlined } from "@ant-design/icons";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Coordinates } from "@dnd-kit/utilities";
import { Button } from "antd";

import glassesImageUrl from "./assets/glasses.png";
import FlipH from "./icons/FlipH.tsx";
import FlipV from "./icons/FlipV.tsx";

interface InputImageProps {
  onInputImageError: () => void;
  onImageOptionsChange: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => void;
  onRemoveInputImage: () => void;

  imageOptions: ImageOptions;
  inputImageDataUrl: string;
  inputImageRef: React.RefObject<HTMLImageElement>;
  glassesCoordinates: Coordinates;
}

function InputImage({
  onInputImageError,
  onImageOptionsChange,
  onRemoveInputImage,
  imageOptions,
  inputImageDataUrl,
  inputImageRef,
  glassesCoordinates,
}: InputImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
  } = useDraggable({
    id: "glassesDraggable",
  });

  let imageTransform = "";
  if (imageOptions.flipVertically) {
    imageTransform += "scaleY(-1) ";
  }
  if (imageOptions.flipHorizontally) {
    imageTransform += "scaleX(-1) ";
  }

  const imageStyle = {
    transform: imageTransform,
  };

  const glassesStyle = {
    transform: CSS.Translate.toString(transform),
    left: glassesCoordinates.x,
    top: glassesCoordinates.y,
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="relative">
        <img
          style={imageStyle}
          ref={inputImageRef}
          src={inputImageDataUrl}
          onError={onInputImageError}
        />
        <img
          className="absolute w-1/2 left-0 top-0 hover:cursor-move"
          src={glassesImageUrl}
          ref={setDraggableRef}
          style={glassesStyle}
          {...listeners}
          {...attributes}
        />
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
  );
}

export default InputImage;
