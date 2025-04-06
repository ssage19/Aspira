import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { useAudio } from '../lib/stores/useAudio';
import { useGame } from '../lib/stores/useGame';
import { useAchievements } from '../lib/stores/useAchievements';
import { useRandomEvents } from '../lib/stores/useRandomEvents';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { CharacterAttributes } from '../components/CharacterAttributes';
import { ActiveEventsIndicator } from '../components/ActiveEventsIndicator';
import { 
  DollarSign, 
  TrendingUp, 
  ChartBar, 
  Calendar, 
  Home,
  Briefcase,
  HeartPulse,
  Crown,
  ArrowRight,
  Settings,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Trophy,
  Award,
  Play,
  Clock,
  Building,
  Building2,
  ShoppingBag,
  ShoppingCart,
  Wrench
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Separator } from '../components/ui/separator';
import GameUI from '../components/GameUI';
import MainScene from '../components/MainScene';
import { formatCurrency } from '../lib/utils';

import { useEffect as useInitAchievements } from 'react';
import { checkAllAchievements } from '../lib/services/achievementTracker';

// Achievement Widget component
const AchievementsWidget = () => {
  const { achievements, getCompletedAchievements, getInProgressAchievements } = useAchievements();
  const navigate = useNavigate();
  
  // Check all achievements when dashboard loads
  useInitAchievements(() => {
    // Check for achievements on component mount
    checkAllAchievements();
    // Set up interval to periodically check achievements (every 10 seconds)
    const interval = setInterval(() => {
      checkAllAchievements();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get the most recent 3 completed achievements
  const recentCompletedAchievements = getCompletedAchievements()
    .sort((a, b) => {
      if (!a.unlockedDate) return 1;
      if (!b.unlockedDate) return -1;
      return new Date(b.unlockedDate).getTime() - new Date(a.unlockedDate).getTime();
    })
    .slice(0, 3);
    
  // Get 3 achievements that are in progress but not completed
  const inProgressAchievements = getInProgressAchievements()
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
    
  // Combine them, showing completed ones first
  const displayAchievements = [...recentCompletedAchievements, ...inProgressAchievements].slice(0, 4);
  
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
  
  if (displayAchievements.length === 0) {
    return (
      <div className="text-center p-6 bg-secondary/30 rounded-lg glass-effect">
        <Trophy className="h-10 w-10 mx-auto mb-2 text-yellow-500 opacity-40" />
        <h3 className="text-lg font-medium mb-1">No Achievements Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete objectives to earn achievements and rewards
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/achievements')}
          className="mx-auto"
        >
          View All Achievements
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {displayAchievements.map(achievement => (
        <div 
          key={achievement.id} 
          className={`p-4 glass-effect rounded-lg border transition-all duration-300 ${
            achievement.isUnlocked ? 'border-yellow-500/50' : 'border-secondary/50'
          }`}
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 mr-3 p-2 rounded-full ${
              achievement.isUnlocked 
                ? 'bg-yellow-500/10' 
                : 'bg-secondary/10'
            }`}>
              {/* Simple icon display - just use Trophy for all achievements for now */}
              <Trophy className={`h-5 w-5 ${achievement.isUnlocked ? 'text-yellow-500' : getCategoryColor(achievement.category)}`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-medium ${
                achievement.isUnlocked 
                  ? 'text-yellow-500' 
                  : getCategoryColor(achievement.category)
              }`}>
                {achievement.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {achievement.description}
              </p>
              
              <div className="mt-2">
                <div className="w-full bg-secondary/20 rounded-full h-1.5">
                  <div 
                    className={`${
                      achievement.isUnlocked 
                        ? 'bg-yellow-500' 
                        : achievement.progress >= 75 
                          ? 'bg-quinary' 
                          : achievement.progress >= 50 
                            ? 'bg-tertiary' 
                            : achievement.progress >= 25 
                              ? 'bg-yellow-500' 
                              : 'bg-secondary'
                    } h-1.5 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {achievement.isUnlocked 
                      ? `Completed ${achievement.unlockedDate 
                          ? new Date(achievement.unlockedDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) 
                          : ''}`
                      : `${achievement.progress}% complete`
                    }
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {achievement.isUnlocked && (
                      <span className="flex items-center">
                        <Award className="h-3 w-3 mr-1 text-yellow-500" />
                        <span>{achievement.reward.description}</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    name, wealth, netWorth, happiness, prestige, 
    assets, properties, lifestyleItems, 
    job, income, expenses,
    housingType, vehicleType,
    resetCharacter 
  } = useCharacter();
  const { currentDay, currentMonth, currentYear } = useTime();
  const { 
    marketTrend, 
    economyState, 
    stockMarketHealth, 
    realEstateMarketHealth,
    inflation,
    interestRate,
    getStockMarketHealthCategory,
    getRealEstateMarketHealthCategory
  } = useEconomy();
  const { backgroundMusic, isMuted } = useAudio();
  const { restart } = useGame();
  
  // Track active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  // Handle reset confirmation
  const handleResetProgress = () => {
    // First clear local storage for all game state to ensure no persistence between resets
    localStorage.removeItem('business-empire-character');
    localStorage.removeItem('business-empire-game');
    localStorage.removeItem('business-empire-time');
    localStorage.removeItem('business-empire-achievements');
    localStorage.removeItem('business-empire-claimed-rewards');
    localStorage.removeItem('auto-maintain-needs');
    localStorage.removeItem('luxury_lifestyle_time');
    
    // Now reset the stores in memory
    
    // Reset character data (this should happen after localStorage is cleared)
    resetCharacter();
    
    // Reset game state
    restart();
    
    // Reset achievements
    const { resetAchievements } = useAchievements.getState();
    if (resetAchievements) {
      resetAchievements();
    }
    
    // Reset time to device time
    const { resetTime } = useTime.getState();
    if (resetTime) {
      resetTime();
    }
    
    // Force an immediate state save to ensure all stores get their default values written to localStorage
    setTimeout(() => {
      // Force all stores to save their default states
      const characterState = useCharacter.getState();
      if (characterState.saveState) {
        characterState.saveState();
      }
      
      // After everything is reset, navigate to character creation
      navigate('/create');
    }, 100); // Short timeout to ensure state resets are processed
  };
  
  // Background music functionality
  useEffect(() => {
    // This is just a placeholder effect since background music is disabled
    // The useAudio store is configured with backgroundMusic set to null
    
    return () => {
      // Cleanup function (empty since we're not playing any music)
    };
  }, [isMuted]);
  
  // Force refresh of character state to match Essentials component
  // This ensures consistent values between Dashboard and Lifestyle tabs
  const [_, forceUpdate] = useState({});
  
  useEffect(() => {
    // More aggressive state update approach to ensure all UI components stay in sync
    
    // 1. State refresh interval - always active to ensure UI stays updated
    const refreshInterval = setInterval(() => {
      // Get the current state
      const currentState = useCharacter.getState();
      
      // Force component to rerender by updating state
      // This ensures the dashboard updates when values increase as well as decrease
      forceUpdate({});
    }, 100); // Even more frequent updates (100ms instead of 250ms)
    
    // 2. Subscribe to ALL basic needs and character state changes with lastUpdated timestamp
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
        state.socialConnections,
        state.wealth,
        state.lastUpdated  // Explicitly track the timestamp field
      ],
      () => {
        // Force an immediate update whenever any relevant state changes
        forceUpdate({});
      }
    );
    
    // 3. Add a more focused subscription for financial values
    // This ensures financial data stays in sync with other tabs
    const unsubscribeAutoMaintain = useCharacter.subscribe(
      (state) => [
        state.wealth, 
        state.income, 
        state.expenses, 
        state.netWorth,
        state.lastUpdated  // Explicitly track the timestamp field
      ],
      () => {
        // Force update on financial changes
        forceUpdate({});
      }
    );
    
    return () => {
      clearInterval(refreshInterval);
      unsubscribe();
      unsubscribeAutoMaintain();
    };
  }, []);
  
  // Calculate portfolio stats
  const stocksValue = assets
    .filter(asset => asset.type === 'stock')
    .reduce((sum, asset) => sum + (asset.currentPrice * asset.quantity), 0);
  
  const propertiesValue = properties.reduce((sum, property) => sum + property.currentValue, 0);
  
  const lifestyleValue = lifestyleItems.reduce((sum, item) => sum + (item.purchasePrice || 0) * 0.5, 0);
  
  // Format the date
  const formattedDate = new Date(currentYear, currentMonth - 1, currentDay)
    .toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  
  return (
    <div className="w-full min-h-screen pt-20 pb-32">
      {/* The MainScene component is no longer needed as we now use AppBackground */}
      
      {/* Dashboard UI */}
      <div className="relative z-10">
        <GameUI />
        
        {/* Central Dashboard - scrollable */}
        <div className="relative w-full max-w-5xl mx-auto p-6">
          <Card className="backdrop-blur-md border-primary/20 bg-background/30 card-hover shadow-lg rounded-xl overflow-hidden">
            {/* Soft glow elements using our new theme colors */}
            <div className="absolute -bottom-2 -right-2 h-32 w-32 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="absolute -top-2 -left-2 h-24 w-24 bg-secondary/20 blur-3xl rounded-full"></div>
            
            <CardHeader className="pb-2 border-b border-primary/10">
              <CardTitle className="text-3xl flex justify-between items-center font-bold">
                <span className="gradient-text">Welcome, {name}</span>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-background/50 backdrop-blur-md border border-primary/20">
                    <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
                    <TabsTrigger value="settings" className="text-sm flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Settings className="h-3.5 w-3.5 mr-1" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardTitle>
              <CardDescription className="text-muted-foreground flex items-center space-x-2 flex-wrap">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formattedDate}</span>
                <span className="px-2 text-primary/60">•</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  economyState === 'boom' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 
                  economyState === 'recession' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                  'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                }`}>
                  {economyState.charAt(0).toUpperCase() + economyState.slice(1)} Economy
                </span>
                <span className="px-2 text-primary/60">•</span>
                <ActiveEventsIndicator />
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="overview" className="mt-0 p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Wealth Overview */}
                    <Card className="futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
                      {/* Glow effect */}
                      <div className="absolute -bottom-2 -right-2 h-16 w-16 bg-green-500/30 blur-2xl rounded-full"></div>
                      
                      <CardHeader className="py-3 border-b border-primary/10">
                        <CardTitle className="text-lg flex items-center">
                          <div className="mr-3 p-2 rounded-full bg-green-400/10 border border-green-400/20">
                            <DollarSign className="h-5 w-5 text-green-400" />
                          </div>
                          <span className="text-primary font-medium">Wealth Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Cash:</span>
                            <span className="font-semibold text-lg">{formatCurrency(wealth)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Net Worth:</span>
                            <span className="font-semibold text-lg">{formatCurrency(netWorth)}</span>
                          </div>
                          <div className="flex justify-between items-center backdrop-blur-sm p-3 rounded-lg border border-primary/20 bg-primary/5">
                            <span className="text-sm text-muted-foreground">Portfolio Growth:</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              netWorth > wealth 
                                ? "bg-green-500/20 text-green-500 border border-green-500/30" 
                                : "bg-red-500/20 text-red-500 border border-red-500/30"
                            }`}>
                              {((netWorth / Math.max(wealth, 1) - 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Status Overview */}
                    <Card className="futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
                      {/* Glow effect */}
                      <div className="absolute -bottom-2 -left-2 h-16 w-16 bg-amber-500/30 blur-2xl rounded-full"></div>
                      
                      <CardHeader className="py-3 border-b border-primary/10">
                        <CardTitle className="text-lg flex items-center">
                          <div className="mr-3 p-2 rounded-full bg-amber-400/10 border border-amber-400/20">
                            <Crown className="h-5 w-5 text-amber-400" />
                          </div>
                          <span className="text-primary font-medium">Status Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="space-y-5">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm flex items-center text-muted-foreground">
                                <HeartPulse className="h-4 w-4 mr-2 text-pink-400" />
                                Happiness
                              </span>
                              <span className="text-sm font-medium bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full border border-pink-500/20">{happiness}%</span>
                            </div>
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded backdrop-blur-sm bg-secondary/20 border border-primary/10">
                                <div style={{ width: `${happiness}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-400 to-pink-600 rounded"></div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm flex items-center text-muted-foreground">
                                <Crown className="h-4 w-4 mr-2 text-amber-400" />
                                Prestige
                              </span>
                              <span className="text-sm font-medium bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">{prestige} points</span>
                            </div>
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded backdrop-blur-sm bg-secondary/20 border border-primary/10">
                                <div style={{ width: `${Math.min(prestige, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-amber-400 to-amber-600 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Character Attributes Section */}
                  <Card className="mb-8 futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
                    {/* Glow effects */}
                    <div className="absolute -top-6 right-1/4 h-16 w-16 bg-primary/30 blur-2xl rounded-full"></div>
                    <div className="absolute bottom-6 left-1/4 h-16 w-16 bg-tertiary/30 blur-2xl rounded-full"></div>
                    <CharacterAttributes />
                  </Card>
                  
                  {/* Portfolio Breakdown */}
                  <Card className="mb-8 futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
                    {/* Glow effects */}
                    <div className="absolute -top-4 left-1/3 h-16 w-16 bg-blue-500/30 blur-2xl rounded-full"></div>
                    <div className="absolute bottom-4 right-1/3 h-16 w-16 bg-purple-500/30 blur-2xl rounded-full"></div>
                    
                    <CardHeader className="py-3 border-b border-primary/10">
                      <CardTitle className="text-lg flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-blue-400/10 border border-blue-400/20">
                          <Briefcase className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-primary font-medium">Portfolio Breakdown</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 backdrop-blur-sm rounded-lg futuristic-card card-hover border border-green-400/20 bg-primary/5 relative overflow-hidden">
                          <div className="absolute top-1 right-1 h-8 w-8 bg-green-400/20 blur-xl rounded-full"></div>
                          <div className="bg-green-400/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-400/20">
                            <DollarSign className="h-6 w-6 text-green-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Cash</p>
                          <p className="font-semibold text-lg">{formatCurrency(wealth)}</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-green-400/10 text-green-400 rounded-full inline-block border border-green-400/20">
                            {((wealth / netWorth) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                        
                        <div className="text-center p-4 backdrop-blur-sm rounded-lg futuristic-card card-hover border border-blue-400/20 bg-primary/5 relative overflow-hidden">
                          <div className="absolute top-1 right-1 h-8 w-8 bg-blue-400/20 blur-xl rounded-full"></div>
                          <div className="bg-blue-400/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-400/20">
                            <ChartBar className="h-6 w-6 text-blue-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Stocks</p>
                          <p className="font-semibold text-lg">{formatCurrency(stocksValue)}</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-blue-400/10 text-blue-400 rounded-full inline-block border border-blue-400/20">
                            {((stocksValue / netWorth) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                        
                        <div className="text-center p-4 backdrop-blur-sm rounded-lg futuristic-card card-hover border border-purple-400/20 bg-primary/5 relative overflow-hidden">
                          <div className="absolute top-1 right-1 h-8 w-8 bg-purple-400/20 blur-xl rounded-full"></div>
                          <div className="bg-purple-400/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-400/20">
                            <Home className="h-6 w-6 text-purple-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Properties</p>
                          <p className="font-semibold text-lg">{formatCurrency(propertiesValue)}</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-purple-400/10 text-purple-400 rounded-full inline-block border border-purple-400/20">
                            {((propertiesValue / netWorth) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                        
                        <div className="text-center p-4 backdrop-blur-sm rounded-lg futuristic-card card-hover border border-amber-400/20 bg-primary/5 relative overflow-hidden">
                          <div className="absolute top-1 right-1 h-8 w-8 bg-amber-400/20 blur-xl rounded-full"></div>
                          <div className="bg-amber-400/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-400/20">
                            <Crown className="h-6 w-6 text-amber-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Lifestyle</p>
                          <p className="font-semibold text-lg">{formatCurrency(lifestyleValue)}</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-amber-400/10 text-amber-400 rounded-full inline-block border border-amber-400/20">
                            {((lifestyleValue / netWorth) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Monthly Financial Report */}
                  <Card className="mb-8 futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
                    {/* Glow effects */}
                    <div className="absolute -top-4 right-1/4 h-16 w-16 bg-quaternary/30 blur-2xl rounded-full"></div>
                    <div className="absolute bottom-4 left-1/4 h-16 w-16 bg-green-500/20 blur-2xl rounded-full"></div>
                    
                    <CardHeader className="py-3 border-b border-primary/10">
                      <CardTitle className="text-lg flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-quaternary/10 border border-quaternary/20">
                          <DollarSign className="h-5 w-5 text-quaternary" />
                        </div>
                        <span className="text-primary font-medium">Monthly Financial Report</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Income Section */}
                        <div className="p-4 rounded-lg futuristic-card border border-green-500/30 bg-primary/5 relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 h-16 w-16 bg-green-500/20 blur-xl rounded-full"></div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                            Monthly Income
                          </h3>
                          
                          {/* Salary */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Briefcase className="h-3.5 w-3.5 mr-1 text-blue-400" />
                                Salary {job ? `(${job.company})` : ''}
                              </span>
                              <span className="text-sm font-medium text-green-500">
                                {job ? formatCurrency(job.salary / 12) : formatCurrency(0)}/mo
                              </span>
                            </div>
                          </div>
                          
                          {/* Property Income */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Building className="h-3.5 w-3.5 mr-1 text-purple-400" />
                                Property Income ({properties.length} properties)
                              </span>
                              <span className="text-sm font-medium text-green-500">
                                {formatCurrency(properties.reduce((sum, p) => sum + (p.income || 0), 0))}/mo
                              </span>
                            </div>
                          </div>
                          
                          {/* Investment Income/Dividends */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <ChartBar className="h-3.5 w-3.5 mr-1 text-blue-400" />
                                Investment Dividends ({assets.filter(a => a.type === 'stock').length} stocks)
                              </span>
                              <span className="text-sm font-medium text-green-500">
                                {formatCurrency(
                                  assets
                                    .filter(asset => asset.type === 'stock')
                                    .reduce((sum, asset) => {
                                      // Calculate a monthly dividend based on stock value (avg 2% annual yield = 0.167% monthly)
                                      const monthlyYield = 0.00167; // 2% annual divided by 12 months
                                      // Make sure we have valid values for price and quantity
                                      const price = asset.currentPrice || 0;
                                      const quantity = asset.quantity || 0;
                                      return sum + (price * quantity * monthlyYield);
                                    }, 0)
                                )}/mo
                              </span>
                            </div>
                          </div>
                          
                          {/* Total Income */}
                          <div className="mt-4 pt-3 border-t border-secondary/30">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total Monthly Income</span>
                              <span className="font-bold text-green-500">
                                {formatCurrency(
                                  // Salary
                                  (job ? job.salary / 12 : 0) + 
                                  // Property income
                                  properties.reduce((sum, p) => sum + (p.income || 0), 0) +
                                  // Stock dividends (avg 2% annual yield = 0.167% monthly)
                                  assets
                                    .filter(asset => asset.type === 'stock')
                                    .reduce((sum, asset) => {
                                      const monthlyYield = 0.00167; // 2% annual divided by 12 months
                                      // Make sure we have valid values for price and quantity
                                      const price = asset.currentPrice || 0;
                                      const quantity = asset.quantity || 0;
                                      return sum + (price * quantity * monthlyYield);
                                    }, 0)
                                )}/mo
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expenses Section */}
                        <div className="p-4 rounded-lg futuristic-card border border-red-500/30 bg-primary/5 relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 h-16 w-16 bg-red-500/20 blur-xl rounded-full"></div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-red-500 transform rotate-180" />
                            Monthly Expenses
                          </h3>
                          
                          {/* Housing */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Home className="h-3.5 w-3.5 mr-1 text-purple-400" />
                                Housing ({housingType})
                              </span>
                              <span className="text-sm font-medium text-red-500">
                                {formatCurrency(
                                  housingType === 'homeless' ? 0 :
                                  housingType === 'shared' ? 800 :
                                  housingType === 'rental' ? 1800 :
                                  housingType === 'owned' ? 2500 :
                                  housingType === 'luxury' ? 8000 : 0
                                )}/mo
                              </span>
                            </div>
                          </div>
                          
                          {/* Transportation */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <RefreshCw className="h-3.5 w-3.5 mr-1 text-blue-400" />
                                Transportation ({vehicleType})
                              </span>
                              <span className="text-sm font-medium text-red-500">
                                {formatCurrency(
                                  vehicleType === 'none' ? 100 :
                                  vehicleType === 'bicycle' ? 20 :
                                  vehicleType === 'economy' ? 300 :
                                  vehicleType === 'standard' ? 500 :
                                  vehicleType === 'luxury' ? 1200 :
                                  vehicleType === 'premium' ? 2000 : 0
                                )}/mo
                              </span>
                            </div>
                          </div>
                          
                          {/* Food & Groceries (estimated) */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <ShoppingCart className="h-3.5 w-3.5 mr-1 text-green-400" />
                                Food & Groceries
                              </span>
                              <span className="text-sm font-medium text-red-500">
                                {formatCurrency(600)}/mo
                              </span>
                            </div>
                          </div>
                          
                          {/* Property Mortgage Payments */}
                          {properties.length > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-muted-foreground flex items-center">
                                  <Building className="h-3.5 w-3.5 mr-1 text-purple-400" />
                                  Property Mortgage Payments ({properties.length} properties)
                                </span>
                                <span className="text-sm font-medium text-red-500">
                                  {formatCurrency(properties.reduce((sum, p) => sum + (p.monthlyPayment || 0), 0))}/mo
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Property Maintenance Expenses */}
                          {properties.length > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-muted-foreground flex items-center">
                                  <Wrench className="h-3.5 w-3.5 mr-1 text-purple-400" />
                                  Property Maintenance ({properties.length} properties)
                                </span>
                                <span className="text-sm font-medium text-red-500">
                                  {formatCurrency(properties.reduce((sum, p) => sum + (p.expenses || 0), 0))}/mo
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Lifestyle Items */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <ShoppingBag className="h-3.5 w-3.5 mr-1 text-amber-400" />
                                Lifestyle Items ({lifestyleItems.length} items)
                              </span>
                              <span className="text-sm font-medium text-red-500">
                                {formatCurrency(lifestyleItems.reduce((sum, item) => sum + (item.monthlyCost || 0), 0))}/mo
                              </span>
                            </div>
                          </div>
                          
                          {/* Total Expenses */}
                          <div className="mt-4 pt-3 border-t border-secondary/30">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total Monthly Expenses</span>
                              <span className="font-bold text-red-500">
                                {formatCurrency(
                                  // Housing costs
                                  (housingType === 'homeless' ? 0 :
                                   housingType === 'shared' ? 800 :
                                   housingType === 'rental' ? 1800 :
                                   housingType === 'owned' ? 2500 :
                                   housingType === 'luxury' ? 8000 : 0) +
                                  // Vehicle costs
                                  (vehicleType === 'none' ? 100 :
                                   vehicleType === 'bicycle' ? 20 :
                                   vehicleType === 'economy' ? 300 :
                                   vehicleType === 'standard' ? 500 :
                                   vehicleType === 'luxury' ? 1200 :
                                   vehicleType === 'premium' ? 2000 : 0) +
                                  // Food costs
                                  600 +
                                  // Property mortgage payments
                                  properties.reduce((sum, p) => sum + (p.monthlyPayment || 0), 0) +
                                  // Property maintenance expenses
                                  properties.reduce((sum, p) => sum + (p.expenses || 0), 0) +
                                  // Lifestyle costs
                                  lifestyleItems.reduce((sum, item) => sum + (item.monthlyCost || 0), 0)
                                )}/mo
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Monthly Balance */}
                      <div className="mt-6 p-4 rounded-lg futuristic-card border border-primary/20 bg-primary/5 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute -top-4 left-1/3 h-16 w-16 bg-primary/30 blur-xl rounded-full"></div>
                        <div className="absolute bottom-4 right-1/3 h-16 w-16 bg-secondary/30 blur-xl rounded-full"></div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg gradient-text">Monthly Cash Flow</span>
                          
                          {/* Calculate monthly income */}
                          {(() => {
                            // Calculate stock dividends (avg 2% annual yield = 0.167% monthly)
                            const stockDividends = assets
                              .filter(asset => asset.type === 'stock')
                              .reduce((sum, asset) => {
                                const monthlyYield = 0.00167; // 2% annual divided by 12 months
                                // Make sure we have valid values for price and quantity
                                const price = asset.currentPrice || 0;
                                const quantity = asset.quantity || 0;
                                return sum + (price * quantity * monthlyYield);
                              }, 0);
                              
                            const monthlyIncome = 
                              // Salary
                              (job ? job.salary / 12 : 0) + 
                              // Property income
                              properties.reduce((sum, p) => sum + (p.income || 0), 0) +
                              // Stock dividends
                              stockDividends;
                            
                            // Calculate monthly expenses
                            const monthlyExpenses = 
                              // Housing costs
                              (housingType === 'homeless' ? 0 :
                               housingType === 'shared' ? 800 :
                               housingType === 'rental' ? 1800 :
                               housingType === 'owned' ? 2500 :
                               housingType === 'luxury' ? 8000 : 0) +
                              // Vehicle costs
                              (vehicleType === 'none' ? 100 :
                               vehicleType === 'bicycle' ? 20 :
                               vehicleType === 'economy' ? 300 :
                               vehicleType === 'standard' ? 500 :
                               vehicleType === 'luxury' ? 1200 :
                               vehicleType === 'premium' ? 2000 : 0) +
                              // Food costs
                              600 +
                              // Property mortgage payments - IMPORTANT: Must include these 
                              properties.reduce((sum, p) => sum + (p.monthlyPayment || 0), 0) +
                              // Property maintenance expenses
                              properties.reduce((sum, p) => sum + (p.expenses || 0), 0) +
                              // Lifestyle costs
                              lifestyleItems.reduce((sum, item) => sum + (item.monthlyCost || 0), 0);
                            
                            const monthlyBalance = monthlyIncome - monthlyExpenses;
                            
                            return (
                              <span className={`font-bold text-lg ${monthlyBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatCurrency(monthlyBalance)}/mo
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Achievements */}
                  <Card className="futuristic-card border-primary/30 shadow-lg mb-8 relative overflow-hidden">
                    {/* Glow effects */}
                    <div className="absolute -top-4 left-1/4 h-16 w-16 bg-yellow-500/30 blur-2xl rounded-full"></div>
                    <div className="absolute bottom-4 right-1/4 h-16 w-16 bg-yellow-500/20 blur-2xl rounded-full"></div>
                    
                    <CardHeader className="py-3 border-b border-primary/10">
                      <CardTitle className="text-lg flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                          <Trophy className="h-5 w-5 text-yellow-400" />
                        </div>
                        <span className="text-primary font-medium">Recent Achievements</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-auto text-xs"
                          onClick={() => navigate('/achievements')}
                        >
                          View All
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      <AchievementsWidget />
                    </CardContent>
                  </Card>
                  
                  {/* Market Indicators */}
                  <Card className="futuristic-card border-primary/30 shadow-lg mb-4 relative overflow-hidden">
                    {/* Glow effects */}
                    <div className="absolute -top-4 right-1/4 h-16 w-16 bg-blue-500/30 blur-2xl rounded-full"></div>
                    <div className="absolute bottom-4 left-1/4 h-16 w-16 bg-tertiary/30 blur-2xl rounded-full"></div>
                    
                    <CardHeader className="py-3 border-b border-primary/10">
                      <CardTitle className="text-lg flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-blue-400/10 border border-blue-400/20">
                          <TrendingUp className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-primary font-medium">Market Indicators</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg futuristic-card border border-blue-500/30 bg-primary/5 relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 h-12 w-12 bg-blue-500/20 blur-xl rounded-full"></div>
                          <p className="text-sm text-muted-foreground mb-3 flex items-center">
                            <ChartBar className="h-4 w-4 mr-2 text-blue-500" />
                            Stock Market
                          </p>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium flex items-center">
                              {marketTrend === 'bull' ? (
                                <div className="flex items-center px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  <span>Bull Market</span>
                                </div>
                              ) : marketTrend === 'bear' ? (
                                <div className="flex items-center px-2 py-1 bg-red-500/10 text-red-500 rounded-full">
                                  <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                                  <span>Bear Market</span>
                                </div>
                              ) : (
                                <div className="flex items-center px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full">
                                  <span className="h-4 w-4 mr-1" />
                                  <span>Stable Market</span>
                                </div>
                              )}
                            </span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              stockMarketHealth >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                              stockMarketHealth >= 60 ? 'bg-green-100 text-green-800' : 
                              stockMarketHealth >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                              stockMarketHealth >= 20 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getStockMarketHealthCategory().toUpperCase()}
                            </span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary/40">
                              <div 
                                style={{ width: `${stockMarketHealth}%` }} 
                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded ${
                                  marketTrend === 'bull' 
                                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                    : marketTrend === 'bear'
                                    ? 'bg-gradient-to-r from-red-400 to-red-600'
                                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg futuristic-card border border-purple-500/30 bg-primary/5 relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 h-12 w-12 bg-purple-500/20 blur-xl rounded-full"></div>
                          <p className="text-sm text-muted-foreground mb-3 flex items-center">
                            <Home className="h-4 w-4 mr-2 text-purple-500" />
                            Real Estate Market
                          </p>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Market Health</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              realEstateMarketHealth >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                              realEstateMarketHealth >= 60 ? 'bg-green-100 text-green-800' : 
                              realEstateMarketHealth >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                              realEstateMarketHealth >= 20 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getRealEstateMarketHealthCategory().toUpperCase()}
                            </span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary/40">
                              <div 
                                style={{ width: `${realEstateMarketHealth}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-400 to-purple-600 rounded"
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg futuristic-card border border-red-500/30 bg-primary/5 relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 h-12 w-12 bg-red-500/20 blur-xl rounded-full"></div>
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-red-400/10 h-10 w-10 flex items-center justify-center border border-red-400/20">
                              <TrendingUp className={`h-5 w-5 text-red-400 ${inflation > 3 ? 'transform rotate-45' : ''}`} />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Inflation Rate</p>
                              <p className="font-medium text-lg">{inflation.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">
                                {inflation <= 2 ? "Low inflation - stable prices" : 
                                 inflation <= 5 ? "Moderate inflation - normal economic growth" : 
                                 "High inflation - economic instability"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg futuristic-card border border-blue-500/30 bg-primary/5 relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 h-12 w-12 bg-blue-500/20 blur-xl rounded-full"></div>
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-blue-400/10 h-10 w-10 flex items-center justify-center border border-blue-400/20">
                              <DollarSign className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Interest Rate</p>
                              <p className="font-medium text-lg">{interestRate.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">
                                {interestRate <= 2 ? "Low rates - cheaper loans" : 
                                 interestRate <= 5 ? "Moderate rates - balanced economy" : 
                                 "High rates - expensive borrowing"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-0 p-0">
                  <Card className="futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
                    {/* Glow effects */}
                    <div className="absolute -top-4 left-1/4 h-16 w-16 bg-slate-500/30 blur-2xl rounded-full"></div>
                    <div className="absolute bottom-4 right-1/4 h-16 w-16 bg-tertiary/30 blur-2xl rounded-full"></div>
                    
                    <CardHeader className="border-b border-primary/10">
                      <CardTitle className="text-xl flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-slate-400/10 border border-slate-400/20">
                          <Settings className="h-5 w-5 text-slate-400" />
                        </div>
                        <span className="text-primary font-medium">Game Settings</span>
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Configure your game preferences and manage your data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-5 rounded-lg futuristic-card border border-blue-500/30 bg-primary/5 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 h-12 w-12 bg-blue-500/20 blur-xl rounded-full"></div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <HardDrive className="h-5 w-5 mr-2 text-blue-400" />
                          Game Data
                        </h3>
                        <Separator className="my-3 bg-secondary/50" />
                        <p className="text-sm text-muted-foreground mb-5">
                          Your game progress is automatically saved to your device's local storage.
                          This includes your character details, assets, properties, and all game state.
                          If you want to start fresh with a new character, use the reset option below.
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="button-pulse flex items-center">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reset Progress
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-effect border border-destructive">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold text-destructive flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                Reset Game Progress?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will permanently delete all your character data, assets, properties, and lifestyle items.
                                You'll be returned to the character creation screen to start fresh.
                              </AlertDialogDescription>
                              <div className="mt-2 font-medium text-red-500">This action cannot be undone.</div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border border-secondary/50">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleResetProgress}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Reset Progress
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <div className="p-5 rounded-lg futuristic-card border border-purple-500/30 bg-primary/5 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 h-12 w-12 bg-purple-500/20 blur-xl rounded-full"></div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Settings className="h-5 w-5 mr-2 text-purple-400" />
                          Display Settings
                        </h3>
                        <Separator className="my-3 bg-secondary/50" />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Toggle between light and dark mode for the game interface.
                          </p>
                          <ThemeToggle />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-between p-6">
              <Button 
                variant="default"
                onClick={() => navigate('/investments')}
                className="flex items-center button-pulse bg-blue-500/80 hover:bg-blue-600/90 text-white"
              >
                <ChartBar className="h-4 w-4 mr-2" />
                Investments
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="default"
                onClick={() => navigate('/properties')}
                className="flex items-center button-pulse bg-purple-500/80 hover:bg-purple-600/90 text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Properties
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="default"
                onClick={() => navigate('/lifestyle')}
                className="flex items-center button-pulse bg-amber-500/80 hover:bg-amber-600/90 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Lifestyle
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
