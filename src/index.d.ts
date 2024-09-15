interface ImageOptions {
  flipHorizontally: boolean;
  flipVertically: boolean;
}

type nanoId = string;

interface WithNanoId {
  id: nanoId;
}

type Glasses = WithNanoId & {
  coordinates: Coordinates;
};
