import { useEffect, useState } from 'react';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useCharacter } from '../lib/stores/useCharacter';

/**
 * A simpler portfolio breakdown that doesn't use any chart.js components
 * Instead, it uses a clean text-based layout that's responsive and reliable.
 */
export function SimplePortfolioBreakdown() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get character data for consistency
  const { wealth, netWorth } = useCharacter();
  const [displayTotal, setDisplayTotal] = useState(netWorth || wealth || 0);
  
  // Source of truth for total and character wealth (defined early to avoid reference errors)
  const characterWealth = useCharacter.getState().wealth || 0;
  const total = useCharacter.getState().netWorth || useAssetTracker.getState().totalNetWorth || 1;
  
  // Get asset tracker data
  const { 
    totalCash,
    totalStocks,
    totalCrypto,
    totalBonds,
    totalOtherInvestments,
    totalPropertyEquity,
    totalLifestyleValue,
    totalNetWorth,
    recalculateTotals,
    forceUpdate
  } = useAssetTracker();
  
  // Force an update when the component mounts
  useEffect(() => {
    // Force immediate recalculation to ensure latest data
    const updateData = () => {
      console.log("Portfolio breakdown refreshing asset data...");
      
      // Get the latest character wealth
      const currentWealth = useCharacter.getState().wealth || 0;
      
      // Force recalculation before grabbing net worth
      recalculateTotals();
      forceUpdate();
      
      // Get the latest character data AFTER recalculation
      const { netWorth: characterNetWorth } = useCharacter.getState();
      
      // Use totalNetWorth directly from the asset tracker first
      const { 
        totalNetWorth: calculatedNetWorth,
        totalStocks: latestStocks,
        totalPropertyEquity: latestProperty,
        totalLifestyleValue: latestLifestyle 
      } = useAssetTracker.getState(); 
      
      console.log("Portfolio breakdown totals:", {
        cash: currentWealth,
        stocks: latestStocks,
        property: latestProperty,
        lifestyle: latestLifestyle,
        calculatedTotal: calculatedNetWorth,
        characterTotal: characterNetWorth
      });
      
      // Set display total
      setDisplayTotal(calculatedNetWorth || characterNetWorth || wealth || 0);
    };
    
    // Update immediately
    updateData();
    
    // Set up refresh every 1 second
    const intervalId = setInterval(updateData, 1000);
    
    // Subscribe to changes in the character store for wealth changes
    const unsubscribeCharacter = useCharacter.subscribe(
      (state) => state.wealth,
      () => {
        console.log("Character wealth changed, updating portfolio");
        updateData();
      }
    );
    
    return () => {
      clearInterval(intervalId);
      unsubscribeCharacter();
    };
  }, [recalculateTotals, forceUpdate, wealth]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    // Get the latest character data
    const { netWorth: characterNetWorth } = useCharacter.getState();
    setDisplayTotal(characterNetWorth || totalNetWorth || wealth || 0);
    
    // Force recalculation
    recalculateTotals();
    forceUpdate();
    
    setTimeout(() => setIsLoading(false), 500);
  };
  
  // Create a state for displayed assets to ensure they update correctly
  const [assetValues, setAssetValues] = useState([
    { label: 'Cash', value: characterWealth, color: 'bg-blue-500' },
    { label: 'Stocks', value: totalStocks || 0, color: 'bg-green-500' },
    { label: 'Crypto', value: totalCrypto || 0, color: 'bg-amber-500' },
    { label: 'Bonds', value: totalBonds || 0, color: 'bg-indigo-500' },
    { label: 'Other', value: totalOtherInvestments || 0, color: 'bg-purple-500' },
    { label: 'Property', value: totalPropertyEquity || 0, color: 'bg-pink-500' },
    { label: 'Lifestyle', value: totalLifestyleValue || 0, color: 'bg-rose-500' }
  ]);
  
  // Update asset values when any of the totals change
  useEffect(() => {
    const newAssets = [
      { label: 'Cash', value: useCharacter.getState().wealth || 0, color: 'bg-blue-500' },
      { label: 'Stocks', value: totalStocks || 0, color: 'bg-green-500' },
      { label: 'Crypto', value: totalCrypto || 0, color: 'bg-amber-500' },
      { label: 'Bonds', value: totalBonds || 0, color: 'bg-indigo-500' },
      { label: 'Other', value: totalOtherInvestments || 0, color: 'bg-purple-500' },
      { label: 'Property', value: totalPropertyEquity || 0, color: 'bg-pink-500' },
      { label: 'Lifestyle', value: totalLifestyleValue || 0, color: 'bg-rose-500' }
    ];
    setAssetValues(newAssets);
  }, [totalStocks, totalCrypto, totalBonds, totalOtherInvestments, totalPropertyEquity, totalLifestyleValue]);
  
  // Filter to only show assets with value
  const assets = assetValues.filter(item => item.value > 0);
    
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Portfolio Breakdown</span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleRefresh} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <span className="text-base font-normal text-gray-600">{formatCurrency(displayTotal)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Asset Breakdown Table */}
        <div className="w-full">
          <table className="w-full border-separate border-spacing-y-1">
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${asset.color} mr-2`}></div>
                      <span className="text-sm font-medium">{asset.label}</span>
                    </div>
                  </td>
                  <td className="text-right text-sm">{formatCurrency(asset.value)}</td>
                  <td className="text-right text-sm w-16 font-medium">
                    {formatPercentage(asset.value / total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Financial health indicators */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Health</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Cash Ratio */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Cash Ratio</span>
              <span className={`font-medium ${
                ((characterWealth) / total) > 0.15 ? 'text-green-600' : 
                ((characterWealth) / total) > 0.05 ? 'text-amber-600' : 
                'text-red-600'}`}>
                {formatPercentage(characterWealth / total)}
              </span>
            </div>
            
            {/* Investment Diversification */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Diversification</span>
              <span className="font-medium">
                {assets.filter(a => a.label !== 'Cash').length} types
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}