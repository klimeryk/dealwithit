import type { Coordinates } from '@dnd-kit/core/dist/types';
import { arrayMove } from '@dnd-kit/sortable';
import { produce } from 'immer';
import type { StateCreator } from 'zustand';

import { computeStyleUrl, getDefaultGlasses } from '../../lib/glasses.ts';
import { byId } from '../../lib/id-utils.ts';

export interface GlassesSlice {
  glassesList: Glasses[];
  flip: (id: nanoId, field: keyof WithFlip) => void;
  addDefault: () => void;
  updateCoordinates: (id: nanoId, delta: Coordinates) => void;
  updateDirection: (id: nanoId, direction: GlassesDirection) => void;
  updateStyle: (id: nanoId, styleUrl: string) => void;
  updateStyleColor: (id: nanoId, color: string) => void;
  updateSize: (id: nanoId, size: Size) => void;
  reorder: (oldId: nanoId, newId: nanoId) => void;
  remove: (id: nanoId) => void;
  select: (id: nanoId) => void;
}

export const createGlassesSlice: StateCreator<GlassesSlice> = (set, get) => ({
  glassesList: [],
  addDefault: () =>
    set(
      produce((draft) => {
        draft.glassesList.push(getDefaultGlasses());
      }),
    ),
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
      }),
    ),
  updateStyle: async (id: nanoId, style: string) => {
    const index = get().glassesList.findIndex(byId(id));
    if (index === -1) {
      return;
    }
    const newStyleUrl = await computeStyleUrl(style, get().glassesList[index].styleColor);
    return set(
      produce((draft) => {
        draft.glassesList[index].style = style;
        draft.glassesList[index].styleUrl = newStyleUrl;
      }),
    );
  },
  updateStyleColor: async (id: nanoId, color: string) => {
    const index = get().glassesList.findIndex(byId(id));
    if (index === -1) {
      return;
    }

    const newStyleUrl = await computeStyleUrl(get().glassesList[index].style, color);
    return set(
      produce((draft) => {
        draft.glassesList[index].styleColor = color;
        draft.glassesList[index].styleUrl = newStyleUrl;
      }),
    );
  },
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
      }),
    ),
  select: (id: nanoId) =>
    set(
      produce((draft) => {
        const index = draft.glassesList.findIndex(byId(id));
        if (index === -1) {
          return;
        }

        let previouslySelectedId: nanoId | null = null;
        draft.glassesList = draft.glassesList.map((glasses: Glasses) => {
          if (glasses.isSelected) {
            previouslySelectedId = glasses.id;
          }
          glasses.isSelected = false;
          return glasses;
        });

        if (previouslySelectedId !== id) {
          draft.glassesList[index].isSelected = true;
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
      }),
    ),
});
