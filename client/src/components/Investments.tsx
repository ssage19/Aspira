import { useState, useEffect } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import { useAudio } from '../lib/stores/useAudio';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { ChartBar, TrendingUp, TrendingDown, AlertCircle, Wallet, Search, BarChart3, ChevronLeft } from 'lucide-react';
import { StockChart } from './StockChart';
import { NetWorthBreakdown } from './NetWorthBreakdown';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { VolatilityLevel, Stock, bonds } from '../lib/data/investments';
import { startupInvestments } from '../lib/data/investments';
import { expandedStockMarket } from '../lib/data/sp500Stocks';
import { cryptoTypes, bondTypes } from '../lib/data/assets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoTypes[0]);
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  
  // Bond state
  const [selectedBond, setSelectedBond] = useState(bonds[0]);
  const [bondAmount, setBondAmount] = useState<number>(selectedBond.minInvestment);
  
  // Startup/Other investment state
  const [selectedStartup, setSelectedStartup] = useState(startupInvestments[0]);
  const [startupAmount, setStartupAmount] = useState<number>(selectedStartup.minInvestment);

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
  
  // Calculate current prices based on economy and time
  useEffect(() => {
    // Initialize with the last known prices to prevent jumpiness
    const updatedPrices: Record<string, number> = {...stockPrices};
    
    // Only update prices when market is open (weekday during trading hours)
    const marketOpen = isMarketOpen();
    
    if (marketOpen) {
      console.log("Investments: Market is OPEN, updating stock prices");
      
      expandedStockMarket.forEach(stock => {
        // Base price influenced by market health and stock volatility
        const volatilityFactor = 
          stock.volatility === 'extreme' ? 0.7 :
          stock.volatility === 'very_high' ? 0.5 : 
          stock.volatility === 'high' ? 0.3 : 
          stock.volatility === 'medium' ? 0.2 : 
          stock.volatility === 'low' ? 0.1 : 0.05; // very_low
        const marketFactor = marketTrend === 'bull' ? 1.05 : marketTrend === 'bear' ? 0.95 : 1;
        const timeFactor = Math.sin(currentDay / 30 * Math.PI) * volatilityFactor;
        
        // Calculate new price with some randomness
        let newPrice = stock.basePrice * marketFactor;
        newPrice += newPrice * timeFactor;
        newPrice += newPrice * (Math.random() * volatilityFactor - volatilityFactor/2);
        
        // Ensure price doesn't go too low
        newPrice = Math.max(newPrice, stock.basePrice * 0.1);
        
        updatedPrices[stock.id] = parseFloat(newPrice.toFixed(2));
      });
      
      setStockPrices(updatedPrices);
      
      // Update asset tracker stock prices
      // This ensures the asset tracker's stock values stay in sync with current prices
      syncAssetTrackerStockPrices(updatedPrices);
    } else {
      console.log("Investments: Market is CLOSED, not updating stock prices");
      
      // If we don't have any prices yet, set initial prices without fluctuation
      if (Object.keys(stockPrices).length === 0) {
        console.log("Investments: No initial prices, setting static base prices");
        
        expandedStockMarket.forEach(stock => {
          updatedPrices[stock.id] = stock.basePrice;
        });
        
        setStockPrices(updatedPrices);
      }
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
  
  // Update crypto prices (24/7 trading)
  useEffect(() => {
    // Initialize with the last known prices to prevent jumpiness
    const updatedPrices: Record<string, number> = {...cryptoPrices};
    
    cryptoTypes.forEach(crypto => {
      // Crypto is more volatile than stocks
      const volatilityFactor = 
        crypto.volatility === 'extreme' ? 1.0 :
        crypto.volatility === 'very_high' ? 0.7 : 
        crypto.volatility === 'high' ? 0.5 : 
        crypto.volatility === 'medium' ? 0.3 : 
        crypto.volatility === 'low' ? 0.1 : 0.01; // very_low or stablecoin
      
      const marketFactor = marketTrend === 'bull' ? 1.08 : marketTrend === 'bear' ? 0.92 : 1;
      const timeFactor = Math.sin(currentDay / 15 * Math.PI) * volatilityFactor; // Faster cycles than stocks
      
      // Calculate new price with more randomness than stocks
      let newPrice = crypto.basePrice * marketFactor;
      newPrice += newPrice * timeFactor;
      newPrice += newPrice * (Math.random() * volatilityFactor * 2 - volatilityFactor);
      
      // Ensure price doesn't go negative
      newPrice = Math.max(newPrice, crypto.basePrice * 0.05);
      
      // Stablecoins stay close to their pegged value
      if (crypto.volatility === 'very_low') {
        // Small fluctuation around $1 for stablecoins
        newPrice = crypto.basePrice + (Math.random() * 0.02 - 0.01);
      }
      
      updatedPrices[crypto.id] = parseFloat(newPrice.toFixed(2));
    });
    
    setCryptoPrices(updatedPrices);
    
    // Sync crypto prices to asset tracker
    syncAssetTrackerCryptoPrices(updatedPrices);
    
  }, [currentDay, marketTrend, stockMarketHealth]);
  
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
                             
  // Get unique sectors for filtering
  const sectors = Array.from(new Set(expandedStockMarket.map(stock => stock.sector)));
  
  // Filter stocks based on search query and selected sector
  const filteredStocks = expandedStockMarket.filter(stock => {
    const matchesSearch = searchQuery === '' || 
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSector = selectedSector === 'all' || stock.sector === selectedSector;
    
    return matchesSearch && matchesSector;
  });

  return (
    <div className="p-4 bg-background rounded-lg shadow-lg animate-scale-in border border-border">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="bg-background hover:bg-muted border-border text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    
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
      
      <Tabs defaultValue="browse" className="mb-4">
        <TabsList className="mb-4 grid w-full grid-cols-6 h-12">
          <TabsTrigger value="browse" className="flex items-center justify-center gap-2">
            <Search className="h-4 w-4" />
            <span>Stocks</span>
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 8H13.5C14.3284 8 15 8.67157 15 9.5C15 10.3284 14.3284 11 13.5 11H9V8Z" fill="currentColor"/>
              <path d="M9 11H14.5C15.3284 11 16 11.6716 16 12.5C16 13.3284 15.3284 14 14.5 14H9V11Z" fill="currentColor"/>
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 18V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Crypto</span>
          </TabsTrigger>
          <TabsTrigger value="bonds" className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 14H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Bonds</span>
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Startups</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center justify-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center justify-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analysis</span>
          </TabsTrigger>
        </TabsList>
        
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
                  onChange={(e) => setSelectedSector(e.target.value)}
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
        
        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg" id="portfolio-heading">My Stock Portfolio</h3>
              
              {/* Portfolio Summary */}
              <div className="bg-muted p-3 rounded-md mb-3 border">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Total Stocks:</p>
                  <p className="font-semibold">{assets.filter(a => a.type === 'stock').length}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm font-medium">Total Value:</p>
                  <p className="font-semibold">{formatCurrency(
                    assets
                      .filter(a => a.type === 'stock')
                      .reduce((total, asset) => {
                        const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
                        return total + (asset.quantity * currentPrice);
                      }, 0)
                  )}</p>
                </div>
              </div>
              
              {/* Owned Stocks List */}
              <div 
                className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
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
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Set selected stock and prepare for selling
                                const stockData = expandedStockMarket.find(s => s.id === asset.id);
                                if (stockData) {
                                  setSelectedStock(stockData);
                                  setBuyMode('shares');
                                  setShareQuantity(asset.quantity);
                                }
                              }}
                              className="px-2 py-0.5 bg-accessible-red/10 text-accessible-red rounded hover:bg-accessible-red/20 transition-colors"
                            >
                              Sell
                            </button>
                          </div>
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
        
        {/* Analysis Tab */}
        <TabsContent value="analysis" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Performance Analysis</h3>
              <div className="bg-muted p-3 rounded-md mb-3 border">
                <h4 className="font-medium mb-2">Top Performers</h4>
                {assets.filter(a => a.type === 'stock').length > 0 ? (
                  <div className="space-y-2">
                    {assets
                      .filter(a => a.type === 'stock')
                      .map(asset => {
                        const stock = expandedStockMarket.find(s => s.id === asset.id);
                        if (!stock) return null;
                        
                        const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
                        const profitLossPercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
                        
                        return {
                          asset,
                          stock,
                          profitLossPercent
                        };
                      })
                      .filter(Boolean)
                      .sort((a, b) => b!.profitLossPercent - a!.profitLossPercent)
                      .slice(0, 3)
                      .map(item => {
                        if (!item) return null;
                        return (
                          <div key={`top-${item.asset.id}`} className="flex justify-between items-center p-2 bg-background rounded border">
                            <span className="font-medium">{item.stock.name}</span>
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
                  <p className="text-gray-500 text-sm text-center">No stock data available</p>
                )}
              </div>
              
              <div className="bg-muted p-3 rounded-md mb-3 border">
                <h4 className="font-medium mb-2">Sector Distribution</h4>
                {assets.filter(a => a.type === 'stock').length > 0 ? (
                  <div className="space-y-2">
                    {(() => {
                      const sectorData: Record<string, {
                        name: string,
                        value: number,
                        count: number
                      }> = {};
                      
                      assets
                        .filter(a => a.type === 'stock')
                        .forEach(asset => {
                          const stock = expandedStockMarket.find(s => s.id === asset.id);
                          if (!stock) return;
                          
                          const sector = stock.sector;
                          const currentPrice = stockPrices[asset.id] || asset.purchasePrice;
                          const value = asset.quantity * currentPrice;
                          
                          if (sectorData[sector]) {
                            sectorData[sector].value += value;
                            sectorData[sector].count += 1;
                          } else {
                            sectorData[sector] = {
                              name: sector,
                              value,
                              count: 1
                            };
                          }
                        });
                      
                      const totalValue = Object.values(sectorData).reduce((sum, item) => sum + item.value, 0);
                      
                      return Object.values(sectorData)
                        .sort((a, b) => b.value - a.value)
                        .map(sector => {
                          const percentage = (sector.value / totalValue) * 100;
                          return (
                            <div key={`sector-${sector.name}`} className="mb-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span>{sector.name.charAt(0).toUpperCase() + sector.name.slice(1).replace('_', ' ')}</span>
                                <span className="font-medium">{percentage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-accessible-blue"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">No sector data available</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg">Market Recommendations</h3>
              
              {marketTrend === 'bull' && (
                <div className="p-3 bg-accessible-green/10 rounded-md border border-accessible-green mb-3">
                  <h4 className="font-medium flex items-center text-accessible-green">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Bull Market Strategy
                  </h4>
                  <p className="text-sm mt-1">
                    In a bull market, consider investing in growth stocks with higher volatility for potentially greater returns.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Recommended Sectors:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Technology</span>
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Consumer Discretionary</span>
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Communication Services</span>
                    </div>
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
                    During a bear market, consider defensive stocks with lower volatility and stable dividends.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Recommended Sectors:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Utilities</span>
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Consumer Staples</span>
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Healthcare</span>
                    </div>
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
                    In a stable market, a balanced approach with diversification across sectors is recommended.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Recommended Approach:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Diversification</span>
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Value Investing</span>
                      <span className="px-2 py-0.5 bg-accent-muted rounded-full text-xs">Mixed Portfolio</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-muted p-3 rounded-md mb-3 border">
                <h4 className="font-medium mb-2">Volatility Spectrum</h4>
                <div className="flex items-center mb-1">
                  <span className="text-xs w-24">Low Risk</span>
                  <div className="flex-1 h-2 bg-gradient-to-r from-accessible-green to-accessible-red rounded-full"></div>
                  <span className="text-xs w-24 text-right">High Risk</span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-center text-xs mt-2">
                  <div>
                    <span className="block mb-1 px-1 py-0.5 rounded bg-accessible-green/10 text-accessible-green">Very Low</span>
                    <span className="text-gray-500">Utilities</span>
                  </div>
                  <div>
                    <span className="block mb-1 px-1 py-0.5 rounded bg-accessible-green/20 text-accessible-green">Low</span>
                    <span className="text-gray-500">Consumer<br/>Staples</span>
                  </div>
                  <div>
                    <span className="block mb-1 px-1 py-0.5 rounded bg-accessible-orange/20 text-accessible-orange">Medium</span>
                    <span className="text-gray-500">Industrials</span>
                  </div>
                  <div>
                    <span className="block mb-1 px-1 py-0.5 rounded bg-accessible-red/10 text-accessible-red">High</span>
                    <span className="text-gray-500">Technology</span>
                  </div>
                  <div>
                    <span className="block mb-1 px-1 py-0.5 rounded bg-accessible-red/20 text-accessible-red">Very High</span>
                    <span className="text-gray-500">Growth<br/>Startups</span>
                  </div>
                </div>
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
                {cryptoTypes.map((crypto, index) => (
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
                    onChange={(e) => setBondAmount(Math.max(selectedBond.minInvestment, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 border border-input bg-background rounded-md text-sm text-foreground"
                    min={selectedBond.minInvestment}
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
                    onChange={(e) => setStartupAmount(Math.max(selectedStartup.minInvestment, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 border border-input bg-background rounded-md text-sm text-foreground"
                    min={selectedStartup.minInvestment}
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
      
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 text-lg">Make Investment</h3>
        <div className="mb-4">
          <div className="flex justify-between mb-3">
            <div 
              onClick={() => setBuyMode('amount')} 
              className={`px-4 py-2 rounded-l-md border text-center w-1/2 cursor-pointer ${
                buyMode === 'amount' 
                  ? 'bg-accessible-blue/10 border-accessible-blue text-accessible-blue font-medium' 
                  : 'bg-muted border-gray-200'
              }`}
            >
              By Amount
            </div>
            <div 
              onClick={() => setBuyMode('shares')} 
              className={`px-4 py-2 rounded-r-md border text-center w-1/2 cursor-pointer ${
                buyMode === 'shares' 
                  ? 'bg-accessible-blue/10 border-accessible-blue text-accessible-blue font-medium' 
                  : 'bg-muted border-gray-200'
              }`}
            >
              By Shares
            </div>
          </div>
          
          {buyMode === 'amount' ? (
            <div className="bg-muted p-3 rounded-md">
              <label className="block text-sm font-medium mb-2" id="investment-amount-label">
                Investment Amount: <span className="font-semibold">{formatCurrency(investmentAmount)}</span>
              </label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[investmentAmount]}
                  max={Math.min(100000, wealth)}
                  step={100}
                  onValueChange={(vals) => setInvestmentAmount(vals[0])}
                  aria-labelledby="investment-amount-label"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInvestmentAmount(wealth)}
                  className="px-4"
                  aria-label={`Set maximum investment amount of ${formatCurrency(wealth)}`}
                >
                  Max
                </Button>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Your available funds: {formatCurrency(wealth)}
                </p>
                <p className="text-xs text-gray-500">
                  Shares to buy: <span className="font-medium">{shareQuantity.toFixed(2)}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-muted p-3 rounded-md">
              <label className="block text-sm font-medium mb-2" id="shares-quantity-label">
                Number of Shares: <span className="font-semibold">{shareQuantity.toFixed(2)}</span>
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={shareQuantity}
                  onChange={(e) => setShareQuantity(parseFloat(e.target.value) || 0)}
                  className="p-2 border rounded-md w-full"
                  aria-labelledby="shares-quantity-label"
                />
                
                {getOwnedStockQuantity(selectedStock.id) > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShareQuantity(getOwnedStockQuantity(selectedStock.id))}
                    className="px-3 whitespace-nowrap"
                  >
                    Max Owned
                  </Button>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Cost: {formatCurrency(investmentAmount)}
                </p>
                <p className="text-xs text-gray-500">
                  Your funds: {formatCurrency(wealth)}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleBuy}
            disabled={
              buyMode === 'amount'
                ? (investmentAmount <= 0 || investmentAmount > wealth)
                : (shareQuantity <= 0 || calculateAmountFromShares(shareQuantity) > wealth)
            }
            className="flex-1 py-3 text-base font-medium"
            aria-label={
              buyMode === 'amount'
                ? `Buy shares of ${selectedStock.name} for ${formatCurrency(investmentAmount)}`
                : `Buy ${shareQuantity.toFixed(2)} shares of ${selectedStock.name}`
            }
          >
            <span className="flex items-center">
              Buy Shares
              <TrendingUp className="ml-2 h-4 w-4" />
            </span>
          </Button>
          
          <Button 
            onClick={handleSell}
            disabled={getOwnedStockQuantity(selectedStock.id) <= 0}
            variant="outline"
            className="flex-1 py-3 text-base font-medium"
            aria-label={
              buyMode === 'shares' && shareQuantity > 0 && shareQuantity < getOwnedStockQuantity(selectedStock.id)
                ? `Sell ${shareQuantity.toFixed(2)} shares of ${selectedStock.name}`
                : `Sell all ${getOwnedStockQuantity(selectedStock.id).toFixed(2)} shares of ${selectedStock.name}`
            }
          >
            <span className="flex items-center">
              {buyMode === 'shares' && shareQuantity > 0 && shareQuantity < getOwnedStockQuantity(selectedStock.id)
                ? `Sell ${shareQuantity.toFixed(2)} Shares`
                : 'Sell All Shares'
              }
              <TrendingDown className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </div>
        
        {isVolatilityWarning && (
          <div className="mt-3 flex items-start gap-2 bg-accessible-orange/10 text-accessible-orange p-3 rounded-md">
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
    </div>
  );
}

export default Investments;
