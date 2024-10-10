import { useDraggable } from "@dnd-kit/core";

interface ResizeHandleProps {
  item: WithNanoId;
}

function ResizeHandle({ item }: ResizeHandleProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id: item.id + "-handle",
  });

  const handleStyle = {
    bottom: 0,
    right: 0,
    width: "16px",
    height: "16px",
    cursor: "nwse-resize",
  };

  return (
    <span
      ref={setDraggableRef}
      className="absolute"
      style={handleStyle}
      {...attributes}
      {...listeners}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 16 16"
      >
        <path
          fill="currentColor"
          d="M6.7 16L16 6.7V5.3L5.3 16zm3 0L16 9.7V8.3L8.3 16zm3 0l3.3-3.3v-1.4L11.3 16zm3 0l.3-.3v-1.4L14.3 16z"
        ></path>
      </svg>
    </span>
  );
}

export default ResizeHandle;
