import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragMoveEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { usePostHog } from "posthog-js/react";
import { CSSProperties, useState } from "react";

import { getAspectRatio } from "./lib/glasses.ts";
import { getFlipTransform } from "./lib/utils.ts";
import ResizeHandle from "./ResizeHandle.tsx";

interface GlassesDraggableProps {
  glasses: Glasses;
  inputImageRef: React.RefObject<HTMLImageElement>;
  onSizeChange: (id: nanoId, size: Size) => void;
}

const MIN_WIDTH = 16;

function GlassesDraggable({
  glasses,
  inputImageRef,
  onSizeChange,
}: GlassesDraggableProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
  } = useDraggable({
    id: glasses.id,
  });

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const posthog = usePostHog();

  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  function handleDragStart() {
    setStartSize(glasses.size);
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    if (!inputImageRef.current) {
      return;
    }

    let newWidth = startSize.width + delta.x;
    if (newWidth < MIN_WIDTH) {
      newWidth = MIN_WIDTH;
    }
    const maxWidthRelativeToParent =
      inputImageRef.current.width - glasses.coordinates.x;
    if (newWidth > maxWidthRelativeToParent) {
      newWidth = maxWidthRelativeToParent;
    }
    let newHeight = newWidth / getAspectRatio(glasses.styleUrl);
    const maxHeightRelativeToParent =
      inputImageRef.current.height - glasses.coordinates.y;
    if (newHeight > maxHeightRelativeToParent) {
      newHeight = maxHeightRelativeToParent;
      newWidth = glasses.size.width;
    }

    onSizeChange(glasses.id, { width: newWidth, height: newHeight });
  }

  function handleDragEnd() {
    posthog?.capture("user_resized_glasses");
  }

  const clipPath = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  const positionX = glasses.coordinates.x + (transform?.x || 0);
  if (positionX < 0) {
    clipPath.left = Math.abs(positionX);
  } else if (
    inputImageRef.current &&
    positionX + glasses.size.width > inputImageRef.current.width
  ) {
    clipPath.right = Math.abs(
      positionX + glasses.size.width - inputImageRef.current.width,
    );
  }

  const positionY = glasses.coordinates.y + (transform?.y || 0);
  if (positionY < 0) {
    clipPath.top = Math.abs(positionY);
  } else if (
    inputImageRef.current &&
    positionY + glasses.size.height > inputImageRef.current.height
  ) {
    clipPath.bottom = Math.abs(
      positionY + glasses.size.height - inputImageRef.current.height,
    );
  }

  const glassesStyle = {
    transform: CSS.Translate.toString(transform),
    left: glasses.coordinates.x,
    top: glasses.coordinates.y,
    zIndex: glasses.isSelected ? 20 : 10,
    width: `${glasses.size.width}px`,
    height: `${glasses.size.height}px`,
    clipPath: `inset(${clipPath.top}px ${clipPath.right}px ${clipPath.bottom}px ${clipPath.left}px)`,
  };

  const imageStyle: CSSProperties = {
    transform: getFlipTransform(glasses),
    width: `${glasses.size.width}px`,
    height: `${glasses.size.height}px`,
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
  };

  return (
    <span
      className="absolute w-1/2 left-0 top-0 touch-none"
      ref={setDraggableRef}
      style={glassesStyle}
    >
      <img
        src={glasses.styleUrl}
        style={imageStyle}
        className={"cursor-move " + (glasses.isSelected ? "invert" : "")}
        {...attributes}
        {...listeners}
      />
      <DndContext
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <ResizeHandle item={glasses} />
      </DndContext>
    </span>
  );
}

export default GlassesDraggable;
