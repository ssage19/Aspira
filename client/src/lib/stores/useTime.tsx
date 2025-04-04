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
  
  // Actions
  advanceTime: () => void;
  setDate: (day: number, month: number, year: number) => void;
  resetGameStart: () => void; // Reset start date to current date
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

export const useTime = create<TimeState>()(
  subscribeWithSelector((set) => {
    // Try to load saved time
    const savedTime = loadSavedTime();
    
    // Default current date
    const defaultDay = 1;
    const defaultMonth = 1;
    const defaultYear = 2023;
    
    return {
      // Default state - will be overwritten if saved data exists
      currentDay: savedTime?.currentDay || defaultDay,
      currentMonth: savedTime?.currentMonth || defaultMonth,
      currentYear: savedTime?.currentYear || defaultYear,
      
      // Start date - when game began
      startDay: savedTime?.startDay || defaultDay,
      startMonth: savedTime?.startMonth || defaultMonth,
      startYear: savedTime?.startYear || defaultYear,
      
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
        
        const newState = {
          ...state, // Keep other values like start date
          currentDay: newDay,
          currentMonth: newMonth,
          currentYear: newYear
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      setDate: (day, month, year) => set((state) => {
        const newState = {
          ...state, // Keep other values like start date
          currentDay: day,
          currentMonth: month,
          currentYear: year
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
      })
    };
  })
);
