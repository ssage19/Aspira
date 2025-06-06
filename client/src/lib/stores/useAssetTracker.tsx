import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { registerStore } from '../utils/storeRegistry';
import { WealthTier, getCurrentWealthTier, wealthTiers } from '../data/wealthTiers';
import { getTotalOwnershipValue } from '../utils/ownershipUtils';

// Storage key for the asset tracker store
export const ASSET_TRACKER_STORAGE_KEY = 'business-empire-asset-tracker';

/**
 * Interface for tracking all player assets consistently
 */
export interface AssetTrackerState {
  // Cash assets
  cash: number;
  
  // Global stock price tracking - all stocks regardless of ownership
  globalStockPrices: {
    [stockId: string]: number; // Maps stock IDs to current prices
  };
  
  // Global crypto price tracking - all crypto assets regardless of ownership
  globalCryptoPrices: {
    [cryptoId: string]: number; // Maps crypto IDs to current prices
  };
  
  // Investment assets
  stocks: {
    id: string;
    name: string;
    shares: number;
    purchasePrice: number;
    currentPrice: number;
    totalValue: number;
  }[];
  
  cryptoAssets: {
    id: string;
    name: string;
    amount: number;
    purchasePrice: number;
    currentPrice: number;
    totalValue: number;
  }[];
  
  bonds: {
    id: string;
    name: string;
    amount: number;
    purchasePrice: number;
    maturityValue: number;
    maturityDate: Date | string;
    totalValue: number;
  }[];
  
  otherInvestments: {
    id: string;
    name: string;
    amount: number;
    purchasePrice: number;
    currentValue: number;
    investmentAmount?: number; // For startup investments
  }[];
  
  // Property assets
  properties: {
    id: string;
    name: string;
    purchasePrice: number;
    currentValue: number;
    mortgage: number;
    equity: number;
    purchaseDate?: string;
    purchaseTimestamp?: number;
    holdingPeriodInDays?: number;
  }[];
  
  // Lifestyle assets
  lifestyleItems: {
    id: string;
    name: string;
    category: string;
    type?: string;
    purchaseDate?: string;
    purchasePrice: number;
    currentValue: number;
  }[];
  
  // Summary values (calculated)
  totalCash: number;
  totalStocks: number;
  totalCrypto: number;
  totalBonds: number;
  totalOtherInvestments: number;
  totalPropertyValue: number;
  totalPropertyDebt: number;
  totalPropertyEquity: number;
  totalLifestyleValue: number;
  totalNetWorth: number;
  
  // Wealth tier tracking
  currentWealthTier: WealthTier;
  
  // The version/timestamp of this data
  lastUpdated: number;
  
  // Functions to update assets
  updateCash: (amount: number) => void;
  
  // Global stock price tracking functions
  updateGlobalStockPrice: (stockId: string, price: number) => void;
  updateGlobalStockPrices: (priceUpdates: { [stockId: string]: number }) => void;
  
  // Global crypto price tracking functions
  updateGlobalCryptoPrice: (cryptoId: string, price: number) => void;
  updateGlobalCryptoPrices: (priceUpdates: { [cryptoId: string]: number }) => void;
  
  // Stock functions
  addStock: (stock: Omit<AssetTrackerState['stocks'][0], 'totalValue'>) => void;
  updateStock: (id: string, shares: number, currentPrice: number) => void;
  removeStock: (id: string) => void;
  
  // Crypto functions
  addCrypto: (crypto: Omit<AssetTrackerState['cryptoAssets'][0], 'totalValue'>) => void;
  updateCrypto: (id: string, amount: number, currentPrice: number) => void;
  removeCrypto: (id: string) => void;
  
  // Bond functions
  addBond: (bond: Omit<AssetTrackerState['bonds'][0], 'totalValue'>) => void;
  updateBond: (id: string, amount: number, currentValue: number) => void;
  removeBond: (id: string) => void;
  
  // Other investment functions
  addOtherInvestment: (investment: AssetTrackerState['otherInvestments'][0]) => void;
  updateOtherInvestment: (id: string, currentValue: number) => void;
  removeOtherInvestment: (id: string) => void;
  
  // Property functions
  addProperty: (property: Omit<AssetTrackerState['properties'][0], 'equity'>) => void;
  updateProperty: (id: string, currentValue: number, mortgage: number) => void;
  removeProperty: (id: string) => void;
  
