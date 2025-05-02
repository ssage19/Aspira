import React, { useEffect } from 'react';
import { useSocialNetwork } from '../lib/stores/useSocialNetwork';
import { useTime } from '../lib/stores/useTime';

/**
 * A background component that tracks and manages the social networking state
 * over time. This includes regenerating social capital daily, generating new
 * random events, and other time-based operations.
 * 
 * This component does not render anything visible.
 */
export function NetworkTracker() {
  const {
    socialCapital,
    regenerateSocialCapital,
    generateNewEvents,
    events,
    connections
  } = useSocialNetwork();
  
  const { currentDay, currentMonth, currentYear } = useTime();
  
  // Check for date changes to regenerate social capital and create events monthly
  useEffect(() => {
    // Check if it's the first day of a new month
    const isFirstDayOfMonth = currentDay === 1;
    
    if (isFirstDayOfMonth) {
      // Monthly social capital regeneration with 25 base points (no networking level bonus)
      regenerateSocialCapital(true); // Pass true for monthly boost
      
      // Generate events monthly, capped at 2 events
      const eventCount = Math.floor(Math.random() * 2) + 1; // 1-2 events per month
      generateNewEvents(eventCount);
      
      // No longer automatically adding connections - player must find them on their own
    }
    
    // Run the standard regeneration check - this will handle the time-based regeneration
    // independent of the new monthly boost
    regenerateSocialCapital();
  }, [currentDay, currentMonth, currentYear, regenerateSocialCapital, generateNewEvents]);
  
  // This is a background component that doesn't render anything
  return null;
}