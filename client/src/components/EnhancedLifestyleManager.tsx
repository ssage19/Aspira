import { useEffect, useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useGame } from '../lib/stores/useGame';
import { allEnhancedLifestyleItems, EnhancedLifestyleItem } from '../lib/data/enhancedLifestyleItems';
import { toast } from 'sonner';

/**
 * This component manages the lifecycle and consequences of enhanced lifestyle choices
 * It runs in the background and handles:
 * - Processing lifestyle effects over time
 * - Triggering special events
 * - Managing synergies and conflicts between lifestyle choices
 * - Applying long-term health and career consequences
 */
export function EnhancedLifestyleManager() {
  const { 
    lifestyleItems, 
    health, 
    happiness, 
    stress, 
    prestige, 
    socialConnections,
    environmentalImpact,
    addHealth,
    addHappiness,
    addStress,
    addPrestige,
    updateSocialConnections,
    improveSkill,
    addWealth,
    deductWealth,
    calculateNetWorth
  } = useCharacter();
  
  const { dayCounter, currentGameDate } = useTime();
  
  // Track the last day we processed to avoid duplicate processing
  const [lastProcessedDay, setLastProcessedDay] = useState(dayCounter);
  
  // Track monthly processing with a simple state
  const [lastProcessedMonth, setLastProcessedMonth] = useState<number>(-1);
  
  // Monitor character's lifestyle items and apply daily effects when time changes
  useEffect(() => {
    // Avoid processing multiple times on the same day
    if (dayCounter <= lastProcessedDay) return;
    
    // Process daily effects
    processDailyLifestyleEffects();
    
    // Check if we need to run monthly processing (at the start of each month)
    const currentMonth = currentGameDate.getMonth();
    if (currentMonth !== lastProcessedMonth) {
      processMonthlyLifestyleEffects();
      setLastProcessedMonth(currentMonth);
    }
    
    // Set the last processed day to prevent duplicate processing
    setLastProcessedDay(dayCounter);
  }, [dayCounter, currentGameDate]);
  
  /**
   * Process the daily effects of lifestyle choices
   */
  const processDailyLifestyleEffects = () => {
    // Skip if no enhanced lifestyle items are owned
    if (lifestyleItems.length === 0) return;
    
    // Track how many lifestyle interactions occurred
    let interactionsCount = 0;
    
    // Check for synergies and conflicts between owned items
    const synergies = findLifestyleSynergies();
    const conflicts = findLifestyleConflicts();
    
    // Apply synergy benefits
    for (const synergy of synergies) {
      applySynergyEffects(synergy);
      interactionsCount++;
    }
    
    // Apply conflict penalties
    for (const conflict of conflicts) {
      applyConflictEffects(conflict);
      interactionsCount++;
    }
    
    // Check for special triggers
    const triggers = checkForSpecialTriggers();
    for (const trigger of triggers) {
      processTrigger(trigger);
      interactionsCount++;
    }
    
    // Log interaction count if any occurred
    if (interactionsCount > 0) {
      console.log(`Enhanced lifestyle system processed ${interactionsCount} interactions`);
    }
  };
  
  /**
   * Process monthly effects from lifestyle choices
   */
  const processMonthlyLifestyleEffects = () => {
    // Skip if no enhanced lifestyle items are owned
    if (lifestyleItems.length === 0) return;
    
    // Apply monthly health impacts
    applyChronicHealthConditions();
    
    // Apply monthly mental health effects
    applyMentalHealthEffects();
    
    // Apply financial wisdom benefits
    applyFinancialWisdomEffects();
    
    // Check for skill development
    applySkillDevelopmentEffects();
    
    // Apply career effects
    applyCareerEffects();
    
    console.log('Enhanced lifestyle system processed monthly effects');
  };
  
  /**
   * Find synergies between owned lifestyle items
   */
  const findLifestyleSynergies = () => {
    const synergies: { item1Id: string, item2Id: string, effects: any }[] = [];
    
    // Get IDs of all owned lifestyle items
    const ownedItemIds = lifestyleItems.map(item => item.id);
    
    // Check each owned item for potential synergies
    lifestyleItems.forEach(ownedItem => {
      // Find the enhanced item definition
      const enhancedItem = allEnhancedLifestyleItems.find(item => item.id === ownedItem.id);
      
      // Skip if not an enhanced item or has no synergies
      if (!enhancedItem || !enhancedItem.attributes.synergies) return;
      
      // Check each potential synergy
      enhancedItem.attributes.synergies.forEach(synergy => {
        // If the synergy target is also owned, record it
        if (ownedItemIds.includes(synergy.itemId)) {
          synergies.push({
            item1Id: ownedItem.id,
            item2Id: synergy.itemId,
            effects: synergy.bonusEffects
          });
        }
      });
    });
    
    return synergies;
  };
  
  /**
   * Find conflicts between owned lifestyle items
   */
  const findLifestyleConflicts = () => {
    const conflicts: { item1Id: string, item2Id: string, effects: any }[] = [];
    
    // Get IDs of all owned lifestyle items
    const ownedItemIds = lifestyleItems.map(item => item.id);
    
    // Check each owned item for potential conflicts
    lifestyleItems.forEach(ownedItem => {
      // Find the enhanced item definition
      const enhancedItem = allEnhancedLifestyleItems.find(item => item.id === ownedItem.id);
      
      // Skip if not an enhanced item or has no conflicts
      if (!enhancedItem || !enhancedItem.attributes.conflicts) return;
      
      // Check each potential conflict
      enhancedItem.attributes.conflicts.forEach(conflict => {
        // If the conflict target is also owned, record it
        if (ownedItemIds.includes(conflict.itemId)) {
          conflicts.push({
            item1Id: ownedItem.id,
            item2Id: conflict.itemId,
            effects: conflict.penaltyEffects
          });
        }
      });
    });
    
    return conflicts;
  };
  
  /**
   * Check for special triggers that might activate
   */
  const checkForSpecialTriggers = () => {
    const activatedTriggers: { itemId: string, triggerId: string, description: string }[] = [];
    
    // Check each owned item for potential triggers
    lifestyleItems.forEach(ownedItem => {
      // Find the enhanced item definition
      const enhancedItem = allEnhancedLifestyleItems.find(item => item.id === ownedItem.id);
      
      // Skip if not an enhanced item or has no special triggers
      if (!enhancedItem || !enhancedItem.attributes.specialTriggers) return;
      
      // Check each trigger
      enhancedItem.attributes.specialTriggers.forEach(trigger => {
        let shouldTrigger = false;
        
        // Time-based triggers
        if (trigger.triggerType === 'time-based') {
          // Calculate months since purchase
          const purchaseDate = new Date(ownedItem.purchaseDate || new Date());
          const monthsOwned = 
            (currentGameDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
            (currentGameDate.getMonth() - purchaseDate.getMonth());
          
          // Check if we've passed the threshold and roll probability
          if (monthsOwned >= trigger.threshold && Math.random() < trigger.probability) {
            shouldTrigger = true;
          }
        }
        
        // Health-based triggers
        if (trigger.triggerType === 'health-based' || trigger.triggerType === 'stress-based') {
          const checkValue = trigger.triggerType === 'health-based' ? health : stress;
          
          // For health, trigger when below threshold
          // For stress, trigger when above threshold
          const conditionMet = trigger.triggerType === 'health-based' 
            ? checkValue <= trigger.threshold
            : checkValue >= trigger.threshold;
          
          if (conditionMet && Math.random() < trigger.probability) {
            shouldTrigger = true;
          }
        }
        
        // Financial-based triggers
        if (trigger.triggerType === 'financial-based') {
          const netWorth = calculateNetWorth();
          
          // Trigger when net worth exceeds threshold
          if (netWorth >= trigger.threshold && Math.random() < trigger.probability) {
            shouldTrigger = true;
          }
        }
        
        // Social-based triggers
        if (trigger.triggerType === 'social-based') {
          // Trigger when social connections exceed threshold
          if (socialConnections >= trigger.threshold && Math.random() < trigger.probability) {
            shouldTrigger = true;
          }
        }
        
        // Add to activated triggers if conditions are met
        if (shouldTrigger) {
          activatedTriggers.push({
            itemId: ownedItem.id,
            triggerId: trigger.eventId,
            description: trigger.description
          });
        }
      });
    });
    
    return activatedTriggers;
  };
  
  /**
   * Apply the effects of a synergy between lifestyle items
   */
  const applySynergyEffects = (synergy: { item1Id: string, item2Id: string, effects: any[] }) => {
    // Find the enhanced item definitions
    const item1 = allEnhancedLifestyleItems.find(item => item.id === synergy.item1Id);
    const item2 = allEnhancedLifestyleItems.find(item => item.id === synergy.item2Id);
    
    if (!item1 || !item2) return;
    
    // Apply each effect
    synergy.effects.forEach(effect => {
      switch (effect.attribute) {
        case 'happiness':
          addHappiness(effect.value);
          break;
        case 'health':
          addHealth(effect.value);
          break;
        case 'prestige':
          addPrestige(effect.value);
          break;
        case 'stress':
          addStress(effect.value);
          break;
        case 'socialConnections':
          updateSocialConnections(effect.value);
          break;
        case 'wealth':
          addWealth(effect.value);
          break;
      }
    });
    
    // 10% chance to show a synergy notification
    if (Math.random() < 0.1) {
      toast.success(
        <div>
          <p className="font-bold">Lifestyle Synergy</p>
          <p className="text-sm mt-1">Your {item1.name} and {item2.name} are working well together!</p>
        </div>,
        { duration: 4000 }
      );
    }
  };
  
  /**
   * Apply the negative effects of a conflict between lifestyle items
   */
  const applyConflictEffects = (conflict: { item1Id: string, item2Id: string, effects: any[] }) => {
    // Find the enhanced item definitions
    const item1 = allEnhancedLifestyleItems.find(item => item.id === conflict.item1Id);
    const item2 = allEnhancedLifestyleItems.find(item => item.id === conflict.item2Id);
    
    if (!item1 || !item2) return;
    
    // Apply each negative effect
    conflict.effects.forEach(effect => {
      switch (effect.attribute) {
        case 'happiness':
          addHappiness(effect.value); // Value is already negative
          break;
        case 'health':
          addHealth(effect.value); // Value is already negative
          break;
        case 'prestige':
          addPrestige(effect.value); // Value is already negative
          break;
        case 'stress':
          addStress(effect.value); // Value is positive for stress increase
          break;
        case 'socialConnections':
          updateSocialConnections(effect.value); // Value is already negative
          break;
        case 'wealth':
          addWealth(effect.value); // Value is already negative
          break;
      }
    });
    
    // 15% chance to show a conflict notification
    if (Math.random() < 0.15) {
      toast.warning(
        <div>
          <p className="font-bold">Lifestyle Conflict</p>
          <p className="text-sm mt-1">Your {item1.name} is conflicting with your {item2.name}.</p>
        </div>,
        { duration: 4000 }
      );
    }
  };
  
  /**
   * Process a special trigger and potentially spawn an event
   */
  const processTrigger = (trigger: { itemId: string, triggerId: string, description: string }) => {
    // Avoid duplicate triggers by checking a 10% chance
    if (Math.random() > 0.1) return;
    
    // Find the item that triggered this
    const item = allEnhancedLifestyleItems.find(i => i.id === trigger.itemId);
    if (!item) return;
    
    // For now, just show a toast notification about the trigger
    toast.info(
      <div>
        <p className="font-bold">Special Opportunity</p>
        <p className="text-sm mt-1">{trigger.description}</p>
      </div>,
      { duration: 5000 }
    );
    
    // In the future, we could trigger game events here
    // For now, we just show the toast notification
  };
  
  /**
   * Apply chronic health conditions from lifestyle choices
   */
  const applyChronicHealthConditions = () => {
    // Check each owned lifestyle item
    lifestyleItems.forEach(ownedItem => {
      // Find the enhanced item definition
      const enhancedItem = allEnhancedLifestyleItems.find(item => item.id === ownedItem.id);
      
      // Skip if not an enhanced item or has no chronic health conditions
      if (!enhancedItem || !enhancedItem.attributes.chronicHealthCondition) return;
      
      // Apply each health condition
      enhancedItem.attributes.chronicHealthCondition.forEach(condition => {
        // Apply the health impact
        addHealth(condition.healthImpactPerMonth);
        
        // If there's a treatment cost, deduct it
        if (condition.treatmentCostPerMonth) {
          deductWealth(condition.treatmentCostPerMonth);
        }
        
        // 5% chance to show a health notification
        if (Math.random() < 0.05) {
          const isPositive = condition.healthImpactPerMonth > 0;
          
          if (isPositive) {
            toast.success(
              <div>
                <p className="font-bold">Health Improvement</p>
                <p className="text-sm mt-1">{condition.description}</p>
              </div>,
              { duration: 4000 }
            );
          } else {
            toast.warning(
              <div>
                <p className="font-bold">Health Concern</p>
                <p className="text-sm mt-1">{condition.description}</p>
              </div>,
              { duration: 4000 }
            );
          }
        }
      });
    });
  };
  
  /**
   * Apply mental health effects from lifestyle choices
   */
  const applyMentalHealthEffects = () => {
    // Check each owned lifestyle item
    lifestyleItems.forEach(ownedItem => {
      // Find the enhanced item definition
      const enhancedItem = allEnhancedLifestyleItems.find(item => item.id === ownedItem.id);
      
      // Skip if not an enhanced item or has no mental health effects
      if (!enhancedItem || !enhancedItem.attributes.mentalHealthEffects) return;
      
      // Apply each mental health effect
      enhancedItem.attributes.mentalHealthEffects.forEach(effect => {
        // Apply happiness impact
        addHappiness(effect.happinessImpactPerMonth);
        
        // Apply stress impact
        addStress(effect.stressImpactPerMonth);
        
        // 5% chance to show a mental health notification
        if (Math.random() < 0.05) {
          const isPositive = effect.type === 'positive';
          
          if (isPositive) {
            toast.success(
              <div>
                <p className="font-bold">Mental Wellbeing</p>
                <p className="text-sm mt-1">{effect.description}</p>
              </div>,
              { duration: 4000 }
            );
          } else {
            toast.warning(
              <div>
                <p className="font-bold">Mental Health Concern</p>
                <p className="text-sm mt-1">{effect.description}</p>
              </div>,
              { duration: 4000 }
            );
          }
        }
      });
    });
  };
  
  /**
   * Apply financial wisdom effects from lifestyle choices
   */
  const applyFinancialWisdomEffects = () => {
    // Aggregated financial effects
    let totalExpenseReduction = 0;
    let totalWealthGrowthMultiplier = 1.0;
    
    // Check each owned lifestyle item
    lifestyleItems.forEach(ownedItem => {
      // Find the enhanced item definition
      const enhancedItem = allEnhancedLifestyleItems.find(item => item.id === ownedItem.id);
      
      // Skip if not an enhanced item or has no financial wisdom effects
      if (!enhancedItem || !enhancedItem.attributes.financialWisdom) return;
      
      // Gather financial effects
      enhancedItem.attributes.financialWisdom.forEach(wisdom => {
        // Accumulate expense reduction
        if (wisdom.expenseReductionPercentage) {
          totalExpenseReduction += wisdom.expenseReductionPercentage;
        }
        
        // Accumulate wealth growth multiplier
        if (wisdom.wealthGrowthMultiplier) {
          totalWealthGrowthMultiplier *= wisdom.wealthGrowthMultiplier;
        }
      });
    });
    
    // Apply expense reduction if significant
    if (totalExpenseReduction > 0.01) {
      // This is a simplified simulation - in reality would adjust monthly expenses
      // For now, just add a small wealth bonus representing the savings
      const savingsAmount = 500 * totalExpenseReduction; // Base amount * reduction percentage
      addWealth(savingsAmount);
      
      // 10% chance to show a financial wisdom notification
      if (Math.random() < 0.1) {
        toast.success(
          <div>
            <p className="font-bold">Financial Wisdom</p>
            <p className="text-sm mt-1">Your mindful financial practices saved you ${Math.round(savingsAmount)} this month.</p>
          </div>,
          { duration: 4000 }
        );
      }
    }
    
    // Apply wealth growth if significant
    if (totalWealthGrowthMultiplier > 1.01) {
      // This is a simplified simulation - in reality would adjust investment returns
      // For now, just add a small wealth bonus representing better investment choices
      const additionalReturns = 1000 * (totalWealthGrowthMultiplier - 1); // Base amount * excess multiplier
      addWealth(additionalReturns);
      
      // 10% chance to show a investment wisdom notification
      if (Math.random() < 0.1) {
        toast.success(
          <div>
            <p className="font-bold">Investment Wisdom</p>
            <p className="text-sm mt-1">Your financial knowledge earned you an extra ${Math.round(additionalReturns)} in returns.</p>
          </div>,
          { duration: 4000 }
        );
      }
    }
  };
  
  /**
   * Apply skill development effects from lifestyle choices
   */
  const applySkillDevelopmentEffects = () => {
    // Check each owned lifestyle item
    lifestyleItems.forEach(ownedItem => {
      // Find the enhanced item definition
      const enhancedItem = allEnhancedLifestyleItems.find(item => item.id === ownedItem.id);
      
      // Skip if not an enhanced item or has no personal growth effects
      if (!enhancedItem || !enhancedItem.attributes.personalGrowth) return;
      
      // Apply each personal growth effect
      enhancedItem.attributes.personalGrowth.forEach(growth => {
        // Apply skill impacts
        growth.skillImpact.forEach(impact => {
          improveSkill(impact.skillName, impact.value);
        });
        
        // 5% chance to show a skill development notification
        if (Math.random() < 0.05) {
          toast.success(
            <div>
              <p className="font-bold">Skill Development</p>
              <p className="text-sm mt-1">{growth.description}</p>
            </div>,
            { duration: 4000 }
          );
        }
      });
    });
  };
  
  /**
   * Apply career effects from lifestyle choices
   */
  const applyCareerEffects = () => {
    // Aggregated career effects
    let totalPrestigeImpact = 0;
    let totalIncomeMultiplier = 1.0;
    
    // Check each owned lifestyle item
    lifestyleItems.forEach(ownedItem => {
      // Find the enhanced item definition
      const enhancedItem = allEnhancedLifestyleItems.find(item => item.id === ownedItem.id);
      
      // Skip if not an enhanced item or has no career effects
      if (!enhancedItem || !enhancedItem.attributes.careerEffects) return;
      
      // Gather career effects
      enhancedItem.attributes.careerEffects.forEach(effect => {
        // Accumulate prestige impact
        totalPrestigeImpact += effect.prestigeImpact;
        
        // Accumulate income multiplier
        if (effect.incomeMultiplier) {
          totalIncomeMultiplier *= effect.incomeMultiplier;
        }
      });
    });
    
    // Apply prestige impact if significant
    if (totalPrestigeImpact !== 0) {
      // Apply a fraction of the total prestige impact each month
      const monthlyPrestigeImpact = totalPrestigeImpact / 12;
      addPrestige(monthlyPrestigeImpact);
    }
    
    // Apply income multiplier if significant
    if (totalIncomeMultiplier > 1.01) {
      // This is a simplified simulation - in reality would adjust job income
      // For now, just add a small wealth bonus representing higher income
      const additionalIncome = 1000 * (totalIncomeMultiplier - 1); // Base amount * excess multiplier
      addWealth(additionalIncome);
      
      // 10% chance to show a career advancement notification
      if (Math.random() < 0.1) {
        toast.success(
          <div>
            <p className="font-bold">Career Advancement</p>
            <p className="text-sm mt-1">Your lifestyle choices led to an additional ${Math.round(additionalIncome)} in earnings.</p>
          </div>,
          { duration: 4000 }
        );
      }
    }
  };
  
  // This component doesn't render anything - it just runs in the background
  return null;
}