import { Suspense, useEffect, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import { useEconomy } from "./lib/stores/useEconomy";
import { useTime } from "./lib/stores/useTime";
import { ThemeProvider } from "./lib/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import SimpleDashboard from "./pages/SimpleDashboard";
import ReliableDashboard from "./pages/ReliableDashboard";
import CharacterCreation from "./pages/CharacterCreation";
import InvestmentScreen from "./pages/InvestmentScreen";
import LifestyleScreen from "./pages/LifestyleScreen";
import PropertyScreen from "./pages/PropertyScreen";
import AchievementsScreen from "./pages/AchievementsScreen";
import JobScreen from "./pages/JobScreen";
import ChallengesScreen from "./pages/ChallengesScreen";
import PrestigeScreen from "./pages/PrestigeScreen";
import OwnerScreen from "./pages/OwnerScreen";
import { NetworkingScreen } from "./pages/NetworkingScreen";
import CasinoScreen from "./pages/CasinoScreen";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/not-found";
import { RandomEventModal } from "./components/RandomEventModal";
import { EventDebugger } from "./components/EventDebugger";
import { ActiveEventsIndicator } from "./components/ActiveEventsIndicator";
import AchievementNotification from "./components/AchievementNotification";
import { ChallengeNotificationManager } from "./components/ChallengeNotification";
import { ChallengeTracker } from "./components/ChallengeTracker";
import { NetworkTracker } from "./components/NetworkTracker";
import { ConnectionNotificationManager } from "./components/ConnectionNotification";
import { EventNotificationManager } from "./components/EventNotification";
import { AttributesDecayManager } from "./components/AttributesDecayManager";
import { ScrollToTop } from "./components/ScrollToTop";

import { AppBackground } from "./components/AppBackground";
import { GlobalAutoMaintenance } from "./components/GlobalAutoMaintenance";
import { MarketPriceUpdaterWrapper } from "./components/MarketPriceUpdaterWrapper";
import { useRandomEvents } from "./lib/stores/useRandomEvents";
import { initializeHealthMonitor, checkHealthStatus } from "./lib/services/healthMonitor";
import TimeResetHack from "./TimeResetHack";
import AssetRefreshProvider from "./components/AssetRefreshProvider";

// Lazy-loaded Mobile Navigation component to improve performance
const MobileNavigation = lazy(() => import('./components/MobileNavigation'));

import "@fontsource/inter";

// Main App component
function App() {
  const { playMusic } = useAudio();
  const { phase, start } = useGame();
  const { checkForNewEvents } = useRandomEvents();

  // Check for redirect after reset
  useEffect(() => {
    console.log("App.tsx - Checking for post-reset status");
    
    // Check if we need to redirect after a game reset
    const redirectUrl = sessionStorage.getItem('redirect_after_reset');
    const resetInProgress = sessionStorage.getItem('game_reset_in_progress');
    const smoothNavigation = sessionStorage.getItem('smooth_navigation') === 'true';
    
    // Handle smooth navigation to character creation and/or time reset
    const forceCurrentDate = sessionStorage.getItem('force_current_date') === 'true';
    const blockTimeLoads = sessionStorage.getItem('block_time_loads') === 'true';
    
    if (smoothNavigation || forceCurrentDate || blockTimeLoads) {
      console.log("Smooth navigation or time reset in progress, skipping other checks");
      
      // Clear all navigation flags
      sessionStorage.removeItem('smooth_navigation');
      
      // Force the current date to be used (but don't clear these flags yet)
      // They will be handled by TimeResetHack component
      if (forceCurrentDate || blockTimeLoads) {
        console.log("Force current date active - ensuring we use today's date");
        
        // Let TimeResetHack component handle the actual date setting
        // as it has better access to this functionality
      }
      
      // Check if there's an existing character before redirecting to character creation
      const hasCharacter = localStorage.getItem('business-empire-character');
      
      // Don't redirect to character creation if the user already has a character
      if (hasCharacter) {
        console.log('Character exists, avoiding redirection to character creation');
        // Just clear the navigation flags and continue with normal flow
        sessionStorage.removeItem('smooth_navigation');
        sessionStorage.removeItem('force_current_date');
        sessionStorage.removeItem('block_time_loads');
        return;
      }
      
      // Only redirect to character creation if no character exists
      if (window.location.pathname !== '/create') {
        console.log('No existing character, redirecting to character creation via smooth navigation');
        const timestamp = Date.now(); // Add cache-busting parameter
        window.location.href = `/create?t=${timestamp}`;
        return;
      }
      return;
    }
    
    // Check for time consistency on app start - if localStorage time data is from future, reset
    try {
      const timeData = localStorage.getItem('luxury_lifestyle_time');
      if (timeData) {
        const parsedTime = JSON.parse(timeData);
        const now = new Date();
        
        console.log(`Current real date: ${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`);
        console.log(`Stored game date: ${parsedTime.currentMonth}/${parsedTime.currentDay}/${parsedTime.currentYear}`);
        
        // Check if stored date is from the future (beyond 1 day difference)
        const storedDate = new Date(parsedTime.currentYear, parsedTime.currentMonth - 1, parsedTime.currentDay);
        const diffTime = Math.abs(storedDate.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log(`Date difference in days: ${diffDays}`);
        
        // Only automatically sync time if the date is way off (more than 30 days)
        // Otherwise, we respect user's game time and only reset on explicit user action
        if (diffDays > 30) {
          console.warn(`Major date difference of ${diffDays} days detected - syncing to real-world date`);
          
          try {
            // Create a new time state with the real-world date
            const freshTimeState = {
              currentDay: now.getDate(),
              currentMonth: now.getMonth() + 1,
              currentYear: now.getFullYear(),
              startDay: now.getDate(),
              startMonth: now.getMonth() + 1,
              startYear: now.getFullYear(),
              currentGameDate: now,
              timeSpeed: 'normal',
              timeMultiplier: 1.0,
              autoAdvanceEnabled: true,
              timeProgress: 0,
              lastTickTime: Date.now(),
              pausedTimestamp: 0,
              accumulatedProgress: 0,
              dayCounter: 0,
              _manuallyReset: true,
              _resetTimestamp: Date.now(),
              _source: "App_DateCheck"
            };
            
            // Direct write to localStorage
            localStorage.setItem('luxury_lifestyle_time', JSON.stringify(freshTimeState));
            console.log(`Directly reset time to current real date: ${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`);
            
            // Double-check 
            const afterReset = localStorage.getItem('luxury_lifestyle_time');
            if (afterReset) {
              const parsed = JSON.parse(afterReset);
              console.log(`After reset - localStorage date: ${parsed.currentMonth}/${parsed.currentDay}/${parsed.currentYear}`);
              
              // Mark that time was reset in this session
              sessionStorage.setItem('time_just_reset', 'true');
              sessionStorage.setItem('time_reset_timestamp', Date.now().toString());
              
              // Also regenerate social events after a time reset
              console.log('Regenerating social events after date reset');
              // Import the social network module dynamically to avoid circular dependencies
              import('./lib/stores/useSocialNetwork').then(module => {
                const socialNetwork = module.useSocialNetwork;
                if (socialNetwork && socialNetwork.getState) {
                  // First, check for expired content
                  socialNetwork.getState().checkForExpiredContent?.(false);
                  // Then generate new events
                  socialNetwork.getState().generateNewEvents?.(3);
                  console.log('Social events regenerated after time reset');
                }
              }).catch(e => console.error('Failed to regenerate social events:', e));
              
              // Force a full page reload only if we haven't already reset recently
              // This prevents reload loops
              if (!sessionStorage.getItem('recent_time_reload')) {
                console.log("Forcing reload to ensure all components see correct date");
                // Mark that we've done a recent reload (valid for 5 seconds)
                sessionStorage.setItem('recent_time_reload', Date.now().toString());
                window.location.reload();
                return; // Early return as we're reloading
              } else {
                // Check if the recent reload was more than 5 seconds ago
                const lastReloadTime = parseInt(sessionStorage.getItem('recent_time_reload') || '0');
                const now = Date.now();
                if (now - lastReloadTime > 5000) {
                  // It's been more than 5 seconds, we can reload again if needed
                  console.log("More than 5 seconds since last reload, forcing another reload");
                  sessionStorage.setItem('recent_time_reload', now.toString());
                  window.location.reload();
                  return; // Early return as we're reloading
                } else {
                  console.log("Skipping reload as we've already reloaded recently");
                }
              }
            }
            
            // Also update the store if possible
            try {
              const timeStore = require('./lib/stores/useTime').useTime;
              if (timeStore.getState().setDate) {
                timeStore.getState().setDate(now.getDate(), now.getMonth() + 1, now.getFullYear());
                console.log("Also updated time store state");
              }
            } catch (e) {
              console.error("Error updating time store:", e);
            }
          } catch (e) {
            console.error("Error during direct time reset:", e);
          }
        }
      }
    } catch (e) {
      console.error("Error checking time consistency:", e);
    }
    
    if (redirectUrl) {
      console.log(`Handling post-reset redirect to: ${redirectUrl}`);
      // Clear the redirect flag
      sessionStorage.removeItem('redirect_after_reset');
      sessionStorage.removeItem('game_reset_in_progress');
      // Perform the navigation
      window.location.href = redirectUrl;
    } else if (resetInProgress) {
      // If reset was in progress but we don't have a redirect URL
      // (happens if we're already on the character creation page)
      console.log('Reset in progress detected, but no redirect URL');
      sessionStorage.removeItem('game_reset_in_progress');
      
      // Double-check time reset
      try {
        const timeStore = require('./lib/stores/useTime').useTime;
        console.log("Performing additional time reset for safety");
        if (timeStore.getState().resetTime) {
          timeStore.getState().resetTime();
        }
      } catch (e) {
        console.error("Error during additional time reset:", e);
      }
      
      // If we're not on the character creation page, redirect there
      if (window.location.pathname !== '/create') {
        console.log('Redirecting to character creation');
        window.location.href = '/create';
      } else {
        // Force a reload to ensure fresh state on the character creation page
        console.log('Already on character creation, forcing reload');
        window.location.reload();
      }
    } else {
      console.log("No reset in progress detected");
    }
  }, []);
  
  // Initialize game state
  useEffect(() => {
    // Check if we're on the character creation page
    const isOnCreatePage = window.location.pathname === '/create';
    
    // Start the game if it's not already started and we're not on the character creation page
    if (phase === "ready" && !isOnCreatePage) {
      start();
    }
  }, [phase, start]);
  
  // Process offline time when app loads
  useEffect(() => {
    // Only process offline time on non-character creation pages when game is playing
    const isOnCreatePage = window.location.pathname === '/create';
    
    // CRITICAL FIX: Check if we are on a page where we should redirect to dashboard
    // This helps prevent unwanted redirects to character creation screen
    const shouldBeOnDashboard = () => {
      // If we're on root page or character creation, no redirection needed
      if (window.location.pathname === '/' || window.location.pathname === '/create') {
        return false;
      }
      
      // Check if character exists
      const hasCharacter = localStorage.getItem('business-empire-character');
      
      // If we're not on dashboard but have a character, we should be on dashboard
      return hasCharacter ? true : false;
    };
    
    // CRITICAL FIX: Ensure any navigation flags are cleared
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (sessionStorage.getItem('smooth_navigation') === 'true') {
        console.log("App: Clearing smooth_navigation flag for stable navigation");
        sessionStorage.removeItem('smooth_navigation');
      }
      
      if (sessionStorage.getItem('force_current_date') === 'true') {
        console.log("App: Clearing force_current_date flag for stable time handling");
        sessionStorage.removeItem('force_current_date');
      }
      
      if (sessionStorage.getItem('block_time_loads') === 'true') {
        console.log("App: Clearing block_time_loads flag for stable time handling");
        sessionStorage.removeItem('block_time_loads');
      }
    }
    
    // CRITICAL FIX: Redirect to dashboard if needed
    if (shouldBeOnDashboard()) {
      console.log("App: User has character and should be on dashboard, redirecting...");
      window.location.href = '/';
      return;
    }
    
    if (phase === "playing" && !isOnCreatePage) {
      console.log("Processing offline time since last session...");
      
      try {
        // Process offline time that passed since the last time the app was open
        useTime.getState().processOfflineTime();
      } catch (error) {
        console.error("Error processing offline time:", error);
      }
    }
  }, [phase]);
  
  // Set up timer to check for random events
  useEffect(() => {
    // Check for new events when the app loads
    if (phase === "playing") {
      checkForNewEvents();
      
      // Set up interval to check for events periodically (every 30 seconds)
      const eventCheckInterval = setInterval(() => {
        checkForNewEvents();
      }, 30000); // 30 seconds
      
      return () => clearInterval(eventCheckInterval);
    }
  }, [phase, checkForNewEvents]);

  // Initialize health monitoring system
  useEffect(() => {
    if (phase === "playing") {
      // Do an initial health check
      checkHealthStatus();
      
      // Set up health monitoring
      const cleanupHealthMonitor = initializeHealthMonitor();
      
      // Clean up on unmount
      return () => {
        cleanupHealthMonitor();
      };
    }
  }, [phase]);

  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <Router>
          {/* ScrollToTop ensures the window scrolls to the top on navigation */}
          <ScrollToTop />
          
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
            {/* Background with gradient based on theme */}
            <AppBackground />
            
            {/* Asset Refresh Provider - maintains consistent asset values across the app */}
            <AssetRefreshProvider refreshInterval={2000}>
              <Routes>
                {/* Use our new ReliableDashboard for better data consistency */}
                <Route path="/" element={<ReliableDashboard />} />
                <Route path="/classic-dashboard" element={<Dashboard />} />
                <Route path="/simple-dashboard" element={<SimpleDashboard />} />
                <Route path="/create" element={<CharacterCreation />} />
                <Route path="/job" element={<JobScreen />} />
                <Route path="/investments" element={<InvestmentScreen />} />
                <Route path="/lifestyle" element={<LifestyleScreen />} />
                <Route path="/properties" element={<PropertyScreen />} />
                <Route path="/achievements" element={<AchievementsScreen />} />
                <Route path="/challenges" element={<ChallengesScreen />} />
                <Route path="/prestige" element={<PrestigeScreen />} />
                <Route path="/business" element={<OwnerScreen />} />
                <Route path="/networking" element={<NetworkingScreen />} />
                <Route path="/casino" element={<CasinoScreen />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Overlays and notifications */}
              <RandomEventModal />
              <ActiveEventsIndicator />
              <AchievementNotification />
              <EventDebugger />
              
              {/* Global systems */}
              <GlobalAutoMaintenance />
              <MarketPriceUpdaterWrapper />
              <ChallengeTracker />
              <ChallengeNotificationManager />
              <NetworkTracker />
              <ConnectionNotificationManager />
              <EventNotificationManager />
              <AttributesDecayManager />
              
              {/* Emergency hack to reset time if needed */}
              <TimeResetHack />
              
              {/* Mobile navigation - only visible on mobile devices */}
              <Suspense fallback={null}>
                <MobileNavigation />
              </Suspense>
            </AssetRefreshProvider>
          </Suspense>
        </Router>
        <Toaster 
          position="top-right" 
          richColors 
          className="toaster-container"
          toastOptions={{
            style: { 
              marginBottom: '70px' // Add extra space at bottom for mobile nav
            },
            className: "mobile-adjusted-toast"
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
