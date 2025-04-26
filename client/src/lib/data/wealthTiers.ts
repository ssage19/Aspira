import { 
  Circle,
  Medal,
  Award,
  Crown,
  Gem as GemIcon,
  Rocket as RocketIcon,
  Star as StarIcon,
  Trophy as TrophyIcon,
  Diamond as DiamondIcon,
  Globe2 as Globe2Icon,
  Building as BuildingIcon,
  Building2 as BankIcon,
  Cog as CogIcon
} from 'lucide-react';

export interface WealthTier {
  id: string;
  name: string;
  description: string;
  minNetWorth: number;
  icon: any; // We'll use Lucide React icons
  color: string; // Tailwind CSS color class
  badgeClass: string; // Tailwind CSS classes for badge styling
}

export const wealthTiers: WealthTier[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Just starting your journey to financial independence.',
    minNetWorth: 0,
    icon: Circle,
    color: 'text-gray-500',
    badgeClass: 'bg-gray-200 text-gray-700'
  },
  {
    id: 'saver',
    name: 'Saver',
    description: 'You\'ve started building a safety net.',
    minNetWorth: 50000,
    icon: Medal,
    color: 'text-green-500',
    badgeClass: 'bg-green-100 text-green-800'
  },
  {
    id: 'investor',
    name: 'Investor',
    description: 'Your money is working for you now.',
    minNetWorth: 250000,
    icon: StarIcon,
    color: 'text-blue-500',
    badgeClass: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    description: 'Successfully building your wealth empire.',
    minNetWorth: 1000000,
    icon: RocketIcon,
    color: 'text-purple-500',
    badgeClass: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'You\'ve joined the millionaire club.',
    minNetWorth: 5000000,
    icon: DiamondIcon,
    color: 'text-indigo-500',
    badgeClass: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'tycoon',
    name: 'Tycoon',
    description: 'Your business empire is expanding.',
    minNetWorth: 25000000,
    icon: BuildingIcon,
    color: 'text-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'mogul',
    name: 'Mogul',
    description: 'A key player in the financial world.',
    minNetWorth: 100000000,
    icon: BankIcon,
    color: 'text-orange-500',
    badgeClass: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'magnate',
    name: 'Magnate',
    description: 'Among the wealthiest in the world.',
    minNetWorth: 500000000,
    icon: TrophyIcon,
    color: 'text-rose-500',
    badgeClass: 'bg-rose-100 text-rose-800'
  },
  {
    id: 'titan',
    name: 'Titan',
    description: 'Your influence spans industries and nations.',
    minNetWorth: 1000000000,
    icon: Globe2Icon,
    color: 'text-violet-500',
    badgeClass: 'bg-violet-100 text-violet-800'
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Your name is synonymous with extreme wealth.',
    minNetWorth: 10000000000,
    icon: Crown,
    color: 'text-yellow-500',
    badgeClass: 'bg-yellow-100 text-yellow-800'
  }
];

/**
 * Get the current wealth tier based on net worth
 * @param netWorth Player's current net worth
 * @returns The current WealthTier object
 */
export function getCurrentWealthTier(netWorth: number): WealthTier {
  // Sort tiers from highest to lowest
  const sortedTiers = [...wealthTiers].sort((a, b) => b.minNetWorth - a.minNetWorth);
  
  // Find the first tier where the net worth meets the minimum
  for (const tier of sortedTiers) {
    if (netWorth >= tier.minNetWorth) {
      return tier;
    }
  }
  
  // Default to the beginner tier
  return wealthTiers[0];
}

/**
 * Get progress to the next wealth tier
 * @param netWorth Player's current net worth
 * @returns Object with progress percentage and next tier
 */
export function getNextTierProgress(netWorth: number): { 
  progress: number; 
  nextTier: WealthTier | null;
  currentTier: WealthTier;
} {
  const currentTier = getCurrentWealthTier(netWorth);
  const currentTierIndex = wealthTiers.findIndex(tier => tier.id === currentTier.id);
  
  // If at the highest tier, return 100% with no next tier
  if (currentTierIndex === wealthTiers.length - 1) {
    return {
      progress: 100,
      nextTier: null,
      currentTier
    };
  }
  
  const nextTier = wealthTiers[currentTierIndex + 1];
  const range = nextTier.minNetWorth - currentTier.minNetWorth;
  const progress = Math.min(100, ((netWorth - currentTier.minNetWorth) / range) * 100);
  
  return {
    progress,
    nextTier,
    currentTier
  };
}