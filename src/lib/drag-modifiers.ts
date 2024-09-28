import type { Modifier } from "@dnd-kit/core";

export const restrictToParentWithOffset: Modifier = ({
  containerNodeRect,
  draggingNodeRect,
  transform,
}) => {
  if (!draggingNodeRect || !containerNodeRect) {
    return transform;
  }

  const value = {
    ...transform,
  };

  const containerRectTop = containerNodeRect.top - draggingNodeRect.height / 2;
  const containerRectLeft = containerNodeRect.left - draggingNodeRect.width / 2;
  const containerRectWidth = containerNodeRect.width + draggingNodeRect.width;
  const containerRectHeight =
    containerNodeRect.height + draggingNodeRect.height;

  if (draggingNodeRect.top + transform.y <= containerRectTop) {
    value.y = containerRectTop - draggingNodeRect.top;
  } else if (
    draggingNodeRect.bottom + transform.y >=
    containerRectTop + containerRectHeight
  ) {
    value.y = containerRectTop + containerRectHeight - draggingNodeRect.bottom;
  }

  if (draggingNodeRect.left + transform.x <= containerRectLeft) {
    value.x = containerRectLeft - draggingNodeRect.left;
  } else if (
    draggingNodeRect.right + transform.x >=
    containerRectLeft + containerRectWidth
  ) {
    value.x = containerRectLeft + containerRectWidth - draggingNodeRect.right;
  }

  return value;
};
