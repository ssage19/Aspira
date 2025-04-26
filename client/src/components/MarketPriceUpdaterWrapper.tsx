import React from 'react';
import { OptimizedMarketPriceUpdater } from './OptimizedMarketPriceUpdater';
import { PerformanceOptimizer } from './PerformanceOptimizer';

/**
 * This wrapper component now always uses the optimized market price updater
 * for better performance across all devices
 */
export const MarketPriceUpdaterWrapper: React.FC = () => {
  // Always use the optimized version for better performance
  return (
    <>
      <OptimizedMarketPriceUpdater />
      <PerformanceOptimizer />
    </>
  );
};