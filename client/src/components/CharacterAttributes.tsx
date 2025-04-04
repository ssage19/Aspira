import { 
  Heart, 
  Award, 
  BookOpen, 
  Users, 
  Wind, 
  Clock, 
  Leaf, 
  HeartPulse 
} from 'lucide-react';

import { useCharacter } from '../lib/stores/useCharacter';
import { Progress } from './ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function CharacterAttributes() {
  const { 
    health, 
    skills, 
    stress, 
    socialConnections,
    freeTime,
    timeCommitment,
    environmentalImpact,
    happiness,
    prestige
  } = useCharacter();
  
  // Helper function to determine attribute level color
  const getAttributeColor = (value: number, isGoodHigh: boolean = true, isInvertedScale: boolean = false) => {
    // For standard metrics (higher is better)
    if (isGoodHigh && !isInvertedScale) {
      if (value >= 80) return "text-green-600";
      if (value >= 60) return "text-green-500";
      if (value >= 40) return "text-amber-500";
      if (value >= 20) return "text-orange-500";
      return "text-red-500";
    }
    // For inverted metrics (lower is better)
    else if (!isGoodHigh && !isInvertedScale) {
      if (value <= 20) return "text-green-600";
      if (value <= 40) return "text-green-500";
      if (value <= 60) return "text-amber-500";
      if (value <= 80) return "text-orange-500";
      return "text-red-500";
    }
    // For environmental impact (-100 to 100 scale)
    else {
      if (value >= 50) return "text-green-600"; // Very positive
      if (value >= 0) return "text-green-500"; // Positive
      if (value >= -30) return "text-amber-500"; // Slightly negative
      if (value >= -60) return "text-orange-500"; // Negative
      return "text-red-500"; // Very negative
    }
  };
  
  // Helper function to get attribute level description
  const getAttributeLevel = (value: number, attributeName: string, isGoodHigh: boolean = true, isInvertedScale: boolean = false) => {
    const levels = isGoodHigh ? 
      ['Critical', 'Poor', 'Average', 'Good', 'Excellent'] : 
      ['Excellent', 'Good', 'Moderate', 'High', 'Critical'];
      
    let index = 0;
    if (isInvertedScale) {
      // For environmental impact
      if (value >= 50) index = 4;
      else if (value >= 0) index = 3;
      else if (value >= -30) index = 2;
      else if (value >= -60) index = 1;
      else index = 0;
    } else {
      // For standard attributes
      if (value >= 80) index = 4;
      else if (value >= 60) index = 3;
      else if (value >= 40) index = 2;
      else if (value >= 20) index = 1;
      else index = 0;
    }
    
    // Special cases for specific attributes
    if (attributeName === 'Environmental Impact') {
      return ['Harmful', 'Concerning', 'Neutral', 'Positive', 'Sustainable'][index];
    }
    
    if (attributeName === 'Time Management') {
      // For time management, we calculate based on the free hours to time commitment ratio
      const ratio = freeTime / (timeCommitment || 1);
      if (ratio > 3) return 'Relaxed';
      if (ratio > 2) return 'Balanced';
      if (ratio > 1) return 'Busy';
      if (ratio > 0.5) return 'Hectic';
      return 'Overwhelmed';
    }
    
    return levels[index];
  };
  
  // Render each attribute with colored progress bar
  const renderAttribute = (
    name: string, 
    value: number, 
    icon: React.ReactNode, 
    isGoodHigh: boolean = true, 
    isInvertedScale: boolean = false,
    range: [number, number] = [0, 100]
  ) => {
    const [min, max] = range;
    const normalizedValue = isInvertedScale ? 
      // For environmental impact, convert -100 to 100 range to 0-100 progress
      ((value - min) / (max - min)) * 100 : 
      value;
      
    const color = getAttributeColor(value, isGoodHigh, isInvertedScale);
    const level = getAttributeLevel(value, name, isGoodHigh, isInvertedScale);
    
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1 items-center">
          <div className="flex items-center">
            <span className={`mr-2 ${color}`}>{icon}</span>
            <span className="text-sm font-medium">{name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${color}`}>{level}</span>
            <span className="text-xs text-gray-500">{value}{isInvertedScale ? '' : '%'}</span>
          </div>
        </div>
        <Progress 
          value={normalizedValue} 
          className={`${color.replace('text-', 'bg-')} bg-opacity-20 h-2`} 
        />
      </div>
    );
  };
  
  // Calculate the time management score based on free time vs committed time
  const timeManagementValue = Math.max(0, Math.min(100, (freeTime / (freeTime + timeCommitment) * 100))); 
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <HeartPulse className="mr-2 h-5 w-5 text-pink-500" />
          Personal Attributes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {renderAttribute('Health', health, <Heart className="h-4 w-4" />)}
            {renderAttribute('Happiness', happiness, <HeartPulse className="h-4 w-4" />)}
            {renderAttribute('Social Connections', socialConnections, <Users className="h-4 w-4" />)}
            {renderAttribute('Skills', skills, <BookOpen className="h-4 w-4" />)}
          </div>
          <div>
            {renderAttribute('Stress', stress, <Wind className="h-4 w-4" />, false)}
            {renderAttribute('Time Management', timeManagementValue, <Clock className="h-4 w-4" />)}
            {renderAttribute('Environmental Impact', environmentalImpact, <Leaf className="h-4 w-4" />, true, true, [-100, 100])}
            {renderAttribute('Prestige', prestige, <Award className="h-4 w-4" />)}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Your attributes are affected by your lifestyle choices, purchases, and hobbies.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CharacterAttributes;