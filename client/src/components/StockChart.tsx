import { useState, useEffect, useRef } from 'react';
import { Line } from 'recharts';
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
  const previousDataRef = useRef<Array<{day: number, price: number}>>([]);
  
  // Generate historical stock data
  useEffect(() => {
    const volatilityFactor = volatility === 'extreme' ? 0.20 :
                            volatility === 'very_high' ? 0.12 :
                            volatility === 'high' ? 0.08 : 
                            volatility === 'medium' ? 0.05 : 
                            volatility === 'low' ? 0.02 : 0.01; // very_low
    const trendFactor = marketTrend === 'bull' ? 0.01 : 
                        marketTrend === 'bear' ? -0.01 : 0;
    
    const newData = [];
    let prevPrice = basePrice;
    
    // Generate last 30 days of data
    for (let i = Math.max(1, currentDay - 30); i <= currentDay; i++) {
      // Create some randomness with trend influence
      const randomFactor = (Math.random() - 0.5) * volatilityFactor;
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
    
    // If we have previous data, merge it with new data for smooth transitions
    if (previousDataRef.current.length > 0) {
      const mergedData = [...previousDataRef.current];
      // Add new day's data
      if (mergedData.findIndex(d => d.day === currentDay) === -1) {
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
      previousDataRef.current = finalData;
    } else {
      // First render, use generated data
      setData(newData);
      previousDataRef.current = newData;
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
  
  const primaryColor = currentPrice >= basePrice ? '#10b981' : '#ef4444';
  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.price));
    const dataMin = Math.min(...data.map((i) => i.price));
  
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
  
    return dataMax / (dataMax - dataMin);
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
          fill="url(#colorPrice)" 
          animationDuration={500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default StockChart;
