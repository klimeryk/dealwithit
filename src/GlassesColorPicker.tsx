import { ColorPicker } from "antd";
import type { AggregationColor } from "antd/es/color-picker/color";

import { useBoundStore } from "./store/index.ts";

interface GlassesColorPickerProps {
  glasses: Glasses;
}

function GlassesColorPicker({ glasses }: GlassesColorPickerProps) {
  const updateStyleColor = useBoundStore((state) => state.updateStyleColor);

  function handleColorChange(_: AggregationColor, css: string) {
    updateStyleColor(glasses.id, css);
  }

  return (
    <span title="Color of the glasses">
      <ColorPicker
        defaultValue="#000000"
        size="small"
        onChange={handleColorChange}
      />
    </span>
  );
}

export default GlassesColorPicker;
