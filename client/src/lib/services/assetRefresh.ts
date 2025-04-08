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
 */

import useAssetTracker from '../stores/useAssetTracker';
import { useCharacter } from '../stores/useCharacter';

// Track the last refresh time to prevent spamming
let lastRefreshTime = 0;
let refreshInProgress = false;

// Utility to log asset values for debugging
const logAssetSnapshots = (label: string) => {
  const character = useCharacter.getState();
  const assetTracker = useAssetTracker.getState();
  
  console.log(`📊 ASSET SNAPSHOT [${label}]:`, {
    characterWealth: character.wealth,
    assetTrackerNetWorth: assetTracker.totalNetWorth,
    assetTrackerCash: assetTracker.totalCash,
    assetTrackerStocks: assetTracker.totalStocks,
    assetsMatch: Math.abs(character.wealth - assetTracker.totalCash) < 0.01
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
    
    // Take before snapshots for debugging
    logAssetSnapshots("BEFORE REFRESH");
    
    // Get the store states directly instead of through hooks
    const characterState = useCharacter.getState();
    const assetTrackerState = useAssetTracker.getState();
    
    // 1. First step: Sync character assets with asset tracker
    console.log("STEP 1: Syncing character with asset tracker");
    characterState.syncAssetsWithAssetTracker();
    
    // 2. Second step: Recalculate all totals in the asset tracker
    console.log("STEP 2: Recalculating asset tracker totals");
    assetTrackerState.recalculateTotals();
    
    // 3. Third step: Verify the values match and fix if needed
    console.log("STEP 3: Verifying values match between stores");
    if (Math.abs(characterState.wealth - assetTrackerState.totalCash) > 0.01) {
      console.warn("⚠️ Cash values don't match, forcing additional sync");
      // Force alignment of cash values - using setters that definitely exist
      if (typeof characterState.setWealth === 'function') {
        // Use setWealth if it exists
        characterState.setWealth(assetTrackerState.totalCash);
      } else if (typeof characterState.updateCash === 'function') {
        // Use updateCash if it exists and setWealth doesn't
        const difference = assetTrackerState.totalCash - characterState.wealth;
        characterState.updateCash(difference, "sync_correction");
      } else {
        // Log error if neither function exists
        console.error("⚠️ Cannot fix cash mismatch - no suitable update method found");
      }
      // One more re-calculation for safety
      assetTrackerState.recalculateTotals();
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