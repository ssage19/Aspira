import { 
  Heart, 
  Award, 
  BookOpen, 
  Users, 
  Wind, 
  Clock, 
  Leaf, 
  HeartPulse,
  Activity,
  User,
  Brain,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  ThumbsUp,
  Calendar,
  Coffee,
  Droplet,
  Battery,
  Home,
  Car
} from 'lucide-react';

import { useCharacter } from '../lib/stores/useCharacter';
import { Progress } from './ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

// Define attribute details
interface AttributeDetails {
  name: string;
  icon: React.ReactNode;
  description: string;
  scale: string[];
  levels: string[];
  colors: string[];
  isInverted?: boolean;
  isSpecialScale?: boolean;
  unit?: string;
}

export function CharacterAttributes() {
  const { 
    health, 
    skills: { intelligence, creativity, charisma, technical, leadership },
    stress, 
    socialConnections,
    freeTime,
    timeCommitment,
    environmentalImpact,
    happiness,
    prestige,
    // Basic needs
    hunger,
    thirst,
    energy,
    comfort,
    // Transportation & Housing
    hasVehicle,
    vehicleType,
    housingType
  } = useCharacter();
  
  // Calculate an average skill level for display
  const skills = Math.round((intelligence + creativity + charisma + technical + leadership) / 5);
  
  // Define attribute configuration with human-readable scales
  const attributeConfigs: Record<string, AttributeDetails> = {
    // Core attributes
    health: {
      name: 'Health',
      icon: <Heart className="h-4 w-4" />,
      description: 'Physical and mental wellbeing',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Critical', 'Poor', 'Average', 'Good', 'Excellent'],
      colors: ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-green-500', 'text-green-600']
    },
    happiness: {
      name: 'Happiness',
      icon: <HeartPulse className="h-4 w-4" />,
      description: 'Overall life satisfaction',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Miserable', 'Unhappy', 'Content', 'Happy', 'Blissful'],
      colors: ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-green-500', 'text-green-600']
    },
    socialConnections: {
      name: 'Social Network',
      icon: <Users className="h-4 w-4" />,
      description: 'Quality and quantity of relationships',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Isolated', 'Limited', 'Moderate', 'Strong', 'Thriving'],
      colors: ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-blue-500', 'text-blue-600']
    },
    skills: {
      name: 'Skills',
      icon: <BookOpen className="h-4 w-4" />,
      description: 'Developed abilities and knowledge',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
      colors: ['text-gray-500', 'text-blue-400', 'text-blue-500', 'text-purple-500', 'text-purple-600']
    },
    stress: {
      name: 'Stress',
      icon: <Activity className="h-4 w-4" />,
      description: 'Mental pressure and tension',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Minimal', 'Low', 'Moderate', 'High', 'Extreme'],
      colors: ['text-green-600', 'text-green-500', 'text-amber-500', 'text-orange-500', 'text-red-500'],
      isInverted: true
    },
    timeManagement: {
      name: 'Time Management',
      icon: <Clock className="h-4 w-4" />,
      description: 'Balance of free time vs commitments',
      scale: ['High Ratio', 'Good Ratio', 'Balanced', 'Low Ratio', 'Very Low'],
      levels: ['Relaxed', 'Balanced', 'Busy', 'Hectic', 'Overwhelmed'],
      colors: ['text-green-600', 'text-green-500', 'text-amber-500', 'text-orange-500', 'text-red-500'],
      isSpecialScale: true,
      unit: 'hrs'
    },
    environmentalImpact: {
      name: 'Environmental Impact',
      icon: <Leaf className="h-4 w-4" />,
      description: 'Effect on the environment',
      scale: ['< -60', '-60 to -30', '-30 to 0', '0 to 50', '> 50'],
      levels: ['Harmful', 'Concerning', 'Neutral', 'Positive', 'Sustainable'],
      colors: ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-green-500', 'text-green-600'],
      isSpecialScale: true
    },
    prestige: {
      name: 'Prestige',
      icon: <Award className="h-4 w-4" />,
      description: 'Social status and recognition',
      scale: ['0-20', '21-40', '41-60', '61-80', '81+'],
      levels: ['Unknown', 'Recognized', 'Respected', 'Influential', 'Elite'],
      colors: ['text-gray-500', 'text-blue-400', 'text-purple-500', 'text-purple-600', 'text-yellow-500']
    },
    
    // Basic needs
    hunger: {
      name: 'Hunger',
      icon: <Coffee className="h-4 w-4" />,
      description: 'Satiety and nutritional status',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Starving', 'Hungry', 'Satisfied', 'Full', 'Very Full'],
      colors: ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-green-500', 'text-green-600']
    },
    thirst: {
      name: 'Hydration',
      icon: <Droplet className="h-4 w-4" />,
      description: 'Fluid balance and hydration',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Dehydrated', 'Thirsty', 'Hydrated', 'Well-Hydrated', 'Perfectly Hydrated'],
      colors: ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-blue-500', 'text-blue-600']
    },
    energy: {
      name: 'Energy',
      icon: <Battery className="h-4 w-4" />,
      description: 'Physical and mental energy levels',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Exhausted', 'Tired', 'Rested', 'Energetic', 'Fully Charged'],
      colors: ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-green-500', 'text-green-600']
    },
    comfort: {
      name: 'Comfort',
      icon: <Home className="h-4 w-4" />,
      description: 'Housing and general comfort',
      scale: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      levels: ['Miserable', 'Uncomfortable', 'Adequate', 'Comfortable', 'Luxurious'],
      colors: ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-green-500', 'text-green-600']
    }
  };
  
  // Helper function to get level index for a given value
  const getLevelIndex = (value: number, attributeName: string): number => {
    const config = attributeConfigs[attributeName];
    
    if (!config) return 2; // Default to middle if config not found
    
    if (config.isSpecialScale) {
      // Handle special scales
      if (attributeName === 'environmentalImpact') {
        if (value >= 50) return 4;
        if (value >= 0) return 3;
        if (value >= -30) return 2;
        if (value >= -60) return 1;
        return 0;
      }
      
      if (attributeName === 'timeManagement') {
        // For time management, we use the ratio of free time to committed time
        const ratio = freeTime / (timeCommitment || 1);
        if (ratio > 3) return 0; // Relaxed
        if (ratio > 2) return 1; // Balanced
        if (ratio > 1) return 2; // Busy
        if (ratio > 0.5) return 3; // Hectic
        return 4; // Overwhelmed
      }
    } else {
      // Standard percentile scales
      if (value >= 80) return 4;
      if (value >= 60) return 3;
      if (value >= 40) return 2;
      if (value >= 20) return 1;
      return 0;
    }
    
    return 2; // Default to middle
  };
  
  // Format display value based on attribute
  const formatValue = (value: number, attributeName: string): string => {
    const config = attributeConfigs[attributeName];
    
    if (attributeName === 'timeManagement') {
      return `${freeTime}${config.unit} free / ${timeCommitment}${config.unit} used`;
    }
    
    if (attributeName === 'environmentalImpact') {
      return value.toString(); // No % for environmental impact
    }
    
    return attributeName === 'prestige' ? value.toString() : `${value}%`;
  };
  
  // Render each attribute with visual indicator and description
  const renderAttribute = (attributeName: string, value: number) => {
    const config = attributeConfigs[attributeName];
    if (!config) return null;
    
    const levelIndex = getLevelIndex(value, attributeName);
    const displayLevel = config.levels[levelIndex];
    const color = config.colors[levelIndex];
    const displayValue = formatValue(value, attributeName);
    
    // Calculate progress value
    let progressValue: number;
    
    if (attributeName === 'environmentalImpact') {
      // Convert -100 to 100 range to 0-100 for progress bar
      progressValue = ((value + 100) / 200) * 100;
    } else if (attributeName === 'timeManagement') {
      // For time management, use the ratio-based calculation
      const ratio = freeTime / (timeCommitment || 1);
      progressValue = Math.min(100, Math.max(0, ratio * 33.33)); // Scale to make 3:1 ratio = 100%
    } else {
      progressValue = value;
    }
    
    // Invert progress for stress (lower is better)
    if (config.isInverted) {
      progressValue = 100 - progressValue;
    }
    
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1 items-center">
          <div className="flex items-center">
            <span className={`mr-2 ${color}`}>{config.icon}</span>
            <span className="text-sm font-medium">{config.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${color}`}>{displayLevel}</span>
            <span className="text-xs text-gray-500">{displayValue}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative pt-1">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-700", color.replace('text-', 'bg-'))}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          
          {/* Scale indicators */}
          <div className="flex justify-between mt-1 text-[0.65rem] text-gray-400">
            {config.scale.map((label, i) => (
              <div 
                key={i} 
                className={cn(
                  "relative", 
                  i === levelIndex ? color : "text-gray-400",
                  i === levelIndex ? "font-medium" : ""
                )}
              >
                {i === levelIndex && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('text-', 'bg-'))}></div>
                  </div>
                )}
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Calculate the time management score based on free time vs committed time
  const timeManagementValue = Math.max(0, Math.min(100, (freeTime / (freeTime + timeCommitment) * 100))); 
  
  // Helper function to render housing status
  const renderHousingStatus = () => {
    let housingLabel = '';
    let housingIcon = <Home className="mr-2 h-4 w-4" />;
    let colorClass = 'text-gray-500';
    
    switch(housingType) {
      case 'homeless':
        housingLabel = 'Homeless';
        colorClass = 'text-red-500';
        break;
      case 'shared':
        housingLabel = 'Shared Housing';
        colorClass = 'text-amber-500';
        break;
      case 'rental':
        housingLabel = 'Rental Housing';
        colorClass = 'text-green-500';
        break;
      case 'owned':
        housingLabel = 'Home Owner';
        colorClass = 'text-blue-500';
        break;
      case 'luxury':
        housingLabel = 'Luxury Housing';
        colorClass = 'text-purple-500';
        break;
    }
    
    return (
      <div className="flex items-center mb-2">
        <span className={`${colorClass}`}>{housingIcon}</span>
        <span className={`text-sm font-medium ${colorClass}`}>{housingLabel}</span>
      </div>
    );
  };
  
  // Helper function to render vehicle status
  const renderVehicleStatus = () => {
    let vehicleLabel = 'No Vehicle';
    let vehicleIcon = <Car className="mr-2 h-4 w-4" />;
    let colorClass = 'text-gray-500';
    
    if (hasVehicle) {
      switch(vehicleType) {
        case 'bicycle':
          vehicleLabel = 'Bicycle';
          colorClass = 'text-green-500';
          break;
        case 'economy':
          vehicleLabel = 'Economy Car';
          colorClass = 'text-amber-500';
          break;
        case 'standard':
          vehicleLabel = 'Standard Car';
          colorClass = 'text-blue-500';
          break;
        case 'luxury':
          vehicleLabel = 'Luxury Car';
          colorClass = 'text-purple-500';
          break;
        case 'premium':
          vehicleLabel = 'Premium Car';
          colorClass = 'text-yellow-500';
          break;
      }
    }
    
    return (
      <div className="flex items-center">
        <span className={`${colorClass}`}>{vehicleIcon}</span>
        <span className={`text-sm font-medium ${colorClass}`}>{vehicleLabel}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-500" />
            Personal Attributes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {renderAttribute('health', health)}
              {renderAttribute('happiness', happiness)}
              {renderAttribute('socialConnections', socialConnections)}
              {renderAttribute('skills', skills)}
            </div>
            <div>
              {renderAttribute('stress', stress)}
              {renderAttribute('timeManagement', timeManagementValue)}
              {renderAttribute('environmentalImpact', environmentalImpact)}
              {renderAttribute('prestige', prestige)}
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Your attributes are affected by your lifestyle choices, purchases, and hobbies.</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Heart className="mr-2 h-5 w-5 text-red-500" />
            Basic Needs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {renderAttribute('hunger', hunger)}
              {renderAttribute('thirst', thirst)}
            </div>
            <div>
              {renderAttribute('energy', energy)}
              {renderAttribute('comfort', comfort)}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Living Situation</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                {renderHousingStatus()}
              </div>
              <div>
                {renderVehicleStatus()}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Your basic needs affect your health and happiness. Be sure to maintain them!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CharacterAttributes;