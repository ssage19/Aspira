import React, { useState, useEffect } from 'react';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { expandedStockMarket } from '../lib/data/sp500Stocks';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useEconomy } from '../lib/stores/useEconomy';

export function StockPriceMonitor() {
  const assetTracker = useAssetTracker();
  const { marketTrend } = useEconomy();
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  // Get a subset of stocks to display (first 5 well-known stocks)
  const displayStocks = expandedStockMarket.slice(0, 5);

  // Check if market is open
  useEffect(() => {
    const checkMarketOpen = () => {
      if ((window as any).isMarketOpen) {
        setIsMarketOpen((window as any).isMarketOpen());
      } else {
        setIsMarketOpen(false);
      }
    };
    
    // Check immediately
    checkMarketOpen();
    
    // Set up interval to check market status
    const interval = setInterval(checkMarketOpen, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Monitor stock prices from the asset tracker
  useEffect(() => {
    // Get current prices
    const currentPrices: Record<string, number> = {};
    
    displayStocks.forEach(stock => {
      const price = assetTracker.globalStockPrices[stock.id] || stock.basePrice;
      currentPrices[stock.id] = price;
    });
    
    // Calculate changes if we have previous prices
    if (Object.keys(stockPrices).length > 0) {
      const changes: Record<string, number> = {};
      
      displayStocks.forEach(stock => {
        const currentPrice = currentPrices[stock.id];
        const previousPrice = stockPrices[stock.id];
        
        if (currentPrice && previousPrice) {
          changes[stock.id] = ((currentPrice - previousPrice) / previousPrice) * 100;
        }
      });
      
      // Update previous prices before setting current prices
      setPreviousPrices({...stockPrices});
      setPriceChanges(changes);
    }
    
    // Set current prices
    setStockPrices(currentPrices);
    
    // Set up timer for next refresh
    const timer = setTimeout(() => {
      setRefreshCounter(prev => prev + 1);
    }, 1000); // Check every second for changes
    
    return () => clearTimeout(timer);
  }, [assetTracker.globalStockPrices, refreshCounter]);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Stock Market</span>
          <Badge 
            variant={isMarketOpen ? "default" : "secondary"} 
            className="ml-2"
          >
            {isMarketOpen ? 'OPEN' : 'CLOSED'}
            {!isMarketOpen && <Clock className="w-3 h-3 ml-1" />}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <Badge variant="outline" className="mb-2">
            Market Trend: {marketTrend === 'bull' ? 'Bullish' : marketTrend === 'bear' ? 'Bearish' : 'Neutral'}
          </Badge>
        </div>
        <div className="space-y-2">
          {displayStocks.map(stock => {
            const currentPrice = stockPrices[stock.id] || stock.basePrice;
            const percentChange = priceChanges[stock.id] || 0;
            const isUp = percentChange >= 0;
            
            // Generate a different color based on price change
            let changeColor = 'text-gray-500';
            if (percentChange > 0.1) changeColor = 'text-green-500';
            else if (percentChange < -0.1) changeColor = 'text-red-500';
            
            return (
              <div key={stock.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="font-medium">{stock.name}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-3 font-medium">{formatCurrency(currentPrice)}</div>
                  <div className={`flex items-center ${changeColor}`}>
                    {isUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    <span>{formatPercentage(Math.abs(percentChange/100))}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}