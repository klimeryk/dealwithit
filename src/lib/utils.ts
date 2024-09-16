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
    direction: "down",
    coordinates: {
      x: 35,
      y: 54,
    },
  };
}
