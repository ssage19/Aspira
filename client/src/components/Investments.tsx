import { useState, useEffect } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import { useAudio } from '../lib/stores/useAudio';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { ChartBar, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import StockChart from './StockChart';
import { formatCurrency } from '../lib/utils';
import { stockMarket } from '../lib/data/investments';

export function Investments() {
  const { wealth, addWealth, addAsset, removeAsset, assets } = useCharacter();
  const { marketTrend, stockMarketHealth } = useEconomy();
  const { currentDay } = useTime();
  const { playSuccess, playHit } = useAudio();
  
  const [selectedStock, setSelectedStock] = useState(stockMarket[0]);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});

  // Calculate current prices based on economy and time
  useEffect(() => {
    const updatedPrices: Record<string, number> = {};
    
    stockMarket.forEach(stock => {
      // Base price influenced by market health and stock volatility
      const volatilityFactor = stock.volatility * 0.2;
      const marketFactor = marketTrend === 'bull' ? 1.05 : marketTrend === 'bear' ? 0.95 : 1;
      const timeFactor = Math.sin(currentDay / 30 * Math.PI) * volatilityFactor;
      
      // Calculate new price with some randomness
      let newPrice = stock.basePrice * marketFactor;
      newPrice += newPrice * timeFactor;
      newPrice += newPrice * (Math.random() * volatilityFactor - volatilityFactor/2);
      
      // Ensure price doesn't go too low
      newPrice = Math.max(newPrice, stock.basePrice * 0.1);
      
      updatedPrices[stock.id] = parseFloat(newPrice.toFixed(2));
    });
    
    setStockPrices(updatedPrices);
  }, [currentDay, marketTrend, stockMarketHealth]);

  // Calculate owned stock value
  const getOwnedStockQuantity = (stockId: string) => {
    const ownedStock = assets.find(asset => asset.id === stockId && asset.type === 'stock');
    return ownedStock ? ownedStock.quantity : 0;
  };

  const getOwnedStockValue = (stockId: string) => {
    const quantity = getOwnedStockQuantity(stockId);
    const currentPrice = stockPrices[stockId] || 0;
    return quantity * currentPrice;
  };

  const handleBuy = () => {
    if (investmentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (investmentAmount > wealth) {
      toast.error("Not enough funds");
      playHit();
      return;
    }
    
    const stockPrice = stockPrices[selectedStock.id] || selectedStock.basePrice;
    const quantity = investmentAmount / stockPrice;
    
    // Buy stock
    addAsset({
      id: selectedStock.id,
      name: selectedStock.name,
      type: 'stock',
      quantity,
      purchasePrice: stockPrice,
      purchaseDate: `${currentDay}`
    });
    
    addWealth(-investmentAmount);
    playSuccess();
    toast.success(`Purchased ${quantity.toFixed(2)} shares of ${selectedStock.name}`);
  };

  const handleSell = () => {
    const ownedQuantity = getOwnedStockQuantity(selectedStock.id);
    
    if (ownedQuantity <= 0) {
      toast.error("You don't own any shares of this stock");
      return;
    }
    
    const stockPrice = stockPrices[selectedStock.id] || selectedStock.basePrice;
    const sellValue = ownedQuantity * stockPrice;
    
    // Sell stock
    removeAsset(selectedStock.id, 'stock');
    addWealth(sellValue);
    
    playSuccess();
    toast.success(`Sold ${ownedQuantity.toFixed(2)} shares of ${selectedStock.name} for ${formatCurrency(sellValue)}`);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <ChartBar className="mr-2" />
        Stock Market
        {marketTrend === 'bull' && <TrendingUp className="ml-2 text-green-500" />}
        {marketTrend === 'bear' && <TrendingDown className="ml-2 text-red-500" />}
      </h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Market Health: {stockMarketHealth}%</p>
        <p className="text-sm text-gray-500">Trend: {marketTrend.charAt(0).toUpperCase() + marketTrend.slice(1)}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold mb-2">Available Stocks</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stockMarket.map(stock => (
              <div 
                key={stock.id}
                className={`p-2 border rounded cursor-pointer transition-colors ${selectedStock.id === stock.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{stock.name} ({stock.symbol})</span>
                  <span className={`${
                    stockPrices[stock.id] > stock.basePrice ? 'text-green-600' : 
                    stockPrices[stock.id] < stock.basePrice ? 'text-red-600' : ''
                  }`}>
                    ${stockPrices[stock.id] || stock.basePrice}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Risk: {stock.volatility === 'high' ? 'High' : stock.volatility === 'medium' ? 'Medium' : 'Low'}</span>
                  <span>Owned: {getOwnedStockQuantity(stock.id).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">{selectedStock.name} ({selectedStock.symbol})</h3>
          <div className="h-40 mb-2">
            <StockChart 
              stockId={selectedStock.id}
              currentPrice={stockPrices[selectedStock.id] || selectedStock.basePrice}
              basePrice={selectedStock.basePrice}
              volatility={selectedStock.volatility}
            />
          </div>
          <p className="text-sm mb-2">{selectedStock.description}</p>
          <div className="flex justify-between text-sm mb-2">
            <span>Current Price: ${stockPrices[selectedStock.id] || selectedStock.basePrice}</span>
            <span>Owned Value: {formatCurrency(getOwnedStockValue(selectedStock.id))}</span>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Make Investment</h3>
        <div className="mb-4">
          <label className="block text-sm mb-1">Investment Amount: {formatCurrency(investmentAmount)}</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[investmentAmount]}
              max={Math.min(100000, wealth)}
              step={100}
              onValueChange={(vals) => setInvestmentAmount(vals[0])}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setInvestmentAmount(wealth)}
            >
              Max
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleBuy}
            disabled={investmentAmount <= 0 || investmentAmount > wealth}
            className="flex-1"
          >
            Buy Shares
          </Button>
          <Button 
            onClick={handleSell}
            disabled={getOwnedStockQuantity(selectedStock.id) <= 0}
            variant="outline"
            className="flex-1"
          >
            Sell All Shares
          </Button>
        </div>
        
        {selectedStock.volatility === 'high' && (
          <div className="mt-2 flex items-start gap-2 text-amber-700 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>High volatility stocks can bring great returns but also come with higher risk of losses.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Investments;