  // Lifestyle item functions
  addLifestyleItem: (item: AssetTrackerState['lifestyleItems'][0]) => void;
  updateLifestyleItem: (id: string, currentValue: number) => void;
  removeLifestyleItem: (id: string) => void;
  
  // Core functions
  recalculateTotals: () => void;
  resetAssetTracker: () => void;
  forceUpdate: () => void;
  getNetWorthBreakdown: () => {
    cash: number;
    stocks: number;
    crypto: number;
    bonds: number;
    otherInvestments: number;
    propertyEquity: number;
    propertyValue: number;
    propertyDebt: number;
    lifestyleItems: number;
    ownershipAssets: number; // Ownership assets (Formula 1, horses, sports teams, businesses)
    total: number;
    version: number;
  };
  
  // Get current price for any asset by ID
  getAssetPrice: (id: string) => number;
}

// Initial state
const initialState: Omit<AssetTrackerState, 
  | 'updateCash' 
  | 'addStock' | 'updateStock' | 'removeStock' 
  | 'addCrypto' | 'updateCrypto' | 'removeCrypto'
  | 'addBond' | 'updateBond' | 'removeBond'
  | 'addOtherInvestment' | 'updateOtherInvestment' | 'removeOtherInvestment'
  | 'addProperty' | 'updateProperty' | 'removeProperty'
  | 'addLifestyleItem' | 'updateLifestyleItem' | 'removeLifestyleItem'
  | 'recalculateTotals' | 'resetAssetTracker' | 'forceUpdate' | 'getNetWorthBreakdown' | 'getAssetPrice'
  | 'updateGlobalStockPrice' | 'updateGlobalStockPrices'
  | 'updateGlobalCryptoPrice' | 'updateGlobalCryptoPrices'
> = {
  cash: 10000, // Default starting cash
  globalStockPrices: {}, // Initialize empty global stock price tracking
  globalCryptoPrices: {}, // Initialize empty global crypto price tracking
  stocks: [],
  cryptoAssets: [],
  bonds: [],
  otherInvestments: [],
  properties: [],
  lifestyleItems: [],
  
  // Default calculated values
  totalCash: 10000,
  totalStocks: 0,
  totalCrypto: 0,
  totalBonds: 0,
  totalOtherInvestments: 0,
  totalPropertyValue: 0,
  totalPropertyDebt: 0,
  totalPropertyEquity: 0,
  totalLifestyleValue: 0,
  totalNetWorth: 10000,
  
  // Initialize with the beginner wealth tier
  currentWealthTier: wealthTiers[0],
  
  // Version tracking
  lastUpdated: Date.now(),
};

/**
 * A dedicated store for tracking all player assets in a consistent way
 * This store ensures that net worth calculations are always accurate
 * and that all components have access to the same asset data
 */
