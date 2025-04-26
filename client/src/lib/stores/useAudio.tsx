import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { registerStore } from '../utils/storeRegistry';

// Simplified audio interface - all audio functionality has been removed from the game
interface AudioState {
  // Placeholder toggle to keep interfaces working
  isMuted: boolean;
  toggleMute: () => void;
  
  // Empty no-op methods to prevent errors in components that call these
  playSound: (sound: string) => void;
  playSuccess: () => void;
  playHit: () => void;
}

// This is a minimal audio hook placeholder - all sound functionality has been removed from the game
export const useAudio = create<AudioState>()(
  subscribeWithSelector((set) => {
    return {
      // Always muted
      isMuted: true,
      
      // Methods that do nothing
      toggleMute: () => {},
      playSound: () => {},
      playSuccess: () => {},
      playHit: () => {}
    };
  })
);

// Register with the global store registry
registerStore('audio', useAudio);

export default useAudio;