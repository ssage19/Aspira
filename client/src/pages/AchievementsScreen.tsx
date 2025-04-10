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
  Filter,
  Target,
  LineChart,
  BarChart,
  Globe,
  Scale,
  Bitcoin,
  Rocket,
  PieChart,
  Diamond,
  Zap,
  Gem,
  Dice1 as Dice,
  Palmtree as PalmTree,
  Flower2,
  RefreshCw,
  TrendingDown,
  Timer,
  Minimize2,
  ChevronLeft
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
import { useNavigate } from 'react-router-dom';

interface AchievementItemProps {
  achievement: Achievement;
  claimReward: (id: string) => void;
  hasUnclaimedReward: boolean;
}

const AchievementIcon = ({ iconName, className = '' }: { iconName: string, className?: string }) => {
  const iconProps = { className: `h-6 w-6 ${className}` };
  
  switch (iconName) {
    // Basic icons
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
    
    // New challenge achievement icons
    case 'BarChart': return <BarChart {...iconProps} />;
    case 'Globe': return <Globe {...iconProps} />;
    case 'Bitcoin': return <Bitcoin {...iconProps} />;
    case 'Rocket': return <Rocket {...iconProps} />;
    case 'Diamond': return <Diamond {...iconProps} />;
    
    // New strategy achievement icons
    case 'PieChart': return <PieChart {...iconProps} />;
    case 'Timer': return <Timer {...iconProps} />;
    case 'TrendingDown': return <TrendingDown {...iconProps} />;
    case 'Scale': return <Scale {...iconProps} />;
    
    // Special achievement icons
    case 'Zap': return <Zap {...iconProps} />;
    case 'Gem': return <Gem {...iconProps} />;
    case 'RefreshCw': return <RefreshCw {...iconProps} />;
    case 'Minimize2': return <Minimize2 {...iconProps} />;
    case 'Dice': return <Dice {...iconProps} />;
    case 'PalmTree': return <PalmTree {...iconProps} />;
    case 'Flower2': return <Flower2 {...iconProps} />;
    
    // Default fallback
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
      case 'challenge': return 'text-orange-500';
      case 'strategy': return 'text-blue-500';
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
      case 'challenge': return 'text-orange-500';
      case 'strategy': return 'text-blue-500';
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
  const navigate = useNavigate();
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
  
  const claimReward = (id: string) => {
    const achievement = achievements.find(a => a.id === id);
    
    if (achievement && achievement.isUnlocked && !claimedRewards[id]) {
      console.log(`Claiming reward for achievement: ${achievement.title}`);
      
      // Get both game and character stores directly
      const gameStore = useGame.getState();
      const characterStore = useCharacter.getState();
      
      // Apply the reward
      switch (achievement.reward.type) {
        case 'cash':
          // Ensure reward value is a valid number
          const rewardValue = typeof achievement.reward.value === 'number' && !isNaN(achievement.reward.value) 
                            ? achievement.reward.value : 0;
                            
          console.log(`Adding cash reward: ${rewardValue}`);
          
          // IMPORTANT FIX: Update both stores for cash rewards
          // Add to game store cash (just for tracking purposes)
          gameStore.addCash(rewardValue);
          
          // Add to character store wealth (this is the actual game money implementation)
          characterStore.addWealth(rewardValue);
          
          // Log the updated character wealth with NaN check
          const currentWealth = typeof characterStore.wealth === 'number' && !isNaN(characterStore.wealth)
                              ? characterStore.wealth : 0;
          console.log(`Current character wealth after reward: ${currentWealth}`);
          break;
        case 'multiplier':
          console.log(`Applying income multiplier: ${achievement.reward.value}`);
          gameStore.applyIncomeMultiplier(achievement.reward.value);
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
            // For happiness bonus
            if (achievement.reward.description.includes('Happiness')) {
              // Ensure bonus amount is a valid number
              const bonusAmount = typeof achievement.reward.value === 'number' && !isNaN(achievement.reward.value) 
                               ? achievement.reward.value : 0;
              console.log(`Applying happiness bonus: +${bonusAmount}`);
              characterStore.addHappiness(bonusAmount);
            }
            
            // For prestige bonus
            if (achievement.reward.description.includes('Prestige')) {
              // Ensure bonus amount is a valid number
              const bonusAmount = typeof achievement.reward.value === 'number' && !isNaN(achievement.reward.value) 
                               ? achievement.reward.value : 0;
              console.log(`Applying prestige bonus: +${bonusAmount}`);
              characterStore.addPrestige(bonusAmount);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Achievements</h1>
            <p className="text-muted-foreground">Track your progress and earn rewards</p>
          </div>

          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="bg-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
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
          
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 mt-4">
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
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/10">
              <span className="text-muted-foreground text-xs">Challenge</span>
              <span className="font-bold text-orange-500">
                {getCategoryAchievements('challenge').filter(a => a.isUnlocked).length} / {getCategoryAchievements('challenge').length}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/10">
              <span className="text-muted-foreground text-xs">Strategy</span>
              <span className="font-bold text-blue-500">
                {getCategoryAchievements('strategy').filter(a => a.isUnlocked).length} / {getCategoryAchievements('strategy').length}
              </span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={(v) => setActiveTab(v as AchievementCategory)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-7 w-full md:w-auto">
              <TabsTrigger value="general" className="flex items-center justify-center">
                <Star className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="wealth" className="flex items-center justify-center">
                <DollarSign className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Wealth</span>
              </TabsTrigger>
              <TabsTrigger value="property" className="flex items-center justify-center">
                <Home className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Property</span>
              </TabsTrigger>
              <TabsTrigger value="investment" className="flex items-center justify-center">
                <TrendingUp className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Investment</span>
              </TabsTrigger>
              <TabsTrigger value="lifestyle" className="flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Lifestyle</span>
              </TabsTrigger>
              <TabsTrigger value="challenge" className="flex items-center justify-center">
                <Target className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Challenges</span>
              </TabsTrigger>
              <TabsTrigger value="strategy" className="flex items-center justify-center">
                <LineChart className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Strategy</span>
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

          <TabsContent value="challenge">
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md text-sm dark:bg-orange-950 dark:border-orange-800">
              <h3 className="font-medium text-orange-800 mb-1 dark:text-orange-300">Challenge Achievements</h3>
              <p className="text-orange-700 dark:text-orange-400">
                These are complex challenges that require significant effort and strategy to complete.
                Successfully completing these challenges demonstrates mastery of multiple game mechanics!
              </p>
            </div>
            <div>
              {getCategoryAchievements('challenge').map(achievement => (
                <AchievementItem 
                  key={achievement.id} 
                  achievement={achievement} 
                  claimReward={claimReward}
                  hasUnclaimedReward={achievement.isUnlocked && !claimedRewards[achievement.id]}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="strategy">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm dark:bg-blue-950 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 mb-1 dark:text-blue-300">Strategy Achievements</h3>
              <p className="text-blue-700 dark:text-blue-400">
                These achievements require careful planning and strategic decision-making.
                They test your ability to manage risk, time your investments, and make smart financial decisions.
              </p>
            </div>
            <div>
              {getCategoryAchievements('strategy').map(achievement => (
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