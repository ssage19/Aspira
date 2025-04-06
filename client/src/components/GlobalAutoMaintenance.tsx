import { useEffect, useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { 
  EssentialItem, 
  foodItems, 
  drinkItems, 
  restActivities, 
  socialActivities,
  exerciseActivities 
} from '../lib/data/essentials';

/**
 * A global component that runs in the background to handle auto-maintenance of character needs.
 * This component should be mounted at the App level to ensure it's always active.
 */
export function GlobalAutoMaintenance() {
  // Get the auto-maintain setting from localStorage (default to true if not set)
  const [autoMaintain, setAutoMaintain] = useState<boolean>(() => {
    const savedPreference = localStorage.getItem('auto-maintain-needs');
    // If user has a saved preference, use that; otherwise default to true
    return savedPreference === null ? true : savedPreference === 'true';
  });

  // Function to find the most cost-effective item for a specific need
  const findBestItemForNeed = (
    needType: 'hunger' | 'thirst' | 'energy' | 'socialConnections' | 'stress',
    itemList: EssentialItem[]
  ): EssentialItem | null => {
    // Get current wealth to check affordability
    const wealth = useCharacter.getState().wealth;
    
    // Filter items that restore the specific need and are affordable
    const validItems = itemList.filter(item => 
      item.effects[needType] && 
      // For stress, we want negative values (stress reduction)
      (needType === 'stress' ? 
        item.effects[needType]! < 0 : 
        item.effects[needType]! > 0) && 
      item.price <= wealth
    );
    
    if (validItems.length === 0) return null;
    
    // Find the most cost-effective item (highest effect per dollar)
    return validItems.reduce((best, current) => {
      // For stress, we want the most negative value (more stress reduction)
      const bestValue = needType === 'stress' ? 
        Math.abs(best.effects[needType]!) : 
        best.effects[needType]!;
        
      const currentValue = needType === 'stress' ? 
        Math.abs(current.effects[needType]!) : 
        current.effects[needType]!;
      
      const bestEfficiency = bestValue / Math.max(1, best.price);
      const currentEfficiency = currentValue / Math.max(1, current.price);
      
      return currentEfficiency > bestEfficiency ? current : best;
    }, validItems[0]);
  };

  // Function to handle consuming an essential item
  const handleConsumeEssential = (item: EssentialItem) => {
    const {
      wealth,
      addWealth,
      updateHunger,
      updateThirst,
      updateEnergy,
      addHealth,
      addStress,
      updateSocialConnections
    } = useCharacter.getState();
    
    // Check if user has enough money
    if (item.price > wealth) {
      return;
    }
    
    // Deduct cost
    if (item.price > 0) {
      addWealth(-item.price);
      console.log(`Adding ${-item.price} to wealth. New wealth: ${wealth - item.price}`);
    }
    
    // Apply the effects
    const effects = item.effects;
    
    if (effects.hunger) {
      updateHunger(effects.hunger);
      console.log(`Food consumed, new hunger: ${useCharacter.getState().hunger}`);
    }
    
    if (effects.thirst) {
      updateThirst(effects.thirst);
      console.log(`Thirst quenched, new thirst: ${useCharacter.getState().thirst}`);
    }
    
    if (effects.energy) {
      updateEnergy(effects.energy);
      console.log(`Energy increased, new energy: ${useCharacter.getState().energy}`);
    }
    
    if (effects.health) {
      addHealth(effects.health);
    }
    
    if (effects.stress) {
      // Apply stress effect directly
      addStress(effects.stress);
    }
    
    if (effects.socialConnections) {
      updateSocialConnections(effects.socialConnections);
      console.log(`Social needs addressed, new level: ${useCharacter.getState().socialConnections}`);
    }
  };

  // Function to auto-consume essentials when needs get low
  const handleAutoMaintenance = () => {
    if (!autoMaintain) return;
    
    // Get the most up-to-date state values directly from the store
    const {
      hunger: currentHunger,
      thirst: currentThirst,
      energy: currentEnergy,
      socialConnections: currentSocial,
      stress: currentStress,
      wealth: currentWealth
    } = useCharacter.getState();
    
    // Track if any actions were taken
    let actionsTaken = 0;
    const maxActionsPerCycle = 12; // Limit actions per cycle to prevent excessive spending
    
    // Check and address needs in order of priority
    
    // First check the most critical needs: hunger and thirst
    if (currentHunger <= 70 && actionsTaken < maxActionsPerCycle) {
      const bestFood = findBestItemForNeed('hunger', foodItems);
      if (bestFood && bestFood.price <= currentWealth) {
        handleConsumeEssential(bestFood);
        actionsTaken++;
      }
    }
    
    if (currentThirst <= 70 && actionsTaken < maxActionsPerCycle) {
      const bestDrink = findBestItemForNeed('thirst', drinkItems);
      if (bestDrink && bestDrink.price <= currentWealth) {
        handleConsumeEssential(bestDrink);
        actionsTaken++;
      }
    }
    
    if (currentEnergy <= 70 && actionsTaken < maxActionsPerCycle) {
      const bestRest = findBestItemForNeed('energy', restActivities);
      if (bestRest && bestRest.price <= currentWealth) {
        handleConsumeEssential(bestRest);
        actionsTaken++;
      }
    }
    
    if (currentSocial <= 70 && actionsTaken < maxActionsPerCycle) {
      const bestSocial = findBestItemForNeed('socialConnections', socialActivities);
      if (bestSocial && bestSocial.price <= currentWealth) {
        handleConsumeEssential(bestSocial);
        actionsTaken++;
      }
    }
    
    if (currentStress >= 50 && actionsTaken < maxActionsPerCycle) {
      // Look for stress reduction across different activities
      let bestStressReliever = findBestItemForNeed('stress', restActivities);
      
      if (!bestStressReliever) {
        bestStressReliever = findBestItemForNeed('stress', exerciseActivities);
      }
      
      if (!bestStressReliever) {
        bestStressReliever = findBestItemForNeed('stress', socialActivities);
      }
      
      if (!bestStressReliever) {
        bestStressReliever = findBestItemForNeed('stress', foodItems);
      }
      
      if (bestStressReliever && bestStressReliever.price <= currentWealth) {
        handleConsumeEssential(bestStressReliever);
        actionsTaken++;
      }
    }
    
    // If any actions were taken, update the state and broadcast changes
    if (actionsTaken > 0) {
      // Log to console for debugging
      console.log(`Auto-maintenance addressed ${actionsTaken} needs`);
      
      // Update the lastUpdated timestamp to force synchronized updates
      const currentTimestamp = Date.now();
      useCharacter.setState({ lastUpdated: currentTimestamp });
      
      // Explicitly save state to force update across all components
      const { saveState } = useCharacter.getState();
      if (saveState) {
        saveState();
      }
    }
  };

  // Subscribe to auto-maintain setting changes from Essentials component
  useEffect(() => {
    const handleStorageChange = () => {
      const savedPreference = localStorage.getItem('auto-maintain-needs');
      if (savedPreference !== null) {
        setAutoMaintain(savedPreference === 'true');
      }
    };
    
    // Listen for storage changes (this will catch changes made in the Essentials component)
    window.addEventListener('storage', handleStorageChange);
    
    // Check for changes on a regular basis too (as a backup)
    const checkInterval = setInterval(() => {
      const savedPreference = localStorage.getItem('auto-maintain-needs');
      if (savedPreference !== null && (savedPreference === 'true') !== autoMaintain) {
        setAutoMaintain(savedPreference === 'true');
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [autoMaintain]);

  // Set up the auto-maintenance interval
  useEffect(() => {
    // Only run when auto-maintain is enabled
    if (!autoMaintain) return;
    
    // Run auto-maintenance on a timer
    const interval = setInterval(() => {
      // Get the latest state values
      const currentState = useCharacter.getState();
      
      // Only run auto-maintenance if we need to maintain something
      if (currentState.hunger <= 70 || 
          currentState.thirst <= 70 || 
          currentState.energy <= 70 || 
          currentState.socialConnections <= 70 || 
          currentState.stress >= 50) {
        handleAutoMaintenance();
      }
    }, 1000);
    
    // Run once immediately on mount
    handleAutoMaintenance();
    
    return () => clearInterval(interval);
  }, [autoMaintain]);

  // This component doesn't render anything - it just works in the background
  return null;
}