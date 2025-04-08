import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ReferenceLine
} from 'recharts';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { VolatilityLevel } from '../lib/data/investments';

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
}

export function StockChart({ stockId, currentPrice, basePrice, volatility }: StockChartProps) {
  const { currentDay, currentMonth, currentYear } = useTime();
  const { marketTrend } = useEconomy();
  const [data, setData] = useState<CandlestickData[]>([]);
  const previousDataRef = useRef<{
    id: string, 
    data: CandlestickData[]
  }>({ id: '', data: [] });
  
  // Reset data when stock changes
  useEffect(() => {
    if (previousDataRef.current.id !== stockId) {
      setData([]);
      previousDataRef.current = { id: stockId, data: [] };
    }
  }, [stockId]);
  
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
  
  // Generate historical stock data
  useEffect(() => {
    console.log(`Updating chart for stock: ${stockId} at price: ${currentPrice}`);
    
    const volatilityFactor = getRealisticVolatilityFactor(volatility, marketTrend);
    
    // Market trend affects the baseline direction
    // Much smaller trend factors to avoid unrealistic gains/losses
    const trendFactor = marketTrend === 'bull' ? 0.0015 : 
                        marketTrend === 'bear' ? -0.0015 : 0.0005;
    
    // Generate new historical data if it's a new stock
    if (previousDataRef.current.data.length === 0 || previousDataRef.current.id !== stockId) {
      const newData: CandlestickData[] = [];
      let prevPrice = basePrice;
      
      // Generate last 20 days of data for more history
      for (let i = Math.max(1, currentDay - 20); i <= currentDay; i++) {
        // Use a seeded random based on stock ID and day to ensure consistency
        const seed = stockId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + i;
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
        
        newData.push({
          day: i,
          date: formatDateFromDay(i),
          open: parseFloat(openPrice.toFixed(2)),
          close: parseFloat(closePrice.toFixed(2)),
          high: parseFloat(highPrice.toFixed(2)),
          low: parseFloat(lowPrice.toFixed(2)),
          volume: volume
        });
      }
      
      // Make sure the last data point matches current price
      if (newData.length > 0) {
        const lastIndex = newData.length - 1;
        const lastPoint = newData[lastIndex];
        
        // Create realistic high/low for current day
        const dailyRange = volatilityFactor * 0.5;
        const high = Math.max(lastPoint.open, currentPrice) * (1 + dailyRange * 0.5);
        const low = Math.min(lastPoint.open, currentPrice) * (1 - dailyRange * 0.5);
        
        newData[lastIndex] = {
          ...lastPoint,
          close: currentPrice,
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2))
        };
      }
      
      setData(newData);
      previousDataRef.current = { id: stockId, data: newData };
    } else {
      // Update existing data
      const mergedData = [...previousDataRef.current.data];
      
      // Update or add the current day's price
      const currentDayIndex = mergedData.findIndex(d => d.day === currentDay);
      if (currentDayIndex >= 0) {
        const existingPoint = mergedData[currentDayIndex];
        // Keep the open price, update close to current
        // Adjust high/low if needed
        const high = Math.max(existingPoint.high, currentPrice);
        const low = Math.min(existingPoint.low, currentPrice);
        
        mergedData[currentDayIndex] = {
          ...existingPoint,
          close: currentPrice,
          high,
          low
        };
      } else {
        // If this is a new day, use the last close as today's open
        const lastPoint = mergedData[mergedData.length - 1];
        const openPrice = lastPoint ? lastPoint.close : basePrice;
        
        // Create realistic high/low for new day
        const dailyRange = volatilityFactor * 0.5;
        const high = Math.max(openPrice, currentPrice) * (1 + dailyRange * 0.5);
        const low = Math.min(openPrice, currentPrice) * (1 - dailyRange * 0.5);
        
        mergedData.push({
          day: currentDay,
          date: formatDateFromDay(currentDay),
          open: openPrice,
          close: currentPrice,
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          volume: Math.floor(50000 + 200000 * Math.random() * 0.8)
        });
      }
      
      // Keep only the last 20 days for more historical context
      const finalData = mergedData
        .slice(-20)
        .sort((a, b) => a.day - b.day);
      
      setData(finalData);
      previousDataRef.current = { id: stockId, data: finalData };
    }
  }, [currentDay, stockId, currentPrice, basePrice, volatility, marketTrend, currentMonth, currentYear]);
  
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
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
  
  // Determine colors based on stock performance
  const isPositive = (d: CandlestickData) => d.close >= d.open;
  const positiveColor = '#16a34a'; // green from image (slightly darker than before)
  const negativeColor = '#dc2626'; // red from image (slightly darker than before);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
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
          domain={['auto', 'auto']}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Candlestick body */}
        {/* Generate separate bars for up and down days to solve the styling issue */}
        {data.map((entry, index) => (
          <Bar
            key={`candle-${index}`}
            dataKey={() => Math.abs(entry.open - entry.close)}
            barSize={6}
            fill={isPositive(entry) ? positiveColor : negativeColor}
            stroke={isPositive(entry) ? positiveColor : negativeColor}
            stackId="stack"
            baseValue={Math.min(entry.open, entry.close)}
            // Only render at specific index positions
            minPointSize={1}
            isAnimationActive={false}
            name={`candle-${index}`}
            legendType="none"
            hide={false}
            xAxisId={undefined}
            yAxisId={undefined}
            // Use specific x-coordinate
            shape={(props) => {
              // Only draw at the right index position
              if (props.index !== index) return null;
              return <rect 
                x={props.x} 
                y={props.y} 
                width={props.width} 
                height={props.height} 
                fill={isPositive(entry) ? positiveColor : negativeColor}
                stroke={isPositive(entry) ? positiveColor : negativeColor}
              />;
            }}
          />
        ))}
        
        {/* High/low wicks */}
        {data.map((entry, index) => (
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
        {data.map((entry, index) => (
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
  );
}

export default StockChart;
