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
    // If we've changed to a new day, regenerate social capital
    // This provides a daily amount of social capital for the player
    regenerateSocialCapital();
    
    // Check if it's the first day of a new month
    const isFirstDayOfMonth = currentDay === 1;
    
    if (isFirstDayOfMonth) {
      // Generate events monthly instead of weekly, capped at 2 events
      const eventCount = Math.floor(Math.random() * 2) + 1; // 1-2 events per month
      generateNewEvents(eventCount);
      
      // 70% chance to get a new connection each month, capped at 1
      // Increased chance from 50% to 70% since it's now monthly instead of weekly
      const shouldGenerateConnection = Math.random() < 0.7;
      if (shouldGenerateConnection) {
        // Add a single random connection (capped at 1 per month)
        useSocialNetwork.getState().addRandomConnections(1);
      }
    }
  }, [currentDay, currentMonth, currentYear, regenerateSocialCapital, generateNewEvents]);
  
  // This is a background component that doesn't render anything
  return null;
}