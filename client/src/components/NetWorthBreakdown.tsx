import { useState, useEffect } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export function NetWorthBreakdown() {
  const { wealth, assets, properties, lifestyleItems, getNetWorthBreakdown } = useCharacter();
  const [netWorth, setNetWorth] = useState(0);
  const [breakdown, setBreakdown] = useState<any>({
    cash: 0,
    stocks: 0,
    crypto: 0,
    bonds: 0,
    otherInvestments: 0,
    propertyEquity: 0,
    propertyValue: 0,
    propertyDebt: 0,
    lifestyleItems: 0,
    total: 0
  });

  // Use the breakdown directly from the useCharacter store
  useEffect(() => {
    // Get the net worth breakdown directly from the store
    const storeBreakdown = getNetWorthBreakdown();
    setBreakdown(storeBreakdown);
    setNetWorth(storeBreakdown.total);
  }, [wealth, assets, properties, lifestyleItems, getNetWorthBreakdown]);

  // Prepare chart data - now include lifestyle items
  const chartData = {
    labels: [
      'Cash', 
      'Stocks',
      'Crypto',
      'Bonds',
      'Other Investments',
      'Property Equity',
      'Lifestyle Items'
    ],
    datasets: [
      {
        data: [
          breakdown.cash,
          breakdown.stocks,
          breakdown.crypto,
          breakdown.bonds,
          breakdown.otherInvestments,
          breakdown.propertyEquity,
          breakdown.lifestyleItems || 0 // Handle if this property is missing
        ],
        backgroundColor: [
          '#3B82F6', // Cash - Blue
          '#10B981', // Stocks - Green
          '#F59E0B', // Crypto - Amber
          '#6366F1', // Bonds - Indigo
          '#8B5CF6', // Other - Purple
          '#EC4899', // Property - Pink
          '#FB7185'  // Lifestyle - Rose
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#4F46E5',
          '#7C3AED',
          '#DB2777',
          '#E11D48'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        display: false, // Hide the legend to save space
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const percentage = ((value / breakdown.total) * 100).toFixed(1);
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
          <span>Net Worth Breakdown</span>
          <span className="text-base font-normal text-gray-600">{formatCurrency(netWorth)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 px-3">
        <div className="h-40 mx-auto">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
        
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3">
          {[
            { label: 'Cash', value: breakdown.cash, color: 'bg-blue-500' },
            { label: 'Stocks', value: breakdown.stocks, color: 'bg-green-500' },
            { label: 'Crypto', value: breakdown.crypto, color: 'bg-amber-500' },
            { label: 'Bonds', value: breakdown.bonds, color: 'bg-indigo-500' },
            { label: 'Other Investments', value: breakdown.otherInvestments, color: 'bg-purple-500' },
            { label: 'Property Equity', value: breakdown.propertyEquity, color: 'bg-pink-500' },
            { label: 'Lifestyle Items', value: breakdown.lifestyleItems || 0, color: 'bg-rose-500' }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
              <div className="flex justify-between w-full text-xs">
                <span>{item.label}</span>
                <span className="font-medium">{formatPercentage(item.value / breakdown.total)}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Financial health indicators */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Financial Health</h4>
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {/* Cash Ratio */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cash Ratio</span>
              <span className={`font-medium ${(breakdown.cash / breakdown.total) > 0.15 ? 'text-green-600' : (breakdown.cash / breakdown.total) > 0.05 ? 'text-amber-600' : 'text-red-600'}`}>
                {formatPercentage(breakdown.cash / breakdown.total)}
              </span>
            </div>
            
            {/* Investment Diversification */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Diversification</span>
              <span className="font-medium">
                {[breakdown.stocks, breakdown.crypto, breakdown.bonds, breakdown.otherInvestments].filter(v => v > 0).length} types
              </span>
            </div>
            
            {/* Property Leverage */}
            {breakdown.propertyValue > 0 && (
              <div className="flex justify-between items-center col-span-2">
                <span className="text-gray-600">Property Leverage</span>
                <span className={`font-medium ${(breakdown.propertyDebt / breakdown.propertyValue) < 0.5 ? 'text-green-600' : (breakdown.propertyDebt / breakdown.propertyValue) < 0.8 ? 'text-amber-600' : 'text-red-600'}`}>
                  {formatPercentage(breakdown.propertyDebt / breakdown.propertyValue)}
                </span>
              </div>
            )}
            
            {/* Lifestyle Asset Ratio */}
            {(breakdown.lifestyleItems || 0) > 0 && (
              <div className="flex justify-between items-center col-span-2">
                <span className="text-gray-600">Lifestyle Assets</span>
                <span className={`font-medium ${((breakdown.lifestyleItems || 0) / breakdown.total) < 0.15 ? 'text-green-600' : ((breakdown.lifestyleItems || 0) / breakdown.total) < 0.3 ? 'text-amber-600' : 'text-red-600'}`}>
                  {formatPercentage((breakdown.lifestyleItems || 0) / breakdown.total)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}