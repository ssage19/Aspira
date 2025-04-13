import React, { useState, useEffect, useMemo } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import { useAudio } from '../lib/stores/useAudio';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../lib/hooks/useResponsive';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { 
  ChartBar, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Wallet, 
  Search, 
  BarChart3, 
  ChevronLeft,
  Menu,
  ChevronDown
} from 'lucide-react';
import { StockChart } from './StockChart';
import { NetWorthBreakdown } from './NetWorthBreakdown';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { VolatilityLevel, Stock, bonds, cryptoCurrencies } from '../lib/data/investments';
import { startupInvestments } from '../lib/data/investments';
import { expandedStockMarket } from '../lib/data/sp500Stocks';
import { bondTypes } from '../lib/data/assets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Investments() {
  const { wealth, addWealth, addAsset, sellAsset, assets } = useCharacter();
  const { marketTrend, stockMarketHealth, getStockMarketHealthCategory } = useEconomy();
  const { currentDay } = useTime();
  const audio = useAudio();
  const assetTracker = useAssetTracker();
  const navigate = useNavigate();
  
  // Handle audio functions safely
  const playSuccess = () => audio.playSound && audio.playSound('success');
  const playHit = () => audio.playSound && audio.playSound('hit');
  
  const [selectedStock, setSelectedStock] = useState<Stock>(expandedStockMarket[0]);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  const [shareQuantity, setShareQuantity] = useState<number>(0);
  const [buyMode, setBuyMode] = useState<'amount' | 'shares'>('amount');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  
  // Crypto state
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoCurrencies[0]);
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  
  // Bond state
  const [selectedBond, setSelectedBond] = useState(bonds[0]);
  const [bondAmount, setBondAmount] = useState<number>(selectedBond.minInvestment);
  
  // Startup/Other investment state
  const [selectedStartup, setSelectedStartup] = useState(startupInvestments[0]);
  const [startupAmount, setStartupAmount] = useState<number>(selectedStartup.minInvestment);
  
  // UI state for buy/sell dialogs and actions
  const [activeTab, setActiveTab] = useState('browse');
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [openBuySellPanels, setOpenBuySellPanels] = useState<Record<string, boolean>>({});
  
  // Get mobile detection
  const { isMobile } = useResponsive();

  // Check if market is open (function set by MarketPriceUpdater)
  const isMarketOpen = () => {
    // Use the globally exported function if available
    if ((window as any).isMarketOpen) {
      return (window as any).isMarketOpen();
    }
    
    // Fallback if the global function isn't yet available
    // Check if it's a weekday
    const timeState = useTime.getState();
    const gameDate = new Date();
    gameDate.setFullYear(timeState.currentYear);
    gameDate.setMonth(timeState.currentMonth - 1);
    gameDate.setDate(timeState.currentDay);
    
    const dayOfWeek = gameDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) return false;
    
    // Check trading hours (9 AM to 4 PM)
    const hoursFraction = (timeState.timeProgress / 100) * 24;
    const currentHour = Math.floor(hoursFraction);
    const isWithinTradingHours = currentHour >= 9 && currentHour < 16;
    
    return isWithinTradingHours;
  };
  
  // Instead of calculating prices locally, fetch them from the asset tracker
  // which is updated by MarketPriceUpdater
  useEffect(() => {
    // Initialize price collection
    const updatedPrices: Record<string, number> = {};
    
    // The market status (for logging only)
    const marketOpen = (window as any).isStockMarketOpen !== undefined 
      ? (window as any).isStockMarketOpen 
      : isMarketOpen();
    
    console.log(`Investments: Market is ${marketOpen ? 'OPEN' : 'CLOSED'}, fetching current prices`);
    
    // For each stock, get its current price from the asset tracker or owned assets
    expandedStockMarket.forEach(stock => {
      // First check if the user owns this stock, as it will have the most up-to-date price
      const ownedStock = assets.find(asset => asset.id === stock.id && asset.type === 'stock');
      if (ownedStock && ownedStock.currentPrice) {
        updatedPrices[stock.id] = ownedStock.currentPrice;
      } 
      // Alternatively, try to get the price from the asset tracker's stocks object
      else if (assetTracker.stocks) {
        const trackerStock = assetTracker.stocks.find((s: any) => s.id === stock.id);
        if (trackerStock && trackerStock.currentPrice > 0) {
          updatedPrices[stock.id] = trackerStock.currentPrice;
        } else {
          // Fallback to base price if not found in tracker
          updatedPrices[stock.id] = stock.basePrice;
        }
      }
      // Last resort, use base price
      else {
        updatedPrices[stock.id] = stock.basePrice;
      }
    });
    
    // Update the local state with the fetched prices
    setStockPrices(updatedPrices);
    
    // Force an immediate price update via the global updater function
    // This ensures we get fresh prices when the component mounts
    if ((window as any).globalUpdateAllPrices) {
      console.log("Investments: Requesting global price update");
      (window as any).globalUpdateAllPrices();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, marketTrend, stockMarketHealth, assets]);
  
  // Sync stock prices between character assets and asset tracker
  const syncAssetTrackerStockPrices = (prices: Record<string, number>) => {
    // Get all owned stocks from character assets
    const ownedStocks = assets.filter(asset => asset.type === 'stock');
    
    // For each owned stock, update its price in the asset tracker
    ownedStocks.forEach(stock => {
      const currentPrice = prices[stock.id] || stock.purchasePrice;
      
      // Update the stock in the asset tracker
      if (getOwnedStockQuantity(stock.id) > 0) {
        assetTracker.updateStock(stock.id, stock.quantity, currentPrice);
      }
    });
  };
  
  // Fetch crypto prices from the asset tracker (updated by MarketPriceUpdater)
  useEffect(() => {
    // Initialize price collection
    const updatedPrices: Record<string, number> = {};
    
    console.log("Investments: Fetching current crypto prices from asset tracker");
    
    // For each crypto, get its current price from the asset tracker or owned assets
    cryptoCurrencies.forEach(crypto => {
      // First check if the user owns this crypto, as it will have the most up-to-date price
      const ownedCrypto = assets.find(asset => asset.id === crypto.id && asset.type === 'crypto');
      if (ownedCrypto && ownedCrypto.currentPrice) {
        updatedPrices[crypto.id] = ownedCrypto.currentPrice;
      } 
      // Alternatively, try to get the price from the asset tracker's cryptoAssets array
      else if (assetTracker.cryptoAssets) {
        const trackerCrypto = assetTracker.cryptoAssets.find((c: any) => c.id === crypto.id);
        if (trackerCrypto && trackerCrypto.currentPrice > 0) {
          updatedPrices[crypto.id] = trackerCrypto.currentPrice;
        } else {
          // Fallback to base price if not found in tracker
          updatedPrices[crypto.id] = crypto.basePrice;
        }
      }
      // Last resort, use base price
      else {
        updatedPrices[crypto.id] = crypto.basePrice;
      }
    });
    
    // Update the local state with the fetched prices
    setCryptoPrices(updatedPrices);
    
    // Force an immediate price update to get the latest crypto values
    if ((window as any).globalUpdateAllPrices) {
      console.log("Investments: Requesting global price update for crypto");
      (window as any).globalUpdateAllPrices();
    }
    
  }, [currentDay, marketTrend, stockMarketHealth, assets, assetTracker]);
  
  // Sync crypto prices with asset tracker
  const syncAssetTrackerCryptoPrices = (prices: Record<string, number>) => {
    // Get all owned crypto from character assets
    const ownedCrypto = assets.filter(asset => asset.type === 'crypto');
    
    // For each owned crypto, update its price in the asset tracker
    ownedCrypto.forEach(crypto => {
      const currentPrice = prices[crypto.id] || crypto.purchasePrice;
      
      // Update the crypto in the asset tracker
      if (getOwnedCryptoAmount(crypto.id) > 0) {
        assetTracker.updateCrypto(crypto.id, crypto.quantity, currentPrice);
      }
    });
  };
  
  // Calculate owned crypto amount
  const getOwnedCryptoAmount = (cryptoId: string) => {
    const ownedCrypto = assets.find(asset => asset.id === cryptoId && asset.type === 'crypto');
    return ownedCrypto ? ownedCrypto.quantity : 0;
  };
  
  const getOwnedCryptoValue = (cryptoId: string) => {
    const amount = getOwnedCryptoAmount(cryptoId);
    const currentPrice = cryptoPrices[cryptoId] || 0;
    return amount * currentPrice;
  };

  // Calculate owned stock value
  const getOwnedStockQuantity = (stockId: string) => {
    const ownedStock = assets.find(asset => asset.id === stockId && asset.type === 'stock');
    return ownedStock ? ownedStock.quantity : 0;
  };

  const getOwnedStockValue = (stockId: string) => {
    const quantity = getOwnedStockQuantity(stockId);
    const currentPrice = stockPrices[stockId] || 0;
    return quantity * currentPrice;
  };

  // Calculate how many shares can be bought with the current investment amount
  const calculateSharesFromAmount = (amount: number): number => {
    const currentPrice = stockPrices[selectedStock.id] || selectedStock.basePrice;
    return amount / currentPrice;
  };

  // Calculate total cost for a given number of shares
  const calculateAmountFromShares = (shares: number): number => {
    const currentPrice = stockPrices[selectedStock.id] || selectedStock.basePrice;
    return shares * currentPrice;
  };

  // Effect to update share quantity when investment amount changes
  useEffect(() => {
    if (buyMode === 'amount') {
      const shares = calculateSharesFromAmount(investmentAmount);
      setShareQuantity(parseFloat(shares.toFixed(2)));
    }
  }, [investmentAmount, selectedStock.id, stockPrices, buyMode]);

  // Effect to update investment amount when share quantity changes
  useEffect(() => {
    if (buyMode === 'shares') {
      const amount = calculateAmountFromShares(shareQuantity);
      setInvestmentAmount(parseFloat(amount.toFixed(2)));
    }
  }, [shareQuantity, selectedStock.id, stockPrices, buyMode]);

  // When selected stock changes, reset input fields
  useEffect(() => {
    if (buyMode === 'amount') {
      const shares = calculateSharesFromAmount(investmentAmount);
      setShareQuantity(parseFloat(shares.toFixed(2)));
    } else {
      const amount = calculateAmountFromShares(shareQuantity);
      setInvestmentAmount(parseFloat(amount.toFixed(2)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStock.id, stockPrices, buyMode]);

  const handleBuy = () => {
    if (buyMode === 'amount') {
      if (investmentAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      
      if (investmentAmount > wealth) {
        toast.error("Not enough funds");
        playHit();
        return;
      }
    } else {
      if (shareQuantity <= 0) {
        toast.error("Please enter a valid number of shares");
        return;
      }
      
      const cost = calculateAmountFromShares(shareQuantity);
      if (cost > wealth) {
        toast.error("Not enough funds");
        playHit();
        return;
      }
    }
    
    const stockPrice = stockPrices[selectedStock.id] || selectedStock.basePrice;
    const quantity = buyMode === 'amount' 
      ? investmentAmount / stockPrice 
      : shareQuantity;
    
    const totalCost = buyMode === 'amount'
      ? investmentAmount
      : calculateAmountFromShares(shareQuantity);
    
    // Buy stock in character store
    addAsset({
      id: selectedStock.id,
      name: selectedStock.name,
      type: 'stock',
      quantity,
      purchasePrice: stockPrice,
      currentPrice: stockPrice,
      purchaseDate: `${currentDay}`
    });
    
    // Also update the AssetTracker store
    assetTracker.addStock({
      id: selectedStock.id,
      name: selectedStock.name,
      shares: quantity,
      purchasePrice: stockPrice,
      currentPrice: stockPrice
    });
    
    // Note: addWealth is intentionally removed from here because addAsset already
    // subtracts the cost from wealth. Adding it here would subtract it twice.
    playSuccess();
    toast.success(`Purchased ${quantity.toFixed(2)} shares of ${selectedStock.name}`);
    
    // Critical: Use the global update function to ensure all components
    // have the latest data immediately after purchase
    if ((window as any).globalUpdateAllPrices) {
      console.log("Investments: Triggering global price update after purchase");
      (window as any).globalUpdateAllPrices();
    }
  };

  const handleSell = () => {
    const ownedQuantity = getOwnedStockQuantity(selectedStock.id);
    
    if (ownedQuantity <= 0) {
      toast.error("You don't own any shares of this stock");
      return;
    }

    let quantityToSell = ownedQuantity;
    let isPartialSale = false;

    // If in shares mode and user specified a quantity less than owned, do partial sale
    if (buyMode === 'shares' && shareQuantity > 0 && shareQuantity < ownedQuantity) {
      quantityToSell = shareQuantity;
      isPartialSale = true;
    }
    
    const stockPrice = stockPrices[selectedStock.id] || selectedStock.basePrice;
    const sellValue = quantityToSell * stockPrice;
    
    if (isPartialSale) {
      // Partial sell - use sellAsset for the specified quantity
      sellAsset(selectedStock.id, quantityToSell);
      
      // Update AssetTracker with the new number of shares
      const remainingShares = ownedQuantity - quantityToSell;
      assetTracker.updateStock(selectedStock.id, remainingShares, stockPrice);
    } else {
      // Sell all shares
      sellAsset(selectedStock.id, ownedQuantity);
      
      // Remove stock completely from AssetTracker
      assetTracker.removeStock(selectedStock.id);
    }
    
    // Note: addWealth is intentionally removed because sellAsset already 
    // adds the sale value to wealth. Adding it here would add it twice.
    playSuccess();
    
    if (isPartialSale) {
      toast.success(`Sold ${quantityToSell.toFixed(2)} shares of ${selectedStock.name} for ${formatCurrency(sellValue)}`);
    } else {
      toast.success(`Sold all ${ownedQuantity.toFixed(2)} shares of ${selectedStock.name} for ${formatCurrency(sellValue)}`);
    }
    
    // Critical: Use the global update function to ensure all components
    // have the latest data immediately after sale
    if ((window as any).globalUpdateAllPrices) {
      console.log("Investments: Triggering global price update after sale");
      (window as any).globalUpdateAllPrices();
    }
  };
  
  // Buy crypto
  const handleBuyCrypto = () => {
    if (cryptoAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const cryptoPrice = cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice;
    const totalCost = cryptoAmount * cryptoPrice;
    
    if (totalCost > wealth) {
      toast.error("Not enough funds");
      playHit();
      return;
    }
    
    // Buy crypto in character store
    addAsset({
      id: selectedCrypto.id,
      name: selectedCrypto.name,
      type: 'crypto',
      quantity: cryptoAmount,
      purchasePrice: cryptoPrice,
      currentPrice: cryptoPrice,
      purchaseDate: `${currentDay}`
    });
    
    // Also update the AssetTracker store
    assetTracker.addCrypto({
      id: selectedCrypto.id,
      name: selectedCrypto.name,
      amount: cryptoAmount,
      purchasePrice: cryptoPrice,
      currentPrice: cryptoPrice
    });
    
    playSuccess();
    toast.success(`Purchased ${cryptoAmount.toFixed(4)} ${selectedCrypto.name} at ${formatCurrency(cryptoPrice)} each`);
    
    // Trigger global update to refresh all components
    if ((window as any).globalUpdateAllPrices) {
      console.log("Investments: Triggering global price update after crypto purchase");
      (window as any).globalUpdateAllPrices();
    }
  };
  
  // Sell crypto
  const handleSellCrypto = () => {
    const ownedAmount = getOwnedCryptoAmount(selectedCrypto.id);
    
    if (ownedAmount <= 0) {
      toast.error(`You don't own any ${selectedCrypto.name}`);
      return;
    }
    
    const cryptoPrice = cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice;
    let amountToSell = ownedAmount;
    let isPartialSale = false;
    
    // If amount to sell is specified and less than owned, do partial sale
    if (cryptoAmount > 0 && cryptoAmount < ownedAmount) {
      amountToSell = cryptoAmount;
      isPartialSale = true;
    }
    
    const sellValue = amountToSell * cryptoPrice;
    
    if (isPartialSale) {
      // Partial sell
      sellAsset(selectedCrypto.id, amountToSell);
      
      // Update AssetTracker with the remaining amount
      const remainingAmount = ownedAmount - amountToSell;
      assetTracker.updateCrypto(selectedCrypto.id, remainingAmount, cryptoPrice);
    } else {
      // Sell all
      sellAsset(selectedCrypto.id, ownedAmount);
      
      // Remove crypto completely from AssetTracker
      assetTracker.removeCrypto(selectedCrypto.id);
    }
    
    playSuccess();
    
    if (isPartialSale) {
      toast.success(`Sold ${amountToSell.toFixed(4)} ${selectedCrypto.name} for ${formatCurrency(sellValue)}`);
    } else {
      toast.success(`Sold all ${ownedAmount.toFixed(4)} ${selectedCrypto.name} for ${formatCurrency(sellValue)}`);
    }
    
    // Trigger global update to refresh all components
    if ((window as any).globalUpdateAllPrices) {
      console.log("Investments: Triggering global price update after crypto sale");
      (window as any).globalUpdateAllPrices();
    }
  };
  
  // Buy bond
  const handleBuyBond = () => {
    if (bondAmount < selectedBond.minInvestment) {
      toast.error(`Minimum investment amount is ${formatCurrency(selectedBond.minInvestment)}`);
      return;
    }
    
    if (bondAmount > wealth) {
      toast.error("Not enough funds");
      playHit();
      return;
    }
    
    // Calculate maturity date and value
    const maturityYears = selectedBond.term;
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + maturityYears);
    
    // Simple calculation for maturity value: principal + (principal * rate * years)
    const maturityValue = bondAmount + (bondAmount * selectedBond.yieldRate * maturityYears);
    
    // Buy bond in character store
    addAsset({
      id: selectedBond.id,
      name: selectedBond.name,
      type: 'bond',
      quantity: 1,
      purchasePrice: bondAmount,
      currentPrice: bondAmount,
      purchaseDate: `${currentDay}`,
      maturityDate: maturityDate.toISOString(),
      maturityValue: maturityValue,
      term: selectedBond.term,
      yieldRate: selectedBond.yieldRate
    });
    
    // Also update the AssetTracker store
    assetTracker.addBond({
      id: selectedBond.id,
      name: selectedBond.name,
      amount: 1,
      purchasePrice: bondAmount,
      maturityValue: maturityValue,
      maturityDate: maturityDate
    });
    
    playSuccess();
    toast.success(`Purchased ${selectedBond.name} for ${formatCurrency(bondAmount)}`);
    
    // Trigger global update to refresh all components
    if ((window as any).globalUpdateAllPrices) {
      console.log("Investments: Triggering global price update after bond purchase");
      (window as any).globalUpdateAllPrices();
    }
  };
  
  // Buy startup investment
  const handleBuyStartup = () => {
    if (startupAmount < selectedStartup.minInvestment) {
      toast.error(`Minimum investment amount is ${formatCurrency(selectedStartup.minInvestment)}`);
      return;
    }
    
    if (startupAmount > wealth) {
      toast.error("Not enough funds");
      playHit();
      return;
    }
    
    // Check if the startup is already invested in
    const existingInvestment = assets.find(asset => 
      asset.type === 'other' && asset.id === selectedStartup.id
    );
    
    if (existingInvestment) {
      toast.error(`You have already invested in ${selectedStartup.name}`);
      playHit();
      return;
    }
    
    // Calculate maturity day (current day + maturity period)
    const maturityDay = currentDay + selectedStartup.maturityTimeInDays;
    
    // Buy startup investment in character store
    addAsset({
      id: selectedStartup.id,
      name: selectedStartup.name,
      type: 'other',
      quantity: 1,
      purchasePrice: startupAmount,
      currentPrice: startupAmount,
      purchaseDate: `${currentDay}`,
      successChance: selectedStartup.successChance,
      potentialReturnMultiple: selectedStartup.potentialReturnMultiple,
      round: selectedStartup.round,
      industry: selectedStartup.industry,
      
      // New maturity-related properties
      maturityTimeInDays: selectedStartup.maturityTimeInDays,
      maturityDay: maturityDay,
      outcomeProcessed: false,
      active: true
    });
    
    // We don't need to update AssetTracker directly - the sync function will handle this
    // This prevents the double counting issue
    
    // Mark this startup as unavailable for further investment
    const startupIndex = startupInvestments.findIndex(s => s.id === selectedStartup.id);
    if (startupIndex !== -1) {
      startupInvestments[startupIndex].isAvailable = false;
    }
    
    playSuccess();
    toast.success(`Invested ${formatCurrency(startupAmount)} in ${selectedStartup.name}`);
    toast.info(`You'll receive the outcome of this investment in ${selectedStartup.maturityTimeInDays} days.`);
    
    // Trigger global update to refresh all components
    if ((window as any).globalUpdateAllPrices) {
      console.log("Investments: Triggering global price update after startup investment");
      (window as any).globalUpdateAllPrices();
    }
  };

  // Calculate the price change percentage for context-aware tips
  const priceChangePercent = selectedStock ? 
    ((stockPrices[selectedStock.id] - selectedStock.basePrice) / selectedStock.basePrice) * 100 : 0;
  
  // Determine investment opportunity level
  const isPotentialBuy = marketTrend === 'bull' && priceChangePercent < -5;
  const isPotentialSell = marketTrend === 'bear' && priceChangePercent > 5;
  const isVolatilityWarning = selectedStock.volatility === 'high' || 
                             selectedStock.volatility === 'very_high' ||
                             selectedStock.volatility === 'extreme';
                             
  // Get unique sectors for filtering - memoize this to avoid recalculation
  const sectors = useMemo(() => {
    return Array.from(new Set(expandedStockMarket.map(stock => stock.sector)));
  }, [expandedStockMarket]);
  
  // Memoize filtered stocks to prevent unnecessary recalculations
  const filteredStocks = useMemo(() => {
    // Convert search query to lowercase once
    const searchQueryLower = searchQuery.toLowerCase();
    const isSearching = searchQuery !== '';
    
    return expandedStockMarket.filter(stock => {
      // Only check search if there's a query
      const matchesSearch = !isSearching || 
        stock.name.toLowerCase().includes(searchQueryLower) ||
        stock.symbol.toLowerCase().includes(searchQueryLower);
      
      // Optimize sector matching
      const matchesSector = selectedSector === 'all' || stock.sector === selectedSector;
      
      return matchesSearch && matchesSector;
    });
  }, [expandedStockMarket, searchQuery, selectedSector]);
  
  // Portfolio analysis utility functions
  const calculateTotalPortfolioReturn = (): number => {
    // Calculate overall portfolio return
    if (assets.length === 0) return 0;
    
    let totalCost = 0;
    let totalValue = 0;
    
    assets.forEach(asset => {
      totalCost += asset.purchasePrice * (asset.quantity || 1);
      
      if (asset.type === 'stock') {
        const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
        totalValue += currentPrice * asset.quantity;
      } else if (asset.type === 'crypto') {
        const currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
        totalValue += currentPrice * asset.quantity;
      } else if (asset.type === 'bond') {
        totalValue += asset.maturityValue || asset.purchasePrice;
      } else if (asset.type === 'other') {
        totalValue += asset.purchasePrice; // Startups are valued at purchase price until maturity
      }
    });
    
    if (totalCost === 0) return 0;
    return ((totalValue - totalCost) / totalCost) * 100;
  };
  
  interface PerformingAsset {
    id: string;
    name: string;
    type: string;
    profitPercent: number;
  }
  
  const findBestPerformingAsset = (): PerformingAsset | null => {
    if (assets.length === 0) return null;
    
    let bestAsset: PerformingAsset | null = null;
    let bestProfitPercent = -Infinity;
    
    assets.forEach(asset => {
      let currentPrice = asset.purchasePrice;
      let name = 'Unknown';
      
      if (asset.type === 'stock') {
        currentPrice = stockPrices[asset.id] || asset.purchasePrice;
        const stock = expandedStockMarket.find(s => s.id === asset.id);
        if (stock) name = stock.name;
      } else if (asset.type === 'crypto') {
        currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
        const crypto = cryptoCurrencies.find(c => c.id === asset.id);
        if (crypto) name = crypto.name;
      } else if (asset.type === 'bond') {
        currentPrice = asset.maturityValue || asset.purchasePrice;
        const bond = bonds.find(b => b.id === asset.id);
        if (bond) name = bond.name;
      } else if (asset.type === 'other') {
        // For startups, we use purchase price until maturity
        currentPrice = asset.purchasePrice;
        const startup = startupInvestments.find(s => s.id === asset.id);
        if (startup) name = startup.name;
      }
      
      const profitPercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
      
      if (profitPercent > bestProfitPercent) {
        bestProfitPercent = profitPercent;
        bestAsset = {
          id: asset.id,
          name,
          type: asset.type,
          profitPercent
        };
      }
    });
    
    return bestAsset;
  };
  
  const findWorstPerformingAsset = (): PerformingAsset | null => {
    if (assets.length === 0) return null;
    
    let worstAsset: PerformingAsset | null = null;
    let worstProfitPercent = Infinity;
    
    assets.forEach(asset => {
      let currentPrice = asset.purchasePrice;
      let name = 'Unknown';
      
      if (asset.type === 'stock') {
        currentPrice = stockPrices[asset.id] || asset.purchasePrice;
        const stock = expandedStockMarket.find(s => s.id === asset.id);
        if (stock) name = stock.name;
      } else if (asset.type === 'crypto') {
        currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
        const crypto = cryptoCurrencies.find(c => c.id === asset.id);
        if (crypto) name = crypto.name;
      } else if (asset.type === 'bond') {
        currentPrice = asset.maturityValue || asset.purchasePrice;
        const bond = bonds.find(b => b.id === asset.id);
        if (bond) name = bond.name;
      } else if (asset.type === 'other') {
        // For startups, we use purchase price until maturity
        currentPrice = asset.purchasePrice;
        const startup = startupInvestments.find(s => s.id === asset.id);
        if (startup) name = startup.name;
      }
      
      const profitPercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
      
      if (profitPercent < worstProfitPercent) {
        worstProfitPercent = profitPercent;
        worstAsset = {
          id: asset.id,
          name,
          type: asset.type,
          profitPercent
        };
      }
    });
    
    return worstAsset;
  };
  
  const calculateDiversityScore = (): number => {
    // Calculate how well-diversified the portfolio is (0-10)
    if (assets.length === 0) return 0;
    
    // Count different types of assets
    const types = new Set(assets.map(a => a.type));
    const typeScore = Math.min(4, types.size) * 1.5; // Max 6 points for having all 4 types
    
    // Count number of sectors for stocks
    const stockSectors = new Set();
    assets
      .filter(a => a.type === 'stock')
      .forEach(asset => {
        const stock = expandedStockMarket.find(s => s.id === asset.id);
        if (stock) stockSectors.add(stock.sector);
      });
    
    const sectorScore = Math.min(4, stockSectors.size) * 0.5; // Max 2 points for sectors
    
    // Count number of crypto categories
    const cryptoCategories = new Set();
    assets
      .filter(a => a.type === 'crypto')
      .forEach(asset => {
        const crypto = cryptoCurrencies.find(c => c.id === asset.id);
        if (crypto) cryptoCategories.add(crypto.type);
      });
    
    const cryptoScore = Math.min(4, cryptoCategories.size) * 0.5; // Max 2 points for crypto categories
    
    // Calculate final score (0-10)
    const finalScore = Math.min(10, Math.round(typeScore + sectorScore + cryptoScore));
    return finalScore;
  };
  
  const getDiversityComment = (): string => {
    const score = calculateDiversityScore();
    if (score >= 8) return "Excellent diversification";
    if (score >= 6) return "Good diversification";
    if (score >= 4) return "Moderate diversification";
    if (score >= 2) return "Limited diversification";
    return "Poor diversification";
  };
  
  const calculateAssetAllocation = () => {
    // Calculate asset allocation percentages
    const assetValues = {
      stock: 0,
      crypto: 0,
      bond: 0,
      other: 0
    };
    
    // Sum up values by type
    assets.forEach(asset => {
      if (asset.type === 'stock') {
        const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
        assetValues.stock += asset.quantity * currentPrice;
      } else if (asset.type === 'crypto') {
        const currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
        assetValues.crypto += asset.quantity * currentPrice;
      } else if (asset.type === 'bond') {
        assetValues.bond += asset.maturityValue || asset.purchasePrice;
      } else if (asset.type === 'other') {
        assetValues.other += asset.purchasePrice;
      }
    });
    
    // Calculate total portfolio value
    const totalValue = Object.values(assetValues).reduce((sum, value) => sum + value, 0);
    
    if (totalValue === 0) {
      return [
        { type: 'stock', label: 'Stocks', percentage: 0 },
        { type: 'crypto', label: 'Cryptocurrencies', percentage: 0 },
        { type: 'bond', label: 'Bonds', percentage: 0 },
        { type: 'other', label: 'Startups', percentage: 0 }
      ];
    }
    
    // Return allocation percentages
    return [
      { type: 'stock', label: 'Stocks', percentage: (assetValues.stock / totalValue) * 100 },
      { type: 'crypto', label: 'Cryptocurrencies', percentage: (assetValues.crypto / totalValue) * 100 },
      { type: 'bond', label: 'Bonds', percentage: (assetValues.bond / totalValue) * 100 },
      { type: 'other', label: 'Startups', percentage: (assetValues.other / totalValue) * 100 }
    ].filter(item => item.percentage > 0);
  };
  
  const calculatePortfolioRiskLevel = (): number => {
    // Calculate portfolio risk level (0-1 where 0 is lowest risk, 1 is highest)
    if (assets.length === 0) return 0;
    
    // Define risk weights for each asset type (0-1)
    const riskWeights = {
      bond: 0.2,  // Lowest risk
      stock: 0.5, // Medium risk
      crypto: 0.8, // High risk
      other: 0.9   // Highest risk (startups)
    };
    
    let weightedRiskSum = 0;
    let totalValue = 0;
    
    // Calculate weighted risk based on portfolio value
    assets.forEach(asset => {
      let value = 0;
      
      if (asset.type === 'stock') {
        const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
        value = asset.quantity * currentPrice;
      } else if (asset.type === 'crypto') {
        const currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
        value = asset.quantity * currentPrice;
      } else if (asset.type === 'bond') {
        value = asset.maturityValue || asset.purchasePrice;
      } else if (asset.type === 'other') {
        value = asset.purchasePrice;
      }
      
      weightedRiskSum += value * riskWeights[asset.type as keyof typeof riskWeights];
      totalValue += value;
    });
    
    if (totalValue === 0) return 0;
    return weightedRiskSum / totalValue;
  };
  
  const getRiskComment = (): string => {
    const riskLevel = calculatePortfolioRiskLevel();
    
    if (riskLevel >= 0.8) return "Very high risk portfolio - potential for significant gains or losses";
    if (riskLevel >= 0.6) return "High risk portfolio - focused on growth assets";
    if (riskLevel >= 0.4) return "Moderate risk portfolio - balanced approach";
    if (riskLevel >= 0.2) return "Low risk portfolio - conservative approach";
    return "Very low risk portfolio - focus on capital preservation";
  };
  
  const getDiversificationRecommendation = (): string => {
    const assetAllocation = calculateAssetAllocation();
    const types = new Set(assets.map(a => a.type));
    
    if (types.size === 0) {
      return "Start your investment journey by diversifying across stocks, bonds, and other assets based on your risk tolerance.";
    }
    
    if (types.size === 1) {
      const onlyType = Array.from(types)[0];
      if (onlyType === 'stock') {
        return "Your portfolio only contains stocks. Consider adding bonds for stability, cryptocurrencies for growth potential, and startups for long-term opportunities.";
      } else if (onlyType === 'crypto') {
        return "Your portfolio only contains cryptocurrencies. Consider adding less volatile assets like stocks and bonds to reduce overall risk.";
      } else if (onlyType === 'bond') {
        return "Your portfolio only contains bonds. Consider adding stocks and other assets for better growth potential.";
      } else {
        return "Your portfolio only contains startup investments. Consider adding more liquid assets like stocks and bonds to balance risk.";
      }
    }
    
    // Find dominant asset types (>70% allocation)
    const dominantTypes = assetAllocation.filter(a => a.percentage > 70);
    if (dominantTypes.length > 0) {
      const type = dominantTypes[0].type;
      if (type === 'stock') {
        return "Your portfolio is heavily weighted towards stocks. Consider increasing your allocation to bonds for better stability.";
      } else if (type === 'crypto') {
        return "Your portfolio is heavily weighted towards cryptocurrencies. Consider increasing your allocation to less volatile assets.";
      } else if (type === 'bond') {
        return "Your portfolio is heavily weighted towards bonds. Consider increasing your allocation to stocks for better growth potential.";
      } else {
        return "Your portfolio is heavily weighted towards startup investments. Consider increasing more liquid assets for better flexibility.";
      }
    }
    
    // Check if missing any major asset classes
    if (!types.has('stock')) {
      return "Consider adding stocks to your portfolio for better growth potential and liquidity.";
    }
    if (!types.has('bond') && calculatePortfolioRiskLevel() > 0.6) {
      return "Your portfolio has high risk. Consider adding bonds to reduce volatility and provide steady income.";
    }
    
    return "Your portfolio has good diversification across asset classes. Continue monitoring performance and rebalance as needed.";
  };
  
  const calculateTimedInvestmentScore = (): number => {
    // Calculate how well investments are timed (0-1)
    // Higher score means better timing
    
    if (assets.length === 0) return 0;
    
    let totalScore = 0;
    
    assets.forEach(asset => {
      // For now, just a placeholder that returns a random score
      // In a real implementation, this would analyze purchase timing vs market conditions
      totalScore += Math.random();
    });
    
    return totalScore / assets.length;
  };

  return (
    <div className="p-4 bg-background rounded-lg shadow-lg animate-scale-in border border-border">
      <h2 className="text-2xl font-bold mb-4 flex items-center text-foreground" aria-label={`Stock Market - ${marketTrend} market`}>
        <ChartBar className="mr-2" />
        Stock Market
        {marketTrend === 'bull' && <TrendingUp className="ml-2 text-accessible-green" aria-hidden="true" />}
        {marketTrend === 'bear' && <TrendingDown className="ml-2 text-accessible-red" aria-hidden="true" />}
      </h2>
      
      <div className="mb-4 bg-muted p-4 rounded-md border border-border shadow-sm">
        <h3 className="text-lg font-medium mb-3 text-foreground">Market Indicators</h3>
        
        <div className="flex justify-between items-center mb-3 bg-background p-2 rounded border border-border">
          <p className="text-sm font-medium flex items-center text-foreground">
            <ChartBar className="w-4 h-4 mr-1" />
            Market Health:
          </p>
          <div className="flex items-center">
            <div className="w-40 bg-muted rounded-full h-3 mr-2">
              <div 
                className={`h-3 rounded-full ${
                  stockMarketHealth >= 80 ? 'bg-emerald-500' : 
                  stockMarketHealth >= 60 ? 'bg-accessible-green' : 
                  stockMarketHealth >= 40 ? 'bg-accessible-yellow' : 
                  stockMarketHealth >= 20 ? 'bg-accessible-orange' :
                  'bg-accessible-red'
                }`}
                style={{ width: `${stockMarketHealth}%` }}
                aria-hidden="true"
              ></div>
            </div>
            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
              stockMarketHealth >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' : 
              stockMarketHealth >= 60 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
              stockMarketHealth >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 
              stockMarketHealth >= 20 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
            }`}>
              {getStockMarketHealthCategory().toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-background p-2 rounded border border-border">
          <p className="text-sm font-medium flex items-center text-foreground">
            {marketTrend === 'bull' ? (
              <TrendingUp className="w-4 h-4 mr-1 text-accessible-green" />
            ) : marketTrend === 'bear' ? (
              <TrendingDown className="w-4 h-4 mr-1 text-accessible-red" />
            ) : (
              <span className="w-4 h-4 mr-1" />
            )}
            Market Trend:
          </p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            marketTrend === 'bull' ? 'bg-accessible-green/20 text-accessible-green border border-accessible-green/30' : 
            marketTrend === 'bear' ? 'bg-accessible-red/20 text-accessible-red border border-accessible-red/30' : 
            'bg-muted text-foreground'
          }`}>
            {marketTrend.charAt(0).toUpperCase() + marketTrend.slice(1)} Market
          </span>
        </div>
      </div>
      
      <Tabs value={activeTab} defaultValue="browse" className="mb-4" onValueChange={setActiveTab}>
        {isMobile ? (
          <div className="mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center">
                    {activeTab === 'browse' && <Search className="h-4 w-4 mr-2" />}
                    {activeTab === 'crypto' && (
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 8H13.5C14.3284 8 15 8.67157 15 9.5C15 10.3284 14.3284 11 13.5 11H9V8Z" fill="currentColor"/>
                        <path d="M9 11H14.5C15.3284 11 16 11.6716 16 12.5C16 13.3284 15.3284 14 14.5 14H9V11Z" fill="currentColor"/>
                        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 18V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activeTab === 'bonds' && (
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 14H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activeTab === 'other' && (
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activeTab === 'portfolio' && <Wallet className="h-4 w-4 mr-2" />}
                    {activeTab === 'analysis' && <BarChart3 className="h-4 w-4 mr-2" />}
                    {activeTab === 'browse' ? 'Stocks' : 
                      activeTab === 'crypto' ? 'Crypto' : 
                      activeTab === 'bonds' ? 'Bonds' : 
                      activeTab === 'other' ? 'Startups' : 
                      activeTab === 'portfolio' ? 'Portfolio' : 
                      'Analysis'}
                  </div>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center"
                  onClick={() => setActiveTab('browse')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span>Stocks</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center"
                  onClick={() => setActiveTab('crypto')}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 8H13.5C14.3284 8 15 8.67157 15 9.5C15 10.3284 14.3284 11 13.5 11H9V8Z" fill="currentColor"/>
                    <path d="M9 11H14.5C15.3284 11 16 11.6716 16 12.5C16 13.3284 15.3284 14 14.5 14H9V11Z" fill="currentColor"/>
                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 18V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Crypto</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center"
                  onClick={() => setActiveTab('bonds')}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 14H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Bonds</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center"
                  onClick={() => setActiveTab('other')}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Startups</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center"
                  onClick={() => setActiveTab('portfolio')}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  <span>Portfolio</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center"
                  onClick={() => setActiveTab('analysis')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span>Analysis</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <TabsList className="mb-4 flex flex-wrap gap-1">
            <TabsTrigger value="browse" className="flex items-center justify-center py-2 flex-1 min-w-[90px]">
              <Search className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="whitespace-nowrap text-sm sm:text-base">Stocks</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center justify-center py-2 flex-1 min-w-[90px]">
              <svg className="h-4 w-4 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 8H13.5C14.3284 8 15 8.67157 15 9.5C15 10.3284 14.3284 11 13.5 11H9V8Z" fill="currentColor"/>
                <path d="M9 11H14.5C15.3284 11 16 11.6716 16 12.5C16 13.3284 15.3284 14 14.5 14H9V11Z" fill="currentColor"/>
                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 18V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="whitespace-nowrap text-sm sm:text-base">Crypto</span>
            </TabsTrigger>
            <TabsTrigger value="bonds" className="flex items-center justify-center py-2 flex-1 min-w-[90px]">
              <svg className="h-4 w-4 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 14H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="whitespace-nowrap text-sm sm:text-base">Bonds</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center justify-center py-2 flex-1 min-w-[90px]">
              <svg className="h-4 w-4 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="whitespace-nowrap text-sm sm:text-base">Startups</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center justify-center py-2 flex-1 min-w-[90px]">
              <Wallet className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="whitespace-nowrap text-sm sm:text-base">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center justify-center py-2 flex-1 min-w-[90px]">
              <BarChart3 className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="whitespace-nowrap text-sm sm:text-base">Analysis</span>
            </TabsTrigger>
          </TabsList>
        )}
        
        {/* Browse Stocks Tab */}
        <TabsContent value="browse" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg" id="available-stocks-heading">Available Stocks</h3>
              
              {/* Search and filter controls */}
              <div className="mb-3 space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 pr-8 border border-input bg-background rounded-md text-sm text-foreground"
                  />
                  <div className="absolute right-2 top-2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
                
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    // Direct value setting - simpler is better
                    console.log(`Changing sector from ${selectedSector} to ${e.target.value}`);
                    setSelectedSector(e.target.value);
                  }}
                  className="w-full p-2 border border-input bg-background rounded-md text-sm text-foreground"
                  aria-label="Filter by sector"
                >
                  <option value="all">All Sectors</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector.charAt(0).toUpperCase() + sector.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                <span>Showing {filteredStocks.length} of {expandedStockMarket.length} stocks</span>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="text-primary hover:text-primary/80"
                    aria-label="Clear search"
                  >
                    Clear search
                  </button>
                )}
              </div>
              
              <div 
                className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-muted" 
                aria-labelledby="available-stocks-heading"
                role="listbox"
              >
                {filteredStocks.map((stock, index) => (
                  <div 
                    key={`stock-${stock.id}-${index}`}
                    role="option"
                    aria-selected={selectedStock.id === stock.id}
                    className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                      selectedStock.id === stock.id 
                        ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' 
                        : 'hover:bg-muted hover:border-border'
                    }`}
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-base">{stock.name} ({stock.symbol})</span>
                      <span className={`font-mono font-semibold ${
                        stockPrices[stock.id] > stock.basePrice 
                          ? 'text-accessible-green' 
                          : stockPrices[stock.id] < stock.basePrice 
                            ? 'text-accessible-red' 
                            : ''
                      }`}>
                        ${(stockPrices[stock.id] || stock.basePrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded-full ${
                        stock.volatility === 'extreme' ? 'bg-purple-200 text-purple-800' :
                        stock.volatility === 'high' || stock.volatility === 'very_high'
                          ? 'bg-accessible-red/10 text-accessible-red'
                          : stock.volatility === 'medium'
                            ? 'bg-accessible-orange/10 text-accessible-orange'
                            : 'bg-accessible-green/10 text-accessible-green'
                      }`}>
                        Risk: {stock.volatility === 'extreme' ? 'Extreme' :
                              stock.volatility === 'very_high' ? 'Very High' : 
                              stock.volatility === 'high' ? 'High' : 
                              stock.volatility === 'medium' ? 'Medium' : 
                              stock.volatility === 'low' ? 'Low' : 'Very Low'}
                      </span>
                      <span className="text-gray-600">
                        Owned: <span className="font-medium">{getOwnedStockQuantity(stock.id).toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg flex items-center">
                {selectedStock.name} ({selectedStock.symbol})
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  priceChangePercent > 0 
                    ? 'bg-accessible-green/10 text-accessible-green' 
                    : priceChangePercent < 0 
                      ? 'bg-accessible-red/10 text-accessible-red' 
                      : 'bg-accent-muted'
                }`}>
                  {priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
                </span>
              </h3>
              <div className="h-40 mb-3 border p-1 rounded-md bg-background">
                <StockChart 
                  stockId={selectedStock.id}
                  currentPrice={stockPrices[selectedStock.id] || selectedStock.basePrice}
                  basePrice={selectedStock.basePrice}
                  volatility={selectedStock.volatility}
                />
              </div>
              <p className="text-sm mb-3 bg-muted p-2 rounded">{selectedStock.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
                  <p className="font-semibold">${(stockPrices[selectedStock.id] || selectedStock.basePrice).toFixed(2)}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Owned Value</p>
                  <p className="font-semibold">{formatCurrency(getOwnedStockValue(selectedStock.id))}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="stock-amount">
                    Amount to Buy/Sell:
                  </label>
                  <div className="flex rounded-md">
                    <input 
                      type="number" 
                      id="stock-amount"
                      value={shareQuantity} 
                      onChange={(e) => setShareQuantity(parseFloat(e.target.value) || 0)}
                      className="flex-1 p-2 border border-input bg-background rounded-l-md text-sm text-foreground"
                      min="0.0001"
                      step="0.0001"
                    />
                    <div className="px-3 py-2 border border-l-0 border-input bg-muted rounded-r-md">
                      shares
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-right">
                    Cost: {formatCurrency(shareQuantity * (stockPrices[selectedStock.id] || selectedStock.basePrice))}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => {
                      // Direct buy using handleBuy logic but simplified for direct purchase
                      if (shareQuantity <= 0) {
                        toast.error("Please enter a valid number of shares");
                        return;
                      }
                      
                      const stockPrice = stockPrices[selectedStock.id] || selectedStock.basePrice;
                      const totalCost = shareQuantity * stockPrice;
                      
                      if (totalCost > wealth) {
                        toast.error("Not enough funds");
                        playHit();
                        return;
                      }
                      
                      // Buy stock in character store
                      addAsset({
                        id: selectedStock.id,
                        name: selectedStock.name,
                        type: 'stock',
                        quantity: shareQuantity,
                        purchasePrice: stockPrice,
                        currentPrice: stockPrice,
                        purchaseDate: `${currentDay}`
                      });
                      
                      // Note: We don't need to call subtractWealth as addAsset already does this
                      
                      // Also update the AssetTracker store
                      assetTracker.addStock({
                        id: selectedStock.id,
                        name: selectedStock.name,
                        shares: shareQuantity,
                        purchasePrice: stockPrice,
                        currentPrice: stockPrice
                      });
                      
                      toast.success(`Successfully purchased ${shareQuantity.toFixed(2)} shares of ${selectedStock.name}`);
                      playSuccess();
                      
                      // Reset input after purchase
                      setShareQuantity(0);
                      
                      // Trigger global price update
                      console.log("Investments: Triggering global price update after purchase");
                      (window as any).globalUpdateAllPrices();
                    }}
                    className="bg-accessible-green hover:bg-accessible-green/90"
                    disabled={shareQuantity <= 0 || shareQuantity * (stockPrices[selectedStock.id] || selectedStock.basePrice) > wealth}
                  >
                    Buy Shares
                  </Button>
                  <Button 
                    onClick={() => {
                      // Direct sell using handleSell logic but simplified for direct selling
                      if (shareQuantity <= 0) {
                        toast.error("Please enter a valid number of shares");
                        return;
                      }
                      
                      const ownedAmount = getOwnedStockQuantity(selectedStock.id);
                      if (shareQuantity > ownedAmount) {
                        toast.error(`You only own ${ownedAmount.toFixed(2)} shares`);
                        return;
                      }
                      
                      const stockPrice = stockPrices[selectedStock.id] || selectedStock.basePrice;
                      const totalValue = shareQuantity * stockPrice;
                      
                      // Get current owned quantity
                      const ownedQuantity = getOwnedStockQuantity(selectedStock.id);
                      
                      // Sell stock in character store - need to pass id and quantity
                      sellAsset(selectedStock.id, shareQuantity);
                      
                      // If selling all shares, remove from tracker
                      if (shareQuantity >= ownedQuantity) {
                        assetTracker.removeStock(selectedStock.id);
                      } else {
                        // Update AssetTracker with the new number of shares
                        const remainingShares = ownedQuantity - shareQuantity;
                        assetTracker.updateStock(selectedStock.id, remainingShares, stockPrice);
                      }
                      
                      // Note: We don't need to call addWealth as sellAsset already adds to wealth
                      
                      toast.success(`Successfully sold ${shareQuantity.toFixed(2)} shares of ${selectedStock.name} for ${formatCurrency(totalValue)}`);
                      playSuccess();
                      
                      // Reset input after sale
                      setShareQuantity(0);
                      
                      // Trigger global price update
                      console.log("Investments: Triggering global price update after sale");
                      (window as any).globalUpdateAllPrices();
                    }}
                    className="bg-accessible-red hover:bg-accessible-red/90"
                    disabled={getOwnedStockQuantity(selectedStock.id) <= 0 || shareQuantity > getOwnedStockQuantity(selectedStock.id)}
                  >
                    Sell Shares
                  </Button>
                </div>
              </div>
              
              {selectedStock.volatility === 'extreme' && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-100 text-sm rounded border border-red-300 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 inline-block mr-1" />
                  Warning: This stock has extreme volatility and high risk of significant losses.
                </div>
              )}
              
              {selectedStock.volatility === 'very_low' && (
                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100 text-sm rounded border border-blue-300 dark:border-blue-800">
                  <AlertCircle className="w-4 h-4 inline-block mr-1" />
                  Note: This is a low-volatility stock designed to maintain more stable value with lower growth potential.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="animate-fade-in">
          {/* Overall Portfolio Summary */}
          <div className="bg-muted/20 p-3 rounded-md mb-4 border">
            <h3 className="font-semibold mb-2 text-lg">Complete Investment Portfolio</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs text-muted-foreground">Total Assets</p>
                <p className="font-semibold text-lg">{
                  assets.filter(a => ['stock', 'crypto', 'bond', 'other'].includes(a.type)).length
                }</p>
              </div>
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
                <p className="font-semibold text-lg">{formatCurrency(
                  assets
                    .filter(a => ['stock', 'crypto', 'bond', 'other'].includes(a.type))
                    .reduce((total, asset) => {
                      if (asset.type === 'stock') {
                        const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
                        return total + (asset.quantity * currentPrice);
                      } else if (asset.type === 'crypto') {
                        const currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
                        return total + (asset.quantity * currentPrice);
                      } else if (asset.type === 'bond') {
                        // For bonds, use the current value (which grows over time) or purchase price
                        return total + (asset.currentPrice || asset.purchasePrice);
                      } else if (asset.type === 'other') {
                        // For startups/other, use purchase price until maturity
                        return total + asset.purchasePrice;
                      }
                      return total;
                    }, 0)
                )}</p>
              </div>
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs text-muted-foreground">Cash Position</p>
                <p className="font-semibold text-lg">{formatCurrency(wealth)}</p>
              </div>
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs text-muted-foreground">Asset Distribution</p>
                <div className="flex gap-1 mt-1">
                  {/* Stocks percentage */}
                  <div 
                    className="h-4 bg-accessible-blue rounded-l-sm"
                    style={{ 
                      width: `${assets.filter(a => a.type === 'stock').length ? 25 : 0}%`,
                      opacity: assets.filter(a => a.type === 'stock').length ? 1 : 0.3
                    }}
                    title="Stocks"
                  ></div>
                  {/* Crypto percentage */}
                  <div 
                    className="h-4 bg-accessible-orange"
                    style={{ 
                      width: `${assets.filter(a => a.type === 'crypto').length ? 25 : 0}%`,
                      opacity: assets.filter(a => a.type === 'crypto').length ? 1 : 0.3
                    }}
                    title="Crypto"
                  ></div>
                  {/* Bonds percentage */}
                  <div 
                    className="h-4 bg-accessible-green"
                    style={{ 
                      width: `${assets.filter(a => a.type === 'bond').length ? 25 : 0}%`,
                      opacity: assets.filter(a => a.type === 'bond').length ? 1 : 0.3
                    }}
                    title="Bonds"
                  ></div>
                  {/* Startups percentage */}
                  <div 
                    className="h-4 bg-accessible-purple rounded-r-sm"
                    style={{ 
                      width: `${assets.filter(a => a.type === 'other').length ? 25 : 0}%`,
                      opacity: assets.filter(a => a.type === 'other').length ? 1 : 0.3
                    }}
                    title="Startups"
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Compact Asset Category Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div 
                className={`p-2 border rounded ${
                  assets.filter(a => a.type === 'stock').length > 0 
                    ? 'border-accessible-blue text-accessible-blue bg-accessible-blue/5' 
                    : 'border-muted text-muted-foreground'
                }`}
              >
                <div className="flex justify-between">
                  <span>Stocks</span>
                  <span>{assets.filter(a => a.type === 'stock').length}</span>
                </div>
                <p className="text-right text-sm font-semibold">{formatCurrency(
                  assets
                    .filter(a => a.type === 'stock')
                    .reduce((total, asset) => {
                      const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
                      return total + (asset.quantity * currentPrice);
                    }, 0)
                )}</p>
              </div>
              
              <div 
                className={`p-2 border rounded ${
                  assets.filter(a => a.type === 'crypto').length > 0 
                    ? 'border-accessible-orange text-accessible-orange bg-accessible-orange/5' 
                    : 'border-muted text-muted-foreground'
                }`}
              >
                <div className="flex justify-between">
                  <span>Crypto</span>
                  <span>{assets.filter(a => a.type === 'crypto').length}</span>
                </div>
                <p className="text-right text-sm font-semibold">{formatCurrency(
                  assets
                    .filter(a => a.type === 'crypto')
                    .reduce((total, asset) => {
                      const currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
                      return total + (asset.quantity * currentPrice);
                    }, 0)
                )}</p>
              </div>
              
              <div 
                className={`p-2 border rounded ${
                  assets.filter(a => a.type === 'bond').length > 0 
                    ? 'border-accessible-green text-accessible-green bg-accessible-green/5' 
                    : 'border-muted text-muted-foreground'
                }`}
              >
                <div className="flex justify-between">
                  <span>Bonds</span>
                  <span>{assets.filter(a => a.type === 'bond').length}</span>
                </div>
                <p className="text-right text-sm font-semibold">{formatCurrency(
                  assets
                    .filter(a => a.type === 'bond')
                    .reduce((total, asset) => {
                      return total + (asset.currentPrice || asset.purchasePrice);
                    }, 0)
                )}</p>
              </div>
              
              <div 
                className={`p-2 border rounded ${
                  assets.filter(a => a.type === 'other').length > 0 
                    ? 'border-accessible-purple text-accessible-purple bg-accessible-purple/5' 
                    : 'border-muted text-muted-foreground'
                }`}
              >
                <div className="flex justify-between">
                  <span>Startups</span>
                  <span>{assets.filter(a => a.type === 'other').length}</span>
                </div>
                <p className="text-right text-sm font-semibold">{formatCurrency(
                  assets
                    .filter(a => a.type === 'other')
                    .reduce((total, asset) => {
                      return total + asset.purchasePrice;
                    }, 0)
                )}</p>
              </div>
            </div>
          </div>
          
          {/* Asset Categories Tabs */}
          <div className="mt-4">
            <Tabs defaultValue="stocks" className="w-full">
              <TabsList className="w-full flex flex-wrap gap-1">
                <TabsTrigger 
                  value="stocks" 
                  className="flex items-center justify-center py-2 flex-1 min-w-[80px]"
                >
                  <BarChart3 className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap text-sm sm:text-base">Stocks</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="crypto" 
                  className="flex items-center justify-center py-2 flex-1 min-w-[80px]"
                >
                  <TrendingUp className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap text-sm sm:text-base">Crypto</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="bonds" 
                  className="flex items-center justify-center py-2 flex-1 min-w-[80px]"
                >
                  <AlertCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap text-sm sm:text-base">Bonds</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="startups" 
                  className="flex items-center justify-center py-2 flex-1 min-w-[80px]"
                >
                  <Wallet className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap text-sm sm:text-base">Startups</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Stocks Tab */}
              <TabsContent value="stocks">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-lg" id="portfolio-heading">Stock Holdings</h3>
                    
                    <div 
                      className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
                      aria-labelledby="portfolio-heading"
                      role="listbox"
                    >
                      {assets.filter(a => a.type === 'stock').length > 0 ? (
                        assets
                          .filter(a => a.type === 'stock')
                          .map((asset) => {
                            const stock = expandedStockMarket.find(s => s.id === asset.id);
                            if (!stock) return null;
                            
                            const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
                            const totalValue = asset.quantity * currentPrice;
                            const profitLoss = (currentPrice - asset.purchasePrice) * asset.quantity;
                            const profitLossPercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
                            
                            return (
                              <div 
                                key={`portfolio-${asset.id}`}
                                role="option"
                                aria-selected={selectedStock.id === asset.id}
                                className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                                  selectedStock.id === asset.id 
                                    ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' 
                                    : 'hover:bg-muted hover:border-border'
                                }`}
                                onClick={() => {
                                  const stockData = expandedStockMarket.find(s => s.id === asset.id);
                                  if (stockData) setSelectedStock(stockData);
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-base">{stock.name} ({stock.symbol})</span>
                                  <span className="font-semibold">{formatCurrency(totalValue)}</span>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-muted-foreground">
                                    Shares: <span className="font-medium">{asset.quantity.toFixed(2)}</span>
                                  </span>
                                  <span className={`${
                                    profitLoss > 0 ? 'text-accessible-green' : profitLoss < 0 ? 'text-accessible-red' : 'text-muted-foreground'
                                  }`}>
                                    {profitLoss > 0 ? '+' : ''}{formatCurrency(profitLoss)} ({profitLossPercent > 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-muted-foreground">
                                    Price: <span className="font-mono">${currentPrice.toFixed(2)}</span>
                                  </span>
                                  <div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Show the buy/sell panel for this stock
                                        setOpenBuySellPanels(prev => {
                                          // Close all others, open just this one
                                          const newState = {...prev};
                                          Object.keys(newState).forEach(key => {
                                            newState[key] = false;
                                          });
                                          newState[asset.id] = true;
                                          return newState;
                                        });
                                        
                                        const stockData = expandedStockMarket.find(s => s.id === asset.id);
                                        if (stockData) {
                                          setSelectedStock(stockData);
                                          setBuyMode('shares');
                                          // Initialize with a reasonable quantity
                                          setShareQuantity(Math.max(1, Math.round(asset.quantity * 0.1)));
                                        }
                                      }}
                                      className="px-2 py-0.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                                    >
                                      Trade
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Expandable Buy/Sell Panel */}
                                {openBuySellPanels[asset.id] && (
                                  <div className="mt-3 p-3 bg-background rounded-md border border-border animate-in fade-in duration-200">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                                        <p className="font-semibold">${currentPrice.toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Owned Value</p>
                                        <p className="font-semibold">{formatCurrency(asset.quantity * currentPrice)}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 items-end">
                                      <div className="col-span-2">
                                        <p className="text-xs text-muted-foreground mb-1">Amount to Buy/Sell:</p>
                                        <input 
                                          type="number"
                                          className="w-full p-2 bg-muted border border-border rounded"
                                          value={shareQuantity}
                                          min={0.01}
                                          max={asset.quantity > 0 ? asset.quantity : undefined}
                                          step={0.01}
                                          onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            if (!isNaN(value) && value > 0) {
                                              setShareQuantity(value);
                                            } else {
                                              setShareQuantity(0);
                                            }
                                          }}
                                        />
                                        <p className="text-xs text-right mt-1">
                                          {stock.symbol} &nbsp;•&nbsp; Cost: {formatCurrency(shareQuantity * currentPrice)}
                                        </p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <Button
                                          variant="default"
                                          className="bg-accessible-green hover:bg-accessible-green/90 p-2 h-auto"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Set up for buying
                                            if (shareQuantity <= 0) return;
                                            
                                            const stockData = expandedStockMarket.find(s => s.id === asset.id);
                                            if (stockData) {
                                              setSelectedStock(stockData);
                                              setBuyMode('shares');
                                              handleBuy();
                                            }
                                            
                                            // Close the panel after action
                                            setOpenBuySellPanels(prev => ({...prev, [asset.id]: false}));
                                          }}
                                          disabled={shareQuantity <= 0 || shareQuantity * currentPrice > wealth}
                                        >
                                          Buy
                                        </Button>
                                        <Button
                                          variant="default"
                                          className="bg-accessible-red hover:bg-accessible-red/90 p-2 h-auto"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Set up for selling
                                            if (shareQuantity <= 0 || shareQuantity > asset.quantity) return;
                                            
                                            const stockData = expandedStockMarket.find(s => s.id === asset.id);
                                            if (stockData) {
                                              setSelectedStock(stockData);
                                              setBuyMode('shares');
                                              handleSell();
                                            }
                                            
                                            // Close the panel after action
                                            setOpenBuySellPanels(prev => ({...prev, [asset.id]: false}));
                                          }}
                                          disabled={shareQuantity <= 0 || shareQuantity > asset.quantity}
                                        >
                                          Sell
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-4 text-center bg-muted rounded-md">
                          <p className="text-gray-500">You don't own any stocks yet</p>
                          <p className="text-gray-500 text-sm mt-1">Browse the market to start investing</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-lg flex items-center">
                      {selectedStock.name} ({selectedStock.symbol})
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        priceChangePercent > 0 
                          ? 'bg-accessible-green/10 text-accessible-green' 
                          : priceChangePercent < 0 
                            ? 'bg-accessible-red/10 text-accessible-red' 
                            : 'bg-accent-muted'
                      }`}>
                        {priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
                      </span>
                    </h3>
                    <div className="h-40 mb-3 border p-1 rounded-md bg-background">
                      <StockChart 
                        stockId={selectedStock.id}
                        currentPrice={stockPrices[selectedStock.id] || selectedStock.basePrice}
                        basePrice={selectedStock.basePrice}
                        volatility={selectedStock.volatility}
                      />
                    </div>
                    <p className="text-sm mb-3 bg-muted p-2 rounded">{selectedStock.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-gray-500">Current Price</p>
                        <p className="font-semibold">${(stockPrices[selectedStock.id] || selectedStock.basePrice).toFixed(2)}</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-gray-500">Owned Value</p>
                        <p className="font-semibold">{formatCurrency(getOwnedStockValue(selectedStock.id))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Crypto Tab */}
              <TabsContent value="crypto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-lg" id="crypto-portfolio-heading">Cryptocurrency Holdings</h3>
                    
                    <div 
                      className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
                      aria-labelledby="crypto-portfolio-heading"
                      role="listbox"
                    >
                      {assets.filter(a => a.type === 'crypto').length > 0 ? (
                        assets
                          .filter(a => a.type === 'crypto')
                          .map((asset) => {
                            const crypto = cryptoCurrencies.find(c => c.id === asset.id);
                            if (!crypto) return null;
                            
                            const currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
                            const totalValue = asset.quantity * currentPrice;
                            const profitLoss = (currentPrice - asset.purchasePrice) * asset.quantity;
                            const profitLossPercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
                            
                            return (
                              <div 
                                key={`crypto-portfolio-${asset.id}`}
                                role="option"
                                aria-selected={selectedCrypto.id === asset.id}
                                className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                                  selectedCrypto.id === asset.id 
                                    ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' 
                                    : 'hover:bg-muted hover:border-border'
                                }`}
                                onClick={() => {
                                  const cryptoData = cryptoCurrencies.find(c => c.id === asset.id);
                                  if (cryptoData) setSelectedCrypto(cryptoData);
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-base">{crypto.name} ({crypto.symbol})</span>
                                  <span className="font-semibold">{formatCurrency(totalValue)}</span>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-muted-foreground">
                                    Amount: <span className="font-medium">{asset.quantity.toFixed(4)}</span>
                                  </span>
                                  <span className={`${
                                    profitLoss > 0 ? 'text-accessible-green' : profitLoss < 0 ? 'text-accessible-red' : 'text-muted-foreground'
                                  }`}>
                                    {profitLoss > 0 ? '+' : ''}{formatCurrency(profitLoss)} ({profitLossPercent > 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-muted-foreground">
                                    Price: <span className="font-mono">${currentPrice.toFixed(2)}</span>
                                  </span>
                                  <div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Show the buy/sell panel for this crypto
                                        setOpenBuySellPanels(prev => {
                                          // Close all others, open just this one
                                          const newState = {...prev};
                                          Object.keys(newState).forEach(key => {
                                            newState[key] = false;
                                          });
                                          newState[asset.id] = true;
                                          return newState;
                                        });
                                        
                                        const cryptoData = cryptoCurrencies.find(c => c.id === asset.id);
                                        if (cryptoData) {
                                          setSelectedCrypto(cryptoData);
                                          // Initialize with a reasonable quantity
                                          setCryptoAmount(Math.max(0.01, asset.quantity * 0.1));
                                        }
                                      }}
                                      className="px-2 py-0.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                                    >
                                      Trade
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Expandable Buy/Sell Panel */}
                                {openBuySellPanels[asset.id] && (
                                  <div className="mt-3 p-3 bg-background rounded-md border border-border animate-in fade-in duration-200">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                                        <p className="font-semibold">${currentPrice.toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Owned Value</p>
                                        <p className="font-semibold">{formatCurrency(asset.quantity * currentPrice)}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 items-end">
                                      <div className="col-span-2">
                                        <p className="text-xs text-muted-foreground mb-1">Amount to Buy/Sell:</p>
                                        <input 
                                          type="number"
                                          className="w-full p-2 bg-muted border border-border rounded"
                                          value={cryptoAmount}
                                          min={0.01}
                                          max={asset.quantity > 0 ? asset.quantity : undefined}
                                          step={0.01}
                                          onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            if (!isNaN(value) && value > 0) {
                                              setCryptoAmount(value);
                                            } else {
                                              setCryptoAmount(0);
                                            }
                                          }}
                                        />
                                        <p className="text-xs text-right mt-1">
                                          {crypto.symbol} &nbsp;•&nbsp; Cost: {formatCurrency(cryptoAmount * currentPrice)}
                                        </p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <Button
                                          variant="default"
                                          className="bg-accessible-green hover:bg-accessible-green/90 p-2 h-auto"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Set up for buying
                                            if (cryptoAmount <= 0) return;
                                            
                                            handleBuyCrypto();
                                            
                                            // Close the panel after action
                                            setOpenBuySellPanels(prev => ({...prev, [asset.id]: false}));
                                          }}
                                          disabled={cryptoAmount <= 0 || cryptoAmount * currentPrice > wealth}
                                        >
                                          Buy
                                        </Button>
                                        <Button
                                          variant="default"
                                          className="bg-accessible-red hover:bg-accessible-red/90 p-2 h-auto"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Set up for selling
                                            if (cryptoAmount <= 0 || cryptoAmount > asset.quantity) return;
                                            
                                            handleSellCrypto();
                                            
                                            // Close the panel after action
                                            setOpenBuySellPanels(prev => ({...prev, [asset.id]: false}));
                                          }}
                                          disabled={cryptoAmount <= 0 || cryptoAmount > asset.quantity}
                                        >
                                          Sell
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-4 text-center bg-muted rounded-md">
                          <p className="text-gray-500">You don't own any cryptocurrencies yet</p>
                          <p className="text-gray-500 text-sm mt-1">Browse the crypto tab to start investing</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-lg flex items-center">
                      {selectedCrypto.name} ({selectedCrypto.symbol})
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        (cryptoPrices[selectedCrypto.id] || 0) > selectedCrypto.basePrice 
                          ? 'bg-accessible-green/10 text-accessible-green' 
                          : (cryptoPrices[selectedCrypto.id] || 0) < selectedCrypto.basePrice 
                            ? 'bg-accessible-red/10 text-accessible-red' 
                            : 'bg-accent-muted'
                      }`}>
                        {(cryptoPrices[selectedCrypto.id] || 0) > selectedCrypto.basePrice ? '+' : ''}
                        {((cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice) - selectedCrypto.basePrice) / selectedCrypto.basePrice * 100 > 0 ? '+' : ''}
                        {(((cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice) - selectedCrypto.basePrice) / selectedCrypto.basePrice * 100).toFixed(1)}%
                      </span>
                    </h3>
                    <div className="h-40 mb-3 border p-1 rounded-md bg-background flex items-center justify-center">
                      <div className="text-center">
                        <div className="mb-2 font-semibold">Current Price</div>
                        <div className={`text-2xl font-bold ${
                          (cryptoPrices[selectedCrypto.id] || 0) > selectedCrypto.basePrice 
                            ? 'text-accessible-green' 
                            : (cryptoPrices[selectedCrypto.id] || 0) < selectedCrypto.basePrice 
                              ? 'text-accessible-red' 
                              : ''
                        }`}>
                          ${(cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice).toFixed(2)}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">24/7 Trading</div>
                      </div>
                    </div>
                    <p className="text-sm mb-3 bg-muted p-2 rounded">{selectedCrypto.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-gray-500">Volatility</p>
                        <p className="font-semibold capitalize">{selectedCrypto.volatility.replace('_', ' ')}</p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs text-gray-500">Owned Value</p>
                        <p className="font-semibold">{formatCurrency(getOwnedCryptoValue(selectedCrypto.id))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Bonds Tab */}
              <TabsContent value="bonds">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Bond Holdings</h3>
                    
                    <div 
                      className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    >
                      {assets.filter(a => a.type === 'bond').length > 0 ? (
                        assets
                          .filter(a => a.type === 'bond')
                          .map((asset) => {
                            const bond = bonds.find(b => b.id === asset.id);
                            if (!bond) return null;
                            
                            // Calculate maturity date
                            const purchaseDate = new Date(asset.purchaseDate);
                            const maturityDate = asset.maturityDate ? new Date(asset.maturityDate) : new Date(purchaseDate);
                            if (!asset.maturityDate) {
                              maturityDate.setFullYear(maturityDate.getFullYear() + bond.term);
                            }
                            
                            // Format dates
                            const maturityDateStr = `${maturityDate.getMonth() + 1}/${maturityDate.getDate()}/${maturityDate.getFullYear()}`;
                            
                            // Calculate time remaining until maturity
                            const today = new Date();
                            const daysRemaining = Math.max(0, Math.ceil((maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                            
                            return (
                              <div 
                                key={`bond-portfolio-${asset.id}`} 
                                className="border rounded-md p-3 bg-background"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{bond.name}</span>
                                  <span className="px-2 py-0.5 bg-accessible-green/10 text-accessible-green rounded-full text-xs">
                                    {((bond.yieldRate || 0) * 100).toFixed(1)}% Yield
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs mt-2">
                                  <span>Principal: {formatCurrency(asset.purchasePrice)}</span>
                                  <span>Maturity: {formatCurrency(asset.maturityValue || 0)}</span>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                  <span>Matures: {maturityDateStr}</span>
                                  <span className="text-muted-foreground">{daysRemaining} days left</span>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                                  <div 
                                    className="h-1 rounded-full bg-accessible-green"
                                    style={{ width: `${(bond.term * 365 - daysRemaining) / (bond.term * 365) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-4 text-center bg-muted rounded-md">
                          <p className="text-gray-500">You don't own any bonds yet</p>
                          <p className="text-gray-500 text-sm mt-1">Browse the bonds tab to start investing</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Bond Benefits</h3>
                    <div className="bg-muted p-3 rounded-md mb-3 border">
                      <h4 className="font-medium mb-2">Steady Income</h4>
                      <p className="text-sm mb-3">
                        Bonds provide predictable returns and income over a fixed period. They're an essential part of a diversified portfolio.
                      </p>
                      
                      <h4 className="font-medium mb-2">Stability & Risk Levels</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Treasury Bonds</span>
                          <span className="px-2 py-0.5 bg-accessible-green/10 text-accessible-green text-xs rounded-full">Very Low Risk</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Municipal Bonds</span>
                          <span className="px-2 py-0.5 bg-accessible-green/20 text-accessible-green text-xs rounded-full">Low Risk</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Corporate Bonds</span>
                          <span className="px-2 py-0.5 bg-accessible-orange/20 text-accessible-orange text-xs rounded-full">Medium Risk</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>High-Yield Bonds</span>
                          <span className="px-2 py-0.5 bg-accessible-red/20 text-accessible-red text-xs rounded-full">High Risk</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-accessible-green/5 border border-accessible-green/20 p-3 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1 text-accessible-green" />
                        Bond Investment Tips
                      </h4>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        <li>Bonds can protect against stock market volatility</li>
                        <li>Consider laddering bonds with different maturity dates</li>
                        <li>Higher yield typically means higher risk</li>
                        <li>Bonds generally perform better when interest rates fall</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Startups Tab */}
              <TabsContent value="startups">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Startup Investments</h3>
                    
                    <div 
                      className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    >
                      {assets.filter(a => a.type === 'other').length > 0 ? (
                        assets
                          .filter(a => a.type === 'other')
                          .map((asset) => {
                            const startup = startupInvestments.find(s => s.id === asset.id);
                            if (!startup) return null;
                            
                            // Calculate days until outcome
                            const maturityDay = asset.maturityDay || (parseInt(asset.purchaseDate) + (startup.maturityTimeInDays || 365));
                            const daysRemaining = Math.max(0, maturityDay - currentDay);
                            
                            // Check if investment has matured
                            const hasMatured = daysRemaining <= 0;
                            
                            // Potential return
                            const potentialReturn = asset.purchasePrice * (asset.potentialReturnMultiple || startup.potentialReturnMultiple);
                            
                            return (
                              <div 
                                key={`startup-portfolio-${asset.id}`} 
                                className="border rounded-md p-3 bg-background"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{startup.name}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {startup.round === 'seed' ? 'Seed' : 
                                     startup.round === 'series_a' ? 'Series A' : 
                                     startup.round === 'series_b' ? 'Series B' : 
                                     'Pre-IPO'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs mt-2">
                                  <span>Investment: {formatCurrency(asset.purchasePrice)}</span>
                                  <span>Potential: {formatCurrency(potentialReturn)}</span>
                                </div>
                                {hasMatured ? (
                                  <div className="mt-2 flex justify-between items-center">
                                    <span className="text-xs text-accessible-blue">Investment matured</span>
                                    {asset.outcomeProcessed ? (
                                      <span className="text-xs">Outcome processed</span>
                                    ) : (
                                      <span className="text-xs font-medium text-accessible-purple">Awaiting results</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs">
                                      <span>Matures in: {daysRemaining} days</span>
                                      <span>Success Rate: {(asset.successChance || startup.successChance)}%</span>
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                      <div 
                                        className="h-1 rounded-full bg-accessible-purple"
                                        style={{ width: `${(startup.maturityTimeInDays - daysRemaining) / startup.maturityTimeInDays * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-4 text-center bg-muted rounded-md">
                          <p className="text-gray-500">You don't have any startup investments yet</p>
                          <p className="text-gray-500 text-sm mt-1">Browse startups tab to begin venture investing</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Venture Capital Strategy</h3>
                    <div className="bg-muted p-3 rounded-md mb-3 border">
                      <h4 className="font-medium mb-2">Risk & Reward Spectrum</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Seed Round</span>
                            <span className="font-medium text-accessible-purple">Highest Risk/Reward</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-accessible-purple" style={{ width: '100%' }}></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Potential return: up to 100x, but most fail</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Series A</span>
                            <span className="font-medium text-accessible-blue">High Risk/Reward</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-accessible-blue" style={{ width: '75%' }}></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Potential return: up to 30x, more stability</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Series B</span>
                            <span className="font-medium text-accessible-green">Medium Risk/Reward</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-accessible-green" style={{ width: '50%' }}></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Potential return: up to 15x, established traction</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Pre-IPO</span>
                            <span className="font-medium text-accessible-orange">Low Risk/Reward</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-accessible-orange" style={{ width: '25%' }}></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Potential return: up to 5x, lower risk</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-accessible-purple/5 border border-accessible-purple/20 p-3 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1 text-accessible-purple" />
                        Startup Investment Tips
                      </h4>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        <li>Diversify across multiple startups to spread risk</li>
                        <li>Earlier stages offer higher returns but higher failure rates</li>
                        <li>Consider the industry trends and market potential</li>
                        <li>Be prepared for illiquidity until exit events occur</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        
        {/* Analysis Tab */}
        <TabsContent value="analysis" className="animate-fade-in">
          {/* Overall Investment Performance Summary */}
          <div className="bg-muted/20 p-3 rounded-md mb-4 border">
            <h3 className="font-semibold mb-2 text-lg">Portfolio Performance Analysis</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Overall ROI */}
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs text-muted-foreground">Total Portfolio ROI</p>
                <p className={`font-semibold text-lg ${
                  calculateTotalPortfolioReturn() > 0 
                    ? 'text-accessible-green' 
                    : calculateTotalPortfolioReturn() < 0 
                      ? 'text-accessible-red' 
                      : ''
                }`}>
                  {calculateTotalPortfolioReturn() > 0 ? '+' : ''}
                  {calculateTotalPortfolioReturn().toFixed(2)}%
                </p>
              </div>
              
              {/* Best Asset */}
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs text-muted-foreground">Best Performing Asset</p>
                <p className="font-semibold text-lg text-accessible-green">
                  {findBestPerformingAsset()?.name || "None"}
                </p>
                {findBestPerformingAsset()?.profitPercent && (
                  <p className="text-xs text-accessible-green">
                    +{findBestPerformingAsset()?.profitPercent.toFixed(1)}%
                  </p>
                )}
              </div>
              
              {/* Worst Asset */}
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs text-muted-foreground">Worst Performing Asset</p>
                <p className="font-semibold text-lg text-accessible-red">
                  {findWorstPerformingAsset()?.name || "None"}
                </p>
                {findWorstPerformingAsset()?.profitPercent && (
                  <p className="text-xs text-accessible-red">
                    {findWorstPerformingAsset()?.profitPercent.toFixed(1)}%
                  </p>
                )}
              </div>
              
              {/* Portfolio Diversity Score */}
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs text-muted-foreground">Portfolio Diversity</p>
                <p className="font-semibold text-lg">{calculateDiversityScore()}/10</p>
                <p className="text-xs text-muted-foreground">
                  {getDiversityComment()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Asset Performance</h3>
              
              {/* Multi-Asset Performance */}
              <div className="bg-muted p-3 rounded-md mb-3 border">
                <h4 className="font-medium mb-2">Top Performers</h4>
                {assets.filter(a => ['stock', 'crypto'].includes(a.type)).length > 0 ? (
                  <div className="space-y-2">
                    {/* Combined stocks and crypto for top performers */}
                    {[...assets
                      .filter(a => a.type === 'stock')
                      .map(asset => {
                        const stock = expandedStockMarket.find(s => s.id === asset.id);
                        if (!stock) return null;
                        
                        const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
                        const profitLossPercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
                        
                        return {
                          asset,
                          name: stock.name,
                          type: 'stock',
                          profitLossPercent
                        };
                      }),
                      ...assets
                      .filter(a => a.type === 'crypto')
                      .map(asset => {
                        const crypto = cryptoCurrencies.find(c => c.id === asset.id);
                        if (!crypto) return null;
                        
                        const currentPrice = cryptoPrices[asset.id] || asset.purchasePrice;
                        const profitLossPercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
                        
                        return {
                          asset,
                          name: crypto.name,
                          type: 'crypto',
                          profitLossPercent
                        };
                      })
                    ]
                      .filter(Boolean)
                      .sort((a, b) => b!.profitLossPercent - a!.profitLossPercent)
                      .slice(0, 3)
                      .map(item => {
                        if (!item) return null;
                        return (
                          <div key={`top-${item.asset.id}`} className="flex justify-between items-center p-2 bg-background rounded border">
                            <div className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                item.type === 'stock' ? 'bg-accessible-blue' : 'bg-accessible-orange'
                              }`}></span>
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <span className={`text-sm font-semibold ${
                              item.profitLossPercent > 0 ? 'text-accessible-green' : 'text-accessible-red'
                            }`}>
                              {item.profitLossPercent > 0 ? '+' : ''}{item.profitLossPercent.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">No performance data available</p>
                )}
              </div>
              
              {/* Asset Allocation - Multiple Types */}
              <div className="bg-muted p-3 rounded-md mb-3 border">
                <h4 className="font-medium mb-2">Asset Allocation</h4>
                <div className="space-y-3">
                  {calculateAssetAllocation().map((allocation, index) => (
                    <div key={`allocation-${index}`} className="mb-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${
                            allocation.type === 'stock' ? 'bg-accessible-blue' : 
                            allocation.type === 'crypto' ? 'bg-accessible-orange' :
                            allocation.type === 'bond' ? 'bg-accessible-green' :
                            'bg-accessible-purple'
                          }`}></span>
                          {allocation.label}
                        </span>
                        <span className="font-medium">{allocation.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            allocation.type === 'stock' ? 'bg-accessible-blue' : 
                            allocation.type === 'crypto' ? 'bg-accessible-orange' :
                            allocation.type === 'bond' ? 'bg-accessible-green' :
                            'bg-accessible-purple'
                          }`}
                          style={{ width: `${allocation.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Risk Distribution */}
              <div className="bg-muted p-3 rounded-md border">
                <h4 className="font-medium mb-2">Risk Distribution</h4>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <span className="text-xs w-24 text-accessible-green">Low Risk</span>
                    <div className="relative flex-1 h-6 bg-gradient-to-r from-accessible-green via-accessible-orange to-accessible-red rounded-full overflow-hidden">
                      {/* Risk indicator */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white border-2 border-primary"
                        style={{ left: `${calculatePortfolioRiskLevel() * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs w-24 text-accessible-red text-right">High Risk</span>
                  </div>
                  <p className="text-xs text-center mt-1">{getRiskComment()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg">Investment Strategy</h3>
              
              {/* Market Trends */}
              {marketTrend === 'bull' && (
                <div className="p-3 bg-accessible-green/10 rounded-md border border-accessible-green mb-3">
                  <h4 className="font-medium flex items-center text-accessible-green">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Bull Market Strategy
                  </h4>
                  <p className="text-sm mt-1">
                    In a bull market, consider these investment options:
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Stocks: Growth stocks with higher volatility</p>
                    <p className="text-xs font-medium">Crypto: Consider higher allocations to crypto</p>
                    <p className="text-xs font-medium">Bonds: Reduce bond holdings</p>
                    <p className="text-xs font-medium">Startups: Good time for riskier early-stage investments</p>
                  </div>
                </div>
              )}
              
              {marketTrend === 'bear' && (
                <div className="p-3 bg-accessible-red/10 rounded-md border border-accessible-red mb-3">
                  <h4 className="font-medium flex items-center text-accessible-red">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Bear Market Strategy
                  </h4>
                  <p className="text-sm mt-1">
                    During a bear market, consider these protective strategies:
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Stocks: Focus on defensive stocks with stable dividends</p>
                    <p className="text-xs font-medium">Crypto: Reduce exposure or focus on stablecoins</p>
                    <p className="text-xs font-medium">Bonds: Increase bond allocations for stability</p>
                    <p className="text-xs font-medium">Startups: Focus on later-stage companies with revenue</p>
                  </div>
                </div>
              )}
              
              {marketTrend === 'stable' && (
                <div className="p-3 bg-muted rounded-md border border-gray-200 mb-3">
                  <h4 className="font-medium flex items-center">
                    <ChartBar className="h-4 w-4 mr-1" />
                    Stable Market Strategy
                  </h4>
                  <p className="text-sm mt-1">
                    In a stable market, consider these balanced approaches:
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Stocks: Mix of growth and value stocks</p>
                    <p className="text-xs font-medium">Crypto: Moderate exposure to established cryptocurrencies</p>
                    <p className="text-xs font-medium">Bonds: Maintain balanced bond allocation</p>
                    <p className="text-xs font-medium">Startups: Diversify across stages and industries</p>
                  </div>
                </div>
              )}
              
              {/* Risk & Return Guide */}
              <div className="bg-muted p-3 rounded-md mb-3 border">
                <h4 className="font-medium mb-2">Risk & Return Guide</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-accessible-green mr-2"></div>
                    <span className="text-sm flex-1">Bonds</span>
                    <span className="text-sm">Lower Risk, Lower Return</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-accessible-blue mr-2"></div>
                    <span className="text-sm flex-1">Stocks</span>
                    <span className="text-sm">Medium Risk, Medium Return</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-accessible-orange mr-2"></div>
                    <span className="text-sm flex-1">Crypto</span>
                    <span className="text-sm">High Risk, High Return</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-accessible-purple mr-2"></div>
                    <span className="text-sm flex-1">Startups</span>
                    <span className="text-sm">Very High Risk, Very High Return</span>
                  </div>
                </div>
              </div>
              
              {/* Diversification Recommendation */}
              <div className="bg-accessible-blue/5 border border-accessible-blue/20 p-3 rounded-md">
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-accessible-blue" />
                  Diversification Recommendations
                </h4>
                <p className="text-sm mb-2">
                  {getDiversificationRecommendation()}
                </p>
                {calculateTimedInvestmentScore() < 0.7 && (
                  <div className="text-xs bg-background p-2 rounded mt-2">
                    <p className="font-medium mb-1">Time-based investment strategy:</p>
                    <p>Consider dollar-cost averaging by investing smaller amounts regularly rather than all at once.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Crypto Tab */}
        <TabsContent value="crypto" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg" id="available-crypto-heading">Available Cryptocurrencies</h3>
              
              <div 
                className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-muted" 
                aria-labelledby="available-crypto-heading"
                role="listbox"
              >
                {cryptoCurrencies.map((crypto, index) => (
                  <div 
                    key={`crypto-${crypto.id}-${index}`}
                    role="option"
                    aria-selected={selectedCrypto.id === crypto.id}
                    className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                      selectedCrypto.id === crypto.id 
                        ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' 
                        : 'hover:bg-muted hover:border-border'
                    }`}
                    onClick={() => setSelectedCrypto(crypto)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-base">{crypto.name} ({crypto.symbol})</span>
                      <span className={`font-mono font-semibold ${
                        (cryptoPrices[crypto.id] || 0) > crypto.basePrice 
                          ? 'text-accessible-green' 
                          : (cryptoPrices[crypto.id] || 0) < crypto.basePrice 
                            ? 'text-accessible-red' 
                            : ''
                      }`}>
                        ${(cryptoPrices[crypto.id] || crypto.basePrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded-full ${
                        crypto.volatility === 'extreme' ? 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        crypto.volatility === 'very_high' ? 'bg-accessible-red/10 text-accessible-red' :
                        crypto.volatility === 'high' ? 'bg-accessible-orange/10 text-accessible-orange' :
                        crypto.volatility === 'medium' ? 'bg-accessible-yellow/10 text-accessible-yellow' :
                        crypto.volatility === 'low' ? 'bg-accessible-green/10 text-accessible-green' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      }`}>
                        Risk: {crypto.volatility === 'extreme' ? 'Extreme' :
                              crypto.volatility === 'very_high' ? 'Very High' : 
                              crypto.volatility === 'high' ? 'High' : 
                              crypto.volatility === 'medium' ? 'Medium' : 
                              crypto.volatility === 'low' ? 'Low' : 'Very Low'}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Owned: <span className="font-medium">{getOwnedCryptoAmount(crypto.id).toFixed(4)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg flex items-center">
                {selectedCrypto.name} ({selectedCrypto.symbol})
                {cryptoPrices[selectedCrypto.id] !== undefined && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    cryptoPrices[selectedCrypto.id] > selectedCrypto.basePrice
                      ? 'bg-accessible-green/10 text-accessible-green' 
                      : cryptoPrices[selectedCrypto.id] < selectedCrypto.basePrice
                        ? 'bg-accessible-red/10 text-accessible-red' 
                        : 'bg-accent-muted'
                  }`}>
                    {cryptoPrices[selectedCrypto.id] > selectedCrypto.basePrice ? '+' : ''}
                    {((cryptoPrices[selectedCrypto.id] - selectedCrypto.basePrice) / selectedCrypto.basePrice * 100).toFixed(1)}%
                  </span>
                )}
              </h3>
              
              <div className="h-40 mb-3 border p-1 rounded-md bg-background">
                {/* Chart would be here */}
                <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded">
                  <div className="text-center">
                    <div className="mb-2 font-semibold">Price Trend</div>
                    <div className={`text-2xl font-bold ${
                      (cryptoPrices[selectedCrypto.id] || 0) > selectedCrypto.basePrice 
                        ? 'text-accessible-green' 
                        : (cryptoPrices[selectedCrypto.id] || 0) < selectedCrypto.basePrice 
                          ? 'text-accessible-red' 
                          : ''
                    }`}>
                      ${(cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice).toFixed(2)}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Trading 24/7</div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm mb-3 bg-muted p-2 rounded">{selectedCrypto.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
                  <p className="font-semibold">${(cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice).toFixed(2)}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Owned Value</p>
                  <p className="font-semibold">{formatCurrency(getOwnedCryptoValue(selectedCrypto.id))}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="crypto-amount">
                    Amount to Buy/Sell:
                  </label>
                  <div className="flex rounded-md">
                    <input 
                      type="number" 
                      id="crypto-amount"
                      value={cryptoAmount} 
                      onChange={(e) => setCryptoAmount(parseFloat(e.target.value) || 0)}
                      className="flex-1 p-2 border border-input bg-background rounded-l-md text-sm text-foreground"
                      min="0.0001"
                      step="0.0001"
                    />
                    <div className="px-3 py-2 border border-l-0 border-input bg-muted rounded-r-md">
                      {selectedCrypto.symbol}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-right">
                    Cost: {formatCurrency(cryptoAmount * (cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice))}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleBuyCrypto}
                    className="bg-accessible-green hover:bg-accessible-green/90"
                    disabled={cryptoAmount <= 0 || cryptoAmount * (cryptoPrices[selectedCrypto.id] || selectedCrypto.basePrice) > wealth}
                  >
                    Buy {selectedCrypto.symbol}
                  </Button>
                  <Button 
                    onClick={handleSellCrypto}
                    className="bg-accessible-red hover:bg-accessible-red/90"
                    disabled={getOwnedCryptoAmount(selectedCrypto.id) <= 0}
                  >
                    Sell {selectedCrypto.symbol}
                  </Button>
                </div>
              </div>
              
              {selectedCrypto.volatility === 'extreme' && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-100 text-sm rounded border border-red-300 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 inline-block mr-1" />
                  Warning: This cryptocurrency has extreme volatility and high risk of significant losses.
                </div>
              )}
              
              {selectedCrypto.volatility === 'very_low' && (
                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100 text-sm rounded border border-blue-300 dark:border-blue-800">
                  <AlertCircle className="w-4 h-4 inline-block mr-1" />
                  Note: This is a stablecoin designed to maintain a steady value pegged to a fiat currency.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Bonds Tab */}
        <TabsContent value="bonds" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg" id="available-bonds-heading">Available Bonds</h3>
              
              <div 
                className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-muted" 
                aria-labelledby="available-bonds-heading"
                role="listbox"
              >
                {bonds.map((bond, index) => (
                  <div 
                    key={`bond-${bond.id}-${index}`}
                    role="option"
                    aria-selected={selectedBond.id === bond.id}
                    className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                      selectedBond.id === bond.id 
                        ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' 
                        : 'hover:bg-muted hover:border-border'
                    }`}
                    onClick={() => {
                      setSelectedBond(bond);
                      setBondAmount(bond.minInvestment);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-base">{bond.name}</span>
                      <span className="font-mono font-semibold">
                        {(bond.yieldRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded-full ${
                        bond.type === 'treasury' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100' :
                        bond.type === 'corporate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        bond.type === 'municipal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
                      }`}>
                        {bond.type.charAt(0).toUpperCase() + bond.type.slice(1)}
                      </span>
                      <span className="text-muted-foreground">
                        Term: <span className="font-medium">{bond.term} years</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg">{selectedBond.name}</h3>
              
              <div className="mb-3 p-3 border rounded-md bg-muted">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Annual Yield</p>
                    <p className="font-semibold text-lg">{(selectedBond.yieldRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Term</p>
                    <p className="font-semibold text-lg">{selectedBond.term} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Minimum</p>
                    <p className="font-semibold text-lg">{formatCurrency(selectedBond.minInvestment)}</p>
                  </div>
                </div>
                
                <p className="text-sm mb-1">{selectedBond.description}</p>
                
                <div className="mt-3 text-xs bg-background p-2 rounded">
                  <p className="font-medium">At maturity, you'll receive:</p>
                  <p className="mt-1 font-mono">
                    Principal ${bondAmount.toLocaleString()} + Interest ${(bondAmount * selectedBond.yieldRate * selectedBond.term).toLocaleString()} = 
                    <span className="font-bold ml-1">
                      ${(bondAmount + (bondAmount * selectedBond.yieldRate * selectedBond.term)).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="bond-amount">
                    Investment Amount:
                  </label>
                  <input 
                    type="number" 
                    id="bond-amount"
                    value={bondAmount} 
                    onChange={(e) => {
                      // Allow empty values or any number (validation happens at purchase time)
                      const newValue = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setBondAmount(newValue as any);
                    }}
                    className="w-full p-2 border border-input bg-background rounded-md text-sm text-foreground"
                    min={0}
                    step="1000"
                  />
                  <p className="mt-1 text-xs flex justify-between">
                    <span>Minimum: {formatCurrency(selectedBond.minInvestment)}</span>
                    <span>Available: {formatCurrency(wealth)}</span>
                  </p>
                </div>
                
                <Button 
                  onClick={handleBuyBond} 
                  className="w-full bg-accessible-green hover:bg-accessible-green/90"
                  disabled={bondAmount < selectedBond.minInvestment || bondAmount > wealth}
                >
                  Purchase Bond
                </Button>
                
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100 text-xs rounded">
                  <p className="font-medium">Bond Details:</p>
                  <p className="mt-1">Bonds provide fixed, predictable returns over a set time period with typically lower risk than stocks.</p>
                  <p className="mt-1">You can hold until maturity for full value or sell early (with potential penalties).</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Startups (Other) Tab */}
        <TabsContent value="other" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg" id="available-startups-heading">Startup Investments</h3>
              
              <div 
                className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-muted" 
                aria-labelledby="available-startups-heading"
                role="listbox"
              >
                {startupInvestments.filter(startup => {
                  // Only show startups that are not already invested in
                  const alreadyInvested = assets.some(asset => 
                    asset.type === 'other' && asset.id === startup.id && !asset.outcomeProcessed
                  );
                  return !alreadyInvested;
                }).map((startup, index) => (
                  <div 
                    key={`startup-${startup.id}-${index}`}
                    role="option"
                    aria-selected={selectedStartup.id === startup.id}
                    className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                      selectedStartup.id === startup.id 
                        ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' 
                        : 'hover:bg-muted hover:border-border'
                    }`}
                    onClick={() => {
                      setSelectedStartup(startup);
                      setStartupAmount(startup.minInvestment);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-base">{startup.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        startup.round === 'seed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' :
                        startup.round === 'series_a' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        startup.round === 'series_b' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                      }`}>
                        {startup.round === 'seed' ? 'Seed Round' :
                         startup.round === 'series_a' ? 'Series A' :
                         startup.round === 'series_b' ? 'Series B' :
                         'Pre-IPO'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-muted-foreground">
                        {startup.industry}
                      </span>
                      <span className="font-medium">
                        Min: {formatCurrency(startup.minInvestment)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg">{selectedStartup.name}</h3>
              
              <div className="mb-4 p-3 border rounded-md bg-muted">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Success Chance</p>
                    <p className="font-semibold text-lg">{(selectedStartup.successChance * 100).toFixed()}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Potential Return</p>
                    <p className="font-semibold text-lg">{selectedStartup.potentialReturnMultiple}x</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Industry</p>
                    <p className="font-semibold text-base">{selectedStartup.industry}</p>
                  </div>
                </div>
                
                <p className="text-sm">{selectedStartup.description}</p>
                
                <div className="mt-3 bg-background p-2 rounded text-xs">
                  <p className="font-bold mb-1">Risk Analysis:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Investment Stage:</span>
                      <span className="font-medium">{
                        selectedStartup.round === 'seed' ? 'Very Early (Highest Risk)' :
                        selectedStartup.round === 'series_a' ? 'Early Growth' :
                        selectedStartup.round === 'series_b' ? 'Expansion Phase' :
                        'Late Stage (Lower Risk)'
                      }</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Outcome:</span>
                      <span className="font-medium">{
                        selectedStartup.successChance < 0.2 ? 'Highly Speculative' :
                        selectedStartup.successChance < 0.4 ? 'Speculative' :
                        selectedStartup.successChance < 0.6 ? 'Moderate Risk' :
                        'Likely Success'
                      }</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maturity Period:</span>
                      <span className="font-medium">{selectedStartup.maturityTimeInDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maximum Potential Return:</span>
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {formatCurrency(startupAmount * selectedStartup.potentialReturnMultiple)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="startup-amount">
                    Investment Amount:
                  </label>
                  <input 
                    type="number" 
                    id="startup-amount"
                    value={startupAmount} 
                    onChange={(e) => {
                      // Allow empty values or any number (validation happens at purchase time)
                      const newValue = e.target.value === '' ? '' : parseFloat(e.target.value);
                      setStartupAmount(newValue as any);
                    }}
                    className="w-full p-2 border border-input bg-background rounded-md text-sm text-foreground"
                    min={0}
                    step="1000"
                  />
                  <p className="mt-1 text-xs flex justify-between">
                    <span>Minimum: {formatCurrency(selectedStartup.minInvestment)}</span>
                    <span>Available: {formatCurrency(wealth)}</span>
                  </p>
                </div>
                
                <Button 
                  onClick={handleBuyStartup} 
                  className="w-full bg-accessible-green hover:bg-accessible-green/90"
                  disabled={startupAmount < selectedStartup.minInvestment || startupAmount > wealth}
                >
                  Invest in Startup
                </Button>
                
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-100 text-xs rounded">
                  <AlertCircle className="w-4 h-4 inline-block mr-1" />
                  <span className="font-medium">High Risk Investment:</span>
                  <p className="mt-1">Startup investments are high-risk, illiquid assets with the potential for high returns or complete loss. Diversify your portfolio responsibly.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Context-sensitive tips */}
      {isPotentialBuy && (
        <div className="mb-4 p-3 bg-accessible-green/10 rounded-md border border-accessible-green animate-slide-in-left">
          <p className="text-sm flex items-center font-medium text-accessible-green">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Tip: This stock is currently undervalued in a bull market - might be a good buying opportunity!
          </p>
        </div>
      )}
      
      {isPotentialSell && (
        <div className="mb-4 p-3 bg-accessible-red/10 rounded-md border border-accessible-red animate-slide-in-left">
          <p className="text-sm flex items-center font-medium text-accessible-red">
            <TrendingDown className="h-4 w-4 mr-2" />
            Market Tip: Stock price is high during a bear market - consider selling while the price is favorable!
          </p>
        </div>
      )}
      
      {isVolatilityWarning && (
        <div className="mt-3 flex items-start gap-2 bg-accessible-orange/10 text-accessible-orange p-3 rounded-md border border-accessible-orange">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{selectedStock.volatility === 'extreme' ? 'Extreme' : 'High'} Volatility Warning</p>
            <p className="text-sm mt-1">
              This stock has {
                selectedStock.volatility === 'extreme' ? 'extremely unpredictable' : 
                selectedStock.volatility === 'very_high' ? 'extremely high' : 'high'
              } volatility. While potential returns may be significant, there's also a greater risk of substantial losses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Investments;
