import React, { useEffect, useState } from 'react';
import { isMobileDevice, isLowPerformanceDevice } from '../lib/utils/deviceUtils';
import { MarketPriceUpdater } from './MarketPriceUpdater'; 
import { OptimizedMarketPriceUpdater } from './OptimizedMarketPriceUpdater';
import { PerformanceOptimizer } from './PerformanceOptimizer';

/**
 * This wrapper component decides whether to use the standard or optimized
 * market price updater based on device capabilities and user preferences
 */
export const MarketPriceUpdaterWrapper: React.FC = () => {
  // State to track if we should use the optimized version
  const [useOptimized, setUseOptimized] = useState(false);
  
  // On initial render, detect if we should use optimized version
  useEffect(() => {
    // Check if the device is mobile or low performance
    const isMobile = isMobileDevice();
    const isLowPerformance = isLowPerformanceDevice();
    
    // Use optimized version for mobile and low-performance devices
    const shouldUseOptimized = isMobile || isLowPerformance;
    
    // Check if user has a preference saved in localStorage
    const savedPreference = localStorage.getItem('useOptimizedMarketUpdater');
    if (savedPreference !== null) {
      // User preference overrides automatic detection
      setUseOptimized(savedPreference === 'true');
    } else {
      // Otherwise use automatic detection
      setUseOptimized(shouldUseOptimized);
      
      // Save the automatic detection result as the default preference
      localStorage.setItem('useOptimizedMarketUpdater', String(shouldUseOptimized));
    }
    
    // Log the decision
    console.log(
      `MarketPriceUpdaterWrapper: Using ${shouldUseOptimized ? 'optimized' : 'standard'} market updater. ` +
      `Device is ${isMobile ? 'mobile' : 'desktop'} with ${isLowPerformance ? 'low' : 'standard'} performance.`
    );
  }, []);
  
  return (
    <>
      {/* Render either the standard or optimized updater */}
      {useOptimized ? <OptimizedMarketPriceUpdater /> : <MarketPriceUpdater />}
      
      {/* Always render the performance optimizer for settings UI */}
      <PerformanceOptimizer />
    </>
  );
};

export default MarketPriceUpdaterWrapper;