import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getStore } from "./utils/storeRegistry";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a random element from an array
 * @param array The array to select from
 * @returns A random element from the array
 */
export function getRandomElement<T>(array: T[]): T {
  if (!array || array.length === 0) {
    throw new Error("Cannot get random element from empty or undefined array");
  }
  return array[Math.floor(Math.random() * array.length)];
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
    // 1. First, manually clear localStorage for all stores to prevent stale data
    // 2. Then reset the stores in the correct sequence:
    //    a. Asset tracker first
    //    b. Time store second
    //    c. Character store third
    //    d. Other stores last
    // 3. Finally, verify all localStorage entries are cleared
    
    // Now reset all stores in the proper sequence
    console.log("STEP 3: Resetting store states...");
    
    // FIRST - Reset asset tracker store explicitly
    try {
      console.log("STEP 3.1: Reset asset tracker first to prevent stale investment data");
      
      // First, clear related localStorage entries directly
      try {
        localStorage.removeItem('business-empire-networth-breakdown');
        localStorage.removeItem('business-empire-asset-tracker');
        console.log("Manually removed asset tracking data from localStorage");
      } catch (lsError) {
        console.error("Error manually clearing asset data from localStorage:", lsError);
      }
      
      // Set flags to indicate reset has occurred
      sessionStorage.setItem('asset_tracker_reset', 'true');
      sessionStorage.setItem('asset_tracker_reset_timestamp', Date.now().toString());
      
      // Import the module properly
      try {
        // Use dynamic import for a cleaner solution
        import('./stores/useAssetTracker').then(assetTrackerModule => {
          const assetTracker = assetTrackerModule.default;
          
          if (assetTracker && typeof assetTracker.getState === 'function') {
            const state = assetTracker.getState();
            
            if (state && typeof state.resetAssetTracker === 'function') {
              console.log("Executing asset tracker reset via dynamic import");
              state.resetAssetTracker();
              console.log("Asset tracker successfully reset");
            } else {
              console.error("Asset tracker state exists but resetAssetTracker function not found!");
            }
          } else {
            console.error("Asset tracker exists but getState is not a function!");
          }
        }).catch(importErr => {
          console.error("Failed to dynamically import asset tracker:", importErr);
        });
      } catch (importErr) {
        console.error("Error during dynamic import of asset tracker:", importErr);
        
        // Fallback to traditional require
        try {
          // Traditional require as fallback
          const assetTrackerModule = require('./stores/useAssetTracker');
          const assetTracker = assetTrackerModule.default || assetTrackerModule.useAssetTracker;
          
          if (assetTracker && typeof assetTracker.getState === 'function') {
            const state = assetTracker.getState();
            
            if (state && typeof state.resetAssetTracker === 'function') {
              console.log("Executing asset tracker reset via require fallback");
              state.resetAssetTracker();
              console.log("Asset tracker successfully reset via fallback");
            } else {
              console.error("Asset tracker state exists but resetAssetTracker function not found in fallback!");
            }
          } else {
            console.error("Asset tracker exists but getState is not a function in fallback!");
          }
        } catch (requireErr) {
          console.error("Critical error using require fallback for asset tracker:", requireErr);
        }
      }
      
      // SECOND - Reset net worth breakdown
      // Set flags to indicate breakdown data has been reset
      sessionStorage.setItem('networth_breakdown_reset', 'true');
      sessionStorage.setItem('networth_breakdown_reset_timestamp', Date.now().toString());
      
      // Check if there's a dedicated net worth breakdown store
      try {
        // Check directly if this file exists before attempting to import
        // The store might not exist in all installations
        console.log("Checking for dedicated netWorthBreakdown store...");
        
        // Just handle the case directly without dynamic import
        // This is simpler and avoids path resolution issues
        console.log("No dedicated netWorthBreakdown store implementation found (expected)");
        
        // Ensure we clean any potential localStorage entry for this
        try {
          localStorage.removeItem('business-empire-networth-breakdown');
          console.log("Removed any existing netWorthBreakdown data from localStorage");
        } catch (localErr) {
          console.error("Error removing netWorthBreakdown from localStorage:", localErr);
        }
      } catch (storeErr) {
        // No dedicated store exists, which is expected
        console.log("Error while accessing netWorthBreakdown store (expected):", storeErr);
      }
    } catch (e) {
      console.error("Error during initial asset tracker/breakdown reset:", e);
    }
    
    // THIRD - Reset time store
    try {
      console.log("STEP 3.3: Resetting time store via registry");
      const timeStore = getStore('time');
      
      if (timeStore && timeStore.getState && typeof timeStore.getState().resetTime === 'function') {
        timeStore.getState().resetTime();
        console.log("Time store state reset successfully via registry");
      } else {
        console.error("Time store or resetTime function not found in registry!");
        
        // Fallback to direct import only if necessary
        console.log("Attempting time store reset via direct import as fallback");
        const directTimeStore = require('./stores/useTime').useTime;
        
        if (directTimeStore && typeof directTimeStore.getState().resetTime === 'function') {
          directTimeStore.getState().resetTime();
          console.log("Time store state reset via fallback direct import");
        } else {
          console.error("Time store reset function not found even in fallback!");
        }
      }
    } catch (error) {
      console.error("Error resetting time store:", error);
    }
    
    // FOURTH - Reset character store
    try {
      console.log("STEP 3.4: Resetting character store via registry");
      const characterStore = getStore('character');
      
      if (characterStore && characterStore.getState) {
        // Step 1: Verify asset tracker storage is cleared (should be done already in earlier steps)
        try {
          const breakdownExists = localStorage.getItem('business-empire-networth-breakdown');
          const trackerExists = localStorage.getItem('business-empire-asset-tracker');
          
          if (breakdownExists || trackerExists) {
            console.log("WARNING: Asset tracking localStorage entries still exist, removing again");
            localStorage.removeItem('business-empire-networth-breakdown');
            localStorage.removeItem('business-empire-asset-tracker');
          }
        } catch (storageError) {
          console.error("Error checking asset tracker localStorage entries:", storageError);
        }
        
        // Step 2: Clear in-memory breakdown in character store
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
        if (typeof characterStore.getState().resetCharacter === 'function') {
          characterStore.getState().resetCharacter();
          console.log("Character store state reset successfully via registry");
        } else {
          console.error("Character store resetCharacter function not found in registry!");
          
          // Fallback to direct import only if necessary
          const directCharacterStore = require('./stores/useCharacter').useCharacter;
          if (directCharacterStore && typeof directCharacterStore.getState().resetCharacter === 'function') {
            directCharacterStore.getState().resetCharacter();
            console.log("Character store state reset via fallback direct import");
          } else {
            console.error("Character store resetCharacter function not found even in fallback!");
          }
        }
      } else {
        console.error("Character store not found in registry!");
        
        // Fallback to direct import
        const directCharacterStore = require('./stores/useCharacter').useCharacter;
        if (directCharacterStore && typeof directCharacterStore.getState().resetCharacter === 'function') {
          directCharacterStore.getState().resetCharacter();
          console.log("Character store state reset via direct import");
        } else {
          console.error("Character store resetCharacter function not found in fallback!");
        }
      }
    } catch (error) {
      console.error("Error resetting character store:", error);
    }
    
    // Reset game store
    try {
      console.log("STEP 3.5: Resetting game store via registry");
      const gameStore = getStore('game');
      
      if (gameStore && gameStore.getState && typeof gameStore.getState().reset === 'function') {
        gameStore.getState().reset();
        console.log("Game store state reset successfully via registry");
      } else {
        console.error("Game store or reset function not found in registry!");
        
        // Fallback to direct import only if necessary
        const directGameStore = require('./stores/useGame').useGame;
        if (directGameStore && typeof directGameStore.getState().reset === 'function') {
          directGameStore.getState().reset();
          console.log("Game store state reset via fallback direct import");
        } else {
          console.error("Game store reset function not found even in fallback!");
        }
      }
    } catch (error) {
      console.error("Error resetting game store:", error);
    }
    
    // Reset economy store
    try {
      console.log("STEP 3.6: Resetting economy store via registry");
      const economyStore = getStore('economy');
      
      if (economyStore && economyStore.getState && typeof economyStore.getState().resetEconomy === 'function') {
        economyStore.getState().resetEconomy();
        console.log("Economy store state reset successfully via registry");
      } else {
        console.error("Economy store or resetEconomy function not found in registry!");
        
        // Fallback to direct import only if necessary
        const directEconomyStore = require('./stores/useEconomy').useEconomy;
        if (directEconomyStore && typeof directEconomyStore.getState().resetEconomy === 'function') {
          directEconomyStore.getState().resetEconomy();
          console.log("Economy store state reset via fallback direct import");
        } else {
          console.error("Economy store resetEconomy function not found even in fallback!");
        }
      }
    } catch (error) {
      console.error("Error resetting economy store:", error);
    }
    
    // Reset events store
    try {
      console.log("STEP 3.7: Resetting events store via registry");
      const eventsStore = getStore('events');
      
      if (eventsStore && eventsStore.getState && typeof eventsStore.getState().resetEvents === 'function') {
        eventsStore.getState().resetEvents();
        console.log("Events store state reset successfully via registry");
      } else {
        console.error("Events store or resetEvents function not found in registry!");
        
        // Fallback to direct import only if necessary
        const directEventsStore = require('./stores/useRandomEvents').default;
        if (directEventsStore && typeof directEventsStore.getState().resetEvents === 'function') {
          directEventsStore.getState().resetEvents();
          console.log("Events store state reset via fallback direct import");
        } else {
          console.error("Events store resetEvents function not found even in fallback!");
        }
      }
    } catch (error) {
      console.error("Error resetting events store:", error);
    }
    
    // Reset achievements store
    try {
      console.log("STEP 3.8: Resetting achievements store via registry");
      const achievementsStore = getStore('achievements');
      
      if (achievementsStore && achievementsStore.getState && typeof achievementsStore.getState().resetAchievements === 'function') {
        achievementsStore.getState().resetAchievements();
        console.log("Achievements store state reset successfully via registry");
      } else {
        console.error("Achievements store or resetAchievements function not found in registry!");
        
        // Fallback to direct import only if necessary
        const directAchievementsStore = require('./stores/useAchievements').useAchievements;
        if (directAchievementsStore && typeof directAchievementsStore.getState().resetAchievements === 'function') {
          directAchievementsStore.getState().resetAchievements();
          console.log("Achievements store state reset via fallback direct import");
        } else {
          console.error("Achievements store resetAchievements function not found even in fallback!");
        }
      }
    } catch (error) {
      console.error("Error resetting achievements store:", error);
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

  // 9. Force removal of any character data before redirecting
  localStorage.removeItem('business-empire-character');
  console.log("CRITICAL: Explicitly removing character data from localStorage to force new character creation");
  
  // 10. Add a cache-busting parameter to the URL to ensure we get a fresh page
  // This is crucial for avoiding cached data during navigation
  const timestamp = Date.now();
  
  // 11. Force a direct redirect to character creation with a special parameter to bypass our checks
  window.location.href = `/create?reset=${timestamp}&force=true`;
};

/**
 * Format a number as currency with no decimal places
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string with no decimal places
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

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
  // Handle NaN, Infinity, and undefined
  if (isNaN(value) || !isFinite(value) || value === undefined) {
    return '0.0%';
  }
  
  // Ensure value is between 0 and 1 for percentage calculation
  // If value is already above 1, assume it's already in percentage form
  const multiplier = value > 1 ? 1 : 100;
  
  // Clamp extremely large values to prevent UI issues
  const clampedValue = Math.min(value, 1000000 / multiplier);
  
  return (clampedValue * multiplier).toFixed(fixed) + '%';
};

/**
 * Gets the image path for a property based on its ID
 * @param propertyId The ID of the property
 * @returns The image path or null if not found
 */
export function getPropertyImagePath(propertyId: string): string | null {
  // First, let's add debug logging to understand the property ID format
  console.log("Getting image path for property ID:", propertyId);
  
  // Map full property names to their image paths
  const imageMapping: Record<string, string> = {
    // Using exact names from the property details screen
    'Single Family Home': '/images/properties/single_family_home.jpg',
    'City Apartment': '/images/properties/city_apartment.jpg',
    'Luxury City Apartment': '/images/properties/luxury_city_apartment.jpg',
    'Suburban Townhouse': '/images/properties/suburban_townhome.jpg',
    'Urban Studio': '/images/properties/urban_studio.jpg',
    'Converted Loft': '/images/properties/converted_loft.jpg',
    'Garden Apartment': '/images/properties/garden_apartment.jpg',
    'Highrise One Bedroom': '/images/properties/highrise_one_bedroom.jpg',
    'Suburban Condo': '/images/properties/suburban_condo.jpg',
    'Residential Duplex': '/images/properties/residential_duplex.jpg',
    'Weekend Cottage': '/images/properties/weekend_cottage.jpg',
    'Waterfront Apartment': '/images/properties/waterfront_apartment.jpg',
    'Senior Living Condo': '/images/properties/senior_living_condo.jpg',
    'Garden District Condo': '/images/properties/garden_district_condo.jpg',
    'Lakeside Cabin': '/images/properties/lakeside_cabin.jpg',
    'Split Level Home': '/images/properties/split_level_home.jpg',
    'Colonial Style Home': '/images/properties/colonial_style_home.jpg',
    'Craftsman Bungalow': '/images/properties/craftsman_bungalow.jpg',
    'Ranch Style Home': '/images/properties/ranch_style_home.jpg',
    'Modern Townhome': '/images/properties/modern_townhome.jpg',
    
    // Luxury Properties
    'Downtown Penthouse': '/images/properties/downtown_penthouse.jpg',
    'Oceanfront Beach House': '/images/properties/oceanfront_beach_house.jpg',
    'Gated Estate': '/images/properties/urban_palace.jpg', // Using Urban Palace image for Gated Estate
    'Mediterranean Villa': '/images/properties/mediterranean_villa.jpg',
    'Lakefront Mansion': '/images/properties/lakefront_mansion.jpg',
    'Luxury Mountain Chalet': '/images/properties/luxury_mountain_chalet.jpg',
    'Historic Mansion': '/images/properties/historic_mansion.jpg',
    'Tropical Estate': '/images/properties/tropical_estate.jpg',
    'Modern Architectural Masterpiece': '/images/properties/modern_architectural_masterpiece.jpg',
    'Equestrian Estate': '/images/properties/equestrian_estate.jpg',
    'Private Island Retreat': '/images/properties/private_island_retreat.jpg',
    'French-Inspired Château': '/images/properties/french_inspired_chateau.jpg',
    'Desert Oasis Estate': '/images/properties/desert_oasis_estate.jpg',
    'Urban Palace': '/images/properties/urban_palace.jpg',
    'Vineyard Estate': '/images/properties/vineyard_estate.jpg',
    'Waterfront Compound': '/images/properties/waterfront_compound.jpg',
    'Golf Course Estate': '/images/properties/golf_course_estate.jpg',
    'Celebrity Compound': '/images/properties/celebrity_compound.jpg',
    'Ultra-Modern Smart Mansion': '/images/properties/ultra_modern_smart_mansion.jpg',
    'Ski-In/Ski-Out Chalet': '/images/properties/ski_in_ski_out_chalet.jpg',
    
    // Also keep the underscored versions for backward compatibility
    'single_family': '/images/properties/single_family_home.jpg',
    'apartment_basic': '/images/properties/city_apartment.jpg',
    'apartment_luxury': '/images/properties/luxury_city_apartment.jpg',
    'townhouse': '/images/properties/suburban_townhome.jpg',
    'studio_apartment': '/images/properties/urban_studio.jpg',
    
    // Luxury property IDs
    'penthouse': '/images/properties/downtown_penthouse.jpg',
    'beach_house': '/images/properties/oceanfront_beach_house.jpg',
    'mansion': '/images/properties/urban_palace.jpg',
    'villa': '/images/properties/mediterranean_villa.jpg',
    'lakefront_mansion': '/images/properties/lakefront_mansion.jpg',
    'mountain_chalet': '/images/properties/luxury_mountain_chalet.jpg',
    'historic_mansion': '/images/properties/historic_mansion.jpg',
    'tropical_estate': '/images/properties/tropical_estate.jpg',
    'modern_architectural': '/images/properties/modern_architectural_masterpiece.jpg',
    'equestrian_estate': '/images/properties/equestrian_estate.jpg',
    'island_retreat': '/images/properties/private_island_retreat.jpg',
    'château': '/images/properties/french_inspired_chateau.jpg',
    'desert_oasis': '/images/properties/desert_oasis_estate.jpg',
    'city_palace': '/images/properties/urban_palace.jpg',
    'vineyard_estate': '/images/properties/vineyard_estate.jpg',
    'waterfront_compound': '/images/properties/waterfront_compound.jpg',
    'golf_estate': '/images/properties/golf_course_estate.jpg',
    'celebrity_compound': '/images/properties/celebrity_compound.jpg',
    'smart_mansion': '/images/properties/ultra_modern_smart_mansion.jpg',
    'ski_chalet': '/images/properties/ski_in_ski_out_chalet.jpg'
  };

  return imageMapping[propertyId] || null;
}

// Export local storage helpers
export { getLocalStorage, setLocalStorage };
