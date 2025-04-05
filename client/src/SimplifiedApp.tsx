import React, { useState, useEffect } from 'react';
import { isEmergencyMode, setEmergencyMode } from './lib/utils';

/**
 * A simplified version of our app that can be used for debugging
 * This component contains only the minimal functionality needed
 * to test and reset the emergency mode
 */
export default function SimplifiedApp() {
  const [isEmergency, setIsEmergency] = useState(isEmergencyMode());

  const toggleEmergencyMode = () => {
    const newMode = !isEmergency;
    setEmergencyMode(newMode);
    setIsEmergency(newMode);
  };

  const resetAllGameData = () => {
    try {
      // Clear all localStorage data that starts with business-empire
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('business-empire') || key === 'emergency-mode')) {
          console.log('Removing', key);
          localStorage.removeItem(key);
          i--; // Adjust index since we're removing items
        }
      }
      
      // Additional specific keys to remove
      const keysToRemove = [
        'business-empire-game',
        'business-empire-character',
        'business-empire-time',
        'business-empire-economy',
        'business-empire-audio',
        'business-empire-achievements',
        'emergency-mode'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('All game data cleared successfully.');
      
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error resetting game data:', error);
      alert('Error resetting game data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Business Empire Game</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Game Mode</h2>
            <p className="mb-4">
              Current Mode: {isEmergency ? 'Emergency Mode' : 'Normal Mode'}
            </p>
            <button
              onClick={toggleEmergencyMode}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Toggle Emergency Mode
            </button>
          </div>

          <div className="p-4 bg-destructive/20 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Reset Game</h2>
            <p className="mb-4">
              This will clear all game data and start fresh.
            </p>
            <button
              onClick={resetAllGameData}
              className="w-full py-2 px-4 bg-destructive text-white rounded-md hover:bg-destructive/90 transition-colors"
            >
              Reset All Game Data
            </button>
          </div>

          <div className="p-4 bg-secondary/20 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Return to Game</h2>
            <p className="mb-4">
              Go back to the main game after making changes.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}