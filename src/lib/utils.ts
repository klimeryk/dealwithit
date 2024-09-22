import { nanoid } from "nanoid";

import glassesSmallImageUrl from "../assets/glasses-small.png";
import glassesSymmetricalPartyImageUrl from "../assets/glasses-symmetrical-party.png";
import glassesSymmetricalImageUrl from "../assets/glasses-symmetrical.png";
import glassesImageUrl from "../assets/glasses.png";

export function generateOutputFilename(inputFile: File) {
  const nameParts = inputFile.name.split(".");
  nameParts.pop();
  const filename = nameParts.pop();
  nameParts.push(filename + "-dealwithit");
  nameParts.push("gif");
  return nameParts.join(".");
}

export function getDefaultGlasses(): Glasses {
  const DEFAULT_WIDTH = 150;
  return {
    id: nanoid(),
    direction: "up",
    coordinates: {
      x: 35,
      y: 54,
    },
    flipHorizontally: false,
    flipVertically: false,
    isSelected: false,
    styleUrl: glassesImageUrl,
    size: {
      width: DEFAULT_WIDTH,
      height: DEFAULT_WIDTH / getAspectRatio(glassesImageUrl),
    },
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

export function getAspectRatio(imageUrl: string) {
  switch (imageUrl) {
    case glassesSmallImageUrl:
      return 240 / 60;

    case glassesSymmetricalPartyImageUrl:
    case glassesSymmetricalImageUrl:
      return 832 / 160;

    case glassesImageUrl:
    default:
      return 927 / 145;
  }
}
