import { useEffect } from 'react';
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
    checkChallengeProgress, 
    failChallenge,
    consecutiveCompletions
  } = useChallenges();
  
  // Track daily progress
  useEffect(() => {
    if (!currentGameDate) return;
    
    // Check all active challenges
    checkChallengeProgress();
    
    // Check for time-based challenge failures
    activeChallenges.forEach(challenge => {
      if (challenge.targetDate && challenge.targetDate < currentGameDate) {
        // Challenge has passed its target date
        failChallenge(challenge.id);
      }
    });
  }, [currentGameDate, checkChallengeProgress, activeChallenges, failChallenge]);
  
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