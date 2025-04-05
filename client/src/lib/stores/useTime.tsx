import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

interface TimeState {
  // Current date
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  
  // Start date (for tracking game duration)
  startDay: number;
  startMonth: number;
  startYear: number;
  
  // Convenience getter for current date as JavaScript Date object
  currentGameDate: Date;
  
  // Actions
  advanceTime: () => void;
  setDate: (day: number, month: number, year: number) => void;
  resetGameStart: () => void; // Reset start date to current date
  resetTime: () => void; // Reset all time values to real-world current date
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
        
        const newState = {
          ...state, // Keep other values like start date
          currentDay: newDay,
          currentMonth: newMonth,
          currentYear: newYear,
          currentGameDate: newGameDate
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
          currentGameDate: newGameDate
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      })
    };
  })
);
