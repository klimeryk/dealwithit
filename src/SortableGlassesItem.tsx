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
import { useBoundStore } from "./store/index.ts";

interface SortableGlassesItemProps {
  glasses: Glasses;
}

function SortableGlassesItem({ glasses }: SortableGlassesItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: glasses.id });

  const flipGlasses = useBoundStore((state) => state.flip);
  const removeGlasses = useBoundStore((state) => state.remove);
  const selectGlasses = useBoundStore((state) => state.select);
  const updateGlassesDirection = useBoundStore(
    (state) => state.updateDirection,
  );
  const updateGlassesStyle = useBoundStore((state) => state.updateStyle);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleDirectionChange(value: GlassesDirection) {
    updateGlassesDirection(glasses.id, value);
  }

  function handleStyleChange(value: string) {
    updateGlassesStyle(glasses.id, value);
  }

  function handleSelectionChange(
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) {
    const id = event.currentTarget.dataset.id as nanoId;
    selectGlasses(id);
  }

  function handleFlipChange(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    const id = event.currentTarget.dataset.id as nanoId;
    const field = event.currentTarget.dataset.field as string;
    if (field !== "flipHorizontally" && field !== "flipVertically") {
      return;
    }
    flipGlasses(id, field);
  }

  function handleRemove(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    const id = event.currentTarget.dataset.id as nanoId;
    removeGlasses(id);
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
      className="touch-none py-2 pe-2 text-sm font-medium text-gray-800 last:rounded-b-md dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
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
          <div className="flex gap-2 flex-wrap">
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
              onClick={handleFlipChange}
            />
            <Button
              title="Flip glasses vertically"
              size="small"
              type={glasses.flipVertically ? "primary" : "default"}
              icon={<FlipV />}
              data-id={glasses.id}
              data-field="flipVertically"
              onClick={handleFlipChange}
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button
            title="Highlight this instance of glasses on preview - this is only to help you find them, it does not affect output"
            size="small"
            type={glasses.isSelected ? "primary" : "default"}
            icon={<EyeOutlined />}
            data-id={glasses.id}
            onClick={handleSelectionChange}
          />
          <Button
            data-id={glasses.id}
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          />
        </div>
      </div>
    </li>
  );
}

export default SortableGlassesItem;
