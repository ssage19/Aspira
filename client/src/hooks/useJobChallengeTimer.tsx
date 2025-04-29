import { useEffect, useState, useRef, useMemo } from 'react';
import { useTime } from '../lib/stores/useTime';

/**
 * Custom hook that provides real-time challenge progress updates
 * This hook centralizes the logic for time-based challenge progress tracking
 * Optimized with refs to reduce re-renders and prevent update loops
 */
export function useJobChallengeTimer(
  startDate: Date | string | undefined,
  completionTimeMonths: number
): { 
  progress: number;  // 0-100 percentage complete
  isFinished: boolean;
  daysRemaining: number;
  monthsRemaining: number;
} {
  // Use refs to track time state without causing re-renders
  const currentGameDateRef = useRef<Date | null>(null);
  
  // We'll set up a proper subscription in useEffect instead of using direct selectors here
  // This prevents issues with hooks being called conditionally or in loops
  
  // Pass an empty dependency to get a stable reference
  const timeStore = useMemo(() => useTime, []);
  
  // State to store calculated progress values - only used for return values
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [monthsRemaining, setMonthsRemaining] = useState(0);
  
  // Track previous calculation to avoid unnecessary updates
  const prevCalcRef = useRef({
    daysPassed: 0,
    progressValue: 0,
    lastUpdateTime: 0
  });
  
  // Validate start date once to avoid recalculation
  const validStartDate = useMemo(() => {
    if (!startDate) return null;
    
    try {
      return startDate instanceof Date ? startDate : new Date(startDate);
    } catch (error) {
      console.error('Invalid start date:', error);
      return null;
    }
  }, [startDate]);
  
  // Set up the time subscription
  useEffect(() => {
    // Get initial values
    currentGameDateRef.current = timeStore.getState().currentGameDate;
    
    // Subscribe to time changes
    const unsubscribe = timeStore.subscribe(
      (state) => state.currentGameDate,
      (newDate) => {
        currentGameDateRef.current = newDate;
      }
    );
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [timeStore]);
  
  // Track day counter changes for dependency
  const dayCounterRef = useRef(0);
  
  // Subscribe to day counter changes
  useEffect(() => {
    // Get initial day counter
    dayCounterRef.current = timeStore.getState().dayCounter;
    
    // Subscribe to day counter changes
    const unsubscribe = timeStore.subscribe(
      (state) => state.dayCounter,
      (newCounter) => {
        dayCounterRef.current = newCounter;
      }
    );
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [timeStore]);
  
  // Calculate progress on a controlled schedule
  useEffect(() => {
    const calculateProgress = () => {
      // Guard clauses for invalid input
      if (!currentGameDateRef.current || !validStartDate) {
        setProgress(0);
        setIsFinished(false);
        setDaysRemaining(completionTimeMonths * 30);
        setMonthsRemaining(completionTimeMonths);
        return;
      }
      
      try {
        const now = Date.now();
        // Don't calculate more often than every 3 seconds
        if (now - prevCalcRef.current.lastUpdateTime < 3000) return;
        
        // Calculate days and months passed
        const msDiff = currentGameDateRef.current.getTime() - validStartDate.getTime();
        const daysPassed = Math.floor(msDiff / (1000 * 60 * 60 * 24));
        
        // Only update if days have changed
        if (daysPassed === prevCalcRef.current.daysPassed) return;
        
        // Track this update
        prevCalcRef.current.lastUpdateTime = now;
        prevCalcRef.current.daysPassed = daysPassed;
        
        const monthsPassed = Math.floor(daysPassed / 30);
        
        // Calculate remaining time
        const daysRemaining = Math.max(0, (completionTimeMonths * 30) - daysPassed);
        const monthsRemaining = Math.max(0, completionTimeMonths - monthsPassed);
        
        // Calculate progress percentage based on days
        const totalDaysRequired = completionTimeMonths * 30;
        const progressValue = Math.min(100, Math.max(0, (daysPassed / totalDaysRequired) * 100));
        
        // Only update if progress has changed meaningfully (0.5% or more)
        if (Math.abs(progressValue - prevCalcRef.current.progressValue) >= 0.5) {
          prevCalcRef.current.progressValue = progressValue;
          
          // Less frequent logging to prevent console spam
          if (daysPassed % 10 === 0) {
            console.log(`Challenge timer update:`, {
              daysPassed,
              daysRemaining,
              progressValue: progressValue.toFixed(1) + '%'
            });
          }
          
          // Update state values for the return object
          setProgress(progressValue);
          setIsFinished(progressValue >= 100);
          setDaysRemaining(daysRemaining);
          setMonthsRemaining(monthsRemaining);
        }
      } catch (error) {
        console.error('Error in challenge timer calculation:', error);
        // Set default values in case of error
        setProgress(0);
        setIsFinished(false);
        setDaysRemaining(completionTimeMonths * 30);
        setMonthsRemaining(completionTimeMonths);
      }
    };
    
    // Run initial calculation
    calculateProgress();
    
    // Set up interval for periodic updates
    const intervalId = setInterval(calculateProgress, 5000);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [validStartDate, completionTimeMonths, dayCounter]);
  
  return { progress, isFinished, daysRemaining, monthsRemaining };
}