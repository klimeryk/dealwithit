import type { Coordinates } from "@dnd-kit/core/dist/types";
import { arrayMove } from "@dnd-kit/sortable";
import { produce } from "immer";
import { StateCreator } from "zustand";

import { detectFaces } from "../../lib/face-detection.ts";
import { getDefaultGlasses } from "../../lib/glasses.ts";
import { byId } from "../../lib/id-utils.ts";

export interface GlassesSlice {
  glassesList: Glasses[];
  flip: (id: nanoId, field: keyof WithFlip) => void;
  addDefault: () => void;
  putGlassesOnFaces: (image: HTMLImageElement) => void;
  updateCoordinates: (id: nanoId, delta: Coordinates) => void;
  updateDirection: (id: nanoId, direction: GlassesDirection) => void;
  updateStyle: (id: nanoId, styleUrl: string) => void;
  updateSize: (id: nanoId, size: Size) => void;
  reorder: (oldId: nanoId, newId: nanoId) => void;
  remove: (id: nanoId) => void;
  select: (id: nanoId) => void;
}

export const createGlassesSlice: StateCreator<GlassesSlice> = (set) => ({
  glassesList: [],
  addDefault: () =>
    set(
      produce((draft) => {
        draft.glassesList.push(getDefaultGlasses());
        draft.posthog.capture("user_added_glasses");
      }),
    ),
  putGlassesOnFaces: async (image: HTMLImageElement) => {
    const newGlasses = await detectFaces(image);
    set(() => ({ glassesList: newGlasses }));
  },
  updateCoordinates: (id: nanoId, delta: Coordinates) =>
    set(
      produce((draft) => {
        const index = draft.glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        const { x, y } = draft.glassesList[index].coordinates;
        draft.glassesList[index].coordinates = {
          x: x + delta.x,
          y: y + delta.y,
        };
        draft.posthog.capture("user_dragged_glasses");
      }),
    ),
  updateDirection: (id: nanoId, direction: GlassesDirection) =>
    set(
      produce((draft) => {
        const index = draft.glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        draft.glassesList[index].direction = direction;
        draft.posthog.capture("user_changed_glasses_direction", {
          direction,
        });
      }),
    ),
  updateStyle: (id: nanoId, styleUrl: string) =>
    set(
      produce((draft) => {
        const index = draft.glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        draft.glassesList[index].styleUrl = styleUrl;
        draft.posthog.capture("user_changed_glasses_style", {
          styleUrl,
        });
      }),
    ),
  updateSize: (id: nanoId, size: Size) =>
    set(
      produce((draft) => {
        const index = draft.glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        draft.glassesList[index].size = size;
        // Don't send analytics here, as this could be fired
        // many times in a row.
      }),
    ),
  reorder: (oldId: nanoId, newId: nanoId) =>
    set(
      produce((draft) => {
        const oldIndex = draft.glassesList.findIndex(byId(oldId));
        const newIndex = draft.glassesList.findIndex(byId(newId));
        if (oldIndex === -1 || newIndex === -1) {
          return;
        }
        draft.glassesList = arrayMove(draft.glassesList, oldIndex, newIndex);
        draft.posthog.capture("user_reordered_glasses");
      }),
    ),
  remove: (id: nanoId) =>
    set(
      produce((draft) => {
        const index = draft.glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        draft.glassesList.splice(index, 1);
        draft.posthog.capture("user_removed_glasses");
      }),
    ),
  select: (id: nanoId) =>
    set(
      produce((draft) => {
        const index = draft.glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        let previouslySelectedId;
        draft.glassesList = draft.glassesList.map((glasses: Glasses) => {
          if (glasses.isSelected) {
            previouslySelectedId = glasses.id;
          }
          glasses.isSelected = false;
          return glasses;
        });
        if (previouslySelectedId !== id) {
          draft.glassesList[index].isSelected = true;
          draft.posthog.capture("user_selected_glasses");
        } else {
          draft.posthog.capture("user_deselected_glasses");
        }
      }),
    ),
  flip: (id, field) =>
    set(
      produce((draft) => {
        const index = draft.glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }
        draft.glassesList[index][field] = !draft.glassesList[index][field];
        draft.posthog.capture("user_flipped_glasses", {
          flip: field,
        });
      }),
    ),
});
