import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCharacter } from './useCharacter';
import { useAssetTracker } from './useAssetTracker';
import { useGame } from './useGame';
import { useTime } from './useTime';
import { toast } from 'sonner';

export type ChallengeCategory = 
  | 'wealth' 
  | 'investment' 
  | 'career' 
  | 'skills' 
  | 'lifestyle'
  | 'special';

export type DifficultyLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert' 
  | 'master';

export type ChallengeRewardType = 
  | 'cash' 
  | 'skill_points' 
  | 'prestige' 
  | 'happiness'
  | 'item_unlock';

export interface ChallengeReward {
  type: ChallengeRewardType;
  value: number;
  description: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: DifficultyLevel;
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  startDate?: Date;
  endDate?: Date;
  targetDate?: Date;
  progress: number;
  targetValue: number;
  reward: ChallengeReward;
  rewardClaimed?: boolean;
  timeLimit?: number; // in days
  dynamicDescription?: (progress: number, target: number) => string;
  checkCondition: () => boolean; // Function to check if challenge is completed
  getProgressValue: () => number; // Function to calculate current progress
}

export interface DurationProgress {
  [challengeId: string]: {
    startDate: string;
    currentStreak: number;
    lastCheckedDate: string;
    daysWithConditionMet: number;
    meetingCondition: boolean;
  }
}

interface ChallengesState {
  availableChallenges: Challenge[];
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  failedChallenges: Challenge[];
  
  // Track duration progress for challenges
  durationProgress: DurationProgress;
  
  // Stats
  totalCompleted: number;
  totalFailed: number;
  consecutiveCompletions: number;
  
  // Challenge management
  startChallenge: (id: string) => void;
  completeChallenge: (id: string) => void;
  failChallenge: (id: string) => void;
  abandonChallenge: (id: string) => void;
  checkChallengeProgress: () => void;
  
  // Reward handling
  claimReward: (id: string) => void;
  
  // Challenge generation
  generateNewChallenges: () => void;
  
  // Difficulty adjustment
  adjustDifficulty: (playerStats: any) => void;
}

