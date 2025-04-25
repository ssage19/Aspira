import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStore } from '../lib/utils/storeRegistry';
import { useStoreRegistry, useCharacterRegistry, useStoreMethod } from '../lib/hooks/useStoreRegistry';
import { useResponsive } from '../lib/hooks/useResponsive';
import { setLocalStorage } from '../lib/utils';

// Helper function to determine if a date is the last day of the month
function isEndOfMonth(day: number, month: number, year: number): boolean {
  // Create a date for the next day
  const nextDate = new Date(year, month - 1, day + 1);
  // If the next day is in a different month, then this is the last day
  return nextDate.getMonth() + 1 !== month;
}
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  Briefcase, 
  Home, 
  ShoppingBag,
  ChartBar,
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  GraduationCap,
  XCircle,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/utils';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { checkAllAchievements } from '../lib/services/achievementTracker';

// New time scale: 1 day = 24 seconds (1 second = 1 hour in-game)
const DAY_DURATION_MS = 24 * 1000; // exactly 24,000 ms per in-game day

export default function GameUI() {
  const navigate = useNavigate();
  
  // Use registry pattern for all stores
  const wealth = useCharacterRegistry(state => state.wealth, 0);
  const netWorth = useCharacterRegistry(state => state.netWorth, 0);
  
  // Time store data
  const currentDay = useStoreRegistry('time', state => state.currentDay, 1);
  const currentMonth = useStoreRegistry('time', state => state.currentMonth, 1);
  const currentYear = useStoreRegistry('time', state => state.currentYear, 2025);
  const timeSpeed = useStoreRegistry('time', state => state.timeSpeed, 'normal');
  const timeMultiplier = useStoreRegistry('time', state => state.timeMultiplier, 1);
  const autoAdvanceEnabled = useStoreRegistry('time', state => state.autoAdvanceEnabled, false);
  const timeProgress = useStoreRegistry('time', state => state.timeProgress, 0);
  const lastTickTime = useStoreRegistry('time', state => state.lastTickTime, 0);
  
  // Get financial data from asset tracker
  const totalCash = useStoreRegistry('assetTracker', state => state.totalCash || 0, 0);
  const totalNetWorth = useStoreRegistry('assetTracker', state => state.totalNetWorth || 0, 0);
  
  // Get store methods using the useStoreMethod hook
  const advanceTime = useStoreMethod('time', 'advanceTime');
  const setTimeSpeed = useStoreMethod('time', 'setTimeSpeed');
  const setAutoAdvance = useStoreMethod('time', 'setAutoAdvance');
  const setTimeProgress = useStoreMethod('time', 'setTimeProgress');
  const updateLastTickTime = useStoreMethod('time', 'updateLastTickTime');
  
  // For display, prioritize character values if available, fall back to asset tracker
  const displayCash = wealth || totalCash || 0;
  const displayNetWorth = netWorth || totalNetWorth || 0;
  const [showTooltip, setShowTooltip] = useState('');
  // Track which months we've already deducted expenses for to prevent double-charging
  const [lastExpenseMonth, setLastExpenseMonth] = useState<string | null>(null);
  // Get responsive info to optimize UI for mobile
  const { isMobile } = useResponsive();
  
  // Passive income is now only generated through bi-weekly paychecks and monthly property income
  // No automatic interest on total wealth - we removed this feature as requested
  // This helps make the bi-weekly paychecks more impactful and meaningful
  
  // Later we can implement proper interest-bearing accounts that the player chooses to invest in
  // For now, we've removed the automatic passive income that was incrementing cash every 5 seconds
  
  // Update investment values based on market fluctuations
  const updateInvestments = () => {
    // We'll simulate market fluctuations by randomly adjusting values
    // In a real implementation, this would use more complex market simulation
    // For now, this gives the player the feeling of market movement
    let totalGain = 0;
    let totalLoss = 0;
    let gainersCount = 0;
    let losersCount = 0;
    let netChange = 0;
    
    try {
      const characterStore = getStore('character');
      if (!characterStore) {
        return { 
          gainers: 0, 
          losers: 0, 
          gains: 0, 
          losses: 0, 
          netChange: 0 
        };
      }
      
      const characterState = characterStore.getState();
      if (!characterState || !characterState.assets || characterState.assets.length === 0) {
        return { 
          gainers: 0, 
          losers: 0, 
          gains: 0, 
          losses: 0, 
          netChange: 0 
        };
      }
      
      const assets = characterState.assets;
      
      // Process each asset to calculate market fluctuations
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        // Different asset types have different volatility
        let volatilityFactor = 1.0;
        
        switch(asset.type) {
          case 'stock':
            volatilityFactor = 0.02; // 2% daily movement potential
            break;
          case 'crypto':
            volatilityFactor = 0.05; // 5% daily movement potential
            break;
          case 'bond':
            volatilityFactor = 0.005; // 0.5% daily movement potential
            break;
          case 'other':
            volatilityFactor = 0.03; // 3% daily movement potential
            break;
          default:
            volatilityFactor = 0.01; // 1% default
        }
        
        // Random movement, slightly skewed towards gains (optimistic market)
        const randomFactor = (Math.random() * 2 - 0.9) * volatilityFactor;
        const valueChange = asset.purchasePrice * randomFactor * asset.quantity;
        
        if (valueChange > 0) {
          totalGain += valueChange;
          gainersCount++;
        } else if (valueChange < 0) {
          totalLoss += Math.abs(valueChange);
          losersCount++;
        }
      }
      
      netChange = totalGain - totalLoss;
    } catch (error) {
      console.error("Error calculating investment changes:", error);
    }
    
    return {
      gainers: gainersCount,
      losers: losersCount,
      gains: totalGain,
      losses: totalLoss,
      netChange
    };
  };

  // Process daily income and expenses
  const processDailyFinances = () => {
    // Note: Property income is now handled in the Character store's processDailyUpdate
    // to avoid duplicating the calculation. This function now only processes investments
    // and other financial updates not handled elsewhere.
    
    // Process investments - this doesn't directly affect cash, just net worth
    const investmentChanges = updateInvestments();
    
    // Note: Income and expenses from properties and lifestyle items are now
    // handled completely in the Character store's processDailyUpdate function
    // to avoid duplicating these calculations.
    
    // We're removing the financial notification completely per user request
    // The function still processes all finances but doesn't display notification
    
    // For reference/debugging, we can still access investment changes
    const gainAmount = investmentChanges?.gains || 0;
    const lossAmount = investmentChanges?.losses || 0;
    const netChangeAmount = investmentChanges?.netChange || 0;
    
    // Return the summary for potential other uses
    return {
      income: 0, // No longer calculating this here
      expenses: 0, // No longer calculating this here
      net: 0, // No longer calculating this here
      investmentChange: netChangeAmount
    };
  };

  // Toggle auto advance time
  const toggleAutoAdvance = () => {
    const currentTime = Date.now();
    const timeStore = getStore('time');
    
    if (!timeStore) {
      console.error('Time store not available for toggling auto advance');
      return;
    }
    
    if (autoAdvanceEnabled) {
      // We're pausing the game - store current progress in milliseconds
      // Convert percentage to milliseconds
      const progressInMs = (timeProgress / 100) * DAY_DURATION_MS;
      timeStore.getState().setAccumulatedProgress(progressInMs);
      timeStore.getState().setPausedTimestamp(currentTime);
      
      // Setting autoAdvance to false will also update wasPaused and lastRealTimestamp
      setAutoAdvance(false);
    } else {
      // We're resuming the game
      // Get paused data from the store
      const { pausedTimestamp, accumulatedProgress } = timeStore.getState();
      
      // If we have accumulated progress, use it
      if (accumulatedProgress > 0) {
        // Calculate the adjusted progress percentage
        const adjustedProgress = (accumulatedProgress / DAY_DURATION_MS) * 100;
        setTimeProgress(adjustedProgress);
      }
      
      updateLastTickTime(currentTime);
      
      // Setting autoAdvance to true will also update wasPaused and lastRealTimestamp
      setAutoAdvance(true);
    }
  };
  
  // Keyboard shortcuts for time control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts if we're not in an input field
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }
      
      switch (e.key) {
        case ' ': // Spacebar toggles pause/play
          toggleAutoAdvance();
          break;
        case '1': // Normal speed
          if (autoAdvanceEnabled) setTimeSpeed('normal');
          break;
        case '2': // Fast speed
          if (autoAdvanceEnabled) setTimeSpeed('fast');
          break;
        case '3': // Super fast speed
          if (autoAdvanceEnabled) setTimeSpeed('superfast');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoAdvanceEnabled, setTimeSpeed, toggleAutoAdvance]);
  
  // Auto day advancement timer
  useEffect(() => {
    if (!autoAdvanceEnabled) return;
    
    // Update the last tick time when starting
    if (lastTickTime === 0) {
      updateLastTickTime(Date.now());
    }
    
    // For accurate hour tracking (1 second real time = 1 hour game time)
    // We'll update once per 100ms to keep the animation smooth
    const intervalId = setInterval(() => {
      try {
        const currentTime = Date.now();
        
        // Prevent negative elapsed time which can happen due to system time adjustments
        let elapsedMs = Math.max(0, currentTime - lastTickTime);
        
        // If elapsed time seems unreasonable (more than 10 seconds), cap it
        // This prevents huge jumps if the browser tab is inactive for a while
        if (elapsedMs > 10000) {
          console.log(`Capping unreasonably large elapsed time: ${elapsedMs}ms -> 5000ms`);
          elapsedMs = 5000;
        }
        
        // Apply time multiplier
        const adjustedElapsedMs = elapsedMs * timeMultiplier;
        
        // Each second (1000ms) equals 1 hour (1/24 of a day)
        // So we convert to a fraction of a day
        const hoursElapsed = adjustedElapsedMs / 1000;
        const fractionOfDay = hoursElapsed / 24;
        
        // Calculate progress percentage (0-100)
        // Keep track of how much progress we've made including potential day completions
        const totalProgressPct = timeProgress + (fractionOfDay * 100);
        
        // Count how many full days have passed
        const fullDaysPassed = Math.floor(totalProgressPct / 100);
        
        // New progress is just the remainder after completing days
        const newProgress = totalProgressPct % 100;
        
        // Update the time progress
        setTimeProgress(newProgress);
        
        // Update the last tick time for next calculation
        updateLastTickTime(currentTime);
        
        // If any full days have passed, process them
        if (fullDaysPassed > 0) {
          // Process daily finances
          processDailyFinances();
          
          // Process daily character update (including salary)
          try {
            const characterStore = getStore('character');
            if (characterStore) {
              const characterState = characterStore.getState();
              if (characterState && typeof characterState.processDailyUpdate === 'function') {
                characterState.processDailyUpdate();
              } else {
                console.warn("Character state or processDailyUpdate method not available");
              }
            }
          } catch (error) {
            console.error("Error processing daily character update:", error);
          }
          
          // Advance the day
          advanceTime();
          
          // Get the updated dayCounter after advancing time
          const timeStore = getStore('time');
          const economyStore = getStore('economy');
          let dayCounter = 0;
          
          if (timeStore) {
            const timeState = timeStore.getState();
            dayCounter = timeState.dayCounter || 0;
            
            // Check for weekly updates (every 7 days)
            if (dayCounter % 7 === 0 && economyStore) {
              const processWeeklyUpdate = economyStore.getState().processWeeklyUpdate;
              if (typeof processWeeklyUpdate === 'function') {
                processWeeklyUpdate();
                console.log("Weekly update processed on day counter:", dayCounter);
              }
            }
            
            // Get the current date and state for month-end checks
            const currentDayValue = timeState.currentDay || 1;
            const currentMonthValue = timeState.currentMonth || 1;
            const currentYearValue = timeState.currentYear || 2025;
            
            const isLastDayOfMonth = isEndOfMonth(currentDayValue, currentMonthValue, currentYearValue);
            
            // Check for monthly updates on the last day of each month
            if (isLastDayOfMonth && economyStore) {
              const processMonthlyUpdate = economyStore.getState().processMonthlyUpdate;
              if (typeof processMonthlyUpdate === 'function') {
                processMonthlyUpdate();
                console.log("Monthly update processed on day counter:", dayCounter);
              }
            
              // Create a month ID string (e.g., "4-2025" for April 2025)
              const monthId = `${currentMonthValue}-${currentYearValue}`;
              
              // Get character state for calculations
              const characterStore = getStore('character');
              if (characterStore) {
                const characterState = characterStore.getState();
            
                // Calculate summary information for the toast
                const propertyIncome = characterState.properties.reduce((total: number, property: any) => 
                  total + property.income, 0);
                const lifestyleExpenses = characterState.lifestyleItems.reduce((total: number, item: any) => {
                  const monthlyCost = item.monthlyCost || (item.maintenanceCost ? item.maintenanceCost * 30 : 0);
                  return total + monthlyCost;
                }, 0);
                const job = characterState.job;
                const monthlySalary = job ? (job.salary / 26) * 2.17 : 0;
                // Calculate financial data for the monthly report
                const housingExp = characterState.housingType === 'rental' ? 1800 : 
                                  characterState.housingType === 'shared' ? 900 : 0;
                
                const transportExp = characterState.vehicleType === 'economy' ? 300 :
                                   characterState.vehicleType === 'standard' ? 450 :
                                   characterState.vehicleType === 'luxury' ? 1000 :
                                   characterState.vehicleType === 'premium' ? 1500 :
                                   characterState.vehicleType === 'bicycle' ? 50 : 0;
                
                const foodExp = 600; // Standard food expense
                
                const totalExp = lifestyleExpenses + housingExp + transportExp + foodExp;
                const totalInc = propertyIncome + monthlySalary;
                const netChange = totalInc - totalExp;
                
                // Check if we've already processed expenses for this month
                if (lastExpenseMonth !== monthId) {
                  // Call the character store's monthly update method to handle expense deduction
                  // This includes deducting lifestyle expenses and showing visual feedback
                  try {
                    if (characterState && typeof characterState.monthlyUpdate === 'function') {
                      characterState.monthlyUpdate();
                    } else {
                      console.warn("Character state or monthlyUpdate method not available");
                    }
                  } catch (error) {
                    console.error("Error in monthly update:", error);
                  }
                  
                  // Update the last expense month to prevent double-charging
                  setLastExpenseMonth(monthId);
                  console.log(`Set last expense month to: ${monthId}`);
                } else {
                  console.log(`Skipping expense deduction for month ${monthId} as it was already processed`);
                }
                
                // No need to calculate expenses here - the monthly summary is 
                // now shown in the dedicated MonthlyFinancesWidget
                console.log("End of month reached - expense calculations handled by MonthlyFinancesWidget");
              }
            }
          }
          
          // Check for unlockable achievements
          checkAllAchievements();
        }
      } catch (error) {
        console.error("Error in time advancement timer:", error);
      }
    }, 100); // Update progress every 100ms for smoother animation
    
    return () => {
      console.log("Cleaning up time advancement timer");
      clearInterval(intervalId);
    };
  }, [
    autoAdvanceEnabled, 
    lastTickTime, 
    timeMultiplier, 
    advanceTime,
    setTimeProgress, 
    updateLastTickTime, 
    lastExpenseMonth, 
    setLastExpenseMonth,
    timeProgress // Add timeProgress to the dependency array to ensure we always have the latest value
  ]);
  
  // Handle manual time advance
  const handleAdvanceTime = () => {
    // Process daily finances when manually advancing time too
    processDailyFinances();
    
    // Process daily character update (including salary)
    try {
      const characterState = useCharacter.getState();
      if (characterState && typeof characterState.processDailyUpdate === 'function') {
        characterState.processDailyUpdate();
      } else {
        console.warn("Character state or processDailyUpdate method not available in manual advancement");
      }
    } catch (error) {
      console.error("Error processing daily character update in manual advancement:", error);
    }
    
    // Advance the day
    advanceTime();
    if (audioState.playSuccess) {
      audioState.playSuccess();
    }
    
    // Get the updated dayCounter after advancing time
    const { dayCounter } = useTime.getState();
    
    // Check for weekly updates (every 7 days)
    if (dayCounter % 7 === 0) {
      useEconomy.getState().processWeeklyUpdate();
      console.log("Weekly update processed on day counter:", dayCounter);
    }
    
    // Get the current date and state
    const { currentDay, currentMonth, currentYear } = useTime.getState();
    const isLastDayOfMonth = isEndOfMonth(currentDay, currentMonth, currentYear);
    
    // Check for monthly updates on the last day of each month
    if (isLastDayOfMonth) {
      useEconomy.getState().processMonthlyUpdate();
      console.log("Monthly update processed on day counter:", dayCounter);
      
      // Create a month ID string (e.g., "4-2025" for April 2025)
      const monthId = `${currentMonth}-${currentYear}`;
      
      // Get character state for calculations
      const characterState = useCharacter.getState();
      
      // Calculate the summary values for the toast
      const propertyIncome = characterState.properties.reduce((total, property) => 
        total + property.income, 0);
      const lifestyleExpenses = characterState.lifestyleItems.reduce((total, item) => {
        const monthlyCost = item.monthlyCost || (item.maintenanceCost ? item.maintenanceCost * 30 : 0);
        return total + monthlyCost;
      }, 0);
      const job = characterState.job;
      const monthlySalary = job ? (job.salary / 26) * 2.17 : 0;
      
      // Check if we've already processed expenses for this month
      if (lastExpenseMonth !== monthId) {
        // Call the character store's monthly update method to handle expense deduction
        try {
          if (characterState && typeof characterState.monthlyUpdate === 'function') {
            characterState.monthlyUpdate();
          } else {
            console.warn("Character state or monthlyUpdate method not available in manual advancement");
          }
        } catch (error) {
          console.error("Error in monthly update during manual advancement:", error);
        }
        
        // Update the last expense month to prevent double-charging
        setLastExpenseMonth(monthId);
        console.log(`Set last expense month to: ${monthId}`);
      } else {
        console.log(`Skipping expense deduction for month ${monthId} as it was already processed`);
      }
    }
    
    // Check for unlockable achievements
    checkAllAchievements();
  };
  
  // Get formatted time string
  const getFormattedTime = () => {
    const hourPercentage = (timeProgress / 100) * 24;
    const hour = Math.floor(hourPercentage);
    const minute = Math.floor((hourPercentage - hour) * 60);
    
    // Format as 12-hour time with AM/PM
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };
  
  // Format the current date as Month Day, Year
  const getFormattedDate = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[currentMonth-1]} ${currentDay}, ${currentYear}`;
  };
  
  // Format the time speed string
  const getTimeSpeedString = () => {
    switch (timeSpeed) {
      case 'normal':
        return '1x';
      case 'fast':
        return '3x';
      case 'superfast':
        return '6x';
      default:
        return '1x';
    }
  };
  
  // State for speed dropdown
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);
  
  // Reference for speed dropdown element
  const speedDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedDropdownRef.current && !speedDropdownRef.current.contains(event.target as Node)) {
        setSpeedDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="w-full pointer-events-none">
      {/* Top bar with wealth - fixed at top of viewport */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-border/40 text-foreground p-2 flex justify-between items-center pointer-events-auto z-50 transition-all duration-300">
        {/* Wealth indicator - most important info */}
        <div className="flex items-center transition-all duration-300 hover:scale-105" aria-label="Current wealth and net worth">
          <div className="p-2 rounded-full bg-quaternary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-quaternary" />
          </div>
          <div className="ml-2">
            <p className="text-lg font-bold">{formatCurrency(displayCash)}</p>
            {!isMobile && <p className="text-xs text-muted-foreground">Net Worth: {formatCurrency(displayNetWorth)}</p>}
          </div>
        </div>
        
        {/* Mobile optimized center section with both date and time */}
        {isMobile ? (
          /* On mobile, show compact date and time */
          <div className="flex flex-col items-center" aria-label="Game time and date">
            <div className="flex flex-col items-center">
              {/* Date display */}
              <div className="mb-0.5 flex items-center justify-center text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium">{getFormattedDate()}</span>
              </div>
              
              {/* Time display with play/pause toggle */}
              <button
                onClick={toggleAutoAdvance}
                className={`flex items-center justify-center rounded-full px-3 py-1 ${
                  autoAdvanceEnabled ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                <Clock className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium">{getFormattedTime()}</span>
              </button>
            </div>
          </div>
        ) : (
          /* On larger screens, show both date and time-related controls */
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1" aria-label="Current date">
            <div className="flex items-center space-x-2 bg-secondary/40 dark:bg-secondary/30 px-4 py-2 rounded-full">
              <Calendar className="h-4 w-4 text-primary dark:text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {new Date(currentYear, currentMonth - 1, currentDay).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {/* Time progression indicator */}
            <div className="w-64 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 relative">
                {/* Sun/Moon indicator based on time progress */}
                <div className="relative h-6 w-24 bg-gradient-to-r from-indigo-900 via-amber-400 to-indigo-900 rounded-full overflow-hidden">
                  {/* Day/Night position indicator */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
                    style={{ 
                      left: `${Math.min(Math.max(timeProgress - 4, 0), 92)}%`,
                      filter: "drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))"
                    }}
                  >
                    {timeProgress < 50 ? (
                      <Sun className="h-5 w-5 text-yellow-300" />
                    ) : (
                      <Moon className="h-5 w-5 text-blue-100" />
                    )}
                  </div>
                </div>
                <span className="text-xs" 
                  onMouseEnter={() => setShowTooltip('time')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  {getFormattedTime()}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Right side controls - optimized for mobile */}
        <div className="flex items-center space-x-2">
          {/* Speed control dropdown - works on both mobile and desktop */}
          <div className="relative" ref={speedDropdownRef}>
            <Button 
              variant="outline"
              size="sm"
              className={`px-3 flex items-center gap-1 ${speedDropdownOpen ? 'bg-primary/10' : ''}`}
              onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
              aria-label="Game speed settings"
            >
              <span>{getTimeSpeedString()}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${speedDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Speed dropdown menu */}
            {speedDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-background shadow-lg rounded-md border border-border z-50 p-1 min-w-[80px] flex flex-col">
                <button 
                  className={`px-3 py-1.5 text-xs rounded-sm flex items-center ${timeSpeed === 'normal' ? 'bg-primary/20 text-primary' : 'hover:bg-accent/50'}`}
                  onClick={() => {
                    setTimeSpeed('normal');
                    setSpeedDropdownOpen(false);
                  }}
                >
                  1x Speed
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs rounded-sm flex items-center ${timeSpeed === 'fast' ? 'bg-primary/20 text-primary' : 'hover:bg-accent/50'}`}
                  onClick={() => {
                    setTimeSpeed('fast');
                    setSpeedDropdownOpen(false);
                  }}
                >
                  3x Speed
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs rounded-sm flex items-center ${timeSpeed === 'superfast' ? 'bg-primary/20 text-primary' : 'hover:bg-accent/50'}`}
                  onClick={() => {
                    setTimeSpeed('superfast');
                    setSpeedDropdownOpen(false);
                  }}
                >
                  6x Speed
                </button>
              </div>
            )}
          </div>
          
          {/* Play/Pause button - simplified to just an icon on mobile */}
          <Button
            variant="outline"
            size={isMobile ? "icon" : "default"}
            onClick={toggleAutoAdvance}
            aria-label={autoAdvanceEnabled ? "Pause time" : "Start time"}
            className={`rounded-full ${isMobile ? 'w-8 h-8 p-0' : ''}`}
          >
            {autoAdvanceEnabled ? (
              <>
                <span className="sr-only">Pause</span>
                {!isMobile && "Pause"}
                <span className="h-3 w-3 flex items-center justify-center">
                  <span className="block w-1 h-3 bg-current rounded-sm mr-0.5"></span>
                  <span className="block w-1 h-3 bg-current rounded-sm ml-0.5"></span>
                </span>
              </>
            ) : (
              <>
                <span className="sr-only">Play</span>
                {!isMobile && "Play"}
                <span className="h-0 w-0 ml-1 border-t-transparent border-t-[6px] border-b-transparent border-b-[6px] border-l-[10px] border-l-current"></span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}