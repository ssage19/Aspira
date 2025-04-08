import { useEffect, useState, useCallback } from 'react';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useCharacter } from '../lib/stores/useCharacter';
import { Banknote, BarChart3, Home, ShoppingBag } from 'lucide-react';
import { shallow } from 'zustand/shallow';

// Types for grouped assets
interface AssetItem {
  label: string;
  value: number;
  color: string;
}

interface AssetCategory {
  title: string;
  icon: React.ReactNode;
  items: AssetItem[];
  totalValue: number;
  color: string;
}

/**
 * A simpler portfolio breakdown that doesn't use any chart.js components
 * Instead, it uses a clean text-based layout that's responsive and reliable.
 */
export function SimplePortfolioBreakdown() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get character data for consistency
  const { wealth, netWorth, calculateNetWorth } = useCharacter();
  const [displayTotal, setDisplayTotal] = useState(netWorth);
  
  // Source of truth for character cash (defined early to avoid reference errors)
  const characterCash = useCharacter.getState().wealth || 0;
  
  // Get asset tracker data
  const { 
    totalStocks,
    totalCrypto,
    totalBonds,
    totalOtherInvestments,
    totalPropertyEquity,
    totalLifestyleValue
  } = useAssetTracker();
  
  // For real-time totals
  const [calculatedTotal, setCalculatedTotal] = useState(netWorth || 1);
  
  // State for asset categories
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  
  // Get the breakdown from character store
  const getCharacterBreakdown = () => {
    // Force recalculation of net worth in useCharacter
    const characterNetWorth = useCharacter.getState().calculateNetWorth();
    
    // Get the detailed breakdown
    const breakdown = useCharacter.getState().getNetWorthBreakdown();
    
    return {
      characterNetWorth,
      breakdown
    };
  };
  
  // Update asset categories based on the breakdown
  const updateAssetCategories = (breakdown: any) => {
    // Cash assets
    const cashAssets: AssetCategory = {
      title: "Liquid Assets",
      icon: <Banknote size={16} />,
      color: "bg-blue-500",
      totalValue: breakdown.cash || 0,
      items: [
        { label: 'Cash', value: breakdown.cash || 0, color: 'bg-blue-500' }
      ]
    };
    
    // Investment assets
    const investmentValue = (breakdown.stocks || 0) + 
                           (breakdown.crypto || 0) + 
                           (breakdown.bonds || 0) + 
                           (breakdown.otherInvestments || 0);
    
    const investmentAssets: AssetCategory = {
      title: "Investments",
      icon: <BarChart3 size={16} />,
      color: "bg-green-500",
      totalValue: investmentValue,
      items: [
        { label: 'Stocks', value: breakdown.stocks || 0, color: 'bg-green-500' },
        { label: 'Crypto', value: breakdown.crypto || 0, color: 'bg-amber-500' },
        { label: 'Bonds', value: breakdown.bonds || 0, color: 'bg-indigo-500' },
        { label: 'Other', value: breakdown.otherInvestments || 0, color: 'bg-purple-500' }
      ] // Show all investment types, even with zero value
    };
    
    // Property assets
    const propertyAssets: AssetCategory = {
      title: "Properties",
      icon: <Home size={16} />,
      color: "bg-pink-500",
      totalValue: breakdown.propertyEquity || 0,
      items: [
        { label: 'Property Equity', value: breakdown.propertyEquity || 0, color: 'bg-pink-500' }
      ] // Show property equity even if zero
    };
    
    // Lifestyle assets
    const lifestyleAssets: AssetCategory = {
      title: "Lifestyle Assets",
      icon: <ShoppingBag size={16} />,
      color: "bg-rose-500",
      totalValue: breakdown.lifestyleItems || 0,
      items: [
        { label: 'Lifestyle Items', value: breakdown.lifestyleItems || 0, color: 'bg-rose-500' }
      ] // Show lifestyle items even if zero
    };
    
    // Always show all categories, even if empty
    const categories = [cashAssets, investmentAssets, propertyAssets, lifestyleAssets];
    
    setAssetCategories(categories);
  };
  
  // Create a function for data updates that can be reused across effects
  const updatePortfolioData = useCallback(() => {
    console.log("Portfolio breakdown refreshing asset data...");
    
    // IMPROVED SYNC SEQUENCE:
    // 1. First refresh the asset tracker totals to ensure they're up-to-date
    useAssetTracker.getState().recalculateTotals();
    
    // 2. Then ensure character assets are synced with asset tracker
    useCharacter.getState().syncAssetsWithAssetTracker();
    
    // 3. Then recalculate the asset tracker totals again (in case sync updated anything)
    useAssetTracker.getState().recalculateTotals();
    
    // 4. Finally recalculate net worth to reflect the current state
    const recalculatedNetWorth = useCharacter.getState().calculateNetWorth();
    
    // Get the current asset tracker state directly - this is our source of truth
    const assetTracker = useAssetTracker.getState();
    
    // Get character breakdown for debugging comparison
    const { characterNetWorth, breakdown } = getCharacterBreakdown();
    
    // If there's a mismatch between the sources, log it for debugging
    if (Math.abs(characterNetWorth - assetTracker.totalNetWorth) > 0.01) {
      console.warn("Net worth mismatch detected between character and asset tracker:", {
        characterNetWorth,
        assetTrackerNetWorth: assetTracker.totalNetWorth,
        difference: characterNetWorth - assetTracker.totalNetWorth
      });
    }
    
    // Log asset tracker values for debugging/comparison
    console.log("Portfolio breakdown using ASSET TRACKER values:", {
      cash: assetTracker.totalCash,
      stocks: assetTracker.totalStocks,
      crypto: assetTracker.totalCrypto,
      bonds: assetTracker.totalBonds,
      otherInvestments: assetTracker.totalOtherInvestments,
      propertyEquity: assetTracker.totalPropertyEquity,
      lifestyleItems: assetTracker.totalLifestyleValue,
      total: assetTracker.totalNetWorth
    });
    
    // Always use asset tracker values for consistency with the Investment tab
    setDisplayTotal(assetTracker.totalNetWorth);
    setCalculatedTotal(assetTracker.totalNetWorth || 1);
    
    // Create breakdown directly from asset tracker (single source of truth)
    const trackerBasedBreakdown = {
      cash: assetTracker.totalCash,
      stocks: assetTracker.totalStocks,
      crypto: assetTracker.totalCrypto,
      bonds: assetTracker.totalBonds,
      otherInvestments: assetTracker.totalOtherInvestments,
      propertyEquity: assetTracker.totalPropertyEquity,
      propertyValue: assetTracker.totalPropertyValue,
      propertyDebt: assetTracker.totalPropertyDebt,
      lifestyleItems: assetTracker.totalLifestyleValue,
      total: assetTracker.totalNetWorth
    };
    
    // Update asset categories using the tracker-based breakdown
    updateAssetCategories(trackerBasedBreakdown);
  }, []);
  
  // Set up interval for updates
  useEffect(() => {
    // Update immediately
    updatePortfolioData();
    
    // Set up refresh every 250ms (more frequent than before to catch updates faster)
    const intervalId = setInterval(updatePortfolioData, 250);
    
    console.log("Setting up portfolio updates with interval");
    
    return () => {
      clearInterval(intervalId);
    };
  }, [updatePortfolioData]);
  
  // Set up a watch for asset tracker changes
  useEffect(() => {
    // This is a simple polling mechanism to watch for asset tracker changes
    let lastStocksTotal = useAssetTracker.getState().totalStocks;
    let lastNetWorth = useAssetTracker.getState().totalNetWorth;
    let lastUpdated = useAssetTracker.getState().lastUpdated;
    
    const checkForChanges = () => {
      const currentState = useAssetTracker.getState();
      
      if (
        currentState.totalStocks !== lastStocksTotal ||
        currentState.totalNetWorth !== lastNetWorth ||
        currentState.lastUpdated !== lastUpdated
      ) {
        console.log("Portfolio breakdown detected asset tracker change");
        
        // Update our tracking values
        lastStocksTotal = currentState.totalStocks;
        lastNetWorth = currentState.totalNetWorth;
        lastUpdated = currentState.lastUpdated;
        
        // Force an immediate update
        updatePortfolioData();
      }
    };
    
    // Check for changes more frequently than the main interval
    const watcherId = setInterval(checkForChanges, 100);
    
    console.log("Setting up asset tracker change detection");
    
    return () => {
      clearInterval(watcherId);
    };
  }, [updatePortfolioData]);
  
  // Handle manual refresh - now uses the global update function
  const handleRefresh = () => {
    setIsLoading(true);
    
    try {
      console.log("Manual refresh - Performing global synchronization...");
      
      // Use the global update function if available
      if ((window as any).globalUpdateAllPrices) {
        console.log("SimplePortfolioBreakdown: Using global price update function");
        (window as any).globalUpdateAllPrices();
      } else {
        // Fallback to local updates if global function not available
        console.log("Global update function not available, using fallback");
        useAssetTracker.getState().forceUpdate();
        updatePortfolioData();
      }
      
      console.log("Manual refresh completed successfully");
    } catch (error) {
      console.error("Error during manual refresh:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };
  
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
        {/* Asset Categories Breakdown */}
        {assetCategories.map((category, catIndex) => (
          <div key={catIndex} className={catIndex > 0 ? "mt-4 pt-3 border-t border-gray-200" : ""}>
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1 rounded ${category.color} bg-opacity-20`}>
                {category.icon}
              </div>
              <h3 className="text-sm font-medium">{category.title}</h3>
              <span className="ml-auto text-sm font-semibold">
                {formatCurrency(category.totalValue)}
              </span>
              <span className="text-xs text-gray-500">
                {formatPercentage(category.totalValue / calculatedTotal)}
              </span>
            </div>
            
            {/* Category Items */}
            <div className="pl-6">
              {category.items.length > 0 ? (
                <table className="w-full border-separate border-spacing-y-1">
                  <tbody>
                    {category.items.map((asset, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-0">
                        <td className="py-1">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${asset.color} mr-2`}></div>
                            <span className="text-xs font-medium">{asset.label}</span>
                          </div>
                        </td>
                        <td className="text-right text-xs">{formatCurrency(asset.value)}</td>
                        <td className="text-right text-xs w-16 font-medium">
                          {formatPercentage(asset.value / calculatedTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-gray-500 italic py-1">
                  {category.title === "Liquid Assets" 
                    ? "No additional liquid assets"
                    : category.title === "Investments" 
                    ? "No investment assets yet"
                    : category.title === "Properties" 
                    ? "No properties owned yet"
                    : "No lifestyle assets owned yet"}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {/* Financial health indicators */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Health</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Cash Ratio */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Cash Ratio</span>
              <span className={`font-medium ${
                ((characterCash) / calculatedTotal) > 0.15 ? 'text-green-600' : 
                ((characterCash) / calculatedTotal) > 0.05 ? 'text-amber-600' : 
                'text-red-600'}`}>
                {formatPercentage(characterCash / calculatedTotal)}
              </span>
            </div>
            
            {/* Investment Diversification */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Diversification</span>
              <span className={`font-medium ${
                assetCategories.filter(category => category.totalValue > 0 && category.title !== "Liquid Assets").length > 1 
                ? 'text-green-600' 
                : 'text-amber-600'
              }`}>
                {assetCategories.filter(category => category.totalValue > 0 && category.title !== "Liquid Assets").length || 0} active
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}