import { getNumberOfSteps } from "../lib/utils.ts";

export function prepareReportProgress(numberOfFrames: number) {
  let stepNumber = 0;
  const numberOfSteps = getNumberOfSteps(numberOfFrames);
  return function reportProgress() {
    ++stepNumber;
    self.postMessage({
      type: "PROGRESS",
      progress: (stepNumber / numberOfSteps) * 100,
    });
  };
}
