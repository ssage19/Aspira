/**
 * Asset Refresh Service (Enhanced)
 * 
 * This service provides a centralized way to refresh asset values
 * throughout the application. It helps avoid circular dependencies
 * and prevents infinite render loops in React components.
 * 
 * The enhanced version includes:
 * - Better error handling
 * - Detailed logging
 * - Multi-stage refresh for reliability
 * - Update verification
 * - Market hour awareness (stock prices only update during market hours)
 */

import useAssetTracker from '../stores/useAssetTracker';
import { useCharacter } from '../stores/useCharacter';
import { useTime } from '../stores/useTime';

// Track the last refresh time to prevent spamming
let lastRefreshTime = 0;
let refreshInProgress = false;

// Check if market is open (weekday during trading hours)
const isMarketOpen = () => {
  // Use the globally exported function if available
  if ((window as any).isMarketOpen) {
    return (window as any).isMarketOpen();
  }
  
  // Fallback implementation if global function isn't available
  // Check if it's a weekday
  const timeState = useTime.getState();
  const gameDate = new Date();
  gameDate.setFullYear(timeState.currentYear);
  gameDate.setMonth(timeState.currentMonth - 1);
  gameDate.setDate(timeState.currentDay);
  
  // Check if it's a weekday
  const dayOfWeek = gameDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (isWeekend) return false;
  
  // Check trading hours (9 AM to 4 PM)
  const hoursFraction = (timeState.timeProgress / 100) * 24;
  const currentHour = Math.floor(hoursFraction);
  return currentHour >= 9 && currentHour < 16;
};

// Utility to log asset values for debugging
const logAssetSnapshots = (label: string) => {
  const character = useCharacter.getState();
  const assetTracker = useAssetTracker.getState();
  
  // Round values to 2 decimal places for consistency
  const roundedCharacterWealth = Math.round(character.wealth * 100) / 100;
  const roundedTrackerCash = Math.round(assetTracker.totalCash * 100) / 100;
  
  console.log(`📊 ASSET SNAPSHOT [${label}]:`, {
    characterWealth: roundedCharacterWealth,
    assetTrackerNetWorth: assetTracker.totalNetWorth,
    assetTrackerCash: roundedTrackerCash,
    assetTrackerStocks: assetTracker.totalStocks,
    assetsMatch: Math.abs(roundedCharacterWealth - roundedTrackerCash) < 0.1
  });
};

// Global function that can be called from anywhere without React hooks
export const refreshAllAssets = () => {
  const now = Date.now();
  
  // Throttle refreshes to prevent performance issues
  if (now - lastRefreshTime < 500 && !window.location.pathname.includes('dashboard')) {
    console.log("⏱️ Asset refresh throttled - skipping (refresh interval < 500ms)");
    return {
      success: true,
      message: 'Asset refresh skipped (throttled)',
      throttled: true
    };
  }
  
  // Prevent concurrent refreshes
  if (refreshInProgress) {
    console.log("⚠️ Asset refresh already in progress - skipping");
    return {
      success: true,
      message: 'Asset refresh skipped (already in progress)',
      skipped: true
    };
  }
  
  try {
    refreshInProgress = true;
    console.log("=== BEGINNING COMPREHENSIVE ASSET REFRESH ===");
    lastRefreshTime = now;
    
    // Check if market is open for stock price updates
    const marketOpen = isMarketOpen();
    console.log(`MARKET STATUS: ${marketOpen ? 'OPEN' : 'CLOSED'} during asset refresh`);
    
    // Take before snapshots for debugging
    logAssetSnapshots("BEFORE REFRESH");
    
    // Get the store states directly instead of through hooks
    const characterState = useCharacter.getState();
    const assetTrackerState = useAssetTracker.getState();
    
    // 1. First step: Sync character assets with asset tracker
    console.log(`STEP 1: Syncing character with asset tracker ${marketOpen ? '(with price updates)' : '(MARKET CLOSED - no price updates)'}`);
    
    // If the market is closed, indicate that stock prices should not update
    characterState.syncAssetsWithAssetTracker(marketOpen);
    
    // 2. Second step: Recalculate all totals in the asset tracker
    console.log("STEP 2: Recalculating asset tracker totals");
    assetTrackerState.recalculateTotals();
    
    // 3. Third step: Verify the values match and fix if needed
    console.log("STEP 3: Verifying values match between stores");
    
    // Round values to 2 decimal places to address floating-point precision issues
    const roundedCharacterWealth = Math.round(characterState.wealth * 100) / 100;
    const roundedTrackerCash = Math.round(assetTrackerState.totalCash * 100) / 100;
    
    // Use a wider tolerance threshold (0.1) to catch cases where floating point precision might cause tiny differences
    if (Math.abs(roundedCharacterWealth - roundedTrackerCash) > 0.1) {
      console.warn("⚠️ Cash values don't match, forcing additional sync");
      console.log(`Cash mismatch details: Character wealth: ${roundedCharacterWealth}, Asset tracker cash: ${roundedTrackerCash}`);
      
      // Use the rounded values for the difference calculation to avoid propagating floating-point errors
      const difference = roundedTrackerCash - roundedCharacterWealth;
      
      if (difference > 0) {
        // Add money if asset tracker has more
        characterState.addWealth(difference);
        console.log(`Fixed cash mismatch by adding ${difference}`);
      } else {
        // Remove money if asset tracker has less
        characterState.deductWealth(Math.abs(difference));
        console.log(`Fixed cash mismatch by deducting ${Math.abs(difference)}`);
      }
      // One more re-calculation for safety
      assetTrackerState.recalculateTotals();
    } else {
      console.log(`✅ Cash values match within tolerance (Character: ${roundedCharacterWealth}, Tracker: ${roundedTrackerCash})`);
    }
    
    // Take after snapshots for debugging
    logAssetSnapshots("AFTER REFRESH");
    
    // Log completion
    console.log('=== COMPREHENSIVE ASSET REFRESH COMPLETE ===');
    
    return {
      success: true,
      message: 'Asset values refreshed successfully',
      netWorth: assetTrackerState.totalNetWorth,
      cash: characterState.wealth
    };
  } catch (error) {
    console.error('❌ ERROR IN ASSET REFRESH:', error);
    return {
      success: false,
      message: 'Failed to refresh asset values',
      error
    };
  } finally {
    refreshInProgress = false;
  }
};

// Register the function globally for easy access
if (typeof window !== 'undefined') {
  (window as any).globalUpdateAllPrices = refreshAllAssets;
}

export default refreshAllAssets;