import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Star, 
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Gift,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useAchievements, Achievement, AchievementCategory } from '../lib/stores/useAchievements';
import { useCharacter } from '../lib/stores/useCharacter';
import { useGame } from '../lib/stores/useGame';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Progress } from './ui/progress';
import { cn, formatCurrency } from '../lib/utils';
import { useAudio } from '../lib/stores/useAudio';
import { Badge } from './ui/badge';

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

interface AchievementCardProps {
  achievement: Achievement;
  onClaimReward: (id: string) => void;
  hasClaimedReward: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  onClaimReward,
  hasClaimedReward
}) => {
  const isCompleted = achievement.isUnlocked;
  
  const getCategoryColor = (category: AchievementCategory) => {
    switch (category) {
      case 'wealth': return 'text-quinary';
      case 'property': return 'text-tertiary';
      case 'investment': return 'text-secondary';
      case 'lifestyle': return 'text-purple-500';
      case 'general': return 'text-primary';
      case 'challenge': return 'text-orange-500';
      case 'strategy': return 'text-cyan-500';
      default: return 'text-primary';
    }
  };
  
  const getBackgroundGradient = (category: AchievementCategory) => {
    switch (category) {
      case 'wealth': return 'bg-gradient-to-r from-quinary/20 to-secondary/10';
      case 'property': return 'bg-gradient-to-r from-tertiary/20 to-primary/10';
      case 'investment': return 'bg-gradient-to-r from-secondary/20 to-tertiary/10';
      case 'lifestyle': return 'bg-gradient-to-r from-purple-500/20 to-quinary/10';
      case 'general': return 'bg-gradient-to-r from-primary/20 to-tertiary/10';
      case 'challenge': return 'bg-gradient-to-r from-orange-500/20 to-yellow-500/10';
      case 'strategy': return 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10';
      default: return 'bg-gradient-to-r from-primary/20 to-secondary/10';
    }
  };
  
  const getBorderColor = (category: AchievementCategory) => {
    switch (category) {
      case 'wealth': return isCompleted ? 'border-quinary' : 'border-quinary/30';
      case 'property': return isCompleted ? 'border-tertiary' : 'border-tertiary/30';
      case 'investment': return isCompleted ? 'border-secondary' : 'border-secondary/30';
      case 'lifestyle': return isCompleted ? 'border-purple-500' : 'border-purple-500/30';
      case 'general': return isCompleted ? 'border-primary' : 'border-primary/30';
      case 'challenge': return isCompleted ? 'border-orange-500' : 'border-orange-500/30';
      case 'strategy': return isCompleted ? 'border-cyan-500' : 'border-cyan-500/30';
      default: return isCompleted ? 'border-primary' : 'border-primary/30';
    }
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg border p-4 transition-all',
        'transform hover:-translate-y-1 hover:shadow-lg',
        getBackgroundGradient(achievement.category),
        getBorderColor(achievement.category),
        isCompleted ? 'opacity-100' : 'opacity-80 hover:opacity-100'
      )}
    >
      {/* Achievement Content */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className={cn(
            'p-2 rounded-full mr-3',
            `bg-${achievement.category}/20`
          )}>
            <AchievementIcon 
              iconName={achievement.icon} 
              className={getCategoryColor(achievement.category)}
            />
          </div>
          <div>
            <h3 className={cn(
              'font-semibold text-base',
              getCategoryColor(achievement.category)
            )}>
              {achievement.title}
            </h3>
            <p className="text-muted-foreground text-sm">{achievement.description}</p>
          </div>
        </div>
        
        {isCompleted && (
          <Trophy className="h-5 w-5 text-yellow-400 ml-2 flex-shrink-0" />
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{achievement.progress}%</span>
        </div>
        <Progress value={achievement.progress} className="h-1.5" />
      </div>

      {/* Reward section */}
      <div className="border-t border-border/50 pt-3 mt-2">
        <div className="flex items-center mb-1">
          <Gift className="h-4 w-4 mr-1.5 text-yellow-400" />
          <span className="text-sm font-medium">Reward:</span>
        </div>
        <p className="text-xs text-muted-foreground">{achievement.reward.description}</p>
        
        {/* Claim button - only visible when completed and not claimed */}
        {isCompleted && !hasClaimedReward && (
          <Button 
            size="sm" 
            className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white"
            onClick={() => onClaimReward(achievement.id)}
          >
            <Sparkles className="h-4 w-4 mr-1.5" /> 
            Claim Reward
          </Button>
        )}
        
        {/* Claimed indicator */}
        {isCompleted && hasClaimedReward && (
          <div className="flex items-center justify-center mt-2 text-xs text-green-500">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Reward Claimed
          </div>
        )}
      </div>
      
      {/* Completed date */}
      {achievement.unlockedDate && (
        <div className="text-xs text-muted-foreground mt-3">
          Completed on {new Date(achievement.unlockedDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

interface MilestoneProps {
  currentProgress: number;
  targetValue: number;
  milestone: number;
  category: AchievementCategory;
  completed: boolean;
}

// Helper function to get milestone glow colors
const getCategoryMilestoneGlowColor = (category: AchievementCategory): string => {
  switch (category) {
    case 'wealth': return 'rgba(0, 164, 175, 0.7)'; // Quinary color with opacity
    case 'property': return 'rgba(150, 71, 52, 0.7)'; // Tertiary color with opacity
    case 'investment': return 'rgba(2, 73, 80, 0.7)'; // Secondary color with opacity
    case 'lifestyle': return 'rgba(132, 101, 212, 0.7)'; // Purple with opacity
    case 'general': return 'rgba(0, 49, 53, 0.7)'; // Primary color with opacity
    case 'challenge': return 'rgba(249, 115, 22, 0.7)'; // Orange with opacity
    case 'strategy': return 'rgba(6, 182, 212, 0.7)'; // Cyan with opacity
    default: return 'rgba(255, 215, 0, 0.7)'; // Default gold with opacity
  }
};

const Milestone: React.FC<MilestoneProps> = ({ 
  currentProgress, 
  targetValue, 
  milestone, 
  category,
  completed
}) => {
  const position = Math.min(100, (milestone / targetValue) * 100);

  const getCategoryColor = (category: AchievementCategory): string => {
    switch (category) {
      case 'wealth': return completed ? 'bg-quinary' : 'bg-quinary/30';
      case 'property': return completed ? 'bg-tertiary' : 'bg-tertiary/30';
      case 'investment': return completed ? 'bg-secondary' : 'bg-secondary/30';
      case 'lifestyle': return completed ? 'bg-purple-500' : 'bg-purple-500/30';
      case 'general': return completed ? 'bg-primary' : 'bg-primary/30';
      case 'challenge': return completed ? 'bg-orange-500' : 'bg-orange-500/30';
      case 'strategy': return completed ? 'bg-cyan-500' : 'bg-cyan-500/30';
      default: return completed ? 'bg-primary' : 'bg-primary/30';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              'absolute h-6 w-6 rounded-full flex items-center justify-center z-10',
              getCategoryColor(category),
              completed ? 'ring-2 ring-yellow-400 milestone-glow' : ''
            )}
            style={{ 
              left: `${position}%`, 
              transform: 'translateX(-50%) translateY(-50%)',
              '--milestone-color': completed ? getCategoryMilestoneGlowColor(category) : 'transparent'
            } as React.CSSProperties}
          >
            {completed ? (
              <CheckCircle2 className="h-4 w-4 text-white" />
            ) : (
              <HelpCircle className="h-4 w-4 text-white/70" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-medium">{formatCurrency(milestone)}</div>
            <div className="text-xs">{completed ? 'Completed' : 'Milestone'}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface CategoryProgressProps {
  category: AchievementCategory;
  achievements: Achievement[];
}

const CategoryProgress: React.FC<CategoryProgressProps> = ({ category, achievements }) => {
  // Find the highest threshold achievement in this category
  const maxThreshold = Math.max(...achievements.map(a => a.threshold));
  
  // Get character's progress for this category
  const { wealth, netWorth } = useCharacter();
  let currentValue = 0;
  
  switch (category) {
    case 'wealth':
      currentValue = wealth;
      break;
    case 'property':
      currentValue = netWorth; // Simplification, ideally would be property value
      break;
    // Add other categories as needed
    default:
      currentValue = 0;
  }
  
  // Calculate overall progress percentage for the category
  const progressPercentage = Math.min(100, (currentValue / maxThreshold) * 100);
  
  // Find relevant milestones from achievements
  const milestones = achievements.map(a => ({
    value: a.threshold,
    completed: a.isUnlocked
  })).sort((a, b) => a.value - b.value);
  
  return (
    <div className="mt-4 mb-8">
      <div className="flex justify-between mb-2">
        <h3 className="font-medium capitalize">{category} Progress</h3>
        <span className="text-sm text-muted-foreground">
          {formatCurrency(currentValue)} / {formatCurrency(maxThreshold)}
        </span>
      </div>
      
      <div className="relative pt-3 pb-6">
        {/* Base progress bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden relative">
          <div 
            className="h-full rounded-full absolute top-0 left-0 transition-all duration-1000"
            style={{ 
              width: `${progressPercentage}%`,
              background: `linear-gradient(to right, var(--${category}-color-start), var(--${category}-color-end))` 
            }}
          />
        </div>
        
        {/* Milestones */}
        {milestones.map((milestone, index) => (
          <Milestone 
            key={index}
            currentProgress={currentValue}
            targetValue={maxThreshold}
            milestone={milestone.value}
            category={category}
            completed={milestone.completed}
          />
        ))}
      </div>
    </div>
  );
};

interface AchievementOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AchievementOverlay: React.FC<AchievementOverlayProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('wealth');
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const { playUISound } = useAudio();
  
  const { 
    achievements, 
    getCategoryAchievements,
    getAchievement
  } = useAchievements();
  
  // Get state directly so we can access it in the handler function
  const gameStore = useGame.getState();
  const characterStore = useCharacter.getState();
  
  // We'll use localStorage for claimed rewards tracking
  const [claimedRewards, setClaimedRewards] = useState<{[key: string]: boolean}>(() => {
    const saved = localStorage.getItem('business-empire-claimed-rewards');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Listen for game restarts to reset the claimed rewards
  useEffect(() => {
    const unsubscribe = useGame.subscribe(
      (state) => state.phase,
      (phase) => {
        if (phase === 'ready') {
          // Reset claimed rewards when starting a new game
          setClaimedRewards({});
          localStorage.setItem('business-empire-claimed-rewards', JSON.stringify({}));
        }
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  const categoryAchievements = getCategoryAchievements(activeCategory).filter(achievement => 
    !showCompletedOnly || achievement.isUnlocked
  );
  
  const claimReward = (id: string) => {
    const achievement = getAchievement(id);
    
    if (achievement && achievement.isUnlocked && !claimedRewards[id]) {
      // Play a success sound
      playUISound('success');
      
      console.log(`Claiming reward for achievement: ${achievement.title}`);
      
      // Apply the reward based on its type
      switch (achievement.reward.type) {
        case 'cash':
          console.log(`Adding cash reward: ${achievement.reward.value}`);
          
          // Add to game store cash
          gameStore.addCash(achievement.reward.value);
          
          // Also add to character store wealth
          characterStore.addWealth(achievement.reward.value);
          break;
          
        case 'multiplier':
          console.log(`Applying income multiplier: ${achievement.reward.value}`);
          gameStore.applyIncomeMultiplier(achievement.reward.value);
          break;
          
        case 'unlock':
          console.log(`Unlocking feature: ${achievement.reward.description}`);
          // Handle unlock logic
          break;
          
        case 'bonus':
          console.log(`Applying bonus: ${achievement.reward.description}`);
          // Handle bonus logic
          break;
      }
      
      // Mark as claimed
      const newState = { ...claimedRewards, [id]: true };
      setClaimedRewards(newState);
      localStorage.setItem('business-empire-claimed-rewards', JSON.stringify(newState));
    }
  };
  
  const hasClaimedReward = (id: string) => {
    return !!claimedRewards[id];
  };
  
  const categories: AchievementCategory[] = [
    'wealth', 'property', 'investment', 'lifestyle', 'general', 'challenge', 'strategy'
  ];
  
  // Calculate counts for each category
  const categoryCounts = categories.reduce((acc, category) => {
    const categoryAchievements = getCategoryAchievements(category);
    const total = categoryAchievements.length;
    const completed = categoryAchievements.filter(a => a.isUnlocked).length;
    
    acc[category] = { total, completed };
    return acc;
  }, {} as Record<AchievementCategory, { total: number; completed: number }>);
  
  // Overall completion stats
  const totalAchievements = achievements.length;
  const completedAchievements = achievements.filter(a => a.isUnlocked).length;
  const completionPercentage = Math.round((completedAchievements / totalAchievements) * 100);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
            Achievement Milestones
          </DialogTitle>
          <DialogDescription>
            Track your progress and claim rewards for completing achievements
          </DialogDescription>
        </DialogHeader>
        
        {/* Overall Progress */}
        <div className="mb-6 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Overall Progress</h3>
            <span>{completedAchievements} / {totalAchievements} Achievements</span>
          </div>
          <Progress value={completionPercentage} className="h-2.5" />
          
          <div className="flex items-center mt-3 text-muted-foreground text-sm">
            <Award className="h-4 w-4 mr-1.5" />
            <span>You've earned {completedAchievements} out of {totalAchievements} achievements ({completionPercentage}% completed)</span>
          </div>
        </div>
        
        {/* Category selection */}
        <Tabs defaultValue="wealth" value={activeCategory} onValueChange={(value) => setActiveCategory(value as AchievementCategory)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="overflow-x-auto hide-scrollbar">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {categoryCounts[category]?.completed || 0}/{categoryCounts[category]?.total || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCompletedOnly(!showCompletedOnly)}
              className="ml-2 flex-shrink-0"
            >
              {showCompletedOnly ? "Show All" : "Show Completed"}
            </Button>
          </div>
          
          {/* Category progress visualization */}
          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-0">
              <CategoryProgress 
                category={category} 
                achievements={getCategoryAchievements(category)} 
              />
            </TabsContent>
          ))}
          
          {/* Achievement cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(80vh - 300px)' }}>
            {categoryAchievements.length > 0 ? (
              categoryAchievements.map(achievement => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  onClaimReward={claimReward}
                  hasClaimedReward={hasClaimedReward(achievement.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {showCompletedOnly 
                  ? "You haven't completed any achievements in this category yet."
                  : "No achievements found in this category."}
              </div>
            )}
          </div>
        </Tabs>
        
        <div className="flex justify-end mt-auto pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementOverlay;