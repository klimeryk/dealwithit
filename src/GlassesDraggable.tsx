import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "antd";
import { useCallback, useEffect, useState } from "react";

import HandleCorner from "./icons/HandleCorner.tsx";
import { getAspectRatio } from "./lib/glasses.ts";
import { getFlipTransform } from "./lib/utils.ts";

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

  const [isResizing, setIsResizing] = useState(false);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setIsResizing(true);
    setStartSize(glasses.size);
    setStartPos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isResizing || !inputImageRef.current) {
        return;
      }

      let newWidth = startSize.width + event.clientX - startPos.x;
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
    },
    [
      glasses.id,
      glasses.coordinates,
      glasses.size,
      glasses.styleUrl,
      inputImageRef,
      isResizing,
      startSize,
      startPos,
      onSizeChange,
    ],
  );

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove]);

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

  const imageStyle = {
    transform: getFlipTransform(glasses),
    width: `${glasses.size.width}px`,
    height: `${glasses.size.height}px`,
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
      <Button
        icon={<HandleCorner />}
        type="text"
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "10px",
          height: "10px",
          cursor: "nwse-resize",
        }}
      />
    </span>
  );
}

export default GlassesDraggable;
