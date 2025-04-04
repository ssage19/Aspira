import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

interface TimeState {
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  
  // Actions
  advanceTime: () => void;
  setDate: (day: number, month: number, year: number) => void;
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
    
    return {
      // Default state - will be overwritten if saved data exists
      currentDay: savedTime?.currentDay || 1,
      currentMonth: savedTime?.currentMonth || 1,
      currentYear: savedTime?.currentYear || 2023,
      
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
          currentDay: newDay,
          currentMonth: newMonth,
          currentYear: newYear
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      }),
      
      setDate: (day, month, year) => set(() => {
        const newState = {
          currentDay: day,
          currentMonth: month,
          currentYear: year
        };
        
        // Save to local storage
        setLocalStorage(STORAGE_KEY, newState);
        
        return newState;
      })
    };
  })
);
