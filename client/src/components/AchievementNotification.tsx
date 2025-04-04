import React, { useEffect, useState } from 'react';
import { 
  Award, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Home, 
  Building, 
  Building2, 
  BarChartHorizontal, 
  ShoppingBag, 
  ShoppingCart, 
  Play, 
  Clock, 
  Briefcase,
  Crown, 
  X
} from 'lucide-react';
import { useAchievements, Achievement } from '../lib/stores/useAchievements';
import { cn } from '../lib/utils';

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
    case 'Home': return <Home {...iconProps} />;
    case 'Building': return <Building {...iconProps} />;
    case 'Building2': return <Building2 {...iconProps} />;
    case 'BarChartHorizontal': return <BarChartHorizontal {...iconProps} />;
    case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
    case 'ShoppingCart': return <ShoppingCart {...iconProps} />;
    case 'Play': return <Play {...iconProps} />;
    case 'Clock': return <Clock {...iconProps} />;
    case 'Briefcase': return <Briefcase {...iconProps} />;
    case 'Crown': return <Crown {...iconProps} />;
    default: return <Star {...iconProps} />;
  }
};

export const AchievementNotification = () => {
  const [animateOut, setAnimateOut] = useState(false);
  const { 
    lastAchievementUnlocked, 
    showAchievementNotification, 
    dismissNotification 
  } = useAchievements();
  
  useEffect(() => {
    if (showAchievementNotification) {
      // Start exit animation after 5 seconds
      const timer = setTimeout(() => {
        setAnimateOut(true);
      }, 5000);
      
      // Dismiss notification after animation completes
      const dismissTimer = setTimeout(() => {
        dismissNotification();
        setAnimateOut(false);
      }, 5500);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [showAchievementNotification, dismissNotification]);
  
  if (!showAchievementNotification || !lastAchievementUnlocked) {
    return null;
  }
  
  const handleDismiss = () => {
    setAnimateOut(true);
    setTimeout(() => {
      dismissNotification();
      setAnimateOut(false);
    }, 500);
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wealth': return 'text-quinary';
      case 'property': return 'text-tertiary';
      case 'investment': return 'text-secondary';
      case 'lifestyle': return 'text-purple-500';
      case 'general': return 'text-primary';
      default: return 'text-primary';
    }
  };
  
  const getIconColor = (category: string) => {
    switch (category) {
      case 'wealth': return 'text-quinary';
      case 'property': return 'text-tertiary';
      case 'investment': return 'text-secondary';
      case 'lifestyle': return 'text-purple-500';
      case 'general': return 'text-primary';
      default: return 'text-primary';
    }
  };
  
  const getBackgroundGradient = (category: string) => {
    switch (category) {
      case 'wealth': return 'bg-gradient-to-r from-quinary/10 to-secondary/5';
      case 'property': return 'bg-gradient-to-r from-tertiary/10 to-primary/5';
      case 'investment': return 'bg-gradient-to-r from-secondary/10 to-tertiary/5';
      case 'lifestyle': return 'bg-gradient-to-r from-purple-500/10 to-quinary/5';
      case 'general': return 'bg-gradient-to-r from-primary/10 to-tertiary/5';
      default: return 'bg-gradient-to-r from-primary/10 to-secondary/5';
    }
  };
  
  return (
    <div
      className={cn(
        'fixed top-16 right-4 sm:right-8 z-50 max-w-md w-full',
        'transform transition-all duration-500 ease-in-out',
        'glass-effect backdrop-blur-md rounded-lg shadow-lg',
        getBackgroundGradient(lastAchievementUnlocked.category),
        animateOut 
          ? 'translate-x-full opacity-0' 
          : 'translate-x-0 opacity-100'
      )}
    >
      <div className="relative p-4 sm:p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start">
          <div 
            className={cn(
              'flex-shrink-0 mr-4 p-3 rounded-full',
              `bg-${lastAchievementUnlocked.category}/20`
            )}
          >
            <AchievementIcon 
              iconName={lastAchievementUnlocked.icon} 
              className={getIconColor(lastAchievementUnlocked.category)}
            />
          </div>
          
          <div>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-yellow-400" />
              <h3 className={cn(
                'text-lg font-semibold', 
                getCategoryColor(lastAchievementUnlocked.category)
              )}>
                Achievement Unlocked!
              </h3>
            </div>
            
            <h4 className="font-bold text-xl mt-1">{lastAchievementUnlocked.title}</h4>
            <p className="text-muted-foreground mt-1">{lastAchievementUnlocked.description}</p>
            
            <div className="mt-4 bg-card/50 rounded-lg p-3">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                <span className="font-medium">Reward:</span>
              </div>
              <p className="text-sm mt-1">{lastAchievementUnlocked.reward.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;