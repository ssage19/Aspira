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

import React, { useEffect, useState, createContext, useContext } from 'react';
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

export const AssetRefreshProvider: React.FC<AssetRefreshProviderProps> = ({
  children,
  refreshInterval = 2000, // default to 2 seconds
}) => {
  const location = useLocation();
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle refresh with proper state updates
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      console.log(`🔄 AssetRefreshProvider: Running refresh (path: ${location.pathname})`);
      
      // Perform the refresh
      const result = await refreshAllAssets();
      
      // Update state
      setLastRefreshTime(Date.now());
      console.log(`✅ AssetRefreshProvider: Refresh complete`, result);
    } catch (error) {
      console.error(`❌ AssetRefreshProvider: Refresh failed`, error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // STRATEGY 1: Regular interval refreshes
  useEffect(() => {
    console.log("🚀 AssetRefreshProvider: Setting up refresh interval");
    
    // Initial refresh on mount
    handleRefresh();
    
    // Set up interval for regular refreshes
    const intervalId = setInterval(() => {
      handleRefresh();
    }, refreshInterval);
    
    // Cleanup interval on unmount
    return () => {
      console.log("👋 AssetRefreshProvider: Cleaning up refresh interval");
      clearInterval(intervalId);
    };
  }, [refreshInterval]);
  
  // STRATEGY 2: Refresh on route changes
  useEffect(() => {
    console.log(`📍 AssetRefreshProvider: Route changed to ${location.pathname}`);
    handleRefresh();
  }, [location.pathname]);
  
  // STRATEGY 3: Visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("👁️ AssetRefreshProvider: Tab became visible, refreshing data");
        handleRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Provide context for manual refreshes (STRATEGY 4)
  const contextValue = {
    triggerRefresh: handleRefresh,
    lastRefreshTime,
    isRefreshing
  };
  
  return (
    <AssetRefreshContext.Provider value={contextValue}>
      {children}
    </AssetRefreshContext.Provider>
  );
};

export default AssetRefreshProvider;