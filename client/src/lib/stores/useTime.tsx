import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";
import { processOfflineIncome } from "../utils/offlineIncomeTracker";
import { registerStore, getStore } from "../utils/storeRegistry";

export type GameTimeSpeed = 'paused' | 'normal' | 'fast' | 'superfast';

interface TimeState {
  // Current date
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  
  // Start date (for tracking game duration)
  startDay: number;
  startMonth: number;
  startYear: number;
  
  // Time speed settings
  timeSpeed: GameTimeSpeed;
  timeMultiplier: number; // Multiplier for time passage (1.0 = normal, 2.0 = 2x speed, etc.)
  
  // Auto-advance settings
  autoAdvanceEnabled: boolean; // Whether time automatically advances
  timeProgress: number; // Current progress towards next day (0-100)
  lastTickTime: number; // Timestamp of last tick
  pausedTimestamp: number; // Timestamp when time was paused
  accumulatedProgress: number; // Progress accumulated before pause (ms) - this helps in resuming time properly
  
  // Time passage tracking between sessions
  lastRealTimestamp: number; // Real timestamp of the last session
  wasPaused: boolean; // Whether the game was paused in the last session
  
  // Daily counter for tracking weekly/monthly updates
  dayCounter: number; // Tracks the number of days passed for weekly/biweekly updates
  
  // Advanced time tracking for events and attribute decay
  gameTime: Date; // Current game time as a Date object
  previousGameDay: number; // Previous game day for tracking day changes
  daysPassed: number; // Total days passed since game start
  
  // Convenience getter for current date as JavaScript Date object
  currentGameDate: Date;
  
  // Actions
  advanceTime: () => void;
  setDate: (day: number, month: number, year: number) => void;
  resetGameStart: () => void; // Reset start date to current date
  resetTime: () => void; // Reset all time values to real-world current date
  setTimeSpeed: (speed: GameTimeSpeed) => void; // Set the time speed
  setAutoAdvance: (enabled: boolean) => void; // Toggle auto-advance
  setTimeProgress: (progress: number) => void; // Update time progress
  updateLastTickTime: (time: number) => void; // Update last tick timestamp
  setPausedTimestamp: (time: number) => void; // Update paused timestamp
  setAccumulatedProgress: (progress: number) => void; // Update accumulated progress
  updateLastRealTimestamp: (time: number) => void; // Update last real-world timestamp
  processOfflineTime: () => void; // Process time that passed while the application was closed
}

const STORAGE_KEY = 'luxury_lifestyle_time';

// Load from local storage if available, with validation
const loadSavedTime = () => {
  try {
    const saved = getLocalStorage(STORAGE_KEY);
    
    // Only return saved time if it's valid
    if (saved && 
        saved.currentDay && 
        saved.currentMonth && 
        saved.currentYear && 
        typeof saved.currentDay === 'number' &&
        typeof saved.currentMonth === 'number' &&
        typeof saved.currentYear === 'number') {
      
      // Additional validation - check if the date makes sense
      if (saved.currentDay >= 1 && saved.currentDay <= 31 &&
          saved.currentMonth >= 1 && saved.currentMonth <= 12 &&
          saved.currentYear >= 2020 && saved.currentYear <= 2050) {
        
        console.log(`Loaded valid saved time: ${saved.currentMonth}/${saved.currentDay}/${saved.currentYear}`);
        return saved;
      } else {
        console.warn("Saved time data contains invalid date values, using current device date instead");
        return null;
      }
    }
    
    console.warn("No valid saved time data found, using current device date");
    return null;
  } catch (e) {
    console.error("Error loading saved time data:", e);
    return null;
  }
};

// Get the current real device date
// Get current device date, always returning a fresh date to ensure accuracy
const getCurrentDeviceDate = (forceRefresh: boolean = false) => {
  // Always get a fresh date to avoid stale data issues
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    year: now.getFullYear()
  };
};

