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
    <div className="w-full h-full pointer-events-none">
      {/* Top bar with wealth */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center">
          <DollarSign className="mr-1 h-5 w-5 text-green-400" />
          <div>
            <p className="text-xl font-bold">{formatCurrency(wealth)}</p>
            <p className="text-xs">Net Worth: {formatCurrency(netWorth)}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Clock className="mr-1 h-5 w-5" />
          <div>
            <p className="text-sm">{`${currentMonth}/${currentDay}/${currentYear}`}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAdvanceTime}
          className="ml-2"
        >
          <Calendar className="mr-1 h-4 w-4" />
          Next Day
        </Button>
      </div>
      
      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-2 flex justify-around pointer-events-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          onMouseEnter={() => setShowTooltip('dashboard')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative"
        >
          <Briefcase className="h-6 w-6" />
          {showTooltip === 'dashboard' && <span className="absolute -top-8 bg-black px-2 py-1 rounded text-xs">Dashboard</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/investments')}
          onMouseEnter={() => setShowTooltip('investments')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative"
        >
          <ChartBar className="h-6 w-6" />
          {showTooltip === 'investments' && <span className="absolute -top-8 bg-black px-2 py-1 rounded text-xs">Investments</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/properties')}
          onMouseEnter={() => setShowTooltip('properties')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative"
        >
          <Home className="h-6 w-6" />
          {showTooltip === 'properties' && <span className="absolute -top-8 bg-black px-2 py-1 rounded text-xs">Properties</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/lifestyle')}
          onMouseEnter={() => setShowTooltip('lifestyle')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative"
        >
          <ShoppingBag className="h-6 w-6" />
          {showTooltip === 'lifestyle' && <span className="absolute -top-8 bg-black px-2 py-1 rounded text-xs">Lifestyle</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute}
          onMouseEnter={() => setShowTooltip('sound')}
          onMouseLeave={() => setShowTooltip('')}
          className="relative"
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          {showTooltip === 'sound' && <span className="absolute -top-8 bg-black px-2 py-1 rounded text-xs">Toggle Sound</span>}
        </Button>
      </div>
    </div>
  );
}

export default GameUI;
