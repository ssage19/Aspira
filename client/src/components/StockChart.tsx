import { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ReferenceLine
} from 'recharts';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { VolatilityLevel } from '../lib/data/investments';

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
  
  // Reset data when stock changes
  useEffect(() => {
    if (previousDataRef.current.id !== stockId) {
      setDailyData([]);
      setWeeklyData([]);
      setMonthlyData([]);
      previousDataRef.current = { 
        id: stockId, 
        dailyData: [], 
        weeklyData: [],
        monthlyData: [],
        lastUpdatedMonth: currentMonth,
        lastUpdatedYear: currentYear
      };
    }
  }, [stockId, currentMonth, currentYear]);
  
  // Format a day number to an MM/DD date string based on the current date
  const formatDateFromDay = (dayNumber: number) => {
    // Create a new date from the current game date
    const currentDate = new Date(currentYear, currentMonth - 1, currentDay);
    
    // Adjust date to the dayNumber
    const dayDiff = currentDay - dayNumber;
    const targetDate = new Date(currentDate);
    targetDate.setDate(targetDate.getDate() - dayDiff);
    
    // Format as MM/DD
    const month = targetDate.getMonth() + 1; // 0-indexed months
    const day = targetDate.getDate();
    return `${month}/${day}`;
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
        
        // Format date for display
        const formattedDate = `${targetMonth}/${targetDay}`;
        
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
        lastUpdatedMonth: currentMonth,
        lastUpdatedYear: currentYear
      };
      
    } else {
      // Just update the current day's data
      const cachedDailyData = [...previousDataRef.current.dailyData];
      
      // Update or add the current day's price
      const currentDayIndex = cachedDailyData.findIndex(d => 
        d.day === currentDay && d.month === currentMonth && d.year === currentYear
      );
      
      if (currentDayIndex >= 0) {
        const existingPoint = cachedDailyData[currentDayIndex];
        // Keep the open price, update close to current
        // Adjust high/low if needed
        const high = Math.max(existingPoint.high, currentPrice);
        const low = Math.min(existingPoint.low, currentPrice);
        
        cachedDailyData[currentDayIndex] = {
          ...existingPoint,
          close: currentPrice,
          high,
          low
        };
      } else {
        // If this is a new day, use the last close as today's open
        const lastPoint = cachedDailyData[cachedDailyData.length - 1];
        const openPrice = lastPoint ? lastPoint.close : basePrice;
        
        // Create realistic high/low for new day
        const dailyRange = volatilityFactor * 0.5;
        const high = Math.max(openPrice, currentPrice) * (1 + dailyRange * 0.5);
        const low = Math.min(openPrice, currentPrice) * (1 - dailyRange * 0.5);
        
        // Format date
        const formattedDate = `${currentMonth}/${currentDay}`;
        const weekNumber = getWeekNumber(new Date(currentYear, currentMonth - 1, currentDay));
        
        cachedDailyData.push({
          day: currentDay,
          date: formattedDate,
          open: openPrice,
          close: currentPrice,
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          volume: Math.floor(50000 + 200000 * Math.random() * 0.8),
          month: currentMonth,
          year: currentYear,
          weekNumber: weekNumber
        });
      }
      
      // Only keep the last 90 days of data
      const finalDailyData = cachedDailyData
        .slice(-90)
        .sort((a, b) => {
          if (a.year !== b.year) return a.year! - b.year!;
          if (a.month !== b.month) return a.month! - b.month!;
          return a.day - b.day;
        });
      
      // Update weekly and monthly views
      const updatedWeeklyData = aggregateToWeekly(finalDailyData);
      const updatedMonthlyData = aggregateToMonthly(finalDailyData);
      
      // Update state
      setDailyData(finalDailyData.slice(-20)); // Last 20 days for daily view
      setWeeklyData(updatedWeeklyData.slice(-12)); // Last 12 weeks
      setMonthlyData(updatedMonthlyData.slice(-6)); // Last 6 months
      
      // Cache updated data
      previousDataRef.current = {
        ...previousDataRef.current,
        dailyData: finalDailyData,
        weeklyData: updatedWeeklyData,
        monthlyData: updatedMonthlyData,
        lastUpdatedMonth: currentMonth,
        lastUpdatedYear: currentYear
      };
    }
  }, [currentDay, stockId, currentPrice, basePrice, volatility, marketTrend, currentMonth, currentYear]);
  
  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const priceDiff = data.close - data.open;
      const percentChange = ((data.close - data.open) / data.open * 100).toFixed(2);
      const changeColor = priceDiff >= 0 ? 'text-green-600' : 'text-red-600';
      
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-md text-xs text-gray-800">
          <p className="font-semibold">{data.date}</p>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <span className="text-gray-600">Open:</span>
            <span className="font-medium">${data.open.toFixed(2)}</span>
            <span className="text-gray-600">Close:</span>
            <span className={`font-medium ${changeColor}`}>${data.close.toFixed(2)}</span>
            <span className="text-gray-600">Change:</span>
            <span className={`font-medium ${changeColor}`}>
              {priceDiff >= 0 ? '+' : ''}{priceDiff.toFixed(2)} ({percentChange}%)
            </span>
            <span className="text-gray-600">High:</span>
            <span className="font-medium">${data.high.toFixed(2)}</span>
            <span className="text-gray-600">Low:</span>
            <span className="font-medium">${data.low.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Determine which data to display based on selected timeframe
  const getDisplayData = () => {
    switch(selectedTimeframe) {
      case 'daily':
        return dailyData;
      case 'weekly':
        return weeklyData;
      case 'monthly':
        return monthlyData;
      default:
        return dailyData;
    }
  };
  
  // Handle timeframe selection
  const handleTimeframeChange = (timeframe: TimeFrame) => {
    setSelectedTimeframe(timeframe);
  };
  
  // Determine colors based on stock performance
  const isPositive = (d: CandlestickData) => d.close >= d.open;
  const positiveColor = '#16a34a'; // green from image (slightly darker than before)
  const negativeColor = '#dc2626'; // red from image (slightly darker than before)
  
  // Calculate Y-axis domain for proper scaling
  const calculateYDomain = () => {
    const data = getDisplayData();
    if (data.length === 0) return ['auto', 'auto'];
    
    // Find min and max values
    let min = Math.min(...data.map(d => d.low));
    let max = Math.max(...data.map(d => d.high));
    
    // Add some padding (5%)
    const padding = (max - min) * 0.05;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };
  
  const timeframeButtonClass = (tf: TimeFrame) => 
    `px-2 py-1 text-xs font-medium ${selectedTimeframe === tf 
      ? 'bg-gray-800 text-white' 
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
  
  return (
    <div className="flex flex-col h-full">
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
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} /> 
            <XAxis 
              dataKey="date" 
              tick={{fontSize: 10}}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{fontSize: 10}} 
              tickFormatter={formatYAxis}
              domain={calculateYDomain()}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line for base price */}
            <ReferenceLine 
              y={basePrice} 
              stroke="#9ca3af" 
              strokeDasharray="3 3" 
              label={{ 
                value: `Base: $${basePrice.toFixed(2)}`, 
                position: 'right',
                fill: '#6b7280',
                fontSize: 10
              }} 
            />
            
            {/* Candlestick bodies */}
            {/* Prepare data with calculated values first */}
            {(() => {
              // Process data with calculated fields for display
              const data = getDisplayData();
              data.forEach(entry => {
                // Pre-calculate values for display
                entry.height = Math.abs(entry.close - entry.open);
                entry.y0 = Math.min(entry.open, entry.close);
                entry.color = isPositive(entry) ? positiveColor : negativeColor;
              });
              return null;
            })()}
            
            {/* Two separate bar series for up/down days */}
            <Bar
              dataKey="height"
              barSize={selectedTimeframe === 'daily' ? 6 : selectedTimeframe === 'weekly' ? 8 : 10}
              fill={positiveColor}
              name="candleUp"
              stackId="candles"
              // Only show for positive days
              fillOpacity={(entry) => isPositive(entry) ? 1 : 0}
              // Use y0 for proper positioning
              baseValue={(entry) => entry.y0 || 0}
            />
            
            <Bar
              dataKey="height"
              barSize={selectedTimeframe === 'daily' ? 6 : selectedTimeframe === 'weekly' ? 8 : 10}
              fill={negativeColor}
              name="candleDown"
              stackId="candles"
              // Only show for negative days
              fillOpacity={(entry) => isPositive(entry) ? 0 : 1}
              // Use y0 for proper positioning
              baseValue={(entry) => entry.y0 || 0}
            />
            
            {/* High/low wicks */}
            {getDisplayData().map((entry, index) => (
              <ReferenceLine
                key={`high-${index}`}
                segment={[
                  { x: index, y: entry.high },
                  { x: index, y: Math.max(entry.open, entry.close) }
                ]}
                stroke={isPositive(entry) ? positiveColor : negativeColor}
                strokeWidth={1}
              />
            ))}
            {getDisplayData().map((entry, index) => (
              <ReferenceLine
                key={`low-${index}`}
                segment={[
                  { x: index, y: entry.low },
                  { x: index, y: Math.min(entry.open, entry.close) }
                ]}
                stroke={isPositive(entry) ? positiveColor : negativeColor}
                strokeWidth={1}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StockChart;
