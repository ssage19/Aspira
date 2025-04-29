import { useEffect, useState, useCallback } from 'react';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useCharacter } from '../lib/stores/useCharacter';
import { Banknote, BarChart3, Home, ShoppingBag, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useAssetRefresh } from '../hooks/useAssetRefresh';
import { getOwnershipBreakdown, getTotalOwnershipValue, getBusinesses, getFormula1Team, getHorseRacingData, getSportsTeam } from '../lib/utils/ownershipUtils';
import { WealthTierBadge } from './WealthTierBadge';

// Types for grouped assets
interface AssetItem {
  label: string;
  value: number;
  color: string;
  details?: string; // Additional details like names
}

interface AssetCategory {
  title: string;
  icon: React.ReactNode;
  items: AssetItem[];
  totalValue: number;
  color: string;
}

/**
 * A comprehensive portfolio breakdown that combines investments and ownership
 * assets into a single unified component.
 */
export function ComprehensivePortfolio() {
  const [isLoading, setIsLoading] = useState(false);
  const { triggerRefresh } = useAssetRefresh();
  
  // Get character wealth directly for the cash ratio calculation
  const characterCash = useCharacter(state => state.wealth) || 0;
  
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
    
    // Get detailed data for all ownership assets
    const ownershipBreakdown = getOwnershipBreakdown();
    const totalOwnershipValue = ownershipBreakdown.total;
    
    // Create ownership assets category
    const ownershipAssets: AssetCategory = {
      title: "Ownership Assets",
      icon: <Trophy size={16} />,
      color: "bg-amber-600",
      totalValue: totalOwnershipValue,
      items: []
    };
    
    // Get detailed data for each ownership type
    const f1Team = getFormula1Team();
    const horses = getHorseRacingData();
    const sportsTeam = getSportsTeam();
    const businesses = getBusinesses();
    
    // Add F1 team if owned
    if (f1Team && f1Team.owned) {
      ownershipAssets.items.push({
        label: 'Formula 1 Team',
        value: f1Team.value,
        color: 'bg-red-500',
        details: f1Team.name
      });
    }
    
    // Add horses if owned
    if (horses && horses.length > 0) {
      const horseNames = horses.map(horse => horse.name).join(', ');
      ownershipAssets.items.push({
        label: `Racing Horses (${horses.length})`,
        value: horses.reduce((total, horse) => total + horse.price, 0),
        color: 'bg-yellow-600',
        details: horseNames
      });
    }
    
    // Add sports team if owned
    if (sportsTeam && sportsTeam.owned) {
      ownershipAssets.items.push({
        label: 'Sports Team',
        value: sportsTeam.value,
        color: 'bg-blue-600',
        details: sportsTeam.name
      });
    }
    
    // Add businesses if owned
    if (businesses && businesses.length > 0) {
      const businessNames = businesses.map(business => business.name).join(', ');
      ownershipAssets.items.push({
        label: `Businesses (${businesses.length})`,
        value: businesses.reduce((total, business) => total + business.currentValue, 0),
        color: 'bg-emerald-500',
        details: businessNames
      });
    }
    
    // Combine all categories
    const categories = [cashAssets, investmentAssets, propertyAssets, lifestyleAssets];
    
    // Only add ownership category if there are ownership assets
    if (totalOwnershipValue > 0) {
      categories.push(ownershipAssets);
    }
    
    setAssetCategories(categories);
    
    // Use the actual total net worth from the asset tracker (already includes ownership assets)
    setDisplayTotal(totalNetWorth);
    
  }, [totalCash, totalStocks, totalCrypto, totalBonds, totalOtherInvestments, 
      totalPropertyEquity, totalLifestyleValue, totalNetWorth]);
  
  // Immediately refresh values when component mounts
  useEffect(() => {
    console.log("ComprehensivePortfolio: Component mounted");
    
    // First trigger market price update on component mount
    if ((window as any).globalUpdateAllPrices) {
      console.log("ComprehensivePortfolio: Triggering global price update on mount");
      (window as any).globalUpdateAllPrices();
    }
    
    // Then sync character assets with asset tracker (investments, properties, etc.)
    useCharacter.getState().syncAssetsWithAssetTracker();
    
    // Force a refresh of asset values from the source of truth
    useAssetTracker.getState().recalculateTotals();
    
    // Update the categories with fresh data
    updateAssetCategories();
    
    console.log("Portfolio breakdown initial update:", {
      cash: totalCash,
      stocks: totalStocks,
      netWorth: totalNetWorth
    });
  }, []);
  
  // Update the display when any of the asset values change
  useEffect(() => {
    console.log("Portfolio breakdown detected value changes:", {
      cash: totalCash,
      stocks: totalStocks,
      netWorth: totalNetWorth
    });
    
    // Update categories whenever values change
    updateAssetCategories();
    
    // Set up a refresh timer but at a reduced frequency to avoid performance issues
    const intervalId = setInterval(() => {
      // First trigger market price updates to keep investment values fresh
      if ((window as any).globalUpdateAllPrices) {
        (window as any).globalUpdateAllPrices();
      }
      
      // Then sync assets
      useCharacter.getState().syncAssetsWithAssetTracker();
      
      // Recalculate totals 
      useAssetTracker.getState().recalculateTotals();
      
      // Finally, update the local UI
      updateAssetCategories();
      
    }, 3000); // Update every 3 seconds (reduced from 500ms)
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [updateAssetCategories, totalCash, totalStocks, totalCrypto, totalBonds, 
      totalOtherInvestments, totalPropertyEquity, totalPropertyValue, totalLifestyleValue, totalNetWorth]);
  
  // Enhanced manual refresh - more aggressive about getting fresh data
  const handleRefresh = async () => {
    setIsLoading(true);
    
    console.log("🔄 PORTFOLIO REFRESH INITIATED", {
      currentStocks: totalStocks,
      currentNetWorth: totalNetWorth,
      currentCash: totalCash
    });
    
    try {
      // First trigger the global market price update to ensure investment values are current
      if ((window as any).globalUpdateAllPrices) {
        console.log("ComprehensivePortfolio: Triggering global price update");
        (window as any).globalUpdateAllPrices();
      }
      
      // Add a slight delay for price updates to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then ensure character assets are synced with asset tracker
      useCharacter.getState().syncAssetsWithAssetTracker();
      
      // Force asset tracker to recalculate everything
      useAssetTracker.getState().recalculateTotals();
      
      // Use the global refresh to make sure all components update
      await triggerRefresh();
      
      // Add a slight delay to ensure updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force another sync from character to asset tracker (important after investments change)
      useCharacter.getState().syncAssetsWithAssetTracker();
      
      // Recalculate totals again after syncing
      useAssetTracker.getState().recalculateTotals();
      
      // Get the latest values
      const assetTracker = useAssetTracker.getState();
      
      // Force a UI update with the very latest values (already includes ownership assets)
      setDisplayTotal(assetTracker.totalNetWorth);
      
      // Update our local categories with latest data
      updateAssetCategories();
      
      console.log("✅ PORTFOLIO REFRESH COMPLETE - LATEST VALUES:", {
        stocks: assetTracker.totalStocks,
        netWorth: assetTracker.totalNetWorth,
        cash: assetTracker.totalCash
      });
      
      // Show visual feedback
      toast.success(`Portfolio refreshed: ${formatCurrency(assetTracker.totalNetWorth)}`, {
        duration: 2000,
        position: "bottom-center"
      });
    } catch (error) {
      console.error("❌ ERROR DURING PORTFOLIO REFRESH:", error);
      toast.error("Unable to refresh portfolio values", {
        duration: 2000,
        position: "bottom-center"
      });
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };
  
  // Calculate the actual total to use for percentage calculations
  // (with a fallback to 1 to avoid division by zero)
  // No need to add ownership values as they are already included in totalNetWorth
  const calculatedTotal = totalNetWorth || 1;
  
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Asset Portfolio</span>
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
            <span className="text-base font-normal text-foreground-muted">{formatCurrency(displayTotal)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Asset Categories Breakdown */}
        {assetCategories.map((category, catIndex) => (
          <div key={catIndex} className={catIndex > 0 ? "mt-4 pt-3 border-t border-border" : ""}>
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
                      <tr key={index} className="border-b border-border/50 last:border-0">
                        <td className="py-1">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full ${asset.color} mr-2`}></div>
                              <span className="text-xs font-medium">{asset.label}</span>
                            </div>
                            {asset.details && (
                              <span className="text-xs text-muted-foreground pl-4 mt-0.5 italic">
                                {asset.details}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right text-xs">{formatCurrency(asset.value)}</td>
                        <td className="text-right text-xs w-16 font-medium">
                          {formatPercentage(asset.value / (calculatedTotal || 1))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-foreground-muted italic py-1">
                  {category.title === "Liquid Assets" 
                    ? "No additional liquid assets"
                    : category.title === "Investments" 
                    ? "No investment assets yet"
                    : category.title === "Properties" 
                    ? "No properties owned yet"
                    : category.title === "Ownership Assets"
                    ? "No businesses or teams owned yet" 
                    : "No lifestyle assets owned yet"}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {/* Financial health indicators */}
        <div className="mt-4 pt-3 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Financial Health</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Cash Ratio */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground-muted">Cash Ratio</span>
              <span className={`font-medium ${
                ((characterCash) / calculatedTotal) > 0.15 ? 'text-green-600' : 
                ((characterCash) / calculatedTotal) > 0.05 ? 'text-amber-600' : 
                'text-red-600'}`}>
                {formatPercentage(characterCash / calculatedTotal)}
              </span>
            </div>
            
            {/* Investment Diversification */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground-muted">Diversification</span>
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