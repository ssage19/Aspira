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

const AssetRefreshContext = createContext<AssetRefreshContextType>({
  triggerRefresh: () => {},
  lastRefreshTime: 0,
  isRefreshing: false
});

// Hook for components to request refreshes
export const useAssetRefresh = () => useContext(AssetRefreshContext);

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
  
  // Adaptive refresh interval based on device performance
  const adaptiveInterval = useMemo(() => {
    // Check if we're running on a lower-end device
    const isLowEndDevice = window.navigator.hardwareConcurrency <= 4;
    return isLowEndDevice ? refreshInterval * 2 : refreshInterval;
  }, [refreshInterval]);
  
  // Handle refresh with proper state updates and debouncing
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      // Only log on development for performance
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 AssetRefreshProvider: Running refresh (path: ${location.pathname})`);
      }
      
      // Perform the refresh
      const result = await refreshAllAssets();
      
      // Update state
      setLastRefreshTime(Date.now());
      
      // Only log on development for performance
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ AssetRefreshProvider: Refresh complete`, result);
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
  
  // STRATEGY 2: Refresh on meaningful route changes only
  useEffect(() => {
    // Only refresh if the path actually changed (not just query params)
    if (previousPathRef.current !== location.pathname) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📍 AssetRefreshProvider: Route changed to ${location.pathname}`);
      }
      previousPathRef.current = location.pathname;
      debouncedRefresh();
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