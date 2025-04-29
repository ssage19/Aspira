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
import { getStore } from '../utils/storeRegistry';

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
  try {
    const character = useCharacter.getState();
    const assetTracker = useAssetTracker.getState();
    
    // Safety check before accessing properties
    if (!character || character.wealth === undefined) {
      console.warn(`⚠️ Cannot log asset snapshot [${label}]: Character data is incomplete`);
      return;
    }
    
    if (!assetTracker || assetTracker.totalCash === undefined) {
      console.warn(`⚠️ Cannot log asset snapshot [${label}]: Asset tracker data is incomplete`);
      return;
    }
    
    // Convert to strings truncated to 1 decimal place to address floating-point precision issues
    const characterWealthFixed = parseFloat(character.wealth.toFixed(1));
    const trackerCashFixed = parseFloat(assetTracker.totalCash.toFixed(1));
    
    console.log(`📊 ASSET SNAPSHOT [${label}]:`, {
      characterWealth: characterWealthFixed,
      characterNetWorth: character.netWorth ? parseFloat(character.netWorth.toFixed(1)) : 'unavailable',
      assetTrackerNetWorth: assetTracker.totalNetWorth ? parseFloat(assetTracker.totalNetWorth.toFixed(1)) : 'unavailable',
      assetTrackerCash: trackerCashFixed,
      assetTrackerStocks: assetTracker.totalStocks ?? 0,
      assetsMatch: Math.abs(characterWealthFixed - trackerCashFixed) < 1.0
    });
  } catch (error) {
    console.error(`❌ Error in logAssetSnapshots [${label}]:`, error);
  }
};

// Global function that can be called from anywhere without React hooks
// Helper for device type detection to optimize refresh rates
const getDeviceType = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Detect specific mobile categories for more targeted optimization
  const isHighEndMobile = isMobile && (/(iPhone\s(13|14|15)|iPad\sPro|Pixel\s[6-9])/i.test(userAgent));
  const isLowEndMobile = isMobile && !isHighEndMobile;
  
  // Detect if we're running on a low-end device (fewer CPU cores)
  const isLowEndDevice = window.navigator.hardwareConcurrency <= 2;
  
  if (isLowEndMobile || isLowEndDevice) return 'low-end-mobile';
  if (isHighEndMobile) return 'high-end-mobile';
  if (isMobile) return 'mobile';
  return 'desktop';
};

// Store previous state snapshots to detect changes
let previousValues = {
  characterWealth: 0,
  characterNetWorth: 0,
  trackerCash: 0,
  trackerNetWorth: 0,
  lastChangeTimestamp: 0
};

// Check if any values have changed significantly
const detectChanges = () => {
  try {
    const character = useCharacter.getState();
    const assetTracker = useAssetTracker.getState();
    
    // Safety check
    if (!character || !assetTracker) return false;
    
    // Get current values with 1 decimal place precision
    const currentValues = {
      characterWealth: parseFloat(character.wealth?.toFixed(1) || '0'),
      characterNetWorth: parseFloat(character.netWorth?.toFixed(1) || '0'),
      trackerCash: parseFloat(assetTracker.totalCash?.toFixed(1) || '0'),
      trackerNetWorth: parseFloat(assetTracker.totalNetWorth?.toFixed(1) || '0')
    };
    
    // Check for significant changes (tolerance of 0.1)
    const wealthChanged = Math.abs(currentValues.characterWealth - previousValues.characterWealth) > 0.1;
    const netWorthChanged = Math.abs(currentValues.characterNetWorth - previousValues.characterNetWorth) > 0.1;
    const trackerCashChanged = Math.abs(currentValues.trackerCash - previousValues.trackerCash) > 0.1;
    const trackerNetWorthChanged = Math.abs(currentValues.trackerNetWorth - previousValues.trackerNetWorth) > 0.1;
    
    // Update previous values for next check
    previousValues = {
      ...currentValues,
      lastChangeTimestamp: wealthChanged || netWorthChanged || trackerCashChanged || trackerNetWorthChanged 
        ? Date.now() 
        : previousValues.lastChangeTimestamp
    };
    
    // Return true if any value changed significantly
    return wealthChanged || netWorthChanged || trackerCashChanged || trackerNetWorthChanged;
  } catch (error) {
    console.error('Error in detectChanges:', error);
    return false;
  }
};

