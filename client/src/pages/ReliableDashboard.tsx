/**
 * Reliable Dashboard Component
 * 
 * A completely rebuilt dashboard component that uses direct store access
 * and explicit refresh triggers to ensure values are always up-to-date.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import refreshAllAssets from '../lib/services/assetRefresh';
import { useAssetRefresh } from '../components/AssetRefreshProvider';
import { useResponsive } from '../lib/hooks/useResponsive';

// Import UI components
import { GameUI } from '../components/GameUI';
import { SimplePortfolioBreakdown } from '../components/SimplePortfolioBreakdown';
import { CharacterAttributes } from '../components/CharacterAttributes';
import { ActiveEventsIndicator } from '../components/ActiveEventsIndicator';
import { UpcomingEventsWidget } from '../components/UpcomingEventsWidget';
import { ThemeControls } from '../components/ThemeControls';
import { MonthlyFinancesWidget } from '../components/MonthlyFinancesWidget';

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
  Upload, Trash2, RotateCcw, HeartPulse, Target, Palette, Trophy, Star, Users } from 'lucide-react';

// Import data stores directly (for direct access)
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { formatCurrency, formatPercentage, performCompleteGameReset } from '../lib/utils';

export default function ReliableDashboard() {
  const navigate = useNavigate();
  
  // Get global asset refresh functionality
  const { triggerRefresh } = useAssetRefresh();
  
  // ------------------- LOCAL STATE -----------------
  // State for UI refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard values
  const [stats, setStats] = useState({
    wealth: 0,
    name: "",
    netWorth: 0,
    happiness: 0,
    prestige: 0, 
    energy: 0,
    health: 0,
    stress: 0,
    stockValue: 0,
    propertyValue: 0,
    lifestyleValue: 0
  });
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // ------------------- DATA REFRESH LOGIC -----------------
  
  // Lightweight function to refresh dashboard data without triggering excessive refreshes
  const refreshDashboardData = useCallback(async () => {
    // Skip if we're already loading data
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Get data directly from stores instead of triggering additional refreshes
      const character = useCharacter.getState();
      const assetTracker = useAssetTracker.getState();
      
      // Update local state with fresh data
      setStats({
        wealth: character.wealth,
        name: character.name,
        netWorth: assetTracker.totalNetWorth,
        happiness: character.happiness,
        prestige: character.prestige,
        energy: character.energy,
        health: character.health,
        stress: character.stress,
        stockValue: assetTracker.totalStocks,
        propertyValue: assetTracker.totalPropertyValue,
        lifestyleValue: assetTracker.totalLifestyleValue
      });
    } catch (error) {
      console.error("Error updating dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);
  
  // Simplified refresh strategy to avoid freezing
  useEffect(() => {
    console.log("🚀 RELIABLE DASHBOARD: Component mounted");
    
    // Force sync between character and asset tracker on dashboard load
    // This is critical when returning from the investments screen
    useCharacter.getState().syncAssetsWithAssetTracker();
    useAssetTracker.getState().recalculateTotals();
    
    // Force market price update on component mount
    if ((window as any).globalUpdateAllPrices) {
      console.log("ReliableDashboard: Triggering global price update on mount");
      (window as any).globalUpdateAllPrices();
    }
    
    // One-time initial data load with a small delay to ensure state is ready
    const initialTimeout = setTimeout(() => {
      // Force another sync before loading data
      useCharacter.getState().syncAssetsWithAssetTracker();
      useAssetTracker.getState().recalculateTotals();
      
      // Update dashboard with fresh data
      refreshDashboardData();
    }, 100);
    
    // Reduced frequency interval to prevent performance issues
    const refreshInterval = setInterval(() => {
      // First trigger market price updates to keep investment values fresh
      if ((window as any).globalUpdateAllPrices) {
        (window as any).globalUpdateAllPrices();
      }
      
      // Then sync data before each refresh
      useCharacter.getState().syncAssetsWithAssetTracker();
      useAssetTracker.getState().recalculateTotals();
      
      // Finally update the UI
      refreshDashboardData();
    }, 5000); // Reduced to every 5 seconds to prevent freezing
    
    return () => {
      clearInterval(refreshInterval);
      clearTimeout(initialTimeout);
      console.log("👋 RELIABLE DASHBOARD: Component unmounting");
    };
  }, [refreshDashboardData]);
  
  // Enhanced manual refresh - performs a thorough refresh of all data
  const handleManualRefresh = async () => {
    toast.info("Performing deep data refresh...");
    
    try {
      // First trigger a market price update to get fresh investment prices
      if ((window as any).globalUpdateAllPrices) {
        console.log("ReliableDashboard: Triggering global price update");
        (window as any).globalUpdateAllPrices();
      }
      
      // Wait a short moment for price updates to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Sync character assets with asset tracker
      useCharacter.getState().syncAssetsWithAssetTracker();
      
      // Force asset tracker to recalculate totals
      useAssetTracker.getState().recalculateTotals();
      
      // Perform global refresh via the asset refresh provider
      await triggerRefresh();
      
      // Update the dashboard UI with fresh data
      refreshDashboardData();
      
      // Increment refresh trigger to force child components to refresh
      setRefreshTrigger(prev => prev + 1);
      
      toast.success("Dashboard refreshed with latest market data");
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast.error("Refresh failed. Please try again.");
    }
  };
  
  // ------------------- DATE FORMATTING -----------------
  // Get current date
  const { currentDay, currentMonth, currentYear } = useTime();
  
  // Format the date
  const formattedDate = new Date(currentYear, currentMonth - 1, currentDay)
    .toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  
  // Get economy state
  const { economyState } = useEconomy();
  
  // Use the responsive hooks
  const { isMobile } = useResponsive();

  // ------------------- UI RENDERING -----------------
  return (
    <div className="w-full min-h-screen pt-2 pb-24 md:pb-12">
      {/* Dashboard UI - outside of normal flow */}
      <GameUI />
        
      {/* Central Dashboard - scrollable */}
      <div className="relative z-10 w-full max-w-5xl mx-auto p-3 md:p-6 mt-14">
        <Card className="backdrop-blur-md border-primary/20 bg-background/30 card-hover shadow-lg rounded-xl overflow-hidden">
          {/* Soft glow elements using our new theme colors */}
          <div className="absolute -bottom-2 -right-2 h-32 w-32 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="absolute -top-2 -left-2 h-24 w-24 bg-secondary/20 blur-3xl rounded-full"></div>
          
          <CardHeader className="pb-2 border-b border-primary/10">
            <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center font-bold gap-2">
              <span className="gradient-text text-2xl md:text-3xl">Welcome, {stats.name}</span>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 text-xs"
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                  {isMobile ? '' : 'Refresh Data'}
                </Button>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-background/50 backdrop-blur-md border border-primary/20">
                    <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      {isMobile ? 'Main' : 'Overview'}
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-sm flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Settings className="h-3.5 w-3.5 md:mr-1" />
                      {isMobile ? '' : 'Settings'}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardTitle>
            <CardDescription className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <div className="flex items-center whitespace-nowrap">
                <Calendar className="h-4 w-4 text-primary mr-1" />
                <span>{formattedDate}</span>
              </div>
              <span className="hidden md:inline px-2 text-primary/60">•</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                economyState === 'boom' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 
                economyState === 'recession' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                'bg-blue-500/20 text-blue-500 border border-blue-500/30'
              }`}>
                {economyState.charAt(0).toUpperCase() + economyState.slice(1)} Economy
              </span>
              <span className="hidden md:inline px-2 text-primary/60">•</span>
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
                          <span className="font-semibold text-lg">{formatCurrency(stats.wealth)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Net Worth:</span>
                          <span className="font-semibold text-lg">{formatCurrency(stats.netWorth)}</span>
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
                            <span className="text-sm font-medium bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full border border-pink-500/20">{stats.happiness}%</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded backdrop-blur-sm bg-secondary/20 border border-primary/10">
                              <div style={{ width: `${stats.happiness}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-400 to-pink-600 rounded"></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm flex items-center text-muted-foreground">
                              <Crown className="h-4 w-4 mr-2 text-amber-400" />
                              Prestige
                            </span>
                            <span className="text-sm font-medium bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">{stats.prestige} points</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded backdrop-blur-sm bg-secondary/20 border border-primary/10">
                              <div style={{ width: `${Math.min(stats.prestige, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-amber-400 to-amber-600 rounded"></div>
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
                  <SimplePortfolioBreakdown key={`portfolio-${refreshTrigger}`} />
                </Card>

                {/* Financial Widgets */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {/* Monthly Finances Widget - with improved dark mode support */}
                  <MonthlyFinancesWidget />
                </div>
                
                {/* Events Widget */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {/* Upcoming Events Widget */}
                  <UpcomingEventsWidget />
                </div>
                
                {/* Quick Action Buttons - responsive grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 lg:gap-6">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-primary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/job')}
                  >
                    <Briefcase className="h-5 w-5 mb-1 md:mb-2 text-primary" />
                    <span className="text-xs md:text-sm">Career</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-secondary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/investments')}
                  >
                    <ChartBar className="h-5 w-5 mb-1 md:mb-2 text-secondary" />
                    <span className="text-xs md:text-sm">Investments</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-tertiary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/properties')}
                  >
                    <Home className="h-5 w-5 mb-1 md:mb-2 text-tertiary" />
                    <span className="text-xs md:text-sm">Properties</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-quaternary/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/lifestyle')}
                  >
                    <Crown className="h-5 w-5 mb-1 md:mb-2" />
                    <span className="text-xs md:text-sm">Lifestyle</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-blue-500/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/challenges')}
                  >
                    <Target className="h-5 w-5 mb-1 md:mb-2 text-blue-500" />
                    <span className="text-xs md:text-sm">Challenges</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-yellow-500/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/achievements')}
                  >
                    <Trophy className="h-5 w-5 mb-1 md:mb-2 text-yellow-500" />
                    <span className="text-xs md:text-sm">Achievements</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-purple-500/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/prestige')}
                  >
                    <Star className="h-5 w-5 mb-1 md:mb-2 text-purple-500" />
                    <span className="text-xs md:text-sm">Prestige</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-green-500/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/business')}
                  >
                    <Briefcase className="h-5 w-5 mb-1 md:mb-2 text-green-500" />
                    <span className="text-xs md:text-sm">Business</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-16 md:h-20 futuristic-card card-hover border border-cyan-500/30 flex flex-col items-center justify-center bg-background/30 backdrop-blur-sm"
                    onClick={() => navigate('/networking')}
                  >
                    <Users className="h-5 w-5 mb-1 md:mb-2 text-cyan-500" />
                    <span className="text-xs md:text-sm">Networking</span>
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
                          {/* Refresh Game Data */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Game Data
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Refresh Game Data</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will force a full refresh of all game data, ensuring everything is up-to-date.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleManualRefresh}>
                                  Refresh
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          {/* Reset Game */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Reset Game Data
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
                                  // Call the game reset function from utils
                                  performCompleteGameReset();
                                  
                                  // Display success toast
                                  toast.success("Game data has been reset. Redirecting...");
                                }} className="bg-red-500 hover:bg-red-600">
                                  Reset Game
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      {/* Appearance Section */}
                      <div className="space-y-4 mt-6 pt-6 border-t border-primary/10">
                        <h3 className="text-lg font-medium flex items-center">
                          <Palette className="mr-2 h-5 w-5 text-primary" />
                          Appearance
                        </h3>
                        <div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Customize the look and feel of your game interface with different color themes.
                          </p>
                          <ThemeControls className="w-full" />
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