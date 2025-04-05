import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { useAchievements } from "./useAchievements";
import { useTime } from "./useTime";

export type GamePhase = "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;
  cash: number;
  incomeMultiplier: number;
  
  // Game state actions
  start: () => void;
  restart: () => void;
  end: () => void;
  
  // Money management
  addCash: (amount: number) => void;
  removeCash: (amount: number) => boolean; // returns false if not enough cash
  getCash: () => number;
  
  // Multipliers and bonuses
  applyIncomeMultiplier: (multiplier: number) => void;
  resetIncomeMultiplier: () => void;
  getIncomeMultiplier: () => number;
}

export const useGame = create<GameState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      phase: "ready",
      cash: 5000, // Starting cash
      incomeMultiplier: 1.0, // Default multiplier (no effect)
      
      // Game state
      start: () => {
        set((state) => {
          // Only transition from ready to playing
          if (state.phase === "ready") {
            return { phase: "playing" };
          }
          return {};
        });
      },
      
      restart: () => {
        set(() => ({ 
          phase: "ready",
          cash: 5000,
          incomeMultiplier: 1.0
        }));
        
        // Reset achievements and time when game is restarted
        // Using setTimeout to prevent circular dependency issues
        setTimeout(() => {
          // Reset achievements
          const { resetAchievements } = useAchievements.getState();
          if (resetAchievements) {
            resetAchievements();
          }
          
          // Reset time to current device date/time
          const { resetTime } = useTime.getState();
          if (resetTime) {
            resetTime();
          }
        }, 0);
      },
      
      end: () => {
        set((state) => {
          // Only transition from playing to ended
          if (state.phase === "playing") {
            return { phase: "ended" };
          }
          return {};
        });
      },
      
      // Money management
      addCash: (amount) => {
        // Apply income multiplier if it's income
        const actualAmount = amount > 0 
          ? amount * get().incomeMultiplier 
          : amount;
        
        set((state) => ({
          cash: state.cash + actualAmount
        }));
      },
      
      removeCash: (amount) => {
        if (get().cash >= amount) {
          set((state) => ({
            cash: state.cash - amount
          }));
          return true;
        }
        return false;
      },
      
      getCash: () => get().cash,
      
      // Multipliers and bonuses
      applyIncomeMultiplier: (multiplier) => {
        set((state) => ({
          incomeMultiplier: state.incomeMultiplier * multiplier
        }));
      },
      
      resetIncomeMultiplier: () => {
        set(() => ({
          incomeMultiplier: 1.0
        }));
      },
      
      getIncomeMultiplier: () => get().incomeMultiplier
    })),
    {
      name: 'business-empire-game'
    }
  )
);
