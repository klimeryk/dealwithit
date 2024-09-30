import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

import {
  getDefaultGlasses,
  getEyesDistance,
  getGlassesSize,
  getNoseOffset,
  getRandomGlassesStyle,
} from "./glasses.ts";

let faceDetector: FaceDetector;
const initializefaceDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
  );
  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
      delegate: "GPU",
    },
    runningMode: "IMAGE",
  });
};
initializefaceDetector();

export function detectFaces(image: HTMLImageElement) {
  const faces = faceDetector.detect(image).detections;
  if (faces.length === 0) {
    return [getDefaultGlasses()];
  }

  const scaleX = image.width / image.naturalWidth;
  const scaleY = image.height / image.naturalHeight;

  const newGlassesList: Glasses[] = [];
  for (const face of faces) {
    for (const keypoint of face.keypoints) {
      keypoint.x *= image.naturalWidth;
      keypoint.y *= image.naturalHeight;
    }

    const newGlasses =
      faces.length === 1
        ? getDefaultGlasses()
        : getDefaultGlasses(getRandomGlassesStyle());
    const originalGlassesSize = getGlassesSize(newGlasses.styleUrl);
    const originalEyesDistance = getEyesDistance(newGlasses);
    const eyesDistance = Math.sqrt(
      Math.pow(scaleY * (face.keypoints[0].y - face.keypoints[1].y), 2) +
        Math.pow(scaleX * (face.keypoints[0].x - face.keypoints[1].x), 2),
    );
    const glassesScale = eyesDistance / originalEyesDistance;
    newGlasses.size.width = originalGlassesSize.width * glassesScale;
    newGlasses.size.height = originalGlassesSize.height * glassesScale;
    const noseX = face.keypoints[2].x;
    const noseY = Math.abs(face.keypoints[0].y - face.keypoints[1].y) / 2;
    const noseOffset = getNoseOffset(newGlasses);
    const glassesScaleX = newGlasses.size.width / originalGlassesSize.width;
    const glassesScaleY = newGlasses.size.height / originalGlassesSize.height;
    newGlasses.coordinates = {
      x: Math.abs(noseX * scaleX - noseOffset.x * glassesScaleX),
      y: Math.abs(
        (face.keypoints[0].y + noseY) * scaleY - noseOffset.y * glassesScaleY,
      ),
    };

    newGlassesList.push(newGlasses);
  }

  return newGlassesList;
}
