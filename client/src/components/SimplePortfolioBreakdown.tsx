import { useEffect, useState, useCallback } from 'react';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useCharacter } from '../lib/stores/useCharacter';
import { Banknote, BarChart3, Home, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

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
  
  // Get character wealth directly for the cash ratio calculation
  const characterCash = useCharacter(state => state.wealth);
  
  // Get all the values we need from the asset tracker
  const {
    totalCash,
    totalStocks,
    totalCrypto, 
    totalBonds,
    totalOtherInvestments,
    totalPropertyEquity,
    totalPropertyValue,
    totalPropertyDebt,
    totalLifestyleValue,
    totalNetWorth
  } = useAssetTracker();
  
  // Local state for UI rendering
  const [displayTotal, setDisplayTotal] = useState(totalNetWorth || 0);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  
  // Function to update the asset categories based on the latest data
  const updateAssetCategories = useCallback(() => {
    // Cash assets category
    const cashAssets: AssetCategory = {
      title: "Liquid Assets",
      icon: <Banknote size={16} />,
      color: "bg-blue-500",
      totalValue: totalCash,
      items: [
        { label: 'Cash', value: totalCash, color: 'bg-blue-500' }
      ]
    };
    
    // Investment assets category
    const investmentValue = totalStocks + totalCrypto + totalBonds + totalOtherInvestments;
    const investmentAssets: AssetCategory = {
      title: "Investments",
      icon: <BarChart3 size={16} />,
      color: "bg-green-500",
      totalValue: investmentValue,
      items: [
        { label: 'Stocks', value: totalStocks, color: 'bg-green-500' },
        { label: 'Crypto', value: totalCrypto, color: 'bg-amber-500' },
        { label: 'Bonds', value: totalBonds, color: 'bg-indigo-500' },
        { label: 'Other', value: totalOtherInvestments, color: 'bg-purple-500' }
      ]
    };
    
    // Property assets category
    const propertyAssets: AssetCategory = {
      title: "Properties",
      icon: <Home size={16} />,
      color: "bg-pink-500",
      totalValue: totalPropertyEquity,
      items: [
        { label: 'Property Equity', value: totalPropertyEquity, color: 'bg-pink-500' }
      ]
    };
    
    // Lifestyle assets category
    const lifestyleAssets: AssetCategory = {
      title: "Lifestyle Assets",
      icon: <ShoppingBag size={16} />,
      color: "bg-rose-500",
      totalValue: totalLifestyleValue,
      items: [
        { label: 'Lifestyle Items', value: totalLifestyleValue, color: 'bg-rose-500' }
      ]
    };
    
    // Combine all categories
    const categories = [cashAssets, investmentAssets, propertyAssets, lifestyleAssets];
    setAssetCategories(categories);
    
    // Also update the display total
    setDisplayTotal(totalNetWorth);
    
  }, [totalCash, totalStocks, totalCrypto, totalBonds, totalOtherInvestments, 
      totalPropertyEquity, totalLifestyleValue, totalNetWorth]);
  
  // Update the display when any of the asset values change
  useEffect(() => {
    // Force a refresh of asset values from the source of truth
    useAssetTracker.getState().recalculateTotals();
    
    // Then update the categories with fresh data
    updateAssetCategories();
    
    console.log("Portfolio breakdown updated with latest asset values:", {
      cash: totalCash,
      stocks: totalStocks,
      netWorth: totalNetWorth
    });
    
    // Set up a frequent refresh timer to keep values updated
    const intervalId = setInterval(() => {
      // Force recalculation of asset values
      useAssetTracker.getState().recalculateTotals();
      
      // Then sync character assets with asset tracker
      useCharacter.getState().syncAssetsWithAssetTracker();
      
      // Finally, update the display with the latest values
      updateAssetCategories();
    }, 500); // Update twice per second
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [updateAssetCategories, totalCash, totalStocks, totalNetWorth]);
  
  // Handle manual refresh - also show a toast message
  const handleRefresh = () => {
    setIsLoading(true);
    
    try {
      // Use the global update function if available
      if ((window as any).globalUpdateAllPrices) {
        console.log("SimplePortfolioBreakdown: Using global price update function");
        (window as any).globalUpdateAllPrices();
        // Show visual feedback
        toast.success("Portfolio values refreshed with latest market data", { 
          duration: 2000,
          position: "bottom-center"
        });
      } else {
        // Fallback to direct recalculation
        useAssetTracker.getState().recalculateTotals();
        useCharacter.getState().syncAssetsWithAssetTracker();
        // Show visual feedback
        toast.success("Portfolio values refreshed", { 
          duration: 2000,
          position: "bottom-center"
        });
      }
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast.error("Unable to refresh portfolio values", {
        duration: 2000,
        position: "bottom-center"
      });
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };
  
  // Calculate the actual total to use for percentage calculations
  // (with a fallback to 1 to avoid division by zero)
  const calculatedTotal = totalNetWorth || 1;
  
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