import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface AudioState {
  // Sound settings (kept for compatibility with existing code)
  isMuted: boolean;
  volume: number;
  
  // Music and sound effects (kept for compatibility)
  backgroundMusic: null;
  
  // Function stubs (all functions do nothing)
  playMusic: (music: string) => void;
  stopMusic: () => void;
  playSound: (sound: string) => void;
  playSuccess: () => void;
  playHit: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useAudio = create<AudioState>()(
  subscribeWithSelector((set, get) => {
    return {
      // Sound settings (all disabled)
      isMuted: true,
      volume: 0,
      
      // No music element
      backgroundMusic: null,
      
      // Empty function - does nothing
      playMusic: (music: string) => {
        // Sound feature disabled
        return;
      },
      
      // Empty function - does nothing
      stopMusic: () => {
        // Sound feature disabled
        return;
      },
      
      // Empty function - does nothing
      playSound: (sound: string) => {
        // Sound feature disabled
        return;
      },
      
      // Empty function - does nothing
      playSuccess: () => {
        // Sound feature disabled
        return;
      },
      
      // Empty function - does nothing
      playHit: () => {
        // Sound feature disabled
        return;
      },
      
      // Empty function - does nothing but updates state for compatibility
      setMuted: (muted: boolean) => {
        set({ isMuted: true }); // Always muted
      },
      
      // Empty function - does nothing but updates state for compatibility
      setVolume: (volume: number) => {
        set({ volume: 0 }); // Always volume 0
      }
    };
  })
);

export default useAudio;