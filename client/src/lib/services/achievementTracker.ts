import { useAchievements } from '../stores/useAchievements';
import { useCharacter } from '../stores/useCharacter';
import { useTime } from '../stores/useTime';
import { useAudio } from '../stores/useAudio';

/**
 * Achievement Tracker Service
 * 
 * This service coordinates achievement tracking across the application.
 * It provides methods to track various achievements based on game actions.
 */

// Track wealth achievements
export const trackWealthAchievements = (currentWealth: number) => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Track wealth milestones
  const wealthIds = ['wealth-1', 'wealth-2', 'wealth-3', 'wealth-4', 'wealth-5'];
  
  wealthIds.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, currentWealth);
      if (progress >= 100 && !achievement.isUnlocked) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
};

// Track net worth achievements
export const trackNetWorthAchievements = (currentNetWorth: number) => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Track net worth milestones
  const netWorthIds = ['networth-1', 'networth-2', 'networth-3', 'networth-4', 'networth-5'];
  
  netWorthIds.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, currentNetWorth);
      if (progress >= 100 && !achievement.isUnlocked) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
};

// Track properties achievements
export const trackPropertyAchievements = (properties: any[]) => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Count properties by type
  const propertyTypes: Record<string, number> = {
    residential: 0,
    commercial: 0,
    industrial: 0,
    mansion: 0
  };
  
  properties.forEach(property => {
    if (property.type in propertyTypes) {
      propertyTypes[property.type]++;
    }
  });
  
  // Track total properties achievement
  const totalProperties = properties.length;
  const propertyAchievements = ['property-1', 'property-2', 'property-3'];
  
  propertyAchievements.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, totalProperties);
      if (progress >= 100) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
  
  // Track specific property type achievements
  if (propertyTypes.residential >= 5) {
    const id = 'property-type-1';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  if (propertyTypes.commercial >= 3) {
    const id = 'property-type-2';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  if (propertyTypes.industrial >= 2) {
    const id = 'property-type-3';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  if (propertyTypes.mansion >= 1) {
    const id = 'property-type-4';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
};

// Track asset achievements
export const trackAssetAchievements = (assets: any[]) => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Count assets by type
  const assetTypes: Record<string, number> = {
    stock: 0,
    bond: 0,
    crypto: 0,
    other: 0
  };
  
  let totalValue = 0;
  
  assets.forEach(asset => {
    if (asset.type in assetTypes) {
      assetTypes[asset.type]++;
    }
    
    totalValue += asset.currentPrice * asset.quantity;
  });
  
  // Track total assets achievement
  const totalAssets = assets.length;
  const assetAchievements = ['asset-1', 'asset-2', 'asset-3'];
  
  assetAchievements.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, totalAssets);
      if (progress >= 100) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
  
  // Track investment-specific achievements
  const investmentAchievements = ['investment-1', 'investment-2', 'investment-3'];
  
  // Check if we have any stocks
  if (assetTypes.stock > 0) {
    const achievement = getAchievement('investment-1');
    if (achievement && !achievement.isUnlocked) {
      // This is the "Novice Investor" achievement - "Make your first stock purchase"
      const progress = updateProgress('investment-1', 1);
      if (progress >= 100) {
        console.log("Unlocking Novice Investor achievement!");
        unlockAchievement('investment-1');
        playSuccess();
      }
    }
  }
  
  // Check if we have 5 different assets for "Portfolio Manager" achievement
  const uniqueAssetCount = Object.values(assetTypes).filter(count => count > 0).length;
  const portfolioManagerAchievement = getAchievement('investment-2');
  if (portfolioManagerAchievement && !portfolioManagerAchievement.isUnlocked) {
    const progress = updateProgress('investment-2', uniqueAssetCount);
    if (progress >= 100) {
      unlockAchievement('investment-2');
      playSuccess();
    }
  }
  
  // Check investment value for "Investment Guru" achievement
  const investmentGuruAchievement = getAchievement('investment-3');
  if (investmentGuruAchievement && !investmentGuruAchievement.isUnlocked) {
    const progress = updateProgress('investment-3', totalValue);
    if (progress >= 100) {
      unlockAchievement('investment-3');
      playSuccess();
    }
  }
  
  // Track asset portfolio value
  const portfolioValueAchievements = ['asset-value-1', 'asset-value-2', 'asset-value-3'];
  
  portfolioValueAchievements.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, totalValue);
      if (progress >= 100) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
};

// Track income achievements
export const trackIncomeAchievements = (currentIncome: number) => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Track income milestones
  const incomeIds = ['income-1', 'income-2', 'income-3', 'income-4'];
  
  incomeIds.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, currentIncome);
      if (progress >= 100) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
};

