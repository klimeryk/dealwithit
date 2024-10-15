import type { Coordinates } from "@dnd-kit/core/dist/types";
import { nanoid } from "nanoid";

import glassesSmallImageUrl from "../assets/glasses-small.png";
import glassesSymmetricalPartyImageUrl from "../assets/glasses-symmetrical-party.png";
import glassesSymmetricalImageUrl from "../assets/glasses-symmetrical.png";
import glassesImageUrl from "../assets/glasses.svg";
import glassesImageUrlRaw from "../assets/glasses.svg?raw"; // eslint-disable-line import/no-unresolved

export const DEFAULT_GLASSES_SIZE = 128;

export function getDefaultGlasses(styleUrl = glassesImageUrl): Glasses {
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
    style: styleUrl,
    styleColor: "#000000",
    styleUrl: styleUrl,
    size: {
      width: DEFAULT_GLASSES_SIZE,
      height: DEFAULT_GLASSES_SIZE / getAspectRatio(styleUrl),
    },
  };
}

export function getGlassesSize(style: string): Size {
  switch (style) {
    case glassesSmallImageUrl:
      return { width: 240, height: 60 };

    case glassesSymmetricalPartyImageUrl:
    case glassesSymmetricalImageUrl:
      return { width: 832, height: 160 };

    case glassesImageUrl:
    default:
      return { width: 1024, height: 165 };
  }
}

export function getAspectRatio(style: string) {
  const { width, height } = getGlassesSize(style);
  return width / height;
}

export function getNoseOffset({ style }: Glasses): Coordinates {
  switch (style) {
    case glassesSmallImageUrl:
      return { x: 119, y: 19 };

    case glassesSymmetricalPartyImageUrl:
    case glassesSymmetricalImageUrl:
      return { x: 415, y: 32 };

    case glassesImageUrl:
    default:
      return { x: 660, y: 64 };
  }
}

export function getEyesDistance({ style }: Glasses) {
  switch (style) {
    case glassesSmallImageUrl:
      return 140;

    case glassesSymmetricalPartyImageUrl:
    case glassesSymmetricalImageUrl:
      return 415;

    case glassesImageUrl:
    default:
      return 385;
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

export async function computeStyleUrl(
  style: string,
  styleColor: string,
): Promise<string> {
  if (style !== glassesImageUrl) {
    return style;
  }

  const dataHeader = "data:image/svg+xml;charset=utf-8";
  const encodeAsUTF8 = (s: string) => `${dataHeader},${encodeURIComponent(s)}`;

  const loadImage = async (url: string): Promise<HTMLImageElement> => {
    const $img = document.createElement("img");
    $img.src = url;
    return new Promise((resolve, reject) => {
      $img.onload = () => resolve($img);
      $img.onerror = reject;
    });
  };

  const coloredGlasses = glassesImageUrlRaw.replace("#000000", styleColor);
  const svgData = encodeAsUTF8(coloredGlasses);
  const img = await loadImage(svgData);
  const canvas = document.createElement("canvas");
  const glassesSize = getGlassesSize(style);
  canvas.width = glassesSize.width;
  canvas.height = glassesSize.height;
  const context = canvas.getContext("2d");
  if (!context) {
    return glassesImageUrl;
  }

  context.drawImage(img, 0, 0, glassesSize.width, glassesSize.height);

  return canvas.toDataURL(`image/png`, 1.0);
}
