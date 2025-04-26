import { useEffect } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useNotification } from '../lib/stores/useNotification';
// Audio removed

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
    health,
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
    // Social
    socialConnections,
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
  // Audio removed
  const playSound = () => {};
  
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
    
    // WORK-LIFE BALANCE MODIFIERS - IMPROVED SYSTEM
    let workLifeBalanceHappinessModifier = 0;
    let workLifeBalanceStressModifier = 0;
    
    // Calculate free time ratio - now with a minimum buffer to prevent extreme negative effects
    const effectiveTimeCommitment = Math.max(timeCommitment, 4); // Ensures minimum reasonable commitment
    const freeTimeRatio = freeTime / effectiveTimeCommitment;
    
    // More forgiving thresholds and reduced negative impacts
    if (freeTimeRatio < 0.15) {
      // Very poor work-life balance (less than 1:6.67 ratio)
      workLifeBalanceHappinessModifier = -3; // Reduced from -4
      workLifeBalanceStressModifier = 4;     // Reduced from 5
      
      console.log('Poor work-life balance: very little free time affecting happiness and stress');
      
    } else if (freeTimeRatio < 0.33) { // More forgiving threshold (was 0.5)
      // Poor work-life balance
      workLifeBalanceHappinessModifier = -1; // Reduced from -2
      workLifeBalanceStressModifier = 2;     // Reduced from 3
      
    } else if (freeTimeRatio < 0.75) { // More forgiving threshold (was 1.0)
      // Moderate work-life balance
      workLifeBalanceHappinessModifier = -0.5; // Reduced from -1
      workLifeBalanceStressModifier = 0.5;     // Reduced from 1
      
    } else if (freeTimeRatio >= 0.75 && freeTimeRatio < 1.5) { // More forgiving threshold (was 1.0-2.0)
      // Good work-life balance
      workLifeBalanceHappinessModifier = 1;  // Same
      workLifeBalanceStressModifier = -1;    // Same
      
    } else if (freeTimeRatio >= 1.5) { // More forgiving threshold (was 2.0)
      // Excellent work-life balance
      workLifeBalanceHappinessModifier = 3;  // Increased from 2
      workLifeBalanceStressModifier = -3;    // Increased from -2
    }
    
    // BASIC NEEDS MODIFIERS
    let basicNeedsHappinessModifier = 0;
    let basicNeedsStressModifier = 0;
    
    // Check for poor basic needs satisfaction
    if (hunger < 30 || thirst < 30 || energy < 30 || comfort < 30) {
      // At least one need is critically low
      basicNeedsHappinessModifier = -4; // -4 happiness/day
      basicNeedsStressModifier = 4;     // +4 stress/day
      
      // Removed notification but still log critical needs for debugging
      const criticalNeeds = [];
      if (hunger < 30) criticalNeeds.push('hunger');
      if (thirst < 30) criticalNeeds.push('thirst');
      if (energy < 30) criticalNeeds.push('energy');
      if (comfort < 30) criticalNeeds.push('comfort');
      
      console.log(`Basic needs alert: ${criticalNeeds.join(', ')} ${criticalNeeds.length > 1 ? 'are' : 'is'} critically low, affecting well-being`);
      
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
    
    // HEALTH & SOCIAL MODIFIERS for happiness
    let healthHappinessModifier = 0;
    let socialHappinessModifier = 0;
    
    // Health impacts happiness
    if (health < 30) {
      healthHappinessModifier = -4; // Poor health severely impacts happiness
      console.log('Health warning: poor health severely affecting happiness');
    } else if (health < 50) {
      healthHappinessModifier = -2; // Below average health moderately impacts happiness
    } else if (health > 80) {
      healthHappinessModifier = 2; // Excellent health boosts happiness
    }
    
    // Social connections impact happiness
    if (socialConnections < 30) {
      socialHappinessModifier = -3; // Limited social network severely impacts happiness
      console.log('Social warning: limited social connections affecting happiness');
    } else if (socialConnections < 50) {
      socialHappinessModifier = -1; // Below average social connections moderately impact happiness
    } else if (socialConnections > 75) {
      socialHappinessModifier = 2; // Strong social network boosts happiness
    }
    
    // APPLY TOTAL DAILY EFFECTS
    
    // Calculate total happiness change with new factors
    const totalHappinessChange = 
      baseHappinessDecay + 
      housingHappinessModifier + 
      transportHappinessModifier + 
      workLifeBalanceHappinessModifier + 
      basicNeedsHappinessModifier +
      jobHappinessModifier +
      healthHappinessModifier +
      socialHappinessModifier;
    
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
    console.log(`Happiness breakdown - Base: ${baseHappinessDecay}, Housing: ${housingHappinessModifier}, Transport: ${transportHappinessModifier}, Work-Life: ${workLifeBalanceHappinessModifier}, Basic Needs: ${basicNeedsHappinessModifier}, Job: ${jobHappinessModifier}, Health: ${healthHappinessModifier}, Social: ${socialHappinessModifier}`);
    console.log(`Stress breakdown - Base: ${baseStressIncrease}, Housing: ${housingStressModifier}, Transport: ${transportStressModifier}, Work-Life: ${workLifeBalanceStressModifier}, Basic Needs: ${basicNeedsStressModifier}, Job: ${jobStressModifier}`);
    
    // For very high stress, apply additional happiness penalty
    if (stress > 80) {
      addHappiness(-2); // High stress causes additional happiness loss
      
      // Removed notification but still log for debugging
      console.log('Stress warning: extreme stress levels significantly affecting happiness');
    }
    
    // WEEKLY TIME REBALANCING SYSTEM
    // Every day, we'll check if we need to adjust time commitments to keep them realistic
    
    // Get the current day of the week (0-6, 0 is Sunday)
    const dayOfWeek = gameTime?.getDay() || 0;
    
    // DAILY TIME RESET/BALANCING
    // Instead of endless accumulation, implement a more realistic weekly cycle
    
    // Define a reasonable range for time commitments (40-80 hours per week)
    const minTimeCommitment = 40; // Minimum reasonable commitment (standard work week)
    const maxTimeCommitment = 80; // Maximum reasonable commitment (busy professional)
    
    // Every Monday (day 1), reset time commitments to a reasonable baseline
    // This simulates a new weekly schedule
    if (dayOfWeek === 1) { // Monday
      // Calculate a baseline time commitment based on character's job
      // Use the current commitment as a baseline, but ensure it's within reasonable ranges
      const baselineCommitment = job ? 
        Math.min(maxTimeCommitment, Math.max(minTimeCommitment, 
          Math.round(job.timeCommitment + (job.stress * 0.2)))) : // 40-60 hours based on job
        minTimeCommitment; // Default 40 hours if no job
      
      // Calculate the needed change
      const currentCommitment = timeCommitment;
      const neededChange = baselineCommitment - currentCommitment;
      
      if (Math.abs(neededChange) > 5) {
        // Reset time commitment to the baseline if it's drifted too far
        if (neededChange > 0) {
          addTimeCommitment(neededChange);
          console.log(`Weekly reset: Added ${neededChange} hours to time commitment (new week schedule). New commitment: ${baselineCommitment}`);
        } else {
          const reduction = Math.abs(neededChange);
          // Use imported function to reduce time commitment
          const { reduceTimeCommitment } = useCharacter.getState();
          reduceTimeCommitment(reduction);
          console.log(`Weekly reset: Reduced time commitment by ${reduction} hours (new week schedule). New commitment: ${baselineCommitment}`);
        }
      }
    }
    
    // RANDOM DAILY EVENTS that affect time
    
    // Random unexpected time commitments (meetings, emergencies, etc)
    if (Math.random() < 0.2) { // 20% chance each day
      const extraCommitment = Math.floor(Math.random() * 3) + 1; // 1-3 hours
      
      // Make sure we don't exceed reasonable limits
      if (timeCommitment + extraCommitment <= maxTimeCommitment) {
        addTimeCommitment(extraCommitment);
        console.log(`Added ${extraCommitment} hours of unexpected time commitment (meetings/tasks)`);
      }
    }
    
    // Random time efficiency or time saving (finished tasks early, canceled meetings)
    if (Math.random() < 0.25) { // 25% chance each day
      const timeReduction = Math.floor(Math.random() * 3) + 1; // 1-3 hours saved
      
      // Use reduceTimeCommitment to actually free up the schedule
      if (timeCommitment - timeReduction >= minTimeCommitment) {
        // Get the function from the store to reduce time commitment
        const { reduceTimeCommitment } = useCharacter.getState();
        reduceTimeCommitment(timeReduction);
        console.log(`Saved ${timeReduction} hours from your schedule (canceled meeting or completed task early)`);
      }
    }
    
    // Premium transportation and housing benefits - additional free time
    // This represents saved commute time and better home efficiency
    if (vehicleType === 'premium' || vehicleType === 'luxury') {
      // Premium transportation saves time
      const savedTime = vehicleType === 'premium' ? 1 : 2;
      updateFreeTime(savedTime);
      console.log(`Premium transportation saved you ${savedTime} hours of time`);
    }
    
    if (housingType === 'luxury') {
      // Luxury housing provides time-saving amenities
      updateFreeTime(1);
      console.log('Your luxury housing amenities saved you 1 hour of time');
    }
  };
  
  /**
   * Apply hourly effects to character attributes
   * These are smaller changes that happen throughout the day
   */
  const applyHourlyEffects = () => {
    console.log("Applying hourly attribute effects");
    
    // Smaller changes happen throughout the day
    
    // Calculate happiness decay based on health, stress, time management, and social connections
    let hourlyHappinessDecay = -0.2; // Base decay
    
    // Health factor: worse health causes faster happiness decay
    const healthFactor = 
      health < 30 ? -0.3 :   // Poor health: significant happiness loss
      health < 50 ? -0.15 :  // Below average health: moderate happiness loss
      health > 80 ? 0.1 :    // Excellent health: slight happiness boost
      0;                     // Average health: no effect
    
    // Stress factor: higher stress causes faster happiness decay
    const stressFactor = 
      stress > 80 ? -0.3 :   // High stress: significant happiness loss
      stress > 60 ? -0.15 :  // Above average stress: moderate happiness loss
      stress < 30 ? 0.1 :    // Low stress: slight happiness boost
      0;                     // Average stress: no effect
    
    // Time management factor
    const effectiveTimeCommitment = Math.max(timeCommitment, 4);
    const freeTimeRatio = freeTime / effectiveTimeCommitment;
    const timeManagementFactor =
      freeTimeRatio < 0.2 ? -0.25 :  // Very poor time management: faster happiness loss
      freeTimeRatio < 0.5 ? -0.1 :   // Poor time management: moderate happiness loss
      freeTimeRatio > 1.5 ? 0.1 :    // Excellent time management: slight happiness boost
      0;                             // Average time management: no effect
    
    // Social connections factor
    const socialFactor =
      socialConnections < 30 ? -0.2 : // Few social connections: faster happiness loss
      socialConnections < 50 ? -0.1 : // Below average social life: moderate happiness loss
      socialConnections > 80 ? 0.15 : // Strong social network: happiness boost
      0;                              // Average social life: no effect
    
    // Calculate total happiness change
    const totalHourlyHappinessChange = hourlyHappinessDecay + healthFactor + stressFactor + timeManagementFactor + socialFactor;
    
    // Apply the happiness change
    addHappiness(totalHourlyHappinessChange);
    
    // Log the breakdown
    console.log(`Hourly happiness change: ${totalHourlyHappinessChange.toFixed(2)} (Base: ${hourlyHappinessDecay}, Health: ${healthFactor}, Stress: ${stressFactor}, Time: ${timeManagementFactor}, Social: ${socialFactor})`);
    
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
    
    // Rush hour stress - reduced impact and better premium transport benefits
    if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 16 && hourOfDay <= 18)) {
      // Rush hour - extra stress
      let rushHourStress = 0;
      
      switch (vehicleType) {
        case 'none':
        case 'bicycle':
          // No vehicle actually causes less rush hour stress (no traffic)
          rushHourStress = 0.05; // Reduced from 0.1
          break;
        case 'economy':
          // Economy vehicles have the most rush hour stress
          rushHourStress = 0.2; 
          break;
        case 'standard':
          // Standard vehicles have moderate rush hour stress
          rushHourStress = 0.15;
          break;
        case 'luxury':
          // Luxury vehicles have minimal rush hour stress
          rushHourStress = 0.1;
          break;
        case 'premium':
          // Premium vehicles have almost no rush hour stress
          rushHourStress = 0.05;
          break;
      }
      
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
      
      // Removed notifications but still log for debugging
      if (stressIncrease > 1) {
        console.log(`Stressful moment: ${stressfulEvent[eventIndex]} (+${stressIncrease} stress)`);
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
      
      // Removed notifications but still log for debugging
      if (happinessIncrease > 1) {
        console.log(`Pleasant moment: ${positiveEvent[eventIndex]} (+${happinessIncrease} happiness)`);
      }
    }
  };
  
  /**
   * Check for critical attribute values but no longer notify the player
   * Instead, we'll just log these issues for debugging
   */
  const checkCriticalAttributeValues = () => {
    // Critical stress levels
    if (stress > 90 && Math.random() < 0.5) {
      // Removed notification but still log for debugging
      console.log('Critical stress level: extremely high stress requiring immediate action');
      
      // Still play sound for critical warnings only
      playSound('error');
    } else if (stress > 75 && Math.random() < 0.3) {
      console.log('High stress warning: stress levels are very high');
    }
    
    // Critical happiness levels
    if (happiness < 20 && Math.random() < 0.5) {
      // Removed notification but still log for debugging
      console.log('Critical happiness level: happiness has dropped to a dangerous level');
      
      // Still play sound for critical warnings only
      playSound('error');
    } else if (happiness < 35 && Math.random() < 0.3) {
      console.log('Low happiness warning: happiness levels are very low');
    }
    
    // Critical time management - now with more forgiving thresholds
    // Use the same improved calculation as in daily effects
    const effectiveTimeCommitmentCheck = Math.max(timeCommitment, 4);
    const improvedFreeTimeRatio = freeTime / effectiveTimeCommitmentCheck;
    
    if (improvedFreeTimeRatio < 0.08 && Math.random() < 0.3) { // Reduced from 0.1 and 0.5 chance
      // Removed notification but still log for debugging
      console.log('Critical time management: almost no free time, unsustainable');
      
      // Still play sound for critical warnings only
      playSound('error');
    } else if (improvedFreeTimeRatio < 0.2 && Math.random() < 0.2) { // Reduced from 0.25 and 0.3 chance
      console.log('Poor time management: free time is very limited');
    }
    
    // Check for negative feedback loop with multiple critical attributes
    // This is where health, stress, happiness, and social factors combine
    let criticalCount = 0;
    
    // Count how many critical attributes are present
    if (health < 40) criticalCount++;
    if (stress > 75) criticalCount++;
    if (happiness < 30) criticalCount++;
    if (socialConnections < 30) criticalCount++;
    if (improvedFreeTimeRatio < 0.15) criticalCount++;
    
    // If multiple critical attributes are present, we have a negative feedback loop
    if (criticalCount >= 3 && Math.random() < 0.4) {
      console.log(`CRITICAL: Negative feedback loop detected with ${criticalCount} critical attributes. Your health, happiness, stress, time management, and social life are affecting each other negatively.`);
      
      // Calculate the severity of the feedback loop
      const feedbackSeverity = criticalCount * 0.5; // 0.5 points per critical attribute
      
      // Apply a small additional happiness decay to represent the negative feedback loop
      addHappiness(-feedbackSeverity);
      
      // Still play sound for critical warnings only
      playSound('error');
    }
  };
  
  // This component does not render any UI
  return null;
}