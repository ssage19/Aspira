import React, { useState, useEffect } from "react";
import { useCharacter } from "./lib/stores/useCharacter";
import { useTime } from "./lib/stores/useTime";
import { ThemeProvider } from "./lib/ThemeProvider";
import { formatCurrency } from "./lib/utils";
import { useGame } from "./lib/stores/useGame";
import "@fontsource/inter";

// Emergency simplified App to prevent crashes
function App() {
  // Basic state
  const { name, wealth, income, expenses, netWorth, happiness, prestige } = useCharacter();
  const { currentDay, currentMonth, currentYear, isRunning, toggleTimeRunning, startTime } = useTime();
  const { phase, start } = useGame();
  const [viewMode, setViewMode] = useState("dashboard");
  
  // Initialize game
  useEffect(() => {
    // Start the game if it's not already started
    if (phase === "ready") {
      console.log("Starting game in emergency mode");
      start();
      startTime();
    }
  }, [phase, start, startTime]);

  // Format the date
  const formattedDate = new Date(currentYear, currentMonth - 1, currentDay)
    .toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

  // Simple dashboard view
  const DashboardView = () => (
    <div className="p-6 glass-effect border rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Finances</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Cash:</span>
              <span className="font-medium">{formatCurrency(wealth)}</span>
            </div>
            <div className="flex justify-between">
              <span>Income:</span>
              <span className="font-medium text-green-500">{formatCurrency(income)}/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Expenses:</span>
              <span className="font-medium text-red-500">{formatCurrency(expenses)}/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Net Worth:</span>
              <span className="font-medium">{formatCurrency(netWorth)}</span>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Happiness:</span>
              <span className="font-medium">{happiness}%</span>
            </div>
            <div className="flex justify-between">
              <span>Prestige:</span>
              <span className="font-medium">{prestige} points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gradient">Business Empire: RichMan</h1>
              <button 
                onClick={() => toggleTimeRunning()}
                className={`px-4 py-2 rounded-md ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isRunning ? 'Pause Game' : 'Resume Game'}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Welcome, {name || 'Entrepreneur'}</h2>
                <p className="text-gray-400">{formattedDate}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{formatCurrency(wealth)}</p>
                <p className="text-sm text-gray-400">
                  Net Worth: {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </header>

          <nav className="mb-6">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              <button 
                onClick={() => setViewMode("dashboard")}
                className={`px-4 py-2 rounded-md ${viewMode === "dashboard" ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setViewMode("investments")}
                className={`px-4 py-2 rounded-md ${viewMode === "investments" ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Investments
              </button>
              <button 
                onClick={() => setViewMode("properties")}
                className={`px-4 py-2 rounded-md ${viewMode === "properties" ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Properties
              </button>
              <button 
                onClick={() => setViewMode("lifestyle")}
                className={`px-4 py-2 rounded-md ${viewMode === "lifestyle" ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Lifestyle
              </button>
            </div>
          </nav>

          <main>
            {viewMode === "dashboard" && <DashboardView />}
            {viewMode === "investments" && (
              <div className="p-6 glass-effect border rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Investments</h2>
                <p>Your investment portfolio will appear here.</p>
              </div>
            )}
            {viewMode === "properties" && (
              <div className="p-6 glass-effect border rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Properties</h2>
                <p>Your properties will appear here.</p>
              </div>
            )}
            {viewMode === "lifestyle" && (
              <div className="p-6 glass-effect border rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Lifestyle</h2>
                <p>Your lifestyle items will appear here.</p>
              </div>
            )}

            <div className="p-6 glass-effect border rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Emergency Mode</h2>
              <p className="mb-4">
                The game is currently running in emergency mode due to stability issues. This is a simplified version of the game that should be more stable.
              </p>
              <p>
                Core functionality is still working: time progression, wealth tracking, and basic information display, but some advanced features are temporarily disabled.
              </p>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
