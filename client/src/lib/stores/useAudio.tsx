import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface AudioState {
  // Sound settings
  isMuted: boolean;
  volume: number;
  
  // Music and sound effects
  backgroundMusic: null;
  
  // Functions
  playMusic: (music: string) => void;
  stopMusic: () => void;
  playSound: (sound: string) => void;
  playSuccess: () => void;
  playHit: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

// This is a dummy audio hook that does nothing - sound functionality has been removed
export const useAudio = create<AudioState>()(
  subscribeWithSelector((set, get) => {
    return {
      // Sound settings - always muted
      isMuted: true,
      volume: 0,
      
      // Music and sounds - always null
      backgroundMusic: null,
      
      // Empty methods that do nothing
      playMusic: (music: string) => {},
      stopMusic: () => {},
      playSound: (sound: string) => {},
      playSuccess: () => {},
      playHit: () => {},
      setMuted: (muted: boolean) => { set({ isMuted: true }) },
      setVolume: (volume: number) => { set({ volume: 0 }) }
    };
  })
);

export default useAudio;