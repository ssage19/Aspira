import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Flag to indicate a reset is in progress
// This will be used to prevent loading stale data during reset
let resetInProgress = false;

const getLocalStorage = (key: string): any => {
  // Special case: If we just performed a game reset, force fresh date
  const blockTimeLoads = sessionStorage.getItem('block_time_loads') === 'true';
  const forceCurrentDate = sessionStorage.getItem('force_current_date') === 'true';
  
  // If reset is in progress or we need to force current date and we're requesting time data
  if ((resetInProgress || blockTimeLoads || forceCurrentDate) && key === 'luxury_lifestyle_time') {
    console.log('Reset or force condition active, forcing fresh date by returning null for time data');
    
    // Get the current real date
    const now = new Date();
    const freshTimeState = {
      currentDay: now.getDate(),
      currentMonth: now.getMonth() + 1,
      currentYear: now.getFullYear(),
      startDay: now.getDate(),
      startMonth: now.getMonth() + 1,
      startYear: now.getFullYear(),
      currentGameDate: now.toISOString(),
      timeSpeed: 'normal',
      timeMultiplier: 1.0,
      autoAdvanceEnabled: true,
      timeProgress: 0,
      lastTickTime: Date.now(),
      pausedTimestamp: 0,
      accumulatedProgress: 0,
      dayCounter: 0,
      _manuallyReset: true,
      _resetTimestamp: Date.now(),
      _source: "ForceCurrentDate_getLocalStorage"
    };
    
    // Save this to localStorage
    try {
      localStorage.setItem('luxury_lifestyle_time', JSON.stringify(freshTimeState));
      console.log(`Forced current date in localStorage: ${freshTimeState.currentMonth}/${freshTimeState.currentDay}/${freshTimeState.currentYear}`);
    } catch (err) {
      console.error('Error saving forced current date:', err);
    }
    
    // Return the fresh state directly
    return freshTimeState;
  }
  
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue || rawValue === "null") return null;
    
    const value = JSON.parse(rawValue);
    
    // Debug for time data
    if (key === 'luxury_lifestyle_time' && value) {
      console.log(`Retrieved from localStorage - ${key}: Date = ${value.currentMonth}/${value.currentDay}/${value.currentYear}`);
      
      // Validate time data
      if (forceCurrentDate || blockTimeLoads) {
        // We need to ensure this is today's date
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        // If the date doesn't match, return a fresh state
        if (value.currentDay !== currentDay || value.currentMonth !== currentMonth || value.currentYear !== currentYear) {
          console.warn('Time data does not match today\'s date, forcing fresh date');
          const freshState = {
            ...value,
            currentDay,
            currentMonth,
            currentYear,
            startDay: currentDay,
            startMonth: currentMonth, 
            startYear: currentYear,
            currentGameDate: now.toISOString(),
            _source: "ForceCurrentDate_getLocalStorage_validation"
          };
          return freshState;
        }
      }
    }
    
    return value;
  } catch (e) {
    console.error(`Error retrieving ${key} from localStorage:`, e);
    // On error, return null to use default values
    return null;
  }
};

