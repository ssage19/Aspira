import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGame } from './useGame';
import { useCharacter } from './useCharacter';
import { useAssetTracker } from './useAssetTracker';
import { toast } from 'sonner';

export type AchievementCategory = 
  | 'wealth' 
  | 'property' 
  | 'investment' 
  | 'lifestyle' 
  | 'general'
  | 'challenge'
  | 'strategy';

export type AchievementReward = {
  type: 'cash' | 'multiplier' | 'unlock' | 'bonus' | 'skill';
  value: number;
  description: string;
  skillType?: string; // For skill rewards - specifies which skill to improve
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  isUnlocked: boolean;
  progress: number; // 0 to 100
  threshold: number; // The value needed to complete
  icon: string; // Lucide icon name
  reward: AchievementReward;
  unlockedDate?: string;
};

interface AchievementsState {
  achievements: Achievement[];
  lastAchievementUnlocked: Achievement | null;
  showAchievementNotification: boolean;
  newlyUnlockedAchievements: Achievement[];
  
  // Actions
  unlockAchievement: (id: string) => void;
  updateProgress: (id: string, progress: number) => number; // returns current progress
  dismissNotification: () => void;
  claimReward: (id: string) => AchievementReward | null;
  hasClaimedReward: (id: string) => boolean;
  resetAchievements: () => void;
  getAchievement: (id: string) => Achievement | undefined;
  getCategoryAchievements: (category: AchievementCategory) => Achievement[];
  getCompletedAchievements: () => Achievement[];
  getInProgressAchievements: () => Achievement[];
  clearNewlyUnlocked: () => void;
}

// Initial achievements data
const initialAchievements: Achievement[] = [
  // Wealth achievements
  {
    id: 'wealth-1',
    title: 'First Steps',
    description: 'Reach $10,000 in wealth',
    category: 'wealth',
    isUnlocked: false,
    progress: 0,
    threshold: 10000,
    icon: 'DollarSign',
    reward: {
      type: 'cash',
      value: 1000,
      description: '$1,000 cash bonus'
    }
  },
  {
    id: 'wealth-2',
    title: 'Emerging Fortune',
    description: 'Reach $100,000 in wealth',
    category: 'wealth',
    isUnlocked: false,
    progress: 0,
    threshold: 100000,
    icon: 'DollarSign',
    reward: {
      type: 'cash',
      value: 5000,
      description: '$5,000 cash bonus'
    }
  },
  {
    id: 'wealth-3',
    title: 'Millionaire Club',
    description: 'Reach $1,000,000 in wealth',
    category: 'wealth',
    isUnlocked: false,
    progress: 0,
    threshold: 1000000,
    icon: 'Trophy',
    reward: {
      type: 'multiplier',
      value: 1.05,
      description: '5% passive income increase'
    }
  },
  {
    id: 'wealth-4',
    title: 'Multi-Millionaire',
    description: 'Reach $10,000,000 in wealth',
    category: 'wealth',
    isUnlocked: false,
    progress: 0,
    threshold: 10000000,
    icon: 'Award',
    reward: {
      type: 'multiplier',
      value: 1.1,
      description: '10% passive income increase'
    }
  },
  {
    id: 'wealth-5',
    title: 'Billionaire Status',
    description: 'Reach $1,000,000,000 in wealth',
    category: 'wealth',
    isUnlocked: false,
    progress: 0,
    threshold: 1000000000,
    icon: 'Crown',
    reward: {
      type: 'unlock',
      value: 1,
      description: 'Unlock exclusive investment opportunities'
    }
  },
  
  // Property achievements
  {
    id: 'property-1',
    title: 'Property Novice',
    description: 'Purchase your first property',
    category: 'property',
    isUnlocked: false,
    progress: 0,
    threshold: 1,
    icon: 'Home',
    reward: {
      type: 'cash',
      value: 2000,
      description: '$2,000 cash bonus'
    }
  },
  {
    id: 'property-2',
    title: 'Property Collector',
    description: 'Own 5 different properties',
    category: 'property',
    isUnlocked: false,
    progress: 0,
    threshold: 5,
    icon: 'Building',
    reward: {
      type: 'multiplier',
      value: 1.05,
      description: '5% property income boost'
    }
  },
  {
    id: 'property-3',
    title: 'Real Estate Mogul',
    description: 'Own 10 properties with a combined value of $5,000,000',
    category: 'property',
    isUnlocked: false,
    progress: 0,
    threshold: 5000000,
    icon: 'Building2',
    reward: {
      type: 'multiplier',
      value: 1.1,
      description: '10% property income boost'
    }
  },
  
  // Investment achievements
  {
    id: 'investment-1',
    title: 'Novice Investor',
    description: 'Make your first stock purchase',
    category: 'investment',
    isUnlocked: false,
    progress: 0,
    threshold: 1,
    icon: 'TrendingUp',
    reward: {
      type: 'cash',
      value: 1000,
      description: '$1,000 cash bonus'
    }
  },
  {
    id: 'investment-2',
    title: 'Portfolio Manager',
    description: 'Invest in 5 different assets',
    category: 'investment',
    isUnlocked: false,
    progress: 0,
    threshold: 5,
    icon: 'BarChartHorizontal',
    reward: {
      type: 'multiplier',
      value: 1.03,
      description: '3% investment returns boost'
    }
  },
  {
    id: 'investment-3',
    title: 'Investment Guru',
    description: 'Have $1,000,000 in investment assets',
    category: 'investment',
    isUnlocked: false,
    progress: 0,
    threshold: 1000000,
    icon: 'TrendingUp',
    reward: {
      type: 'unlock',
      value: 1,
      description: 'Unlock exclusive investment opportunities'
    }
  },
  
  // Lifestyle achievements
  {
    id: 'lifestyle-1',
    title: 'Treat Yourself',
    description: 'Purchase your first lifestyle item',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 1,
    icon: 'ShoppingBag',
    reward: {
      type: 'cash',
      value: 1000,
      description: '$1,000 cash bonus'
    }
  },
  {
    id: 'lifestyle-2',
    title: 'Living Large',
    description: 'Own 5 lifestyle items',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 5,
    icon: 'ShoppingCart',
    reward: {
      type: 'bonus',
      value: 10,
      description: '+10 Happiness boost'
    }
  },
  {
    id: 'lifestyle-3',
    title: 'Ultimate Luxury',
    description: 'Own 10 luxury items worth at least $5,000,000 combined',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 5000000,
    icon: 'GEM',
    reward: {
      type: 'bonus',
      value: 25,
      description: '+25 Prestige boost'
    }
  },
  
  // General achievements
  {
    id: 'general-1',
    title: 'Getting Started',
    description: 'Create your character and start your journey',
    category: 'general',
    isUnlocked: false,
    progress: 0,
    threshold: 1,
    icon: 'Play',
    reward: {
      type: 'cash',
      value: 500,
      description: '$500 starting bonus'
    }
  },
  {
    id: 'general-2',
    title: 'Time Management',
    description: 'Advance time for 30 days',
    category: 'general',
    isUnlocked: false,
    progress: 0,
    threshold: 30,
    icon: 'Clock',
    reward: {
      type: 'cash',
      value: 2000,
      description: '$2,000 cash bonus'
    }
  },
  {
    id: 'general-3',
    title: 'Empire Builder',
    description: 'Reach 100 days in your business empire journey',
    category: 'general',
    isUnlocked: false,
    progress: 0,
    threshold: 100,
    icon: 'Briefcase',
    reward: {
      type: 'multiplier',
      value: 1.05,
      description: '5% overall income boost'
    }
  },
  {
    id: 'general-4',
    title: 'Magnate',
    description: 'Have maximum rating in wealth, happiness, and prestige',
    category: 'general',
    isUnlocked: false,
    progress: 0,
    threshold: 100,
    icon: 'Star',
    reward: {
      type: 'unlock',
      value: 1,
      description: 'Unlock special game features'
    }
  },
  
  // Challenge achievements - complex milestones that require effort to complete
  {
    id: 'challenge-1',
    title: 'Market Maestro',
    description: 'Own at least 50 different stocks across 5+ market sectors',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 50,
    icon: 'BarChart',
    reward: {
      type: 'multiplier',
      value: 1.15,
      description: '15% investment returns boost'
    }
  },
  {
    id: 'challenge-2',
    title: 'Global Real Estate Tycoon',
    description: 'Own properties on 3 different continents with a combined value over $10M',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 3,
    icon: 'Globe',
    reward: {
      type: 'cash',
      value: 1000000,
      description: '$1,000,000 cash bonus'
    }
  },
  {
    id: 'challenge-3',
    title: 'Crypto Whale',
    description: 'Hold at least $2M in cryptocurrency for 30+ consecutive days',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 30,
    icon: 'Bitcoin',
    reward: {
      type: 'unlock',
      value: 1,
      description: 'Unlock exclusive crypto investments'
    }
  },
  {
    id: 'challenge-4',
    title: 'Angel Investor',
    description: 'Successfully fund 10 startup ventures that reach Series B or higher',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 10,
    icon: 'Rocket',
    reward: {
      type: 'multiplier',
      value: 1.2,
      description: '20% startup investment returns'
    }
  },
  {
    id: 'challenge-5',
    title: 'Luxury Connoisseur',
    description: 'Own the top tier item in every luxury category',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 5, // Number of top-tier items
    icon: 'Diamond',
    reward: {
      type: 'bonus',
      value: 50,
      description: '+50 Prestige boost'
    }
  },
  
  // Strategy achievements - require planning and strategy
  {
    id: 'strategy-1',
    title: 'Diversification Expert',
    description: 'Maintain a balanced portfolio with no asset class exceeding 30% of total wealth',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 100, // Percentage-based threshold
    icon: 'PieChart',
    reward: {
      type: 'multiplier',
      value: 1.1,
      description: '10% overall returns boost'
    }
  },
  {
    id: 'strategy-2',
    title: 'Market Timer',
    description: 'Buy 10 stocks at their lowest price and sell when they gain at least 50%',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 10,
    icon: 'Timer',
    reward: {
      type: 'cash',
      value: 100000,
      description: '$100,000 cash bonus'
    }
  },
  {
    id: 'strategy-3',
    title: 'Recession Survivor',
    description: 'Maintain positive net worth growth during a market downturn lasting 30+ days',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 30,
    icon: 'TrendingDown',
    reward: {
      type: 'unlock',
      value: 1,
      description: 'Unlock hedging strategies'
    }
  },
  {
    id: 'strategy-4',
    title: 'Perfect Balance',
    description: 'Simultaneously maintain 80+ in all personal attributes for 60 days',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 60,
    icon: 'Scale',
    reward: {
      type: 'skill',
      value: 15,
      description: '+15 to all personal attributes',
      skillType: 'all'
    }
  },
  
  // Character development achievements
  {
    id: 'character-1',
    title: 'Health Enthusiast',
    description: 'Reach 90+ health points through your lifestyle choices',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 90,
    icon: 'Heart',
    reward: {
      type: 'cash',
      value: 5000,
      description: '$5,000 cash bonus from health insurance rebate'
    }
  },
  {
    id: 'character-2',
    title: 'Stress Management',
    description: 'Reduce your stress level to below 10 points',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 10,
    icon: 'Wind',
    reward: {
      type: 'multiplier',
      value: 1.05,
      description: '5% productivity boost from improved focus'
    }
  },
  {
    id: 'character-3',
    title: 'Social Butterfly',
    description: 'Achieve 80+ social connection points',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 80,
    icon: 'Users',
    reward: {
      type: 'unlock',
      value: 1,
      description: 'Unlock exclusive networking opportunities'
    }
  },
  {
    id: 'character-4',
    title: 'Master of Skills',
    description: 'Reach 85+ skill development points',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 85,
    icon: 'BookOpen',
    reward: {
      type: 'cash',
      value: 10000,
      description: '$10,000 from new career opportunities'
    }
  },
  {
    id: 'character-5',
    title: 'Work-Life Balance',
    description: 'Maintain 50+ hours of free time while having 70+ happiness',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 100,
    icon: 'LifeBuoy',
    reward: {
      type: 'bonus',
      value: 20,
      description: '+20 Happiness boost'
    }
  },
  {
    id: 'character-6',
    title: 'Environmental Champion',
    description: 'Achieve an environmental impact score of 60+',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 60,
    icon: 'Leaf',
    reward: {
      type: 'cash',
      value: 7500,
      description: '$7,500 from green technology grants'
    }
  },
  {
    id: 'character-7',
    title: 'Balanced Life',
    description: 'Achieve 70+ in health, social, and skills simultaneously',
    category: 'lifestyle',
    isUnlocked: false,
    progress: 0,
    threshold: 100,
    icon: 'Award',
    reward: {
      type: 'unlock',
      value: 2,
      description: 'Unlock premium lifestyle opportunities'
    }
  },

  // Special unique achievement category
  {
    id: 'special-1',
    title: 'Overnight Success',
    description: 'Double your net worth in a single day',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 100, // Percentage-based threshold
    icon: 'Zap',
    reward: {
      type: 'cash',
      value: 50000,
      description: '$50,000 cash bonus'
    }
  },
  {
    id: 'special-2',
    title: 'Diamond Hands',
    description: 'Hold onto an investment that drops 30% and then recovers to gain 50%',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 100,
    icon: 'Gem',
    reward: {
      type: 'multiplier',
      value: 1.15,
      description: '15% investment resilience bonus'
    }
  },
  {
    id: 'special-3',
    title: 'Property Flip Master',
    description: 'Buy a property and sell it for at least 50% profit within 60 days',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 100,
    icon: 'RefreshCw',
    reward: {
      type: 'cash',
      value: 75000,
      description: '$75,000 cash bonus'
    }
  },
  {
    id: 'special-4',
    title: 'Minimalist Millionaire',
    description: 'Reach $1M net worth while owning fewer than 5 lifestyle items',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 100,
    icon: 'Minimize2',
    reward: {
      type: 'multiplier',
      value: 1.1,
      description: '10% wealth growth rate'
    }
  },
  {
    id: 'special-5',
    title: 'Risk Taker',
    description: 'Invest at least $500,000 in high-risk assets and maintain for 30 days',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 30,
    icon: 'Dice',
    reward: {
      type: 'cash',
      value: 250000,
      description: '$250,000 cash bonus'
    }
  },
  {
    id: 'special-6',
    title: 'Early Retirement',
    description: 'Generate $50,000+ monthly passive income from investments',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 50000,
    icon: 'PalmTree',
    reward: {
      type: 'bonus',
      value: 30,
      description: '+30 Happiness and reduced stress'
    }
  },
  {
    id: 'special-7',
    title: 'Sustainable Legacy',
    description: 'Maintain 80+ environmental impact while having $5M+ net worth',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 100,
    icon: 'Flower2',
    reward: {
      type: 'unlock',
      value: 1,
      description: 'Unlock sustainable investment opportunities'
    }
  },
  
  // Additional challenge achievements
  {
    id: 'challenge-11',
    title: 'Financial Phoenix',
    description: 'Recover from a net worth drop of at least 40% and double your previous peak',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 100, // Percentage of recovery
    icon: 'RefreshCw',
    reward: {
      type: 'multiplier',
      value: 1.25,
      description: '25% faster recovery from market downturns'
    }
  },
  {
    id: 'challenge-12',
    title: 'Minimalist Millionaire',
    description: 'Reach $5 million net worth while owning no more than 5 lifestyle items',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 5000000,
    icon: 'Minimize2',
    reward: {
      type: 'multiplier',
      value: 1.15,
      description: '15% reduced costs on all future purchases'
    }
  },
  {
    id: 'challenge-13',
    title: 'High-Risk, High-Reward',
    description: 'Invest at least $1 million in extremely volatile assets and hold for 60 days',
    category: 'challenge',
    isUnlocked: false,
    progress: 0,
    threshold: 60,
    icon: 'Zap',
    reward: {
      type: 'cash',
      value: 500000,
      description: '$500,000 cash bonus and improved luck with risky investments'
    }
  },
  
  // Additional strategy achievements  
  {
    id: 'strategy-10',
    title: 'Calculated Risk',
    description: 'Maintain a perfect risk-adjusted return ratio for 90 days',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 90,
    icon: 'Dice',
    reward: {
      type: 'multiplier',
      value: 1.12,
      description: '12% better returns on all investments'
    }
  },
  {
    id: 'strategy-11',
    title: 'Passive Income Master',
    description: 'Generate $50,000+ in daily passive income without active work',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 50000,
    icon: 'PalmTree',
    reward: {
      type: 'unlock',
      value: 1,
      description: 'Unlock elite passive income opportunities'
    }
  },
  {
    id: 'strategy-12',
    title: 'Sustainable Growth',
    description: 'Maintain a steady 5%+ growth rate for 2 years without speculative investments',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 24, // months
    icon: 'Flower2',
    reward: {
      type: 'bonus',
      value: 20,
      description: '+20 Happiness and long-term investment bonuses'
    }
  },
  {
    id: 'strategy-13',
    title: 'Precious Assets',
    description: 'Allocate 20% of your portfolio to precious metals and alternative assets during inflation',
    category: 'strategy',
    isUnlocked: false,
    progress: 0,
    threshold: 100, // Percentage completed
    icon: 'Gem',
    reward: {
      type: 'multiplier',
      value: 1.1,
      description: '10% better protection against economic downturns'
    }
  }
];

