import { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ReferenceLine,
  Area
} from 'recharts';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { VolatilityLevel } from '../lib/data/investments';

/**
 * Stock Chart Component
 * Displays stock price information in three different timeframes:
 * - Daily: Shows price fluctuations throughout a single day
 * - Weekly: Shows prices for Monday-Friday of each week
 * - Monthly: Shows end-of-month prices for a longer time period
 */

// Chart timeframe options
type TimeFrame = 'daily' | 'weekly' | 'monthly';

// Chart type component props
interface StockChartProps {
  stockId: string;
  currentPrice: number;
  basePrice: number;
  volatility: VolatilityLevel;
}

// Extended data interface to support candlestick format
interface CandlestickData {
  day: number;
  date: string; // formatted date string (MM/DD)
  open: number;
  close: number;
  high: number;
  low: number;
  volume?: number;
  // Additional fields for weekly/monthly aggregation
  weekNumber?: number;
  month?: number;
  year?: number;
  // Additional fields for rendering
  height?: number;
  color?: string;
  y0?: number;
  // Display formatting
  displayTime?: string;
  value?: number;
}

export function StockChart({ stockId, currentPrice, basePrice, volatility }: StockChartProps) {
  const { currentDay, currentMonth, currentYear } = useTime();
  const { marketTrend } = useEconomy();
  
  // State for different timeframes
  const [dailyData, setDailyData] = useState<CandlestickData[]>([]);
  const [weeklyData, setWeeklyData] = useState<CandlestickData[]>([]);
  const [monthlyData, setMonthlyData] = useState<CandlestickData[]>([]);
  
  // Track selected timeframe
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('daily');
  
  // Cache previous data to avoid regenerating it
  const previousDataRef = useRef<{
    id: string, 
    dailyData: CandlestickData[],
    weeklyData: CandlestickData[],
    monthlyData: CandlestickData[],
    lastUpdatedDay?: number,
    lastUpdatedMonth: number,
    lastUpdatedYear: number
  }>({ 
    id: '', 
    dailyData: [],
    weeklyData: [],
    monthlyData: [],
    lastUpdatedMonth: -1,
    lastUpdatedYear: -1
  });
  
  // Reset data when stock changes or day changes
  useEffect(() => {
    // Reset on stock change or day change
    const shouldReset = 
      previousDataRef.current.id !== stockId || 
      !previousDataRef.current.lastUpdatedDay || 
      previousDataRef.current.lastUpdatedDay !== currentDay ||
      previousDataRef.current.lastUpdatedMonth !== currentMonth ||
      previousDataRef.current.lastUpdatedYear !== currentYear;
    
    if (shouldReset) {
      console.log(`Resetting chart data for ${stockId} due to day/stock change. Current day: ${currentDay}`);
      setDailyData([]);
      setWeeklyData([]);
      setMonthlyData([]);
      previousDataRef.current = { 
        id: stockId, 
        dailyData: [], 
        weeklyData: [],
        monthlyData: [],
        lastUpdatedDay: currentDay,
        lastUpdatedMonth: currentMonth,
        lastUpdatedYear: currentYear
      };
    }
  }, [stockId, currentDay, currentMonth, currentYear]);
  
  // Format a day number to different formats based on timeframe
  const formatDate = (targetDate: Date, timeframe: TimeFrame) => {
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1; // 0-indexed months
    const dayOfWeek = targetDate.getDay(); // 0-6, 0 = Sunday
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    switch (timeframe) {
      case 'daily':
        // Include hours for daily view
        const hours = Math.floor(Math.random() * 8) + 9; // Simulate market hours (9am-5pm)
        return `${month}/${day} ${hours}:00`;
      
      case 'weekly':
        // Use day of week for weekly view (Mon-Fri only)
        // Skip weekend days in simulation
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Move to Friday for weekend days
          return `${weekdays[5]}`;
        }
        return `${weekdays[dayOfWeek]}`;
      
      case 'monthly':
        // Use month name with year if different from current
        const year = targetDate.getFullYear();
        if (year !== currentYear) {
          return `${monthNames[month-1]} '${year.toString().substr(2)}`;
        }
        return monthNames[month-1];
        
      default:
        return `${month}/${day}`;
    }
  };
  
  // Format a day number relative to the current date
  const formatDateFromDay = (dayNumber: number, timeframe: TimeFrame = 'daily') => {
    // Create a new date from the current game date
    const currentDate = new Date(currentYear, currentMonth - 1, currentDay);
    
    // Adjust date to the dayNumber
    const dayDiff = currentDay - dayNumber;
    const targetDate = new Date(currentDate);
    targetDate.setDate(targetDate.getDate() - dayDiff);
    
    // Use the right format based on timeframe
    return formatDate(targetDate, timeframe);
  };
  
  // Get the week number for a specific date
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  // Set more realistic volatility factors based on risk level
  const getRealisticVolatilityFactor = (volatilityLevel: VolatilityLevel, marketTrend: string) => {
    // Base volatility factors - much more realistic than previous values
    // Blue chip stocks typically change by 0.5-1% per day
    // Volatile stocks might change 2-3% per day
    let factor = 0;
    
    switch (volatilityLevel) {
      case 'very_low':
        // Very stable blue chip stocks (0.2-0.5% daily change)
        factor = 0.003; 
        break;
      case 'low':
        // Stable blue chip stocks (0.3-0.7% daily change)
        factor = 0.005; 
        break;
      case 'medium':
        // Average volatility stocks (0.5-1.5% daily change)
        factor = 0.01; 
        break;
      case 'high':
        // Growth stocks (0.8-2.0% daily change)
        factor = 0.015; 
        break;
      case 'very_high':
        // Tech growth stocks (1.0-2.5% daily change)
        factor = 0.02; 
        break;
      case 'extreme':
        // Small caps, volatile companies (1.5-4.0% daily change)
        factor = 0.03; 
        break;
      default:
        factor = 0.01;
    }
    
    // Market trend slightly adjusts volatility
    if (marketTrend === 'bull') {
      factor *= 1.1; // Slightly higher volatility in bull markets
    } else if (marketTrend === 'bear') {
      factor *= 1.2; // Even higher volatility in bear markets
    }
    
    return factor;
  };
  
  // Aggregate daily data into weekly data
  const aggregateToWeekly = (dailyData: CandlestickData[]): CandlestickData[] => {
    const weekMap = new Map<string, CandlestickData[]>();
    
    // Group by week
    dailyData.forEach(day => {
      const date = new Date(day.year || currentYear, (day.month || currentMonth) - 1, day.day);
      const weekNum = getWeekNumber(date);
      const year = date.getFullYear();
      const key = `${year}-${weekNum}`;
      
      if (!weekMap.has(key)) {
        weekMap.set(key, []);
      }
      weekMap.get(key)?.push(day);
    });
    
    // Aggregate each week's data
    const weeklyData: CandlestickData[] = [];
    
    weekMap.forEach((days, key) => {
      if (days.length === 0) return;
      
      // Sort days chronologically
      days.sort((a, b) => a.day - b.day);
      
      // First day's open
      const open = days[0].open;
      // Last day's close
      const close = days[days.length - 1].close;
      // Highest high
      const high = Math.max(...days.map(d => d.high));
      // Lowest low
      const low = Math.min(...days.map(d => d.low));
      // Sum volume
      const volume = days.reduce((sum, day) => sum + (day.volume || 0), 0);
      
      // Use the last day of the week for display
      const lastDay = days[days.length - 1];
      const firstDate = new Date(lastDay.year || currentYear, (lastDay.month || currentMonth) - 1, lastDay.day);
      
      // Format week label (e.g., "W10")
      const [year, week] = key.split('-');
      
      weeklyData.push({
        day: lastDay.day,
        date: `W${week}`,
        open,
        close,
        high,
        low,
        volume,
        weekNumber: parseInt(week),
        year: parseInt(year),
        month: firstDate.getMonth() + 1
      });
    });
    
    // Sort by date
    return weeklyData.sort((a, b) => {
      if (a.year !== b.year) return a.year! - b.year!;
      return a.weekNumber! - b.weekNumber!;
    });
  };
  
  // Aggregate daily data into monthly data
  const aggregateToMonthly = (dailyData: CandlestickData[]): CandlestickData[] => {
    const monthMap = new Map<string, CandlestickData[]>();
    
    // Group by month
    dailyData.forEach(day => {
      const month = day.month || currentMonth;
      const year = day.year || currentYear;
      const key = `${year}-${month}`;
      
      if (!monthMap.has(key)) {
        monthMap.set(key, []);
      }
      monthMap.get(key)?.push(day);
    });
    
    // Aggregate each month's data
    const monthlyData: CandlestickData[] = [];
    
    monthMap.forEach((days, key) => {
      if (days.length === 0) return;
      
      // Sort days chronologically
      days.sort((a, b) => a.day - b.day);
      
      // First day's open
      const open = days[0].open;
      // Last day's close
      const close = days[days.length - 1].close;
      // Highest high
      const high = Math.max(...days.map(d => d.high));
      // Lowest low
      const low = Math.min(...days.map(d => d.low));
      // Sum volume
      const volume = days.reduce((sum, day) => sum + (day.volume || 0), 0);
      
      // Use month name for label
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[parseInt(month) - 1];
      
      monthlyData.push({
        day: 1, // First day of month
        date: monthName,
        open,
        close,
        high,
        low,
        volume,
        month: parseInt(month),
        year: parseInt(year)
      });
    });
    
    // Sort by date
    return monthlyData.sort((a, b) => {
      if (a.year !== b.year) return a.year! - b.year!;
      return a.month! - b.month!;
    });
  };
  
  // Helper to check if a date is a weekday (Monday-Friday)
  const isWeekday = (date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday is 1, Friday is 5
  };
  
  // Generate historical stock data
  useEffect(() => {
    console.log(`Updating chart for stock: ${stockId} at price: ${currentPrice}`);
    
    const volatilityFactor = getRealisticVolatilityFactor(volatility, marketTrend);
    
    // Market trend affects the baseline direction
    // Much smaller trend factors to avoid unrealistic gains/losses
    const trendFactor = marketTrend === 'bull' ? 0.0015 : 
                        marketTrend === 'bear' ? -0.0015 : 0.0005;
    
    // Check if we need to reset monthly data when month changes
    const isNewMonth = 
      previousDataRef.current.lastUpdatedMonth !== currentMonth || 
      previousDataRef.current.lastUpdatedYear !== currentYear;
    
    // Generate new historical data if needed
    const needsNewData = 
      previousDataRef.current.dailyData.length === 0 || 
      previousDataRef.current.id !== stockId;
    
    // Check if current day is a weekday
    const currentGameDate = new Date(currentYear, currentMonth - 1, currentDay);
    const isMarketOpenToday = isWeekday(currentGameDate);
    
    console.log(`Market status: ${isMarketOpenToday ? 'OPEN (weekday)' : 'CLOSED (weekend)'}`);
    
    if (needsNewData) {
      // Generate more days of data for better historical context
      const newDailyData: CandlestickData[] = [];
      let prevPrice = basePrice;
      
      // Generate 90 days of data for better historical context (monthly charts)
      const daysToGenerate = 90;
      const startDay = Math.max(1, currentDay - daysToGenerate);
      
      for (let i = startDay; i <= currentDay; i++) {
        // Get current day's date info
        const currentDate = new Date(currentYear, currentMonth - 1, currentDay);
        const dayDiff = currentDay - i;
        const targetDate = new Date(currentDate);
        targetDate.setDate(targetDate.getDate() - dayDiff);
        
        // Extract date components
        const targetDay = targetDate.getDate();
        const targetMonth = targetDate.getMonth() + 1;
        const targetYear = targetDate.getFullYear();
        const weekNumber = getWeekNumber(targetDate);
        
        // Check if target date is a weekday
        const targetIsWeekday = isWeekday(targetDate);
        
        // For weekend days, keep previous price
        if (!targetIsWeekday) {
          // On weekends, market is closed. No price changes.
          // Format date for weekends based on current timeframe
          const targetDateObj = new Date(targetYear, targetMonth - 1, targetDay);
          const formattedDate = formatDate(targetDateObj, 'daily');
          
          // Add a marker for closed market on weekends
          newDailyData.push({
            day: targetDay, 
            date: formattedDate + " (Closed)",
            open: prevPrice,
            close: prevPrice,
            high: prevPrice,
            low: prevPrice,
            volume: 0, // No trading volume on weekends
            month: targetMonth,
            year: targetYear,
            weekNumber: weekNumber
          });
          
          // Skip further processing for weekend days
          continue;
        }
        
        // Use a seeded random based on stock ID and day to ensure consistency
        const seed = stockId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + i + (targetMonth * 100) + (targetYear * 10000);
        const pseudoRandom = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
        
        // Normalized pseudo-random between -1 and 1
        const normalizedRandom = (pseudoRandom - 0.5) * 2;
        
        // Create some randomness with trend influence
        // This creates more realistic day-to-day changes
        const randomFactor = normalizedRandom * volatilityFactor;
        
        // Add a small trend influence (less impact than volatility)
        const dayTrendFactor = trendFactor * (1 + Math.sin(i / 15) * 0.5);
        
        // Calculate price changes for the day
        const openPrice = prevPrice;
        const closePrice = prevPrice * (1 + randomFactor + dayTrendFactor);
        
        // Generate intraday high and low values with realistic ranges
        // High is at most 0.5% above the higher of open/close
        // Low is at most 0.5% below the lower of open/close
        const dailyRange = volatilityFactor * 0.5;
        const highPrice = Math.max(openPrice, closePrice) * (1 + (Math.abs(normalizedRandom) * dailyRange));
        const lowPrice = Math.min(openPrice, closePrice) * (1 - (Math.abs(normalizedRandom) * dailyRange));
        
        // Calculate simulated volume (higher on more volatile days)
        const volume = Math.floor(50000 + 200000 * Math.abs(normalizedRandom));
        
        // Ensure prices don't go too low (floor at 50% of base price)
        prevPrice = Math.max(closePrice, basePrice * 0.5);
        
        // Format date based on current timeframe
        // Store the actual date object reference for easy formatting later
        const targetDateObj = new Date(targetYear, targetMonth - 1, targetDay);
        const formattedDate = formatDate(targetDateObj, 'daily');
        
        newDailyData.push({
          day: targetDay, 
          date: formattedDate,
          open: parseFloat(openPrice.toFixed(2)),
          close: parseFloat(closePrice.toFixed(2)),
          high: parseFloat(highPrice.toFixed(2)),
          low: parseFloat(lowPrice.toFixed(2)),
          volume: volume,
          month: targetMonth,
          year: targetYear,
          weekNumber: weekNumber
        });
      }
      
      // Make sure the last data point matches current price
      if (newDailyData.length > 0) {
        const lastIndex = newDailyData.length - 1;
        const lastPoint = newDailyData[lastIndex];
        
        // Create realistic high/low for current day
        const dailyRange = volatilityFactor * 0.5;
        const high = Math.max(lastPoint.open, currentPrice) * (1 + dailyRange * 0.5);
        const low = Math.min(lastPoint.open, currentPrice) * (1 - dailyRange * 0.5);
        
        newDailyData[lastIndex] = {
          ...lastPoint,
          close: currentPrice,
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2))
        };
      }
      
      // Create weekly and monthly data from daily data
      const newWeeklyData = aggregateToWeekly(newDailyData);
      const newMonthlyData = aggregateToMonthly(newDailyData);
      
      // Update state
      setDailyData(newDailyData.slice(-20)); // Last 20 days for daily view
      setWeeklyData(newWeeklyData.slice(-12)); // Last 12 weeks
      setMonthlyData(newMonthlyData.slice(-6));  // Last 6 months
      
      // Cache data
      previousDataRef.current = {
        id: stockId,
        dailyData: newDailyData,
        weeklyData: newWeeklyData,
        monthlyData: newMonthlyData,
        lastUpdatedDay: currentDay,
        lastUpdatedMonth: currentMonth,
        lastUpdatedYear: currentYear
      };
      
    }
  }, [currentDay, stockId, currentPrice, basePrice, volatility, marketTrend, currentMonth, currentYear]);
  
  // Format Y-axis values with proper precision based on stock price
  const formatYAxis = (value: number) => {
    // Show more decimal places for low-priced stocks
    if (basePrice < 10) {
      // For very cheap stocks (penny stocks), show 3 decimal places
      return `$${value.toFixed(3)}`;
    } else if (basePrice < 100) {
      // For stocks under $100, show 2 decimal places
      return `$${value.toFixed(2)}`;
    } else if (value >= 1000) {
      // For stocks over $1000, condense with k
      return `$${(value / 1000).toFixed(1)}k`;
    }
    // Otherwise show whole dollars
    return `$${value.toFixed(0)}`;
  };
  
  // Format data for each specific timeframe view
  const formatDailyData = (data: CandlestickData[]) => {
    // For daily view, we'll use market hours from 9:00 AM to 4:00 PM
    return data.map((point, index) => {
      // Calculate hour between 9AM and 4PM (7 hour trading window)
      // We want a fixed distribution of time points
      const marketHours = 7; // 9:00 AM to 4:00 PM
      const hour = 9 + Math.floor(index * marketHours / (data.length - 1));
      const cappedHour = Math.min(16, Math.max(9, hour)); // Ensure between 9 and 16 (4PM)
      
      // Create fixed market hours timeline
      return {
        ...point,
        hour: cappedHour,
        // Format time as HH:MM with AM/PM
        displayTime: `${cappedHour === 12 ? 12 : cappedHour % 12}${cappedHour < 12 ? 'AM' : 'PM'}`,
        value: point.close, // For line chart
      };
    });
  };
  
  const formatWeeklyData = (data: CandlestickData[]) => {
    // For weekly, use weekday labels (Mon-Fri)
    return data.map(point => {
      // Create a proper date object for this point
      const dateObj = new Date(point.year || currentYear, (point.month || currentMonth) - 1, point.day);
      
      // Get day of week (0-6, 0 is Sunday)
      const dayOfWeek = dateObj.getDay();
      
      // Map to proper weekday name
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // Use actual day of week, but ensure we only show business days
      const dayIndex = dayOfWeek >= 1 && dayOfWeek <= 5 ? dayOfWeek : 5; // Default to Friday for weekends
      const dayName = dayNames[dayIndex];
      
      return {
        ...point,
        displayTime: dayName,
        value: point.close, // For line chart
      };
    });
  };
  
  const formatMonthlyData = (data: CandlestickData[]) => {
    // For monthly, use month names
    return data.map(point => {
      return {
        ...point,
        displayTime: point.date, // Already formatted as month name
        value: point.close, // For line chart
      };
    });
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const priceDiff = data.close - data.open;
      const percentChange = ((data.close - data.open) / data.open * 100).toFixed(2);
      const changeColor = priceDiff >= 0 ? 'text-green-500' : 'text-red-500';
      
      return (
        <div className="bg-gray-900 p-2 border border-gray-700 rounded shadow-md text-xs text-gray-200">
          <p className="font-semibold">{data.date || data.time || data.displayTime}</p>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <span className="text-gray-400">Open:</span>
            <span className="font-medium">${data.open.toFixed(2)}</span>
            <span className="text-gray-400">Close:</span>
            <span className={`font-medium ${changeColor}`}>${data.close.toFixed(2)}</span>
            <span className="text-gray-400">Change:</span>
            <span className={`font-medium ${changeColor}`}>
              {priceDiff >= 0 ? '+' : ''}{priceDiff.toFixed(2)} ({percentChange}%)
            </span>
            <span className="text-gray-400">High:</span>
            <span className="font-medium">${data.high.toFixed(2)}</span>
            <span className="text-gray-400">Low:</span>
            <span className="font-medium">${data.low.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Get and format data for the current selected timeframe
  const getDisplayData = () => {
    switch(selectedTimeframe) {
      case 'daily':
        return formatDailyData(dailyData);
      case 'weekly':
        return formatWeeklyData(weeklyData);
      case 'monthly':
        return formatMonthlyData(monthlyData);
      default:
        return formatDailyData(dailyData);
    }
  };
  
  // Handle timeframe selection
  const handleTimeframeChange = (timeframe: TimeFrame) => {
    console.log(`Switching to ${timeframe} timeframe view`);
    setSelectedTimeframe(timeframe);
  };
  
  // Debug our timeframe data when it changes
  useEffect(() => {
    console.log(`Current timeframe: ${selectedTimeframe}`);
    console.log(`Data points for ${selectedTimeframe}:`, 
      selectedTimeframe === 'daily' ? dailyData.length : 
      selectedTimeframe === 'weekly' ? weeklyData.length : 
      monthlyData.length
    );
  }, [selectedTimeframe, dailyData, weeklyData, monthlyData]);
  
  // Determine colors based on stock performance
  const isPositive = (d: CandlestickData) => d.close >= d.open;
  const positiveColor = '#10b981'; // bright green from the reference image
  const negativeColor = '#ef4444'; // bright red from the reference image
  
  // Calculate Y-axis domain for proper scaling based on stock price range
  const calculateYDomain = () => {
    const data = getDisplayData();
    if (data.length === 0) return ['auto', 'auto'];
    
    // Find min and max values
    const min = Math.min(...data.map(d => d.low));
    const max = Math.max(...data.map(d => d.high));
    
    // Calculate appropriate padding based on price magnitude
    let paddingPercentage;
    
    if (basePrice < 10) {
      // For penny stocks, use tighter padding
      paddingPercentage = 0.02; // 2%
    } else if (basePrice < 100) {
      // For stocks under $100, use moderate padding
      paddingPercentage = 0.03; // 3%
    } else if (basePrice < 1000) {
      // For stocks between $100-$1000
      paddingPercentage = 0.04; // 4%
    } else {
      // For very expensive stocks
      paddingPercentage = 0.05; // 5% 
    }
    
    const padding = (max - min) * paddingPercentage;
    
    // For nicer visuals, we'll round to appropriate precision based on price range
    let roundedMin, roundedMax;
    
    if (basePrice < 1) {
      // Round to 3 decimal places for sub-dollar stocks
      roundedMin = Math.floor(min * 1000 - padding * 1000) / 1000;
      roundedMax = Math.ceil(max * 1000 + padding * 1000) / 1000;
    } else if (basePrice < 10) {
      // Round to 2 decimal places
      roundedMin = Math.floor(min * 100 - padding * 100) / 100;
      roundedMax = Math.ceil(max * 100 + padding * 100) / 100;
    } else if (basePrice < 100) {
      // Round to 1 decimal place
      roundedMin = Math.floor(min * 10 - padding * 10) / 10;
      roundedMax = Math.ceil(max * 10 + padding * 10) / 10;
    } else {
      // Round to whole dollars
      roundedMin = Math.floor(min - padding);
      roundedMax = Math.ceil(max + padding);
    }
    
    return [roundedMin, roundedMax];
  };
  
  const timeframeButtonClass = (tf: TimeFrame) => 
    `px-2 py-1 text-xs font-medium ${selectedTimeframe === tf 
      ? 'bg-blue-600 text-white' 
      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`;
  
  return (
    <div className="flex flex-col h-full bg-gray-900 dark:bg-gray-900 rounded-md p-2">
      {/* Timeframe selector */}
      <div className="flex justify-end mb-1 gap-1">
        <button 
          className={timeframeButtonClass('daily')}
          onClick={() => handleTimeframeChange('daily')}
        >
          1D
        </button>
        <button 
          className={timeframeButtonClass('weekly')}
          onClick={() => handleTimeframeChange('weekly')}
        >
          1W
        </button>
        <button 
          className={timeframeButtonClass('monthly')}
          onClick={() => handleTimeframeChange('monthly')}
        >
          1M
        </button>
      </div>
      
      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={getDisplayData()}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#475569" /> 
            <XAxis 
              dataKey="displayTime" 
              tick={{fontSize: 10, fill: '#cbd5e1'}}
              tickLine={false}
              axisLine={{stroke: '#334155'}}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{fontSize: 10, fill: '#cbd5e1'}} 
              tickFormatter={formatYAxis}
              domain={calculateYDomain()}
              tickLine={false}
              axisLine={{stroke: '#334155'}}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line for base price (hidden in dark theme) */}
            <ReferenceLine 
              y={basePrice} 
              stroke="#64748b" 
              strokeDasharray="3 3" 
              label={{ 
                value: `Base: $${basePrice.toFixed(2)}`, 
                position: 'right',
                fill: '#94a3b8',
                fontSize: 10
              }} 
            />
            
            {/* Calculate values for candlesticks */}
            {getDisplayData().map((entry, index) => {
              // Pre-calculate values needed for rendering
              const isUp = entry.close >= entry.open;
              const color = isUp ? positiveColor : negativeColor;
              entry.color = color;
              return null;
            })}
            
            {/* High/low wicks */}
            {getDisplayData().map((entry, index) => (
              <ReferenceLine
                key={`wick-${index}`}
                segment={[
                  { x: index, y: entry.low },
                  { x: index, y: entry.high }
                ]}
                stroke={entry.color}
                strokeWidth={1}
              />
            ))}
            
            {/* Candle bodies as thick lines */}
            {getDisplayData().map((entry, index) => (
              <ReferenceLine
                key={`body-${index}`}
                segment={[
                  { x: index, y: entry.open },
                  { x: index, y: entry.close }
                ]}
                stroke={entry.color}
                strokeWidth={selectedTimeframe === 'daily' ? 6 : selectedTimeframe === 'weekly' ? 8 : 10}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}