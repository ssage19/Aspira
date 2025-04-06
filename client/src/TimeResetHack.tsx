import { useEffect } from 'react';

/**
 * This component is a direct hack to force a time reset when loaded
 * It bypasses all standard mechanisms and directly overwrites time data
 * 
 * IMPORTANT: Only runs ONCE per session to avoid reload loops
 */
const TimeResetHack: React.FC = () => {
  useEffect(() => {
    // Check if we've already run the hack this session to prevent reload loops
    if (sessionStorage.getItem('time_reset_already_run') === 'true') {
      console.log('⚠️ TimeResetHack: Already run this session, skipping');
      return;
    }
    
    // Check if a time reset was recently performed by the App component
    const timeJustReset = sessionStorage.getItem('time_just_reset') === 'true';
    const resetTimestamp = parseInt(sessionStorage.getItem('time_reset_timestamp') || '0');
    const isRecentReset = Date.now() - resetTimestamp < 10000; // Within 10 seconds
    
    if (timeJustReset && isRecentReset) {
      console.log('⚠️ TimeResetHack: Time was already reset recently by App.tsx, skipping duplicate reset');
      // Still mark as run to prevent future executions
      sessionStorage.setItem('time_reset_already_run', 'true');
      return;
    }
    
    // Mark as run to prevent future executions
    sessionStorage.setItem('time_reset_already_run', 'true');
    
    // Get the current real date
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();
    
    console.log('⚠️ TimeResetHack: Emergency time reset in progress');
    console.log(`⚠️ TimeResetHack: Setting date to: ${currentMonth}/${currentDay}/${currentYear}`);
    
    // Create a fresh time state
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
      _manuallyReset: true,
      _resetTimestamp: Date.now(),
      _source: "TimeResetHack"
    };
    
    // DIRECT INTERVENTION: Write to localStorage without using any utility functions
    try {
      // Do NOT clear all localStorage - this was causing issues
      // Only update the time key
      localStorage.setItem('luxury_lifestyle_time', JSON.stringify(freshTimeState));
      
      // Verify
      const check = localStorage.getItem('luxury_lifestyle_time');
      if (check) {
        const parsed = JSON.parse(check);
        console.log(`⚠️ TimeResetHack: Verified date in storage: ${parsed.currentMonth}/${parsed.currentDay}/${parsed.currentYear}`);
        
        // Set flags that other components can check to know time was reset
        sessionStorage.setItem('time_reset_performed', 'true');
        sessionStorage.setItem('time_just_reset', 'true');
        sessionStorage.setItem('time_reset_timestamp', Date.now().toString());
        
        // Double-check if real date and saved date match
        try {
          const savedDate = new Date(parsed.currentYear, parsed.currentMonth - 1, parsed.currentDay);
          const realDate = new Date();
          const diffTime = Math.abs(savedDate.getTime() - realDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Only consider it a problem if the difference is greater than 30 days
          // This ensures we respect the game's internal timeline
          if (diffDays > 30) {
            console.error(`⚠️ TimeResetHack: Major date difference of ${diffDays} days detected even after reset!`);
          } else {
            console.log(`⚠️ TimeResetHack: Date verification complete - difference is ${diffDays} days (acceptable)`);
          }
        } catch (e) {
          console.error('⚠️ TimeResetHack: Error checking date difference:', e);
        }
      } else {
        console.error('⚠️ TimeResetHack: Failed to verify time data after writing');
      }
    } catch (e) {
      console.error('⚠️ TimeResetHack: Error during emergency reset:', e);
    }
  }, []);
  
  return null;
};

export default TimeResetHack;