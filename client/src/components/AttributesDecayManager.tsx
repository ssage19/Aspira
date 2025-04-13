import { useEffect } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useNotification } from '../lib/stores/useNotification';
import { useAudio } from '../lib/stores/useAudio';

/**
 * AttributesDecayManager - A component that manages the dynamic decay of character attributes
 * 
 * This invisible component handles:
 * 1. Natural decay of happiness over time
 * 2. Stress accumulation based on various factors
 * 3. Time management challenges that require player intervention
 * 4. Interactions between attributes (stress affects happiness, etc.)
 * 5. Random events that impact these attributes
 * 
 * No UI is rendered - this component works in the background
 */
export function AttributesDecayManager() {
  const { 
    // Character attributes
    stress, 
    addStress,
    happiness,
    addHappiness,
    // Basic needs
    hunger,
    thirst,
    energy,
    comfort,
    // Living situation
    housingType,
    vehicleType,
    // Time commitment
    timeCommitment,
    freeTime,
    // Job
    job,
    // Internal tracking state
    addTimeCommitment,
    updateFreeTime,
  } = useCharacter();
  
  const { 
    gameTime, 
    currentDay,
    previousGameDay,
    daysPassed,
    advanceTime
  } = useTime();
  
  const { showNotification } = useNotification();
  const { playSound } = useAudio();
  
  // Track last check time for hourly effects
  const hourlyEffectsInterval = 3; // Apply effects every 3 hours of game time
  
  // Daily effects should run once per day
  useEffect(() => {
    if (currentDay && previousGameDay && currentDay !== previousGameDay) {
      // Day has changed, apply daily effects
      applyDailyEffects();
    }
  }, [currentDay, previousGameDay]);
  
  // Hourly effects run on a timer
  useEffect(() => {
    if (!gameTime) return;
    
    const hourOfDay = gameTime.getHours();
    
    // Run hourly effects at specific intervals
    if (hourOfDay % hourlyEffectsInterval === 0) {
      // Only run each hour once
      const timeKey = `${gameTime.toISOString().split('T')[0]}-${hourOfDay}`;
      const hasRunThisHour = localStorage.getItem(`hourly-effects-${timeKey}`);
      
      if (!hasRunThisHour) {
        applyHourlyEffects();
        localStorage.setItem(`hourly-effects-${timeKey}`, 'true');
      }
    }
    
    // Check for critical attribute values
    checkCriticalAttributeValues();
  }, [gameTime]);
  
  /**
   * Apply daily effects to character attributes
   * These are larger changes that happen once per day
   */
  const applyDailyEffects = () => {
    console.log("Applying daily attribute effects");
    
    // BASE DECAY RATES (daily)
    const baseHappinessDecay = -3; // Base happiness decays by 3 points per day
    const baseStressIncrease = 2;  // Base stress increases by 2 points per day
    
    // HOUSING MODIFIERS
    let housingHappinessModifier = 0;
    let housingStressModifier = 0;
    
    switch (housingType) {
      case 'homeless':
        housingHappinessModifier = -3; // -3 happiness/day for being homeless
        housingStressModifier = 4;     // +4 stress/day for being homeless
        break;
      case 'shared':
        housingHappinessModifier = -1; // -1 happiness/day for shared housing
        housingStressModifier = 2;     // +2 stress/day for shared housing
        break;
      case 'rental':
        housingHappinessModifier = 0;  // Neutral for rental
        housingStressModifier = 0;     // Neutral for rental
        break;
      case 'owned':
        housingHappinessModifier = 1;  // +1 happiness/day for owned home
        housingStressModifier = -1;    // -1 stress/day for owned home
        break;
      case 'luxury':
        housingHappinessModifier = 2;  // +2 happiness/day for luxury housing
        housingStressModifier = -2;    // -2 stress/day for luxury housing
        break;
    }
    
    // TRANSPORTATION MODIFIERS
    let transportHappinessModifier = 0;
    let transportStressModifier = 0;
    
    switch (vehicleType) {
      case 'none':
        transportHappinessModifier = -1; // -1 happiness/day for no vehicle
        transportStressModifier = 2;     // +2 stress/day for no vehicle
        break;
      case 'bicycle':
        transportHappinessModifier = 0;  // Neutral for bicycle
        transportStressModifier = 1;     // +1 stress/day for bicycle (exercise helps but weather/distance can add stress)
        break;
      case 'economy':
        transportHappinessModifier = 0;  // Neutral for economy
        transportStressModifier = 0;     // Neutral for economy
        break;
      case 'standard':
        transportHappinessModifier = 1;  // +1 happiness/day for standard
        transportStressModifier = -1;    // -1 stress/day for standard
        break;
      case 'luxury':
        transportHappinessModifier = 2;  // +2 happiness/day for luxury
        transportStressModifier = -2;    // -2 stress/day for luxury
        break;
      case 'premium':
        transportHappinessModifier = 3;  // +3 happiness/day for premium
        transportStressModifier = -3;    // -3 stress/day for premium
        break;
    }
    
    // WORK-LIFE BALANCE MODIFIERS
    let workLifeBalanceHappinessModifier = 0;
    let workLifeBalanceStressModifier = 0;
    
    const freeTimeRatio = freeTime / (timeCommitment || 1);
    
    if (freeTimeRatio < 0.2) {
      // Very poor work-life balance (less than 1:5 ratio)
      workLifeBalanceHappinessModifier = -4; // -4 happiness/day
      workLifeBalanceStressModifier = 5;     // +5 stress/day
      
      // Notify the player about work-life balance issues
      showNotification({
        title: 'Work-Life Balance',
        message: 'You have very little free time. Your happiness is declining rapidly.',
        type: 'warning'
      });
      
    } else if (freeTimeRatio < 0.5) {
      // Poor work-life balance
      workLifeBalanceHappinessModifier = -2; // -2 happiness/day
      workLifeBalanceStressModifier = 3;     // +3 stress/day
      
    } else if (freeTimeRatio < 1) {
      // Moderate work-life balance
      workLifeBalanceHappinessModifier = -1; // -1 happiness/day
      workLifeBalanceStressModifier = 1;     // +1 stress/day
      
    } else if (freeTimeRatio >= 1 && freeTimeRatio < 2) {
      // Good work-life balance
      workLifeBalanceHappinessModifier = 1;  // +1 happiness/day
      workLifeBalanceStressModifier = -1;    // -1 stress/day
      
    } else if (freeTimeRatio >= 2) {
      // Excellent work-life balance
      workLifeBalanceHappinessModifier = 2;  // +2 happiness/day
      workLifeBalanceStressModifier = -2;    // -2 stress/day
    }
    
    // BASIC NEEDS MODIFIERS
    let basicNeedsHappinessModifier = 0;
    let basicNeedsStressModifier = 0;
    
    // Check for poor basic needs satisfaction
    if (hunger < 30 || thirst < 30 || energy < 30 || comfort < 30) {
      // At least one need is critically low
      basicNeedsHappinessModifier = -4; // -4 happiness/day
      basicNeedsStressModifier = 4;     // +4 stress/day
      
      // Notify the player about critical basic needs
      const criticalNeeds = [];
      if (hunger < 30) criticalNeeds.push('hunger');
      if (thirst < 30) criticalNeeds.push('thirst');
      if (energy < 30) criticalNeeds.push('energy');
      if (comfort < 30) criticalNeeds.push('comfort');
      
      showNotification({
        title: 'Basic Needs Alert',
        message: `Your ${criticalNeeds.join(', ')} ${criticalNeeds.length > 1 ? 'are' : 'is'} critically low, affecting your well-being.`,
        type: 'error'
      });
      
    } else if (hunger < 50 || thirst < 50 || energy < 50 || comfort < 50) {
      // At least one need is moderately low
      basicNeedsHappinessModifier = -2; // -2 happiness/day
      basicNeedsStressModifier = 2;     // +2 stress/day
    }
    
    // JOB STRESS MODIFIERS
    let jobStressModifier = 0;
    let jobHappinessModifier = 0;
    
    if (job) {
      // Apply job-related stress based on job properties
      jobStressModifier = job.stress / 20; // Scale job stress (0-100) to daily impact (0-5)
      jobHappinessModifier = job.happinessImpact / 20; // Scale job happiness impact
    }
    
    // APPLY TOTAL DAILY EFFECTS
    
    // Calculate total happiness change
    const totalHappinessChange = 
      baseHappinessDecay + 
      housingHappinessModifier + 
      transportHappinessModifier + 
      workLifeBalanceHappinessModifier + 
      basicNeedsHappinessModifier +
      jobHappinessModifier;
    
    // Calculate total stress change
    const totalStressChange = 
      baseStressIncrease + 
      housingStressModifier + 
      transportStressModifier + 
      workLifeBalanceStressModifier + 
      basicNeedsStressModifier +
      jobStressModifier;
    
    // Apply changes
    addHappiness(totalHappinessChange);
    addStress(totalStressChange);
    
    // Log changes for debugging
    console.log(`Daily attribute changes - Happiness: ${totalHappinessChange}, Stress: ${totalStressChange}`);
    console.log(`Happiness breakdown - Base: ${baseHappinessDecay}, Housing: ${housingHappinessModifier}, Transport: ${transportHappinessModifier}, Work-Life: ${workLifeBalanceHappinessModifier}, Basic Needs: ${basicNeedsHappinessModifier}, Job: ${jobHappinessModifier}`);
    console.log(`Stress breakdown - Base: ${baseStressIncrease}, Housing: ${housingStressModifier}, Transport: ${transportStressModifier}, Work-Life: ${workLifeBalanceStressModifier}, Basic Needs: ${basicNeedsStressModifier}, Job: ${jobStressModifier}`);
    
    // For very high stress, apply additional happiness penalty
    if (stress > 80) {
      addHappiness(-2); // High stress causes additional happiness loss
      
      showNotification({
        title: 'Stress Warning',
        message: 'Your extreme stress levels are significantly affecting your happiness.',
        type: 'warning'
      });
    }
    
    // Dynamic time commitment adjustments
    // On some days, add a random amount of time commitment to simulate
    // unexpected responsibilities and emergencies
    if (Math.random() < 0.3) { // 30% chance each day
      const extraCommitment = Math.floor(Math.random() * 5) + 1; // 1-5 hours
      addTimeCommitment(extraCommitment);
      
      showNotification({
        title: 'Unexpected Responsibilities',
        message: `You had to handle unexpected tasks today requiring ${extraCommitment} hours.`,
        type: 'info'
      });
      
      console.log(`Added ${extraCommitment} hours of unexpected time commitment`);
    }
    
    // Occasionally restore some free time (rest days, efficient days)
    if (Math.random() < 0.2) { // 20% chance each day
      const extraFreeTime = Math.floor(Math.random() * 3) + 1; // 1-3 hours
      updateFreeTime(extraFreeTime);
      
      showNotification({
        title: 'Extra Free Time',
        message: `You managed to free up ${extraFreeTime} extra hours today.`,
        type: 'success'
      });
      
      console.log(`Added ${extraFreeTime} hours of extra free time`);
    }
  };
  
  /**
   * Apply hourly effects to character attributes
   * These are smaller changes that happen throughout the day
   */
  const applyHourlyEffects = () => {
    console.log("Applying hourly attribute effects");
    
    // Smaller changes happen throughout the day
    
    // Minor happiness decay
    const hourlyHappinessDecay = -0.2;
    addHappiness(hourlyHappinessDecay);
    
    // Minor stress increase, with random variation
    const baseHourlyStressIncrease = 0.1;
    const randomFactor = (Math.random() * 0.3) - 0.1; // -0.1 to +0.2
    const hourlyStressIncrease = baseHourlyStressIncrease + randomFactor;
    addStress(hourlyStressIncrease);
    
    // Happiness boost during certain hours (leisure time)
    const hourOfDay = gameTime?.getHours() || 0;
    if (hourOfDay >= 18 && hourOfDay <= 22) {
      // Evening leisure time - slight happiness boost
      addHappiness(0.3);
      addStress(-0.2);
    }
    
    // Rush hour stress
    if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 16 && hourOfDay <= 18)) {
      // Rush hour - extra stress
      const rushHourStress = vehicleType === 'none' || vehicleType === 'bicycle' ? 0.1 : 0.3;
      addStress(rushHourStress);
    }
    
    // Basic needs impact on hourly basis
    if (hunger < 30 || thirst < 30 || energy < 30) {
      // Unfulfilled basic needs cause stress and reduce happiness
      addStress(0.3);
      addHappiness(-0.3);
    }
    
    // Random stressful events during work hours
    if (hourOfDay >= 9 && hourOfDay <= 17 && Math.random() < 0.1) {
      // 10% chance of a minor stressful event during work hours
      const stressfulEvent = [
        "A challenging email arrived in your inbox.",
        "Your colleague missed a deadline, affecting your work.",
        "A meeting ran overtime, pushing back your schedule.",
        "You encountered an unexpected problem in your project.",
        "Your boss added a last-minute request to your tasks."
      ];
      
      const eventIndex = Math.floor(Math.random() * stressfulEvent.length);
      const stressIncrease = Math.floor(Math.random() * 3) + 1; // 1-3 stress points
      
      addStress(stressIncrease);
      
      // Only show notification for more significant events (stress > 1)
      if (stressIncrease > 1) {
        showNotification({
          title: 'Stressful Moment',
          message: stressfulEvent[eventIndex],
          type: 'info'
        });
      }
    }
    
    // Random positive events (less frequent)
    if (Math.random() < 0.05) {
      // 5% chance of a positive event
      const positiveEvent = [
        "You received a compliment from someone.",
        "You finished a task faster than expected.",
        "You had a pleasant conversation with a friend.",
        "You enjoyed a perfect cup of coffee.",
        "You found a moment of peace in your busy day."
      ];
      
      const eventIndex = Math.floor(Math.random() * positiveEvent.length);
      const happinessIncrease = Math.floor(Math.random() * 2) + 1; // 1-2 happiness points
      
      addHappiness(happinessIncrease);
      addStress(-0.5); // Small stress reduction
      
      // Only show notification for more significant events
      if (happinessIncrease > 1) {
        showNotification({
          title: 'Pleasant Moment',
          message: positiveEvent[eventIndex],
          type: 'success'
        });
      }
    }
  };
  
  /**
   * Check for critical attribute values and notify the player
   */
  const checkCriticalAttributeValues = () => {
    // Critical stress levels
    if (stress > 90 && Math.random() < 0.5) {
      showNotification({
        title: 'Critical Stress Level',
        message: 'Your stress levels are extremely high! Take immediate action to reduce stress.',
        type: 'error'
      });
      playSound('error');
    } else if (stress > 75 && Math.random() < 0.3) {
      showNotification({
        title: 'High Stress Warning',
        message: 'Your stress levels are very high. Consider ways to reduce stress.',
        type: 'warning'
      });
    }
    
    // Critical happiness levels
    if (happiness < 20 && Math.random() < 0.5) {
      showNotification({
        title: 'Critical Happiness Level',
        message: 'Your happiness has dropped to a dangerous level. Take action to improve it!',
        type: 'error'
      });
      playSound('error');
    } else if (happiness < 35 && Math.random() < 0.3) {
      showNotification({
        title: 'Low Happiness Warning',
        message: 'Your happiness levels are very low. Try to do something enjoyable.',
        type: 'warning'
      });
    }
    
    // Critical time management
    const freeTimeRatio = freeTime / (timeCommitment || 1);
    if (freeTimeRatio < 0.1 && Math.random() < 0.5) {
      showNotification({
        title: 'Critical Time Management',
        message: 'You have almost no free time! This is unsustainable for your well-being.',
        type: 'error'
      });
      playSound('error');
    } else if (freeTimeRatio < 0.25 && Math.random() < 0.3) {
      showNotification({
        title: 'Poor Time Management',
        message: 'Your free time is very limited. Try to adjust your commitments.',
        type: 'warning'
      });
    }
  };
  
  // This component does not render any UI
  return null;
}