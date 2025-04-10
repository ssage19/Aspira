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

interface ChallengesState {
  availableChallenges: Challenge[];
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  failedChallenges: Challenge[];
  
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
        
        set(state => ({
          availableChallenges: state.availableChallenges.filter(c => c.id !== id),
          activeChallenges: [...state.activeChallenges, updatedChallenge]
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
        
        set(state => ({
          activeChallenges: state.activeChallenges.filter(c => c.id !== id),
          completedChallenges: [...state.completedChallenges, updatedChallenge],
          totalCompleted: state.totalCompleted + 1,
          consecutiveCompletions: state.consecutiveCompletions + 1
        }));
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
        
        set(state => ({
          activeChallenges: state.activeChallenges.filter(c => c.id !== id),
          failedChallenges: [...state.failedChallenges, updatedChallenge],
          totalFailed: state.totalFailed + 1,
          consecutiveCompletions: 0
        }));
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
        
        set(state => ({
          activeChallenges: state.activeChallenges.filter(c => c.id !== id),
          availableChallenges: [...state.availableChallenges, resetChallenge],
          consecutiveCompletions: 0
        }));
      },
      
      checkChallengeProgress: () => {
        const { activeChallenges } = get();
        const currentDate = useTime.getState().currentGameDate;
        const characterState = useCharacter.getState();
        const assetTrackerState = useAssetTracker.getState();
        
        // Use arrays to collect changes before applying them all at once
        const challengesToComplete: string[] = [];
        const challengesToFail: string[] = [];
        const challengesToUpdate: {id: string, progress: number}[] = [];
        
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
              case 'invest-2':
                // Placeholder for stock hold challenge
                currentProgress = 0;
                conditionMet = false;
                break;
              
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
              case 'lifestyle-1':
                // Placeholder for health tracking challenge
                currentProgress = 0;
                conditionMet = false;
                break;
              
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
            character.addWealth(reward.value);
            rewardMessage = `$${reward.value.toLocaleString()} added to your account!`;
            break;
          case 'skill_points':
            // For now, we'll just log that skill points would be added
            console.log(`Challenge would award ${reward.value} skill points`);
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
        // This will be implemented with specific challenge generation logic
        // For now, we'll just have placeholder logic
        set(state => ({
          availableChallenges: generateChallenges()
        }));
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
  
  // Basic challenges for different categories with difficulty levels
  return [
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
      // This would need specialized tracking logic for stock hold duration
      checkCondition: () => {
        if (!assetTrackerState.stocks.length) return false;
        // In a real implementation, we'd need to track purchase dates
        return false; // Placeholder  
      },
      getProgressValue: () => 0 // Placeholder
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
      // This would need daily tracking of health
      checkCondition: () => false, // Placeholder
      getProgressValue: () => 0 // Placeholder
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
}

// Export the hook
export const useChallenges = useChallengesStore;