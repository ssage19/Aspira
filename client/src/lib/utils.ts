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
  
  // 3. Clear each specific key to ensure nothing is missed
  console.log("Clearing all game storage keys...");
  allGameStorageKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`Successfully cleared key: ${key}`);
    } catch (e) {
      console.error(`Failed to clear key ${key}:`, e);
    }
  });
  
  // 4. Also do a complete localStorage.clear() for any keys we might have missed
  // This is a more aggressive approach to ensure a complete reset
  try {
    localStorage.clear();
    console.log("All localStorage data cleared");
  } catch (e) {
    console.error("Failed to clear all localStorage:", e);
  }
  
  // 5. Reset all stores synchronously before reload
  // Note: We use a more synchronous approach to ensure all resets happen
  // before the page reloads
  try {
    // Reset time store FIRST - IMPORTANT: do this first to ensure accurate date reset
    console.log("Resetting time store...");
    const timeStore = require('./stores/useTime').useTime;
    if (timeStore.getState().resetTime) {
      // Reset time to current device date
      timeStore.getState().resetTime();
      console.log("Time successfully reset to current date");
    }

    // Reset character store
    console.log("Resetting character store...");
    const characterStore = require('./stores/useCharacter').useCharacter;
    if (characterStore.getState().resetCharacter) {
      characterStore.getState().resetCharacter();
    }
    
    // Reset game store
    console.log("Resetting game store...");
    const gameStore = require('./stores/useGame').useGame;
    if (gameStore.getState().reset) {
      gameStore.getState().reset();
    }
    
    // Reset economy store
    console.log("Resetting economy store...");
    const economyStore = require('./stores/useEconomy').useEconomy;
    if (economyStore.getState().resetEconomy) {
      economyStore.getState().resetEconomy();
    }
    
    // Reset events store
    console.log("Resetting events store...");
    const eventsStore = require('./stores/useRandomEvents').default;
    if (eventsStore.getState().resetEvents) {
      eventsStore.getState().resetEvents();
    }
    
    // Reset achievements store
    console.log("Resetting achievements store...");
    const achievementsStore = require('./stores/useAchievements').useAchievements;
    if (achievementsStore.getState().resetAchievements) {
      achievementsStore.getState().resetAchievements();
    }
  } catch (error) {
    console.error("Error during store resets:", error);
    console.log("Continuing with page reload to complete reset...");
  }
  
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
