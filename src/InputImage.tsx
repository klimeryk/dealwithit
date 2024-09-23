import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";

import GlassesDraggable from "./GlassesDraggable.tsx";
import FlipH from "./icons/FlipH.tsx";
import FlipV from "./icons/FlipV.tsx";
import { getFlipTransform } from "./lib/utils.ts";

interface InputImageProps {
  onGlassesSizeChange: (id: nanoId, { width, height }: Size) => void;
  onInputImageError: () => void;
  onInputImageLoad: () => void;
  onImageOptionsChange: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => void;
  onRemoveInputImage: () => void;

  imageOptions: ImageOptions;
  inputImageDataUrl: string;
  inputImageRef: React.RefObject<HTMLImageElement>;
  glassesList: Glasses[];
}

function InputImage({
  onInputImageError,
  onInputImageLoad,
  onImageOptionsChange,
  onRemoveInputImage,
  onGlassesSizeChange,
  imageOptions,
  inputImageDataUrl,
  inputImageRef,
  glassesList,
}: InputImageProps) {
  const imageStyle = {
    transform: getFlipTransform(imageOptions),
  };

  function renderGlasses(glasses: Glasses) {
    return (
      <GlassesDraggable
        key={glasses.id}
        glasses={glasses}
        inputImageRef={inputImageRef}
        onSizeChange={onGlassesSizeChange}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="relative">
        <img
          style={imageStyle}
          ref={inputImageRef}
          src={inputImageDataUrl}
          onError={onInputImageError}
          onLoad={onInputImageLoad}
        />
        {glassesList.map(renderGlasses)}
      </div>
      <div className="flex justify-between w-full">
        <div className="flex gap-2">
          <Button
            title="Flip image horizontally"
            size="small"
            icon={<FlipH />}
            data-field="flipHorizontally"
            onClick={onImageOptionsChange}
          />
          <Button
            title="Flip image vertically"
            size="small"
            icon={<FlipV />}
            data-field="flipVertically"
            onClick={onImageOptionsChange}
          />
        </div>
        <Button
          type="dashed"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={onRemoveInputImage}
        >
          Remove image
        </Button>
      </div>
    </div>
  );
}

export default InputImage;