const setLocalStorage = (key: string, value: any): void => {
  try {
    // If we're handling time data and a reset is in progress, check for consistency
    if (key === 'luxury_lifestyle_time' && value) {
      // Check for reset flags
      const timeJustReset = sessionStorage.getItem('time_just_reset') === 'true';
      const resetTimestamp = parseInt(sessionStorage.getItem('time_reset_timestamp') || '0');
      const isRecentReset = Date.now() - resetTimestamp < 10000; // Within 10 seconds of reset
      
      // Log the current date we're trying to save
      console.log(`Saving to localStorage - ${key}: Date = ${value.currentMonth}/${value.currentDay}/${value.currentYear}`);
      
      // If a reset just happened, check if we're trying to save a future date
      if (timeJustReset && isRecentReset) {
        // Get the real-world date
        const now = new Date();
        const realDay = now.getDate();
        const realMonth = now.getMonth() + 1;
        const realYear = now.getFullYear();
        
        // Check if we're trying to save a future date that's significantly different
        const isFutureDate = isFutureDateByDays(
          value.currentDay, value.currentMonth, value.currentYear,
          realDay, realMonth, realYear,
          3 // More than 3 days is considered problematic
        );
        
        if (isFutureDate) {
          console.warn(`Attempted to save a future date (${value.currentMonth}/${value.currentDay}/${value.currentYear}) right after reset. Blocking this save.`);
          return; // Don't save this value
        }
      }
    }
    
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

// Helper function to check if a date is in the future by more than N days
const isFutureDateByDays = (
  day1: number, month1: number, year1: number,
  day2: number, month2: number, year2: number,
  thresholdDays: number
): boolean => {
  const date1 = new Date(year1, month1 - 1, day1);
  const date2 = new Date(year2, month2 - 1, day2);
  
  // Calculate the difference in milliseconds and convert to days
  const diffTime = date1.getTime() - date2.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Return true if the first date is more than threshold days ahead of the second date
  return diffDays > thresholdDays;
};
  
/**
 * Complete game reset function that ensures all game state is properly reset
 * This includes resetting all store states, clearing localStorage, and forcing a page reload
 */
export const performCompleteGameReset = () => {
  console.log("Starting complete game reset process...");
  
  // Set the reset flag to ensure no stale data is loaded
  resetInProgress = true;
  console.log("Reset flag set to prevent loading stale data");
  
  // 1. First, add flags to sessionStorage to guide the reset process
  // These will be used after page reload to continue the reset process
  sessionStorage.setItem('game_reset_in_progress', 'true');
  
  // Mark that a reset has been completed - this will be checked by components
  // to ensure they refresh their data (especially NetWorthBreakdown)
  sessionStorage.setItem('game_reset_completed', 'true');
  
  // Set up the redirect target
  const createPageUrl = '/create';
  if (window.location.pathname !== createPageUrl) {
    sessionStorage.setItem('redirect_after_reset', createPageUrl);
  }
  
  // 2. COMPLETELY CLEAR ALL LOCAL STORAGE - More aggressive approach
  try {
    console.log("STEP 1: Performing complete localStorage clear first");
    localStorage.clear();
    console.log("All localStorage data completely cleared");
  } catch (e) {
    console.error("Error during localStorage clear:", e);
  }
  
  // 3. List of all known localStorage keys used in the game - to double-check removal
  const allGameStorageKeys = [
    'business-empire-game',
    'business-empire-character',
    'business-empire-events',
    'luxury_lifestyle_time', 
    'business-empire-economy',
    'business-empire-claimed-rewards',
    'auto-maintain-needs',
    'business-empire-achievements',
    'business-empire-networth-breakdown' // Add key for net worth breakdown if it exists
  ];
  
  // Verify all keys are cleared
  console.log("Verifying all localStorage keys are cleared:");
  allGameStorageKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.error(`Key ${key} still has data after clear! Removing explicitly.`);
      localStorage.removeItem(key);
    } else {
      console.log(`Key ${key} successfully cleared.`);
    }
  });
  
  // 4. Get the current real date to use in time reset
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = now.getFullYear();
  
  console.log(`Fresh device date for reset: ${currentMonth}/${currentDay}/${currentYear}`);
  
  // 5. Create a fresh time state manually and save directly to localStorage
  try {
    console.log("STEP 2: Manually setting fresh time data");
    const freshTimeState = {
      currentDay,
      currentMonth,
      currentYear,
      startDay: currentDay,
      startMonth: currentMonth,
      startYear: currentYear,
      currentGameDate: now,
      timeSpeed: 'normal',
      timeMultiplier: 1.0,
      autoAdvanceEnabled: true,
      timeProgress: 0,
      lastTickTime: Date.now(),
      pausedTimestamp: 0,
      accumulatedProgress: 0,
      dayCounter: 0,
      // Add a flag to mark this as a manually reset time
      // This prevents future writes during redirect/reload cycles
      _manuallyReset: true,
      _resetTimestamp: Date.now()
    };
    
    // Directly set in localStorage - bypass our custom function to avoid any issues
    localStorage.setItem('luxury_lifestyle_time', JSON.stringify(freshTimeState));
    console.log(`Directly saved fresh time state: ${currentMonth}/${currentDay}/${currentYear}`);
    
    // Double-check time data was saved correctly
    const savedTimeRaw = localStorage.getItem('luxury_lifestyle_time');
    if (savedTimeRaw) {
      const savedTime = JSON.parse(savedTimeRaw);
      console.log(`Verified saved time: ${savedTime.currentMonth}/${savedTime.currentDay}/${savedTime.currentYear}`);
      
      // Add a session variable that indicates the time was just reset
      // App.tsx can check this to avoid unnecessary reloads/resets
      sessionStorage.setItem('time_just_reset', 'true');
      sessionStorage.setItem('time_reset_timestamp', Date.now().toString());
    } else {
      console.error("Failed to save time data!");
    }
  } catch (e) {
    console.error("Error setting fresh time state:", e);
  }
  
  // 6. Now reset all stores, after localStorage is properly set up
  try {
    // RESET SEQUENCE IS CRITICAL:
    // 1. Time store MUST be reset first
    // 2. Character store second
    // 3. Other stores after
    // This order ensures proper date handling
    
    // Reset time store FIRST
    console.log("STEP 3: Resetting store states...");
    
    // FIRST - EXPLICITLY reset net worth breakdown to ensure no stale data
    try {
      // First check if there's a dedicated net worth breakdown store
      const netWorthStore = require('./stores/useNetWorthBreakdown').useNetWorthBreakdown;
      if (netWorthStore && netWorthStore.getState()) {
        console.log("Found dedicated netWorthBreakdown store, resetting it first");
        if (netWorthStore.getState().reset) {
          netWorthStore.getState().reset();
        } else {
          // If no reset function, nullify the state directly
          Object.keys(netWorthStore.getState()).forEach(key => {
            if (typeof netWorthStore.getState()[key] !== 'function') {
              netWorthStore.getState()[key] = null;
            }
          });
        }
      }
    } catch (e) {
      // No dedicated store exists, try looking for localStorage version
      console.log("No dedicated netWorthBreakdown store found, clearing any localStorage entry");
      localStorage.removeItem('business-empire-networth-breakdown');
    }
    
    // SECOND - Reset time store
    const timeStore = require('./stores/useTime').useTime;
    if (timeStore.getState().resetTime) {
      timeStore.getState().resetTime();
      console.log("Time store state reset");
    } else {
      console.error("Time store reset function not found!");
    }
    
    // Reset character store THIRD
    console.log("Resetting character store...");
    const characterStore = require('./stores/useCharacter').useCharacter;
    if (characterStore.getState().resetCharacter) {
      // Enhanced process for clearing netWorthBreakdown data
      // 1. First remove any separate localStorage entry
      console.log("Explicitly removing netWorthBreakdown from localStorage");
      try {
        localStorage.removeItem('business-empire-networth-breakdown');
      } catch (e) {
        console.error("Error removing breakdown from localStorage:", e);
      }
      
      // 2. Then clear in-memory breakdown in character store
      try {
        if (characterStore.getState()) {
          if ((characterStore.getState() as any).netWorthBreakdown) {
            console.log("Explicitly clearing cached netWorthBreakdown data in character store");
            (characterStore.getState() as any).netWorthBreakdown = null;
          }
          
          // Also clear any flags related to netWorthBreakdown calculations
          if ((characterStore.getState() as any)._netWorthRecalculated) {
            console.log("Clearing netWorthRecalculated flag");
            (characterStore.getState() as any)._netWorthRecalculated = false;
          }
          
          // Force a clean default breakdown to be set in character state
          if (characterStore.getState().wealth !== undefined) {
            const defaultBreakdown = {
              cash: characterStore.getState().wealth || 0,
              stocks: 0,
              crypto: 0,
              bonds: 0,
              otherInvestments: 0,
              propertyEquity: 0,
              propertyValue: 0,
              propertyDebt: 0,
              lifestyleItems: 0,
              total: characterStore.getState().wealth || 0
            };
            
            console.log("Setting clean default breakdown in character store:", defaultBreakdown);
            (characterStore.getState() as any).netWorthBreakdown = defaultBreakdown;
          }
        }
      } catch (err) {
        console.error("Error handling in-memory breakdown:", err);
      }
      
      // Now perform the full character reset
      characterStore.getState().resetCharacter();
      console.log("Character store state reset");
    } else {
      console.error("Character store reset function not found!");
    }
    
    // Reset game store
    console.log("Resetting game store...");
    const gameStore = require('./stores/useGame').useGame;
    if (gameStore.getState().reset) {
      gameStore.getState().reset();
      console.log("Game store state reset");
    } else {
      console.error("Game store reset function not found!");
    }
    
    // Reset economy store
    console.log("Resetting economy store...");
    const economyStore = require('./stores/useEconomy').useEconomy;
    if (economyStore.getState().resetEconomy) {
      economyStore.getState().resetEconomy();
      console.log("Economy store state reset");
    } else {
      console.error("Economy store reset function not found!");
    }
    
    // Reset events store
    console.log("Resetting events store...");
    const eventsStore = require('./stores/useRandomEvents').default;
    if (eventsStore.getState().resetEvents) {
      eventsStore.getState().resetEvents();
      console.log("Events store state reset");
    } else {
      console.error("Events store reset function not found!");
    }
    
    // Reset achievements store
    console.log("Resetting achievements store...");
    const achievementsStore = require('./stores/useAchievements').useAchievements;
    if (achievementsStore.getState().resetAchievements) {
      achievementsStore.getState().resetAchievements();
      console.log("Achievements store state reset");
    } else {
      console.error("Achievements store reset function not found!");
    }
    
    console.log("All stores have been reset");
  } catch (error) {
    console.error("Error during store resets:", error);
  }
  
  // 7. Final verification
  console.log("STEP 4: Final verification of date in localStorage");
  try {
    const finalTimeCheck = localStorage.getItem('luxury_lifestyle_time');
    if (finalTimeCheck) {
      const parsedTime = JSON.parse(finalTimeCheck);
      console.log(`FINAL VERIFICATION - Date in localStorage: ${parsedTime.currentMonth}/${parsedTime.currentDay}/${parsedTime.currentYear}`);
    } else {
      console.error("CRITICAL ERROR: No time data in localStorage after reset!");
    }
  } catch (e) {
    console.error("Error during final verification:", e);
  }
  
  console.log("All steps completed, reloading page to complete reset process...");
  
  // 8. Set flags to ensure correct time usage
  // These flags will be checked by various components to ensure the correct date is used
  sessionStorage.setItem('force_current_date', 'true');
  sessionStorage.setItem('block_time_loads', 'true');
  sessionStorage.setItem('smooth_navigation', 'true');

  // 9. Add a cache-busting parameter to the URL to ensure we get a fresh page
  // This is crucial for avoiding cached data during navigation
  const timestamp = Date.now();
  window.location.href = `/create?reset=${timestamp}`;
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
