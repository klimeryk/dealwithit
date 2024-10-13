import { PlusCircleOutlined } from "@ant-design/icons";
import { closestCenter, DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Alert, Button, Card } from "antd";

import SortableGlassesItem from "./SortableGlassesItem.tsx";
import { useBoundStore } from "./store/index.ts";

function SortableGlassesList() {
  const status = useBoundStore((state) => state.status);
  const glassesList = useBoundStore((state) => state.glassesList);
  const addDefaultGlasses = useBoundStore((state) => state.addDefault);
  const reorderGlasses = useBoundStore((state) => state.reorder);

  function renderGlassesItem(glasses: Glasses) {
    return <SortableGlassesItem key={glasses.id} glasses={glasses} />;
  }

  function handleGlassesItemDragEnd({ active, over }: DragEndEvent) {
    const oldId = active.id as nanoId;
    const newId = over?.id as nanoId;
    reorderGlasses(oldId, newId);
  }

  const cardStyles = {
    body: {
      padding: 0,
    },
  };

  return (
    <Card
      className="mt-2"
      size="small"
      title="Glasses"
      styles={cardStyles}
      loading={status === "DETECTING"}
      extra={
        <Button
          size="small"
          icon={<PlusCircleOutlined />}
          disabled={status !== "READY"}
          onClick={addDefaultGlasses}
        >
          Add
        </Button>
      }
    >
      <DndContext
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        collisionDetection={closestCenter}
        onDragEnd={handleGlassesItemDragEnd}
      >
        <SortableContext
          items={glassesList}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {glassesList.map(renderGlassesItem)}
            {glassesList.length === 0 && (
              <Alert
                className="rounded-b-md"
                banner
                message="No glasses!?"
                description="How can you deal with it without any glasses? How about adding at least one pair?"
                type="warning"
                action={
                  <Button
                    size="small"
                    icon={<PlusCircleOutlined />}
                    onClick={addDefaultGlasses}
                  >
                    Add
                  </Button>
                }
              />
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </Card>
  );
}

export default SortableGlassesList;
