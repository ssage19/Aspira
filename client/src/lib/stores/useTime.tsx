import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

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
  
  // Daily counter for tracking weekly/monthly updates
  dayCounter: number; // Tracks the number of days passed for weekly/biweekly updates
  
  // Convenience getter for current date as JavaScript Date object
  currentGameDate: Date;
  
  // Running state
  isRunning: boolean;
  
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
  toggleTimeRunning: () => void; // Toggle whether time is running
  startTime: () => void; // Start the game time
  pauseTime: () => void; // Pause the game time
}

const STORAGE_KEY = 'luxury_lifestyle_time';

// Load from local storage if available
const loadSavedTime = () => {
  const saved = getLocalStorage(STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
};

// Get the current real device date
const getCurrentDeviceDate = () => {
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    year: now.getFullYear()
  };
};

export const useTime = create<TimeState>()(
  subscribeWithSelector((set, get) => {
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
      
      // Game is not running by default
      isRunning: savedTime?.isRunning !== undefined ? savedTime.isRunning : false,
      
      // Day counter for weekly/biweekly updates
      dayCounter: savedTime?.dayCounter || 0,
      
      advanceTime: () => set((state) => {
        let newDay = state.currentDay + 1;
        let newMonth = state.currentMonth;
        let newYear = state.currentYear;
        
        // Determine days in current month
        const daysInMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();
        
        // Check if we need to advance to next month
        if (newDay > daysInMonth) {
          newDay = 1;
          newMonth += 1;
          
          // Check if we need to advance to next year
          if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
          }
        }
        
        // Create a new Date object for the updated date
        const newGameDate = new Date(newYear, newMonth - 1, newDay);
        
        // Increment the day counter for tracking weekly/biweekly updates
        // With new time scale, 14 days (2 weeks) will pass every 5 minutes of real time
        const newDayCounter = (state.dayCounter + 1) % 14;
        
        const newState = {
          ...state, // Keep other values like start date
          currentDay: newDay,
          currentMonth: newMonth,
          currentYear: newYear,
          currentGameDate: newGameDate,
          dayCounter: newDayCounter
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
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
      
      resetTime: () => set(() => {
        // Get current real-world date
        const realDate = getCurrentDeviceDate();
        
        // Create a new Date object for the reset time
        const newGameDate = new Date(realDate.year, realDate.month - 1, realDate.day);
        
        const newState = {
          currentDay: realDate.day,
          currentMonth: realDate.month,
          currentYear: realDate.year,
          startDay: realDate.day,
          startMonth: realDate.month,
          startYear: realDate.year,
          currentGameDate: newGameDate,
          timeSpeed: 'normal' as GameTimeSpeed,
          timeMultiplier: 1.0,
          autoAdvanceEnabled: true,
          timeProgress: 0,
          lastTickTime: Date.now(),
          pausedTimestamp: 0,
          accumulatedProgress: 0,
          dayCounter: 0,
          isRunning: true
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
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
        
        const newState = {
          ...state,
          timeSpeed: speed,
          timeMultiplier: multiplier
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Auto-advance control
      setAutoAdvance: (enabled: boolean) => set((state) => {
        const newState = {
          ...state,
          autoAdvanceEnabled: enabled,
          lastTickTime: Date.now() // Reset the tick time when toggling
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
      
      // Toggle time running state
      toggleTimeRunning: () => set((state) => {
        const newIsRunning = !state.isRunning;
        
        const newState = {
          ...state,
          isRunning: newIsRunning,
          autoAdvanceEnabled: newIsRunning,
          lastTickTime: Date.now() // Reset the tick time when toggling
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Start game time
      startTime: () => set((state) => {
        const newState = {
          ...state,
          isRunning: true,
          autoAdvanceEnabled: true,
          lastTickTime: Date.now()
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      // Pause game time
      pauseTime: () => set((state) => {
        const newState = {
          ...state,
          isRunning: false,
          autoAdvanceEnabled: false,
          pausedTimestamp: Date.now()
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      })
    };
  })
);
