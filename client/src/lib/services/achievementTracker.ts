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
  const { currentDay, currentMonth, currentYear } = useTime.getState();
  const { updateProgress, getAchievement, unlockAchievement } = useAchievements.getState();
  const { playSuccess } = useAudio.getState();
  
  // Calculate total days passed based on current date (assuming game starts at day 1)
  // Simplified calculation for tracking purposes
  const daysPassed = currentDay + (currentMonth - 1) * 30 + (currentYear - 2023) * 365;
  
  // Getting started achievement
  const startAchievement = getAchievement('general-1');
  if (startAchievement && !startAchievement.isUnlocked) {
    updateProgress('general-1', 1);
    unlockAchievement('general-1');
    playSuccess();
  }
  
  // Time-based achievements
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
  trackPropertyAchievements();
  trackInvestmentAchievements();
  trackLifestyleAchievements();
  trackTimeAchievements();
  trackMagnateAchievement();
};