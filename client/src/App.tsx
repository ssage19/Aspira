import { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import { useEconomy } from "./lib/stores/useEconomy";
import { ThemeProvider } from "./lib/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import CharacterCreation from "./pages/CharacterCreation";
import InvestmentScreen from "./pages/InvestmentScreen";
import LifestyleScreen from "./pages/LifestyleScreen";
import PropertyScreen from "./pages/PropertyScreen";
import AchievementsScreen from "./pages/AchievementsScreen";
import JobScreen from "./pages/JobScreen";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/not-found";
import { RandomEventModal } from "./components/RandomEventModal";
import { EventDebugger } from "./components/EventDebugger";
import { ActiveEventsIndicator } from "./components/ActiveEventsIndicator";
import AchievementNotification from "./components/AchievementNotification";

import { AppBackground } from "./components/AppBackground";
import { GlobalAutoMaintenance } from "./components/GlobalAutoMaintenance";
import { useRandomEvents } from "./lib/stores/useRandomEvents";
import { initializeHealthMonitor, checkHealthStatus } from "./lib/services/healthMonitor";
import TimeResetHack from "./TimeResetHack";

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
        
        // If the stored date is different by more than 3 days from the real date, force reset
        if (diffDays > 3) {
          console.warn(`Date difference of ${diffDays} days detected - forcing reset to real-world date`);
          
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
              dayCounter: 0
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
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
            {/* Background with gradient based on theme */}
            <AppBackground />
            
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CharacterCreation />} />
              <Route path="/job" element={<JobScreen />} />
              <Route path="/investments" element={<InvestmentScreen />} />
              <Route path="/lifestyle" element={<LifestyleScreen />} />
              <Route path="/properties" element={<PropertyScreen />} />
              <Route path="/achievements" element={<AchievementsScreen />} />
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
            
            {/* Emergency hack to reset time if needed */}
            <TimeResetHack />
          </Suspense>
        </Router>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
