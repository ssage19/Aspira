import { Suspense, useEffect } from "react";
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

import "@fontsource/inter";

// Main App component
function App() {
  const { phase, start } = useGame();
  const { checkForNewEvents } = useRandomEvents();
  const { startTime } = useTime();

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
          </Suspense>
        </Router>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
