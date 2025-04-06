import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useAudio } from '../lib/stores/useAudio';
import useEconomy from '../lib/stores/useEconomy';

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
  Volume2,
  VolumeX,
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  GraduationCap,
  XCircle,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/utils';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { checkAllAchievements } from '../lib/services/achievementTracker';

// New time scale: 1 day = 24 seconds (1 second = 1 hour in-game)
const DAY_DURATION_MS = 24 * 1000; // exactly 24,000 ms per in-game day

export function GameUI() {
  const navigate = useNavigate();
  const { wealth, netWorth, addWealth } = useCharacter();
  const { 
    currentDay, 
    currentMonth, 
    currentYear, 
    advanceTime, 
    timeSpeed, 
    timeMultiplier, 
    setTimeSpeed,
    autoAdvanceEnabled,
    timeProgress,
    lastTickTime,
    setAutoAdvance,
    setTimeProgress,
    updateLastTickTime
  } = useTime();
  const { isMuted, setMuted, playSuccess } = useAudio();
  const [showTooltip, setShowTooltip] = useState('');
  // Track which months we've already deducted expenses for to prevent double-charging
  const [lastExpenseMonth, setLastExpenseMonth] = useState<string | null>(null);
  
  // Update passive income every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Passive income is 0.01% of net worth per tick
      const passiveIncome = netWorth * 0.0001;
      if (passiveIncome > 0) {
        addWealth(passiveIncome);
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [netWorth, addWealth]);
  
  // Update investment values based on market fluctuations
  const updateInvestments = () => {
    const { assets } = useCharacter.getState();
    
    // Skip if no assets
    if (assets.length === 0) return { 
      gainers: 0, 
      losers: 0, 
      gains: 0, 
      losses: 0, 
      netChange: 0 
    };
    
    // We'll simulate market fluctuations by randomly adjusting values
    // In a real implementation, this would use more complex market simulation
    // For now, this gives the player the feeling of market movement
    let totalGain = 0;
    let totalLoss = 0;
    let gainersCount = 0;
    let losersCount = 0;
    
    assets.forEach(asset => {
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
    });
    
    const netChange = totalGain - totalLoss;
    
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
    
    // For reference/debugging, we can still access:
    const gains = investmentChanges.gains || 0;
    const losses = investmentChanges.losses || 0;
    
    // Return the summary for potential other uses
    return {
      income: 0, // No longer calculating this here
      expenses: 0, // No longer calculating this here
      net: 0, // No longer calculating this here
      investmentChange: investmentChanges.netChange
    };
  };

  // Toggle auto advance time
  const toggleAutoAdvance = () => {
    const currentTime = Date.now();
    
    if (autoAdvanceEnabled) {
      // We're pausing the game - store current progress in milliseconds
      // Convert percentage to milliseconds
      const progressInMs = (timeProgress / 100) * DAY_DURATION_MS;
      useTime.getState().setAccumulatedProgress(progressInMs);
      useTime.getState().setPausedTimestamp(currentTime);
      setAutoAdvance(false);
    } else {
      // We're resuming the game
      // Get paused data from the store
      const { pausedTimestamp, accumulatedProgress } = useTime.getState();
      
      // If we have accumulated progress, use it
      if (accumulatedProgress > 0) {
        // Calculate the adjusted progress percentage
        const adjustedProgress = (accumulatedProgress / DAY_DURATION_MS) * 100;
        setTimeProgress(adjustedProgress);
      }
      
      updateLastTickTime(currentTime);
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
  }, [autoAdvanceEnabled, setTimeSpeed]);
  
  // Auto day advancement timer
  useEffect(() => {
    if (!autoAdvanceEnabled) return;
    
    // Update the last tick time when starting
    if (lastTickTime === 0) {
      updateLastTickTime(Date.now());
    }
    
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - lastTickTime;
      
      // Apply time multiplier to the elapsed time
      const adjustedElapsed = elapsed * timeMultiplier;
      const progress = (adjustedElapsed / DAY_DURATION_MS) * 100;
      
      setTimeProgress(Math.min(progress, 100));
      
      // If a full day has passed, advance the day
      if (adjustedElapsed >= DAY_DURATION_MS) {
        // Process daily finances
        processDailyFinances();
        
        // Process daily character update (including salary)
        useCharacter.getState().processDailyUpdate();
        
        // Advance the day
        advanceTime();
        playSuccess();
        
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
          
          // Calculate summary information for the toast
          const propertyIncome = characterState.properties.reduce((total, property) => 
            total + property.income, 0);
          const lifestyleExpenses = characterState.lifestyleItems.reduce((total, item) => {
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
            characterState.monthlyUpdate();
            
            // Update the last expense month to prevent double-charging
            setLastExpenseMonth(monthId);
            console.log(`Set last expense month to: ${monthId}`);
          } else {
            console.log(`Skipping expense deduction for month ${monthId} as it was already processed`);
          }
          
          // Calculate total monthly expenses
          const housingExpense = characterState.housingType === 'rental' ? 1800 : 
                              characterState.housingType === 'shared' ? 900 : 0;
          
          const transportationExpense = characterState.vehicleType === 'economy' ? 300 :
                                     characterState.vehicleType === 'standard' ? 450 :
                                     characterState.vehicleType === 'luxury' ? 1000 :
                                     characterState.vehicleType === 'premium' ? 1500 :
                                     characterState.vehicleType === 'bicycle' ? 50 : 0;
          
          const foodExpense = 600; // Standard food expense
          
          const totalExpenses = lifestyleExpenses + housingExpense + transportationExpense + foodExpense;
          
          // Show the end-of-month summary toast with a more comprehensive breakdown
          toast(
            <div className="max-w-md w-full bg-background rounded-lg pointer-events-auto border-border flex flex-col">
              <div className="p-4">
                <div className="flex flex-col space-y-2 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">End of Month Financial Summary</span>
                    </div>
                  </div>
                  
                  {/* Income section */}
                  <div className="bg-green-500/10 rounded-md p-2 mb-1">
                    <div className="text-green-600 dark:text-green-400 font-medium mb-1">Monthly Income</div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Salary:</span>
                      <span className="font-semibold text-green-500">+{formatCurrency(monthlySalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Property Income:</span>
                      <span className="font-semibold text-green-500">+{formatCurrency(propertyIncome)}</span>
                    </div>
                    <div className="border-t border-green-500/20 mt-1 pt-1 flex justify-between">
                      <span className="font-medium">Total Income:</span>
                      <span className="font-semibold text-green-500">+{formatCurrency(totalInc)}</span>
                    </div>
                  </div>
                  
                  {/* Expenses section */}
                  <div className="bg-red-500/10 rounded-md p-2 mb-1">
                    <div className="text-red-600 dark:text-red-400 font-medium mb-1">Monthly Expenses</div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Housing:</span>
                      <span className="font-semibold text-red-500">-{formatCurrency(housingExpense)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Transportation:</span>
                      <span className="font-semibold text-red-500">-{formatCurrency(transportationExpense)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Food & Groceries:</span>
                      <span className="font-semibold text-red-500">-{formatCurrency(foodExpense)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Lifestyle:</span>
                      <span className="font-semibold text-red-500">-{formatCurrency(lifestyleExpenses)}</span>
                    </div>
                    <div className="border-t border-red-500/20 mt-1 pt-1 flex justify-between">
                      <span className="font-medium">Total Expenses:</span>
                      <span className="font-semibold text-red-500">-{formatCurrency(totalExpenses)}</span>
                    </div>
                  </div>
                  
                  {/* Final summary section */}
                  <div className="border-t border-border pt-2 mt-1 flex justify-between">
                    <span className="font-medium">Monthly Net Change:</span>
                    <span className={`font-semibold ${netChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
                    </span>
                  </div>
                </div>
              </div>
            </div>,
            { 
              duration: 15000, // Show for 15 seconds since there's more information
              position: 'bottom-right',
              icon: null,
              style: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                padding: 0,
                width: 'auto',
                border: 'none',
              }
            }
          );
        }
        
        // Check for unlockable achievements
        checkAllAchievements();
        
        // Reset timer
        updateLastTickTime(currentTime);
        setTimeProgress(0);
      }
    }, 1000); // Update progress every second
    
    return () => clearInterval(intervalId);
  }, [
    autoAdvanceEnabled, 
    lastTickTime, 
    timeMultiplier, 
    advanceTime, 
    playSuccess, 
    setTimeProgress, 
    updateLastTickTime, 
    lastExpenseMonth, 
    setLastExpenseMonth
  ]);
  
  // Handle manual time advance
  const handleAdvanceTime = () => {
    // Process daily finances when manually advancing time too
    processDailyFinances();
    
    // Process daily character update (including salary)
    useCharacter.getState().processDailyUpdate();
    
    // Advance the day
    advanceTime();
    playSuccess();
    
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
        // This includes deducting lifestyle expenses and showing visual feedback
        characterState.monthlyUpdate();
        
        // Update the last expense month to prevent double-charging
        setLastExpenseMonth(monthId);
        console.log(`Set last expense month to: ${monthId}`);
      } else {
        console.log(`Skipping expense deduction for month ${monthId} as it was already processed`);
      }
      
      // Calculate monthly expenses and income for the report
      const housingExpense = characterState.housingType === 'rental' ? 1800 : 
                          characterState.housingType === 'shared' ? 900 : 0;
      
      const transportationExpense = characterState.vehicleType === 'economy' ? 300 :
                                 characterState.vehicleType === 'standard' ? 450 :
                                 characterState.vehicleType === 'luxury' ? 1000 :
                                 characterState.vehicleType === 'premium' ? 1500 :
                                 characterState.vehicleType === 'bicycle' ? 50 : 0;
      
      const foodExpense = 600; // Standard food expense
      
      const totalExpenses = lifestyleExpenses + housingExpense + transportationExpense + foodExpense;
      const totalIncome = propertyIncome + monthlySalary;
      const monthlyNet = totalIncome - totalExpenses;
      
      // Show the end-of-month summary toast with a more comprehensive breakdown
      toast(
        <div className="max-w-md w-full bg-background rounded-lg pointer-events-auto border-border flex flex-col">
          <div className="p-4">
            <div className="flex flex-col space-y-2 text-xs">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">End of Month Financial Summary</span>
                </div>
              </div>
              
              {/* Income section */}
              <div className="bg-green-500/10 rounded-md p-2 mb-1">
                <div className="text-green-600 dark:text-green-400 font-medium mb-1">Monthly Income</div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Salary:</span>
                  <span className="font-semibold text-green-500">+{formatCurrency(monthlySalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Property Income:</span>
                  <span className="font-semibold text-green-500">+{formatCurrency(propertyIncome)}</span>
                </div>
                <div className="border-t border-green-500/20 mt-1 pt-1 flex justify-between">
                  <span className="font-medium">Total Income:</span>
                  <span className="font-semibold text-green-500">+{formatCurrency(totalIncome)}</span>
                </div>
              </div>
              
              {/* Expenses section */}
              <div className="bg-red-500/10 rounded-md p-2 mb-1">
                <div className="text-red-600 dark:text-red-400 font-medium mb-1">Monthly Expenses</div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Housing:</span>
                  <span className="font-semibold text-red-500">-{formatCurrency(housingExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Transportation:</span>
                  <span className="font-semibold text-red-500">-{formatCurrency(transportationExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Food & Groceries:</span>
                  <span className="font-semibold text-red-500">-{formatCurrency(foodExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Lifestyle:</span>
                  <span className="font-semibold text-red-500">-{formatCurrency(lifestyleExpenses)}</span>
                </div>
                <div className="border-t border-red-500/20 mt-1 pt-1 flex justify-between">
                  <span className="font-medium">Total Expenses:</span>
                  <span className="font-semibold text-red-500">-{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
              
              {/* Final summary section */}
              <div className="border-t border-border pt-2 mt-1 flex justify-between">
                <span className="font-medium">Monthly Net Change:</span>
                <span className={`font-semibold ${totalIncome - totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>,
        { 
          duration: 15000, // Show for 15 seconds since there's more information
          position: 'bottom-right',
          icon: null,
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            padding: 0,
            width: 'auto',
            border: 'none',
          }
        }
      );
    }
    
    // Check for unlockable achievements
    checkAllAchievements();
    
    // Reset the timer
    updateLastTickTime(Date.now());
    setTimeProgress(0);
  };
  
  return (
    <div className="w-full min-h-screen pointer-events-none">
      {/* Top bar with wealth - fixed at top of viewport */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-border/40 text-foreground p-3 flex justify-between items-center pointer-events-auto z-50 transition-all duration-300">
        {/* Wealth indicator - most important info */}
        <div className="flex items-center transition-all duration-300 hover:scale-105 space-x-3" aria-label="Current wealth and net worth">
          <div className="p-2 rounded-full bg-quaternary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-quaternary" />
          </div>
          <div>
            <p className="text-xl font-bold">{formatCurrency(wealth)}</p>
            <p className="text-xs text-muted-foreground">Net Worth: {formatCurrency(netWorth)}</p>
          </div>
        </div>
        
        {/* Date - placed center */}
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
          
          {/* Day/Night cycle indicator */}
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
              <span className="text-xs font-medium whitespace-nowrap">
                {autoAdvanceEnabled ? 
                  timeSpeed === 'superfast' ? 
                    `${Math.max(0, Math.floor((24 - (timeProgress * 24 / 100)) / 6))}s (6x)` : 
                  timeSpeed === 'fast' ? 
                    `${Math.max(0, Math.floor((24 - (timeProgress * 24 / 100)) / 3))}s (3x)` : 
                    `${Math.max(0, Math.floor(24 - (timeProgress * 24 / 100)))}s` 
                  : "Paused"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Time control buttons */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button 
              variant={autoAdvanceEnabled ? "outline" : "default"}
              size="sm"
              onClick={toggleAutoAdvance}
              className={autoAdvanceEnabled ? 
                "border-quaternary/80 text-quaternary" : 
                "bg-quaternary/80 hover:bg-quaternary/90 text-white"}
              aria-label={autoAdvanceEnabled ? "Pause time passage" : "Resume time passage"}
              onMouseEnter={() => setShowTooltip('time-toggle')}
              onMouseLeave={() => setShowTooltip('')}
            >
              <Clock className="mr-2 h-4 w-4" />
              {autoAdvanceEnabled ? "Time: Flowing" : "Time: Paused"}
            </Button>
            {showTooltip === 'time-toggle' && (
              <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40 whitespace-nowrap">
                Press Space to toggle play/pause
              </span>
            )}
          </div>
          
          {autoAdvanceEnabled && (
            <div className="flex space-x-1">
              <div className="relative">
                <Button
                  variant={timeSpeed === 'normal' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeSpeed('normal')}
                  className={timeSpeed === 'normal' ? 
                    "bg-emerald-600 hover:bg-emerald-700 text-white" : 
                    "border-emerald-600 text-emerald-600"}
                  aria-label="Normal speed (1x)"
                  onMouseEnter={() => setShowTooltip('speed-1x')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  1x
                </Button>
                {showTooltip === 'speed-1x' && (
                  <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40 whitespace-nowrap">
                    Press 1 for normal speed
                  </span>
                )}
              </div>
              
              <div className="relative">
                <Button
                  variant={timeSpeed === 'fast' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeSpeed('fast')}
                  className={timeSpeed === 'fast' ? 
                    "bg-amber-600 hover:bg-amber-700 text-white" : 
                    "border-amber-600 text-amber-600"}
                  aria-label="Fast speed (3x)"
                  onMouseEnter={() => setShowTooltip('speed-3x')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  3x
                </Button>
                {showTooltip === 'speed-3x' && (
                  <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40 whitespace-nowrap">
                    Press 2 for fast speed
                  </span>
                )}
              </div>
              
              <div className="relative">
                <Button
                  variant={timeSpeed === 'superfast' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeSpeed('superfast')}
                  className={timeSpeed === 'superfast' ? 
                    "bg-red-600 hover:bg-red-700 text-white" : 
                    "border-red-600 text-red-600"}
                  aria-label="Super fast speed (6x)"
                  onMouseEnter={() => setShowTooltip('speed-6x')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  6x
                </Button>
                {showTooltip === 'speed-6x' && (
                  <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40 whitespace-nowrap">
                    Press 3 for super fast speed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom navigation - fixed at bottom of viewport */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/40 text-foreground p-3 flex justify-around pointer-events-auto z-50">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/')}
          onMouseEnter={() => setShowTooltip('dashboard')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative py-4 glass-effect hover:bg-secondary/60"
          aria-label="Go to Dashboard"
        >
          <div className="p-2 rounded-full bg-secondary/10 mr-2">
            <Briefcase className="h-5 w-5 text-secondary" />
          </div>
          <span className="text-base">Dashboard</span>
          {showTooltip === 'dashboard' && (
            <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40">
              Dashboard
            </span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/job')}
          onMouseEnter={() => setShowTooltip('job')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative py-4 glass-effect hover:bg-secondary/60"
          aria-label="Go to Job"
        >
          <div className="p-2 rounded-full bg-indigo-500/10 mr-2">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
          </div>
          <span className="text-base">Career</span>
          {showTooltip === 'job' && (
            <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40">
              Career
            </span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/investments')}
          onMouseEnter={() => setShowTooltip('investments')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative py-4 glass-effect hover:bg-secondary/60"
          aria-label="Go to Investments"
        >
          <div className="p-2 rounded-full bg-quaternary/10 mr-2">
            <ChartBar className="h-5 w-5 text-quaternary" />
          </div>
          <span className="text-base">Investments</span>
          {showTooltip === 'investments' && (
            <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40">
              Investments
            </span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/properties')}
          onMouseEnter={() => setShowTooltip('properties')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative py-4 glass-effect hover:bg-secondary/60"
          aria-label="Go to Properties"
        >
          <div className="p-2 rounded-full bg-quinary/10 mr-2">
            <Home className="h-5 w-5 text-quinary" />
          </div>
          <span className="text-base">Properties</span>
          {showTooltip === 'properties' && (
            <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40">
              Properties
            </span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/lifestyle')}
          onMouseEnter={() => setShowTooltip('lifestyle')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative py-4 glass-effect hover:bg-secondary/60"
          aria-label="Go to Lifestyle"
        >
          <div className="p-2 rounded-full bg-tertiary/10 mr-2">
            <ShoppingBag className="h-5 w-5 text-tertiary" />
          </div>
          <span className="text-base">Lifestyle</span>
          {showTooltip === 'lifestyle' && (
            <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40">
              Lifestyle
            </span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/achievements')}
          onMouseEnter={() => setShowTooltip('achievements')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative py-4 glass-effect hover:bg-secondary/60"
          aria-label="Go to Achievements"
        >
          <div className="p-2 rounded-full bg-yellow-500/10 mr-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <span className="text-base">Achievements</span>
          {showTooltip === 'achievements' && (
            <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium shadow-lg animate-fade-in border border-border/40">
              Achievements
            </span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setMuted(!isMuted)}
          onMouseEnter={() => setShowTooltip('sound')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative glass-effect h-14 w-14 rounded-full p-0"
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
        >
          <div className={`p-3 rounded-full ${isMuted ? 'bg-destructive/10' : 'bg-secondary/10'}`}>
            {isMuted ? <VolumeX className={`h-5 w-5 text-destructive`} /> : <Volume2 className={`h-5 w-5 text-secondary`} />}
          </div>
          {showTooltip === 'sound' && (
            <span className="absolute -top-10 bg-popover/80 backdrop-blur-md px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap shadow-lg animate-fade-in border border-border/40">
              {isMuted ? "Unmute Sound" : "Mute Sound"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default GameUI;