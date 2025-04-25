import { useEffect, useState } from 'react';
import { useTime } from '../lib/stores/useTime';

/**
 * Custom hook that provides real-time challenge progress updates
 * This hook centralizes the logic for time-based challenge progress tracking
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
  // Get the current game time from the store
  const currentGameDate = useTime(state => state.currentGameDate);
  const dayCounter = useTime(state => state.dayCounter);
  const timeSpeed = useTime(state => state.timeSpeed);
  
  // State to store calculated progress values
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [monthsRemaining, setMonthsRemaining] = useState(0);
  
  // We'll no longer force an update every second since it causes excessive rerenders
  // and can lead to maximum update depth exceeded errors
  // Instead, we'll rely on the natural game time updates to trigger progress updates
  
  // Calculate progress whenever relevant data changes
  useEffect(() => {
    // Guard clauses for invalid input
    if (!currentGameDate || !startDate) {
      setProgress(0);
      setIsFinished(false);
      setDaysRemaining(completionTimeMonths * 30);
      setMonthsRemaining(completionTimeMonths);
      return;
    }
    
    try {
      // Ensure we have a valid Date object for the start date
      const validStartDate = startDate instanceof Date 
        ? startDate 
        : new Date(startDate);
      
      // Calculate days and months passed
      const msDiff = currentGameDate.getTime() - validStartDate.getTime();
      const daysPassed = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      const monthsPassed = Math.floor(daysPassed / 30);
      
      // Calculate remaining time
      const daysRemaining = Math.max(0, (completionTimeMonths * 30) - daysPassed);
      const monthsRemaining = Math.max(0, completionTimeMonths - monthsPassed);
      
      // Calculate progress percentage (0-100) based on days instead of months
      // This provides a more granular progress that updates daily
      const totalDaysRequired = completionTimeMonths * 30;
      const progressValue = Math.min(100, Math.max(0, (daysPassed / totalDaysRequired) * 100));
      
      // Debug the calculation
      console.log(`Challenge timer calculation:`, {
        start: validStartDate.toISOString(),
        current: currentGameDate.toISOString(),
        daysPassed,
        totalDaysRequired,
        daysRemaining,
        progressValue: progressValue.toFixed(1) + '%'
      });
      
      // Update state with the new values
      setProgress(progressValue);
      setIsFinished(progressValue >= 100);
      setDaysRemaining(daysRemaining);
      setMonthsRemaining(monthsRemaining);
    } catch (error) {
      console.error('Error in challenge timer calculation:', error);
      // Set default values in case of error
      setProgress(0);
      setIsFinished(false);
      setDaysRemaining(completionTimeMonths * 30);
      setMonthsRemaining(completionTimeMonths);
    }
  // Removing timeSpeed from dependencies to prevent excessive re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGameDate, startDate, completionTimeMonths, dayCounter]);
  
  return { progress, isFinished, daysRemaining, monthsRemaining };
}