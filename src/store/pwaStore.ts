import { create } from "zustand";
import type { BeforeInstallPromptEvent } from "@/hooks/usePwaInstall";

interface PwaState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isStandalone: boolean;
  isIOS: boolean;
  isInstallable: boolean;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  setIsStandalone: (isStandalone: boolean) => void;
  setIsIOS: (isIOS: boolean) => void;
  setIsInstallable: (isInstallable: boolean) => void;
}

export const usePwaStore = create<PwaState>((set) => ({
  deferredPrompt: null,
  isStandalone: false,
  isIOS: false,
  isInstallable: false,
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  setIsStandalone: (isStandalone) => set({ isStandalone }),
  setIsIOS: (isIOS) => set({ isIOS }),
  setIsInstallable: (isInstallable) => set({ isInstallable }),
}));
