import React, { useEffect, useState, memo } from 'react';
import { isLowPerformanceDevice } from '../lib/utils/deviceUtils';
import { OptimizedMarketPriceUpdater } from './OptimizedMarketPriceUpdater';
import { MarketPriceUpdater } from './MarketPriceUpdater';
import { PerformanceOptimizer } from './PerformanceOptimizer';

/**
 * This wrapper component decides whether to use the standard or optimized
 * market price updater based on device capabilities and user preferences.
 * Now optimized for mobile and lower-end devices with aggressive optimization.
 */
const MarketPriceUpdaterWrapperComponent: React.FC = () => {
  // Default to true for optimized version to ensure smooth initial experience
  const [useOptimized, setUseOptimized] = useState<boolean>(true);
  
  // Determine whether to use the optimized version
  useEffect(() => {
    // Initialize with optimized version immediately for faster startup
    
    // Check if device is likely a mobile or low-performance device
    const checkDevicePerformance = () => {
      // Always use optimized version on mobile
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobileDevice) {
        console.log("MarketPriceUpdaterWrapper: Mobile device detected, using optimized updater");
        return true;
      }
      
      // Check hardware capabilities
      return isLowPerformanceDevice();
    };
    
    // Check user preference from localStorage
    const userPreference = localStorage.getItem('use_optimized_market_updater');
    
    if (userPreference === 'true') {
      setUseOptimized(true);
    } else if (userPreference === 'false') {
      const shouldUseOptimized = checkDevicePerformance();
      // Only honor 'false' on high-performance devices
      if (shouldUseOptimized) {
        console.log("MarketPriceUpdaterWrapper: Low-performance device detected, overriding user preference");
        localStorage.setItem('use_optimized_market_updater', 'true');
        setUseOptimized(true);
      } else {
        setUseOptimized(false);
      }
    } else {
      // No explicit preference set, use device detection
      const shouldUseOptimized = checkDevicePerformance();
      setUseOptimized(shouldUseOptimized);
      
      // Save the auto-detection result
      localStorage.setItem('use_optimized_market_updater', String(shouldUseOptimized));
    }
  }, []);
  
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

// Memoize the component to prevent unnecessary re-renders
export const MarketPriceUpdaterWrapper = memo(MarketPriceUpdaterWrapperComponent);