import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { useAudio } from '../lib/stores/useAudio';
import { useGame } from '../lib/stores/useGame';
import { useAchievements } from '../lib/stores/useAchievements';
import useRandomEvents from '../lib/stores/useRandomEvents';
import { toast } from 'sonner';

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
import { formatCurrency, performCompleteGameReset } from '../lib/utils';

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
    return null;
  }
  
  return (
    <Card className="mb-8 futuristic-card border-primary/30 shadow-lg relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute -top-4 left-1/4 h-16 w-16 bg-yellow-500/30 blur-2xl rounded-full"></div>
      <div className="absolute bottom-4 right-1/4 h-16 w-16 bg-primary/20 blur-2xl rounded-full"></div>
      
      <CardHeader className="py-3 border-b border-primary/10">
        <CardTitle className="text-lg flex items-center">
          <div className="mr-3 p-2 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            <Trophy className="h-5 w-5 text-yellow-400" />
          </div>
          <span className="text-primary font-medium">Achievements</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-1 gap-4">
          {displayAchievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`flex justify-between items-center p-3 rounded-lg border backdrop-blur-sm ${
                achievement.completed 
                  ? 'bg-background/30 border-yellow-400/30' 
                  : 'bg-background/10 border-primary/20'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${
                  achievement.completed 
                    ? 'bg-yellow-400/10 border border-yellow-400/20' 
                    : 'bg-secondary/10 border border-secondary/20'
                }`}>
                  {achievement.completed 
                    ? <Trophy className="h-5 w-5 text-yellow-400" /> 
                    : <span className={`h-5 w-5 ${getCategoryColor(achievement.category)}`}>
                        {achievement.category === 'wealth' ? <DollarSign className="h-5 w-5" /> :
                         achievement.category === 'property' ? <Home className="h-5 w-5" /> :
                         achievement.category === 'investment' ? <TrendingUp className="h-5 w-5" /> :
                         achievement.category === 'lifestyle' ? <Crown className="h-5 w-5" /> :
                         <Award className="h-5 w-5" />}
                      </span>
                  }
                </div>
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
              
              {achievement.completed ? (
                <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-full text-xs text-yellow-400 border border-yellow-400/20">
                  <Award className="h-3 w-3" />
                  <span>Completed</span>
                </div>
              ) : (
                <div className="w-24">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{Math.floor(achievement.progress)}%</span>
                    <span>100%</span>
                  </div>
                  <Progress 
                    value={achievement.progress} 
                    className="h-1.5 bg-primary/10" 
                    indicatorClassName="bg-gradient-to-r from-secondary to-primary"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="link" 
          className="w-full text-primary/80 hover:text-primary"
          onClick={() => navigate('/achievements')}
        >
          View All Achievements <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    wealth, 
    setWealth, 
    name, 
    happiness,
    prestige,
    stress,
    energy,
    relationship,
    health,
    intelligence,
    charisma,
    creativity,
    leadership,
    marketingSkill,
    technicalSkill,
    financialSkill,
    operationSkill,
  } = useCharacter();
  
  const { currentDay, currentMonth, currentYear } = useTime();
  const { economyState } = useEconomy();
  const { playSoundEffect } = useAudio();
  const { isGamePaused, gameSpeed } = useGame();
  const { activeRandomEvents } = useRandomEvents();
  
  // State to track stocks, properties and assets
  const [stocksValue, setStocksValue] = useState(15000);
  const [propertiesValue, setPropertiesValue] = useState(0);
  const [lifestyleValue, setLifestyleValue] = useState(5000);
  const [netWorth, setNetWorth] = useState(wealth + stocksValue + propertiesValue + lifestyleValue);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  
  // Update net worth when component mounts and when related values change
  useEffect(() => {
    setNetWorth(wealth + stocksValue + propertiesValue + lifestyleValue);
  }, [wealth, stocksValue, propertiesValue, lifestyleValue]);
  
  // Format the date
  const formattedDate = new Date(currentYear, currentMonth - 1, currentDay)
    .toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  
  return (
    <div className="w-full min-h-screen pt-2 pb-24">
      {/* The MainScene component is no longer needed as we now use AppBackground */}
      
      {/* Dashboard UI - outside of normal flow */}
      <GameUI />
        
      {/* Central Dashboard - scrollable */}
      <div className="relative z-10 w-full max-w-5xl mx-auto p-6 mt-14">
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
                
                {/* Achievements Widget */}
                <AchievementsWidget />
                
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-20 futuristic-card card-hover border border-primary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/job')}
                  >
                    <Briefcase className="h-5 w-5 mb-2 text-primary" />
                    Career
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-20 futuristic-card card-hover border border-secondary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/investments')}
                  >
                    <ChartBar className="h-5 w-5 mb-2 text-secondary" />
                    Investments
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-20 futuristic-card card-hover border border-tertiary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/properties')}
                  >
                    <Home className="h-5 w-5 mb-2 text-tertiary" />
                    Properties
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-20 futuristic-card card-hover border border-quaternary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/lifestyle')}
                  >
                    <Crown className="h-5 w-5 mb-2" />
                    Lifestyle
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0 p-0">
                <div className="space-y-6">
                  <Card className="border-primary/30 shadow-lg relative overflow-hidden">
                    <div className="absolute -top-4 right-1/3 h-16 w-16 bg-primary/20 blur-2xl rounded-full"></div>
                    <CardHeader>
                      <CardTitle className="text-xl">Game Settings</CardTitle>
                      <CardDescription>Adjust your game preferences and manage your data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Game Data Management */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <HardDrive className="mr-2 h-5 w-5 text-primary" />
                          Game Data Management
                        </h3>
                        <div className="flex flex-col space-y-2">
                          {/* Save Game Data */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Backup Game Data
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Backup Game Data</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will save your current game data to your browser&apos;s local storage.
                                  You can restore from this backup later if needed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  // Handle backup logic here
                                  playSoundEffect('success');
                                  setShowBackupDialog(true);
                                }}>
                                  Create Backup
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          {/* Reset Game Data */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="w-full justify-start border-red-500/30 text-red-500">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Reset Game
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-500">Reset Game Data</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all your game progress. This action cannot be undone.
                                  Are you sure you want to start fresh?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  // Use our centralized reset function that ensures complete reset
                                  performCompleteGameReset();
                                  
                                  // Display a toast message
                                  toast.success("Game data has been completely reset");
                                }} className="bg-red-500 hover:bg-red-600">
                                  Reset Game
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Game Credits */}
                      <div className="pt-4">
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Award className="mr-2 h-5 w-5 text-yellow-400" />
                          About This Game
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Business Empire: RichMan is a financial simulator that lets you experience the journey of wealth building through various investment decisions and lifestyle choices.
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Version: 1.0.0</p>
                          <p>Created with 💖 by Replit</p>
                          <p>© 2024 All Rights Reserved</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}