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
  
  // Function to refresh the breakdown data from asset tracker
  const refreshBreakdown = useCallback(() => {
    console.log('NewNetWorthBreakdown: Refreshing breakdown data from asset tracker');
    
    // Check for ANY reset-related flags that might indicate stale data
    const resetInProgress = sessionStorage.getItem('game_reset_in_progress') === 'true';
    const resetCompleted = sessionStorage.getItem('game_reset_completed') === 'true';
    const forceCurrentDate = sessionStorage.getItem('force_current_date') === 'true';
    const blockTimeLoads = sessionStorage.getItem('block_time_loads') === 'true';
    const netWorthReset = sessionStorage.getItem('networth_breakdown_reset') === 'true';
    const characterReset = sessionStorage.getItem('character_reset_completed') === 'true';
    const assetTrackerReset = sessionStorage.getItem('asset_tracker_reset') === 'true';
    
    // If ANY of these conditions are true, we should reset the asset tracker
    if (resetInProgress || resetCompleted || forceCurrentDate || blockTimeLoads || 
        netWorthReset || characterReset || assetTrackerReset) {
      console.log('NewNetWorthBreakdown: Reset condition detected, resetting asset tracker');
      
      // Reset the asset tracker
      resetAssetTracker();
      
      // Also clear any legacy data
      try {
        localStorage.removeItem(LEGACY_BREAKDOWN_STORAGE_KEY);
        console.log('NewNetWorthBreakdown: Removed legacy breakdown data');
      } catch (e) {
        console.error('Error clearing legacy breakdown:', e);
      }
      
      // Create a safe baseline breakdown
      const safeBreakdown = { 
        ...defaultBreakdown, 
        cash: wealth || 0, 
        total: wealth || 0,
        version: Date.now()
      };
      
      setBreakdown(safeBreakdown);
      setNetWorth(wealth || 0);
      
      // Update the asset tracker with this baseline
      try {
        const tracker = useAssetTracker.getState();
        tracker.updateCash(wealth || 0);
        tracker.recalculateTotals();
      } catch (e) {
        console.error('Error updating asset tracker during reset:', e);
      }
      
      console.log(`NewNetWorthBreakdown: Reset complete with safe values - cash: ${wealth}, total: ${wealth}`);
      return;
    }
    
    try {
      // Force a recalculation in the asset tracker
      recalculateTotals();
      
      // Get fresh breakdown data
      const trackerBreakdown = getTrackerBreakdown();
      
      if (trackerBreakdown && 
          typeof trackerBreakdown === 'object' && 
          'total' in trackerBreakdown) {
        console.log('NewNetWorthBreakdown: Using asset tracker breakdown data');
        setBreakdown(trackerBreakdown);
        setNetWorth(trackerBreakdown.total);
      } else {
        console.warn('NewNetWorthBreakdown: Invalid asset tracker data, using safe defaults');
        
        // If asset tracker data is invalid, initialize with just cash
        const safeBreakdown = { 
          ...defaultBreakdown, 
          cash: wealth || 0, 
          total: wealth || 0,
          version: Date.now()
        };
        
        setBreakdown(safeBreakdown);
        setNetWorth(wealth || 0);
        
        // Update the asset tracker with this baseline
        try {
          const tracker = useAssetTracker.getState();
          tracker.updateCash(wealth || 0);
          tracker.recalculateTotals();
        } catch (e) {
          console.error('Error updating asset tracker with safe values:', e);
        }
      }
    } catch (e) {
      console.error('Error refreshing breakdown from asset tracker:', e);
      
      // In case of error, set to default empty breakdown
      const safeBreakdown = { 
        ...defaultBreakdown, 
        cash: wealth || 0, 
        total: wealth || 0,
        version: Date.now()
      };
      
      setBreakdown(safeBreakdown);
      setNetWorth(wealth || 0);
    }
  }, [wealth, getTrackerBreakdown, recalculateTotals, resetAssetTracker]);

  // Effect to update the breakdown when relevant data changes
  // Only run this when lastUpdated changes to avoid infinite loops
  useEffect(() => {
    const initialRun = sessionStorage.getItem('networth_breakdown_initialized') !== 'true';
    
    if (initialRun || lastUpdated > 0) {
      refreshBreakdown();
      
      // Mark as initialized to avoid unnecessary runs
      if (initialRun) {
        sessionStorage.setItem('networth_breakdown_initialized', 'true');
      }
    }
  }, [lastUpdated]);
  
  // Additional effect that runs once on mount to ensure fresh data
  useEffect(() => {
    // Check for various reset/refresh flags
    const resetCompleted = sessionStorage.getItem('game_reset_completed') === 'true';
    const smoothNavigation = sessionStorage.getItem('smooth_navigation') === 'true';
    const forceCurrentDate = sessionStorage.getItem('force_current_date') === 'true';
    const blockTimeLoads = sessionStorage.getItem('block_time_loads') === 'true';
    const gameResetInProgress = sessionStorage.getItem('game_reset_in_progress') === 'true';
    const netWorthReset = sessionStorage.getItem('networth_breakdown_reset') === 'true';
    const characterReset = sessionStorage.getItem('character_reset_completed') === 'true';
    const assetTrackerReset = sessionStorage.getItem('asset_tracker_reset') === 'true';
    
    // Any of these conditions indicate we need a thorough refresh
    if (resetCompleted || smoothNavigation || forceCurrentDate || blockTimeLoads || 
        gameResetInProgress || netWorthReset || characterReset || assetTrackerReset) {
      console.log('NewNetWorthBreakdown: Detected reset condition, performing thorough refresh');
      
      // Reset the asset tracker
      resetAssetTracker();
      
      // Set up baseline values
      const initBreakdown = {
        ...defaultBreakdown, 
        cash: wealth || 0, 
        total: wealth || 0,
        version: Date.now()
      };
      
      setBreakdown(initBreakdown);
      setNetWorth(wealth || 0);
      
      // Update the asset tracker with initial cash
      try {
        const tracker = useAssetTracker.getState();
        tracker.updateCash(wealth || 0);
        tracker.recalculateTotals();
      } catch (e) {
        console.error('Error updating asset tracker during init:', e);
      }
      
      // Schedule limited, controlled refreshes to avoid infinite loops
      const timers = [
        setTimeout(() => {
          // Final forced refresh
          try {
            recalculateTotals();
            
            // Get fresh breakdown data without calling the full refresh function
            const trackerBreakdown = getTrackerBreakdown();
            if (trackerBreakdown && typeof trackerBreakdown === 'object' && 'total' in trackerBreakdown) {
              setBreakdown(trackerBreakdown);
              setNetWorth(trackerBreakdown.total);
            }
            
            console.log('NewNetWorthBreakdown: Reset refresh completed');
          } catch (e) {
            console.error('Error during final refresh:', e);
          }
        }, 1000)
      ];
      
      // Clear all reset flags
      sessionStorage.removeItem('game_reset_completed');
      sessionStorage.removeItem('networth_breakdown_reset');
      sessionStorage.removeItem('character_reset_completed');
      sessionStorage.removeItem('asset_tracker_reset');
      
      return () => {
        // Clean up all timers
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, []);

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