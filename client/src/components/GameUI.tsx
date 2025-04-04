import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useAudio } from '../lib/stores/useAudio';
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
  Trophy
} from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/utils';

export function GameUI() {
  const navigate = useNavigate();
  const { name, wealth, netWorth, addWealth } = useCharacter();
  const { currentDay, currentMonth, currentYear, advanceTime } = useTime();
  const { toggleMute, isMuted, playSuccess } = useAudio();
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
  
  const handleAdvanceTime = () => {
    advanceTime();
    playSuccess();
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
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-secondary/40 dark:bg-secondary/30 px-4 py-2 rounded-full" aria-label="Current date">
          <Calendar className="h-4 w-4 text-primary dark:text-primary" />
          <div>
            <p className="text-sm font-medium">{`${currentMonth}/${currentDay}/${currentYear}`}</p>
          </div>
        </div>
        
        {/* Next day button - most common action */}
        <Button 
          variant="default"
          size="sm" 
          onClick={handleAdvanceTime}
          className="button-pulse bg-quaternary/80 hover:bg-quaternary/90 text-white dark:bg-quaternary/90 dark:hover:bg-quaternary"
          aria-label="Advance to next day"
        >
          <Clock className="mr-2 h-4 w-4" />
          Next Day
        </Button>
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
          onClick={toggleMute}
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