const useChallengesStore = create<ChallengesState>()(
  persist(
    (set, get) => ({
      availableChallenges: [],
      activeChallenges: [],
      completedChallenges: [],
      failedChallenges: [],
      
      // Initialize the duration progress tracking
      durationProgress: {},
      
      totalCompleted: 0,
      totalFailed: 0,
      consecutiveCompletions: 0,
      
      startChallenge: (id) => {
        const challenge = get().availableChallenges.find(c => c.id === id);
        if (!challenge) return;
        
        const currentDate = useTime.getState().currentGameDate;
        
        // Get current progress value by calling the function directly
        // We can't call methods on the challenge object after spreading it
        let currentProgress = 0;
        try {
          // Safely try to get the current progress
          currentProgress = challenge.getProgressValue();
        } catch (err) {
          console.error("Error getting progress value:", err);
          // Fall back to 0 progress if there's an error
          currentProgress = 0;
        }
        
        const updatedChallenge = {
          ...challenge,
          isActive: true,
          progress: currentProgress,  // Initialize with current progress
          startDate: currentDate,
          targetDate: challenge.timeLimit 
            ? new Date(currentDate.getTime() + challenge.timeLimit * 24 * 60 * 60 * 1000)
            : undefined
        };
        
        // For duration-based challenges, initialize tracking
        let durationProgressUpdate = {};
        if (challenge.id === 'invest-2' || challenge.id === 'lifestyle-1') {
          durationProgressUpdate = {
            [challenge.id]: {
              startDate: currentDate.toISOString(),
              currentStreak: 0,
              lastCheckedDate: currentDate.toISOString(),
              daysWithConditionMet: 0,
              meetingCondition: false
            }
          };
        }
        
        set(state => ({
          availableChallenges: state.availableChallenges.filter(c => c.id !== id),
          activeChallenges: [...state.activeChallenges, updatedChallenge],
          durationProgress: {
            ...state.durationProgress,
            ...durationProgressUpdate
          }
        }));
      },
      
      completeChallenge: (id) => {
        const challenge = get().activeChallenges.find(c => c.id === id);
        if (!challenge) return;
        
        const currentDate = useTime.getState().currentGameDate;
        const updatedChallenge = {
          ...challenge,
          isActive: false,
          isCompleted: true,
          endDate: currentDate
        };
        
        // Check if this is a duration challenge
        const isDurationChallenge = id === 'invest-2' || id === 'lifestyle-1';
        
        set(state => {
          // Create updated state object
          const updatedState: Partial<ChallengesState> = {
            activeChallenges: state.activeChallenges.filter(c => c.id !== id),
            completedChallenges: [...state.completedChallenges, updatedChallenge],
            totalCompleted: state.totalCompleted + 1,
            consecutiveCompletions: state.consecutiveCompletions + 1
          };
          
          // If it's a duration challenge, remove the tracking data
          if (isDurationChallenge) {
            const { [id]: _, ...remainingDurationProgress } = state.durationProgress;
            updatedState.durationProgress = remainingDurationProgress;
          }
          
          return updatedState;
        });
      },
      
      failChallenge: (id) => {
        const challenge = get().activeChallenges.find(c => c.id === id);
        if (!challenge) return;
        
        const currentDate = useTime.getState().currentGameDate;
        const updatedChallenge = {
          ...challenge,
          isActive: false,
          isFailed: true,
          endDate: currentDate
        };
        
        // Check if this is a duration challenge
        const isDurationChallenge = id === 'invest-2' || id === 'lifestyle-1';
        
        set(state => {
          // Create updated state object
          const updatedState: Partial<ChallengesState> = {
            activeChallenges: state.activeChallenges.filter(c => c.id !== id),
            failedChallenges: [...state.failedChallenges, updatedChallenge],
            totalFailed: state.totalFailed + 1,
            consecutiveCompletions: 0
          };
          
          // If it's a duration challenge, remove the tracking data
          if (isDurationChallenge) {
            const { [id]: _, ...remainingDurationProgress } = state.durationProgress;
            updatedState.durationProgress = remainingDurationProgress;
          }
          
          return updatedState;
        });
      },
      
      abandonChallenge: (id) => {
        const challenge = get().activeChallenges.find(c => c.id === id);
        if (!challenge) return;
        
        // Put the challenge back in the available pool
        const resetChallenge = {
          ...challenge,
          isActive: false,
          progress: 0,
          startDate: undefined,
          targetDate: undefined
        };
        
        // Check if this is a duration challenge
        const isDurationChallenge = id === 'invest-2' || id === 'lifestyle-1';
        
        set(state => {
          // Create updated state object
          const updatedState: Partial<ChallengesState> = {
            activeChallenges: state.activeChallenges.filter(c => c.id !== id),
            availableChallenges: [...state.availableChallenges, resetChallenge],
            consecutiveCompletions: 0
          };
          
          // If it's a duration challenge, remove the tracking data
          if (isDurationChallenge) {
            const { [id]: _, ...remainingDurationProgress } = state.durationProgress;
            updatedState.durationProgress = remainingDurationProgress;
          }
          
          return updatedState;
        });
      },
      
      checkChallengeProgress: () => {
        const { activeChallenges, durationProgress } = get();
        const currentDate = useTime.getState().currentGameDate;
        const characterState = useCharacter.getState();
        const assetTrackerState = useAssetTracker.getState();
        
        // Use arrays to collect changes before applying them all at once
        const challengesToComplete: string[] = [];
        const challengesToFail: string[] = [];
        const challengesToUpdate: {id: string, progress: number}[] = [];
        
        // Track updates to duration progress
        const durationProgressUpdates: DurationProgress = {};
        
        // Process each active challenge
        for (const challenge of activeChallenges) {
          // Check if time-limited challenge has expired
          if (challenge.targetDate && currentDate > challenge.targetDate) {
            challengesToFail.push(challenge.id);
            continue;
          }
          
          // Get current progress based on challenge ID without calling methods
          let currentProgress = 0;
          let conditionMet = false;
          
          try {
            // We need to re-evaluate the challenge conditions directly
            // since the function references are lost when challenges are stored
            switch(challenge.id) {
              // Wealth challenges
              case 'wealth-1':
                currentProgress = Math.min(characterState.wealth, 10000);
                conditionMet = characterState.wealth >= 10000;
                break;
              case 'wealth-2':
                currentProgress = Math.min(characterState.wealth, 50000);
                conditionMet = characterState.wealth >= 50000;
                break;
              case 'wealth-3':
                currentProgress = Math.min(characterState.netWorth, 100000);
                conditionMet = characterState.netWorth >= 100000;
                break;
              
              // Investment challenges
              case 'invest-1':
                currentProgress = Math.min(assetTrackerState.stocks.length, 5);
                conditionMet = assetTrackerState.stocks.length >= 5;
                break;
              case 'invest-2': {
                // Stock hold duration challenge
                const hasStocks = assetTrackerState.stocks.length > 0;
                const durationData = durationProgress[challenge.id];
                
                if (!durationData) {
                  // Shouldn't happen, but initialize if missing
                  conditionMet = false;
                  currentProgress = 0;
                  break;
                }
                
                // Get duration data
                const lastCheckedDate = new Date(durationData.lastCheckedDate);
                const today = new Date(currentDate);
                
                // Only process once per game day
                if (lastCheckedDate.toDateString() === today.toDateString()) {
                  currentProgress = durationData.daysWithConditionMet;
                  conditionMet = currentProgress >= challenge.targetValue;
                  break;
                }
                
                const dayDiff = Math.floor((today.getTime() - lastCheckedDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // Check if the condition is still being met (having stocks)
                if (hasStocks) {
                  const newDaysWithCondition = durationData.daysWithConditionMet + dayDiff;
                  currentProgress = newDaysWithCondition;
                  conditionMet = newDaysWithCondition >= challenge.targetValue;
                  
                  durationProgressUpdates[challenge.id] = {
                    ...durationData,
                    lastCheckedDate: today.toISOString(),
                    daysWithConditionMet: newDaysWithCondition,
                    meetingCondition: true
                  };
                } else {
                  // Reset the streak if they sold all stocks
                  currentProgress = 0;
                  conditionMet = false;
                  
                  durationProgressUpdates[challenge.id] = {
                    ...durationData,
                    lastCheckedDate: today.toISOString(),
                    daysWithConditionMet: 0,
                    meetingCondition: false
                  };
                }
                break;
              }
              
              // Career challenges
              case 'career-1':
                currentProgress = characterState.job ? 1 : 0;
                conditionMet = characterState.job !== null;
                break;
              case 'career-2':
                currentProgress = Math.min(characterState.jobHistory.length, 1);
                conditionMet = characterState.jobHistory.length > 1;
                break;
              
              // Skill challenges
              case 'skills-1':
                currentProgress = Math.min(characterState.skills.technical, 500);
                conditionMet = characterState.skills.technical >= 500;
                break;
              case 'skills-2':
                currentProgress = Math.min(characterState.skills.leadership, 500);
                conditionMet = characterState.skills.leadership >= 500;
                break;
              
              // Lifestyle challenges
              case 'lifestyle-1': {
                // Health tracking challenge
                const healthThreshold = 80; // 80% health
                const isHealthy = characterState.health >= healthThreshold;
                const durationData = durationProgress[challenge.id];
                
                if (!durationData) {
                  // Shouldn't happen, but initialize if missing
                  conditionMet = false;
                  currentProgress = 0;
                  break;
                }
                
                // Get duration data
                const lastCheckedDate = new Date(durationData.lastCheckedDate);
                const today = new Date(currentDate);
                
                // Only process once per game day
                if (lastCheckedDate.toDateString() === today.toDateString()) {
                  currentProgress = durationData.daysWithConditionMet;
                  conditionMet = currentProgress >= challenge.targetValue;
                  break;
                }
                
                const dayDiff = Math.floor((today.getTime() - lastCheckedDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // Check if the condition is still being met (health above threshold)
                if (isHealthy) {
                  const newDaysWithCondition = durationData.daysWithConditionMet + dayDiff;
                  currentProgress = newDaysWithCondition;
                  conditionMet = newDaysWithCondition >= challenge.targetValue;
                  
                  durationProgressUpdates[challenge.id] = {
                    ...durationData,
                    lastCheckedDate: today.toISOString(),
                    daysWithConditionMet: newDaysWithCondition,
                    meetingCondition: true
                  };
                } else {
                  // Reset the streak if health drops below threshold
                  currentProgress = 0;
                  conditionMet = false;
                  
                  durationProgressUpdates[challenge.id] = {
                    ...durationData,
                    lastCheckedDate: today.toISOString(),
                    daysWithConditionMet: 0,
                    meetingCondition: false
                  };
                }
                break;
              }
              
              // Special challenges
              case 'special-1':
                currentProgress = Math.min(characterState.income, 10000);
                conditionMet = characterState.income >= 10000;
                break;
              
              default:
                // For any challenges not explicitly handled
                console.warn(`No progress handler for challenge ID: ${challenge.id}`);
                currentProgress = challenge.progress; // Keep the current progress
                conditionMet = false;
            }
          } catch (err) {
            console.error("Error calculating challenge progress:", err);
            currentProgress = challenge.progress; // Keep the current progress
            conditionMet = false;
          }
          
          // Check if challenge is completed - either if condition is met and progress has increased 
          // OR if progress reaches 100% of the target value
          if ((conditionMet && currentProgress > challenge.progress) || 
              (currentProgress >= challenge.targetValue)) {
            console.log(`Challenge ${challenge.id} completed: conditionMet=${conditionMet}, progress=${currentProgress}/${challenge.targetValue}`);
            challengesToComplete.push(challenge.id);
            continue;
          }
          
          // If we need to update progress, add to our update list
          if (currentProgress !== challenge.progress) {
            challengesToUpdate.push({
              id: challenge.id,
              progress: currentProgress
            });
          }
        }
        
        // Now process all changes in batches to avoid nested state updates
        
        // First, fail any expired challenges
        challengesToFail.forEach(id => {
          get().failChallenge(id);
        });
        
        // Then complete any finished challenges
        challengesToComplete.forEach(id => {
          get().completeChallenge(id);
        });
        
        // Update duration progress tracking
        if (Object.keys(durationProgressUpdates).length > 0) {
          set(state => ({
            durationProgress: {
              ...state.durationProgress,
              ...durationProgressUpdates
            }
          }));
        }
        
        // Finally, update progress for remaining challenges
        if (challengesToUpdate.length > 0) {
          set(state => {
            // Create a new array of active challenges with updated progress
            const updatedActiveChallenges = state.activeChallenges.map(challenge => {
              const update = challengesToUpdate.find(u => u.id === challenge.id);
              if (update) {
                return { ...challenge, progress: update.progress };
              }
              return challenge;
            });
            
            return {
              activeChallenges: updatedActiveChallenges
            };
          });
        }
      },
      
      claimReward: (id) => {
        const challenge = get().completedChallenges.find(c => c.id === id);
        if (!challenge) return;
        
        // Apply the reward based on type
        const { reward } = challenge;
        const character = useCharacter.getState();
        
        let rewardMessage = '';
        
        switch (reward.type) {
          case 'cash':
            console.log(`Challenge will award $${reward.value} in cash`);
            // Ensure reward.value is a valid number
            const cashAmount = typeof reward.value === 'number' && !isNaN(reward.value) ? reward.value : 0;
            console.log(`Validated cash reward amount: $${cashAmount}`);
            
            // Add wealth to the character
            character.addWealth(cashAmount);
            console.log(`Added $${cashAmount} to character's wealth. New wealth: ${character.wealth}`);
            
            // Trigger asset refresh to update UI values
            const assetTracker = useAssetTracker.getState();
            console.log('Triggering asset refresh after cash reward');
            assetTracker.recalculateTotals();
            console.log(`Asset refresh complete. New total: ${assetTracker.cash}`);
            
            // Update the assetTracker cash directly
            useAssetTracker.setState({ cash: character.wealth });
            
            rewardMessage = `$${cashAmount.toLocaleString()} added to your account!`;
            break;
          case 'skill_points':
            // Actually award the skill points to the character
            character.awardSkillPoints(reward.value);
            console.log(`Challenge awarded ${reward.value} skill points`);
            rewardMessage = `${reward.value} skill points awarded!`;
            break;
          case 'prestige':
            character.addPrestige(reward.value);
            rewardMessage = `+${reward.value} Prestige gained!`;
            break;
          case 'happiness':
            character.addHappiness(reward.value);
            rewardMessage = `+${reward.value} Happiness gained!`;
            break;
          case 'item_unlock':
            // Handle special item unlocks based on challenge ID
            console.log(`Challenge ${challenge.id} unlocked a premium feature!`);
            rewardMessage = 'Special feature unlocked!';
            break;
        }
        
        // Show success toast
        toast.success('Challenge Reward Claimed!', {
          description: rewardMessage,
          position: 'top-center',
          duration: 3000
        });
        
        // Mark reward as claimed
        set(state => ({
          completedChallenges: state.completedChallenges.map(c => 
            c.id === id ? { ...c, rewardClaimed: true } : c
          )
        }));
      },
      
      generateNewChallenges: () => {
        // Use our enhanced challenge generation with filtering
        // This provides more varied challenges and avoids repeating completed ones
        console.log("Generating new challenges with enhanced system");
        
        // Generate a fresh set of challenges
        const newChallenges = generateChallenges();
        
        // Update available challenges with the newly generated ones
        set(state => ({
          availableChallenges: newChallenges
        }));
        
        console.log(`Generated ${newChallenges.length} challenges for player`);
      },
      
      adjustDifficulty: (playerStats) => {
        // This will adjust challenge difficulty based on player stats
        // The dynamic difficulty system will be implemented later
        
        // For now, we just regenerate challenges
        get().generateNewChallenges();
      },
    }),
    {
      name: 'business-empire-challenges'
    }
  )
);

// Generate initial challenges
function generateChallenges(): Challenge[] {
  const characterState = useCharacter.getState();
  const assetTrackerState = useAssetTracker.getState();
  
  // Create a comprehensive list of all possible challenges
  const allChallenges: Challenge[] = [
    // --- WEALTH CHALLENGES ---
    {
      id: 'wealth-1',
      title: 'First $10,000',
      description: 'Accumulate $10,000 in cash',
      category: 'wealth',
      difficulty: 'beginner',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 10000,
      reward: {
        type: 'cash',
        value: 1000,
        description: '$1,000 cash bonus'
      },
      checkCondition: () => characterState.wealth >= 10000,
      getProgressValue: () => Math.min(characterState.wealth, 10000)
    },
    {
      id: 'wealth-2',
      title: 'First $50,000',
      description: 'Accumulate $50,000 in cash',
      category: 'wealth',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 50000,
      reward: {
        type: 'cash',
        value: 5000,
        description: '$5,000 cash bonus'
      },
      checkCondition: () => characterState.wealth >= 50000,
      getProgressValue: () => Math.min(characterState.wealth, 50000)
    },
    {
      id: 'wealth-3',
      title: 'First $100,000 Net Worth',
      description: 'Reach $100,000 in total net worth',
      category: 'wealth',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 100000,
      reward: {
        type: 'cash',
        value: 10000,
        description: '$10,000 cash bonus'
      },
      checkCondition: () => characterState.netWorth >= 100000,
      getProgressValue: () => Math.min(characterState.netWorth, 100000)
    },
    
    // --- INVESTMENT CHALLENGES ---
    {
      id: 'invest-1',
      title: 'Diversification Beginner',
      description: 'Own 5 different stocks',
      category: 'investment',
      difficulty: 'beginner',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 5,
      reward: {
        type: 'cash',
        value: 2000,
        description: '$2,000 cash bonus'
      },
      checkCondition: () => assetTrackerState.stocks.length >= 5,
      getProgressValue: () => Math.min(assetTrackerState.stocks.length, 5)
    },
    {
      id: 'invest-2',
      title: '30-Day Stock Hold',
      description: 'Hold any stock for 30 days without selling',
      category: 'investment',
      difficulty: 'beginner',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 30,
      timeLimit: 45, // Give them 45 days to complete the 30-day hold
      reward: {
        type: 'cash',
        value: 3000,
        description: '$3,000 cash bonus'
      },
      // Using our new duration tracking system
      checkCondition: () => {
        if (!assetTrackerState.stocks.length) return false;
        
        // Duration challenges are checked by the checkChallengeProgress function
        // which manages the durationProgress state
        const { durationProgress } = useChallengesStore.getState();
        const durationData = durationProgress['invest-2'];
        return durationData?.daysWithConditionMet >= 30;
      },
      getProgressValue: () => {
        // Get progress from duration tracker if available
        const { durationProgress } = useChallengesStore.getState();
        const durationData = durationProgress['invest-2'];
        return durationData?.daysWithConditionMet || 0;
      }
    },
    
    // --- CAREER CHALLENGES ---
    {
      id: 'career-1',
      title: 'Job Hunter',
      description: 'Get hired for your first job',
      category: 'career',
      difficulty: 'beginner',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 1,
      reward: {
        type: 'skill_points',
        value: 50,
        description: '50 skill points'
      },
      checkCondition: () => characterState.job !== null,
      getProgressValue: () => characterState.job ? 1 : 0
    },
    {
      id: 'career-2',
      title: 'Career Advancement',
      description: 'Get promoted to a higher position',
      category: 'career',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 1,
      reward: {
        type: 'prestige',
        value: 25,
        description: '+25 Prestige'
      },
      // This would need to track job history changes
      checkCondition: () => characterState.jobHistory.length > 1,
      getProgressValue: () => Math.min(characterState.jobHistory.length, 1)
    },
    
    // --- SKILLS CHALLENGES ---
    {
      id: 'skills-1',
      title: 'Technical Expert',
      description: 'Reach 500 Technical skill points',
      category: 'skills',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 500,
      reward: {
        type: 'skill_points',
        value: 100,
        description: '100 skill points to allocate'
      },
      checkCondition: () => characterState.skills.technical >= 500,
      getProgressValue: () => Math.min(characterState.skills.technical, 500)
    },
    {
      id: 'skills-2',
      title: 'Leadership Training',
      description: 'Reach 500 Leadership skill points',
      category: 'skills',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 500,
      reward: {
        type: 'skill_points',
        value: 100,
        description: '100 skill points to allocate'
      },
      checkCondition: () => characterState.skills.leadership >= 500,
      getProgressValue: () => Math.min(characterState.skills.leadership, 500)
    },
    
    // --- LIFESTYLE CHALLENGES ---
    {
      id: 'lifestyle-1',
      title: 'Healthy Living',
      description: 'Maintain health above 80% for 10 days',
      category: 'lifestyle',
      difficulty: 'beginner',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 10,
      timeLimit: 15, // 15 days to complete
      reward: {
        type: 'happiness',
        value: 20,
        description: '+20 Happiness'
      },
      // Using our new duration tracking system
      checkCondition: () => {
        const healthThreshold = 80; // 80% health
        if (characterState.health < healthThreshold) return false;
        
        // Duration challenges are checked by the checkChallengeProgress function
        // which manages the durationProgress state
        const { durationProgress } = useChallengesStore.getState();
        const durationData = durationProgress['lifestyle-1'];
        return durationData?.daysWithConditionMet >= 10;
      },
      getProgressValue: () => {
        // Get progress from duration tracker if available
        const { durationProgress } = useChallengesStore.getState();
        const durationData = durationProgress['lifestyle-1'];
        return durationData?.daysWithConditionMet || 0;
      }
    },
    
    // --- SPECIAL CHALLENGES ---
    {
      id: 'special-1',
      title: 'Financial Milestone',
      description: 'Reach $10,000 monthly income',
      category: 'special',
      difficulty: 'advanced',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 10000,
      reward: {
        type: 'item_unlock',
        value: 1,
        description: 'Unlock premium investment opportunities'
      },
      checkCondition: () => characterState.income >= 10000,
      getProgressValue: () => Math.min(characterState.income, 10000)
    }
  ];
  
  // Now let's add more advanced challenges
  const advancedChallenges: Challenge[] = [
    // --- MORE WEALTH CHALLENGES ---
    {
      id: 'wealth-4',
      title: 'Millionaire',
      description: 'Reach $1,000,000 in net worth',
      category: 'wealth',
      difficulty: 'advanced',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 1000000,
      reward: {
        type: 'cash',
        value: 50000,
        description: '$50,000 cash bonus'
      },
      checkCondition: () => characterState.netWorth >= 1000000,
      getProgressValue: () => Math.min(characterState.netWorth, 1000000)
    },
    {
      id: 'wealth-5',
      title: 'Cash Flow Master',
      description: 'Generate $20,000 in passive income monthly',
      category: 'wealth',
      difficulty: 'expert',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 20000,
      reward: {
        type: 'skill_points',
        value: 250,
        description: '250 skill points'
      },
      // Calculate total passive income from properties
      checkCondition: () => {
        const propertyIncome = characterState.properties.reduce((total, property) => {
          return total + (property.income - property.expenses - (property.monthlyPayment || 0));
        }, 0);
        
        return propertyIncome >= 20000;
      },
      getProgressValue: () => {
        const propertyIncome = characterState.properties.reduce((total, property) => {
          return total + (property.income - property.expenses - (property.monthlyPayment || 0));
        }, 0);
        
        return Math.min(propertyIncome, 20000);
      }
    },
    
    // --- MORE INVESTMENT CHALLENGES ---
    {
      id: 'invest-3',
      title: 'Diversified Portfolio',
      description: 'Own assets in all investment categories (stocks, bonds, crypto, property)',
      category: 'investment',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 4, // 4 different asset types
      reward: {
        type: 'cash',
        value: 15000,
        description: '$15,000 cash bonus'
      },
      checkCondition: () => {
        // Check all 4 investment types
        const hasStocks = assetTrackerState.stocks.length > 0;
        const hasBonds = assetTrackerState.bonds.length > 0;
        const hasCrypto = assetTrackerState.cryptoAssets.length > 0;
        const hasProperties = characterState.properties.length > 0;
        
        // Count how many types the player has
        let count = 0;
        if (hasStocks) count++;
        if (hasBonds) count++;
        if (hasCrypto) count++;
        if (hasProperties) count++;
        
        return count >= 4; 
      },
      getProgressValue: () => {
        // Count investment types owned
        let count = 0;
        if (assetTrackerState.stocks.length > 0) count++;
        if (assetTrackerState.bonds.length > 0) count++;
        if (assetTrackerState.cryptoAssets.length > 0) count++;
        if (characterState.properties.length > 0) count++;
        
        return count;
      }
    },
    {
      id: 'invest-4',
      title: 'Property Mogul',
      description: 'Own 3 different properties',
      category: 'investment',
      difficulty: 'advanced',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 3,
      reward: {
        type: 'prestige',
        value: 25,
        description: '+25 Prestige'
      },
      checkCondition: () => characterState.properties.length >= 3,
      getProgressValue: () => Math.min(characterState.properties.length, 3)
    },
    
    // --- MORE CAREER CHALLENGES ---
    {
      id: 'career-3',
      title: 'Executive Material',
      description: 'Reach an executive-level position',
      category: 'career',
      difficulty: 'advanced',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 1,
      reward: {
        type: 'prestige',
        value: 30,
        description: '+30 Prestige'
      },
      checkCondition: () => characterState.job?.jobLevel === 'executive',
      getProgressValue: () => characterState.job?.jobLevel === 'executive' ? 1 : 0
    },
    {
      id: 'career-4',
      title: 'Six-Figure Salary',
      description: 'Earn a salary of $100,000 or more',
      category: 'career',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 100000,
      reward: {
        type: 'cash',
        value: 10000,
        description: '$10,000 cash bonus'
      },
      checkCondition: () => (characterState.job?.salary || 0) >= 100000,
      getProgressValue: () => Math.min(characterState.job?.salary || 0, 100000)
    },
    
    // --- MORE SKILL CHALLENGES ---
    {
      id: 'skills-3',
      title: 'Creative Mind',
      description: 'Reach 500 points in Creativity skills',
      category: 'skills',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 500,
      reward: {
        type: 'skill_points',
        value: 100,
        description: '100 skill points'
      },
      checkCondition: () => characterState.skills.creativity >= 500,
      getProgressValue: () => Math.min(characterState.skills.creativity, 500)
    },
    {
      id: 'skills-4',
      title: 'People Person',
      description: 'Reach 500 points in Charisma skills',
      category: 'skills',
      difficulty: 'intermediate',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 500,
      reward: {
        type: 'skill_points',
        value: 100,
        description: '100 skill points'
      },
      checkCondition: () => characterState.skills.charisma >= 500,
      getProgressValue: () => Math.min(characterState.skills.charisma, 500)
    },
    
    // --- MORE LIFESTYLE CHALLENGES ---
    {
      id: 'lifestyle-2',
      title: 'Luxury Living',
      description: 'Own luxury housing and a premium vehicle',
      category: 'lifestyle',
      difficulty: 'advanced',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 2,
      reward: {
        type: 'prestige',
        value: 30,
        description: '+30 Prestige'
      },
      checkCondition: () => {
        const hasLuxuryHousing = characterState.housingType === 'luxury';
        const hasPremiumVehicle = characterState.vehicleType === 'premium';
        return hasLuxuryHousing && hasPremiumVehicle;
      },
      getProgressValue: () => {
        let progress = 0;
        if (characterState.housingType === 'luxury') progress++;
        if (characterState.vehicleType === 'premium') progress++;
        return progress;
      }
    },
    {
      id: 'lifestyle-3',
      title: 'Perfect Balance',
      description: 'Reach 85+ in health, happiness, and comfort',
      category: 'lifestyle',
      difficulty: 'expert',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 3, // 3 attributes
      reward: {
        type: 'skill_points',
        value: 200,
        description: '200 skill points'
      },
      checkCondition: () => {
        return (
          characterState.health >= 85 &&
          characterState.happiness >= 85 &&
          characterState.comfort >= 85
        );
      },
      getProgressValue: () => {
        let count = 0;
        if (characterState.health >= 85) count++;
        if (characterState.happiness >= 85) count++;
        if (characterState.comfort >= 85) count++;
        return count;
      }
    },
    
    // --- MORE SPECIAL CHALLENGES ---
    {
      id: 'special-2',
      title: 'Property Empire',
      description: 'Own properties worth a total of $1,000,000',
      category: 'special',
      difficulty: 'expert',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 1000000,
      reward: {
        type: 'cash',
        value: 100000,
        description: '$100,000 cash bonus'
      },
      checkCondition: () => {
        const totalPropertyValue = characterState.properties.reduce((total, property) => {
          return total + property.currentValue;
        }, 0);
        return totalPropertyValue >= 1000000;
      },
      getProgressValue: () => {
        const totalPropertyValue = characterState.properties.reduce((total, property) => {
          return total + property.currentValue;
        }, 0);
        return Math.min(totalPropertyValue, 1000000);
      }
    },
    {
      id: 'special-3',
      title: 'Debt Free',
      description: 'Pay off all property loans',
      category: 'special',
      difficulty: 'advanced',
      isActive: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      targetValue: 1,
      reward: {
        type: 'happiness',
        value: 30,
        description: '+30 Happiness'
      },
      checkCondition: () => {
        // Only count if player owns at least one property
        if (characterState.properties.length === 0) return false;
        
        // Check if all properties are paid off
        return characterState.properties.every(property => 
          property.loanAmount === 0 || property.loanAmount === undefined
        );
      },
      getProgressValue: () => {
        // If no properties, progress is 0
        if (characterState.properties.length === 0) return 0;
        
        // Otherwise, return 1 if all properties are paid off
        return characterState.properties.every(property => 
          property.loanAmount === 0 || property.loanAmount === undefined
        ) ? 1 : 0;
      }
    }
  ];
  
  // Combine the base challenges with the advanced ones
  const combinedChallenges = [...allChallenges, ...advancedChallenges];
  
  // Get the store state to check which challenges are already active or completed
  const store = useChallengesStore.getState();
  
  // Create arrays for tracking active and completed challenge IDs
  const activeIds = store.activeChallenges.map(c => c.id);
  const completedIds = store.completedChallenges.map(c => c.id);
  const failedIds = store.failedChallenges.map(c => c.id);
  
  // Filter out challenges that are already active, completed, or failed
  const availableChallenges = combinedChallenges.filter(challenge => 
    !activeIds.includes(challenge.id) && 
    !completedIds.includes(challenge.id) &&
    !failedIds.includes(challenge.id)
  );
  
  // If we have enough available challenges, select a diverse set
  if (availableChallenges.length >= 5) {
    // Sort challenges by category and difficulty to get a good mix
    const sortedChallenges = [...availableChallenges].sort((a, b) => {
      // First sort by category
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      
      // If same category, sort by difficulty
      const difficultyOrder = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        expert: 4,
        master: 5
      };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
    
    // Select the first 5 challenges from different categories if possible
    const selectedChallenges: Challenge[] = [];
    const selectedCategories = new Set<string>();
    
    // Try to get one challenge from each category first
    for (const challenge of sortedChallenges) {
      if (!selectedCategories.has(challenge.category)) {
        selectedChallenges.push(challenge);
        selectedCategories.add(challenge.category);
        
        if (selectedChallenges.length >= 5) break;
      }
    }
    
    // If we still need more challenges, add any remaining available ones
    if (selectedChallenges.length < 5) {
      for (const challenge of sortedChallenges) {
        if (!selectedChallenges.some(c => c.id === challenge.id)) {
          selectedChallenges.push(challenge);
          
          if (selectedChallenges.length >= 5) break;
        }
      }
    }
    
    console.log(`Generated ${selectedChallenges.length} new, unique challenges`);
    return selectedChallenges;
  }
  
  // If we don't have enough available challenges, include some completed ones
  // This is a fallback in case the player has completed most challenges
  if (availableChallenges.length > 0) {
    const neededCount = 5 - availableChallenges.length;
    
    // Get some completed challenges that we'll reset and reuse
    const resetCompletedChallenges = combinedChallenges
      .filter(challenge => completedIds.includes(challenge.id))
      .slice(0, neededCount)
      .map(challenge => ({
        ...challenge,
        isCompleted: false,
        isActive: false,
        isFailed: false,
        progress: 0
      }));
    
    console.log(`Generated ${availableChallenges.length} new + ${resetCompletedChallenges.length} recycled challenges`);
    return [...availableChallenges, ...resetCompletedChallenges];
  }
  
  // Last resort - just use the base challenges
  console.log(`Falling back to base challenges (all challenges completed)`);
  return allChallenges.slice(0, 5); // Always return at least 5 challenges
}

// Export the hook
export const useChallenges = useChallengesStore;