export const useAssetTracker = create<AssetTrackerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Cash updates
      updateCash: (amount: number) => {
        set((state) => {
          // Convert to truncated decimal to avoid floating-point precision issues
          const newCash = parseFloat(amount.toFixed(1));
          
          return {
            cash: newCash,
            totalCash: newCash,
            lastUpdated: Date.now(),
          };
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      // Stock functions
      addStock: (stock) => {
        set((state) => {
          // Calculate total value
          const totalValue = stock.shares * stock.currentPrice;
          
          // Check if the stock already exists
          const existingStockIndex = state.stocks.findIndex(s => s.id === stock.id);
          
          if (existingStockIndex >= 0) {
            // Update existing stock
            const updatedStocks = [...state.stocks];
            const existingStock = updatedStocks[existingStockIndex];
            
            updatedStocks[existingStockIndex] = {
              ...existingStock,
              shares: existingStock.shares + stock.shares,
              totalValue: existingStock.totalValue + totalValue,
            };
            
            return {
              stocks: updatedStocks,
              lastUpdated: Date.now(),
            };
          } else {
            // Add new stock
            return {
              stocks: [
                ...state.stocks,
                {
                  ...stock,
                  totalValue,
                }
              ],
              lastUpdated: Date.now(),
            };
          }
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      updateStock: (id, shares, currentPrice) => {
        // Check if market is open (weekday during market hours) before updating prices
        // Use global market open function if available
        let marketOpen = false;
        
        if (typeof window !== 'undefined' && (window as any).isMarketOpen) {
          marketOpen = (window as any).isMarketOpen();
        } else {
          // Fallback if global function isn't available
          // First check if it's a weekday (Mon-Fri)
          const now = new Date();
          const dayOfWeek = now.getDay();
          const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // 1-5 is Monday-Friday
          
          // Then check if it's during market hours (9am-4pm)
          const hour = now.getHours();
          const isDuringMarketHours = hour >= 9 && hour < 16;
          
          marketOpen = isWeekday && isDuringMarketHours;
        }
        
        // If market is closed, we shouldn't update the stock price
        if (!marketOpen) {
          console.log(`Market closed - Not updating price for stock ${id}`);
          
          // Only update share count if needed, don't change the price
          set((state) => {
            const updatedStocks = state.stocks.map(stock => {
              if (stock.id === id) {
                return {
                  ...stock,
                  shares, // Update shares only
                  totalValue: shares * stock.currentPrice, // Keep existing price
                };
              }
              return stock;
            });
            
            return {
              stocks: updatedStocks,
              lastUpdated: Date.now(),
            };
          });
        } else {
          // Market is open - update both shares and price
          set((state) => {
            const updatedStocks = state.stocks.map(stock => {
              if (stock.id === id) {
                return {
                  ...stock,
                  shares,
                  currentPrice,
                  totalValue: shares * currentPrice,
                };
              }
              return stock;
            });
            
            return {
              stocks: updatedStocks,
              lastUpdated: Date.now(),
            };
          });
        }
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      removeStock: (id) => {
        set((state) => ({
          stocks: state.stocks.filter(stock => stock.id !== id),
          lastUpdated: Date.now(),
        }));
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      // Crypto functions
      addCrypto: (crypto) => {
        set((state) => {
          // Calculate total value
          const totalValue = crypto.amount * crypto.currentPrice;
          
          // Check if the crypto already exists
          const existingCryptoIndex = state.cryptoAssets.findIndex(c => c.id === crypto.id);
          
          if (existingCryptoIndex >= 0) {
            // Update existing crypto
            const updatedCrypto = [...state.cryptoAssets];
            const existingCrypto = updatedCrypto[existingCryptoIndex];
            
            updatedCrypto[existingCryptoIndex] = {
              ...existingCrypto,
              amount: existingCrypto.amount + crypto.amount,
              totalValue: existingCrypto.totalValue + totalValue,
            };
            
            return {
              cryptoAssets: updatedCrypto,
              lastUpdated: Date.now(),
            };
          } else {
            // Add new crypto
            return {
              cryptoAssets: [
                ...state.cryptoAssets,
                {
                  ...crypto,
                  totalValue,
                }
              ],
              lastUpdated: Date.now(),
            };
          }
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      updateCrypto: (id, amount, currentPrice) => {
        // Skip update if amount is 0 or price is invalid
        if (amount <= 0 || currentPrice <= 0) {
          return;
        }
        
        // Get current state to check if we're actually changing anything
        const currentState = get();
        const existingCrypto = currentState.cryptoAssets.find(c => c.id === id);
        
        // If no change is needed, skip the update entirely to prevent loops
        if (existingCrypto && 
            existingCrypto.amount === amount && 
            existingCrypto.currentPrice === currentPrice) {
          return;
        }
        
        // Perform the update and include total recalculation in a single state update
        set((state) => {
          const updatedCrypto = state.cryptoAssets.map(crypto => {
            if (crypto.id === id) {
              return {
                ...crypto,
                amount,
                currentPrice,
                totalValue: amount * currentPrice,
              };
            }
            return crypto;
          });
          
          // Calculate new crypto total in the same update
          const totalCryptoValue = updatedCrypto.reduce(
            (total, crypto) => total + crypto.amount * crypto.currentPrice, 
            0
          );
          
          return {
            cryptoAssets: updatedCrypto,
            totalCryptoValue,
            lastUpdated: Date.now(),
          };
        });
      },
      
      removeCrypto: (id) => {
        set((state) => ({
          cryptoAssets: state.cryptoAssets.filter(crypto => crypto.id !== id),
          lastUpdated: Date.now(),
        }));
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      // Bond functions
      addBond: (bond) => {
        set((state) => {
          // For simplicity, we'll use a linear model for bond value calculation
          // In reality, bonds would use more complex present value calculations
          const totalValue = bond.amount * bond.purchasePrice;
          
          // Check if the bond already exists
          const existingBondIndex = state.bonds.findIndex(b => b.id === bond.id);
          
          if (existingBondIndex >= 0) {
            // Update existing bond
            const updatedBonds = [...state.bonds];
            const existingBond = updatedBonds[existingBondIndex];
            
            updatedBonds[existingBondIndex] = {
              ...existingBond,
              amount: existingBond.amount + bond.amount,
              totalValue: existingBond.totalValue + totalValue,
            };
            
            return {
              bonds: updatedBonds,
              lastUpdated: Date.now(),
            };
          } else {
            // Add new bond
            return {
              bonds: [
                ...state.bonds,
                {
                  ...bond,
                  totalValue,
                }
              ],
              lastUpdated: Date.now(),
            };
          }
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      updateBond: (id, amount, currentValue) => {
        set((state) => {
          const updatedBonds = state.bonds.map(bond => {
            if (bond.id === id) {
              return {
                ...bond,
                amount,
                totalValue: currentValue, // For bonds, we directly set the total value
              };
            }
            return bond;
          });
          
          return {
            bonds: updatedBonds,
            lastUpdated: Date.now(),
          };
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      removeBond: (id) => {
        set((state) => ({
          bonds: state.bonds.filter(bond => bond.id !== id),
          lastUpdated: Date.now(),
        }));
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      // Other investment functions
      addOtherInvestment: (investment) => {
        set((state) => ({
          otherInvestments: [...state.otherInvestments, investment],
          lastUpdated: Date.now(),
        }));
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      updateOtherInvestment: (id, currentValue) => {
        set((state) => {
          const updatedInvestments = state.otherInvestments.map(investment => {
            if (investment.id === id) {
              return {
                ...investment,
                currentValue,
              };
            }
            return investment;
          });
          
          return {
            otherInvestments: updatedInvestments,
            lastUpdated: Date.now(),
          };
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      removeOtherInvestment: (id) => {
        set((state) => ({
          otherInvestments: state.otherInvestments.filter(investment => investment.id !== id),
          lastUpdated: Date.now(),
        }));
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      // Property functions
      addProperty: (property) => {
        set((state) => {
          // Calculate equity
          const equity = property.currentValue - property.mortgage;
          
          return {
            properties: [
              ...state.properties,
              {
                ...property,
                equity,
              }
            ],
            lastUpdated: Date.now(),
          };
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      updateProperty: (id, currentValue, mortgage) => {
        set((state) => {
          // Find the existing property to log changes
          const existingProperty = state.properties.find(p => p.id === id);
          
          if (existingProperty) {
            // Calculate old equity and new equity
            const oldEquity = existingProperty.currentValue - existingProperty.mortgage;
            const newEquity = currentValue - mortgage;
            const equityChange = newEquity - oldEquity;
            
            // Log detailed property update for debugging
            console.log(`AssetTracker: Updating property ${existingProperty.name} (${id})`);
            console.log(`  Value: ${existingProperty.currentValue.toFixed(2)} → ${currentValue.toFixed(2)}`);
            console.log(`  Mortgage: ${existingProperty.mortgage.toFixed(2)} → ${mortgage.toFixed(2)}`);
            console.log(`  Equity: ${oldEquity.toFixed(2)} → ${newEquity.toFixed(2)} (${equityChange >= 0 ? '+' : ''}${equityChange.toFixed(2)})`);
            
            // Check for unrealistic changes
            const valueChangePercent = ((currentValue - existingProperty.currentValue) / existingProperty.currentValue) * 100;
            if (Math.abs(valueChangePercent) > 5) {
              console.warn(`WARNING: Large property value change detected (${valueChangePercent.toFixed(2)}%)`);
            }
          }
          
          const updatedProperties = state.properties.map(property => {
            if (property.id === id) {
              const equity = currentValue - mortgage;
              
              return {
                ...property,
                currentValue,
                mortgage,
                equity,
              };
            }
            return property;
          });
          
          return {
            properties: updatedProperties,
            lastUpdated: Date.now(),
          };
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      removeProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter(property => property.id !== id),
          lastUpdated: Date.now(),
        }));
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      // Lifestyle item functions
      addLifestyleItem: (item) => {
        set((state) => ({
          lifestyleItems: [...state.lifestyleItems, item],
          lastUpdated: Date.now(),
        }));
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      updateLifestyleItem: (id, currentValue) => {
        set((state) => {
          const updatedItems = state.lifestyleItems.map(item => {
            if (item.id === id) {
              return {
                ...item,
                currentValue,
              };
            }
            return item;
          });
          
          return {
            lifestyleItems: updatedItems,
            lastUpdated: Date.now(),
          };
        });
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      removeLifestyleItem: (id) => {
        set((state) => ({
          lifestyleItems: state.lifestyleItems.filter(item => item.id !== id),
          lastUpdated: Date.now(),
        }));
        
        // Recalculate totals after update
        get().recalculateTotals();
      },
      
      // Global stock price tracking functions
      updateGlobalStockPrice: (stockId: string, currentPrice: number) => {
        set((state) => {
          // Create a copy of the current global stock prices
          const updatedPrices = { ...state.globalStockPrices };
          
          // Update the price for this specific stock
          updatedPrices[stockId] = currentPrice;
          
          return {
            globalStockPrices: updatedPrices,
            lastUpdated: Date.now(),
          };
        });
        
        // Update any owned stock in portfolio to match global price
        const state = get();
        const ownedStock = state.stocks.find(stock => stock.id === stockId);
        
        if (ownedStock) {
          // If the player owns this stock, update its price too
          get().updateStock(stockId, ownedStock.shares, currentPrice);
        }
      },
      
      // Batch update global stock prices
      updateGlobalStockPrices: (priceUpdates: { [stockId: string]: number }) => {
        set((state) => {
          // Create a copy of the current global stock prices
          const updatedPrices = { ...state.globalStockPrices };
          
          // Apply all price updates
          Object.entries(priceUpdates).forEach(([stockId, price]) => {
            updatedPrices[stockId] = price;
          });
          
          return {
            globalStockPrices: updatedPrices,
            lastUpdated: Date.now(),
          };
        });
        
        // Update any owned stocks in the portfolio to match global prices
        const state = get();
        
        // For each stock in the player's portfolio, check if it has a new price
        state.stocks.forEach(stock => {
          const newPrice = priceUpdates[stock.id];
          if (newPrice !== undefined) {
            // If there's a new price, update the stock
            get().updateStock(stock.id, stock.shares, newPrice);
          }
        });
      },
      
      // Global crypto price tracking functions
      updateGlobalCryptoPrice: (cryptoId: string, currentPrice: number) => {
        // First check if we need to update at all (avoid unnecessary updates)
        const state = get();
        
        // Skip update if price hasn't actually changed to prevent infinite loops
        if (state.globalCryptoPrices && state.globalCryptoPrices[cryptoId] === currentPrice) {
          return;
        }
        
        // If there's an owned crypto, update everything in a single state update
        const ownedCrypto = state.cryptoAssets.find(crypto => crypto.id === cryptoId);
        
        if (ownedCrypto) {
          // Update both global price and owned crypto in one state update
          set((state) => {
            // Create copy of the current global crypto prices
            const updatedPrices = { ...state.globalCryptoPrices };
            updatedPrices[cryptoId] = currentPrice;
            
            // Create updated crypto assets array
            const updatedCryptoAssets = state.cryptoAssets.map(crypto => {
              if (crypto.id === cryptoId) {
                return {
                  ...crypto,
                  currentPrice,
                  totalValue: crypto.amount * currentPrice
                };
              }
              return crypto;
            });
            
            // Calculate new total crypto value
            const totalCrypto = updatedCryptoAssets.reduce(
              (total, crypto) => total + crypto.amount * crypto.currentPrice, 0
            );
            
            // Return single state update with all changes
            return {
              globalCryptoPrices: updatedPrices,
              cryptoAssets: updatedCryptoAssets,
              totalCrypto,
              lastUpdated: Date.now()
            };
          });
        } else {
          // No owned crypto, just update the global price
          set((state) => {
            const updatedPrices = { ...state.globalCryptoPrices };
            updatedPrices[cryptoId] = currentPrice;
            
            return {
              globalCryptoPrices: updatedPrices,
              lastUpdated: Date.now()
            };
          });
        }
      },
      
      // Batch update global crypto prices
      updateGlobalCryptoPrices: (priceUpdates: { [cryptoId: string]: number }) => {
        // Check if there's anything to update
        if (!priceUpdates || Object.keys(priceUpdates).length === 0) {
          return;
        }
        
        // Get current state once to avoid multiple state reads
        const currentState = get();
        
        // Check if we need to update anything by comparing with current prices
        // This prevents unnecessary state updates that can cause infinite loops
        let hasChanges = false;
        for (const [cryptoId, newPrice] of Object.entries(priceUpdates)) {
          const currentPrice = currentState.globalCryptoPrices[cryptoId];
          if (currentPrice !== newPrice) {
            hasChanges = true;
            break;
          }
        }
        
        // Skip the update if no prices are actually changing
        if (!hasChanges) {
          console.log("AssetTracker: Skipping crypto price update - no price changes detected");
          return;
        }
        
        // Build updated state objects
        const updatedCryptoAssets = [...currentState.cryptoAssets];
        const updatedPrices = { ...currentState.globalCryptoPrices };
        
        // Apply all price updates to global prices object
        Object.entries(priceUpdates).forEach(([cryptoId, price]) => {
          // Skip invalid prices
          if (typeof price !== 'number' || price <= 0) {
            return;
          }
          
          updatedPrices[cryptoId] = price;
          
          // Also update owned assets in the same pass if needed
          const cryptoIndex = updatedCryptoAssets.findIndex(c => c.id === cryptoId);
          if (cryptoIndex >= 0) {
            const crypto = updatedCryptoAssets[cryptoIndex];
            updatedCryptoAssets[cryptoIndex] = {
              ...crypto,
              currentPrice: price,
              totalValue: crypto.amount * price
            };
          }
        });
        
        // Calculate crypto total value
        const totalCryptoValue = updatedCryptoAssets.reduce(
          (total, crypto) => total + crypto.amount * crypto.currentPrice, 
          0
        );
        
        // Update state once with all changes
        set({
          globalCryptoPrices: updatedPrices,
          cryptoAssets: updatedCryptoAssets,
          totalCrypto: totalCryptoValue,
          lastUpdated: Date.now(),
        });
      },
      

      
      // Recalculate all totals
      recalculateTotals: () => {
        const state = get();
        
        // Calculate individual totals
        const totalStocks = state.stocks.reduce((acc, stock) => acc + stock.totalValue, 0);
        const totalCrypto = state.cryptoAssets.reduce((acc, crypto) => acc + crypto.totalValue, 0);
        const totalBonds = state.bonds.reduce((acc, bond) => acc + bond.totalValue, 0);
        const totalOtherInvestments = state.otherInvestments.reduce((acc, inv) => acc + inv.currentValue, 0);
        const totalPropertyValue = state.properties.reduce((acc, property) => acc + property.currentValue, 0);
        const totalPropertyDebt = state.properties.reduce((acc, property) => acc + property.mortgage, 0);
        const totalPropertyEquity = state.properties.reduce((acc, property) => acc + property.equity, 0);
        const totalLifestyleValue = state.lifestyleItems.reduce((acc, item) => acc + item.currentValue, 0);
        
        // Get ownership assets (Formula 1, Horse Racing, Sports Teams, Businesses)
        // Use the imported helper function rather than dynamic require
        const totalOwnershipValue = getTotalOwnershipValue();
        console.log(`Asset Tracker: Including ownership assets: $${totalOwnershipValue.toLocaleString()}`);
        
        // Calculate total net worth
        const totalNetWorth = 
          state.cash + 
          totalStocks + 
          totalCrypto + 
          totalBonds + 
          totalOtherInvestments + 
          totalPropertyEquity +
          totalLifestyleValue +
          totalOwnershipValue;
        
        // Update wealth tier based on current net worth
        const currentWealthTier = getCurrentWealthTier(totalNetWorth);
        const previousTier = state.currentWealthTier;
        
        // Check if the wealth tier has changed to a higher tier
        if (previousTier && currentWealthTier.id !== previousTier.id && 
            currentWealthTier.minNetWorth > previousTier.minNetWorth) {
          // Only show tier up notification if this isn't the first load
          if (state.lastUpdated > 0 && typeof window !== 'undefined') {
            // We've advanced to a new tier! Show a toast notification
            try {
              // Try to access toast from window context (if available)
              const toast = (window as any)?.toast;
              if (toast) {
                toast({
                  title: "Wealth Tier Increased!",
                  description: `Congratulations! You've reached the ${currentWealthTier.name} tier.`,
                  duration: 5000
                });
              } else {
                // Fallback
                console.log(`Wealth tier increased to ${currentWealthTier.name}!`);
              }
            } catch (e) {
              // Fallback if toast is not available
              console.log(`Wealth tier increased to ${currentWealthTier.name}!`);
            }
          }
        }
        
        set({
          totalCash: state.cash,
          totalStocks,
          totalCrypto,
          totalBonds,
          totalOtherInvestments,
          totalPropertyValue,
          totalPropertyDebt,
          totalPropertyEquity,
          totalLifestyleValue,
          totalNetWorth,
          currentWealthTier,
          lastUpdated: Date.now(),
        });
        
        // Also update the breakdown in localStorage directly
        try {
          // Create the breakdown directly instead of calling getNetWorthBreakdown to avoid circular dependencies
          const breakdown = {
            cash: state.totalCash,
            stocks: totalStocks,
            crypto: totalCrypto,
            bonds: totalBonds,
            otherInvestments: totalOtherInvestments,
            propertyEquity: totalPropertyEquity,
            propertyValue: totalPropertyValue,
            propertyDebt: totalPropertyDebt,
            lifestyleItems: totalLifestyleValue,
            ownershipAssets: totalOwnershipValue, // Include ownership assets
            total: totalNetWorth,
            version: Date.now(),
          };
          localStorage.setItem('business-empire-networth-breakdown', JSON.stringify(breakdown));
        } catch (e) {
          console.error('Error saving net worth breakdown to localStorage:', e);
        }
      },
      
      // Helper method to get asset price by ID (stock, crypto, etc)
      getAssetPrice: (id: string): number => {
        const state = get();
        
        // First check global stock prices
        if (state.globalStockPrices && state.globalStockPrices[id] !== undefined) {
          return state.globalStockPrices[id];
        }
        
        // Check if it's a stock
        const stock = state.stocks.find(s => s.id === id);
        if (stock) return stock.currentPrice;
        
        // Check if it's crypto - note we use cryptoAssets, not crypto
        const crypto = state.cryptoAssets.find(c => c.id === id);
        if (crypto) return crypto.currentPrice;
        
        // Check other investment types
        const otherInv = state.otherInvestments.find(i => i.id === id);
        if (otherInv) return otherInv.currentValue;
        
        // Check property 
        const property = state.properties.find(p => p.id === id);
        if (property) return property.currentValue;
        
        // If we can't find the asset price, log a warning and return 0
        console.warn(`AssetTracker: Could not find price for asset ${id}`);
        return 0;
      },
      
      // Reset the asset tracker to initial state
      resetAssetTracker: () => {
        console.log('AssetTracker: Performing complete reset');
        
        // First notify about what's being reset
        console.log('AssetTracker: Resetting assets...');
        console.log(`- Stocks: ${get().stocks.length} items being reset`);
        console.log(`- Crypto: ${get().cryptoAssets.length} items being reset`);
        console.log(`- Bonds: ${get().bonds.length} items being reset`);
        console.log(`- Other Investments: ${get().otherInvestments.length} items being reset`);
        console.log(`- Properties: ${get().properties.length} items being reset`);
        console.log(`- Lifestyle Items: ${get().lifestyleItems.length} items being reset`);
        
        // 1. First, explicitly clear all asset arrays to ensure we have clean slates
        // Even before setting the initial state, we want to guarantee these arrays are emptied
        try {
          // Direct state updates to clear arrays (won't trigger renders but ensures empty arrays)
          set(state => {
            // Create a fresh state with empty arrays
            return {
              ...state,
              globalStockPrices: {},
              stocks: [],
              cryptoAssets: [],
              bonds: [],
              otherInvestments: [],
              properties: [],
              lifestyleItems: []
            };
          });
          console.log('AssetTracker: Explicitly cleared all asset arrays');
        } catch (arrayClearError) {
          console.error('AssetTracker: Error clearing arrays:', arrayClearError);
        }
        
        // 2. Reset all totals to zero (except cash which should be starting amount)
        try {
          set(state => ({
            ...state,
            totalStocks: 0,
            totalCrypto: 0,
            totalBonds: 0,
            totalOtherInvestments: 0,
            totalPropertyValue: 0,
            totalPropertyDebt: 0,
            totalPropertyEquity: 0,
            totalLifestyleValue: 0
          }));
          console.log('AssetTracker: Reset all total values to zero');
        } catch (totalsError) {
          console.error('AssetTracker: Error resetting totals:', totalsError);
        }
        
        // 3. Manually clear localStorage entries to ensure clean reset
        try {
          console.log('AssetTracker: Clearing localStorage entries');
          
          // Clear all possible related localStorage entries
          const keysToRemove = [
            ASSET_TRACKER_STORAGE_KEY,
            'business-empire-networth-breakdown',
            'business-empire-asset-tracker',
            'business-empire-assets'
          ];
          
          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key);
              console.log(`AssetTracker: Removed ${key} from localStorage`);
            } catch (e) {
              console.error(`AssetTracker: Failed to remove ${key} from localStorage:`, e);
            }
          });
          
          console.log('AssetTracker: localStorage entries cleared');
        } catch (storageError) {
          console.error('AssetTracker: Failed to clear localStorage:', storageError);
        }
        
        // 4. Reset to initial state (the complete reset)
        set({ 
          ...initialState, 
          cash: 10000, // Reset to starting cash value
          totalCash: 10000,
          totalNetWorth: 10000,
          currentWealthTier: wealthTiers[0], // Reset to beginner wealth tier
          lastUpdated: Date.now(),
          // Explicitly set empty arrays again to be absolutely certain
          globalStockPrices: {},
          stocks: [],
          cryptoAssets: [],
          bonds: [],
          otherInvestments: [],
          properties: [],
          lifestyleItems: []
        });
        
        // 5. Force a double verification that everything is cleared
        try {
          // Double check localStorage is clear
          const checkBreakdown = localStorage.getItem('business-empire-networth-breakdown');
          const checkTracker = localStorage.getItem(ASSET_TRACKER_STORAGE_KEY);
          console.log(`AssetTracker: Verified removal - breakdown exists: ${!!checkBreakdown}, tracker exists: ${!!checkTracker}`);
          
          // Double check state is clean
          const state = get();
          const assetCounts = {
            stocks: state.stocks.length,
            crypto: state.cryptoAssets.length,
            bonds: state.bonds.length,
            other: state.otherInvestments.length,
            properties: state.properties.length,
            lifestyle: state.lifestyleItems.length
          };
          
          // Log the verification
          console.log('AssetTracker: Final verification of reset:', assetCounts);
          const allEmpty = Object.values(assetCounts).every(count => count === 0);
          console.log(`AssetTracker: Reset verification ${allEmpty ? 'PASSED ✓' : 'FAILED ✗'}`);
          
          if (!allEmpty) {
            console.error('AssetTracker: CRITICAL ERROR - Reset did not clear all assets!');
            // One final attempt to force-clear everything
            set(state => ({
              ...state,
              globalStockPrices: {},
              stocks: [],
              cryptoAssets: [],
              bonds: [],
              otherInvestments: [],
              properties: [],
              lifestyleItems: []
            }));
          }
        } catch (e) {
          console.error('AssetTracker: Error during verification:', e);
        }
      },
      
      // Force an update (useful to trigger a state update without changing values)
      forceUpdate: () => {
        set({ lastUpdated: Date.now() });
      },
      
      // Get a formatted net worth breakdown for components to use
      getNetWorthBreakdown: () => {
        const state = get();
        
        // Get ownership assets value
        const ownershipValue = getTotalOwnershipValue();
        
        // Return the current state values without recalculating
        // This prevents infinite update loops when multiple components
        // access the breakdown simultaneously
        return {
          cash: state.totalCash,
          stocks: state.totalStocks,
          crypto: state.totalCrypto,
          bonds: state.totalBonds,
          otherInvestments: state.totalOtherInvestments,
          propertyEquity: state.totalPropertyEquity,
          propertyValue: state.totalPropertyValue,
          propertyDebt: state.totalPropertyDebt,
          lifestyleItems: state.totalLifestyleValue,
          ownershipAssets: ownershipValue, // Include ownership assets value
          total: state.totalNetWorth,
          version: state.lastUpdated,
        };
      },
    }),
    {
      name: ASSET_TRACKER_STORAGE_KEY,
      // Optional: Add custom serialization/deserialization logic if needed
      partialize: (state) => ({
        // Only persist the data, not the functions
        cash: state.cash,
        globalStockPrices: state.globalStockPrices,
        stocks: state.stocks,
        cryptoAssets: state.cryptoAssets,
        bonds: state.bonds,
        otherInvestments: state.otherInvestments,
        properties: state.properties,
        lifestyleItems: state.lifestyleItems,
        
        // Also persist the calculated totals for quick access
        totalCash: state.totalCash,
        totalStocks: state.totalStocks,
        totalCrypto: state.totalCrypto,
        totalBonds: state.totalBonds,
        totalOtherInvestments: state.totalOtherInvestments,
        totalPropertyValue: state.totalPropertyValue,
        totalPropertyDebt: state.totalPropertyDebt, 
        totalPropertyEquity: state.totalPropertyEquity,
        totalLifestyleValue: state.totalLifestyleValue,
        totalNetWorth: state.totalNetWorth,
        
        // Persist wealth tier
        currentWealthTier: state.currentWealthTier,
        
        // Include version for freshness tracking
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Register with the global store registry
registerStore('assetTracker', useAssetTracker);

export default useAssetTracker;