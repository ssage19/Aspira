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

// Track character development achievements
export const trackCharacterAchievements = () => {
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  const characterState = useCharacter.getState();
  
  // Health Enthusiast (90+ health)
  const healthAchievement = getAchievement('character-1');
  if (healthAchievement && !healthAchievement.isUnlocked) {
    const progress = updateProgress('character-1', characterState.health);
    if (progress >= 100) {
      unlockAchievement('character-1');
      playSuccess();
    }
  }
  
  // Stress Management (below 10 stress)
  const stressAchievement = getAchievement('character-2');
  if (stressAchievement && !stressAchievement.isUnlocked) {
    // For stress, we need reverse logic - lower is better
    // 10 or below stress is 100% progress
    const stressProgress = characterState.stress <= 10 ? 100 : 
      Math.max(0, 100 - ((characterState.stress - 10) * (100 / 90)));
    
    const progress = updateProgress('character-2', stressProgress);
    if (progress >= 100) {
      unlockAchievement('character-2');
      playSuccess();
    }
  }
  
  // Social Butterfly (80+ social connections)
  const socialAchievement = getAchievement('character-3');
  if (socialAchievement && !socialAchievement.isUnlocked) {
    const progress = updateProgress('character-3', characterState.socialConnections);
    if (progress >= 100) {
      unlockAchievement('character-3');
      playSuccess();
    }
  }
  
  // Master of Skills (85+ skills)
  const skillsAchievement = getAchievement('character-4');
  if (skillsAchievement && !skillsAchievement.isUnlocked) {
    const progress = updateProgress('character-4', characterState.skills);
    if (progress >= 100) {
      unlockAchievement('character-4');
      playSuccess();
    }
  }
  
  // Work-Life Balance (50+ free time and 70+ happiness)
  const workLifeAchievement = getAchievement('character-5');
  if (workLifeAchievement && !workLifeAchievement.isUnlocked) {
    // Only 100% if both conditions are met
    const hasEnoughFreeTime = characterState.freeTime >= 50;
    const hasEnoughHappiness = characterState.happiness >= 70;
    
    const progress = hasEnoughFreeTime && hasEnoughHappiness ? 100 : 
      ((characterState.freeTime >= 50 ? 50 : characterState.freeTime) + 
       (characterState.happiness >= 70 ? 50 : characterState.happiness * 0.7)) / 2;
    
    updateProgress('character-5', progress);
    if (progress >= 100) {
      unlockAchievement('character-5');
      playSuccess();
    }
  }
  
  // Environmental Champion (60+ environmental impact)
  const envAchievement = getAchievement('character-6');
  if (envAchievement && !envAchievement.isUnlocked) {
    // Environmental impact can be negative, so adjust the scale
    // from -100 to 100 to 0 to 100 for progress tracking
    const adjustedImpact = (characterState.environmentalImpact + 100) / 2;
    const progress = updateProgress('character-6', adjustedImpact);
    if (progress >= 100) {
      unlockAchievement('character-6');
      playSuccess();
    }
  }
  
  // Balanced Life (70+ in health, social, and skills)
  const balancedAchievement = getAchievement('character-7');
  if (balancedAchievement && !balancedAchievement.isUnlocked) {
    const hasBalancedHealth = characterState.health >= 70;
    const hasBalancedSocial = characterState.socialConnections >= 70;
    const hasBalancedSkills = characterState.skills >= 70;
    
    // Only 100% if all conditions are met
    const progress = hasBalancedHealth && hasBalancedSocial && hasBalancedSkills ? 100 :
      (((characterState.health >= 70 ? 33.33 : characterState.health * 0.47)) +
       ((characterState.socialConnections >= 70 ? 33.33 : characterState.socialConnections * 0.47)) +
       ((characterState.skills >= 70 ? 33.33 : characterState.skills * 0.47)));
    
    updateProgress('character-7', progress);
    if (progress >= 100) {
      unlockAchievement('character-7');
      playSuccess();
    }
  }
};

// Track property achievements
export const trackPropertyAchievements = () => {
  const { properties } = useCharacter.getState();
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Property count achievement
  const propertyCount = properties.length;
  const propertyIds = ['property-1', 'property-2'];
  
  propertyIds.forEach(id => {
    const achievement = getAchievement(id);
    if (achievement && !achievement.isUnlocked) {
      const progress = updateProgress(id, propertyCount);
      if (progress >= 100) {
        unlockAchievement(id);
        playSuccess();
      }
    }
  });
  
  // Property combined value achievement (property-3)
  const propertiesValue = properties.reduce((sum, property) => sum + property.value, 0);
  const propertyCountAndValue = properties.length >= 10 ? propertiesValue : 0;
  
  const achievement = getAchievement('property-3');
  if (achievement && !achievement.isUnlocked) {
    const progress = updateProgress('property-3', propertyCountAndValue);
    if (progress >= 100) {
      unlockAchievement('property-3');
      playSuccess();
    }
  }
};

