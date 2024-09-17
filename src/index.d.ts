type WithFlip = {
  flipHorizontally: boolean;
  flipVertically: boolean;
};

type ImageOptions = WithFlip;

type nanoId = string;

interface WithNanoId {
  id: nanoId;
}

type GlassesDirection = "up" | "down" | "right" | "left";

type Glasses = WithFlip &
  WithNanoId & {
    coordinates: Coordinates;
    direction: GlassesDirection;
    isSelected: boolean;
  };

interface LoopingOptions {
  mode: "infinite" | "off" | "finite";
  loops: number;
}

interface ToggleValue<Type> {
  enabled: boolean;
  value: Type;
}

interface ConfigurationOptions {
  looping: LoopingOptions;
  lastFrameDelay: ToggleValue<number>;
  frameDelay: number;
  numberOfFrames: number;
  size: number;
}
