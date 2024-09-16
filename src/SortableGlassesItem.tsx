import { DeleteOutlined, HolderOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "antd";

interface SortableGlassesItemProps {
  glasses: Glasses;
  onRemove: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

function SortableGlassesItem({ glasses, onRemove }: SortableGlassesItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: glasses.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="py-2 px-2 text-sm font-medium text-gray-800 last:rounded-b-md dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <div className="flex justify-between w-full">
        <div>
          <HolderOutlined className="me-2" {...attributes} {...listeners} />
          <span>Glasses</span>
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
