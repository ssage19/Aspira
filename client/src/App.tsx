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
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { AppBackground } from "./components/AppBackground";
import { useRandomEvents } from "./lib/stores/useRandomEvents";
import { initializeHealthMonitor, checkHealthStatus } from "./lib/services/healthMonitor";

import "@fontsource/inter";

// Main App component
function App() {
  const { playMusic } = useAudio();
  const { phase, start } = useGame();
  const { checkForNewEvents } = useRandomEvents();

  // Initialize game state
  useEffect(() => {
    // Start the game if it's not already started
    if (phase === "ready") {
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
            
            {/* Theme switcher in top right corner */}
            <div className="fixed top-4 right-4 z-50">
              <ThemeSwitcher />
            </div>
            
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
          </Suspense>
        </Router>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
