import { useEffect, useRef } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useChallenges } from '../lib/stores/useChallenges';

/**
 * A background component that tracks challenge progress.
 * This component does not render anything to the DOM.
 */
export function ChallengeTracker() {
  const { currentGameDate } = useTime();
  const { 
    activeChallenges, 
    completedChallenges,
    consecutiveCompletions
  } = useChallenges();
  
  // Use refs to prevent dependency loops
  const activeChallengesRef = useRef(activeChallenges);
  const hasRunInitialCheck = useRef(false);
  
  // Update refs when values change
  useEffect(() => {
    activeChallengesRef.current = activeChallenges;
  }, [activeChallenges]);
  
  // Track daily progress - but access the store functions directly
  // to prevent React update loops
  useEffect(() => {
    if (!currentGameDate) return;
    
    // Prevent running on first render or during initialization
    if (!hasRunInitialCheck.current) {
      hasRunInitialCheck.current = true;
      return;
    }
    
    // Use a timeout to avoid potential infinite update loops
    const timeoutId = setTimeout(() => {
      try {
        // Get functions directly from the store
        const challengesStore = useChallenges.getState();
        
        // Check all active challenges
        challengesStore.checkChallengeProgress();
        
        // Check for time-based challenge failures or completions
        const currentChallenges = activeChallengesRef.current;
        currentChallenges.forEach(challenge => {
          // Handle time-limited challenges that have expired
          if (challenge.targetDate && challenge.targetDate < currentGameDate) {
            // Challenge has passed its target date
            challengesStore.failChallenge(challenge.id);
          }
          
          // Check for challenges at 100% that should be completed
          if (challenge.progress >= challenge.targetValue) {
            console.log(`ChallengeTracker: Challenge ${challenge.id} has reached 100% progress (${challenge.progress}/${challenge.targetValue})`);
            challengesStore.completeChallenge(challenge.id);
          }
        });
      } catch (err) {
        console.error("Error in challenge tracker:", err);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentGameDate]);
  
  // Check for consecutive completion bonuses
  useEffect(() => {
    if (consecutiveCompletions % 5 === 0 && consecutiveCompletions > 0) {
      // Every 5 consecutive completions, grant a small bonus
      useCharacter.getState().addHappiness(5);
    }
  }, [consecutiveCompletions]);
  
  // Check for level-based achievement unlocks
  useEffect(() => {
    if (completedChallenges.length >= 10) {
      // This would ideally trigger an achievement
      console.log('Challenge Master achievement would be unlocked here');
    }
  }, [completedChallenges]);
  
  return null;
}