import { useState, useEffect, useCallback } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { formatCurrency, formatPercentage } from '../lib/utils';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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

// Constants for localStorage storage
const BREAKDOWN_STORAGE_KEY = 'business-empire-networth-breakdown';

export function NetWorthBreakdown() {
  // Get character data including functions
  const { 
    wealth, 
    assets, 
    properties, 
    lifestyleItems, 
    getNetWorthBreakdown, 
    calculateNetWorth, 
    saveState // We'll use this to ensure state is persisted
  } = useCharacter();
  
  // Local state for rendering
  const [netWorth, setNetWorth] = useState(0);
  const [breakdown, setBreakdown] = useState<NetWorthBreakdown>(defaultBreakdown);
  
  // Track if we need to force a refresh after reset
  const [resetDetected, setResetDetected] = useState(false);

  // Function to refresh the breakdown data
  const refreshBreakdown = useCallback(() => {
    console.log('NetWorthBreakdown: Refreshing breakdown data');
    
    // Check for ANY reset-related flags that might indicate stale data
    const resetInProgress = sessionStorage.getItem('game_reset_in_progress') === 'true';
    const resetCompleted = sessionStorage.getItem('game_reset_completed') === 'true';
    const forceCurrentDate = sessionStorage.getItem('force_current_date') === 'true';
    const blockTimeLoads = sessionStorage.getItem('block_time_loads') === 'true';
    const netWorthReset = sessionStorage.getItem('networth_breakdown_reset') === 'true';
    const characterReset = sessionStorage.getItem('character_reset_completed') === 'true';
    
    // If ANY of these conditions are true, we should use default values
    if (resetInProgress || resetCompleted || forceCurrentDate || blockTimeLoads || netWorthReset || characterReset) {
      console.log('NetWorthBreakdown: Reset condition detected, using default values');
      
      // Explicitly remove any stored data from localStorage
      try {
        localStorage.removeItem('business-empire-networth-breakdown');
        console.log('NetWorthBreakdown: Removed any stored breakdown data');
      } catch (e) {
        console.error('Error clearing stored breakdown:', e);
      }
      
      // Set to the most basic safe values - just cash equals total
      const safeBreakdown = { 
        ...defaultBreakdown, 
        cash: wealth || 0, 
        total: wealth || 0,
        version: Date.now() // Fresh timestamp to ensure reset detection works
      };
      
      // Also explicitly store this safe breakdown to localStorage
      try {
        localStorage.setItem(BREAKDOWN_STORAGE_KEY, JSON.stringify(safeBreakdown));
        console.log('NetWorthBreakdown: Explicitly stored safe breakdown to localStorage');
      } catch (e) {
        console.error('Error storing safe breakdown to localStorage:', e);
      }
      
      setBreakdown(safeBreakdown);
      setNetWorth(wealth || 0);
      
      // Log details about what we're doing
      console.log(`NetWorthBreakdown: Using safe default values - cash: ${wealth}, total: ${wealth}, version: ${safeBreakdown.version}`);
      return;
    }
    
    // Create a safety wrapper around the calculation to catch any errors
    const safeCalculate = () => {
      try {
        // IMPORTANT: Force calculation of the net worth to ensure fresh data
        return calculateNetWorth();
      } catch (err) {
        console.error('Error safely calculating net worth:', err);
        return null;
      }
    };
    
    // First attempt a safe calculation
    safeCalculate();
    
    try {
      // Get the breakdown from the store
      const storeBreakdown = getNetWorthBreakdown() as unknown as NetWorthBreakdown;
      
      // Sanity check - ensure the breakdown makes sense relative to current wealth
      // If breakdown.cash doesn't match current wealth, it's stale data
      const isValidBreakdown = storeBreakdown && 
                               typeof storeBreakdown === 'object' && 
                               'total' in storeBreakdown && 
                               storeBreakdown.total > 0 && 
                               'cash' in storeBreakdown && 
                               Math.abs(storeBreakdown.cash - wealth) < 0.01;
      
      if (isValidBreakdown) {
        // Data is fresh and valid
        console.log('NetWorthBreakdown: Using fresh breakdown data');
        setBreakdown(storeBreakdown as NetWorthBreakdown);
        setNetWorth(storeBreakdown.total);
      } else {
        // Data might be stale or invalid, force a recalculation
        console.log('NetWorthBreakdown: Detected possibly stale data, forcing recalculation');
        try {
          // Second calculation attempt
          const freshBreakdown = safeCalculate() as unknown as NetWorthBreakdown;
          
          // Ensure freshBreakdown is an object with the expected properties
          if (freshBreakdown && 
              typeof freshBreakdown === 'object' && 
              'total' in freshBreakdown && 
              freshBreakdown.total > 0 && 
              'cash' in freshBreakdown) {
            console.log('NetWorthBreakdown: Using recalculated breakdown data');
            setBreakdown(freshBreakdown);
            setNetWorth(freshBreakdown.total);
          } else {
            // If calculation return value is invalid, set defaults
            console.warn('NetWorthBreakdown: Invalid calculation result, using safe defaults');
            const basicBreakdown = { 
              ...defaultBreakdown, 
              cash: wealth || 0, 
              total: wealth || 0,
              version: Date.now() // Add version to track freshness
            };
            
            // Also store to localStorage
            try {
              localStorage.setItem(BREAKDOWN_STORAGE_KEY, JSON.stringify(basicBreakdown));
              console.log('NetWorthBreakdown: Stored basic breakdown to localStorage during calculation recovery');
            } catch (e) {
              console.error('Error storing basic breakdown to localStorage:', e);
            }
            
            setBreakdown(basicBreakdown);
            setNetWorth(wealth || 0);
          }
        } catch (err) {
          console.error('Error during net worth recalculation:', err);
          const basicBreakdown = { 
            ...defaultBreakdown, 
            cash: wealth || 0, 
            total: wealth || 0,
            version: Date.now() // Add version to track freshness
          };
          
          // Also store to localStorage
          try {
            localStorage.setItem(BREAKDOWN_STORAGE_KEY, JSON.stringify(basicBreakdown));
            console.log('NetWorthBreakdown: Stored basic breakdown to localStorage during error recovery');
          } catch (e) {
            console.error('Error storing basic breakdown to localStorage:', e);
          }
          
          setBreakdown(basicBreakdown);
          setNetWorth(wealth || 0);
        }
      }
    } catch (e) {
      console.error('Error getting net worth breakdown:', e);
      // In case of error, set to default empty breakdown
      const safeBreakdown = { 
        ...defaultBreakdown, 
        cash: wealth || 0, 
        total: wealth || 0,
        version: Date.now() // Add version to track freshness
      };
      
      // Also store to localStorage
      try {
        localStorage.setItem(BREAKDOWN_STORAGE_KEY, JSON.stringify(safeBreakdown));
        console.log('NetWorthBreakdown: Stored safe breakdown to localStorage during get error recovery');
      } catch (err) {
        console.error('Error storing safe breakdown to localStorage:', err);
      }
      
      setBreakdown(safeBreakdown);
      setNetWorth(wealth || 0); // At minimum, show current cash as net worth
    }
  }, [wealth, assets, properties, lifestyleItems, getNetWorthBreakdown, calculateNetWorth]);

  // Effect to update the breakdown when relevant data changes
  useEffect(() => {
    refreshBreakdown();
  }, [refreshBreakdown]);
  
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
    
    // Any of these conditions indicate we need a refresh
    if (resetCompleted || smoothNavigation || forceCurrentDate || blockTimeLoads || gameResetInProgress || netWorthReset || characterReset) {
      console.log('NetWorthBreakdown: Detected reset condition, performing thorough refresh');
      
      // First, force an immediate recalculation with default values
      const initBreakdown = {
        ...defaultBreakdown, 
        cash: wealth || 0, 
        total: wealth || 0,
        version: Date.now() // Add version to track freshness
      };
      
      // Also explicitly store this to localStorage to ensure consistency
      try {
        localStorage.setItem(BREAKDOWN_STORAGE_KEY, JSON.stringify(initBreakdown));
        console.log('NetWorthBreakdown: Stored initial breakdown to localStorage during reset condition');
      } catch (e) {
        console.error('Error storing initial breakdown to localStorage:', e);
      }
      
      setBreakdown(initBreakdown);
      setNetWorth(wealth || 0);
      
      // Then schedule multiple refreshes at different intervals
      // This ensures we catch any delayed state updates
      refreshBreakdown();
      
      const timers = [
        setTimeout(() => refreshBreakdown(), 100),
        setTimeout(() => refreshBreakdown(), 500),
        setTimeout(() => refreshBreakdown(), 1500),
        setTimeout(() => {
          // Force a final recalculation explicitly
          try {
            // Direct recalculation from scratch
            calculateNetWorth();
            
            // Force one last refresh
            refreshBreakdown();
            
            console.log('NetWorthBreakdown: Final refresh completed');
          } catch (e) {
            console.error('Error during final refresh:', e);
          }
        }, 2500)
      ];
      
      // Clear all the flags to avoid repeated refreshes
      sessionStorage.removeItem('game_reset_completed');
      sessionStorage.removeItem('networth_breakdown_reset');
      sessionStorage.removeItem('character_reset_completed');
      
      return () => {
        // Clean up all timers
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [refreshBreakdown, calculateNetWorth, wealth]);

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