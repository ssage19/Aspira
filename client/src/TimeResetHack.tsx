import { useEffect } from 'react';

/**
 * This component is a direct hack to force a time reset when loaded
 * It bypasses all standard mechanisms and directly overwrites time data
 */
const TimeResetHack: React.FC = () => {
  useEffect(() => {
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
      // First, clear all storage to be safe
      localStorage.clear();
      sessionStorage.clear();
      
      // Then overwrite with fresh time state
      localStorage.setItem('luxury_lifestyle_time', JSON.stringify(freshTimeState));
      
      // Verify
      const check = localStorage.getItem('luxury_lifestyle_time');
      if (check) {
        const parsed = JSON.parse(check);
        console.log(`⚠️ TimeResetHack: Verified date in storage: ${parsed.currentMonth}/${parsed.currentDay}/${parsed.currentYear}`);
        
        // Set a flag that Dashboard can check to force a reload if needed
        sessionStorage.setItem('time_reset_performed', 'true');
        
        // If we're on the Dashboard page, force reload to pick up the new time
        if (window.location.pathname === '/') {
          console.log('⚠️ TimeResetHack: On Dashboard page, forcing reload to apply new time');
          window.location.reload();
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