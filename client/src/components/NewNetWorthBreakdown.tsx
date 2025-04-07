import { useState, useEffect, useCallback } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import useAssetTracker, { ASSET_TRACKER_STORAGE_KEY } from '../lib/stores/useAssetTracker';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Legacy key for backward compatibility
const LEGACY_BREAKDOWN_STORAGE_KEY = 'business-empire-networth-breakdown';

// Define the shape of our breakdown object
interface NetWorthBreakdown {
  cash: number;
  stocks: number;
  crypto: number;
  bonds: number;
  otherInvestments: number;
  propertyEquity: number;
  propertyValue: number;
  propertyDebt: number;
  lifestyleItems: number;
  total: number;
  version?: number; // Add version field to track freshness of data
}

// Default empty breakdown object
const defaultBreakdown: NetWorthBreakdown = {
  cash: 0,
  stocks: 0,
  crypto: 0,
  bonds: 0,
  otherInvestments: 0,
  propertyEquity: 0,
  propertyValue: 0,
  propertyDebt: 0,
  lifestyleItems: 0,
  total: 0,
  version: Date.now() // Add current timestamp as version
};

export function NewNetWorthBreakdown() {
  // Get basic character data
  const { wealth } = useCharacter();
  
  // Get asset tracker data and functions
  const { 
    getNetWorthBreakdown: getTrackerBreakdown,
    recalculateTotals,
    resetAssetTracker,
    lastUpdated,
    totalNetWorth
  } = useAssetTracker();
  
  // Local state for rendering
  const [netWorth, setNetWorth] = useState(wealth || 0);
  const [breakdown, setBreakdown] = useState<NetWorthBreakdown>(defaultBreakdown);
  
  // Function to refresh the breakdown data from asset tracker - simplified to avoid loops
  const refreshBreakdown = useCallback(() => {
    console.log('NewNetWorthBreakdown: Refreshing breakdown data from asset tracker');
    
    try {
      // Get fresh breakdown data directly without modifying the store
      const trackerBreakdown = getTrackerBreakdown();
      
      if (trackerBreakdown && 
          typeof trackerBreakdown === 'object' && 
          'total' in trackerBreakdown) {
        // Only update if we have valid data
        console.log('NewNetWorthBreakdown: Using asset tracker breakdown data');
        setBreakdown(trackerBreakdown);
        setNetWorth(trackerBreakdown.total);
      } else {
        // Use safe defaults if data is invalid
        console.warn('NewNetWorthBreakdown: Invalid asset tracker data, using safe defaults');
        
        const safeBreakdown = { 
          ...defaultBreakdown, 
          cash: wealth || 0, 
          total: wealth || 0,
          version: Date.now()
        };
        
        setBreakdown(safeBreakdown);
        setNetWorth(wealth || 0);
      }
    } catch (e) {
      console.error('Error refreshing breakdown from asset tracker:', e);
      
      // Use a safe fallback in case of error
      const safeBreakdown = { 
        ...defaultBreakdown, 
        cash: wealth || 0, 
        total: wealth || 0,
        version: Date.now()
      };
      
      setBreakdown(safeBreakdown);
      setNetWorth(wealth || 0);
    }
  }, [wealth, getTrackerBreakdown]);

  // Effect to update the breakdown when lastUpdated changes
  useEffect(() => {
    // Only run if there is an actual timestamp value
    if (lastUpdated > 0) {
      console.log(`NewNetWorthBreakdown: Asset tracker updated (timestamp: ${lastUpdated})`);
      const trackerBreakdown = getTrackerBreakdown();
      
      if (trackerBreakdown && typeof trackerBreakdown === 'object' && 'total' in trackerBreakdown) {
        // Update state with new data
        setBreakdown(trackerBreakdown);
        setNetWorth(trackerBreakdown.total);
      }
    }
  }, [lastUpdated, getTrackerBreakdown]);
  
  // Simple initialization on mount
  useEffect(() => {
    // Do a single, initial data fetch
    console.log('NewNetWorthBreakdown: Initial component mount');
    
    // Set up baseline values with current wealth
    const initBreakdown = {
      ...defaultBreakdown, 
      cash: wealth || 0, 
      total: wealth || 0,
      version: Date.now()
    };
    
    setBreakdown(initBreakdown);
    setNetWorth(wealth || 0);
    
    // Mark component as initialized
    if (sessionStorage.getItem('networth_breakdown_initialized') !== 'true') {
      sessionStorage.setItem('networth_breakdown_initialized', 'true');
      console.log('NewNetWorthBreakdown: Component initialized');
    }
  }, [wealth]);

  // Prepare chart data
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
          breakdown.lifestyleItems || 0
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
            // Prevent division by zero
            const total = breakdown.total || 1; 
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
                <span className="font-medium">
                  {breakdown.total > 0 
                    ? formatPercentage(item.value / breakdown.total)
                    : '0%'}
                </span>
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
              <span className={`font-medium ${
                breakdown.total === 0 ? 'text-gray-500' :
                (breakdown.cash / breakdown.total) > 0.15 ? 'text-green-600' : 
                (breakdown.cash / breakdown.total) > 0.05 ? 'text-amber-600' : 
                'text-red-600'}`}>
                {breakdown.total > 0 
                  ? formatPercentage(breakdown.cash / breakdown.total)
                  : '0%'}
              </span>
            </div>
            
            {/* Investment Diversification */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Diversification</span>
              <span className="font-medium">
                {[breakdown.stocks, breakdown.crypto, breakdown.bonds, breakdown.otherInvestments]
                  .filter(v => v > 0).length} types
              </span>
            </div>
            
            {/* Property Leverage */}
            {breakdown.propertyValue > 0 && (
              <div className="flex justify-between items-center col-span-2">
                <span className="text-gray-600">Property Leverage</span>
                <span className={`font-medium ${
                  (breakdown.propertyDebt / breakdown.propertyValue) < 0.5 ? 'text-green-600' : 
                  (breakdown.propertyDebt / breakdown.propertyValue) < 0.8 ? 'text-amber-600' : 
                  'text-red-600'}`}>
                  {formatPercentage(breakdown.propertyDebt / breakdown.propertyValue)}
                </span>
              </div>
            )}
            
            {/* Lifestyle Asset Ratio */}
            {(breakdown.lifestyleItems || 0) > 0 && (
              <div className="flex justify-between items-center col-span-2">
                <span className="text-gray-600">Lifestyle Assets</span>
                <span className={`font-medium ${
                  ((breakdown.lifestyleItems || 0) / breakdown.total) < 0.15 ? 'text-green-600' : 
                  ((breakdown.lifestyleItems || 0) / breakdown.total) < 0.3 ? 'text-amber-600' : 
                  'text-red-600'}`}>
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