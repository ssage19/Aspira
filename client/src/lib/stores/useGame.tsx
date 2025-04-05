import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export type GamePhase = "ready" | "creating" | "playing" | "paused" | "finished";

interface GameState {
  // Game state
  phase: GamePhase;
  
  // Game settings
  difficulty: "easy" | "normal" | "hard";
  gameSpeed: "slow" | "normal" | "fast";
  
  // Game time tracking
  startedAt: number | null;
  lastUpdatedAt: number | null;
  
  // Achievement tracking
  achievementsUnlocked: string[];
  recentlyUnlockedAchievements: string[];
  
  // Functions
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  restart: () => void;
  finish: () => void;
  unlockAchievement: (id: string) => void;
  clearRecentAchievements: () => void;
  setDifficulty: (difficulty: "easy" | "normal" | "hard") => void;
  setGameSpeed: (speed: "slow" | "normal" | "fast") => void;
  isAchievementUnlocked: (id: string) => boolean;
}

const STORAGE_KEY = 'business-empire-game';

// Load from local storage if available
const loadSavedGame = () => {
  const saved = getLocalStorage(STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
};

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => {
    // Try to load saved game
    const savedGame = loadSavedGame();
    
    return {
      // Game state
      phase: savedGame?.phase || "ready",
      
      // Game settings
      difficulty: savedGame?.difficulty || "normal",
      gameSpeed: savedGame?.gameSpeed || "normal",
      
      // Game time tracking
      startedAt: savedGame?.startedAt || null,
      lastUpdatedAt: savedGame?.lastUpdatedAt || null,
      
      // Achievement tracking
      achievementsUnlocked: savedGame?.achievementsUnlocked || [],
      recentlyUnlockedAchievements: savedGame?.recentlyUnlockedAchievements || [],
      
      // Start the game
      start: () => {
        const now = Date.now();
        set({
          phase: "playing",
          startedAt: now,
          lastUpdatedAt: now
        });
        saveState();
      },
      
      // Pause the game
      pause: () => {
        set({ phase: "paused" });
        saveState();
      },
      
      // Resume the game
      resume: () => {
        set({ 
          phase: "playing",
          lastUpdatedAt: Date.now()
        });
        saveState();
      },
      
      // Reset the game
      reset: () => {
        set({
          phase: "ready",
          startedAt: null,
          lastUpdatedAt: null,
          achievementsUnlocked: [],
          recentlyUnlockedAchievements: []
        });
        saveState();
      },
      
      // Restart the game (reset and start)
      restart: () => {
        const state = get();
        state.reset();
        state.start();
      },
      
      // Finish the game
      finish: () => {
        set({ phase: "finished" });
        saveState();
      },
      
      // Unlock an achievement
      unlockAchievement: (id) => {
        const { achievementsUnlocked, recentlyUnlockedAchievements } = get();
        
        // Only add if not already unlocked
        if (!achievementsUnlocked.includes(id)) {
          set({
            achievementsUnlocked: [...achievementsUnlocked, id],
            recentlyUnlockedAchievements: [...recentlyUnlockedAchievements, id]
          });
          saveState();
        }
      },
      
      // Clear recently unlocked achievements
      clearRecentAchievements: () => {
        set({ recentlyUnlockedAchievements: [] });
        saveState();
      },
      
      // Set difficulty
      setDifficulty: (difficulty) => {
        set({ difficulty });
        saveState();
      },
      
      // Set game speed
      setGameSpeed: (gameSpeed) => {
        set({ gameSpeed });
        saveState();
      },
      
      // Check if an achievement is unlocked
      isAchievementUnlocked: (id) => {
        return get().achievementsUnlocked.includes(id);
      }
    };
  })
);

// Helper function to save the current state to localStorage
function saveState() {
  const state = useGame.getState();
  setLocalStorage(STORAGE_KEY, state);
}

export default useGame;