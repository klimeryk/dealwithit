import { ColorPicker } from "antd";
import type { AggregationColor } from "antd/es/color-picker/color";

import { useBoundStore } from "./store/index.ts";

interface GlassesColorPickerProps {
  disabled: boolean;
  glasses: Glasses;
}

function GlassesColorPicker({ disabled, glasses }: GlassesColorPickerProps) {
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
        disabled={disabled}
      />
    </span>
  );
}

export default GlassesColorPicker;
