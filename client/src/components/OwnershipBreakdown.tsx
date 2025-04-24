import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { getOwnershipBreakdown, getTotalOwnershipValue } from '../lib/utils/ownershipUtils';
import { formatCurrency, formatPercentage } from '../lib/utils';

/**
 * Dedicated component to display ownership assets valuation
 */
export function OwnershipBreakdown() {
  const [isLoading, setIsLoading] = useState(false);
  const [ownershipData, setOwnershipData] = useState(() => getOwnershipBreakdown());
  const [totalValue, setTotalValue] = useState(() => getTotalOwnershipValue());
  
  // Refresh ownership data
  const refreshOwnershipData = useCallback(() => {
    setIsLoading(true);
    
    try {
      const freshData = getOwnershipBreakdown();
      setOwnershipData(freshData);
      setTotalValue(freshData.total);
      console.log("Ownership data refreshed:", freshData);
    } catch (error) {
      console.error("Error refreshing ownership data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initial data load and periodic refresh
  useEffect(() => {
    refreshOwnershipData();
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      refreshOwnershipData();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [refreshOwnershipData]);
  
  // Manual refresh handler
  const handleRefresh = () => {
    refreshOwnershipData();
    toast.success("Ownership assets refreshed");
  };
  
  // No ownership assets message
  if (totalValue === 0) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg flex justify-between items-center">
            <span className="flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-amber-500" />
              Ownership Assets
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleRefresh} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm p-4">
          <p>You don't own any business or team assets yet.</p>
          <p className="mt-2">Explore ownership opportunities in:</p>
          <ul className="list-disc ml-5 mt-1">
            <li>Formula 1 Racing Teams</li>
            <li>Horse Racing</li>
            <li>Professional Sports Teams</li>
          </ul>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg flex justify-between items-center">
          <span className="flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-amber-500" />
            Ownership Assets
          </span>
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
            <span className="text-base font-normal text-foreground-muted">{formatCurrency(totalValue)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <table className="w-full border-separate border-spacing-y-2">
          <tbody>
            {/* Formula 1 Team */}
            {ownershipData.f1Team.owned && (
              <tr className="border-b border-border/50">
                <td className="py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm font-medium">Formula 1: {ownershipData.f1Team.name}</span>
                  </div>
                </td>
                <td className="text-right text-sm">{formatCurrency(ownershipData.f1Team.value)}</td>
                <td className="text-right text-sm w-16 font-medium">
                  {formatPercentage(ownershipData.f1Team.value / (totalValue || 1))}
                </td>
              </tr>
            )}
            
            {/* Horse Racing */}
            {ownershipData.horses.count > 0 && (
              <tr className="border-b border-border/50">
                <td className="py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-600 mr-2"></div>
                    <span className="text-sm font-medium">Racing Horses ({ownershipData.horses.count})</span>
                  </div>
                </td>
                <td className="text-right text-sm">{formatCurrency(ownershipData.horses.value)}</td>
                <td className="text-right text-sm w-16 font-medium">
                  {formatPercentage(ownershipData.horses.value / (totalValue || 1))}
                </td>
              </tr>
            )}
            
            {/* Sports Team */}
            {ownershipData.sportsTeam.owned && (
              <tr className="border-b border-border/50">
                <td className="py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm font-medium">Sports Team: {ownershipData.sportsTeam.name}</span>
                  </div>
                </td>
                <td className="text-right text-sm">{formatCurrency(ownershipData.sportsTeam.value)}</td>
                <td className="text-right text-sm w-16 font-medium">
                  {formatPercentage(ownershipData.sportsTeam.value / (totalValue || 1))}
                </td>
              </tr>
            )}
            
            {/* Total Row */}
            <tr className="border-t-2 border-primary/30">
              <td className="py-2">
                <span className="text-sm font-semibold">Total Ownership Value</span>
              </td>
              <td className="text-right text-sm font-semibold">{formatCurrency(totalValue)}</td>
              <td className="text-right text-sm w-16 font-semibold">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}