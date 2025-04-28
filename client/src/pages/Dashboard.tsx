import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStore } from '../lib/utils/storeRegistry';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
// Audio removed
import { useGame } from '../lib/stores/useGame';
import { useAchievements } from '../lib/stores/useAchievements';
import useRandomEvents from '../lib/stores/useRandomEvents';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useAssetRefresh } from '../components/AssetRefreshProvider';
import { toast } from 'sonner';

import { CharacterAttributes } from '../components/CharacterAttributes';
import { ActiveEventsIndicator } from '../components/ActiveEventsIndicator';
import { SimplePortfolioBreakdown } from '../components/SimplePortfolioBreakdown';
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

// Type definition for achievements
interface AchievementType {
  id: string;
  title: string;
  description: string;
  category: string;
  isUnlocked: boolean;
  progress: number;
  unlockedDate?: string;
}

// Achievement Widget component - Memoized to prevent re-renders
const AchievementsWidget = React.memo(() => {
  const { achievements, getCompletedAchievements, getInProgressAchievements } = useAchievements();
  const navigate = useNavigate();
  
  // Achievement checking interval with useRef to avoid closure issues
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCheckTimeRef = useRef(0);
  
  // Check all achievements when dashboard loads - optimized with throttling
  useInitAchievements(() => {
    // Function to check achievements with rate limiting
    const checkAchievementsThrottled = () => {
      const now = Date.now();
      // Only check if it's been at least 5 seconds since the last check
      if (now - lastCheckTimeRef.current > 5000) {
        console.log("Checking achievements (throttled)");
        checkAllAchievements();
        lastCheckTimeRef.current = now;
      }
    };
    
    // Check once on mount
    checkAchievementsThrottled();
    
    // Set up interval using longer duration (15 seconds instead of 10)
    // This reduces CPU usage while still keeping achievements reasonably up-to-date
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    
    checkIntervalRef.current = setInterval(checkAchievementsThrottled, 15000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);
  
  // Memoize expensive achievement calculations to avoid re-computing on every render
  const displayAchievements = useMemo(() => {
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
    return [...recentCompletedAchievements, ...inProgressAchievements].slice(0, 4);
  }, [achievements, getCompletedAchievements, getInProgressAchievements]);
  
  // Memoize color function to avoid recreation on each render
  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case 'wealth': return 'text-quinary';
      case 'property': return 'text-tertiary';
      case 'investment': return 'text-secondary';
      case 'lifestyle': return 'text-purple-500';
      case 'general': return 'text-primary';
      default: return 'text-primary';
    }
  }, []);
  
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
                achievement.isUnlocked 
                  ? 'bg-background/30 border-yellow-400/30' 
                  : 'bg-background/10 border-primary/20'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${
                  achievement.isUnlocked 
                    ? 'bg-yellow-400/10 border border-yellow-400/20' 
                    : 'bg-secondary/10 border border-secondary/20'
                }`}>
                  {achievement.isUnlocked 
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
              
              {achievement.isUnlocked ? (
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
});

// Create a global update function that can be called from anywhere
// This is defined outside the component to avoid re-creation on renders
if (!(window as any).globalUpdateAllPrices) {
  console.log("Setting up global price update function");
  (window as any).globalUpdateAllPrices = () => {
    // First update character assets with latest prices
    const characterStore = getStore('character');
    const assetTrackerState = useAssetTracker.getState();
    
    if (characterStore) {
      // Sync in both directions to ensure consistency
      characterStore.getState().syncAssetsWithAssetTracker();
      assetTrackerState.recalculateTotals();
      
      // Log for debugging
      console.log('Global price update complete');
    } else {
      console.error('Failed to update prices: Character store not found in registry');
    }
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Using individual selectors for character properties
  // This is more efficient as it only re-renders when the specific value changes
  const characterStore = getStore('character');
  
  // Individual character attributes with memoized selectors to prevent unnecessary re-renders
  const name = useMemo(() => {
    return characterStore?.getState()?.name || 'Player';
  }, []);
  
  // For attributes that change frequently, use the store's subscribe mechanism
  // with selective updates to minimize re-renders
  const [happiness, setHappiness] = useState(characterStore?.getState()?.happiness || 50);
  const [prestige, setPrestige] = useState(characterStore?.getState()?.prestige || 0);
  const [stress, setStress] = useState(characterStore?.getState()?.stress || 0);
  const [energy, setEnergy] = useState(characterStore?.getState()?.energy || 100);
  const [health, setHealth] = useState(characterStore?.getState()?.health || 100);
  
  // Throttled update mechanism to reduce render frequency
  const lastUpdateRef = useRef(Date.now());
  const updatesQueuedRef = useRef(false);
  const pendingUpdatesRef = useRef<{[key: string]: any}>({});
  
  // Get character data from store registry when available with throttling
  useEffect(() => {
    if (!characterStore) return;
    
    // Function to apply batched updates
    const applyUpdates = () => {
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        // Apply all queued updates at once
        if (pendingUpdatesRef.current.happiness !== undefined) setHappiness(pendingUpdatesRef.current.happiness);
        if (pendingUpdatesRef.current.prestige !== undefined) setPrestige(pendingUpdatesRef.current.prestige);
        if (pendingUpdatesRef.current.stress !== undefined) setStress(pendingUpdatesRef.current.stress);
        if (pendingUpdatesRef.current.energy !== undefined) setEnergy(pendingUpdatesRef.current.energy);
        if (pendingUpdatesRef.current.health !== undefined) setHealth(pendingUpdatesRef.current.health);
        
        // Reset pending updates
        pendingUpdatesRef.current = {};
        updatesQueuedRef.current = false;
        lastUpdateRef.current = Date.now();
      }
    };
    
    // Set up throttled update mechanism
    const throttledUpdateCheck = () => {
      if (updatesQueuedRef.current && Date.now() - lastUpdateRef.current > 200) {
        applyUpdates();
      }
    };
    
    // Set initial values
    const initialState = characterStore.getState();
    setHappiness(initialState.happiness || 50);
    setPrestige(initialState.prestige || 0);
    setStress(initialState.stress || 0);
    setEnergy(initialState.energy || 100);
    setHealth(initialState.health || 100);
    
    // Subscribe to future changes with throttling
    const unsubscribe = characterStore.subscribe((state: any) => {
      // Queue updates instead of applying immediately
      pendingUpdatesRef.current.happiness = state.happiness;
      pendingUpdatesRef.current.prestige = state.prestige;
      pendingUpdatesRef.current.stress = state.stress;
      pendingUpdatesRef.current.energy = state.energy;
      pendingUpdatesRef.current.health = state.health;
      
      updatesQueuedRef.current = true;
      
      // Apply immediately if no recent updates, otherwise wait
      throttledUpdateCheck();
    });
    
    // Set up interval to check for pending updates
    const checkInterval = setInterval(throttledUpdateCheck, 100);
    
    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, []);
  
  // Get financial data directly from useAssetTracker with stable selectors
  const netWorth = useAssetTracker(
    useCallback(state => state.totalNetWorth, [])
  );
  
  const wealth = useAssetTracker(
    useCallback(state => state.totalCash, [])
  );
  
  // Force reload of date from localStorage when dashboard mounts
  const timeStore = useTime();
  const { currentDay, currentMonth, currentYear } = timeStore;
  
  // Refresh time data on component mount to make sure we have the latest
  useEffect(() => {
    // Check if there's a discrepancy between localStorage and state
    try {
      // Check if we've already checked for discrepancies this session
      if (sessionStorage.getItem('dashboard_already_checked_consistency') === 'true') {
        console.log('Already checked time consistency in this session');
        return;
      }
      
      // Mark as checked to prevent reload loops
      sessionStorage.setItem('dashboard_already_checked_consistency', 'true');
      
      const timeData = localStorage.getItem('luxury_lifestyle_time');
      if (timeData) {
        const parsedTime = JSON.parse(timeData);
        
        // Log the values for debugging
        console.log(`Dashboard checking time: State(${currentMonth}/${currentDay}/${currentYear}) vs Storage(${parsedTime.currentMonth}/${parsedTime.currentDay}/${parsedTime.currentYear})`);
        
        // Only reload if there's a significant discrepancy (more than 30 days)
        const stateDate = new Date(currentYear, currentMonth - 1, currentDay);
        const storageDate = new Date(parsedTime.currentYear, parsedTime.currentMonth - 1, parsedTime.currentDay);
        const diffTime = Math.abs(stateDate.getTime() - storageDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 30) { // Only reload for significant differences
          console.log(`Major date discrepancy detected (${diffDays} days difference), manually updating time store...`);
          // Instead of reloading, manually update the time store
          timeStore.setDate(parsedTime.currentDay, parsedTime.currentMonth, parsedTime.currentYear);
        }
      }
    } catch (e) {
      console.error('Error checking time consistency in Dashboard:', e);
    }
  }, [currentDay, currentMonth, currentYear, timeStore]);
  
  const { economyState } = useEconomy();
  // Audio removed
  const game = useGame();
  const randomEvents = useRandomEvents();
  
  // Get specific asset tracker methods only (not the whole state)
  // This prevents infinite rendering loops from state changes
  const recalculateTotals = useAssetTracker(state => state.recalculateTotals);
  const forceUpdate = useAssetTracker(state => state.forceUpdate);
  
  // Get asset refresh functionality from the central provider
  const { triggerRefresh, lastRefreshTime } = useAssetRefresh();
  
  // Use the centralized asset refresh provider instead of local interval
  useEffect(() => {
    // Log for debugging
    console.log("Dashboard: Using central AssetRefreshProvider");
    
    // Trigger a refresh when the component mounts
    triggerRefresh();
    
    // No cleanup needed as the provider handles intervals
  }, []); // No dependencies needed since triggerRefresh is stable
  
  // Update UI when the global refresh happens
  useEffect(() => {
    if (lastRefreshTime > 0) {
      console.log("Dashboard: Responding to global asset refresh event");
      // No need to manually trigger refresh since it's handled by the provider
      
      // Instead, just make sure our totals are recalculated
      recalculateTotals();
    }
  }, [lastRefreshTime, recalculateTotals]);
  
  // Simple state variables
  const [activeTab, setActiveTab] = useState('overview');
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  
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
                              <div style={{ width: `${Math.min(prestige / 30, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-amber-400 to-amber-600 rounded"></div>
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
                  
                  {/* Use our completely rewritten component for better reliability */}
                  <SimplePortfolioBreakdown />
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
                    className="w-full h-20 futuristic-card card-hover border border-quinary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/businesses')}
                  >
                    <Building className="h-5 w-5 mb-2 text-quinary" />
                    Businesses
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-4">
                <div className="space-y-6">
                  <Card className="futuristic-card border-primary/30 shadow-lg backdrop-blur-sm bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <RefreshCw className="h-5 w-5 mr-2 text-primary/70" />
                        Time Settings
                      </CardTitle>
                      <CardDescription>Manage game time settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Current Date</p>
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 inline-block mr-1" />
                            {formattedDate}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Explicit type to avoid issues
                            const currentTimeState = useTime.getState();
                            console.log("Starting time skip...");
                            currentTimeState.skipDays(7);
                            toast.success("Skipped ahead 7 days");
                          }}
                        >
                          <Clock className="h-4 w-4 mr-1.5" />
                          Skip 7 Days
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="futuristic-card border-primary/30 shadow-lg backdrop-blur-sm bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <HardDrive className="h-5 w-5 mr-2 text-primary/70" />
                        Game Data
                      </CardTitle>
                      <CardDescription>Manage your saved game data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Save Data</p>
                          <p className="text-sm text-muted-foreground">Save & backup your game progress</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast.success("Game saved");
                          }}
                        >
                          <HardDrive className="h-4 w-4 mr-1.5" />
                          Save Game
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Backup Data</p>
                          <p className="text-sm text-muted-foreground">Create a backup of your progress</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowBackupDialog(true)}
                        >
                          <HardDrive className="h-4 w-4 mr-1.5" />
                          Export Backup
                        </Button>
                      </div>
                      
                      {/* Reset game button - with confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            className="w-full mt-4"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1.5" />
                            Reset Game
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will completely reset your game. All progress, assets, wealth, and stats will be lost and cannot be recovered.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                performCompleteGameReset();
                                toast.success("Game reset complete", {
                                  description: "All progress has been reset. The game will restart.",
                                });
                                
                                // Force a reload after a brief delay
                                setTimeout(() => {
                                  window.location.reload();
                                }, 1500);
                              }}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              <AlertTriangle className="h-4 w-4 mr-1.5" />
                              Reset Everything
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Export Backup Dialog */}
      <AlertDialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Game Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Copy the text below to save your game progress. You can import this data later to restore your game.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 p-3 bg-primary/10 border border-primary/20 rounded-md max-h-[200px] overflow-auto font-mono text-xs">
            {JSON.stringify(localStorage)}
          </div>
          
          <Button 
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(localStorage));
              toast.success("Backup copied to clipboard");
            }}
            className="w-full mb-2"
          >
            Copy to Clipboard
          </Button>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}