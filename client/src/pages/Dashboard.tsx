import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { useAudio } from '../lib/stores/useAudio';
import { useGame } from '../lib/stores/useGame';
import { useAchievements } from '../lib/stores/useAchievements';
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
  Award
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

// Achievement Widget component
const AchievementsWidget = () => {
  const { achievements, getCompletedAchievements, getInProgressAchievements } = useAchievements();
  const navigate = useNavigate();
  
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
  
  const getAchievementIcon = (iconName: string, className: string = '') => {
    switch (iconName) {
      case 'Trophy': return <Trophy className={`h-5 w-5 ${className}`} />;
      case 'DollarSign': return <DollarSign className={`h-5 w-5 ${className}`} />;
      case 'Star': return <Award className={`h-5 w-5 ${className}`} />;
      case 'Home': return <Home className={`h-5 w-5 ${className}`} />;
      case 'TrendingUp': return <TrendingUp className={`h-5 w-5 ${className}`} />;
      case 'ShoppingBag': return <ShoppingBag className={`h-5 w-5 ${className}`} />;
      case 'Play': return <TrendingUp className={`h-5 w-5 ${className}`} />;
      case 'Clock': return <Calendar className={`h-5 w-5 ${className}`} />;
      default: return <Trophy className={`h-5 w-5 ${className}`} />;
    }
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
              {getAchievementIcon(achievement.icon, achievement.isUnlocked 
                ? 'text-yellow-500' 
                : getCategoryColor(achievement.category)
              )}
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
  const { name, wealth, netWorth, happiness, prestige, assets, properties, lifestyleItems, resetProgress } = useCharacter();
  const { currentDay, currentMonth, currentYear } = useTime();
  const { 
    marketTrend, 
    economyState, 
    stockMarketHealth, 
    realEstateMarketHealth,
    inflation,
    interestRate
  } = useEconomy();
  const { backgroundMusic, isMuted } = useAudio();
  const { restart } = useGame();
  
  // Track active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  // Handle reset confirmation
  const handleResetProgress = () => {
    resetProgress();
    restart();
    navigate('/create');
  };
  
  // Start background music when dashboard loads
  useEffect(() => {
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(err => {
        console.log("Audio autoplay was prevented:", err);
      });
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [backgroundMusic, isMuted]);
  
  // Calculate portfolio stats
  const stocksValue = assets
    .filter(asset => asset.type === 'stock')
    .reduce((sum, asset) => sum + (asset.purchasePrice * asset.quantity), 0);
  
  const propertiesValue = properties.reduce((sum, property) => sum + property.value, 0);
  
  const lifestyleValue = lifestyleItems.reduce((sum, item) => sum + item.purchasePrice * 0.5, 0);
  
  // Format the date
  const formattedDate = new Date(currentYear, currentMonth - 1, currentDay)
    .toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  
  return (
    <div className="w-full min-h-screen bg-background pt-20 pb-32">
      {/* 3D Scene - Fixed Position */}
      <div className="fixed inset-0 z-0">
        <MainScene />
      </div>
      
      {/* Dashboard UI */}
      <div className="relative z-10">
        <GameUI />
        
        {/* Central Dashboard - scrollable */}
        <div className="relative w-full max-w-5xl mx-auto p-6">
          <Card className="glass-effect border card-hover shadow-2xl rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl flex justify-between items-center font-bold">
                <span className="gradient-text">Welcome, {name}</span>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-accent">
                    <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
                    <TabsTrigger value="settings" className="text-sm flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Settings className="h-3.5 w-3.5 mr-1" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardTitle>
              <CardDescription className="text-muted-foreground flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
                <span className="px-2">•</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  economyState === 'boom' ? 'bg-green-500/20 text-green-500' : 
                  economyState === 'recession' ? 'bg-red-500/20 text-red-500' : 
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {economyState.charAt(0).toUpperCase() + economyState.slice(1)} Economy
                </span>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="overview" className="mt-0 p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Wealth Overview */}
                    <Card className="glass-effect border-accent shadow-md">
                      <CardHeader className="py-3">
                        <CardTitle className="text-lg flex items-center">
                          <div className="mr-3 p-2 rounded-full bg-green-400/10">
                            <DollarSign className="h-5 w-5 text-green-400" />
                          </div>
                          <span className="text-primary font-medium">Wealth Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Cash:</span>
                            <span className="font-semibold text-lg">{formatCurrency(wealth)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Net Worth:</span>
                            <span className="font-semibold text-lg">{formatCurrency(netWorth)}</span>
                          </div>
                          <div className="flex justify-between items-center bg-secondary/40 p-2 rounded-lg">
                            <span className="text-sm text-muted-foreground">Portfolio Growth:</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              netWorth > wealth 
                                ? "bg-green-500/20 text-green-500" 
                                : "bg-red-500/20 text-red-500"
                            }`}>
                              {((netWorth / Math.max(wealth, 1) - 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Status Overview */}
                    <Card className="glass-effect border-accent shadow-md">
                      <CardHeader className="py-3">
                        <CardTitle className="text-lg flex items-center">
                          <div className="mr-3 p-2 rounded-full bg-amber-400/10">
                            <Crown className="h-5 w-5 text-amber-400" />
                          </div>
                          <span className="text-primary font-medium">Status Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-5">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm flex items-center text-muted-foreground">
                                <HeartPulse className="h-4 w-4 mr-2 text-pink-400" />
                                Happiness
                              </span>
                              <span className="text-sm font-medium bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full">{happiness}%</span>
                            </div>
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary/40">
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
                              <span className="text-sm font-medium bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full">{prestige} points</span>
                            </div>
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary/40">
                                <div style={{ width: `${Math.min(prestige, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-amber-400 to-amber-600 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Portfolio Breakdown */}
                  <Card className="mb-8 glass-effect border-accent shadow-md">
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-blue-400/10">
                          <Briefcase className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-primary font-medium">Portfolio Breakdown</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-secondary/30 backdrop-blur-sm rounded-lg glass-effect card-hover border border-secondary/10">
                          <div className="bg-green-400/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <DollarSign className="h-6 w-6 text-green-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Cash</p>
                          <p className="font-semibold text-lg">{formatCurrency(wealth)}</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-green-400/10 text-green-400 rounded-full inline-block">
                            {((wealth / netWorth) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-secondary/30 backdrop-blur-sm rounded-lg glass-effect card-hover border border-secondary/10">
                          <div className="bg-blue-400/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ChartBar className="h-6 w-6 text-blue-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Stocks</p>
                          <p className="font-semibold text-lg">{formatCurrency(stocksValue)}</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-blue-400/10 text-blue-400 rounded-full inline-block">
                            {((stocksValue / netWorth) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-secondary/30 backdrop-blur-sm rounded-lg glass-effect card-hover border border-secondary/10">
                          <div className="bg-purple-400/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Home className="h-6 w-6 text-purple-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Properties</p>
                          <p className="font-semibold text-lg">{formatCurrency(propertiesValue)}</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-purple-400/10 text-purple-400 rounded-full inline-block">
                            {((propertiesValue / netWorth) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-secondary/30 backdrop-blur-sm rounded-lg glass-effect card-hover border border-secondary/10">
                          <div className="bg-amber-400/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Crown className="h-6 w-6 text-amber-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Lifestyle</p>
                          <p className="font-semibold text-lg">{formatCurrency(lifestyleValue)}</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-amber-400/10 text-amber-400 rounded-full inline-block">
                            {((lifestyleValue / netWorth) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Achievements */}
                  <Card className="glass-effect border-accent shadow-md mb-8">
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-yellow-400/10">
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
                  <Card className="glass-effect border-accent shadow-md mb-4">
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-blue-400/10">
                          <TrendingUp className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-primary font-medium">Market Indicators</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-secondary/30 p-4 rounded-lg glass-effect border border-secondary/10">
                          <p className="text-sm text-muted-foreground mb-3 flex items-center">
                            <ChartBar className="h-4 w-4 mr-2" />
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
                            <span className="text-sm font-medium px-2 py-1 bg-secondary rounded-full">{stockMarketHealth}%</span>
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
                        
                        <div className="bg-secondary/30 p-4 rounded-lg glass-effect border border-secondary/10">
                          <p className="text-sm text-muted-foreground mb-3 flex items-center">
                            <Home className="h-4 w-4 mr-2" />
                            Real Estate Market
                          </p>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Market Health</span>
                            <span className="text-sm font-medium px-2 py-1 bg-secondary rounded-full">{realEstateMarketHealth}%</span>
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
                        
                        <div className="bg-secondary/30 p-4 rounded-lg glass-effect border border-secondary/10">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-red-400/10 h-10 w-10 flex items-center justify-center">
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
                        
                        <div className="bg-secondary/30 p-4 rounded-lg glass-effect border border-secondary/10">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-blue-400/10 h-10 w-10 flex items-center justify-center">
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
                  <Card className="glass-effect border-accent shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <div className="mr-3 p-2 rounded-full bg-slate-400/10">
                          <Settings className="h-5 w-5 text-slate-400" />
                        </div>
                        <span className="text-primary font-medium">Game Settings</span>
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Configure your game preferences and manage your data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-secondary/30 p-5 rounded-lg glass-effect border border-secondary/10">
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
                                <p className="mt-2 font-medium">This action cannot be undone.</p>
                              </AlertDialogDescription>
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
