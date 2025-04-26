import React, { useEffect, useState } from 'react';
import { isLowPerformanceDevice } from '../lib/utils/deviceUtils';
import { OptimizedMarketPriceUpdater } from './OptimizedMarketPriceUpdater';
import { MarketPriceUpdater } from './MarketPriceUpdater';
import { PerformanceOptimizer } from './PerformanceOptimizer';

/**
 * This wrapper component decides whether to use the standard or optimized
 * market price updater based on device capabilities and user preferences
 */
export const MarketPriceUpdaterWrapper: React.FC = () => {
  const [useOptimized, setUseOptimized] = useState<boolean | null>(null);
  
  // Determine whether to use the optimized version
  useEffect(() => {
    // Check if device is likely a mobile or low-performance device
    const shouldUseOptimized = isLowPerformanceDevice();
    
    // Check user preference from localStorage
    const userPreference = localStorage.getItem('use_optimized_market_updater');
    
    if (userPreference === 'true') {
      setUseOptimized(true);
    } else if (userPreference === 'false') {
      setUseOptimized(false);
    } else {
      // No explicit preference set, use device detection
      setUseOptimized(shouldUseOptimized);
      
      // Save the auto-detection result
      localStorage.setItem('use_optimized_market_updater', String(shouldUseOptimized));
    }
  }, []);
  
  // Wait until we've determined which version to use
  if (useOptimized === null) {
    return null;
  }
  
  return (
    <>
      {useOptimized ? (
        <>
          <OptimizedMarketPriceUpdater />
          <PerformanceOptimizer />
        </>
      ) : (
        <MarketPriceUpdater />
      )}
    </>
  );
};