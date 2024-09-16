import { nanoid } from "nanoid";

export function generateOutputFilename(inputFile: File) {
  const nameParts = inputFile.name.split(".");
  nameParts.pop();
  const filename = nameParts.pop();
  nameParts.push(filename + "-dealwithit");
  nameParts.push("gif");
  return nameParts.join(".");
}

export function getDefaultGlasses(): Glasses {
  return {
    id: nanoid(),
    direction: "up",
    coordinates: {
      x: 35,
      y: 54,
    },
    flipHorizontally: false,
    flipVertically: false,
  };
}

export function getFlipTransform({
  flipHorizontally,
  flipVertically,
}: WithFlip) {
  let transform = "";
  if (flipVertically) {
    transform += "scaleY(-1) ";
  }
  if (flipHorizontally) {
    transform += "scaleX(-1) ";
  }

  return transform;
}