// Track investment achievements
export const trackInvestmentAchievements = () => {
  const { assets } = useCharacter.getState();
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // First investment achievement
  const hasInvestments = assets.length > 0;
  if (hasInvestments) {
    const achievement = getAchievement('investment-1');
    if (achievement && !achievement.isUnlocked) {
      updateProgress('investment-1', 1);
      unlockAchievement('investment-1');
      playSuccess();
    }
  }
  
  // Multiple assets achievement
  const uniqueAssetTypes = new Set(assets.map(asset => asset.id));
  const diversityCount = uniqueAssetTypes.size;
  
  const diversityAchievement = getAchievement('investment-2');
  if (diversityAchievement && !diversityAchievement.isUnlocked) {
    const progress = updateProgress('investment-2', diversityCount);
    if (progress >= 100) {
      unlockAchievement('investment-2');
      playSuccess();
    }
  }
  
  // Investment value achievement
  const investmentValue = assets.reduce((sum, asset) => sum + (asset.purchasePrice * asset.quantity), 0);
  
  const valueAchievement = getAchievement('investment-3');
  if (valueAchievement && !valueAchievement.isUnlocked) {
    const progress = updateProgress('investment-3', investmentValue);
    if (progress >= 100) {
      unlockAchievement('investment-3');
      playSuccess();
    }
  }
};

// Track lifestyle achievements
export const trackLifestyleAchievements = () => {
  const { lifestyleItems } = useCharacter.getState();
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // First lifestyle item achievement
  const hasLifestyleItems = lifestyleItems.length > 0;
  if (hasLifestyleItems) {
    const achievement = getAchievement('lifestyle-1');
    if (achievement && !achievement.isUnlocked) {
      updateProgress('lifestyle-1', 1);
      unlockAchievement('lifestyle-1');
      playSuccess();
    }
  }
  
  // Multiple lifestyle items achievement
  const itemCount = lifestyleItems.length;
  
  const countAchievement = getAchievement('lifestyle-2');
  if (countAchievement && !countAchievement.isUnlocked) {
    const progress = updateProgress('lifestyle-2', itemCount);
    if (progress >= 100) {
      unlockAchievement('lifestyle-2');
      playSuccess();
    }
  }
  
  // Luxury items value achievement
  const luxuryItemsValue = lifestyleItems.reduce((sum, item) => sum + item.purchasePrice, 0);
  const luxuryCountAndValue = lifestyleItems.length >= 10 ? luxuryItemsValue : 0;
  
  const valueAchievement = getAchievement('lifestyle-3');
  if (valueAchievement && !valueAchievement.isUnlocked) {
    const progress = updateProgress('lifestyle-3', luxuryCountAndValue);
    if (progress >= 100) {
      unlockAchievement('lifestyle-3');
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

// Track magnate achievement (maxed out stats)
export const trackMagnateAchievement = () => {
  const { wealth, happiness, prestige } = useCharacter.getState();
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Check for high wealth, happiness, and prestige
  const isWealthyEnough = wealth >= 10000000; // $10M+
  const isHappyEnough = happiness >= 90;
  const hasHighPrestige = prestige >= 75;
  
  const overallProgress = isWealthyEnough && isHappyEnough && hasHighPrestige ? 100 : 
    Math.floor((
      (Math.min(wealth, 10000000) / 10000000 * 100) +
      (Math.min(happiness, 90) / 90 * 100) +
      (Math.min(prestige, 75) / 75 * 100)
    ) / 3);
  
  const achievement = getAchievement('general-4');
  if (achievement && !achievement.isUnlocked) {
    const progress = updateProgress('general-4', overallProgress);
    if (progress >= 100) {
      unlockAchievement('general-4');
      playSuccess();
    }
  }
};

// Main function to check all achievements
export const checkAllAchievements = () => {
  const { wealth } = useCharacter.getState();
  
  trackWealthAchievements(wealth);
  trackCharacterAchievements(); // Added character development achievements
  trackPropertyAchievements();
  trackInvestmentAchievements();
  trackLifestyleAchievements();
  trackTimeAchievements();
  trackMagnateAchievement();
};