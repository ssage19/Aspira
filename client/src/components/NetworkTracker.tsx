import { useEffect } from 'react';
import { useSocialNetwork } from '../lib/stores/useSocialNetwork';
import { useTime } from '../lib/stores/useTime';

/**
 * A background component that tracks and updates the social networking system.
 * This component handles:
 * - Checking for expired events and benefits
 * - Regenerating social capital over time
 * - Triggering random networking opportunities
 * 
 * It does not render anything to the DOM.
 */
export function NetworkTracker() {
  const { 
    checkForExpiredContent, 
    generateNewEvents,
    connections,
    events
  } = useSocialNetwork();
  
  const { currentGameDate, lastDateChange } = useTime();
  
  // Check for expired content whenever the game date changes
  useEffect(() => {
    if (lastDateChange) {
      // Check for expired events and benefits
      checkForExpiredContent();
      
      // Regenerate social capital
      const socialNetwork = useSocialNetwork.getState();
      socialNetwork.regenerateSocialCapital();
      
      // Chance to generate new events (once per week on average)
      const dayOfWeek = new Date(currentGameDate || Date.now()).getDay();
      if (dayOfWeek === 1 || Math.random() < 0.15) { // Monday or 15% chance any other day
        const existingEventCount = events.length;
        if (existingEventCount < 5) {
          generateNewEvents(Math.max(1, 5 - existingEventCount));
        }
      }
      
      // Chance for random connections to reach out (once per two weeks on average)
      if (Math.random() < 0.07 && connections.length > 0) { // 7% chance each day
        // Randomly select a connection to reach out
        const randomIndex = Math.floor(Math.random() * connections.length);
        const connection = connections[randomIndex];
        
        if (connection && !connection.pendingMeeting) {
          // Schedule a "they reached out" meeting
          const updatedConnections = [...connections];
          updatedConnections[randomIndex] = {
            ...connection,
            pendingMeeting: true
          };
          
          // Update the state
          useSocialNetwork.setState({ connections: updatedConnections });
          
          // Show notification (would implement with a notification system)
          console.log(`${connection.name} has reached out to you for a meeting!`);
        }
      }
    }
  }, [lastDateChange, checkForExpiredContent, generateNewEvents, connections, events, currentGameDate]);
  
  // Initial check when component mounts
  useEffect(() => {
    checkForExpiredContent();
  }, [checkForExpiredContent]);
  
  // This component doesn't render anything
  return null;
}