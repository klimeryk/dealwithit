import "@tensorflow/tfjs-backend-webgl";
import { VERSION } from "@mediapipe/face_mesh";
import { setWasmPaths, version_wasm } from "@tensorflow/tfjs-backend-wasm";
import {
  createDetector,
  SupportedModels,
} from "@tensorflow-models/face-landmarks-detection";
import type { FaceLandmarksDetector } from "@tensorflow-models/face-landmarks-detection";

import "@tensorflow-models/face-detection";

import {
  getDefaultGlasses,
  getEyesDistance,
  getGlassesSize,
  getNoseOffset,
  getRandomGlassesStyle,
} from "./glasses.ts";

setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${version_wasm}/dist/`,
);

let detector: FaceLandmarksDetector;
async function initializeFaceDetection() {
  detector = await createDetector(SupportedModels.MediaPipeFaceMesh, {
    runtime: "mediapipe",
    refineLandmarks: true,
    maxFaces: 6,
    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${VERSION}`,
  });
}
initializeFaceDetection();

export async function detectFaces(image: HTMLImageElement) {
  const faces = await detector.estimateFaces(image);
  console.log(faces);
  if (faces.length === 0) {
    return [getDefaultGlasses()];
  }

  const scaleX = image.width / image.naturalWidth;
  const scaleY = image.height / image.naturalHeight;

  const newGlassesList: Glasses[] = [];
  for (const face of faces) {
    const newGlasses =
      faces.length === 1
        ? getDefaultGlasses()
        : getDefaultGlasses(getRandomGlassesStyle());
    const originalGlassesSize = getGlassesSize(newGlasses.styleUrl);
    const originalEyesDistance = getEyesDistance(newGlasses);
    const eyesDistance = Math.sqrt(
      Math.pow(scaleY * (face.keypoints[145].y - face.keypoints[374].y), 2) +
        Math.pow(scaleX * (face.keypoints[145].x - face.keypoints[374].x), 2),
    );
    const glassesScale = eyesDistance / originalEyesDistance;
    newGlasses.size.width = originalGlassesSize.width * glassesScale;
    newGlasses.size.height = originalGlassesSize.height * glassesScale;
    const noseX = face.keypoints[6].x;
    const noseY = face.keypoints[6].y;
    const noseOffset = getNoseOffset(newGlasses);
    const glassesScaleX = newGlasses.size.width / originalGlassesSize.width;
    const glassesScaleY = newGlasses.size.height / originalGlassesSize.height;
    newGlasses.coordinates = {
      x: Math.abs(noseX * scaleX - noseOffset.x * glassesScaleX),
      y: Math.abs(noseY * scaleY - noseOffset.y * glassesScaleY),
    };

    newGlassesList.push(newGlasses);
  }

  return newGlassesList;
}
