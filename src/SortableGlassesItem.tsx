import { DeleteOutlined, HolderOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Select } from "antd";

import FlipH from "./icons/FlipH.tsx";
import FlipV from "./icons/FlipV.tsx";

interface SortableGlassesItemProps {
  glasses: Glasses;
  onDirectionChange: (id: nanoId, direction: GlassesDirection) => void;
  onFlipChange: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onRemove: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

function SortableGlassesItem({
  glasses,
  onDirectionChange,
  onFlipChange,
  onRemove,
}: SortableGlassesItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: glasses.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleDirectionChange(value: GlassesDirection) {
    onDirectionChange(glasses.id, value);
  }

  const directionOptions = [
    {
      label: "⬇️",
      value: "up",
    },
    {
      label: "⬆️",
      value: "down",
    },
    {
      label: "➡️",
      value: "left",
    },
    {
      label: "⬅️",
      value: "right",
    },
  ];

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="py-2 px-2 text-sm font-medium text-gray-800 last:rounded-b-md dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <div className="flex justify-between w-full">
        <div className="flex gap-2">
          <Button
            className="cursor-ns-resize"
            type="link"
            size="small"
            icon={<HolderOutlined />}
            {...attributes}
            {...listeners}
          />
          <Select
            data-id={glasses.id}
            size="small"
            defaultValue="up"
            onChange={handleDirectionChange}
            options={directionOptions}
            title="Direction from which the glasses should arrive in frame"
          />
          <Button
            title="Flip image horizontally"
            size="small"
            icon={<FlipH />}
            data-id={glasses.id}
            data-field="flipHorizontally"
            onClick={onFlipChange}
          />
          <Button
            title="Flip image vertically"
            size="small"
            icon={<FlipV />}
            data-id={glasses.id}
            data-field="flipVertically"
            onClick={onFlipChange}
          />
        </div>
        <div>
          <Button
            data-id={glasses.id}
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={onRemove}
          />
        </div>
      </div>
    </li>
  );
}

export default SortableGlassesItem;
