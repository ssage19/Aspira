import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface AudioState {
  // Sound settings
  isMuted: boolean;
  volume: number;
  
  // Music and sound effects
  backgroundMusic: HTMLAudioElement | null;
  
  // Functions
  playMusic: (music: string) => void;
  stopMusic: () => void;
  playSound: (sound: string) => void;
  playSuccess: () => void;
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
          set({ backgroundMusic: musicElement });
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
          // Check if the sound file exists or is valid
          const soundElement = new Audio();
          
          // Add an error handler to avoid uncaught exceptions
          soundElement.onerror = () => {
            console.warn(`Sound file not found or cannot be played: ${sound}`);
          };
          
          // Set volume and source
          soundElement.volume = get().volume;
          soundElement.src = sound;
          
          // Try to play the sound, but don't crash if it fails
          soundElement.play().catch(err => {
            console.warn(`Error playing sound ${sound}:`, err);
          });
        } catch (error) {
          console.warn("Error setting up sound:", error);
        }
      },
      
      // Play success sound for achievements
      playSuccess: () => {
        // Try to play the achievement sound, but silently fail if it doesn't exist
        try {
          // We're using a default success sound
          const successSound = '/sounds/achievement.mp3';
          get().playSound(successSound);
          console.log("Playing achievement sound");
        } catch (error) {
          // Silently ignore errors - this is not critical functionality
          console.log("Could not play achievement sound, continuing silently");
        }
      },
      
      // Set muted state
      setMuted: (muted: boolean) => {
        set({ isMuted: muted });
        
        const currentMusic = get().backgroundMusic;
        if (musicElement && currentMusic) {
          if (muted) {
            currentMusic.pause();
          } else {
            currentMusic.play().catch(err => console.error("Error resuming music:", err));
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