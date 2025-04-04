import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Lock, 
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
  Filter
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import GameUI from '../components/GameUI';
import { useAchievements, Achievement, AchievementCategory } from '../lib/stores/useAchievements';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { useAudio } from '../lib/stores/useAudio';
import { useGame } from '../lib/stores/useGame';
import { useCharacter } from '../lib/stores/useCharacter';

interface AchievementItemProps {
  achievement: Achievement;
  claimReward: (id: string) => void;
  hasUnclaimedReward: boolean;
}

const AchievementIcon = ({ iconName, className = '' }: { iconName: string, className?: string }) => {
  const iconProps = { className: `h-6 w-6 ${className}` };
  
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

const AchievementItem = ({ achievement, claimReward, hasUnclaimedReward }: AchievementItemProps) => {
  const { playSuccess } = useAudio();
  
  const handleClaimReward = () => {
    claimReward(achievement.id);
    playSuccess();
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
  
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-quinary';
    if (progress >= 50) return 'bg-tertiary';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-secondary';
  };
  
  return (
    <div className={`mb-4 p-4 rounded-lg glass-effect transition-all duration-300 ${achievement.isUnlocked ? 'border border-primary/30' : 'border border-border'}`}>
      <div className="flex items-start">
        <div 
          className={`flex-shrink-0 mr-4 p-3 rounded-full ${achievement.isUnlocked 
            ? `bg-${achievement.category}/20` 
            : 'bg-gray-400/20'}`}
        >
          {achievement.isUnlocked 
            ? <AchievementIcon 
                iconName={achievement.icon} 
                className={getIconColor(achievement.category)}
              />
            : <Lock className="h-6 w-6 text-gray-400" />
          }
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-lg ${achievement.isUnlocked 
              ? getCategoryColor(achievement.category)
              : 'text-muted-foreground'}`}>
              {achievement.title}
            </h3>
            
            {achievement.isUnlocked && (
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-1 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {achievement.unlockedDate 
                    ? new Date(achievement.unlockedDate).toLocaleDateString() 
                    : ''}
                </span>
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground mt-1">{achievement.description}</p>
          
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">
                {achievement.progress}%
              </span>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-2">
              <div 
                className={`${getProgressColor(achievement.progress)} h-2 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${achievement.progress}%` }}
              ></div>
            </div>
          </div>
          
          {achievement.isUnlocked && (
            <div className="mt-4 bg-card/50 rounded-lg p-3">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                <span className="font-medium">Reward:</span>
              </div>
              <p className="text-sm mt-1">{achievement.reward.description}</p>
              
              {hasUnclaimedReward && (
                <Button 
                  className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleClaimReward}
                >
                  Claim Reward
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AchievementsScreen() {
  const [activeTab, setActiveTab] = useState<AchievementCategory>('general');
  // Load previously claimed rewards from localStorage
  const [claimedRewards, setClaimedRewards] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('business-empire-claimed-rewards');
    return saved ? JSON.parse(saved) : {};
  });
  const { 
    achievements, 
    getCategoryAchievements, 
    getCompletedAchievements, 
    getInProgressAchievements 
  } = useAchievements();
  const { addCash, applyIncomeMultiplier } = useGame();
  
  const claimReward = (id: string) => {
    const achievement = achievements.find(a => a.id === id);
    
    if (achievement && achievement.isUnlocked && !claimedRewards[id]) {
      console.log(`Claiming reward for achievement: ${achievement.title}`);
      
      // Apply the reward
      switch (achievement.reward.type) {
        case 'cash':
          console.log(`Adding cash reward: ${achievement.reward.value}`);
          addCash(achievement.reward.value);
          break;
        case 'multiplier':
          console.log(`Applying income multiplier: ${achievement.reward.value}`);
          applyIncomeMultiplier(achievement.reward.value);
          break;
        case 'unlock':
          console.log(`Unlocking feature: ${achievement.reward.description}`);
          // Unlock feature would be handled by the feature itself
          // by checking if the achievement is unlocked
          break;
        case 'bonus':
          console.log(`Applying bonus: ${achievement.reward.description}`);
          
          // Apply character bonuses for the "bonus" type rewards
          if (achievement.id.startsWith('lifestyle') || achievement.id.startsWith('character')) {
            const { updateAttributes } = useCharacter.getState();
            
            // For happiness bonus
            if (achievement.reward.description.includes('Happiness')) {
              const bonusAmount = achievement.reward.value;
              console.log(`Applying happiness bonus: +${bonusAmount}`);
              updateAttributes({ happiness: bonusAmount });
            }
            
            // For prestige bonus
            if (achievement.reward.description.includes('Prestige')) {
              const bonusAmount = achievement.reward.value;
              console.log(`Applying prestige bonus: +${bonusAmount}`);
              updateAttributes({ prestige: bonusAmount });
            }
          }
          break;
      }
      
      // Mark as claimed in component state
      setClaimedRewards(prev => {
        const newState = { ...prev, [id]: true };
        // Persist to localStorage
        localStorage.setItem('business-empire-claimed-rewards', JSON.stringify(newState));
        return newState;
      });
    }
  };
  
  const completedCount = getCompletedAchievements().length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  
  return (
    <div className="min-h-screen bg-gradient-radial from-background to-background/90">
      <GameUI />
      
      <div className="container mx-auto p-4 pt-24 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Achievements</h1>
          <p className="text-muted-foreground">Track your progress and earn rewards</p>
        </div>
        
        <div className="glass-effect rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
              <h2 className="text-xl font-bold">Achievement Progress</h2>
            </div>
            <div className="text-lg font-medium">
              <span className={completionPercentage >= 50 ? 'text-green-500' : 'text-blue-500'}>
                {completedCount}
              </span> / {totalCount}
            </div>
          </div>
          
          <div className="mt-2">
            <div className="w-full bg-secondary/20 rounded-full h-3">
              <div 
                className={`${completionPercentage >= 75 
                  ? 'bg-green-500' 
                  : completionPercentage >= 50 
                    ? 'bg-quinary' 
                    : completionPercentage >= 25 
                      ? 'bg-tertiary' 
                      : 'bg-secondary'} 
                h-3 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">0%</span>
              <span className="text-xs text-muted-foreground">
                {completionPercentage}% Completed
              </span>
              <span className="text-xs text-muted-foreground">100%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/10">
              <span className="text-muted-foreground text-xs">Wealth</span>
              <span className="font-bold text-quinary">
                {getCategoryAchievements('wealth').filter(a => a.isUnlocked).length} / {getCategoryAchievements('wealth').length}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/10">
              <span className="text-muted-foreground text-xs">Property</span>
              <span className="font-bold text-tertiary">
                {getCategoryAchievements('property').filter(a => a.isUnlocked).length} / {getCategoryAchievements('property').length}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/10">
              <span className="text-muted-foreground text-xs">Investment</span>
              <span className="font-bold text-secondary">
                {getCategoryAchievements('investment').filter(a => a.isUnlocked).length} / {getCategoryAchievements('investment').length}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/10">
              <span className="text-muted-foreground text-xs">Lifestyle</span>
              <span className="font-bold text-purple-500">
                {getCategoryAchievements('lifestyle').filter(a => a.isUnlocked).length} / {getCategoryAchievements('lifestyle').length}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/10">
              <span className="text-muted-foreground text-xs">General</span>
              <span className="font-bold text-primary">
                {getCategoryAchievements('general').filter(a => a.isUnlocked).length} / {getCategoryAchievements('general').length}
              </span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={(v) => setActiveTab(v as AchievementCategory)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-5 w-full md:w-auto">
              <TabsTrigger value="general" className="flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Star className="h-5 w-5 md:mr-2" />
                      <span className="hidden md:inline">General</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>General Achievements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="wealth" className="flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <DollarSign className="h-5 w-5 md:mr-2" />
                      <span className="hidden md:inline">Wealth</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Wealth Achievements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="property" className="flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Home className="h-5 w-5 md:mr-2" />
                      <span className="hidden md:inline">Property</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Property Achievements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="investment" className="flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <TrendingUp className="h-5 w-5 md:mr-2" />
                      <span className="hidden md:inline">Investment</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Investment Achievements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
              <TabsTrigger value="lifestyle" className="flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <ShoppingBag className="h-5 w-5 md:mr-2" />
                      <span className="hidden md:inline">Lifestyle</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Lifestyle Achievements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
            </TabsList>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('general')}
                    className="hidden sm:flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span>In Progress</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show achievements in progress</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <TabsContent value="general">
            <div>
              {getCategoryAchievements('general').map(achievement => (
                <AchievementItem 
                  key={achievement.id} 
                  achievement={achievement} 
                  claimReward={claimReward}
                  hasUnclaimedReward={achievement.isUnlocked && !claimedRewards[achievement.id]}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="wealth">
            <div>
              {getCategoryAchievements('wealth').map(achievement => (
                <AchievementItem 
                  key={achievement.id} 
                  achievement={achievement} 
                  claimReward={claimReward}
                  hasUnclaimedReward={achievement.isUnlocked && !claimedRewards[achievement.id]}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="property">
            <div>
              {getCategoryAchievements('property').map(achievement => (
                <AchievementItem 
                  key={achievement.id} 
                  achievement={achievement} 
                  claimReward={claimReward}
                  hasUnclaimedReward={achievement.isUnlocked && !claimedRewards[achievement.id]}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="investment">
            <div>
              {getCategoryAchievements('investment').map(achievement => (
                <AchievementItem 
                  key={achievement.id} 
                  achievement={achievement} 
                  claimReward={claimReward}
                  hasUnclaimedReward={achievement.isUnlocked && !claimedRewards[achievement.id]}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="lifestyle">
            <div>
              {getCategoryAchievements('lifestyle').map(achievement => (
                <AchievementItem 
                  key={achievement.id} 
                  achievement={achievement} 
                  claimReward={claimReward}
                  hasUnclaimedReward={achievement.isUnlocked && !claimedRewards[achievement.id]}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}