export const useAchievements = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: initialAchievements,
      lastAchievementUnlocked: null,
      showAchievementNotification: false,
      newlyUnlockedAchievements: [],
      
      unlockAchievement: (id) => {
        const achievement = get().achievements.find(a => a.id === id);
        
        if (achievement && !achievement.isUnlocked) {
          // Create an unlocked version of the achievement
          const unlockedAchievement = { 
            ...achievement, 
            isUnlocked: true, 
            progress: 100, 
            unlockedDate: new Date().toISOString() 
          };
          
          set(state => {
            const updatedAchievements = state.achievements.map(a => 
              a.id === id ? unlockedAchievement : a
            );
            
            return {
              achievements: updatedAchievements,
              lastAchievementUnlocked: unlockedAchievement,
              showAchievementNotification: true,
              newlyUnlockedAchievements: [...state.newlyUnlockedAchievements, unlockedAchievement]
            };
          });
        }
      },
      
      updateProgress: (id, progress) => {
        const achievement = get().achievements.find(a => a.id === id);
        
        if (achievement && !achievement.isUnlocked) {
          const normalizedProgress = Math.min(100, Math.floor((progress / achievement.threshold) * 100));
          
          set(state => ({
            achievements: state.achievements.map(a => 
              a.id === id 
                ? { 
                    ...a, 
                    progress: normalizedProgress,
                    isUnlocked: normalizedProgress >= 100,
                    unlockedDate: normalizedProgress >= 100 ? new Date().toISOString() : undefined
                  } 
                : a
            )
          }));
          
          // Check if achievement was just unlocked
          const updatedAchievement = get().achievements.find(a => a.id === id);
          if (updatedAchievement && updatedAchievement.isUnlocked) {
            set(state => ({
              lastAchievementUnlocked: updatedAchievement,
              showAchievementNotification: true,
              newlyUnlockedAchievements: [...state.newlyUnlockedAchievements, updatedAchievement]
            }));
          }
          
          return normalizedProgress;
        }
        
        return achievement ? achievement.progress : 0;
      },
      
      dismissNotification: () => {
        set({ showAchievementNotification: false });
      },
      
      claimReward: (id) => {
        console.log(`[Achievement Store] claimReward called for achievement ID: ${id}`);
        const achievement = get().achievements.find(a => a.id === id);
        
        if (!achievement) {
          console.error(`[Achievement Store] Achievement with ID ${id} not found`);
          return null;
        }
        
        if (!achievement.isUnlocked) {
          console.error(`[Achievement Store] Attempted to claim reward for locked achievement: ${id}`);
          return null;
        }
        
        // Check if already claimed
        const claimedRewards = localStorage.getItem('business-empire-claimed-rewards');
        const claimedRewardsObj = claimedRewards ? JSON.parse(claimedRewards) : {};
        
        if (claimedRewardsObj[id]) {
          console.log(`[Achievement Store] Achievement ${id} already claimed, skipping`);
          return null;
        }
        
        console.log(`[Achievement Store] Processing reward for "${achievement.title}" (${id})`);
        
        // Apply the reward based on type (EXACTLY MATCH CHALLENGE IMPLEMENTATION)
        const { reward } = achievement;
        const character = useCharacter.getState();
        
        // Create a success message for toasts
        let rewardMessage = '';
        
        try {
          // Apply reward based on type
          switch (reward.type) {
            case 'cash':
              console.log(`[Achievement Store] Achievement will award $${reward.value} in cash`);
              // Ensure reward.value is a valid number
              const cashAmount = typeof reward.value === 'number' && !isNaN(reward.value) ? reward.value : 0;
              console.log(`[Achievement Store] Validated cash reward amount: $${cashAmount}`);
              
              // Create a transaction log for debugging
              console.log(`[Achievement Store] Cash reward transaction beginning:`, {
                initialCharacterWealth: character.wealth,
                initialAssetTrackerCash: useAssetTracker.getState().cash,
                rewardAmount: cashAmount
              });
              
              // IMPROVED CASH REWARD FLOW - Following best practices from other parts of the application
              // Step 1: Add wealth to the character store
              character.addWealth(cashAmount);
              console.log(`[Achievement Store] Added $${cashAmount} to character's wealth. New wealth: ${character.wealth}`);
              
              // Step 2: Immediately sync with asset tracker to ensure consistency
              // This uses the robust asset sync mechanism we've enhanced
              character.syncAssetsWithAssetTracker(false); // false = don't update market prices
              console.log(`[Achievement Store] Synced character wealth with asset tracker`);
              
              // Step 3: Verify the sync was successful
              const verificationCash = useAssetTracker.getState().cash;
              console.log(`[Achievement Store] Verification: Character wealth: ${character.wealth}, Asset tracker cash: ${verificationCash}`);
              
              // Step 4: Force a recalculation of totals to update UI
              useAssetTracker.getState().recalculateTotals();
              console.log(`[Achievement Store] Asset refresh complete. Final cash: ${useAssetTracker.getState().cash}`);
              
              // Step 5: Force-update the asset tracker to ensure it renders the new values
              useAssetTracker.getState().forceUpdate();
              
              rewardMessage = `$${cashAmount.toLocaleString()} added to your account!`;
              break;
            
            case 'multiplier':
              const multiplier = typeof reward.value === 'number' && !isNaN(reward.value) ? reward.value : 1.0;
              console.log(`[Achievement Store] Applying income multiplier: ${multiplier}`);
              useGame.getState().applyIncomeMultiplier(multiplier);
              rewardMessage = `${((multiplier - 1) * 100).toFixed(0)}% income boost applied!`;
              break;
            
            case 'unlock':
              console.log(`[Achievement Store] Unlocking feature: ${reward.description}`);
              rewardMessage = `${reward.description} unlocked!`;
              break;
            
            case 'bonus':
              console.log(`[Achievement Store] Processing bonus: ${reward.description}`);
              const bonusAmount = typeof reward.value === 'number' && !isNaN(reward.value) ? reward.value : 0;
              
              if (reward.description.includes('Happiness')) {
                console.log(`[Achievement Store] Applying happiness bonus: +${bonusAmount}`);
                character.addHappiness(bonusAmount);
                rewardMessage = `+${bonusAmount} Happiness gained!`;
              }
              
              if (reward.description.includes('Prestige')) {
                console.log(`[Achievement Store] Applying prestige bonus: +${bonusAmount}`);
                character.addPrestige(bonusAmount);
                rewardMessage = `+${bonusAmount} Prestige gained!`;
              }
              break;
              
            case 'skill':
              console.log(`[Achievement Store] Processing skill reward: ${reward.description}`);
              const skillAmount = typeof reward.value === 'number' && !isNaN(reward.value) ? reward.value : 0;
              const skillType = reward.skillType || '';
              
              console.log(`[Achievement Store] Skill transaction beginning:`, {
                skillType,
                amount: skillAmount,
                description: reward.description
              });
              
              // Apply the skill points based on the skillType using improveSkill method
              if (skillType === 'intelligence') {
                character.improveSkill('intelligence', skillAmount);
                rewardMessage = `+${skillAmount} Intelligence gained!`;
              } else if (skillType === 'creativity') {
                character.improveSkill('creativity', skillAmount);
                rewardMessage = `+${skillAmount} Creativity gained!`;
              } else if (skillType === 'charisma') {
                character.improveSkill('charisma', skillAmount);
                rewardMessage = `+${skillAmount} Charisma gained!`;
              } else if (skillType === 'technical') {
                character.improveSkill('technical', skillAmount);
                rewardMessage = `+${skillAmount} Technical skill gained!`;
              } else if (skillType === 'leadership') {
                character.improveSkill('leadership', skillAmount);
                rewardMessage = `+${skillAmount} Leadership gained!`;
              } else if (skillType === 'physical') {
                character.improveSkill('physical', skillAmount);
                rewardMessage = `+${skillAmount} Physical ability gained!`;
              } else if (skillType === 'all') {
                // Add to all skills evenly
                character.improveSkill('intelligence', skillAmount);
                character.improveSkill('creativity', skillAmount);
                character.improveSkill('charisma', skillAmount);
                character.improveSkill('technical', skillAmount);
                character.improveSkill('leadership', skillAmount);
                character.improveSkill('physical', skillAmount);
                rewardMessage = `+${skillAmount} to all skills gained!`;
              } else {
                console.error(`[Achievement Store] Unknown skill type: ${skillType}`);
                rewardMessage = `Skill points earned!`;
              }
              
              console.log(`[Achievement Store] Applied ${skillAmount} points to ${skillType} skill(s)`);
              break;
          }
          
          // Show success toast
          toast.success('Achievement Reward Claimed!', {
            description: rewardMessage,
            position: 'top-center',
            duration: 3000
          });
          
          // Mark reward as claimed in localStorage
          claimedRewardsObj[id] = true;
          localStorage.setItem('business-empire-claimed-rewards', JSON.stringify(claimedRewardsObj));
          console.log(`[Achievement Store] Reward for ${id} marked as claimed in localStorage`);
          
          return reward;
        } catch (error) {
          console.error(`[Achievement Store] Error processing reward:`, error);
          return null;
        }
      },
      
      hasClaimedReward: (id) => {
        // Check localStorage for claimed status
        const claimedRewards = localStorage.getItem('business-empire-claimed-rewards');
        if (!claimedRewards) return false;
        
        try {
          const claimedRewardsObj = JSON.parse(claimedRewards);
          return !!claimedRewardsObj[id];
        } catch (err) {
          console.error('Error parsing claimed rewards:', err);
          return false;
        }
      },
      
      getAchievement: (id) => {
        return get().achievements.find(a => a.id === id);
      },
      
      getCategoryAchievements: (category) => {
        return get().achievements.filter(a => a.category === category);
      },
      
      getCompletedAchievements: () => {
        return get().achievements.filter(a => a.isUnlocked);
      },
      
      getInProgressAchievements: () => {
        return get().achievements.filter(a => !a.isUnlocked && a.progress > 0);
      },
      
      resetAchievements: () => {
        set({
          achievements: initialAchievements.map(a => ({ ...a })),
          lastAchievementUnlocked: null,
          showAchievementNotification: false,
          newlyUnlockedAchievements: []
        });
      },
      
      clearNewlyUnlocked: () => {
        set({ newlyUnlockedAchievements: [] });
      }
    }),
    {
      name: 'business-empire-achievements'
    }
  )
);