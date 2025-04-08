import { create } from 'zustand';

interface AudioState {
  // Audio state
  isMuted: boolean;
  backgroundVolume: number;
  effectsVolume: number;
  
  // Functions
  toggleMute: () => void;
  setBackgroundVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
  playSound: (soundName: string) => void;
}

// Create audio store
export const useAudio = create<AudioState>((set, get) => {
  // Audio elements map
  const audioElements: Record<string, HTMLAudioElement> = {};
  
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Create sound effects if in browser
  if (isBrowser) {
    // We'll load these lazily when needed
    const soundEffects = [
      'jump',
      'collect',
      'collision',
      'gameOver',
      'success'
    ];
    
    // Create the audio elements when they're first played
    // instead of all at once
  }
  
  return {
    // Initial state
    isMuted: false,
    backgroundVolume: 0.5,
    effectsVolume: 0.8,
    
    // Toggle sound
    toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
    
    // Set background music volume
    setBackgroundVolume: (volume) => set({ backgroundVolume: volume }),
    
    // Set sound effects volume
    setEffectsVolume: (volume) => set({ effectsVolume: volume }),
    
    // Play a sound effect
    playSound: (soundName) => {
      if (!isBrowser) return;
      
      const { isMuted, effectsVolume } = get();
      if (isMuted) return;
      
      try {
        // Lazily create audio element if it doesn't exist
        if (!audioElements[soundName]) {
          audioElements[soundName] = new Audio(`/sounds/${soundName}.mp3`);
        }
        
        const audio = audioElements[soundName];
        audio.volume = effectsVolume;
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.warn(`Error playing sound ${soundName}:`, err);
        });
      } catch (error) {
        console.error(`Failed to play sound ${soundName}:`, error);
      }
    }
  };
});