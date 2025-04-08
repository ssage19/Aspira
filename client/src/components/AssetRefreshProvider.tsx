/**
 * Asset Refresh Provider
 * 
 * This component provides a solution for refreshing asset values between
 * different parts of the application. It creates an interval that
 * synchronizes values between the character state and asset tracker.
 */

import React, { useEffect } from 'react';
import refreshAllAssets from '../lib/services/assetRefresh';

interface AssetRefreshProviderProps {
  children: React.ReactNode;
  refreshInterval?: number; // in ms
}

export const AssetRefreshProvider: React.FC<AssetRefreshProviderProps> = ({
  children,
  refreshInterval = 2000, // default to 2 seconds
}) => {
  useEffect(() => {
    console.log("AssetRefreshProvider: Setting up refresh interval");
    
    // Initial refresh
    refreshAllAssets();
    
    // Set up interval
    const intervalId = setInterval(() => {
      refreshAllAssets();
    }, refreshInterval);
    
    // Cleanup interval on unmount
    return () => {
      console.log("AssetRefreshProvider: Cleaning up refresh interval");
      clearInterval(intervalId);
    };
  }, [refreshInterval]);
  
  return <>{children}</>;
};

export default AssetRefreshProvider;