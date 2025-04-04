import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AchievementCategory = 
  | 'wealth' 
  | 'property' 
  | 'investment' 
  | 'lifestyle' 
  | 'general';

export type AchievementReward = {
  type: 'cash' | 'multiplier' | 'unlock' | 'bonus';
  value: number;
  description: string;
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
  
  // Actions
  unlockAchievement: (id: string) => void;
  updateProgress: (id: string, progress: number) => number; // returns current progress
  dismissNotification: () => void;
  claimReward: (id: string) => AchievementReward | null;
  getAchievement: (id: string) => Achievement | undefined;
  getCategoryAchievements: (category: AchievementCategory) => Achievement[];
  getCompletedAchievements: () => Achievement[];
  getInProgressAchievements: () => Achievement[];
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
  }
];

export const useAchievements = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: initialAchievements,
      lastAchievementUnlocked: null,
      showAchievementNotification: false,
      
      unlockAchievement: (id) => {
        const achievement = get().achievements.find(a => a.id === id);
        
        if (achievement && !achievement.isUnlocked) {
          set(state => {
            const updatedAchievements = state.achievements.map(a => 
              a.id === id 
                ? { 
                    ...a, 
                    isUnlocked: true, 
                    progress: 100, 
                    unlockedDate: new Date().toISOString() 
                  } 
                : a
            );
            
            return {
              achievements: updatedAchievements,
              lastAchievementUnlocked: achievement,
              showAchievementNotification: true
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
            set({
              lastAchievementUnlocked: updatedAchievement,
              showAchievementNotification: true
            });
          }
          
          return normalizedProgress;
        }
        
        return achievement ? achievement.progress : 0;
      },
      
      dismissNotification: () => {
        set({ showAchievementNotification: false });
      },
      
      claimReward: (id) => {
        const achievement = get().achievements.find(a => a.id === id);
        
        if (achievement && achievement.isUnlocked) {
          return achievement.reward;
        }
        
        return null;
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
      }
    }),
    {
      name: 'business-empire-achievements'
    }
  )
);