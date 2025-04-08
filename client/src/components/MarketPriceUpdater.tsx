import { useEffect } from 'react';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useCharacter, Asset, Property } from '../lib/stores/useCharacter';
import { VolatilityLevel } from '../lib/data/investments';
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
  const { assets } = useCharacter();

  // Update all market prices on a regular interval
  useEffect(() => {
    console.log("Market price updater initializing...");
    
    // Function to update all asset prices
    const updateAllPrices = () => {
      console.log("MarketPriceUpdater: Running periodic price update");
      
      // 1. Calculate updated stock prices based on market conditions
      const updatedStockPrices: Record<string, number> = {};
      
      expandedStockMarket.forEach(stock => {
        // Base price influenced by market health and stock volatility
        const volatilityFactor = getVolatilityFactor(stock.volatility);
        const marketFactor = getMarketFactor(marketTrend);
        const timeFactor = Math.sin(currentDay / 30 * Math.PI) * volatilityFactor;
        
        // Calculate new price with some randomness
        let newPrice = stock.basePrice * marketFactor;
        newPrice += newPrice * timeFactor;
        newPrice += newPrice * (Math.random() * volatilityFactor - volatilityFactor/2);
        
        // Ensure price doesn't go too low
        newPrice = Math.max(newPrice, stock.basePrice * 0.1);
        
        updatedStockPrices[stock.id] = parseFloat(newPrice.toFixed(2));
      });
      
      // 2. Update asset tracker with the new prices for owned assets
      syncAssetTrackerStockPrices(updatedStockPrices);
      
      // 3. Update other asset types (future enhancement)
      updateOtherAssetPrices();
    };
    
    // Run the update immediately
    updateAllPrices();
    
    // Then set up an interval to run updates periodically (every 5 seconds)
    const updateInterval = setInterval(updateAllPrices, 5000);
    
    // Clean up the interval when component unmounts
    return () => {
      console.log("MarketPriceUpdater: Cleaning up price update interval");
      clearInterval(updateInterval);
    };
  }, [currentDay, marketTrend, stockMarketHealth, assets]);
  
  // Helper function to get volatility factor based on volatility level
  const getVolatilityFactor = (volatility: string): number => {
    switch (volatility as VolatilityLevel) {
      case 'extreme': return 0.7;
      case 'very_high': return 0.5;
      case 'high': return 0.3;
      case 'medium': return 0.2;
      case 'low': return 0.1;
      case 'very_low': return 0.05;
      default: return 0.05; // Default for unknown volatility
    }
  };
  
  // Helper function to get market factor based on market trend
  const getMarketFactor = (trend: string): number => {
    if (trend === 'bull') return 1.05;
    if (trend === 'bear') return 0.95;
    return 1.0; // stable
  };
  
  // Function to update asset tracker stock prices
  const syncAssetTrackerStockPrices = (prices: Record<string, number>) => {
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
        
        console.log(`MarketPriceUpdater: Updated ${stock.name} price to $${currentPrice.toFixed(2)}`);
      }
    });
  };
  
  // Function to update other asset types (crypto, property values, etc.)
  const updateOtherAssetPrices = () => {
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
  };
  
  // Occasional updates to lifestyle item values (very low volatility)
  const updateLifestyleItems = () => {
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
  };
  
  // Update crypto asset prices
  const updateCryptoAssets = () => {
    // Get all owned crypto from character assets
    const ownedCrypto = assets.filter(asset => asset.type === 'crypto');
    
    if (ownedCrypto.length === 0) return;
    
    console.log("MarketPriceUpdater: Updating", ownedCrypto.length, "crypto assets");
    
    // For each owned crypto, update its price with some randomness and market influence
    ownedCrypto.forEach(crypto => {
      if (!crypto || crypto.quantity <= 0) return;
      
      // Higher volatility for crypto compared to stocks
      const volatilityFactor = 0.8; // Crypto is highly volatile
      const marketInfluence = marketTrend === 'bull' ? 1.08 : marketTrend === 'bear' ? 0.92 : 1;
      
      // Calculate price change with randomness
      const basePrice = crypto.purchasePrice;
      const randomFactor = (Math.random() * volatilityFactor * 2) - volatilityFactor;
      const newPrice = basePrice * marketInfluence * (1 + randomFactor);
      
      // Ensure price doesn't go too low
      const finalPrice = Math.max(newPrice, basePrice * 0.2);
      
      // Update the asset tracker
      assetTracker.updateCrypto(crypto.id, crypto.quantity, parseFloat(finalPrice.toFixed(2)));
      
      console.log(`MarketPriceUpdater: Updated ${crypto.name} price to $${finalPrice.toFixed(2)}`);
    });
  };
  
  // Update bond prices (bonds are more stable but still affected by interest rates)
  const updateBonds = () => {
    // Get all owned bonds
    const ownedBonds = assets.filter(asset => asset.type === 'bond');
    
    if (ownedBonds.length === 0) return;
    
    console.log("MarketPriceUpdater: Updating", ownedBonds.length, "bonds");
    
    // Bonds are affected by market trends but much less than stocks
    const marketInfluence = marketTrend === 'bull' ? 1.01 : marketTrend === 'bear' ? 0.99 : 1;
    
    ownedBonds.forEach(bond => {
      if (!bond || bond.quantity <= 0) return;
      
      // Bonds are very stable, small random fluctuation
      const volatilityFactor = 0.02;
      const randomFactor = (Math.random() * volatilityFactor * 2) - volatilityFactor;
      
      // Calculate new price - use maturityValue if available, otherwise use purchasePrice
      const extendedBond = bond as ExtendedAsset;
      const baseValue = extendedBond.maturityValue || bond.purchasePrice;
      const newPrice = baseValue * marketInfluence * (1 + randomFactor);
      
      // Update the bond in the asset tracker
      assetTracker.updateBond(bond.id, bond.quantity, parseFloat(newPrice.toFixed(2)));
      
      console.log(`MarketPriceUpdater: Updated ${bond.name} price to $${newPrice.toFixed(2)}`);
    });
  };
  
  // Update other investment types
  const updateOtherInvestments = () => {
    // Get all other investments - only those of type "other"
    const otherInvestments = assets.filter(asset => asset.type === 'other');
    
    if (otherInvestments.length === 0) return;
    
    console.log("MarketPriceUpdater: Updating", otherInvestments.length, "other investments");
    
    // Different investment types have different volatility profiles
    otherInvestments.forEach(investment => {
      if (!investment || investment.quantity <= 0) return;
      
      // Default moderate volatility
      const volatilityFactor = 0.15;
      const marketInfluence = marketTrend === 'bull' ? 1.03 : marketTrend === 'bear' ? 0.97 : 1;
      
      // Calculate new price with some randomness
      const basePrice = investment.purchasePrice;
      const randomFactor = (Math.random() * volatilityFactor * 2) - volatilityFactor;
      const newPrice = basePrice * marketInfluence * (1 + randomFactor);
      
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
  };
  
  // Occasionally update property values (real estate changes more slowly)
  const updatePropertyValues = () => {
    // Only update property values occasionally (10% chance per update)
    if (Math.random() > 0.1) return;
    
    // Get properties directly from character state
    const { properties } = useCharacter.getState();
    
    if (!properties || properties.length === 0) return;
    
    console.log("MarketPriceUpdater: Updating", properties.length, "property values");
    
    // Real estate market is affected by overall market but moves more slowly
    const marketInfluence = marketTrend === 'bull' ? 1.01 : marketTrend === 'bear' ? 0.995 : 1.002;
    
    properties.forEach(property => {
      if (!property) return;
      
      // Cast to PropertyWithLoan to access the specific property fields
      const propertyWithLoan = property as PropertyWithLoan;
      
      // Properties have low volatility
      const volatilityFactor = 0.02;
      const randomFactor = (Math.random() * volatilityFactor * 2) - volatilityFactor;
      
      // Calculate new property value with small adjustment
      const currentPropertyValue = propertyWithLoan.currentValue || property.purchasePrice;
      const newValue = currentPropertyValue * marketInfluence * (1 + randomFactor);
      const formattedValue = parseFloat(newValue.toFixed(2));
      
      // Update the property value in asset tracker
      if (assetTracker.updateProperty) {
        assetTracker.updateProperty(
          property.id,
          formattedValue,
          propertyWithLoan.loanAmount || 0
        );
        
        console.log(`MarketPriceUpdater: Updated ${property.name} value to $${formattedValue.toFixed(2)}`);
      }
    });
  };
  
  // This component doesn't render anything - it just runs in the background
  return null;
}