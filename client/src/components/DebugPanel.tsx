import React from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import { useGame } from '../lib/stores/useGame';

export function DebugPanel() {
  const { name, wealth, netWorth, assets, properties, lifestyleItems } = useCharacter();
  const { currentDay, currentMonth, currentYear } = useTime();
  const { marketTrend, economyState } = useEconomy();
  const { phase } = useGame();
  
  return (
    <div className="fixed bottom-20 right-0 bg-white bg-opacity-90 border p-4 rounded-l shadow-lg z-50 max-w-xs overflow-auto max-h-48">
      <h3 className="font-bold text-sm mb-2">Debug Info</h3>
      <div className="text-xs space-y-1">
        <p><span className="font-semibold">Game Phase:</span> {phase}</p>
        <p><span className="font-semibold">Character:</span> {name || 'Not set'}</p>
        <p><span className="font-semibold">Wealth:</span> ${wealth.toLocaleString()}</p>
        <p><span className="font-semibold">Date:</span> {currentMonth}/{currentDay}/{currentYear}</p>
        <p><span className="font-semibold">Market:</span> {marketTrend}, {economyState}</p>
        <p><span className="font-semibold">Assets:</span> {assets.length}</p>
        <p><span className="font-semibold">Properties:</span> {properties.length}</p>
        <p><span className="font-semibold">Lifestyle:</span> {lifestyleItems.length}</p>
      </div>
    </div>
  );
}

export default DebugPanel;