// Create the store with subscription middleware
const timeStore = create<TimeState>()(
  subscribeWithSelector((set) => {
    // Try to load saved time
    const savedTime = loadSavedTime();
    
    // Get current real-world date
    const realDate = getCurrentDeviceDate();
    
    // Set initial values for day, month, year
    const initialDay = savedTime?.currentDay || realDate.day;
    const initialMonth = savedTime?.currentMonth || realDate.month;
    const initialYear = savedTime?.currentYear || realDate.year;
    
    // Create the initial Date object
    const initialGameDate = new Date(initialYear, initialMonth - 1, initialDay);
    
    // Setup a heartbeat to detect potential time freezes
    // This runs outside React to ensure time keeps ticking even if components re-render
    let lastHeartbeatTime = Date.now();
    const heartbeatInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedMs = currentTime - lastHeartbeatTime;
      
      // Check if time hasn't updated in a while (over 5 seconds) and auto-advance is on
      if (savedTime?.autoAdvanceEnabled && elapsedMs > 5000) {
        console.warn(`Time freeze detected! ${elapsedMs}ms since last heartbeat. Attempting auto-recovery...`);
        
        try {
          // Force update the last tick time to now to resume time progression
          const newState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          newState.lastTickTime = currentTime;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          console.log('Time auto-recovery: Updated lastTickTime in storage');
        } catch (err) {
          console.error('Time auto-recovery failed:', err);
        }
      }
      
      lastHeartbeatTime = currentTime;
    }, 2500);
    
    return {
      // Default state uses real device time if no saved data exists
      currentDay: initialDay,
      currentMonth: initialMonth,
      currentYear: initialYear,
      
      // Current game date as a JavaScript Date object
      currentGameDate: initialGameDate,
      
      // Start date - when game began
      startDay: savedTime?.startDay || realDate.day,
      startMonth: savedTime?.startMonth || realDate.month,
      startYear: savedTime?.startYear || realDate.year,
      
      // Time speed settings
      timeSpeed: savedTime?.timeSpeed || 'normal',
      timeMultiplier: savedTime?.timeMultiplier || 1.0,
      
      // Auto-advance settings
      autoAdvanceEnabled: savedTime?.autoAdvanceEnabled !== undefined ? savedTime.autoAdvanceEnabled : true,
      timeProgress: savedTime?.timeProgress || 0,
      lastTickTime: savedTime?.lastTickTime || Date.now(),
      pausedTimestamp: savedTime?.pausedTimestamp || 0,
      accumulatedProgress: savedTime?.accumulatedProgress || 0,
      
      // Time passage tracking between sessions
      lastRealTimestamp: savedTime?.lastRealTimestamp || Date.now(),
      wasPaused: savedTime?.wasPaused !== undefined ? savedTime.wasPaused : false,
      
      // Day counter for weekly/biweekly updates
      dayCounter: savedTime?.dayCounter || 0,
      
      // Advanced time tracking
      gameTime: initialGameDate,
      previousGameDay: savedTime?.previousGameDay || initialDay,
      daysPassed: savedTime?.daysPassed || 0,
      
      advanceTime: () => set((state) => {
        // Important: First, get the days in the current month
        // In JS Date API: new Date(year, month, 0) gives last day of previous month
        // So we pass the current month number directly to get correct days in month
        const daysInMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();
        console.log(`Days in current month ${state.currentMonth}/${state.currentYear}: ${daysInMonth}`);
        
        // Check if this is the last day of the month
        const isEndOfMonth = state.currentDay >= daysInMonth;
        
        // Initialize new date values
        let newDay, newMonth, newYear;
        
        // Detailed debug logging
        console.log(`Current date before update: ${state.currentMonth}/${state.currentDay}/${state.currentYear}`);
        
        if (isEndOfMonth) {
          // If it's the end of month, reset day to 1 and advance month
          newDay = 1; 
          newMonth = state.currentMonth + 1;
          newYear = state.currentYear;
          
          console.log(`End of month reached (${state.currentDay} >= ${daysInMonth}). Incrementing month: ${state.currentMonth} -> ${newMonth}`);
          
          // Check if we need to advance to next year
          if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
            console.log(`End of year reached. Incrementing year: ${state.currentYear} -> ${newYear}`);
          }
        } else {
          // Normal day increment within the same month
          newDay = state.currentDay + 1;
          newMonth = state.currentMonth;
          newYear = state.currentYear;
          console.log(`Normal day increment: ${state.currentDay} -> ${newDay}`);
        }
        
        // Create a new Date object for the updated date
        const newGameDate = new Date(newYear, newMonth - 1, newDay);
        
        // Increment the day counter for tracking weekly/biweekly updates
        // Simply increment the day counter (without modulo) for proper bi-weekly paycheck tracking
        const newDayCounter = state.dayCounter + 1;
        console.log(`Day counter incremented to: ${newDayCounter} (${newDayCounter % 14 === 0 ? 'PAYDAY!' : 'not payday'})`);
        
        // Track for attribute decay system
        const prevGameDay = state.currentDay;
        const daysPassed = state.daysPassed + 1;
        
        const newState = {
          ...state, // Keep other values like start date
          currentDay: newDay,
          currentMonth: newMonth,
          currentYear: newYear,
          currentGameDate: newGameDate,
          gameTime: newGameDate,
          previousGameDay: prevGameDay,
          daysPassed: daysPassed,
          dayCounter: newDayCounter
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        // Process events when the day advances - execute this outside of setState to avoid issues
        try {
          // We need to wait until after the state is updated before processing events
          setTimeout(() => {
            // Import dynamically to avoid circular dependencies
            // Use dynamic import instead of require
            import('./useSocialNetwork').then((module) => {
              const useSocialNetwork = module.useSocialNetwork;
              if (useSocialNetwork && useSocialNetwork.getState) {
                // Only show notifications in monthly summary, not during daily advancement
                const showNotifications = false;
                useSocialNetwork.getState().checkForExpiredContent?.(showNotifications);
              }
            }).catch(e => console.error("Failed to load social network module:", e));
          }, 0);
        } catch (error) {
          console.error("Error processing social network events:", error);
        }
        
        return newState;
      }),
      
      setDate: (day, month, year) => set((state) => {
        // Create a new Date object for the updated date
        const newGameDate = new Date(year, month - 1, day);
        
        const newState = {
          ...state, // Keep other values like start date
          currentDay: day,
          currentMonth: month,
          currentYear: year,
          currentGameDate: newGameDate
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      resetGameStart: () => set((state) => {
        const newState = {
          ...state,
          startDay: state.currentDay,
          startMonth: state.currentMonth,
          startYear: state.currentYear
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      resetTime: () => {
        // Always get a fresh current date - don't rely on any cached values
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
        const currentYear = now.getFullYear();
        
        console.log(`Resetting time to fresh device date: ${currentMonth}/${currentDay}/${currentYear}`);
        
        // Create a new Date object for the reset time
        const newGameDate = new Date(currentYear, currentMonth - 1, currentDay);
        
        // Create a completely fresh state with the current date
        const newState = {
          currentDay,
          currentMonth,
          currentYear,
          startDay: currentDay,
          startMonth: currentMonth,
          startYear: currentYear,
          currentGameDate: newGameDate,
          gameTime: newGameDate,
          previousGameDay: currentDay,
          daysPassed: 0,
          timeSpeed: 'normal' as GameTimeSpeed,
          timeMultiplier: 1.0,
          autoAdvanceEnabled: true,
          timeProgress: 0,
          lastTickTime: Date.now(),
          pausedTimestamp: 0,
          accumulatedProgress: 0,
          dayCounter: 0,
          lastRealTimestamp: Date.now(),
          wasPaused: false
        };
        
        // Aggressively clear localStorage entry first to ensure all previous data is gone
        try {
          localStorage.removeItem(STORAGE_KEY);
          console.log(`Successfully removed time data from localStorage at key: ${STORAGE_KEY}`);
        } catch (e) {
          console.error(`Error removing time data from localStorage: ${e}`);
        }
        
        // Save the fresh state to localStorage immediately, before the state update
        // This ensures the storage is updated even if the state update fails
        try {
          setLocalStorage(STORAGE_KEY, newState);
          console.log('Successfully saved fresh time data to localStorage');
        } catch (e) {
          console.error(`Error saving fresh time data to localStorage: ${e}`);
        }
        
        // Return the new state for the set() call
        return set(() => newState);
      },
      
      setTimeSpeed: (speed: GameTimeSpeed) => set((state) => {
        // Set multiplier based on selected speed
        let multiplier = 1.0;
        switch(speed) {
          case 'paused':
            multiplier = 0;
            break;
          case 'normal':
            multiplier = 1.0;
            break;
          case 'fast':
            multiplier = 3.0; // 3x speed
            break;
          case 'superfast':
            multiplier = 6.0; // 6x speed
            break;
          default:
            multiplier = 1.0;
        }
        
        // Set wasPaused flag for offline time processing
        // If we're setting speed to 'paused', we want wasPaused to be true
        const wasPaused = speed === 'paused';
        
        const newState = {
          ...state,
          timeSpeed: speed,
          timeMultiplier: multiplier,
          wasPaused,
          lastRealTimestamp: Date.now() // Update timestamp for offline processing
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Auto-advance control
      setAutoAdvance: (enabled: boolean) => set((state) => {
        const currentTime = Date.now();
        
        const newState = {
          ...state,
          autoAdvanceEnabled: enabled,
          lastTickTime: currentTime, // Reset the tick time when toggling
          wasPaused: !enabled, // Track pause state for offline time processing
          lastRealTimestamp: currentTime // Update the timestamp for offline processing
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Update time progress
      setTimeProgress: (progress: number) => set((state) => {
        const newState = {
          ...state,
          timeProgress: progress
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Update last tick time
      updateLastTickTime: (time: number) => set((state) => {
        const newState = {
          ...state,
          lastTickTime: time
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Update paused timestamp
      setPausedTimestamp: (time: number) => set((state) => {
        const newState = {
          ...state,
          pausedTimestamp: time
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Update accumulated progress
      setAccumulatedProgress: (progress: number) => set((state) => {
        const newState = {
          ...state,
          accumulatedProgress: progress
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Update the last real-world timestamp
      updateLastRealTimestamp: (time: number) => set((state) => {
        const newState = {
          ...state,
          lastRealTimestamp: time
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Set the paused state for offline time processing
      setWasPaused: (isPaused: boolean) => set((state) => {
        const newState = {
          ...state,
          wasPaused: isPaused
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Process time that passed while the application was closed
      processOfflineTime: () => set((state): TimeState => {
        try {
          console.log("Beginning offline time processing...");
          
          // CRITICAL FIX: Clear any navigation flags that could cause redirection to create page
          // When resuming the game from offline, these flags should be cleared to prevent unwanted redirects
          if (typeof window !== 'undefined' && window.sessionStorage) {
            // Check for session flags that could cause redirection
            if (sessionStorage.getItem('smooth_navigation') === 'true') {
              console.log("⚠️ Removing smooth_navigation flag to prevent character reset");
              sessionStorage.removeItem('smooth_navigation');
            }
            
            // Also check for these flags that could affect character persistence
            if (sessionStorage.getItem('force_current_date') === 'true') {
              console.log("⚠️ Removing force_current_date flag during offline processing");
              sessionStorage.removeItem('force_current_date');
            }
            
            if (sessionStorage.getItem('block_time_loads') === 'true') {
              console.log("⚠️ Removing block_time_loads flag during offline processing");
              sessionStorage.removeItem('block_time_loads');
            }
          }
          
          const currentTime = Date.now();
          const { lastRealTimestamp, wasPaused, timeMultiplier } = state;
          
          // Skip if it's the first load (lastRealTimestamp is 0)
          if (lastRealTimestamp === 0) {
            console.log(`Skipping offline processing: First load detected`);
            // Update the timestamp without processing time
            return {
              ...state,
              lastRealTimestamp: currentTime
            };
          }
          
          // For paused games, log but still continue processing
          // This allows offline time to advance even if the game was paused
          if (wasPaused) {
            console.log(`Game was paused, but still processing offline time to ensure progression`);
            // We won't return here, but continue with processing
          }
          
          // Calculate how much real time has passed since the last session
          const realMsPassed = currentTime - lastRealTimestamp;
          
          // If less than 5 seconds passed, don't bother processing
          if (realMsPassed < 5000) {
            console.log(`Skipping offline processing: Only ${realMsPassed}ms passed (less than threshold)`);
            return {
              ...state,
              lastRealTimestamp: currentTime
            };
          }
          
          // Record the starting game date for offline income calculations
          const startingGameDate = new Date(state.currentYear, state.currentMonth - 1, state.currentDay);
          
          console.log(`Processing offline time: ${realMsPassed}ms real time passed since last session`);
          console.log(`Current state - Day: ${state.currentDay}, Month: ${state.currentMonth}, Year: ${state.currentYear}`);
          console.log(`Time multiplier: ${timeMultiplier || 1.0}`);
          
          // 1 real-world second = 1 in-game hour = 1/24 of a day
          // Apply time multiplier (default setting) for offline progression
          const adjustedMs = realMsPassed * (timeMultiplier || 1.0);
          const hoursElapsed = adjustedMs / 1000;
          const daysElapsed = hoursElapsed / 24;
          
          console.log(`Converting to ${daysElapsed.toFixed(2)} in-game days elapsed during offline time`);
          
          // Process full days
          const fullDaysToProcess = Math.floor(daysElapsed);
          console.log(`Full days to process: ${fullDaysToProcess}`);
          
          let currentDay = state.currentDay;
          let currentMonth = state.currentMonth;
          let currentYear = state.currentYear;
          let dayCounter = state.dayCounter;
          let daysPassed = state.daysPassed;
          
          // Process each day one by one to ensure proper month/year transitions
          for (let i = 0; i < fullDaysToProcess; i++) {
            // Advance the date
            currentDay++;
            dayCounter++;  // Increment the day counter without modulo (for bi-weekly paycheck tracking)
            daysPassed++;
            
            // Check if we need to advance the month
            const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
            if (currentDay > daysInMonth) {
              currentDay = 1;
              currentMonth++;
              
              // Check if we need to advance the year
              if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
              }
            }
            
            console.log(`Processing day ${i+1}/${fullDaysToProcess}: ${currentMonth}/${currentDay}/${currentYear} (counter: ${dayCounter})`);
            
            try {
              // Process daily income from properties and other passive sources
              console.log(`Step 1: Attempting to load useCharacter store...`);
              
              // Get character store from registry to avoid circular dependencies
              console.log(`Step 2: Attempting to get character store from registry...`);
              const characterStore = getStore('character');
              
              if (!characterStore) {
                console.error('Character store not found in registry');
                
                // Fallback to direct import if registry fails
                try {
                  const directCharacterStore = (require('./useCharacter').default);
                  console.log(`Successfully loaded character store via direct import as fallback: ${!!directCharacterStore}`);
                  
                  if (!directCharacterStore || typeof directCharacterStore.getState !== 'function') {
                    console.error('Character store from direct import is invalid');
                    continue;
                  }
                  
                  const characterState = directCharacterStore.getState();
                  if (!characterState) {
                    console.error('Character state from direct import is null');
                    continue;
                  }
                  
                  console.log(`Successfully got character state via fallback: ${!!characterState}`);
                  
                  // Continue with the fallback characterState
                } catch (fallbackError) {
                  console.error('Fallback to direct import failed:', fallbackError);
                  continue; // Skip to next day if we can't load the character store
                }
              }
              
              console.log(`Step 3: Attempting to get character state from registry...`);
              let characterState;
              try {
                characterState = characterStore.getState();
                console.log(`Successfully got character state from registry: ${!!characterState}`);
              } catch (getStateError) {
                console.error('Error getting character state from registry:', getStateError);
                continue;
              }
              
              if (!characterState) {
                console.error('Character state is undefined');
                continue;
              }
              
              console.log(`Step 3: Checking if character state has processDailyUpdate function...`);
              if (typeof characterState.processDailyUpdate === 'function') {
                console.log(`Step 4: Setting current day in character state context...`);
                try {
                  // Set current day in state context
                  characterStore.setState({
                    currentDay,
                    currentMonth,
                    currentYear
                  });
                  console.log(`Successfully updated character state with current date`);
                } catch (setStateError) {
                  console.error('Error setting character state with current date:', setStateError);
                  continue;
                }
                
                console.log(`Step 5: Calling processDailyUpdate function...`);
                try {
                  // Pass the current dayCounter so paycheck calculations work correctly
                  characterState.processDailyUpdate(dayCounter);
                  console.log(`Successfully processed update for offline day ${i+1}/${fullDaysToProcess} (day counter: ${dayCounter})`);
                } catch (processDailyError) {
                  console.error(`Error in processDailyUpdate call for day ${i+1}/${fullDaysToProcess}:`, processDailyError);
                  continue;
                }
              } else {
                console.error('processDailyUpdate is not a function on character state:', characterState);
              }
              
              // Check for weekly updates (every 7 days)
              if (dayCounter % 7 === 0) {
                console.log(`Weekly update check for day counter: ${dayCounter}`);
                try {
                  // Get economy store from registry
                  console.log(`Weekly update: Attempting to get economy store from registry...`);
                  const economyStore = getStore('economy');
                  
                  if (!economyStore) {
                    console.warn('Economy store not found in registry for weekly update');
                    
                    // Fallback to direct import
                    try {
                      console.log('Attempting fallback to direct import for economy store (weekly update)');
                      const directEconomyStore = (require('./useEconomy').default);
                      
                      if (directEconomyStore && typeof directEconomyStore.getState === 'function') {
                        const economyState = directEconomyStore.getState();
                        if (typeof economyState.processWeeklyUpdate === 'function') {
                          economyState.processWeeklyUpdate();
                          console.log(`Processed weekly update during offline time via fallback for day counter: ${dayCounter}`);
                        } else {
                          console.warn('processWeeklyUpdate is not a function on economy state from direct import');
                        }
                      } else {
                        console.warn('Direct economy store import failed for weekly update');
                      }
                    } catch (fallbackError) {
                      console.error('Fallback to direct import failed for weekly update:', fallbackError);
                    }
                    
                    // Continue with other logic if we're not in a nested function
                    // Since we're within a try/catch block in a for loop, continue to next item
                  }
                  
                  // Use the store from registry
                  const economyState = economyStore.getState();
                  if (typeof economyState.processWeeklyUpdate === 'function') {
                    economyState.processWeeklyUpdate();
                    console.log(`Processed weekly update during offline time from registry for day counter: ${dayCounter}`);
                  } else {
                    console.warn('processWeeklyUpdate is not a function on economy state from registry');
                  }
                } catch (weeklyError) {
                  console.error('Error processing offline weekly update:', weeklyError);
                }
              }
              
              // Check for end of month for monthly updates
              // We construct the date object for the current day and then check if the next day would be in a new month
              const currentDate = new Date(currentYear, currentMonth - 1, currentDay);
              const nextDate = new Date(currentYear, currentMonth - 1, currentDay + 1);
              const isEndOfMonth = nextDate.getMonth() !== currentDate.getMonth();
              
              if (isEndOfMonth) {
                console.log(`End of month detected: ${currentMonth}/${currentYear}`);
                try {
                  // Process monthly economy update
                  console.log(`Monthly update: Attempting to get economy store from registry...`);
                  const economyStore = getStore('economy');
                  
                  if (!economyStore) {
                    console.warn('Economy store not found in registry for monthly update');
                    
                    // Fallback to direct import
                    try {
                      console.log('Attempting fallback to direct import for economy store (monthly update)');
                      const directEconomyStore = (require('./useEconomy').default);
                      
                      if (directEconomyStore && typeof directEconomyStore.getState === 'function') {
                        const economyState = directEconomyStore.getState();
                        if (typeof economyState.processMonthlyUpdate === 'function') {
                          economyState.processMonthlyUpdate();
                          console.log(`Processed monthly economy update during offline time via fallback for: ${currentMonth}/${currentYear}`);
                        } else {
                          console.warn('processMonthlyUpdate is not a function on economy state from direct import');
                        }
                      } else {
                        console.warn('Direct economy store import failed for monthly update');
                      }
                    } catch (fallbackError) {
                      console.error('Fallback to direct import failed for monthly update:', fallbackError);
                    }
                  } else {
                    // Use the store from registry
                    const economyState = economyStore.getState();
                    if (typeof economyState.processMonthlyUpdate === 'function') {
                      economyState.processMonthlyUpdate();
                      console.log(`Processed monthly economy update during offline time from registry for: ${currentMonth}/${currentYear}`);
                    } else {
                      console.warn('processMonthlyUpdate is not a function on economy state from registry');
                    }
                  }
                  
                  // Process monthly character expenses (housing, subscriptions, etc.)
                  console.log(`Attempting monthly character expenses update...`);
                  if (characterState && typeof characterState.monthlyUpdate === 'function') {
                    characterState.monthlyUpdate();
                    console.log(`Processed monthly character expenses during offline time for: ${currentMonth}/${currentYear}`);
                  } else {
                    console.warn('monthlyUpdate is not a function on character state or character state is unavailable');
                  }
                } catch (monthlyError) {
                  console.error('Error processing offline monthly update:', monthlyError);
                }
              }
            } catch (dayProcessingError) {
              console.error(`Error processing offline character updates for day ${i+1}/${fullDaysToProcess}:`, dayProcessingError);
              if (dayProcessingError instanceof Error) {
                console.error('Error stack:', dayProcessingError.stack);
              }
            }
          }
          
          // Calculate the fractional part of the day for progress percentage
          const fractionalDay = daysElapsed - fullDaysToProcess;
          const newProgress = fractionalDay * 100;
          
          // Create the new game date
          const newGameDate = new Date(currentYear, currentMonth - 1, currentDay);
          
          // Process comprehensive passive income tracking
          if (fullDaysToProcess > 0) {
            try {
              // Process the offline income with the dates and days passed
              console.log(`Processing offline income for ${fullDaysToProcess} days (from ${startingGameDate.toLocaleDateString()} to ${newGameDate.toLocaleDateString()})`);
              processOfflineIncome(startingGameDate, newGameDate, fullDaysToProcess);
              
              console.log(`Offline income processing completed successfully`);
            } catch (incomeProcessingError) {
              console.error('Error processing offline income:', incomeProcessingError);
              if (incomeProcessingError instanceof Error) {
                console.error('Error stack:', incomeProcessingError.stack);
              }
            }
          }
          
          // The new state with updated time values
          const newState = {
            ...state,
            currentDay,
            currentMonth,
            currentYear,
            currentGameDate: newGameDate,
            gameTime: newGameDate,
            previousGameDay: state.currentDay,
            dayCounter,
            daysPassed,
            timeProgress: newProgress,
            lastRealTimestamp: currentTime,
            lastTickTime: currentTime // Reset the tick time for smooth continuation
          };
          
          // Save to local storage
          setLocalStorage(STORAGE_KEY, newState);
          
          console.log("Offline time processing completed successfully");
          return newState;
        } catch (error) {
          console.error("Fatal error in processOfflineTime:", error);
          if (error instanceof Error) {
            console.error("Error stack:", error.stack);
          }
          
          // On fatal error, just update the timestamp and return current state
          return {
            ...state,
            lastRealTimestamp: Date.now()
          };
        }
      })
    };
  })
);

// Register the time store in the global registry for cross-module access
// This enables other modules to access the time store without circular dependencies
registerStore('time', timeStore);

// Log when the time store is registered successfully
console.log('✅ Time Store: Registered in global store registry');

// Export the time store for use in components
export const useTime = timeStore;
