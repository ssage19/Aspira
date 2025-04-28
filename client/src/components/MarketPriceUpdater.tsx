import { useEffect, useCallback, useRef } from 'react';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useCharacter, Asset, Property } from '../lib/stores/useCharacter';
import { VolatilityLevel, cryptoCurrencies } from '../lib/data/investments';
import { expandedStockMarket } from '../lib/data/sp500Stocks';

// Extend Asset type with possible additional properties
interface ExtendedAsset extends Asset {
  faceValue?: number;
  currentValue?: number;
  mortgage?: number;
}

// Ensure Property type has the fields we need
interface PropertyWithLoan extends Property {
  loanAmount: number;
  currentValue: number;
}

/**
 * MarketPriceUpdater - Background component that updates asset prices
 * 
 * This component handles periodic updates of all asset prices in the game,
 * ensuring that investments are properly valued regardless of which
 * screen the player is viewing.
 */
export function MarketPriceUpdater() {
  const { marketTrend, stockMarketHealth } = useEconomy();
  const { currentDay } = useTime();
  const assetTracker = useAssetTracker();
  const { assets, syncAssetsWithAssetTracker } = useCharacter();
  
  // Ref to prevent too frequent updates
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Helper functions (memoized to avoid recreation)
  const getVolatilityFactor = useCallback((volatility: string): number => {
    switch (volatility as VolatilityLevel) {
      case 'extreme': return 1.4;    // Doubled from 0.7
      case 'very_high': return 1.0;  // Doubled from 0.5
      case 'high': return 0.6;       // Doubled from 0.3
      case 'medium': return 0.4;     // Doubled from 0.2
      case 'low': return 0.2;        // Doubled from 0.1
      case 'very_low': return 0.1;   // Doubled from 0.05
      default: return 0.1;           // Doubled from 0.05
    }
  }, []);
  
  // Helper function to get market factor based on market trend
  // More balanced market factors with similar magnitude effects in both directions
  const getMarketFactor = useCallback((trend: string): number => {
    if (trend === 'bull') return 1.04; // Reduced bullish effect (4% instead of 8%)
    if (trend === 'bear') return 0.96; // Increased bearish effect (-4% instead of -3%)
    return 1.00; // Neutral stable market (removed positive bias)
  }, []);

  // Occasional updates to lifestyle item values (very low volatility)
  const updateLifestyleItems = useCallback(() => {
    // Only update very rarely (5% chance per update)
    if (Math.random() > 0.05) return;
    
    // Get all lifestyle items directly from character state
    const { lifestyleItems } = useCharacter.getState();
    
    if (!lifestyleItems || lifestyleItems.length === 0) return;
    
    // Only update permanent items (not vacations or experiences)
    const permanentItems = lifestyleItems.filter(
      item => item.type !== 'vacations' && item.type !== 'experiences'
    );
    
    if (permanentItems.length === 0) return;
    
    console.log("MarketPriceUpdater: Updating", permanentItems.length, "lifestyle item values");
    
    // Lifestyle items generally depreciate slightly over time with occasional market effects
    const marketInfluence = marketTrend === 'bull' ? 1.005 : marketTrend === 'bear' ? 0.998 : 1.0;
    
    permanentItems.forEach(item => {
      if (!item || !item.purchasePrice) return;
      
      // Extremely low volatility for lifestyle items
      const volatilityFactor = 0.01;
      const randomFactor = (Math.random() * volatilityFactor * 2) - volatilityFactor;
      
      // Most lifestyle items depreciate slightly over time
      const depreciationFactor = 0.998; // Very slow depreciation
      
      // Calculate new value with depreciation and market effects
      const baseValue = item.purchasePrice;
      const newValue = baseValue * depreciationFactor * marketInfluence * (1 + randomFactor);
      const formattedValue = parseFloat(newValue.toFixed(2));
      
      // Update the item value in asset tracker (if it has meaningful value)
      if (assetTracker.updateLifestyleItem && formattedValue > 10) {
        assetTracker.updateLifestyleItem(
          item.id,
          formattedValue
        );
        
        console.log(`MarketPriceUpdater: Updated ${item.name} value to $${formattedValue.toFixed(2)}`);
      }
    });
  }, [assetTracker, marketTrend]);
  
  // Update crypto asset prices (refactored to match stock update pattern)
  const updateCryptoAssets = useCallback(() => {
    // Setup for batch processing
    const updatedCryptoPrices: Record<string, number> = {};
    
    // Process all cryptocurrencies from our data source
    cryptoCurrencies.forEach(crypto => {
      if (!crypto || !crypto.id) return;
      
      // Get previous price with fallbacks
      const previousPrice = assetTracker.globalCryptoPrices[crypto.id] || 
                            updatedCryptoPrices[crypto.id] ||
                            crypto.basePrice;
      
      // Determine volatility factor based on crypto's volatility level
      const volatilityLevel = crypto.volatility || 'high';
      let volatilityFactor = getVolatilityFactor(volatilityLevel) * 0.08; // Reduced from 0.20 to 0.08 (60% reduction)
      
      // Apply volatility multipliers for crypto character, but with reduced impact
      if (volatilityLevel === 'extreme') volatilityFactor *= 1.15; // Reduced from 1.3
      else if (volatilityLevel === 'very_high') volatilityFactor *= 1.1; // Reduced from 1.2
      else if (volatilityLevel === 'high') volatilityFactor *= 1.05; // Reduced from 1.1
      else if (volatilityLevel === 'medium') volatilityFactor *= 1.0;
      else if (volatilityLevel === 'low') volatilityFactor *= 0.85; // Increased from 0.8
      else if (volatilityLevel === 'very_low') volatilityFactor *= 0.7; // Increased from 0.6
      
      // Calculate market influences with more realistic factors
      const marketFactor = 1 + ((getMarketFactor(marketTrend) - 1) * 0.3);
      const timeFactor = Math.sin(currentDay / 30 * Math.PI) * volatilityFactor * 0.1;
      
      // Use adjusted random for more realistic long-term growth with volatility
      const randomValue = Math.random();
      const adjustedRandom = randomValue * 1.15 - 0.55; // Slightly stronger positive bias for crypto
      const baseChangePercent = adjustedRandom * volatilityFactor;
      
      // Apply market effect with slightly stronger influence for crypto
      const marketEffect = ((marketFactor - 1) * 0.15);
      
      // Combine influences
      let totalChangePercent = baseChangePercent + marketEffect + timeFactor;
      
      // Add tiny natural growth factor (crypto tends to increase long term)
      totalChangePercent += 0.0005; // Slightly stronger than stocks
      
      // Force occasional opposite movement (reduced to 30% chance for better growth)
      if (Math.random() < 0.30) {
        const originalDirection = Math.sign(totalChangePercent);
        totalChangePercent = -originalDirection * Math.abs(totalChangePercent) * 0.75;
      }
      
      // Add occasional random bursts (5% chance, reduced from 10%)
      if (Math.random() < 0.05) {
        const randomBurst = (Math.random() * 0.002) * (Math.random() < 0.5 ? 1 : -1); // Reduced magnitude from 0.005 to 0.002
        totalChangePercent += randomBurst;
      }
      
      // Apply percentage change to current price
      let newPrice = previousPrice * (1 + totalChangePercent);
      
      // Apply minimum price floor
      newPrice = Math.max(newPrice, crypto.basePrice * 0.3);
      
      // Apply enhanced smoothing for more gradual changes
      if (previousPrice !== crypto.basePrice) {
        // Use stronger smoothing (60/40 instead of 80/20) for more stable price movements
        newPrice = (newPrice * 0.6) + (previousPrice * 0.4);
      }
      
      // Store in batch update
      updatedCryptoPrices[crypto.id] = parseFloat(newPrice.toFixed(2));
    });
    
    // Batch update all crypto prices in the global tracker
    assetTracker.updateGlobalCryptoPrices(updatedCryptoPrices);
    
    // Update owned crypto assets
    const ownedCrypto = assets.filter(asset => asset.type === 'crypto');
    ownedCrypto.forEach(crypto => {
      if (!crypto || crypto.quantity <= 0) return;
      
      const newPrice = updatedCryptoPrices[crypto.id];
      if (newPrice && newPrice > 0) {
        assetTracker.updateCrypto(crypto.id, crypto.quantity, newPrice);
        
        // Log price change if significant logging is enabled
        const priceChange = ((newPrice - (crypto.currentPrice || crypto.purchasePrice)) / 
                             (crypto.currentPrice || crypto.purchasePrice) * 100).toFixed(2);
        const direction = newPrice > (crypto.currentPrice || crypto.purchasePrice) ? '↑' : 
                         newPrice < (crypto.currentPrice || crypto.purchasePrice) ? '↓' : '→';
                         
        console.log(`MarketPriceUpdater: Updated ${crypto.name} price to $${newPrice.toFixed(2)} (${direction}${priceChange}%) - 24/7 market`);
      }
    });
    
    // Check for any owned crypto that might not be in our standard list
    ownedCrypto.forEach(crypto => {
      if (!updatedCryptoPrices[crypto.id] && crypto.quantity > 0) {
        // This is a custom crypto not in our standard list - handle it separately
        const currentPrice = crypto.currentPrice || crypto.purchasePrice;
        if (currentPrice <= 0) return;
        
        // Use medium volatility for custom cryptos, but with reduced volatility
        const volatilityFactor = getVolatilityFactor('medium') * 0.08; // Reduced from 0.20 to 0.08 (60% reduction)
        
        // Use adjusted random for more consistent and slightly positive-biased movements
        const randomValue = Math.random();
        const adjustedRandom = randomValue * 1.1 - 0.5; // Slight positive bias
        const randomChange = adjustedRandom * volatilityFactor;
        
        // Add tiny natural growth factor
        const naturalGrowth = 0.0003; // Very small growth factor
        
        // Calculate new price with reduced volatility
        const newPrice = currentPrice * (1 + randomChange + naturalGrowth);
        const roundedPrice = parseFloat(newPrice.toFixed(2));
        
        // Add to the global tracker
        updatedCryptoPrices[crypto.id] = roundedPrice;
        assetTracker.updateCrypto(crypto.id, crypto.quantity, roundedPrice);
        
        console.log(`MarketPriceUpdater: Updated custom crypto ${crypto.name} to $${roundedPrice.toFixed(2)}`);
      }
    });
    
  }, [assets, assetTracker, marketTrend, getVolatilityFactor, getMarketFactor, currentDay]);
  
  // Update bond prices (bonds are more stable but still affected by interest rates)
  const updateBonds = useCallback(() => {
    // Get all owned bonds
    const ownedBonds = assets.filter(asset => asset.type === 'bond');
    
    if (ownedBonds.length === 0) return;
    
    console.log("MarketPriceUpdater: Updating", ownedBonds.length, "bonds");
    
    // Bonds are affected by market trends but very minimally
    // Slightly improved market influence with small positive bias for long-term growth
    const marketInfluence = marketTrend === 'bull' ? 1.003 : marketTrend === 'bear' ? 0.999 : 1.001;
    
    ownedBonds.forEach(bond => {
      if (!bond || bond.quantity <= 0) return;
      
      // Bonds are very stable, small random fluctuation
      const volatilityFactor = 0.01; // Reduced volatility for more stability
      
      // Use slightly biased random value for realistic long-term positive returns
      const randomValue = Math.random();
      const adjustedRandom = randomValue * 1.05 - 0.5; // 5% positive bias
      const randomFactor = adjustedRandom * volatilityFactor;
      
      // Add tiny natural growth factor (bonds tend to return their face value over time)
      const naturalGrowth = 0.0001; // Very small growth factor
      
      // Get current price from stored prices first, fall back to maturity/purchase price
      const currentValue = assetTracker.getAssetPrice(bond.id);
      const extendedBond = bond as ExtendedAsset;
      const baseValue = currentValue || extendedBond.maturityValue || bond.purchasePrice;
      const newPrice = baseValue * marketInfluence * (1 + randomFactor + naturalGrowth);
      
      // Update the bond in the asset tracker
      assetTracker.updateBond(bond.id, bond.quantity, parseFloat(newPrice.toFixed(2)));
      
      console.log(`MarketPriceUpdater: Updated ${bond.name} price to $${newPrice.toFixed(2)}`);
    });
  }, [assets, assetTracker, marketTrend]);
  
  // Update other investment types
  const updateOtherInvestments = useCallback(() => {
    // Get all other investments - only those of type "other"
    const otherInvestments = assets.filter(asset => asset.type === 'other');
    
    if (otherInvestments.length === 0) return;
    
    console.log("MarketPriceUpdater: Updating", otherInvestments.length, "other investments");
    
    // Different investment types have different volatility profiles
    otherInvestments.forEach(investment => {
      if (!investment || investment.quantity <= 0) return;
      
      // Reduced volatility for more balanced movements
      const volatilityFactor = 0.07; // Reduced from 0.15
      
      // Greatly reduced market influence
      const marketInfluence = marketTrend === 'bull' ? 1.005 : marketTrend === 'bear' ? 0.995 : 1.0;
      
      // Get current price from stored prices first, then fall back to purchase price
      const currentValue = assetTracker.getAssetPrice(investment.id);
      const basePrice = currentValue || investment.purchasePrice;
      
      // Use normalized random for better balanced price movements
      const normalizedRandom = (Math.random() * 2) - 1; // Range from -1 to +1
      const randomFactor = normalizedRandom * volatilityFactor;
      
      // Apply occasional contrarian movement
      let finalFactor = randomFactor;
      if (Math.random() < 0.3) { // 30% chance of opposite movement
        finalFactor = -Math.abs(randomFactor) * 0.7;
        console.log(`MarketPriceUpdater: Forcing contrarian movement for ${investment.name}`);
      }
      
      // Calculate new price with reduced market influence
      const newPrice = basePrice * marketInfluence * (1 + finalFactor);
      
      // Update the asset in the tracker
      if (assetTracker.updateOtherInvestment) {
        // updateOtherInvestment only takes id and currentValue (not quantity)
        assetTracker.updateOtherInvestment(
          investment.id, 
          parseFloat(newPrice.toFixed(2))
        );
        
        console.log(`MarketPriceUpdater: Updated ${investment.name} price to $${newPrice.toFixed(2)}`);
      }
    });
  }, [assets, assetTracker, marketTrend]);
  
  // Occasionally update property values (real estate changes VERY slowly)
  const updatePropertyValues = useCallback(() => {
    // Only update property values RARELY (1% chance per update)
    // This makes property values much more stable, which is more realistic for real estate
    if (Math.random() > 0.01) return;
    
    // Get properties directly from character state
    const { properties } = useCharacter.getState();
    
    if (!properties || properties.length === 0) return;
    
    console.log("MarketPriceUpdater: Updating", properties.length, "property values (rare event)");
    
    // Real estate market has extremely minimal market influence
    // Much more subtle market influence
    const marketInfluence = marketTrend === 'bull' ? 1.0015 : marketTrend === 'bear' ? 0.9995 : 1.0005;
    
    properties.forEach(property => {
      if (!property) return;
      
      // Cast to PropertyWithLoan to access the specific property fields
      const propertyWithLoan = property as PropertyWithLoan;
      
      // Properties have extremely low volatility (reduced by 5x)
      const volatilityFactor = 0.002; // Drastically smaller movements for real estate
      
      // Less biased random for more realistic property value changes
      const randomValue = Math.random();
      const adjustedRandom = randomValue * 1.03 - 0.5; // Only 3% positive bias (more realistic appreciation)
      const randomFactor = adjustedRandom * volatilityFactor;
      
      // Much smaller natural appreciation factor
      const naturalGrowth = 0.0001; // Very tiny growth factor
      
      // Force contrarian movement more often to ensure both up and down trends
      let finalFactor = randomFactor + naturalGrowth;
      if (Math.random() < 0.30) { // 30% chance of opposite movement
        const originalDirection = Math.sign(finalFactor);
        finalFactor = -originalDirection * Math.abs(finalFactor) * 0.7;
        console.log(`MarketPriceUpdater: Forcing contrarian movement for property ${property.name}`);
      }
      
      // Get current price from stored property values first, then fall back to other values
      const storedValue = assetTracker.getAssetPrice(property.id);
      const currentPropertyValue = storedValue || propertyWithLoan.currentValue || property.purchasePrice;
      
      // Calculate new value with much more subtle changes
      const newValue = currentPropertyValue * marketInfluence * (1 + finalFactor);
      const formattedValue = parseFloat(newValue.toFixed(2));
      
      // Only update if the change is significant enough (prevents unnecessary updates)
      const percentChange = Math.abs((formattedValue - currentPropertyValue) / currentPropertyValue);
      if (percentChange < 0.001) {
        console.log(`MarketPriceUpdater: Skipping update for ${property.name} - change too small (${(percentChange * 100).toFixed(4)}%)`);
        return;
      }
      
      // Update the property value in asset tracker AND character store
      if (assetTracker.updateProperty) {
        // Update in asset tracker
        assetTracker.updateProperty(
          property.id,
          formattedValue,
          propertyWithLoan.loanAmount || 0
        );
        
        // Also update the property in character store to keep values in sync
        const characterStore = useCharacter.getState();
        if (characterStore && characterStore.updatePropertyValue) {
          characterStore.updatePropertyValue(property.id, formattedValue);
        }
        
        console.log(`MarketPriceUpdater: Updated ${property.name} value to $${formattedValue.toFixed(2)}`);
      }
    });
  }, [assetTracker, marketTrend]);

  // Function to update other asset types (crypto, property values, etc.)
  const updateOtherAssetPrices = useCallback(() => {
    // Update crypto assets
    updateCryptoAssets();
    
    // Update bonds
    updateBonds();
    
    // Update other investments
    updateOtherInvestments();
    
    // Update property values (occasional small adjustments)
    updatePropertyValues();
    
    // Update lifestyle items (rarely changes in value)
    updateLifestyleItems();
    
    // After updating all assets, force a recalculation of totals
    assetTracker.recalculateTotals();
  }, [updateCryptoAssets, updateBonds, updateOtherInvestments, updatePropertyValues, updateLifestyleItems, assetTracker]);
  
  // Function to update asset tracker stock prices
  const syncAssetTrackerStockPrices = useCallback((prices: Record<string, number>) => {
    // Get all owned stocks from character assets
    const ownedStocks = assets.filter(asset => asset.type === 'stock');
    
    // Debug log the stocks and prices being updated
    console.log("MarketPriceUpdater: Syncing prices for", ownedStocks.length, "stocks");
    
    // For each owned stock, update its price in the asset tracker
    ownedStocks.forEach(stock => {
      const currentPrice = prices[stock.id] || stock.currentPrice || stock.purchasePrice;
      
      // Only update if we have a valid price and quantity
      if (currentPrice > 0 && stock.quantity > 0) {
        // Update the stock's current price in the asset tracker
        assetTracker.updateStock(stock.id, stock.quantity, currentPrice);
        
        const oldPrice = stock.currentPrice || stock.purchasePrice;
        const priceChange = ((currentPrice - oldPrice) / oldPrice * 100).toFixed(2);
        const direction = currentPrice > oldPrice ? '↑' : currentPrice < oldPrice ? '↓' : '→';
        
        // More realistic NYSE-like logging with market status
        const marketStatus = (window as any).isStockMarketOpen ? 'NYSE-OPEN' : 'NYSE-CLOSED';
        console.log(`MarketPriceUpdater: Updated ${stock.name} price to $${currentPrice.toFixed(2)} (${direction}${priceChange}%) - ${marketStatus}`);
      }
    });
  }, [assets, assetTracker]);

  // Helper to check if a date is a weekday (Monday-Friday)
  const isWeekday = useCallback((date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday is 1, Friday is 5
  }, []);
  
  // Check if the market is open (both weekday and within trading hours)
  const isMarketOpen = useCallback((): boolean => {
    // Get the current game time state
    const timeState = useTime.getState();
    
    // Check day of week first (most important)
    const gameDate = new Date();
    gameDate.setFullYear(timeState.currentYear);
    gameDate.setMonth(timeState.currentMonth - 1); // JS months are 0-indexed
    gameDate.setDate(timeState.currentDay);
    
    // First check if it's a weekday
    const dayOfWeek = gameDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      console.log(`Market closed: Weekend (${dayOfWeek === 0 ? 'Sunday' : 'Saturday'})`);
      return false;
    }
    
    // Calculate current hour from timeProgress (0-23 range)
    const hoursFraction = (timeState.timeProgress / 100) * 24;
    const currentHour = Math.floor(hoursFraction);
    const isWithinTradingHours = currentHour >= 9 && currentHour < 16;
    
    if (!isWithinTradingHours) {
      console.log(`Market closed: Outside trading hours (${currentHour}:00)`);
      return false;
    }
    
    console.log(`Market open: Weekday during trading hours (${dayOfWeek}, ${currentHour}:00)`);
    return true;
  }, []);
  
  // Export this function to the global window object for use in other components
  useEffect(() => {
    // Save both functions for different use cases
    (window as any).isWeekday = isWeekday;
    (window as any).isMarketOpen = isMarketOpen;
    
    // Save the current market status to a global variable for other components to access
    (window as any).isStockMarketOpen = isMarketOpen();
    
    return () => {
      delete (window as any).isWeekday;
      delete (window as any).isMarketOpen;
      delete (window as any).isStockMarketOpen;
    };
  }, [isWeekday, isMarketOpen]);
  
  // Create a stable reference to the update function that doesn't change on renders
  const updateAllPrices = useCallback(() => {
    const now = Date.now();
    
    // Prevent updates that happen too frequently (minimum 1 second between updates)
    if (now - lastUpdateTimeRef.current < 1000) {
      console.log("MarketPriceUpdater: Skipping update - too soon since last update");
      return;
    }
    
    // Update the last update time
    lastUpdateTimeRef.current = now;
    
    // Check if market is currently open for stock updates
    const marketOpen = isMarketOpen();
    
    // Use imported cryptoCurrencies list to ensure complete coverage of ALL cryptocurrencies
    
    console.log(`MarketPriceUpdater: Running global price update. Market ${marketOpen ? 'OPEN' : 'CLOSED'} right now. Will update ${cryptoCurrencies.length} crypto assets.`);
    
    // Only update stock prices during market hours for realism
    // Other asset types like crypto will still update 24/7
    
    // 1. Calculate updated stock prices based on market conditions
    const updatedStockPrices: Record<string, number> = {};
    expandedStockMarket.forEach(stock => {
      // Only update stock prices if market is open, for realism
      if (marketOpen) {
        // Get previous price from the global tracker or fall back to base price
        // This is critical for price persistence - we check if there's already a tracked price
        const previousPrice = assetTracker.globalStockPrices[stock.id] || 
                             updatedStockPrices[stock.id] || 
                             stock.basePrice;
        
        // NYSE-like behavior: Much smaller price movements (0.1% - 0.5% typically)
        const volatilityFactor = getVolatilityFactor(stock.volatility) * 0.2; // Reduce volatility by 80%
        const marketFactor = 1 + ((getMarketFactor(marketTrend) - 1) * 0.3); // Dampen market effect
        
        // Time-based component (very minor influence)
        const timeFactor = Math.sin(currentDay / 30 * Math.PI) * volatilityFactor * 0.1;
        
        // Calculate random price movement with NO bias (true 50/50 chance)
        // This creates a more realistic market that doesn't allow "sure thing" investments
        // A true random walk is more realistic than a perpetually rising market
        const randomValue = Math.random(); // Random value between 0 and 1
        const adjustedRandom = (randomValue * 2) - 1; // True random from -1.0 to +1.0 (no bias)
        const baseChangePercent = adjustedRandom * volatilityFactor;
        
        // Apply market influence as a subtle bias, not a guaranteed direction
        const marketEffect = ((marketFactor - 1) * 0.15); // Slightly stronger market influence
        
        // Combine random movement, market influence and time factor
        let totalChangePercent = baseChangePercent + marketEffect + timeFactor;
        
        // Natural growth factor - but make it variable based on market conditions
        // In bull markets: tiny growth, bear markets: tiny decline, stable markets: zero
        const naturalFactor = marketTrend === 'bull' ? 0.0001 : 
                             marketTrend === 'bear' ? -0.0001 : 0;
        totalChangePercent += naturalFactor;
        
        // Force occasional opposite direction movements regardless of market trend
        // This ensures realistic price patterns with proper corrections and market cycles
        if (Math.random() < 0.40) { // Increased to 40% chance (more contrarian movements)
          // If the change is positive, make it negative and vice versa
          // Apply full strength for more pronounced corrections
          const originalDirection = Math.sign(totalChangePercent);
          totalChangePercent = -originalDirection * Math.abs(totalChangePercent) * 0.9;
          console.log(`MarketPriceUpdater: Forcing contrarian movement for ${stock.id}: ${totalChangePercent.toFixed(4)}%`);
        }
        
        // Further introduce randomness with a 10% chance of a slightly larger movement
        if (Math.random() < 0.1) {
          // Add or subtract additional random movement
          const randomBurst = (Math.random() * 0.005) * (Math.random() < 0.5 ? 1 : -1);
          totalChangePercent += randomBurst;
          console.log(`MarketPriceUpdater: Adding random burst to ${stock.id}: ${randomBurst.toFixed(4)}%`);
        }
        
        // Apply small percentage change to previous price
        let newPrice = previousPrice * (1 + totalChangePercent);
        
        // Ensure price doesn't go too low
        newPrice = Math.max(newPrice, stock.basePrice * 0.4);
        
        // Apply extra smoothing to avoid large jumps
        if (previousPrice !== stock.basePrice) {
          // Blend with previous price for smoother transitions (80% new, 20% old)
          newPrice = (newPrice * 0.8) + (previousPrice * 0.2);
        }
        
        updatedStockPrices[stock.id] = parseFloat(newPrice.toFixed(2));
      } else {
        // If market is closed, we need to use existing global price data or fall back
        // to ensure we don't reset prices at market close
        
        // First check our global tracking, which is most important for persistence
        const globalPriceExists = stock.id in assetTracker.globalStockPrices;
        
        if (globalPriceExists) {
          // If we have a tracked price, keep using it - this is critical for persistence
          updatedStockPrices[stock.id] = assetTracker.globalStockPrices[stock.id];
          console.log(`MarketPriceUpdater: Using persistent price for ${stock.id}: $${updatedStockPrices[stock.id]}`);
        } else {
          // If not, check if the player owns this stock
          const currentStock = assets.find(asset => asset.id === stock.id && asset.type === 'stock');
          // Prefer any existing price over the base price
          const currentPrice = currentStock?.currentPrice || stock.basePrice;
          updatedStockPrices[stock.id] = parseFloat(currentPrice.toFixed(2));
          console.log(`MarketPriceUpdater: No persistent price for ${stock.id}, using ${currentPrice}`);
        }
      }
    });
    
    // 2. Update global stock prices in the asset tracker
    // This ensures ALL stocks are tracked, not just owned ones
    assetTracker.updateGlobalStockPrices(updatedStockPrices);
    
    // 3. Update asset tracker with the new prices for owned assets
    // This is now redundant with updateGlobalStockPrices, but we keep it for compatibility
    syncAssetTrackerStockPrices(updatedStockPrices);
    
    // Log market status for debugging
    if (!marketOpen) {
      // More specific message based on the reason for being closed
      const timeState = useTime.getState();
      const gameDate = new Date();
      gameDate.setFullYear(timeState.currentYear);
      gameDate.setMonth(timeState.currentMonth - 1);
      gameDate.setDate(timeState.currentDay);
      
      const dayOfWeek = gameDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (isWeekend) {
        console.log(`MarketPriceUpdater: Stock market closed (weekend - ${dayOfWeek === 0 ? 'Sunday' : 'Saturday'})`);
      } else {
        // It must be a weekday outside of trading hours
        const hoursFraction = (timeState.timeProgress / 100) * 24;
        const currentHour = Math.floor(hoursFraction);
        console.log(`MarketPriceUpdater: Stock market closed (outside trading hours - ${currentHour}:00)`);
      }
    }
    
    // 3. Update other asset types
    updateOtherAssetPrices();
    
    // 4. Critical: Make sure character state is synced with asset tracker
    // This ensures Dashboard and Investment pages show the same values
    syncAssetsWithAssetTracker();
    
    // 5. Final step: Force a recalculation of all totals
    // We don't need to immediately call forceUpdate after recalculateTotals
    // as the recalculateTotals function already updates the lastUpdated timestamp
    assetTracker.recalculateTotals();
    
  }, [
    currentDay, 
    marketTrend, 
    stockMarketHealth, 
    assetTracker, 
    syncAssetsWithAssetTracker, 
    getVolatilityFactor, 
    getMarketFactor,
    syncAssetTrackerStockPrices,
    updateOtherAssetPrices,
    isMarketOpen
  ]);

  // Add this function to global window object so it can be called from anywhere
  // This creates a consistent way to refresh prices across components
  useEffect(() => {
    // Add the function to window for global access
    (window as any).globalUpdateAllPrices = updateAllPrices;
    
    return () => {
      // Clean up when component unmounts
      delete (window as any).globalUpdateAllPrices;
    };
  }, [updateAllPrices]);

  // Update all market prices on a regular interval 
  // AND whenever game time changes significantly
  useEffect(() => {
    console.log("Market price updater initializing...");
    
    // Initialize crypto prices on component mount using the imported cryptoCurrencies
    console.log(`MarketPriceUpdater: Initializing prices for ${cryptoCurrencies.length} cryptocurrencies`);
    
    // Create an initial price map with base prices
    const initialCryptoPrices: Record<string, number> = {};
    
    // Initialize all crypto assets with their base prices
    cryptoCurrencies.forEach((crypto: any) => {
      if (crypto && crypto.id) {
        // Use existing price if available, otherwise use base price
        const existingPrice = assetTracker.globalCryptoPrices[crypto.id] || 0;
        initialCryptoPrices[crypto.id] = existingPrice > 0 ? existingPrice : crypto.basePrice;
        
        console.log(`MarketPriceUpdater: Initialized ${crypto.name} at $${initialCryptoPrices[crypto.id].toFixed(2)}`);
      }
    });
    
    // Batch update all crypto prices in the global tracker
    assetTracker.updateGlobalCryptoPrices(initialCryptoPrices);
    
    // Run the standard update after initialization
    updateAllPrices();
    
    // Set up a dedicated interval for crypto updates (every 60 seconds is reasonable)
    // This ensures crypto prices are updated 24/7 regardless of market hours
    const cryptoUpdateInterval = setInterval(() => {
      console.log("MarketPriceUpdater: Running scheduled crypto asset update (24/7 market)");
      updateCryptoAssets();
      
      // Make sure totals are recalculated after crypto updates
      assetTracker.recalculateTotals();
      
      // Force character store to sync with asset tracker to update UI
      syncAssetsWithAssetTracker();
    }, 60000); // Update crypto every minute
    
    // Only update stocks at market close instead of periodically
    // Track market open/close state to detect the market closing
    let wasMarketOpen = isMarketOpen();
    
    // Set up an interval to check if market just closed (every 10 seconds is sufficient)
    const marketStatusInterval = setInterval(() => {
      const isCurrentlyOpen = isMarketOpen();
      
      // If market was open before but is now closed, we've reached end of market day
      if (wasMarketOpen && !isCurrentlyOpen) {
        console.log("MarketPriceUpdater: END OF MARKET DAY DETECTED - running closing price update");
        
        // Critical: Before updating anything, ensure we have a copy of all global stock prices
        const storedPrices = {...assetTracker.globalStockPrices};
        console.log("MarketPriceUpdater: Saved global prices before end-of-day update:", 
          Object.keys(storedPrices).length, "stocks");
        
        // Run the update, which should now preserve prices due to our earlier fixes
        updateAllPrices();
        
        // Force a refresh for all components to ensure UI updates
        setTimeout(() => {
          console.log("MarketPriceUpdater: VERIFYING persistent prices after market close");
          
          // Check if any prices got reset and restore them
          const allStockIds = Object.keys(storedPrices);
          
          // Restore any values that got reset
          allStockIds.forEach(stockId => {
            const oldPrice = storedPrices[stockId];
            const currentPrice = assetTracker.globalStockPrices[stockId];
            
            // Verify prices
            if (!currentPrice && oldPrice) {
              console.log(`MarketPriceUpdater: Restoring lost price for ${stockId}: ${oldPrice}`);
              // Add back to global tracking
              assetTracker.globalStockPrices[stockId] = oldPrice;
            }
          });
          
          // Force an update for all owned assets to ensure everything is in sync
          assetTracker.stocks.forEach(stock => {
            // Get the verified persistent price
            const persistentPrice = assetTracker.globalStockPrices[stock.id] || stock.currentPrice;
            // Force update with the correct price
            assetTracker.updateStock(stock.id, stock.shares, persistentPrice);
          });
          
          // Same for crypto assets - they should be 24/7 but ensure persistence
          // First store all current crypto prices for reference
          const storedCryptoPrices: Record<string, number> = {};
          
          // Get all cryptos tracked anywhere (owned + global tracker)
          const allCryptoIds = new Set<string>([
            ...Object.keys(assetTracker.globalCryptoPrices),
            ...assetTracker.cryptoAssets.map(crypto => crypto.id)
          ]);
          
          // Save all current prices
          Array.from(allCryptoIds).forEach(cryptoId => {
            // Get the current price from any available source
            const currentPrice = 
              assetTracker.globalCryptoPrices[cryptoId] || 
              (assetTracker.cryptoAssets.find(c => c.id === cryptoId)?.currentPrice ?? 0);
            
            if (currentPrice > 0) {
              storedCryptoPrices[cryptoId] = currentPrice;
            }
          });
          
          // Ensure all prices are properly set in global tracker
          Object.entries(storedCryptoPrices).forEach(([cryptoId, price]) => {
            // Ensure this price is in the global tracker
            if (!assetTracker.globalCryptoPrices[cryptoId] || 
                assetTracker.globalCryptoPrices[cryptoId] !== price) {
              console.log(`MarketPriceUpdater: Ensuring crypto ${cryptoId} price in global tracker: ${price}`);
              assetTracker.updateGlobalCryptoPrice(cryptoId, price);
            }
          });
          
          // Update all owned crypto with their correct prices
          assetTracker.cryptoAssets.forEach(crypto => {
            // Use either the stored price or current price
            const persistentPrice = storedCryptoPrices[crypto.id] || crypto.currentPrice;
            assetTracker.updateCrypto(crypto.id, crypto.amount, persistentPrice);
          });
          
          // Force character store to sync with asset tracker
          syncAssetsWithAssetTracker();
          
          // Make sure we recalculate totals after all these updates
          assetTracker.recalculateTotals();
          
          console.log("MarketPriceUpdater: Completed end-of-day market price update with persistence checks");
        }, 250);
      }
      
      // Update tracking state for next check
      wasMarketOpen = isCurrentlyOpen;
    }, 10000); // Check every 10 seconds - we only need to detect the close, not update continuously
    
    // Additionally, subscribe to game time changes to update prices 
    // when crossing from before market hours to during, or during to after
    const unsubscribeTimeProgress = useTime.subscribe(
      (state) => state.timeProgress,
      (newProgress, prevProgress) => {
        // Calculate hours from progress
        const newHour = Math.floor((newProgress / 100) * 24);
        const prevHour = Math.floor((prevProgress / 100) * 24);
        
        // Always update market status on any hour change to keep UI in sync
        const currentMarketOpen = isMarketOpen();
        (window as any).isStockMarketOpen = currentMarketOpen;
        
        // Log the current market status on hour changes 
        console.log(`MarketPriceUpdater: Market now ${currentMarketOpen ? 'OPEN' : 'CLOSED'} (${newHour}:00)`);
        
        // Check if we've crossed any market hour boundaries
        if (
          (newHour >= 9 && prevHour < 9) || // Market opening
          (newHour >= 16 && prevHour < 16)   // Market closing
        ) {
          console.log(`MarketPriceUpdater: Market hours boundary crossed (${prevHour}:00 -> ${newHour}:00), updating prices`);
          
          // For market closing transition specifically, preserve prices
          if (newHour >= 16 && prevHour < 16) {
            // Same approach as the end-of-day handler for consistency
            const storedStockPrices = {...assetTracker.globalStockPrices};
            const storedCryptoPrices = {...assetTracker.globalCryptoPrices};
            
            console.log("MarketPriceUpdater: Saved global prices before market hours boundary update:", 
              Object.keys(storedStockPrices).length, "stocks,", 
              Object.keys(storedCryptoPrices).length, "crypto assets");
            
            // Run the update with our improved persistence logic
            updateAllPrices();
            
            // Double-check persistence
            setTimeout(() => {
              // Verify all stock prices are still tracked
              Object.keys(storedStockPrices).forEach(stockId => {
                if (!assetTracker.globalStockPrices[stockId] && storedStockPrices[stockId]) {
                  console.log(`MarketPriceUpdater: Restoring price for stock ${stockId} after market close`);
                  assetTracker.updateGlobalStockPrice(stockId, storedStockPrices[stockId]);
                }
              });
              
              // Also check crypto prices (though they update 24/7, good to verify)
              Object.keys(storedCryptoPrices).forEach(cryptoId => {
                if (!assetTracker.globalCryptoPrices[cryptoId] && storedCryptoPrices[cryptoId]) {
                  console.log(`MarketPriceUpdater: Restoring price for crypto ${cryptoId} after market hours change`);
                  assetTracker.updateGlobalCryptoPrice(cryptoId, storedCryptoPrices[cryptoId]);
                }
              });
              
              // Force sync with character store
              syncAssetsWithAssetTracker();
            }, 250);
          } else {
            // Just a normal market opening, run the update
            updateAllPrices();
          }
        }
      }
    );
    
    // Also subscribe to date changes to handle weekend transitions
    const unsubscribeDay = useTime.subscribe(
      (state) => state.currentDay,
      (newDay) => {
        // Check if it's a weekend/weekday and update market status
        const gameDate = new Date();
        gameDate.setFullYear(useTime.getState().currentYear);
        gameDate.setMonth(useTime.getState().currentMonth - 1);
        gameDate.setDate(newDay);
        
        const dayOfWeek = gameDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const newMarketOpen = isMarketOpen();
        
        // Update global market status variable on day change
        (window as any).isStockMarketOpen = newMarketOpen;
        
        console.log(`MarketPriceUpdater: Day changed to ${isWeekend ? 'WEEKEND' : 'WEEKDAY'}, market ${newMarketOpen ? 'OPEN' : 'CLOSED'}`);
        
        // Preserve prices on day transitions, especially important for weekend boundaries
        // Save both stock and crypto prices
        const storedStockPrices = {...assetTracker.globalStockPrices};
        const storedCryptoPrices = {...assetTracker.globalCryptoPrices};
        
        console.log("MarketPriceUpdater: Saved global prices before day change update:", 
          Object.keys(storedStockPrices).length, "stocks,",
          Object.keys(storedCryptoPrices).length, "crypto assets");
        
        // Run the update with our improved persistence logic
        updateAllPrices();
        
        // For weekend boundaries especially, verify price persistence
        if (isWeekend) {
          setTimeout(() => {
            // Make sure stock price persistence is maintained
            Object.keys(storedStockPrices).forEach(stockId => {
              if (!assetTracker.globalStockPrices[stockId] && storedStockPrices[stockId]) {
                console.log(`MarketPriceUpdater: Restoring price for stock ${stockId} after weekend transition`);
                assetTracker.updateGlobalStockPrice(stockId, storedStockPrices[stockId]);
              }
            });
            
            // Also ensure crypto price persistence across day boundaries
            Object.keys(storedCryptoPrices).forEach(cryptoId => {
              if (!assetTracker.globalCryptoPrices[cryptoId] && storedCryptoPrices[cryptoId]) {
                console.log(`MarketPriceUpdater: Restoring price for crypto ${cryptoId} after weekend transition`);
                assetTracker.updateGlobalCryptoPrice(cryptoId, storedCryptoPrices[cryptoId]);
              }
            });
            
            // Force sync with character store
            syncAssetsWithAssetTracker();
          }, 250);
        }
      }
    );
    
    // Clean up the intervals and subscriptions when component unmounts
    return () => {
      console.log("MarketPriceUpdater: Cleaning up price update intervals and subscriptions");
      clearInterval(cryptoUpdateInterval);
      clearInterval(marketStatusInterval);
      unsubscribeTimeProgress();
      unsubscribeDay();
    };
  }, [updateAllPrices]);
  
  // This component doesn't render anything - it just runs in the background
  return null;
}