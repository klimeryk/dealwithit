import { DeleteOutlined, EyeOutlined, HolderOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Select } from "antd";

import glassesSmallImageUrl from "./assets/glasses-small.png";
import glassesSymmetricalPartyImageUrl from "./assets/glasses-symmetrical-party.png";
import glassesSymmetricalImageUrl from "./assets/glasses-symmetrical.png";
import glassesImageUrl from "./assets/glasses.png";
import FlipH from "./icons/FlipH.tsx";
import FlipV from "./icons/FlipV.tsx";

interface SortableGlassesItemProps {
  glasses: Glasses;
  onDirectionChange: (id: nanoId, direction: GlassesDirection) => void;
  onFlipChange: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onSelectionChange: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onStyleChange: (id: nanoId, style: string) => void;
  onRemove: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

function SortableGlassesItem({
  glasses,
  onDirectionChange,
  onFlipChange,
  onSelectionChange,
  onStyleChange,
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

  function handleStyleChange(value: string) {
    onStyleChange(glasses.id, value);
  }

  const styleOptions = [
    {
      label: "Classic",
      value: glassesImageUrl,
    },
    {
      label: "Small",
      value: glassesSmallImageUrl,
    },
    {
      label: "Symmetrical",
      value: glassesSymmetricalImageUrl,
    },
    {
      label: "Party",
      value: glassesSymmetricalPartyImageUrl,
    },
  ];

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
      className="py-2 pe-2 text-sm font-medium text-gray-800 last:rounded-b-md dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <div className="flex justify-between w-full">
        <div className="flex">
          <Button
            className="cursor-ns-resize"
            type="link"
            size="small"
            icon={<HolderOutlined />}
            {...attributes}
            {...listeners}
          />
          <div className="flex gap-2">
            <Select
              title="Style of glasses"
              className="w-24"
              data-id={glasses.id}
              size="small"
              defaultValue={glasses.styleUrl}
              onChange={handleStyleChange}
              options={styleOptions}
              popupMatchSelectWidth={false}
            />
            <Select
              title="Direction from which the glasses should arrive in frame"
              data-id={glasses.id}
              size="small"
              defaultValue="up"
              onChange={handleDirectionChange}
              options={directionOptions}
            />
            <Button
              title="Flip glasses horizontally"
              size="small"
              type={glasses.flipHorizontally ? "primary" : "default"}
              icon={<FlipH />}
              data-id={glasses.id}
              data-field="flipHorizontally"
              onClick={onFlipChange}
            />
            <Button
              title="Flip glasses vertically"
              size="small"
              type={glasses.flipVertically ? "primary" : "default"}
              icon={<FlipV />}
              data-id={glasses.id}
              data-field="flipVertically"
              onClick={onFlipChange}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            title="Highlight this instance of glasses on preview - this is only to help you find them, it does not affect output"
            size="small"
            type={glasses.isSelected ? "primary" : "default"}
            icon={<EyeOutlined />}
            data-id={glasses.id}
            onClick={onSelectionChange}
          />
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