export const refreshAllAssets = () => {
  const now = Date.now();
  
  // Adaptive throttling based on device capabilities and current screen
  const isDashboard = window.location.pathname.includes('dashboard');
  const deviceType = getDeviceType();
  
  // Set throttle times based on device type and current screen
  let throttleTime = 2000; // Default (desktop non-dashboard)
  
  if (deviceType === 'low-end-mobile') {
    // Very aggressive throttling for low-end mobile
    throttleTime = isDashboard ? 2000 : 8000;
  } else if (deviceType === 'mobile' || deviceType === 'high-end-mobile') {
    // Strong throttling for all mobile devices
    throttleTime = isDashboard ? 1000 : 5000;
  } else {
    // Standard throttling for desktop
    throttleTime = isDashboard ? 500 : 3000;
  }
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Device type: ${deviceType}, throttle time: ${throttleTime}ms`);
  }
  
  // Throttle refreshes to prevent performance issues
  if (now - lastRefreshTime < throttleTime) {
    // Only log in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ Asset refresh throttled - skipping (refresh interval < ${throttleTime}ms)`);
    }
    return {
      success: true,
      message: 'Asset refresh skipped (throttled)',
      throttled: true,
      changesDetected: false
    };
  }
  
  // Prevent concurrent refreshes
  if (refreshInProgress) {
    // Only log in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ Asset refresh already in progress - skipping");
    }
    return {
      success: true,
      message: 'Asset refresh skipped (already in progress)',
      skipped: true,
      changesDetected: false
    };
  }
  
  // Set the flag first, release it in finally block
  refreshInProgress = true;
  
  // Only log in development to reduce console noise
  if (process.env.NODE_ENV === 'development') {
    console.log("=== BEGINNING COMPREHENSIVE ASSET REFRESH ===");
  }
  lastRefreshTime = now;
  
  try {
    
    // Check if market is open for stock price updates
    const marketOpen = isMarketOpen();
    
    // Only log in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.log(`MARKET STATUS: ${marketOpen ? 'OPEN' : 'CLOSED'} during asset refresh`);
      
      // Take before snapshots for debugging (only in development)
      logAssetSnapshots("BEFORE REFRESH");
    }
    
    // Get the store states directly instead of through hooks
    const characterState = useCharacter.getState();
    const assetTrackerState = useAssetTracker.getState();
    
    // 1. First step: Sync character assets with asset tracker
    if (process.env.NODE_ENV === 'development') {
      console.log(`STEP 1: Syncing character with asset tracker ${marketOpen ? '(with price updates)' : '(MARKET CLOSED - no price updates)'}`);
    }
    
    // If the market is closed, indicate that stock prices should not update
    characterState.syncAssetsWithAssetTracker(marketOpen);
    
    // 2. Second step: Recalculate all totals in the asset tracker
    if (process.env.NODE_ENV === 'development') {
      console.log("STEP 2: Recalculating asset tracker totals");
    }
    assetTrackerState.recalculateTotals();
    
    // 3. Process businesses and update values
    if (process.env.NODE_ENV === 'development') {
      console.log("STEP 3: Processing businesses and other game elements");
    }
    
    // Update businesses
    try {
      const businessStore = getStore('business');
      if (businessStore) {
        if (process.env.NODE_ENV === 'development') {
          console.log("Processing businesses as part of global refresh");
        }
        businessStore.getState().processBusinesses(false); // Don't force update to avoid performance issues
      }
    } catch (businessError) {
      console.error("Error processing businesses during global refresh:", businessError);
    }
    
    // Process social networks if available
    try {
      const socialStore = getStore('socialNetwork');
      if (socialStore && typeof socialStore.getState().processSocialNetworks === 'function') {
        if (process.env.NODE_ENV === 'development') {
          console.log("Processing social networks as part of global refresh");
        }
        socialStore.getState().processSocialNetworks();
      }
    } catch (socialError) {
      console.error("Error processing social networks during global refresh:", socialError);
    }
    
    // Process any other game mechanics that need regular updates
    try {
      const economyStore = getStore('economy');
      if (economyStore && typeof economyStore.getState().updateEconomy === 'function') {
        if (process.env.NODE_ENV === 'development') {
          console.log("Updating economy as part of global refresh");
        }
        economyStore.getState().updateEconomy();
      }
    } catch (economyError) {
      console.error("Error updating economy during global refresh:", economyError);
    }
    
    // 4. Verify values and sync if needed
    if (process.env.NODE_ENV === 'development') {
      console.log("STEP 4: Verifying values between stores");
    }
    
    try {
      // Safety check - ensure we have necessary data
      if (characterState?.wealth === undefined || characterState?.netWorth === undefined) {
        console.warn("⚠️ Character state missing required data");
        console.log("Character state:", characterState);
        return {
          success: false,
          message: "Character state missing required data",
          error: new Error("Character state is incomplete")
        };
      }
      
      if (assetTrackerState?.totalCash === undefined || assetTrackerState?.totalNetWorth === undefined) {
        console.warn("⚠️ Asset tracker state missing required data");
        console.log("Asset tracker state:", assetTrackerState);
        return {
          success: false,
          message: "Asset tracker state missing required data",
          error: new Error("Asset tracker state is incomplete")
        };
      }
      
      // Convert to numbers with 1 decimal place to address floating-point precision issues
      const characterWealthFixed = parseFloat(characterState.wealth.toFixed(1));
      const trackerCashFixed = parseFloat(assetTrackerState.totalCash.toFixed(1));
      const characterNetWorthFixed = parseFloat(characterState.netWorth.toFixed(1));
      const trackerNetWorthFixed = parseFloat(assetTrackerState.totalNetWorth.toFixed(1));
      
      // Use a wider tolerance threshold to prevent excessive syncs
      let mismatchDetected = false;
      
      // Use a more permissive tolerance (1.0 instead of 0.1) to reduce unnecessary syncs
      const TOLERANCE_THRESHOLD = 1.0;
      
      // First check: Cash values
      if (Math.abs(characterWealthFixed - trackerCashFixed) > TOLERANCE_THRESHOLD) {
        // There's a significant mismatch
        if (process.env.NODE_ENV === 'development') {
          console.log(`Cash values don't match, will synchronize (Character: ${characterWealthFixed}, Tracker: ${trackerCashFixed}, diff: ${Math.abs(characterWealthFixed - trackerCashFixed).toFixed(2)})`);
        }
        mismatchDetected = true;
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Cash values match within tolerance (Character: ${characterWealthFixed}, Tracker: ${trackerCashFixed})`);
      }
      
      // Second check: Net worth values
      if (Math.abs(characterNetWorthFixed - trackerNetWorthFixed) > TOLERANCE_THRESHOLD) {
        // There's a significant mismatch
        if (process.env.NODE_ENV === 'development') {
          console.log(`Net worth values don't match (Character: ${characterNetWorthFixed}, Tracker: ${trackerNetWorthFixed}, diff: ${Math.abs(characterNetWorthFixed - trackerNetWorthFixed).toFixed(2)})`);
        }
        mismatchDetected = true;
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Net worth values match within tolerance (Character: ${characterNetWorthFixed}, Tracker: ${trackerNetWorthFixed})`);
      }
      
      // If we detected a mismatch, perform synchronization to ensure consistency
      if (mismatchDetected) {
        if (process.env.NODE_ENV === 'development') {
          console.log("🔄 Performing synchronization between stores");
        }
        
        try {
          // Two-way synchronization to ensure both stores have correct values
          // and to prevent edge cases where one store has bad data

          // STEP 1: First ensure character and asset tracker cash values match
          const characterWealth = characterState.wealth;
          
          // Update asset tracker cash to match character wealth
          useAssetTracker.setState({ 
            cash: characterWealth,
            totalCash: characterWealth,
            lastUpdated: Date.now()
          });
          
          // STEP 2: Recalculate asset tracker totals
          assetTrackerState.recalculateTotals();
          
          // STEP 3: Get the updated asset tracker state after recalculation
          const updatedAssetTracker = useAssetTracker.getState();
          
          // STEP 4: Update character's net worth based on asset tracker calculation
          const updatedNetWorth = updatedAssetTracker.totalNetWorth;
          
          useCharacter.setState({ 
            netWorth: updatedNetWorth
          });
          
          // STEP 5: Final recalculation to ensure consistency
          try {
            // Recalculate asset tracker totals one more time
            if (typeof assetTrackerState.recalculateTotals === 'function') {
              assetTrackerState.recalculateTotals();
            }
            
            // We've already updated the character's net worth directly,
            // so no need to call an update method that doesn't exist
          } catch (recalcError) {
            console.error("Error during final recalculation:", recalcError);
          }
          
          // Log the fixes only in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Fixed cash mismatch: Asset tracker cash now ${updatedAssetTracker.cash}`);
            console.log(`✅ Fixed net worth mismatch: Character net worth now ${updatedNetWorth}`);
          }
          
          // Double-check that the fix worked
          const finalCharacterState = useCharacter.getState();
          const finalTrackerState = useAssetTracker.getState();
          
          // Provide clear verification confirmation only in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log(`Final verification: 
              Character wealth: ${finalCharacterState.wealth}, Asset tracker cash: ${finalTrackerState.cash}
              Character net worth: ${finalCharacterState.netWorth}, Asset tracker net worth: ${finalTrackerState.totalNetWorth}
            `);
          }
          
          // Detect if we still have a mismatch after sync
          const finalWealthDiff = Math.abs(finalCharacterState.wealth - finalTrackerState.cash);
          const finalNetWorthDiff = Math.abs(finalCharacterState.netWorth - finalTrackerState.totalNetWorth);
          
          if (finalWealthDiff > 0.1 || finalNetWorthDiff > 0.1) {
            // Always log warnings for critical issues
            console.warn(`⚠️ Values still don't match after sync! Diffs: Cash=${finalWealthDiff.toFixed(2)}, NetWorth=${finalNetWorthDiff.toFixed(2)}`);
          } else if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Sync successful! Values now match within tolerance`);
          }
        } catch (innerError) {
          console.error("❌ Error during synchronization:", innerError);
        }
      }
    } catch (error) {
      console.error("❌ Error during value verification:", error);
      return {
        success: false,
        message: "Error during value verification",
        error
      };
    }
    
    // Check if any changes were detected during the refresh
    const changesDetected = detectChanges();
    
    // Take after snapshots for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      logAssetSnapshots("AFTER REFRESH");
      console.log(`=== COMPREHENSIVE ASSET REFRESH COMPLETE ${changesDetected ? '(CHANGES DETECTED)' : '(NO CHANGES)'} ===`);
    }
    
    return {
      success: true,
      message: changesDetected ? 'Asset values refreshed with changes' : 'Asset values refreshed successfully (no changes)',
      netWorth: assetTrackerState.totalNetWorth,
      cash: characterState.wealth,
      changesDetected
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