import type { Coordinates } from "@dnd-kit/core/dist/types";
import { nanoid } from "nanoid";

import glassesSmallImageUrl from "../assets/glasses-small.png";
import glassesSymmetricalPartyImageUrl from "../assets/glasses-symmetrical-party.png";
import glassesSymmetricalImageUrl from "../assets/glasses-symmetrical.png";
import glassesImageUrl from "../assets/glasses.png";

export function getDefaultGlasses(styleUrl = glassesImageUrl): Glasses {
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
    styleUrl: styleUrl,
    size: {
      width: DEFAULT_WIDTH,
      height: DEFAULT_WIDTH / getAspectRatio(styleUrl),
    },
  };
}

export function getGlassesSize(imageUrl: string): Size {
  switch (imageUrl) {
    case glassesSmallImageUrl:
      return { width: 240, height: 60 };

    case glassesSymmetricalPartyImageUrl:
    case glassesSymmetricalImageUrl:
      return { width: 832, height: 160 };

    case glassesImageUrl:
    default:
      return { width: 927, height: 145 };
  }
}

export function getAspectRatio(imageUrl: string) {
  const { width, height } = getGlassesSize(imageUrl);
  return width / height;
}

export function getNoseOffset({ styleUrl }: Glasses): Coordinates {
  switch (styleUrl) {
    case glassesSmallImageUrl:
      return { x: 119, y: 19 };

    case glassesSymmetricalPartyImageUrl:
    case glassesSymmetricalImageUrl:
      return { x: 415, y: 32 };

    case glassesImageUrl:
    default:
      return { x: 609, y: 58 };
  }
}

export function getEyesDistance({ styleUrl }: Glasses) {
  switch (styleUrl) {
    case glassesSmallImageUrl:
      return 140;

    case glassesSymmetricalPartyImageUrl:
    case glassesSymmetricalImageUrl:
      return 415;

    case glassesImageUrl:
    default:
      return 354;
  }
}

export function getRandomGlassesStyle(): string {
  const glassesStyles = [
    glassesImageUrl,
    glassesSmallImageUrl,
    glassesSymmetricalImageUrl,
    glassesSymmetricalPartyImageUrl,
  ];
  return glassesStyles[Math.floor(Math.random() * glassesStyles.length)];
}
