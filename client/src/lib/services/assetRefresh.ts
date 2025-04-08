/**
 * Asset Refresh Service
 * 
 * This service provides a centralized way to refresh asset values
 * throughout the application. It helps avoid circular dependencies
 * and prevents infinite render loops in React components.
 */

import useAssetTracker from '../stores/useAssetTracker';
import { useCharacter } from '../stores/useCharacter';

// Global function that can be called from anywhere without React hooks
export const refreshAllAssets = () => {
  try {
    console.log("Global asset refresh triggered");
    
    // Get the store states directly instead of through hooks
    const characterState = useCharacter.getState();
    const assetTrackerState = useAssetTracker.getState();
    
    // First, sync character assets with asset tracker
    characterState.syncAssetsWithAssetTracker();
    
    // Then recalculate all totals in the asset tracker
    assetTrackerState.recalculateTotals();
    
    // Log completion
    console.log('Global asset refresh complete');
    
    return {
      success: true,
      message: 'Asset values refreshed successfully',
      netWorth: assetTrackerState.totalNetWorth,
      cash: characterState.wealth
    };
  } catch (error) {
    console.error('Error in global asset refresh:', error);
    return {
      success: false,
      message: 'Failed to refresh asset values',
      error
    };
  }
};

// Register the function globally for easy access
if (typeof window !== 'undefined') {
  (window as any).globalUpdateAllPrices = refreshAllAssets;
}

export default refreshAllAssets;