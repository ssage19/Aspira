import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { useCharacter } from './useCharacter';
import { formatCurrency } from '../utils';

export interface PrestigeBonus {
  id: string;
  name: string;
  description: string;
  effect: string;
  level: number;
  unlocked: boolean;
  cost: number; // Cost in prestige points
}

export interface PrestigeState {
  // Prestige level and points
  level: number;
  prestigePoints: number;
  totalEarnedPoints: number;
  lifetimeResets: number;
  lastResetTime: number;
  lastResetWealth: number;
  
  // Active bonuses
  activeBonuses: string[]; // IDs of unlocked bonuses
  
  // Actions
  resetGame: () => Promise<boolean>;
  confirmReset: () => Promise<boolean>;
  addPrestigePoints: (amount: number) => void;
  purchaseBonus: (bonusId: string) => boolean;
  hasPurchasedBonus: (bonusId: string) => boolean;
  canPurchaseBonus: (bonusId: string) => boolean;
}

// Available prestige bonuses
export const prestigeBonuses: PrestigeBonus[] = [
  {
    id: 'starting_cash',
    name: 'Head Start',
    description: 'Begin each new life with additional starting cash',
    effect: 'Start with $10,000 additional cash',
    level: 1,
    unlocked: false,
    cost: 1
  },
  {
    id: 'income_boost',
    name: 'Income Accelerator',
    description: 'All job income is increased by 5%',
    effect: '+5% to all salary and job-related income',
    level: 1,
    unlocked: false,
    cost: 2
  },
  {
    id: 'investment_insight',
    name: 'Market Insight',
    description: 'Get better visibility into market trends',
    effect: 'Shows market prediction indicators for stocks and investments',
    level: 1,
    unlocked: false,
    cost: 2
  },
  {
    id: 'connections',
    name: 'Business Connections',
    description: 'Start with established business connections',
    effect: 'Begin with 2 business connections already established',
    level: 1,
    unlocked: false,
    cost: 3
  },
  {
    id: 'time_boost',
    name: 'Time Optimizer',
    description: 'Increased time efficiency for all activities',
    effect: '10% reduction in time cost for all activities',
    level: 1,
    unlocked: false,
    cost: 3
  },
  {
    id: 'education_boost',
    name: 'Learning Accelerator',
    description: 'Learn new skills faster',
    effect: '+15% faster skill acquisition',
    level: 1,
    unlocked: false,
    cost: 4
  },
  {
    id: 'risk_manager',
    name: 'Risk Management',
    description: 'Reduce the impact of negative random events',
    effect: '25% reduction in financial losses from random events',
    level: 1,
    unlocked: false,
    cost: 5
  },
  {
    id: 'wealth_magnet',
    name: 'Wealth Magnet',
    description: 'Higher chance of finding valuable opportunities',
    effect: 'Increases rare investment and opportunity encounter rate by 20%',
    level: 1,
    unlocked: false,
    cost: 7
  }
];

