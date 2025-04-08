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
  
  // Generate historical stock data
  useEffect(() => {
    console.log(`Updating chart for stock: ${stockId} at price: ${currentPrice}`);
    
    const volatilityFactor = volatility === 'extreme' ? 0.20 :
                            volatility === 'very_high' ? 0.12 :
                            volatility === 'high' ? 0.08 : 
                            volatility === 'medium' ? 0.05 : 
                            volatility === 'low' ? 0.02 : 0.01; // very_low
    const trendFactor = marketTrend === 'bull' ? 0.01 : 
                        marketTrend === 'bear' ? -0.01 : 0;
    
    // Generate new historical data if it's a new stock
    if (previousDataRef.current.data.length === 0 || previousDataRef.current.id !== stockId) {
      const newData: CandlestickData[] = [];
      let prevPrice = basePrice;
      
      // Generate last 14 days of data for cleaner candlestick view
      for (let i = Math.max(1, currentDay - 14); i <= currentDay; i++) {
        // Use a seeded random based on stock ID and day to ensure consistency
        const seed = stockId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + i;
        const pseudoRandom = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
        
        // Create some randomness with trend influence
        const randomFactor = (pseudoRandom - 0.5) * volatilityFactor;
        const dayTrendFactor = trendFactor * (1 + Math.sin(i / 10) * 0.5);
        
        // Calculate price changes for the day
        const openPrice = prevPrice;
        const closePrice = prevPrice * (1 + randomFactor + dayTrendFactor);
        
        // Generate intraday high and low values
        const dayVolatility = volatilityFactor * Math.abs(pseudoRandom);
        const highPrice = Math.max(openPrice, closePrice) * (1 + dayVolatility / 2);
        const lowPrice = Math.min(openPrice, closePrice) * (1 - dayVolatility / 2);
        
        // Calculate simulated volume (higher on more volatile days)
        const volume = Math.floor(10000 + 50000 * dayVolatility * Math.abs(pseudoRandom));
        
        // Ensure prices don't go too low
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
        
        // Calculate reasonable high/low based on the open and close prices
        const high = Math.max(lastPoint.open, currentPrice) * 1.01;
        const low = Math.min(lastPoint.open, currentPrice) * 0.99;
        
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
        
        // Calculate reasonable high/low based on the open and close prices
        const high = Math.max(openPrice, currentPrice) * 1.01;
        const low = Math.min(openPrice, currentPrice) * 0.99;
        
        mergedData.push({
          day: currentDay,
          date: formatDateFromDay(currentDay),
          open: openPrice,
          close: currentPrice,
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          volume: Math.floor(10000 + 50000 * Math.random())
        });
      }
      
      // Keep only the last 14 days for cleaner candlestick view
      const finalData = mergedData
        .slice(-14)
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
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-md text-xs text-gray-800">
          <p className="font-semibold">{data.date}</p>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <span className="text-gray-600">Open:</span>
            <span className="font-medium">${data.open.toFixed(2)}</span>
            <span className="text-gray-600">Close:</span>
            <span className="font-medium">${data.close.toFixed(2)}</span>
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
  const positiveColor = '#10b981'; // green
  const negativeColor = '#ef4444'; // red
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="date" 
          tick={{fontSize: 10}}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tick={{fontSize: 10}} 
          tickFormatter={formatYAxis}
          domain={['auto', 'auto']}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={basePrice} stroke="#9ca3af" strokeDasharray="3 3" />
        
        {/* Candlestick body */}
        <Bar
          dataKey="low" 
          fill="transparent" 
          stroke="transparent" 
          yAxisId={0}
        />
        <Bar
          dataKey={(datum) => Math.abs(datum.open - datum.close)}
          barSize={8}
          fill={(datum) => isPositive(datum) ? positiveColor : negativeColor}
          stroke={(datum) => isPositive(datum) ? positiveColor : negativeColor}
          yAxisId={0}
          // Offset to place the bar at the correct position
          stackId="stack"
          baseValue={(datum) => Math.min(datum.open, datum.close)}
        />
        
        {/* Price line connecting closes */}
        <Line
          type="monotone"
          dataKey="close"
          stroke="#4b5563"
          dot={false}
          strokeWidth={1.5}
          animationDuration={500}
        />
        
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
