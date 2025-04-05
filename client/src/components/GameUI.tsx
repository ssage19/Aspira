import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useAudio } from '../lib/stores/useAudio';
import useEconomy from '../lib/stores/useEconomy';
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
  GraduationCap
} from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/utils';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { checkAllAchievements } from '../lib/services/achievementTracker';

// New time scale: 5 minutes = 2 weeks (14 days) in-game time
// So, each in-game day would last approximately 21.43 seconds of real time (5 * 60 / 14)
const DAY_DURATION_MS = (5 * 60 * 1000) / 14; // about 21,429 ms per in-game day

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
    // Calculate income from properties
    const { properties, lifestyleItems } = useCharacter.getState();
    
    // Property income
    const propertyIncome = properties.reduce((total, property) => {
      return total + property.monthlyIncome / 30; // Daily income from monthly income
    }, 0);
    
    // Property expenses (maintenance, taxes, etc.) - using a fixed percentage of property value
    const propertyExpenses = properties.reduce((total, property) => {
      return total + (property.currentValue * 0.0001); // 0.01% of property value per day for expenses
    }, 0);
    
    // Lifestyle item maintenance costs
    const lifestyleExpenses = lifestyleItems.reduce((total, item) => {
      return total + (item.monthlyCost / 30); // Daily expenses from monthly cost
    }, 0);
    
    // Process investments - this doesn't directly affect cash, just net worth
    const investmentChanges = updateInvestments();
    
    // Calculate net daily change from income/expenses
    const netDailyChange = propertyIncome - propertyExpenses - lifestyleExpenses;
    
    // Apply cash flow changes to character's wealth
    if (netDailyChange !== 0) {
      addWealth(netDailyChange);
    }
    
    // We're removing the financial notification completely per user request
    // The function still processes all finances but doesn't display notification
    
    // For reference/debugging, we can still access:
    const gains = investmentChanges.gains || 0;
    const losses = investmentChanges.losses || 0;
    
    // Return the summary for potential other uses
    return {
      income: propertyIncome,
      expenses: propertyExpenses + lifestyleExpenses,
      net: netDailyChange,
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
        
        // Check for monthly updates (every 30 days)
        if (dayCounter % 30 === 0) {
          useEconomy.getState().processMonthlyUpdate();
          console.log("Monthly update processed on day counter:", dayCounter);
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
    updateLastTickTime
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
    
    // Check for monthly updates (every 30 days)
    if (dayCounter % 30 === 0) {
      useEconomy.getState().processMonthlyUpdate();
      console.log("Monthly update processed on day counter:", dayCounter);
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
              <p className="text-sm font-medium">{`${currentMonth}/${currentDay}/${currentYear}`}</p>
            </div>
          </div>
          
          {/* Day progress bar */}
          <div className="w-64 flex items-center gap-2">
            <Progress value={timeProgress} className="h-2" 
              aria-label={autoAdvanceEnabled ? `${Math.floor(timeProgress)}% until next day` : "Auto-advance disabled"} />
            <span className="text-xs font-medium">
              {autoAdvanceEnabled ? 
                timeSpeed === 'superfast' ? 
                  `${Math.max(0, Math.floor((21.43 - (timeProgress * 21.43 / 100)) / 6))}s left (6x)` : 
                timeSpeed === 'fast' ? 
                  `${Math.max(0, Math.floor((21.43 - (timeProgress * 21.43 / 100)) / 3))}s left (3x)` : 
                  `${Math.max(0, Math.floor(21.43 - (timeProgress * 21.43 / 100)))}s left` 
                : "Paused"}
            </span>
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