// Track career achievements
export const trackCareerAchievements = (job: any, jobHistory: any[]) => {
  const { getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  if (!job) return;
  
  // Track career level achievements
  if (job.level >= 3) {
    const id = 'career-1';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  if (job.level >= 5) {
    const id = 'career-2';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  // Track career changes
  if (jobHistory.length >= 3) {
    const id = 'career-3';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
};

// Track general/time-based achievements
export const trackTimeAchievements = () => {
  // Use "any" as a temporary workaround until the TypeScript errors are fixed
  const state = useTime.getState() as any;
  const { currentDay, currentMonth, currentYear } = state;
  
  // Use default values if the start date properties aren't available yet
  const startDay = state.startDay || currentDay;
  const startMonth = state.startMonth || currentMonth;
  const startYear = state.startYear || currentYear;
  
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Calculate total days passed since game start
  // Convert both dates to days and subtract
  const startTotalDays = startDay + (startMonth - 1) * 30 + (startYear - 2023) * 365;
  const currentTotalDays = currentDay + (currentMonth - 1) * 30 + (currentYear - 2023) * 365;
  const daysPassed = Math.max(0, currentTotalDays - startTotalDays);
  
  // For time-based achievements
  const timeAchievementIds = ['general-2', 'general-3'];
  
  timeAchievementIds.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, daysPassed);
      if (progress >= 100) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
  
  // Only unlock Getting Started achievement (general-1) after explicitly advancing time
  const startAchievement = getAchievement('general-1');
  
  // Checking for a progress of at least 1 day indicates user interaction with the time system
  if (startAchievement && !startAchievement.isUnlocked && daysPassed >= 1) {
    updateProgress('general-1', 1);
    unlockAchievement('general-1');
    playSuccess();
  }
};

// Track lifestyle achievements
export const trackLifestyleAchievements = (lifestyleItems: any[]) => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Count lifestyle items by type
  const itemTypes: Record<string, number> = {
    housing: 0,
    transportation: 0,
    hobbies: 0,
    subscriptions: 0,
    luxury: 0
  };
  
  lifestyleItems.forEach(item => {
    if (item.type in itemTypes) {
      itemTypes[item.type]++;
    }
  });
  
  // Track total lifestyle items
  const totalItems = lifestyleItems.length;
  const lifestyleAchievements = ['lifestyle-1', 'lifestyle-2', 'lifestyle-3'];
  
  lifestyleAchievements.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, totalItems);
      if (progress >= 100) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
  
  // Track specific lifestyle type achievements
  if (itemTypes.luxury >= 3) {
    const id = 'lifestyle-type-1';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  if (itemTypes.hobbies >= 2) {
    const id = 'lifestyle-type-2';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
};

// Track character attribute achievements
export const trackAttributeAchievements = (attributes: any) => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Happiness achievements
  if (attributes.happiness >= 80) {
    const id = 'character-1';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  // Health achievements
  if (attributes.health >= 90) {
    const id = 'character-2';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  // Prestige achievements
  if (attributes.prestige >= 75) {
    const id = 'character-3';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  // Social connections achievements
  if (attributes.socialConnections >= 85) {
    const id = 'character-4';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  // Environmental impact achievements
  if (attributes.environmentalImpact >= 50) {
    const id = 'character-5';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
};

// Track skill achievements
export const trackSkillAchievements = (skills: any) => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Calculate average skill level
  const totalSkill = skills.intelligence + skills.creativity + skills.charisma + 
                    skills.technical + skills.leadership;
  const avgSkill = totalSkill / 5;
  
  // Overall skill achievements
  if (avgSkill >= 70) {
    const id = 'skill-1';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  if (avgSkill >= 90) {
    const id = 'skill-2';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  // Individual skill achievements
  if (skills.intelligence >= 80) {
    const id = 'skill-intel-1';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  if (skills.creativity >= 80) {
    const id = 'skill-creative-1';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
  
  if (skills.leadership >= 80) {
    const id = 'skill-leader-1';
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      unlockAchievement(id);
      playSuccess();
    }
  }
};

// Check all achievements
export const checkAllAchievements = () => {
  const characterState = useCharacter.getState();
  
  trackWealthAchievements(characterState.wealth);
  trackNetWorthAchievements(characterState.netWorth);
  trackPropertyAchievements(characterState.properties);
  trackAssetAchievements(characterState.assets);
  trackIncomeAchievements(characterState.income);
  trackCareerAchievements(characterState.job, characterState.jobHistory);
  trackTimeAchievements();
  trackLifestyleAchievements(characterState.lifestyleItems);
  
  // Track character attribute achievements
  trackAttributeAchievements({
    happiness: characterState.happiness,
    health: characterState.health,
    prestige: characterState.prestige,
    socialConnections: characterState.socialConnections,
    environmentalImpact: characterState.environmentalImpact
  });
  
  trackSkillAchievements(characterState.skills);
};