/**
 * Simplified Dashboard Component
 * 
 * This is a more optimized version of the Dashboard component
 * that doesn't cause infinite update loops by using stable state references
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { useAudio } from '../lib/stores/useAudio';
import { useGame } from '../lib/stores/useGame';
import { useRandomEvents } from '../lib/stores/useRandomEvents';
import { useIsMobile } from '../hooks/use-is-mobile';
import { formatCurrency, formatPercentage } from '../lib/utils';
import refreshAllAssets from '../lib/services/assetRefresh';

// Import UI components
import { GameUI } from '../components/GameUI';
import { SimplePortfolioBreakdown } from '../components/SimplePortfolioBreakdown';
import { CharacterAttributes } from '../components/CharacterAttributes';
import { ActiveEventsIndicator } from '../components/ActiveEventsIndicator';
import { AchievementsWidget } from '../components/AchievementsWidget';

// Import UI elements
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogTrigger } from '../components/ui/alert-dialog';

// Import icons
import { Calendar, Settings, DollarSign, Crown, ChartBar, 
  Briefcase, Home, HardDrive, Landmark, Shield, RefreshCw, Download, 
  Upload, Trash2, RotateCcw, HeartPulse } from 'lucide-react';

export default function SimpleDashboard() {
  const navigate = useNavigate();
  
  // Use refs to keep stable state references
  const [characterValues, setCharacterValues] = useState({
    wealth: 0,
    name: "",
    happiness: 0,
    prestige: 0,
    stress: 0,
    energy: 0,
    health: 0
  });
  
  // Get netWorth directly
  const [netWorth, setNetWorth] = useState(0);
  
  // Get date information
  const { currentDay, currentMonth, currentYear } = useTime();
  
  // Simple state variables
  const [activeTab, setActiveTab] = useState('overview');
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  
  // Other game systems
  const { economyState } = useEconomy();
  const audio = useAudio();
  
  // Update character values without causing re-renders
  const updateValues = useCallback(() => {
    // First do a deep refresh of all assets to ensure everything is up to date
    console.log("⚡️ SimpleDashboard: Requesting comprehensive asset refresh");
    refreshAllAssets();
    
    // IMPORTANT: Wait for the refresh to complete before reading values
    setTimeout(() => {
      // Get latest values from stores
      const character = useCharacter.getState();
      const assetTracker = useAssetTracker.getState();
      
      // DEBUG: Log what we're getting from both stores
      console.log("📊 SimpleDashboard - Current values:", {
        characterWealth: character.wealth,
        assetTrackerNetWorth: assetTracker.totalNetWorth,
        assetTrackerCash: assetTracker.totalCash,
        assetTrackerStocks: assetTracker.totalStocks
      });
      
      // Update the component state
      setCharacterValues({
        wealth: character.wealth,
        name: character.name,
        happiness: character.happiness,
        prestige: character.prestige,
        stress: character.stress,
        energy: character.energy,
        health: character.health
      });
      
      setNetWorth(assetTracker.totalNetWorth);
      
      console.log("✅ SimpleDashboard - Values updated with latest data");
    }, 100); // Small delay to ensure refresh completes
  }, []);
  
  // Set up update interval
  useEffect(() => {
    console.log("🚀 SimpleDashboard: Component mounted, setting up refresh cycle");
    
    // MULTI-STAGE REFRESH STRATEGY:
    // 1. Immediate refresh on mount
    updateValues();
    
    // 2. Secondary refresh after a short delay (in case the first one misses anything)
    const initialRefreshTimeout = setTimeout(() => {
      console.log("🔄 SimpleDashboard: Performing secondary refresh");
      updateValues();
    }, 800);
    
    // 3. Regular interval for continuous updates
    const interval = setInterval(() => {
      console.log("🔄 SimpleDashboard: Performing scheduled refresh");
      updateValues();
    }, 2000); // More frequent updates
    
    // 4. Extra refresh whenever the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("👁️ SimpleDashboard: Tab became visible, refreshing data");
        updateValues();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialRefreshTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log("👋 SimpleDashboard: Component unmounting, cleanup complete");
    };
  }, [updateValues]);
  
  // Format the date
  const formattedDate = new Date(currentYear, currentMonth - 1, currentDay)
    .toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  
  // Extract values from state
  const { wealth, name, happiness, prestige, stress, energy, health } = characterValues;
  
  return (
    <div className="w-full min-h-screen pt-2 pb-24">
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
                                  setShowBackupDialog(true);
                                }}>
                                  Create Backup
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      {/* Refresh Game Data */}
                      <div className="mt-6 pt-6 border-t border-primary/10">
                        <Button 
                          variant="secondary" 
                          className="w-full" 
                          onClick={() => {
                            // Force refresh of all game data
                            refreshAllAssets();
                            updateValues();
                          }}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Game Data
                        </Button>
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