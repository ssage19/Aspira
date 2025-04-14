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
  
  // Convert to strings truncated to 1 decimal place to address floating-point precision issues
  const characterWealthFixed = parseFloat(character.wealth.toFixed(1));
  const trackerCashFixed = parseFloat(assetTracker.totalCash.toFixed(1));
  
  console.log(`📊 ASSET SNAPSHOT [${label}]:`, {
    characterWealth: characterWealthFixed,
    assetTrackerNetWorth: assetTracker.totalNetWorth,
    assetTrackerCash: trackerCashFixed,
    assetTrackerStocks: assetTracker.totalStocks,
    assetsMatch: Math.abs(characterWealthFixed - trackerCashFixed) < 1.0
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
    console.log(`STEP 1: Syncing character with asset tracker ${marketOpen ? '(with price updates)' : '(MARKET CLOSED - only crypto price updates)'}`);
    
    // Even if market is closed, we still want to sync crypto prices (crypto trades 24/7)
    // Only stock prices should respect market hours
    characterState.syncAssetsWithAssetTracker(marketOpen);
    
    // 2. Second step: Recalculate all totals in the asset tracker
    console.log("STEP 2: Recalculating asset tracker totals");
    assetTrackerState.recalculateTotals();
    
    // 3. Third step: Verify the values match and fix if needed
    console.log("STEP 3: Verifying values match between stores");
    
    // Convert to strings truncated to 1 decimal place to address floating-point precision issues
    const characterWealthFixed = parseFloat(characterState.wealth.toFixed(1));
    const trackerCashFixed = parseFloat(assetTrackerState.totalCash.toFixed(1));
    
    // Use a wider tolerance threshold to prevent excessive syncs
    // But we'll now explicitly force synchronization for exact matches
    if (Math.abs(characterWealthFixed - trackerCashFixed) > 0.1) {
      // There's a mismatch that's beyond rounding error
      console.warn("⚠️ Cash values don't match, forcing synchronization");
      console.log(`Cash mismatch details: Character wealth: ${characterWealthFixed}, Asset tracker cash: ${trackerCashFixed}`);
      
      // IMPORTANT CHANGE: Instead of trying to calculate the difference and adjust,
      // we'll simply set the asset tracker cash to match character wealth exactly
      // This ensures they are always in perfect sync
      useAssetTracker.setState({ 
        cash: characterState.wealth,
        totalCash: characterState.wealth,
        lastUpdated: Date.now()
      });
      
      // Recalculate totals to ensure accurate net worth
      assetTrackerState.recalculateTotals();
      
      // Log the fix
      console.log(`Fixed cash mismatch by syncing asset tracker directly to character wealth: ${characterState.wealth}`);
      
      // Double-check that the fix worked
      const finalTrackerState = useAssetTracker.getState();
      console.log(`Verification: Character wealth: ${characterState.wealth}, Asset tracker cash: ${finalTrackerState.cash}`);
    } else {
      console.log(`✅ Cash values match within tolerance (Character: ${characterWealthFixed}, Tracker: ${trackerCashFixed})`);
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