// Create the prestige store
export const usePrestige = create<PrestigeState>()(
  persist(
    (set, get) => ({
      // Initial state
      level: 0,
      prestigePoints: 0,
      totalEarnedPoints: 0,
      lifetimeResets: 0,
      lastResetTime: 0,
      lastResetWealth: 0,
      activeBonuses: [],
      
      // Reset game and gain prestige points
      resetGame: async () => {
        const character = useCharacter.getState();
        
        // Calculate prestige points to award based on wealth
        // Algorithm: log10(wealth) * 2, rounded down, minimum 1 point if wealth > 100k
        const wealth = character.wealth;
        
        if (wealth < 100000) {
          toast.error("You need at least $100,000 to gain prestige points when resetting");
          return false;
        }
        
        // Calculate points
        const newPoints = Math.max(1, Math.floor(Math.log10(wealth) * 2));
        
        // Show confirmation dialog
        if (window.confirm(`Are you sure you want to reset your game? You will gain ${newPoints} prestige points based on your current wealth of ${formatCurrency(wealth)}.`)) {
          return get().confirmReset();
        }
        
        return false;
      },
      
      // Internal method to actually perform the reset after confirmation
      confirmReset: async () => {
        const character = useCharacter.getState();
        const wealth = character.wealth;
        
        // Calculate prestige points
        const newPoints = Math.max(1, Math.floor(Math.log10(wealth) * 2));
        
        // Update prestige state
        set(state => ({
          prestigePoints: state.prestigePoints + newPoints,
          totalEarnedPoints: state.totalEarnedPoints + newPoints,
          lifetimeResets: state.lifetimeResets + 1,
          lastResetTime: Date.now(),
          lastResetWealth: wealth,
          level: Math.floor((state.totalEarnedPoints + newPoints) / 5) // Every 5 total points = 1 level
        }));
        
        // Store reset intention in session storage for post-reset recovery
        sessionStorage.setItem('game_reset_in_progress', 'true');
        sessionStorage.setItem('redirect_after_reset', '/create');
        
        // Trigger game reset in character store
        if (character.resetCharacter) {
          await character.resetCharacter();
          
          // Show success message
          toast.success(`Reset successful! You gained ${newPoints} prestige points.`);
          return true;
        }
        
        toast.error("Something went wrong with the reset process.");
        return false;
      },
      
      // Add prestige points (used for achievements, events, etc.)
      addPrestigePoints: (amount: number) => {
        set(state => ({
          prestigePoints: state.prestigePoints + amount,
          totalEarnedPoints: state.totalEarnedPoints + amount,
          level: Math.floor((state.totalEarnedPoints + amount) / 5) // Every 5 total points = 1 level
        }));
        
        toast.success(`You gained ${amount} prestige point${amount !== 1 ? 's' : ''}!`);
      },
      
      // Purchase a prestige bonus
      purchaseBonus: (bonusId: string) => {
        const bonus = prestigeBonuses.find(b => b.id === bonusId);
        if (!bonus) return false;
        
        const { prestigePoints, activeBonuses } = get();
        
        // Check if already purchased
        if (activeBonuses.includes(bonusId)) {
          toast.error(`You have already unlocked ${bonus.name}.`);
          return false;
        }
        
        // Check if can afford
        if (prestigePoints < bonus.cost) {
          toast.error(`You need ${bonus.cost} prestige points to unlock ${bonus.name}.`);
          return false;
        }
        
        // Purchase the bonus
        set(state => ({
          prestigePoints: state.prestigePoints - bonus.cost,
          activeBonuses: [...state.activeBonuses, bonusId]
        }));
        
        toast.success(`You have unlocked ${bonus.name}!`);
        return true;
      },
      
      // Check if a bonus has been purchased
      hasPurchasedBonus: (bonusId: string) => {
        return get().activeBonuses.includes(bonusId);
      },
      
      // Check if a bonus can be purchased
      canPurchaseBonus: (bonusId: string) => {
        const bonus = prestigeBonuses.find(b => b.id === bonusId);
        if (!bonus) return false;
        
        const { prestigePoints, activeBonuses } = get();
        
        // Already purchased?
        if (activeBonuses.includes(bonusId)) return false;
        
        // Can afford?
        return prestigePoints >= bonus.cost;
      }
    }),
    {
      name: 'luxury_lifestyle_prestige',
      partialize: (state) => ({
        level: state.level,
        prestigePoints: state.prestigePoints,
        totalEarnedPoints: state.totalEarnedPoints,
        lifetimeResets: state.lifetimeResets,
        lastResetTime: state.lastResetTime,
        lastResetWealth: state.lastResetWealth,
        activeBonuses: state.activeBonuses
      })
    }
  )
);

// Utility function to apply prestige effects throughout the game
export function getPrestigeModifier(type: string, defaultValue: number = 0): number {
  const { activeBonuses } = usePrestige.getState();
  
  let modifier = defaultValue;
  
  // Apply modifiers based on active bonuses
  if (type === 'starting_cash' && activeBonuses.includes('starting_cash')) {
    modifier += 10000;
  }
  
  if (type === 'income_multiplier' && activeBonuses.includes('income_boost')) {
    modifier += 0.05; // 5% increase
  }
  
  if (type === 'time_efficiency' && activeBonuses.includes('time_boost')) {
    modifier += 0.1; // 10% more efficiency
  }
  
  if (type === 'learning_speed' && activeBonuses.includes('education_boost')) {
    modifier += 0.15; // 15% faster learning
  }
  
  if (type === 'risk_reduction' && activeBonuses.includes('risk_manager')) {
    modifier += 0.25; // 25% risk reduction
  }
  
  if (type === 'opportunity_chance' && activeBonuses.includes('wealth_magnet')) {
    modifier += 0.2; // 20% better chances
  }
  
  return modifier;
}