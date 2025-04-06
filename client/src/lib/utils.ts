import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));
  
/**
 * Complete game reset function that ensures all game state is properly reset
 * This includes resetting all store states, clearing localStorage, and forcing a page reload
 */
export const performCompleteGameReset = () => {
  console.log("Starting complete game reset process...");
  
  // 1. First, add flags to sessionStorage to guide the reset process
  // These will be used after page reload to continue the reset process
  sessionStorage.setItem('game_reset_in_progress', 'true');
  
  // Set up the redirect target
  const createPageUrl = '/create';
  if (window.location.pathname !== createPageUrl) {
    sessionStorage.setItem('redirect_after_reset', createPageUrl);
  }
  
  // 2. List of all known localStorage keys used in the game
  const allGameStorageKeys = [
    'business-empire-game',
    'business-empire-character',
    'business-empire-events',
    'luxury_lifestyle_time', 
    'business-empire-economy',
    'business-empire-claimed-rewards',
    'auto-maintain-needs',
    'business-empire-achievements'
  ];
  
  // 3. Reset all stores synchronously before clearing localStorage
  // This way the stores can save their reset state to localStorage
  try {
    // RESET SEQUENCE IS CRITICAL:
    // 1. Time store MUST be reset first
    // 2. Character store second
    // 3. Other stores after
    // This order ensures proper date handling
    
    // Reset time store FIRST - IMPORTANT: do this first to ensure accurate date reset
    console.log("STEP 1: Resetting time store...");
    const timeStore = require('./stores/useTime').useTime;
    if (timeStore.getState().resetTime) {
      // Reset time to current device date
      timeStore.getState().resetTime();
      console.log("Time successfully reset to current date");
    } else {
      console.error("Time store reset function not found!");
    }

    // Force a small delay to ensure time store changes are saved
    console.log("Waiting for time store changes to be saved...");
    
    // Reset character store SECOND
    console.log("STEP 2: Resetting character store...");
    const characterStore = require('./stores/useCharacter').useCharacter;
    if (characterStore.getState().resetCharacter) {
      characterStore.getState().resetCharacter();
      console.log("Character successfully reset");
    } else {
      console.error("Character store reset function not found!");
    }
    
    // Reset game store
    console.log("STEP 3: Resetting game store...");
    const gameStore = require('./stores/useGame').useGame;
    if (gameStore.getState().reset) {
      gameStore.getState().reset();
      console.log("Game store successfully reset");
    } else {
      console.error("Game store reset function not found!");
    }
    
    // Reset economy store
    console.log("STEP 4: Resetting economy store...");
    const economyStore = require('./stores/useEconomy').useEconomy;
    if (economyStore.getState().resetEconomy) {
      economyStore.getState().resetEconomy();
      console.log("Economy store successfully reset");
    } else {
      console.error("Economy store reset function not found!");
    }
    
    // Reset events store
    console.log("STEP 5: Resetting events store...");
    const eventsStore = require('./stores/useRandomEvents').default;
    if (eventsStore.getState().resetEvents) {
      eventsStore.getState().resetEvents();
      console.log("Events store successfully reset");
    } else {
      console.error("Events store reset function not found!");
    }
    
    // Reset achievements store
    console.log("STEP 6: Resetting achievements store...");
    const achievementsStore = require('./stores/useAchievements').useAchievements;
    if (achievementsStore.getState().resetAchievements) {
      achievementsStore.getState().resetAchievements();
      console.log("Achievements store successfully reset");
    } else {
      console.error("Achievements store reset function not found!");
    }
    
    console.log("All stores have been reset");
  } catch (error) {
    console.error("Error during store resets:", error);
  }
  
  // 4. Verify the localStorage after all store resets
  console.log("Verifying localStorage after store resets...");
  // Get the current time data from localStorage
  const timeData = getLocalStorage('luxury_lifestyle_time');
  if (timeData) {
    console.log(`Current date in storage after reset: ${timeData.currentMonth}/${timeData.currentDay}/${timeData.currentYear}`);
  } else {
    console.warn("No time data in localStorage after store resets!");
  }
  
  // 5. Clear localStorage just to be doubly sure no old data remains
  // but only AFTER all stores have had a chance to save their reset state
  console.log("STEP 7: Clearing all game storage keys...");
  allGameStorageKeys.forEach(key => {
    try {
      // Skip the time storage key since we just reset it
      if (key !== 'luxury_lifestyle_time') {
        localStorage.removeItem(key);
        console.log(`Successfully cleared key: ${key}`);
      } else {
        console.log(`Keeping time data for key: ${key}`);
      }
    } catch (e) {
      console.error(`Failed to clear key ${key}:`, e);
    }
  });
  
  console.log("All stores reset, reloading page to complete reset process...");
  
  // 6. Force a page reload to complete the reset and clear any in-memory state
  // The App.tsx useEffect will handle the redirect to character creation afterward
  window.location.reload();
};

/**
 * Format a number as currency with no decimal places
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string with no decimal places
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(Math.round(amount));
};

/**
 * Format a stock price with exactly 2 decimal places
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string with 2 decimal places
 */
export const formatStockPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number as an integer (no decimal places)
 * @param num The number to format
 * @returns Formatted integer string
 */
export const formatInteger = (num: number): string => {
  return Math.round(num).toString();
};

/**
 * Format a number as a percentage with specified decimal places
 * @param value The number to format (e.g., 0.1234 for 12.34%)
 * @param fixed The number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "12.3%")
 */
export const formatPercentage = (value: number, fixed: number = 1): string => {
  return (value * 100).toFixed(fixed) + '%';
};

export { getLocalStorage, setLocalStorage };
