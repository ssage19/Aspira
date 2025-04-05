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
  playHit: () => void;
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
        // We'll just log the achievement without trying to play a sound
        // to avoid the constant error messages and potential crashes
        // This can be re-enabled once the sound file is available
        if (get().isMuted) return;
        
        // Don't try to play a sound that doesn't exist
        // console.log("Achievement completed");
      },
      
      // Play hit/error sound for notifications
      playHit: () => {
        // Disable hit sound to avoid errors
        // We'll just log the hit without trying to play a sound
        if (get().isMuted) return;
        
        // Don't try to play a sound that doesn't exist
        // console.log("Hit/error notification");
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