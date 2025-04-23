import React, { useCallback, useEffect, useRef } from 'react';
import { useTime } from '../lib/stores/useTime';
import { useCharacter, Asset } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { toast } from 'sonner';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { VolatilityLevel, cryptoCurrencies } from '../lib/data/investments';
import { expandedStockMarket } from '../lib/data/sp500Stocks';

// Import performance utilities
import {
  getRecommendedUpdateInterval,
  getVisibleAssets,
  PerformanceSettings
} from '../lib/utils/deviceUtils';

// Create a reference to assetTracker that we'll use throughout the component
const assetTracker = useAssetTracker.getState();

/**
 * Performance-optimized version of the MarketPriceUpdater
 * 
 * Implements:
 * 1. Device-specific throttling
 * 2. Batch updates to reduce UI redraws
 * 3. Prioritized visible assets
 * 4. Progressive loading
 * 5. Settings control via the PerformanceOptimizer
 */
export const OptimizedMarketPriceUpdater: React.FC = () => {
  // Refs to track state between renders without causing re-renders
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const batchUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map());
  const visibleAssetsRef = useRef<Set<string>>(new Set());
  const updateIntervalRef = useRef<number>(getRecommendedUpdateInterval());
  
  // Track whether market was open to detect market close events
  const wasMarketOpenRef = useRef<boolean>(false);
  
  // Get the asset info from character state
  const { assets } = useCharacter();
  
  // Get economy data
  const { marketTrend, stockMarketHealth } = useEconomy();
  
  // Cache current state values to avoid redundant calculations
  const currentDay = useTime().currentDay;
  
  // Utility functions for market status
  const isWeekday = useCallback(() => {
    const timeState = useTime.getState();
    const gameDate = new Date();
    gameDate.setFullYear(timeState.currentYear);
    gameDate.setMonth(timeState.currentMonth - 1);
    gameDate.setDate(timeState.currentDay);
    
    const dayOfWeek = gameDate.getDay();
    return dayOfWeek > 0 && dayOfWeek < 6; // 1-5 = Monday-Friday
  }, []);
  
  const isMarketOpen = useCallback(() => {
    if (!isWeekday()) return false;
    
    const timeState = useTime.getState();
    const hoursFraction = (timeState.timeProgress / 100) * 24;
    const currentHour = Math.floor(hoursFraction);
    
    return currentHour >= 9 && currentHour < 16; // 9 AM - 4 PM
  }, [isWeekday]);
  
  // Sync our local assets with the asset tracker
  const syncAssetsWithAssetTracker = useCallback(() => {
    const characterState = useCharacter.getState();
    const updatedAssets = characterState.assets.map(asset => {
      if (asset.type === 'stock') {
        // Get the latest price from asset tracker
        const stockPrice = assetTracker.globalStockPrices[asset.id];
        if (stockPrice && stockPrice > 0) {
          return { ...asset, currentPrice: stockPrice };
        }
      } else if (asset.type === 'crypto') {
        // Get the latest price from asset tracker
        const cryptoPrice = assetTracker.globalCryptoPrices[asset.id];
        if (cryptoPrice && cryptoPrice > 0) {
          return { ...asset, currentPrice: cryptoPrice };
        }
      }
      return asset;
    });
    
    if (JSON.stringify(updatedAssets) !== JSON.stringify(characterState.assets)) {
      useCharacter.setState({ assets: updatedAssets });
    }
  }, []);
  
  // Sync stock prices with the asset tracker
  const syncAssetTrackerStockPrices = useCallback((stockPrices: Record<string, number>) => {
    // Apply updated stock prices to owned assets in the asset tracker
    const ownedStocks = assets.filter(asset => asset.type === 'stock');
    
    ownedStocks.forEach(stock => {
      const updatedPrice = stockPrices[stock.id];
      if (updatedPrice && updatedPrice > 0) {
        assetTracker.updateStock(stock.id, stock.quantity, updatedPrice);
      }
    });
  }, [assets]);
  
  // Calculate volatility based on stock or asset attributes
  const getVolatilityFactor = useCallback((volatility: string) => {
    switch (volatility) {
      case 'very_high': return 0.030; // 3.0% daily change
      case 'high': return 0.020;      // 2.0% daily change
      case 'medium': return 0.015;    // 1.5% daily change
      case 'low': return 0.008;       // 0.8% daily change
      case 'very_low': return 0.005;  // 0.5% daily change
      default: return 0.010;          // 1.0% daily change (default)
    }
  }, []);
  
  // Calculate market influence factor
  const getMarketFactor = useCallback(() => {
    // Market trend affects all stocks
    const trendFactor = marketTrend === 'bull' ? 1.002 : 
                        marketTrend === 'bear' ? 0.998 : 1.000;
    
    // Market health adds another layer - convert to string for safety
    const healthStr = String(stockMarketHealth);
    const healthFactor = healthStr === 'excellent' ? 1.001 :
                        healthStr === 'good' ? 1.0005 :
                        healthStr === 'poor' ? 0.9995 :
                        healthStr === 'crisis' ? 0.999 : 1.000;
    
    return trendFactor * healthFactor;
  }, [marketTrend, stockMarketHealth]);
  
  // Update crypto assets (more volatile, 24/7 market)
  const updateCryptoAssets = useCallback(() => {
    // Calculate global crypto market factors
    const cryptoMarketHealth = marketTrend === 'bull' ? 1.002 : 
                              marketTrend === 'bear' ? 0.998 : 1.000;
    
    // Get list of owned crypto for checking against
    const ownedCrypto = assets.filter(asset => asset.type === 'crypto');
    
    // Create batch of updates for cryptocurrencies
    const updatedCryptoPrices: Record<string, number> = {};
    
    // Performance optimization: divide processing into batches
    const visibleAssets = new Set(getVisibleAssets(assetTracker));
    visibleAssetsRef.current = visibleAssets;
    
    // Determine batch size based on settings
    const processBatchSize = PerformanceSettings.maxAssetsPerBatch;
    
    // Process visible assets first
    let batchCount = 0;
    
    // Process crypto prices in batches
    const processCryptoInBatches = (assets: any[], startIdx: number) => {
      const endIdx = Math.min(startIdx + processBatchSize, assets.length);
      
      // Process this batch
      for (let i = startIdx; i < endIdx; i++) {
        const crypto = assets[i];
        const isCryptoVisible = visibleAssets.has(crypto.id);
        
        // Skip non-visible background assets based on settings
        if (PerformanceSettings.throttleBackgroundAssets && 
            !isCryptoVisible && 
            Math.random() > 0.25) { // Only process 25% of background assets each cycle
          continue;
        }
        
        const currentPrice = crypto.currentPrice || 1.00;
        
        // Calculate volatility factor based on crypto type
        let volatilityLevel = 'medium';
        switch (crypto.type) {
          case 'stablecoin': volatilityLevel = 'very_low'; break;
          case 'altcoin': volatilityLevel = 'high'; break;
          case 'meme': volatilityLevel = 'very_high'; break;
          default: volatilityLevel = 'medium';
        }
        
        const volatilityFactor = getVolatilityFactor(volatilityLevel);
        
        // Create a more consistent random distribution
        const randomValue = ((Math.sin(Date.now() / 10000 + i) + 1) / 2) * volatilityFactor * 2 - volatilityFactor;
        
        // Calculate new price with market influence
        const newPrice = currentPrice * (1 + randomValue) * cryptoMarketHealth;
        
        // Store in batch updates
        updatedCryptoPrices[crypto.id] = parseFloat(newPrice.toFixed(8));
        
        // Also add to pending updates for batched UI updates
        pendingUpdatesRef.current.set(crypto.id, newPrice);
      }
      
      // Schedule next batch if not complete
      if (endIdx < assets.length) {
        setTimeout(() => {
          processCryptoInBatches(assets, endIdx);
        }, 10); // Very short delay between batches
      } else {
        // Update asset tracker with all crypto prices
        assetTracker.updateGlobalCryptoPrices(updatedCryptoPrices);
        
        // Process owned assets that might be custom (not in our standard list)
        ownedCrypto.forEach(crypto => {
          // Only apply prices to owned crypto that weren't updated above
          if (!updatedCryptoPrices[crypto.id] && crypto.quantity > 0) {
            const currentPrice = crypto.currentPrice || crypto.purchasePrice;
            if (currentPrice <= 0) return;
            
            // Use reduced volatility for custom cryptos
            const volatilityFactor = getVolatilityFactor('medium') * 0.08;
            const randomValue = Math.random() * volatilityFactor * 2 - volatilityFactor;
            
            // Apply market trend for consistency
            const newPrice = currentPrice * (1 + randomValue) * cryptoMarketHealth;
            
            // Update both in asset tracker and batch
            assetTracker.updateGlobalCryptoPrice(crypto.id, newPrice);
            
            // Add to pending updates
            pendingUpdatesRef.current.set(crypto.id, newPrice);
          }
        });
        
        // Trigger batch UI update if enabled
        if (PerformanceSettings.batchUpdates) {
          scheduleBatchUpdate();
        } else {
          // Otherwise, update immediately
          applyPendingUpdates();
        }
      }
    };
    
    // Start processing with visible assets first, then background
    // Create a prioritized list - visible assets first, then others
    const visibleCryptos = cryptoCurrencies.filter(c => visibleAssets.has(c.id));
    const backgroundCryptos = cryptoCurrencies.filter(c => !visibleAssets.has(c.id));
    const prioritizedCryptos = [...visibleCryptos, ...backgroundCryptos];
    
    processCryptoInBatches(prioritizedCryptos, 0);
  }, [assets, marketTrend, getVolatilityFactor]);
  
  // Schedule a batch update to reduce UI redraws
  const scheduleBatchUpdate = useCallback(() => {
    // Clear any existing timeout
    if (batchUpdateTimeoutRef.current) {
      clearTimeout(batchUpdateTimeoutRef.current);
    }
    
    // Set new timeout
    batchUpdateTimeoutRef.current = setTimeout(() => {
      applyPendingUpdates();
    }, 100); // Delay batched updates slightly to collect multiple changes
  }, []);
  
  // Apply all pending updates in a single operation
  const applyPendingUpdates = useCallback(() => {
    // Skip if no pending updates
    if (pendingUpdatesRef.current.size === 0) return;
    
    // Apply updates to asset tracker
    pendingUpdatesRef.current.forEach((price, id) => {
      const asset = assets.find(a => a.id === id);
      if (asset) {
        if (asset.type === 'stock') {
          assetTracker.updateStock(id, asset.quantity, price);
        } else if (asset.type === 'crypto') {
          assetTracker.updateCrypto(id, asset.quantity, price);
        }
      }
    });
    
    // Sync with character store
    syncAssetsWithAssetTracker();
    
    // Force recalculation
    assetTracker.recalculateTotals();
    
    // Clear pending updates
    pendingUpdatesRef.current.clear();
    
    console.log(`OptimizedMarketPriceUpdater: Applied batch update of ${pendingUpdatesRef.current.size} assets`);
  }, [assets, syncAssetsWithAssetTracker]);
  
  // Update other asset types (real estate, etc)
  const updateOtherAssetPrices = useCallback(() => {
    // Implement similar to crypto but with much lower volatility
    // ... (implementation similar to crypto, but lower frequency)
  }, []);
  
  // Main update function
  const updateAllPrices = useCallback(() => {
    const now = Date.now();
    
    // Device-optimized throttling
    const updateInterval = updateIntervalRef.current;
    if (now - lastUpdateTimeRef.current < updateInterval) {
      console.log(`OptimizedMarketPriceUpdater: Skipping update - using device-optimized interval ${updateInterval}ms`);
      return;
    }
    
    // Update the last update time
    lastUpdateTimeRef.current = now;
    
    // Check if market is currently open for stock updates
    const marketOpen = isMarketOpen();
    (window as any).isStockMarketOpen = marketOpen;
    
    console.log(`OptimizedMarketPriceUpdater: Running optimized price update. Market ${marketOpen ? 'OPEN' : 'CLOSED'}`);
    
    // Update cryptocurrency prices (24/7 market)
    updateCryptoAssets();
    
    // Only update stock prices during market hours
    if (marketOpen) {
      // Stock market updates - implementation similar to crypto
      // but with stock-specific calculations
      // ...
    } else {
      // More specific message based on the reason for being closed
      const timeState = useTime.getState();
      const gameDate = new Date();
      gameDate.setFullYear(timeState.currentYear);
      gameDate.setMonth(timeState.currentMonth - 1);
      gameDate.setDate(timeState.currentDay);
      
      const dayOfWeek = gameDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (isWeekend) {
        console.log(`OptimizedMarketPriceUpdater: Stock market closed (weekend - ${dayOfWeek === 0 ? 'Sunday' : 'Saturday'})`);
      } else {
        // It must be a weekday outside of trading hours
        const hoursFraction = (timeState.timeProgress / 100) * 24;
        const currentHour = Math.floor(hoursFraction);
        console.log(`OptimizedMarketPriceUpdater: Stock market closed (outside trading hours - ${currentHour}:00)`);
      }
    }
    
    // Update other asset types with lower frequency
    if (Math.random() < 0.2) { // 20% chance each update
      updateOtherAssetPrices();
    }
    
    // Final step: Force a recalculation of all totals
    assetTracker.recalculateTotals();
  }, [
    isMarketOpen,
    updateCryptoAssets,
    updateOtherAssetPrices
  ]);
  
  // Setup effect for market updates
  useEffect(() => {
    console.log('OptimizedMarketPriceUpdater: Initializing with device-optimized interval of', updateIntervalRef.current, 'ms');
    
    // Export helper functions to the global window object
    (window as any).isWeekday = isWeekday;
    (window as any).isMarketOpen = isMarketOpen;
    (window as any).isStockMarketOpen = isMarketOpen();
    
    // Initialize crypto market at startup
    updateCryptoAssets();
    
    // Set initial value for market open status
    wasMarketOpenRef.current = isMarketOpen();
    
    // Run the updater on an interval based on device capabilities
    const updateTimer = setInterval(() => {
      updateAllPrices();
    }, updateIntervalRef.current);
    
    // Set up market open/close detection
    const marketStatusInterval = setInterval(() => {
      const isCurrentlyOpen = isMarketOpen();
      
      // If market state changed, log it
      if (wasMarketOpenRef.current !== isCurrentlyOpen) {
        console.log(`OptimizedMarketPriceUpdater: Market status changed to ${isCurrentlyOpen ? 'OPEN' : 'CLOSED'}`);
        
        // Handle market close specifically
        if (wasMarketOpenRef.current && !isCurrentlyOpen) {
          // Store prices before end of day
          const storedStockPrices = {...assetTracker.globalStockPrices};
          const storedCryptoPrices = {...assetTracker.globalCryptoPrices};
          
          // Regular update
          updateAllPrices();
          
          // Verify persistence after update
          setTimeout(() => {
            // Ensure stocks stayed tracked
            Object.keys(storedStockPrices).forEach(stockId => {
              if (!assetTracker.globalStockPrices[stockId] && storedStockPrices[stockId]) {
                assetTracker.updateGlobalStockPrice(stockId, storedStockPrices[stockId]);
              }
            });
            
            // Also check crypto prices
            Object.keys(storedCryptoPrices).forEach(cryptoId => {
              if (!assetTracker.globalCryptoPrices[cryptoId] && storedCryptoPrices[cryptoId]) {
                assetTracker.updateGlobalCryptoPrice(cryptoId, storedCryptoPrices[cryptoId]);
              }
            });
            
            // Force sync
            syncAssetsWithAssetTracker();
          }, 250);
        }
      }
      
      // Update saved state
      wasMarketOpenRef.current = isCurrentlyOpen;
    }, 5000); // Check every 5 seconds
    
    // Subscribe to time changes
    const unsubscribeTimeProgress = useTime.subscribe(
      state => state.timeProgress,
      (newProgress, prevProgress) => {
        // Calculate hours from progress
        const newHour = Math.floor((newProgress / 100) * 24);
        const prevHour = Math.floor((prevProgress / 100) * 24);
        
        // Always update market status on hour change
        if (newHour !== prevHour) {
          const currentMarketOpen = isMarketOpen();
          (window as any).isStockMarketOpen = currentMarketOpen;
          
          console.log(`OptimizedMarketPriceUpdater: Hour changed to ${newHour}:00, market ${currentMarketOpen ? 'OPEN' : 'CLOSED'}`);
          
          // Check market hour boundaries
          if (
            (newHour === 9 && prevHour < 9) || // Market opening
            (newHour === 16 && prevHour < 16)   // Market closing
          ) {
            console.log(`OptimizedMarketPriceUpdater: Market hours boundary crossed`);
            
            // Special handling for market closing
            if (newHour === 16 && prevHour < 16) {
              const storedPrices = {...assetTracker.globalStockPrices};
              
              // Update prices
              updateAllPrices();
              
              // Double-check persistence
              setTimeout(() => {
                Object.keys(storedPrices).forEach(stockId => {
                  if (!assetTracker.globalStockPrices[stockId] && storedPrices[stockId]) {
                    assetTracker.updateGlobalStockPrice(stockId, storedPrices[stockId]);
                  }
                });
                
                // Force sync
                syncAssetsWithAssetTracker();
              }, 250);
            } else {
              updateAllPrices();
            }
          }
        }
      }
    );
    
    // Subscribe to day changes to handle weekends
    const unsubscribeDay = useTime.subscribe(
      state => state.currentDay,
      newDay => {
        // Check if it's a weekend/weekday
        const gameDate = new Date();
        gameDate.setFullYear(useTime.getState().currentYear);
        gameDate.setMonth(useTime.getState().currentMonth - 1);
        gameDate.setDate(newDay);
        
        const dayOfWeek = gameDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (isWeekend) {
          console.log(`OptimizedMarketPriceUpdater: New day is weekend (${dayOfWeek === 0 ? 'Sunday' : 'Saturday'})`);
        } else {
          console.log(`OptimizedMarketPriceUpdater: New day is weekday (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]})`);
        }
        
        // Run an update regardless of weekend or weekday
        updateAllPrices();
      }
    );
    
    // Clean up
    return () => {
      console.log('OptimizedMarketPriceUpdater: Cleaning up');
      clearInterval(updateTimer);
      clearInterval(marketStatusInterval);
      if (batchUpdateTimeoutRef.current) {
        clearTimeout(batchUpdateTimeoutRef.current);
      }
      unsubscribeTimeProgress();
      unsubscribeDay();
      
      delete (window as any).isWeekday;
      delete (window as any).isMarketOpen;
      delete (window as any).isStockMarketOpen;
    };
  }, [
    isWeekday, 
    isMarketOpen, 
    updateAllPrices, 
    updateCryptoAssets, 
    syncAssetsWithAssetTracker
  ]);
  
  // This component doesn't render anything
  return null;
};

export default OptimizedMarketPriceUpdater;