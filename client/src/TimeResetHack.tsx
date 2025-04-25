import { useEffect } from 'react';

/**
 * This component is a direct hack to force a time reset when loaded
 * It bypasses all standard mechanisms and directly overwrites time data
 * 
 * IMPORTANT: Only runs ONCE per session to avoid reload loops
 * 
 * CRITICAL FIX: This component has been modified to check if an existing character
 * is available before performing any time resets or redirections
 */
const TimeResetHack: React.FC = () => {
  useEffect(() => {
    // CRITICAL FIX: First check if there's a character in storage
    // If there is, we should be careful about resetting time to avoid data loss
    const hasCharacter = localStorage.getItem('business-empire-character');
    
    // Special case: If we just performed a complete game reset, we need to ensure
    // the correct date is being used
    const forceCurrentDate = sessionStorage.getItem('force_current_date') === 'true';
    const blockTimeLoads = sessionStorage.getItem('block_time_loads') === 'true';
    
    if (forceCurrentDate || blockTimeLoads) {
      console.log('⚠️ TimeResetHack: Force current date flag detected, ensuring we use today\'s date');
      // Remove these flags to prevent them from triggering asset resets in other components
      sessionStorage.removeItem('force_current_date');
      sessionStorage.removeItem('block_time_loads');
      
      // Clear any reset flags that might be present
      if (sessionStorage.getItem('game_reset_in_progress') === 'true') {
        console.log('⚠️ TimeResetHack: Clearing game_reset_in_progress flag');
        sessionStorage.removeItem('game_reset_in_progress');
      }
      
      // CRITICAL FIX: Clear smooth_navigation flag as well to prevent unwanted redirects
      if (sessionStorage.getItem('smooth_navigation') === 'true') {
        console.log('⚠️ TimeResetHack: Clearing smooth_navigation flag');
        sessionStorage.removeItem('smooth_navigation');
      }
      
      // If we have a character, only update time if absolutely necessary
      if (hasCharacter) {
        console.log('⚠️ TimeResetHack: Character data exists, preserving character data');
        
        // Mark as processed to prevent further execution
        sessionStorage.setItem('time_reset_already_run', 'true');
        
        // We're only clearing the flags but not forcing a time update since a character exists
        return;  
      }
      
      // Force the use of today's date (only for new characters)
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      console.log(`⚠️ TimeResetHack: Forcing date to today: ${currentMonth}/${currentDay}/${currentYear}`);
      
      // Create a fresh time state with today's date
      const freshTimeState = {
        currentDay,
        currentMonth,
        currentYear,
        startDay: currentDay,
        startMonth: currentMonth,
        startYear: currentYear,
        currentGameDate: now.toISOString(),
        timeSpeed: 'normal',
        timeMultiplier: 1.0,
        autoAdvanceEnabled: true,
        timeProgress: 0,
        lastTickTime: Date.now(),
        pausedTimestamp: 0,
        accumulatedProgress: 0,
        dayCounter: 0,
        _manuallyReset: true,
        _resetTimestamp: Date.now(),
        _source: "TimeResetHack_ForceCurrentDate"
      };
      
      // Write directly to localStorage
      localStorage.setItem('luxury_lifestyle_time', JSON.stringify(freshTimeState));
      
      // Set flag that this has been done
      sessionStorage.setItem('time_reset_already_run', 'true');
      sessionStorage.setItem('time_just_reset', 'true');
      sessionStorage.setItem('time_reset_timestamp', Date.now().toString());
      
      // Verify it worked
      const check = localStorage.getItem('luxury_lifestyle_time');
      if (check) {
        const parsed = JSON.parse(check);
        console.log(`⚠️ TimeResetHack: Verified date in storage: ${parsed.currentMonth}/${parsed.currentDay}/${parsed.currentYear}`);
      }
      
      return;
    }
    
    // Normal case: Check if we've already run the hack this session to prevent reload loops
    if (sessionStorage.getItem('time_reset_already_run') === 'true') {
      console.log('⚠️ TimeResetHack: Already run this session, skipping');
      return;
    }
    
    // Check if a time reset was recently performed by another component
    const timeJustReset = sessionStorage.getItem('time_just_reset') === 'true';
    const resetTimestamp = parseInt(sessionStorage.getItem('time_reset_timestamp') || '0');
    const isRecentReset = Date.now() - resetTimestamp < 10000; // Within 10 seconds
    
    if (timeJustReset && isRecentReset) {
      console.log('⚠️ TimeResetHack: Time was already reset recently, skipping duplicate reset');
      // Still mark as run to prevent future executions
      sessionStorage.setItem('time_reset_already_run', 'true');
      return;
    }
    
    // Mark as run to prevent future executions
    sessionStorage.setItem('time_reset_already_run', 'true');
    
    // Clear any reset flags that might be present
    if (sessionStorage.getItem('game_reset_in_progress') === 'true') {
      console.log('⚠️ TimeResetHack: Clearing game_reset_in_progress flag');
      sessionStorage.removeItem('game_reset_in_progress');
    }
    
    // Also clear force_current_date flag if it exists (to be extra safe)
    if (sessionStorage.getItem('force_current_date') === 'true') {
      console.log('⚠️ TimeResetHack: Clearing force_current_date flag');
      sessionStorage.removeItem('force_current_date');
    }
    
    // Get the current real date
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();
    
    // Check if there's already time data in localStorage
    const existingTimeData = localStorage.getItem('luxury_lifestyle_time');
    if (existingTimeData) {
      try {
        const parsedTime = JSON.parse(existingTimeData);
        const storedDate = new Date(parsedTime.currentYear, parsedTime.currentMonth - 1, parsedTime.currentDay);
        const realDate = new Date();
        const diffTime = Math.abs(storedDate.getTime() - realDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Only reset if difference is more than 30 days or if date is clearly wrong
        if (diffDays <= 30 && parsedTime.currentYear >= 2023 && parsedTime.currentMonth >= 1 && parsedTime.currentMonth <= 12) {
          console.log(`⚠️ TimeResetHack: Found reasonable date in storage (${diffDays} days difference), not resetting`);
          return;
        }
        
        console.log(`⚠️ TimeResetHack: Found stored date with ${diffDays} days difference, proceeding with reset`);
      } catch (e) {
        console.error('⚠️ TimeResetHack: Error parsing existing time data:', e);
      }
    }
    
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
      currentGameDate: now.toISOString(),
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