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
  
  // Check for date changes to regenerate social capital and create events weekly
  useEffect(() => {
    // If we've changed to a new day, regenerate social capital
    // This provides a daily amount of social capital for the player
    regenerateSocialCapital();
    
    // Check if it's the start of a new week (Monday)
    const currentDate = new Date(currentYear, currentMonth - 1, currentDay);
    const isMonday = currentDate.getDay() === 1; // 0 is Sunday, 1 is Monday
    
    if (isMonday) {
      // Generate events weekly instead of daily, capped at 2 events
      const eventCount = Math.floor(Math.random() * 2) + 1; // 1-2 events per week
      generateNewEvents(eventCount);
      
      // 50% chance to get a new connection each week, capped at 1
      const shouldGenerateConnection = Math.random() < 0.5;
      if (shouldGenerateConnection) {
        // Add a single random connection (capped at 1 per week)
        // This uses our new addRandomConnections function
        useSocialNetwork.getState().addRandomConnections(1);
      }
    }
  }, [currentDay, currentMonth, currentYear, regenerateSocialCapital, generateNewEvents]);
  
  // This is a background component that doesn't render anything
  return null;
}