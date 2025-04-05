import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Award, DollarSign, TrendingUp, Star, X } from 'lucide-react';
import { useAudio } from '../lib/stores/useAudio';
import { useAchievements, Achievement } from '../lib/stores/useAchievements';
import { Button } from './ui/button';

interface AchievementIconProps {
  iconName: string;
  className?: string;
}

const AchievementIcon = ({ iconName, className }: AchievementIconProps) => {
  const iconProps = { className: cn('h-6 w-6', className) };
  
  switch (iconName) {
    case 'Award': return <Award {...iconProps} />;
    case 'Trophy': return <Trophy {...iconProps} />;
    case 'DollarSign': return <DollarSign {...iconProps} />;
    case 'TrendingUp': return <TrendingUp {...iconProps} />;
    case 'Star': return <Star {...iconProps} />;
    // Add other icons as needed
    default: return <Star {...iconProps} />;
  }
};

export const AchievementNotification = () => {
  const [visible, setVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);
  const { playUISound } = useAudio();
  const { newlyUnlockedAchievements, clearNewlyUnlocked } = useAchievements();
  
  // Check for newly unlocked achievements and add them to the queue
  useEffect(() => {
    if (newlyUnlockedAchievements.length > 0) {
      setQueue(prev => [...prev, ...newlyUnlockedAchievements]);
      clearNewlyUnlocked();
    }
  }, [newlyUnlockedAchievements, clearNewlyUnlocked]);
  
  // Process the queue
  useEffect(() => {
    if (queue.length > 0 && !visible && !currentAchievement) {
      // Take the first achievement from the queue
      const next = queue[0];
      setCurrentAchievement(next);
      setQueue(prev => prev.slice(1));
      setVisible(true);
      
      // Play a success sound when showing a new achievement
      playUISound('success');
    }
  }, [queue, visible, currentAchievement, playUISound]);
  
  // Auto-hide the notification after a delay
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        
        // After animation completes, clear the current achievement
        const cleanupTimer = setTimeout(() => {
          setCurrentAchievement(null);
        }, 500); // match transition duration
        
        return () => clearTimeout(cleanupTimer);
      }, 5000); // Show for 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  const handleClose = () => {
    setVisible(false);
    // After animation completes, clear the current achievement
    setTimeout(() => {
      setCurrentAchievement(null);
    }, 500); // match transition duration
  };
  
  if (!currentAchievement) return null;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wealth': return 'bg-gradient-to-r from-[var(--wealth-color-start)] to-[var(--wealth-color-end)]';
      case 'property': return 'bg-gradient-to-r from-[var(--property-color-start)] to-[var(--property-color-end)]';
      case 'investment': return 'bg-gradient-to-r from-[var(--investment-color-start)] to-[var(--investment-color-end)]';
      case 'lifestyle': return 'bg-gradient-to-r from-[var(--lifestyle-color-start)] to-[var(--lifestyle-color-end)]';
      case 'general': return 'bg-gradient-to-r from-[var(--general-color-start)] to-[var(--general-color-end)]';
      case 'challenge': return 'bg-gradient-to-r from-[var(--challenge-color-start)] to-[var(--challenge-color-end)]';
      case 'strategy': return 'bg-gradient-to-r from-[var(--strategy-color-start)] to-[var(--strategy-color-end)]';
      default: return 'bg-gradient-to-r from-primary to-primary-foreground';
    }
  };
  
  return (
    <div 
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-md w-full md:w-auto p-4 rounded-lg shadow-lg',
        'transition-all duration-500 transform',
        getCategoryColor(currentAchievement.category),
        visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      )}
    >
      <Button 
        size="sm" 
        variant="ghost" 
        className="absolute top-1 right-1 h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/10"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 p-2 bg-white/20 rounded-full mr-3">
          <AchievementIcon 
            iconName={currentAchievement.icon} 
            className="text-white"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <Trophy className="h-4 w-4 text-yellow-300 mr-1.5" />
            <h3 className="text-white font-semibold text-base">Achievement Unlocked!</h3>
          </div>
          
          <h4 className="text-white font-medium mt-1">{currentAchievement.title}</h4>
          <p className="text-white/80 text-sm mt-1">{currentAchievement.description}</p>
          
          {currentAchievement.reward && (
            <div className="mt-2 bg-white/10 px-3 py-2 rounded text-sm">
              <div className="font-medium text-white">Reward:</div>
              <div className="text-white/90">{currentAchievement.reward.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;