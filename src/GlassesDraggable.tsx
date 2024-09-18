import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { getFlipTransform } from "./lib/utils.ts";

interface GlassesDraggableProps {
  glasses: Glasses;
}

function GlassesDraggable({ glasses }: GlassesDraggableProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
  } = useDraggable({
    id: glasses.id,
  });
  const glassesStyle = {
    transform: CSS.Translate.toString(transform),
    left: glasses.coordinates.x,
    top: glasses.coordinates.y,
    zIndex: glasses.isSelected ? 20 : 10,
  };

  const imageStyle = {
    transform: getFlipTransform(glasses),
  };

  return (
    <span
      className="absolute w-1/2 left-0 top-0 hover:cursor-move"
      ref={setDraggableRef}
      style={glassesStyle}
      {...listeners}
      {...attributes}
    >
      <img
        src={glasses.styleUrl}
        style={imageStyle}
        className={glasses.isSelected ? "invert" : ""}
      />
    </span>
  );
}

export default GlassesDraggable;
