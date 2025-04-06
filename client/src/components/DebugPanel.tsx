import React, { useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import { useGame } from '../lib/stores/useGame';
import { useAchievements } from '../lib/stores/useAchievements';
import useRandomEvents from '../lib/stores/useRandomEvents';
import { performCompleteGameReset } from '../lib/utils';

export function DebugPanel() {
  const { name, wealth, netWorth, assets, properties, lifestyleItems, resetCharacter } = useCharacter();
  const { currentDay, currentMonth, currentYear } = useTime();
  const { marketTrend, economyState } = useEconomy();
  const { phase } = useGame();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const handleReset = () => {
    // Use our centralized reset function that handles everything properly
    performCompleteGameReset();
    
    // Hide confirmation dialog
    setShowResetConfirm(false);
  };
  
  return (
    <div className="fixed bottom-20 right-0 bg-card dark:bg-card border dark:border-zinc-700 p-4 rounded-l shadow-lg z-50 max-w-xs overflow-auto max-h-80">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Debug Info</h3>
      </div>
      <div className="text-xs space-y-1 text-foreground">
        <p><span className="font-semibold">Game Phase:</span> {phase}</p>
        <p><span className="font-semibold">Character:</span> {name || 'Not set'}</p>
        <p><span className="font-semibold">Wealth:</span> ${wealth.toLocaleString()}</p>
        <p><span className="font-semibold">Date:</span> {currentMonth}/{currentDay}/{currentYear}</p>
        <p><span className="font-semibold">Market:</span> {marketTrend}, {economyState}</p>
        <p><span className="font-semibold">Assets:</span> {assets.length}</p>
        <p><span className="font-semibold">Properties:</span> {properties.length}</p>
        <p><span className="font-semibold">Lifestyle:</span> {lifestyleItems.length}</p>
      </div>
      
      <div className="mt-3 pt-2 border-t dark:border-zinc-700">
        {showResetConfirm ? (
          <div>
            <p className="text-xs text-red-600 dark:text-red-400 mb-2">Are you sure? This will delete all progress.</p>
            <div className="flex gap-2">
              <button 
                className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                onClick={handleReset}
              >
                Reset
              </button>
              <button 
                className="text-xs bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded w-full"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset Progress
          </button>
        )}
      </div>
    </div>
  );
}

export default DebugPanel;