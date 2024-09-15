import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";

import GlassesDraggable from "./GlassesDraggable.tsx";
import FlipH from "./icons/FlipH.tsx";
import FlipV from "./icons/FlipV.tsx";

interface InputImageProps {
  onInputImageError: () => void;
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
  onImageOptionsChange,
  onRemoveInputImage,
  imageOptions,
  inputImageDataUrl,
  inputImageRef,
  glassesList,
}: InputImageProps) {
  let imageTransform = "";
  if (imageOptions.flipVertically) {
    imageTransform += "scaleY(-1) ";
  }
  if (imageOptions.flipHorizontally) {
    imageTransform += "scaleX(-1) ";
  }

  const imageStyle = {
    transform: imageTransform,
  };

  function renderGlasses(glasses: Glasses) {
    return <GlassesDraggable key={glasses.id} glasses={glasses} />;
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="relative">
        <img
          style={imageStyle}
          ref={inputImageRef}
          src={inputImageDataUrl}
          onError={onInputImageError}
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
