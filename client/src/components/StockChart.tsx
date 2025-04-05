import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ResponsiveContainer,
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
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

export function StockChart({ stockId, currentPrice, basePrice, volatility }: StockChartProps) {
  const { currentDay } = useTime();
  const { marketTrend } = useEconomy();
  const [data, setData] = useState<Array<{day: number, price: number}>>([]);
  const previousDataRef = useRef<{
    id: string, 
    data: Array<{day: number, price: number}>
  }>({ id: '', data: [] });
  
  // Reset data when stock changes
  useEffect(() => {
    if (previousDataRef.current.id !== stockId) {
      setData([]);
      previousDataRef.current = { id: stockId, data: [] };
    }
  }, [stockId]);
  
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
      const newData = [];
      let prevPrice = basePrice;
      
      // Generate last 30 days of data
      for (let i = Math.max(1, currentDay - 30); i <= currentDay; i++) {
        // Use a seeded random based on stock ID and day to ensure consistency
        const seed = stockId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + i;
        const pseudoRandom = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
        
        // Create some randomness with trend influence
        const randomFactor = (pseudoRandom - 0.5) * volatilityFactor;
        const dayTrendFactor = trendFactor * (1 + Math.sin(i / 10) * 0.5);
        
        // Calculate price
        prevPrice = prevPrice * (1 + randomFactor + dayTrendFactor);
        
        // Ensure price doesn't go too low
        prevPrice = Math.max(prevPrice, basePrice * 0.5);
        
        newData.push({
          day: i,
          price: parseFloat(prevPrice.toFixed(2))
        });
      }
      
      // Make sure the last data point matches current price
      if (newData.length > 0) {
        newData[newData.length - 1].price = currentPrice;
      }
      
      setData(newData);
      previousDataRef.current = { id: stockId, data: newData };
    } else {
      // Update existing data
      const mergedData = [...previousDataRef.current.data];
      
      // Update or add the current day's price
      const currentDayIndex = mergedData.findIndex(d => d.day === currentDay);
      if (currentDayIndex >= 0) {
        mergedData[currentDayIndex].price = currentPrice;
      } else {
        mergedData.push({
          day: currentDay,
          price: currentPrice
        });
      }
      
      // Keep only the last 30 days
      const finalData = mergedData
        .slice(-30)
        .sort((a, b) => a.day - b.day);
      
      setData(finalData);
      previousDataRef.current = { id: stockId, data: finalData };
    }
  }, [currentDay, stockId, currentPrice, basePrice, volatility, marketTrend]);
  
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <p>Day {label}</p>
          <p className="font-semibold">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };
  
  // Create a unique gradient ID for each stock to prevent conflicts
  const gradientId = useMemo(() => `color-${stockId}`, [stockId]);
  const primaryColor = currentPrice >= basePrice ? '#10b981' : '#ef4444';
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={primaryColor} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="day" 
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
        <Area 
          type="monotone" 
          dataKey="price" 
          stroke={primaryColor} 
          fillOpacity={1} 
          fill={`url(#${gradientId})`} 
          animationDuration={500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default StockChart;
