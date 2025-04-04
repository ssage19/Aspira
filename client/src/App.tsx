import { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import Dashboard from "./pages/Dashboard";
import CharacterCreation from "./pages/CharacterCreation";
import InvestmentScreen from "./pages/InvestmentScreen";
import LifestyleScreen from "./pages/LifestyleScreen";
import PropertyScreen from "./pages/PropertyScreen";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/not-found";
import DebugPanel from "./components/DebugPanel";

import "@fontsource/inter";

// Main App component
function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const { phase } = useGame();

  // Load audio assets
  useEffect(() => {
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hit = new Audio('/sounds/hit.mp3');
    setHitSound(hit);

    const success = new Audio('/sounds/success.mp3');
    setSuccessSound(success);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CharacterCreation />} />
            <Route path="/investments" element={<InvestmentScreen />} />
            <Route path="/lifestyle" element={<LifestyleScreen />} />
            <Route path="/properties" element={<PropertyScreen />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DebugPanel />
        </Suspense>
      </Router>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
