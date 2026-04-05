import type { MessageInstance } from 'antd/es/message/interface';
import type { StateCreator } from 'zustand';

export interface AppSlice {
  isDrawerOpen: boolean;
  messageApi: MessageInstance | undefined;
  mode: AppMode;
  status: AppStatus;
  successCount: number;
  goBackToStart: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
  setMessageApi: (messageApi: MessageInstance) => void;
  setMode: (newMode: AppMode) => void;
  setStatus: (newStatus: AppStatus) => void;
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  isDrawerOpen: false,
  messageApi: undefined,
  mode: 'NORMAL',
  status: 'START',
  successCount: 0,
  goBackToStart: () =>
    set(() => ({
      status: 'INPUT',
      inputFile: undefined,
      inputImageDataUrl: '',
      glassesList: [],
      imageOptions: {
        flipVertically: false,
        flipHorizontally: false,
      },
    })),
  setDrawerOpen: (isOpen) => set(() => ({ isDrawerOpen: isOpen })),
  setMessageApi: (messageApi) => set(() => ({ messageApi })),
  setMode: (newMode) => set(() => ({ mode: newMode })),
  setStatus: (newStatus) => set(() => ({ status: newStatus })),
});
