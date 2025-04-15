import React, { useState, useEffect } from 'react';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { cryptoCurrencies } from '../lib/data/investments';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function CryptoPriceMonitor() {
  const assetTracker = useAssetTracker();
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Get a subset of cryptocurrencies to display (top 5 by market cap)
  const displayCryptos = cryptoCurrencies.slice(0, 5);

  // Monitor crypto prices from the asset tracker
  useEffect(() => {
    // Get current prices
    const currentPrices: Record<string, number> = {};
    
    displayCryptos.forEach(crypto => {
      const price = assetTracker.globalCryptoPrices[crypto.id] || crypto.basePrice;
      currentPrices[crypto.id] = price;
    });
    
    // Calculate changes if we have previous prices
    if (Object.keys(cryptoPrices).length > 0) {
      const changes: Record<string, number> = {};
      
      displayCryptos.forEach(crypto => {
        const currentPrice = currentPrices[crypto.id];
        const previousPrice = cryptoPrices[crypto.id];
        
        if (currentPrice && previousPrice) {
          changes[crypto.id] = ((currentPrice - previousPrice) / previousPrice) * 100;
        }
      });
      
      // Update previous prices before setting current prices
      setPreviousPrices({...cryptoPrices});
      setPriceChanges(changes);
    }
    
    // Set current prices
    setCryptoPrices(currentPrices);
    
    // Set up timer for next refresh
    const timer = setTimeout(() => {
      setRefreshCounter(prev => prev + 1);
    }, 1000); // Check every second for changes
    
    return () => clearTimeout(timer);
  }, [assetTracker.globalCryptoPrices, refreshCounter]);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Crypto Live Market</span>
          <Badge variant="outline" className="ml-2">24/7 Market</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayCryptos.map(crypto => {
            const currentPrice = cryptoPrices[crypto.id] || crypto.basePrice;
            const percentChange = priceChanges[crypto.id] || 0;
            const isUp = percentChange >= 0;
            
            // Generate a different color based on price change
            let changeColor = 'text-gray-500';
            if (percentChange > 0.25) changeColor = 'text-green-500';
            else if (percentChange < -0.25) changeColor = 'text-red-500';
            
            return (
              <div key={crypto.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="font-medium">{crypto.name}</div>
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