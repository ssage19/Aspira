import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import useAssetTracker from '../lib/stores/useAssetTracker';
import { useCharacter } from '../lib/stores/useCharacter';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Simple portfolio breakdown chart
export function PortfolioBreakdown() {
  // Get the character data directly
  const { wealth } = useCharacter();
  
  // Initialize with basic data
  const [chartData, setChartData] = useState({
    labels: ['Cash', 'Stocks', 'Other'],
    datasets: [{
      data: [100, 0, 0],
      backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6'],
      borderWidth: 1
    }]
  });
  
  // Track for loading state
  const [isLoading, setIsLoading] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(wealth || 0);
  
  // Get assets from the asset tracker
  const { 
    cash, 
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
  
  // Update the chart data when assets change
  const updateChart = useCallback(() => {
    // Force a recalculation before using the values
    recalculateTotals();
    
    // Log what we're working with
    console.log('PortfolioBreakdown: Updating with asset values:', {
      cash: totalCash, 
      stocks: totalStocks,
      crypto: totalCrypto,
      bonds: totalBonds,
      other: totalOtherInvestments,
      property: totalPropertyEquity,
      lifestyle: totalLifestyleValue,
      total: totalNetWorth
    });
    
    // Use the character's net worth value as the source of truth
    // This ensures consistency with the top display
    const { netWorth: characterNetWorth } = useCharacter.getState();
    const calculatedTotal = characterNetWorth || totalNetWorth || wealth || 1;
    setDisplayTotal(calculatedTotal);
    
    // Get character's current cash value to ensure consistency
    const { wealth: characterWealth } = useCharacter.getState();
    const cashValue = characterWealth || totalCash || 0;
    
    // Prepare an array of all asset values with labels and colors
    const assetData = [
      { label: 'Cash', value: cashValue, color: '#3B82F6' },
      { label: 'Stocks', value: totalStocks || 0, color: '#10B981' },
      { label: 'Crypto', value: totalCrypto || 0, color: '#F59E0B' },
      { label: 'Bonds', value: totalBonds || 0, color: '#6366F1' },
      { label: 'Other', value: totalOtherInvestments || 0, color: '#8B5CF6' },
      { label: 'Property', value: totalPropertyEquity || 0, color: '#EC4899' },
      { label: 'Lifestyle', value: totalLifestyleValue || 0, color: '#FB7185' }
    ];
    
    // Filter out any zero values for a cleaner chart
    const filteredData = assetData.filter(item => item.value > 0);
    
    // If we're left with nothing, just show cash
    if (filteredData.length === 0) {
      filteredData.push({ 
        label: 'Cash', 
        value: totalCash > 0 ? totalCash : wealth || 100, 
        color: '#3B82F6'
      });
    }
    
    // Build chart data from filtered assets
    setChartData({
      labels: filteredData.map(item => item.label),
      datasets: [{
        data: filteredData.map(item => item.value),
        backgroundColor: filteredData.map(item => item.color),
        borderWidth: 1
      }]
    });
  }, [
    totalCash, totalStocks, totalCrypto, totalBonds, 
    totalOtherInvestments, totalPropertyEquity, 
    totalLifestyleValue, totalNetWorth, recalculateTotals, wealth
  ]);
  
  // Set up auto-refresh whenever the component renders or dependencies change
  useEffect(() => {
    updateChart();
    
    // Set up interval to refresh the data periodically
    const intervalId = setInterval(() => {
      updateChart();
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [updateChart]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    console.log('PortfolioBreakdown: Manual refresh triggered');
    
    // Force a recalculation of asset totals
    recalculateTotals();
    forceUpdate();
    
    // Update the chart with new data
    updateChart();
    
    // Clear loading state after a brief delay
    setTimeout(() => setIsLoading(false), 500);
  };
  
  // Calculate total for percentages using character's net worth to match top display
  const { netWorth: characterNetWorth } = useCharacter.getState();
  const total = characterNetWorth || totalNetWorth || 1;
  
  // Options for the chart
  const chartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
    responsive: true,
    maintainAspectRatio: false,
  };
  
  return (
    <Card className="w-full shadow-sm h-full">
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
      <CardContent className="pt-2 px-3">
        <div className="flex flex-row gap-4">
          {/* Smaller chart in a flex container */}
          <div className="h-20 w-20 flex-shrink-0 relative">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          
          {/* Legend in a flex container */}
          <div className="flex-grow grid grid-cols-2 gap-x-2 gap-y-0.5">
            {[
              { label: 'Cash', value: useCharacter.getState().wealth || 0, color: 'bg-blue-500' },
              { label: 'Stocks', value: totalStocks || 0, color: 'bg-green-500' },
              { label: 'Crypto', value: totalCrypto || 0, color: 'bg-amber-500' },
              { label: 'Bonds', value: totalBonds || 0, color: 'bg-indigo-500' },
              { label: 'Other', value: totalOtherInvestments || 0, color: 'bg-purple-500' },
              { label: 'Property', value: totalPropertyEquity || 0, color: 'bg-pink-500' },
              { label: 'Lifestyle', value: totalLifestyleValue || 0, color: 'bg-rose-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                <div className="flex justify-between w-full text-xs">
                  <span>{item.label}</span>
                  <span className="font-medium">
                    {total > 0 
                      ? formatPercentage(item.value / total)
                      : '0%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Financial health indicators */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Financial Health</h4>
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {/* Cash Ratio */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cash Ratio</span>
              <span className={`font-medium ${
                total === 0 ? 'text-gray-500' :
                ((useCharacter.getState().wealth || 0) / total) > 0.15 ? 'text-green-600' : 
                ((useCharacter.getState().wealth || 0) / total) > 0.05 ? 'text-amber-600' : 
                'text-red-600'}`}>
                {formatPercentage((useCharacter.getState().wealth || 0) / total)}
              </span>
            </div>
            
            {/* Investment Diversification */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Diversification</span>
              <span className="font-medium">
                {[totalStocks, totalCrypto, totalBonds, totalOtherInvestments]
                  .filter(v => (v || 0) > 0).length} types
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}