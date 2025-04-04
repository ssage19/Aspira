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
  VolumeX
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
      <div className="fixed top-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white p-3 flex justify-between items-center pointer-events-auto z-50 transition-opacity duration-300">
        {/* Wealth indicator - most important info */}
        <div className="flex items-center transition-all duration-300 hover:scale-105" aria-label="Current wealth and net worth">
          <DollarSign className="mr-1 h-5 w-5 text-accessible-green" />
          <div>
            <p className="text-xl font-bold">{formatCurrency(wealth)}</p>
            <p className="text-xs">Net Worth: {formatCurrency(netWorth)}</p>
          </div>
        </div>
        
        {/* Date - placed center */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center" aria-label="Current date">
          <Calendar className="mr-1 h-4 w-4" />
          <div>
            <p className="text-sm font-medium">{`${currentMonth}/${currentDay}/${currentYear}`}</p>
          </div>
        </div>
        
        {/* Next day button - most common action */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleAdvanceTime}
          className="ml-2 transition-colors duration-200 hover:bg-accessible-blue/20"
          aria-label="Advance to next day"
        >
          <Calendar className="mr-1 h-4 w-4" />
          Next Day
        </Button>
      </div>
      
      {/* Bottom navigation - fixed at bottom of viewport */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white p-3 flex justify-around pointer-events-auto z-50">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/')}
          onMouseEnter={() => setShowTooltip('dashboard')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative py-4 focus:ring-2 focus:ring-accessible-blue focus:ring-offset-1"
          aria-label="Go to Dashboard"
        >
          <Briefcase className="h-6 w-6 mr-2 text-accessible-blue" />
          <span className="text-base">Dashboard</span>
          {showTooltip === 'dashboard' && (
            <span className="absolute -top-8 bg-black/80 px-3 py-2 rounded-md text-sm font-medium animate-fade-in">
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
          className="relative py-4 focus:ring-2 focus:ring-accessible-green focus:ring-offset-1"
          aria-label="Go to Investments"
        >
          <ChartBar className="h-6 w-6 mr-2 text-accessible-green" />
          <span className="text-base">Investments</span>
          {showTooltip === 'investments' && (
            <span className="absolute -top-8 bg-black/80 px-3 py-2 rounded-md text-sm font-medium animate-fade-in">
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
          className="relative py-4 focus:ring-2 focus:ring-accessible-purple focus:ring-offset-1"
          aria-label="Go to Properties"
        >
          <Home className="h-6 w-6 mr-2 text-accessible-purple" />
          <span className="text-base">Properties</span>
          {showTooltip === 'properties' && (
            <span className="absolute -top-8 bg-black/80 px-3 py-2 rounded-md text-sm font-medium animate-fade-in">
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
          className="relative py-4 focus:ring-2 focus:ring-accessible-orange focus:ring-offset-1"
          aria-label="Go to Lifestyle"
        >
          <ShoppingBag className="h-6 w-6 mr-2 text-accessible-orange" />
          <span className="text-base">Lifestyle</span>
          {showTooltip === 'lifestyle' && (
            <span className="absolute -top-8 bg-black/80 px-3 py-2 rounded-md text-sm font-medium animate-fade-in">
              Lifestyle
            </span>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute}
          onMouseEnter={() => setShowTooltip('sound')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative h-14 w-14 rounded-full focus:ring-2 focus:ring-white focus:ring-offset-1"
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          {showTooltip === 'sound' && (
            <span className="absolute -top-8 bg-black/80 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap animate-fade-in">
              {isMuted ? "Unmute Sound" : "Mute Sound"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default GameUI;
