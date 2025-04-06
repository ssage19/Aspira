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
      dayCounter: 0
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
        
        // Set a flag that Dashboard can check to show correct date
        sessionStorage.setItem('time_reset_performed', 'true');
        
        // No longer forcing a reload - this was causing the flashing issue
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