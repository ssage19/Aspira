import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface AudioState {
  // Sound settings
  isMuted: boolean;
  volume: number;
  
  // Music and sound effects
  backgroundMusic: string | null;
  
  // Functions
  playMusic: (music: string) => void;
  stopMusic: () => void;
  playSound: (sound: string) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useAudio = create<AudioState>()(
  subscribeWithSelector((set, get) => {
    // Audio elements
    let musicElement: HTMLAudioElement | null = null;
    
    if (typeof window !== 'undefined') {
      musicElement = new Audio();
      musicElement.loop = true;
    }
    
    return {
      // Sound settings
      isMuted: false,
      volume: 0.5,
      
      // Music and sounds
      backgroundMusic: null,
      
      // Play background music
      playMusic: (music: string) => {
        if (!musicElement || get().isMuted) return;
        
        // Set music source and play
        musicElement.src = music;
        musicElement.volume = get().volume;
        
        try {
          musicElement.play().catch(err => console.error("Error playing music:", err));
          set({ backgroundMusic: music });
        } catch (error) {
          console.error("Error playing music:", error);
        }
      },
      
      // Stop background music
      stopMusic: () => {
        if (!musicElement) return;
        
        musicElement.pause();
        musicElement.currentTime = 0;
        set({ backgroundMusic: null });
      },
      
      // Play a sound effect
      playSound: (sound: string) => {
        if (get().isMuted) return;
        
        try {
          const soundElement = new Audio(sound);
          soundElement.volume = get().volume;
          soundElement.play().catch(err => console.error("Error playing sound:", err));
        } catch (error) {
          console.error("Error playing sound:", error);
        }
      },
      
      // Set muted state
      setMuted: (muted: boolean) => {
        set({ isMuted: muted });
        
        if (musicElement) {
          if (muted) {
            musicElement.pause();
          } else if (get().backgroundMusic) {
            musicElement.play().catch(err => console.error("Error resuming music:", err));
          }
        }
      },
      
      // Set volume level
      setVolume: (volume: number) => {
        // Ensure volume is between 0 and 1
        const normalizedVolume = Math.max(0, Math.min(1, volume));
        
        set({ volume: normalizedVolume });
        
        if (musicElement && !get().isMuted) {
          musicElement.volume = normalizedVolume;
        }
      }
    };
  })
);

export default useAudio;