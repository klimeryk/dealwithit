import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import glassesImageUrl from "./assets/glasses.png";
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
    gridRow: 1,
    gridColumn: 1,
  };

  return (
    <span
      className="absolute w-1/2 left-0 top-0 hover:cursor-move grid"
      ref={setDraggableRef}
      style={glassesStyle}
      {...listeners}
      {...attributes}
    >
      <img
        src={glassesImageUrl}
        style={imageStyle}
        className={glasses.isSelected ? "invert" : ""}
      />
    </span>
  );
}

export default GlassesDraggable;
