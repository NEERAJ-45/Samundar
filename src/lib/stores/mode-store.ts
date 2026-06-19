import { create } from 'zustand';

export type Mode = 'HOME' | 'OFFICE';

interface ModeState {
  mode: Mode;
  sidebarCollapsed: boolean;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useModeStore = create<ModeState>((set) => ({
  mode: 'HOME',
  sidebarCollapsed: false,
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({ mode: state.mode === 'HOME' ? 'OFFICE' : 'HOME' })),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
