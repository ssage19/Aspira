import React from 'react';
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
  Gem
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AchievementIconProps {
  iconName: string;
  className?: string;
}

const AchievementIcon: React.FC<AchievementIconProps> = ({ iconName, className }) => {
  const iconProps = { className: cn('h-5 w-5', className) };
  
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
    case 'GEM': return <Gem {...iconProps} />;
    default: return <Trophy {...iconProps} />;
  }
};

export default AchievementIcon;