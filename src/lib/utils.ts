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

export function getSuccessMessage(count: number) {
  switch (count) {
    case 5:
      return "Is it perfect now?";

    case 10:
      return "Wow, you really want it perfect!";

    case 15:
      return "Your laptop must be quite warm now - hope the results are worth it!";

    case 20:
      return "I admire your perseverance in the quest for the perfect emoji!";

    case 42:
      return "Hope this emoji is the answer you're looking for.";

    case 100:
      return "You're actively contributing to global warming with this much CPU usage.";

    case Number.MAX_VALUE:
      return "I like the way you think! Or you have a serious problem.";
  }

  const successMessages = [
    "Here's your shiny new emoji!",
    "Freshly baked, grab it while it's hot!",
    "Enjoy your new emoji!",
  ];
  return successMessages[Math.floor(Math.random() * successMessages.length)];
}
