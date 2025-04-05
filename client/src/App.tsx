import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import { useGame } from "./lib/stores/useGame";
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
import { ActiveEventsIndicator } from "./components/ActiveEventsIndicator";
import AchievementNotification from "./components/AchievementNotification";
import { useRandomEvents } from "./lib/stores/useRandomEvents";
import { initializeHealthMonitor, checkHealthStatus } from "./lib/services/healthMonitor";
import { useTime } from "./lib/stores/useTime";
import { isEmergencyMode, setEmergencyMode } from "./lib/utils";

import "@fontsource/inter";

// Main App component
function App() {
  const { phase, start } = useGame();
  const { checkForNewEvents } = useRandomEvents();
  const { startTime } = useTime();
  const [emergency, setEmergency] = useState(isEmergencyMode());

  // Initialize game state
  useEffect(() => {
    try {
      // Start the game if it's not already started
      if (phase === "ready") {
        console.log("Starting game...");
        start();
        startTime();
      }
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  }, [phase, start, startTime]);
  
  // Set up timer to check for random events
  useEffect(() => {
    try {
      // Check for new events when the app loads
      if (phase === "playing") {
        checkForNewEvents();
        
        // Set up interval to check for events periodically (every 30 seconds)
        const eventCheckInterval = setInterval(() => {
          try {
            checkForNewEvents();
          } catch (error) {
            console.error("Error checking for events:", error);
          }
        }, 30000); // 30 seconds
        
        return () => clearInterval(eventCheckInterval);
      }
    } catch (error) {
      console.error("Error setting up event checking:", error);
    }
  }, [phase, checkForNewEvents]);

  // Initialize health monitoring system
  useEffect(() => {
    try {
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
    } catch (error) {
      console.error("Error initializing health monitor:", error);
    }
  }, [phase]);

  // Toggle emergency mode
  const toggleEmergencyMode = () => {
    const newMode = !emergency;
    setEmergencyMode(newMode);
    setEmergency(newMode);
    // Force reload to apply changes
    window.location.reload();
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium">Loading...</p>
              </div>
            </div>
          }>
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
            <RandomEventModal />
            <ActiveEventsIndicator />
            <AchievementNotification />
            
            {/* Emergency Mode Indicator */}
            {emergency && (
              <div className="emergency-mode-indicator">
                Emergency Mode Active
              </div>
            )}
            
            {/* Emergency Mode Toggle Button */}
            <button 
              onClick={toggleEmergencyMode}
              className="fixed bottom-4 right-4 bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-xs font-semibold shadow-lg z-50 hover:bg-secondary/90 transition-colors"
            >
              {emergency ? 'Disable' : 'Enable'} Emergency Mode
            </button>
            
            {/* Reset Game Button */}
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all game data? This cannot be undone.')) {
                  // Clear all localStorage data
                  localStorage.removeItem('business-empire-game');
                  localStorage.removeItem('business-empire-character');
                  localStorage.removeItem('business-empire-time');
                  localStorage.removeItem('business-empire-economy');
                  localStorage.removeItem('business-empire-audio');
                  
                  // Keep emergency mode setting
                  window.location.reload();
                }
              }}
              className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-md text-xs font-semibold shadow-lg z-50 hover:bg-destructive/90 transition-colors"
            >
              Reset Game Data
            </button>
          </Suspense>
        </Router>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
