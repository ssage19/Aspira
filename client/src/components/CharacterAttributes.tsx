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
import { useEffect, useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { Progress } from './ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn, formatInteger } from '../lib/utils';

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
    skills: { intelligence, creativity, charisma, technical, leadership, physical },
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
  
  // Ensure this component refreshes at the same rate as Dashboard and Essentials
  // This guarantees all UI components show consistent values
  const [_, forceUpdate] = useState({});
  
  useEffect(() => {
    // More aggressive state update approach to ensure all UI components stay in sync
    
    // 1. State refresh interval - always active to ensure UI stays updated
    const stateRefreshInterval = setInterval(() => {
      // Get the current state
      const currentState = useCharacter.getState();
      
      // Force component to rerender by updating state
      // This is needed to ensure the component updates when values increase
      forceUpdate({});
    }, 100); // Even more frequent updates (100ms instead of 250ms)
    
    // 2. Subscribe to ALL basic needs and character state changes
    // This is a more comprehensive subscription that captures all possible state changes
    const unsubscribe = useCharacter.subscribe(
      (state) => [
        state.hunger, 
        state.thirst, 
        state.energy, 
        state.comfort,
        state.health,
        state.stress,
        state.happiness,
        state.socialConnections
      ],
      () => {
        // Force an immediate update whenever any relevant state changes
        forceUpdate({});
      }
    );
    
    // 3. Add an additional subscription specifically for auto-maintenance effects
    // This ensures we catch changes from the auto-maintenance system
    const unsubscribeAutoMaintain = useCharacter.subscribe(
      () => true, // Subscribe to any state change 
      () => {
        // Force update on any state change
        forceUpdate({});
      }
    );
    
    // Cleanup function to prevent memory leaks
    return () => {
      clearInterval(stateRefreshInterval);
      unsubscribe();
      unsubscribeAutoMaintain();
    };
  }, []);
  
  // Calculate total skill points from all skills combined (out of a maximum possible 6000)
  const skills = intelligence + creativity + charisma + technical + leadership + physical;
  
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
      description: 'Total skill points (max 6000)',
      scale: ['0-1200', '1201-2400', '2401-3600', '3601-4800', '4801-6000'],
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
      description: 'Balance of free time vs commitments per week',
      scale: ['120+ hrs free', '80-120 hrs', '50-80 hrs', '20-50 hrs', '< 20 hrs'],
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
      description: 'Social status and recognition (max 3000)',
      scale: ['0-600', '601-1200', '1201-1800', '1801-2400', '2401-3000'],
      levels: ['Unknown', 'Recognized', 'Respected', 'Influential', 'Elite'],
      colors: ['text-gray-500', 'text-blue-400', 'text-purple-500', 'text-purple-600', 'text-yellow-500'],
      isSpecialScale: true
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
        // For time management, we use adjusted free time hours in a 168-hour week
        // Priority to hours used, then calculate free time from that
        const adjustedTimeCommitment = Math.min(timeCommitment, 168);
        const adjustedFreeTime = 168 - adjustedTimeCommitment;
        
        if (adjustedFreeTime >= 120) return 0; // Relaxed: 120+ hrs free (>= 5 days)
        if (adjustedFreeTime >= 80) return 1; // Balanced: 80-120 hrs free (~3.5-5 days)
        if (adjustedFreeTime >= 50) return 2; // Busy: 50-80 hrs free (~2-3.5 days)
        if (adjustedFreeTime >= 20) return 3; // Hectic: 20-50 hrs free (~1-2 days)
        return 4; // Overwhelmed: <20 hrs free (<1 day)
      }
      
      if (attributeName === 'prestige') {
        // Special handling for prestige with 0-3000 range
        if (value >= 2400) return 4; // Elite: 2401-3000
        if (value >= 1800) return 3; // Influential: 1801-2400
        if (value >= 1200) return 2; // Respected: 1201-1800
        if (value >= 600) return 1;  // Recognized: 601-1200
        return 0;                    // Unknown: 0-600
      }
    } else if (attributeName === 'skills') {
      // Special handling for skills with 0-6000 range
      if (value >= 4800) return 4;
      if (value >= 3600) return 3;
      if (value >= 2400) return 2;
      if (value >= 1200) return 1;
      return 0;
    } else {
      // Standard percentile scales (0-100)
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
      // Prioritize timeCommitment (hours used) and adjust freeTime to ensure total is 168
      const adjustedTimeCommitment = Math.min(timeCommitment, 168);
      const adjustedFreeTime = 168 - adjustedTimeCommitment;
      return `${formatInteger(adjustedFreeTime)}${config.unit} free / ${formatInteger(adjustedTimeCommitment)}${config.unit} used (of 168)`;
    }
    
    if (attributeName === 'environmentalImpact' || attributeName === 'prestige') {
      return formatInteger(value); // No % for environmental impact or prestige
    }
    
    if (attributeName === 'skills') {
      return formatInteger(value); // No % for skills in the new 0-6000 range
    }
    
    return `${formatInteger(value)}%`; // Default to percentage format for other attributes
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
      // For time management, use the adjusted free time hours (to ensure total is 168)
      // Scale to make 120+ hours (5 days) = 100%
      const adjustedTimeCommitment = Math.min(timeCommitment, 168);
      const adjustedFreeTime = 168 - adjustedTimeCommitment;
      progressValue = Math.min(100, Math.max(0, (adjustedFreeTime / 120) * 100));
    } else if (attributeName === 'prestige') {
      // Scale prestige from 0-3000 range to 0-100 for progress bar display
      progressValue = Math.min(100, Math.max(0, value / 30));
    } else if (attributeName === 'skills') {
      // Scale skills from 0-6000 range to 0-100 for progress bar display
      progressValue = Math.min(100, Math.max(0, value / 60));
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
          <div className="h-2 w-full bg-muted/30 backdrop-blur-sm rounded-full overflow-hidden border border-muted/50">
            <div 
              className={cn("h-full rounded-full transition-all duration-700 shadow-glow", color.replace('text-', 'bg-'))}
              style={{ 
                width: `${progressValue}%`, 
                boxShadow: `0 0 10px ${color.replace('text-', '#').replace('-500', '').replace('-600', '')}`
              }}
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
                    <div className={cn("w-2 h-2 rounded-full shadow-glow", color.replace('text-', 'bg-'))}
                      style={{ 
                        boxShadow: `0 0 5px ${color.replace('text-', '#').replace('-500', '').replace('-600', '')}`
                      }}
                    ></div>
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
  
  // Calculate the time management score based on adjusted free time hours in a 168-hour week
  // Use the adjusted free time to ensure total is exactly 168 hours
  const adjustedTimeCommitment = Math.min(timeCommitment, 168);
  const adjustedFreeTime = 168 - adjustedTimeCommitment;
  // Scale to make 120+ hours (5 days) free time = 100%
  const timeManagementValue = Math.min(100, Math.max(0, (adjustedFreeTime / 120) * 100));
  
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
        colorClass = 'text-secondary-500';
        break;
      case 'owned':
        housingLabel = 'Home Owner';
        colorClass = 'text-primary-500';
        break;
      case 'luxury':
        housingLabel = 'Luxury Housing';
        colorClass = 'text-accent-500';
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
          colorClass = 'text-secondary-500';
          break;
        case 'economy':
          vehicleLabel = 'Economy Car';
          colorClass = 'text-amber-500';
          break;
        case 'standard':
          vehicleLabel = 'Standard Car';
          colorClass = 'text-primary-500';
          break;
        case 'luxury':
          vehicleLabel = 'Luxury Car';
          colorClass = 'text-accent-500';
          break;
        case 'premium':
          vehicleLabel = 'Premium Car';
          colorClass = 'text-accent-400';
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
      <Card className="shadow-md relative overflow-hidden bg-black/10 backdrop-blur-sm border border-primary-500/30">
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-primary-500/10 blur-xl rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 h-32 w-32 bg-accent-500/10 blur-xl rounded-full"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center text-primary-400">
            <User className="mr-2 h-5 w-5 text-primary-500" />
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
          
          <div className="mt-4 text-xs text-secondary p-2 rounded-lg bg-primary-900/20 border border-primary-500/20 backdrop-blur-sm">
            <p>Your attributes are affected by your lifestyle choices, purchases, and hobbies.</p>
            <p className="mt-1">
              <strong className="text-primary-400">Health calculation:</strong> Based on basic needs (hunger, thirst, energy, comfort) and stress levels. 
              Keep all basic needs above 50% for optimal health.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md relative overflow-hidden bg-black/10 backdrop-blur-sm border border-secondary-500/30">
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-secondary-500/10 blur-xl rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 h-32 w-32 bg-accent-500/10 blur-xl rounded-full"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center text-secondary-400">
            <Heart className="mr-2 h-5 w-5 text-secondary-500" />
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
            <div className="text-sm font-medium mb-3 text-accent-400">Living Situation</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-2 rounded-lg bg-accent-900/10 border border-accent-500/20 backdrop-blur-sm">
                {renderHousingStatus()}
              </div>
              <div className="p-2 rounded-lg bg-accent-900/10 border border-accent-500/20 backdrop-blur-sm">
                {renderVehicleStatus()}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-secondary p-2 rounded-lg bg-secondary-900/20 border border-secondary-500/20 backdrop-blur-sm">
            <p>Your basic needs affect your health and happiness. Be sure to maintain them!</p>
            <p className="mt-1">
              <strong className="text-secondary-400">Auto-maintenance:</strong> When enabled, essential items are automatically consumed when 
              needs drop below 70%. The system prioritizes hunger and thirst first.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CharacterAttributes;