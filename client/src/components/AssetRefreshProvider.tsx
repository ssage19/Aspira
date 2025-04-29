/**
 * Asset Refresh Provider (Enhanced)
 * 
 * This component provides a comprehensive solution for refreshing asset values
 * across the entire application. It creates multiple refresh strategies:
 * 
 * 1. Regular interval refreshes for basic synchronization
 * 2. Route change detection for refreshing when navigating between pages
 * 3. Visibility change detection to refresh when the tab becomes active
 * 4. Manual trigger API for components to request refreshes
 * 
 * This ensures that values are always in sync, regardless of how users
 * navigate through the application.
 */

import React, { useEffect, useState, createContext, useContext, useRef, useMemo } from 'react';
import refreshAllAssets from '../lib/services/assetRefresh';
import { useLocation } from 'react-router-dom';

// Create a context for manual refresh triggers
interface AssetRefreshContextType {
  triggerRefresh: () => void;
  lastRefreshTime: number;
  isRefreshing: boolean;
}

// Export the context for use in the separate hook file
export const AssetRefreshContext = createContext<AssetRefreshContextType>({
  triggerRefresh: () => {},
  lastRefreshTime: 0,
  isRefreshing: false
});

interface AssetRefreshProviderProps {
  children: React.ReactNode;
  refreshInterval?: number; // in ms
}

const AssetRefreshProvider: React.FC<AssetRefreshProviderProps> = ({
  children,
  refreshInterval = 5000, // Increased to 5 seconds for better performance
}) => {
  const location = useLocation();
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousPathRef = useRef(location.pathname);
  const refreshTimeoutId = useRef<NodeJS.Timeout | null>(null);
  
  // Adaptive refresh interval based on device performance, battery status, and hardware
  const adaptiveInterval = useMemo(() => {
    // Base assessment - check hardware capability
    const isLowEndDevice = window.navigator.hardwareConcurrency <= 4;
    
    // Initial interval adjustment based on device capability
    let adjustedInterval = isLowEndDevice ? refreshInterval * 2 : refreshInterval;
    
    // Simple mobile detection that works across all browsers
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
      (window.innerWidth <= 768);
    
    // Mobile devices get additional optimization
    if (isMobileDevice) {
      adjustedInterval *= 1.5; // Mobile devices get 50% longer interval
      
      // If battery API is available, check battery status
      if ('getBattery' in navigator) {
        // Attempt to get battery info for more advanced power-saving
        try {
          // @ts-ignore - navigator.getBattery() may not be in TypeScript definitions
          navigator.getBattery().then(battery => {
            // If battery is discharging and below 20%, increase interval more aggressively
            if (battery.dischargingTime !== Infinity && battery.level < 0.2) {
              console.log('🔋 Low battery detected, optimizing refresh intervals');
              adjustedInterval *= 2; // Double the interval on low battery
            }
          }).catch(() => {
            // Silently fail if battery API throws errors
          });
        } catch (e) {
          // Silently fail if battery API isn't supported
        }
      }
    }
    
    // Cap at reasonable limits
    return Math.min(Math.max(adjustedInterval, 2000), 15000); // Between 2s and 15s
  }, [refreshInterval]);
  
  // Skip counter - track how many refreshes we've skipped
  const skipCounter = useRef(0);
  const lastChangeDetected = useRef(false);
  
  // Handle refresh with proper state updates, debouncing, and adaptive behavior
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    // Load balancing: check if we should skip this refresh
    // We skip more often on mobile devices to conserve battery
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
      (window.innerWidth <= 768);
      
    // Mobile devices skip more frequently
    const skipThreshold = isMobileDevice ? 2 : 4;
    
    // If we haven't detected changes recently and we're beyond skip threshold, skip this refresh
    if (!lastChangeDetected.current && skipCounter.current < skipThreshold) {
      skipCounter.current++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏭️ AssetRefreshProvider: Skipping refresh (${skipCounter.current}/${skipThreshold})`);
      }
      return;
    }
    
    // Reset skip counter when we perform a refresh
    skipCounter.current = 0;
    
    try {
      setIsRefreshing(true);
      // Only log on development for performance
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 AssetRefreshProvider: Running refresh (path: ${location.pathname})`);
      }
      
      // Perform the refresh
      const result = await refreshAllAssets();
      
      // Track if changes were detected
      lastChangeDetected.current = result?.changesDetected || false;
      
      // Update state
      setLastRefreshTime(Date.now());
      
      // Only log on development for performance
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ AssetRefreshProvider: Refresh complete`, 
          result?.changesDetected ? 'Changes detected' : 'No changes');
      }
    } catch (error) {
      console.error(`❌ AssetRefreshProvider: Refresh failed`, error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Debounced refresh function to prevent excessive updates
  const debouncedRefresh = () => {
    // Clear any existing timeout
    if (refreshTimeoutId.current) {
      clearTimeout(refreshTimeoutId.current);
    }
    
    // Set a new timeout
    refreshTimeoutId.current = setTimeout(() => {
      handleRefresh();
    }, 200); // Short debounce time
  };
  
  // STRATEGY 1: Regular interval refreshes with adaptive timing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 AssetRefreshProvider: Setting up refresh interval (${adaptiveInterval}ms)`);
    }
    
    // Initial refresh on mount (with slight delay for app stability)
    const initialTimeout = setTimeout(() => {
      handleRefresh();
    }, 500);
    
    // Set up interval for regular refreshes with adaptive interval
    const intervalId = setInterval(() => {
      handleRefresh();
    }, adaptiveInterval);
    
    // Cleanup interval and timeout on unmount
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log("👋 AssetRefreshProvider: Cleaning up refresh interval");
      }
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
      if (refreshTimeoutId.current) {
        clearTimeout(refreshTimeoutId.current);
      }
    };
  }, [adaptiveInterval]);
  
  // STRATEGY 2: Refresh on meaningful route changes only - with job screen protection
  useEffect(() => {
    // Only refresh if the path actually changed (not just query params)
    if (previousPathRef.current !== location.pathname) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📍 AssetRefreshProvider: Route changed to ${location.pathname}`);
      }
      previousPathRef.current = location.pathname;
      
      // IMPORTANT: Don't trigger refresh for career/job screens to avoid infinite loops
      if (!location.pathname.includes('/career') && !location.pathname.includes('/job')) {
        debouncedRefresh();
      } else {
        console.log(`⚠️ AssetRefreshProvider: Skipping refresh for job/career screen to avoid loops`);
      }
    }
  }, [location.pathname]);
  
  // STRATEGY 3: Visibility change detection - optimized for mobile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (process.env.NODE_ENV === 'development') {
          console.log("👁️ AssetRefreshProvider: Tab became visible, refreshing data");
        }
        // Use debounced refresh for stability
        debouncedRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Provide context for manual refreshes (STRATEGY 4)
  const contextValue = useMemo(() => ({
    triggerRefresh: handleRefresh,
    lastRefreshTime,
    isRefreshing
  }), [lastRefreshTime, isRefreshing]);
  
  return (
    <AssetRefreshContext.Provider value={contextValue}>
      {children}
    </AssetRefreshContext.Provider>
  );
};

export default AssetRefreshProvider;