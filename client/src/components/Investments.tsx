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
import { stockMarket, VolatilityLevel, Stock } from '../lib/data/investments';

export function Investments() {
  const { wealth, addWealth, addAsset, removeAsset, assets } = useCharacter();
  const { marketTrend, stockMarketHealth } = useEconomy();
  const { currentDay } = useTime();
  const { playSuccess, playHit } = useAudio();
  
  const [selectedStock, setSelectedStock] = useState<Stock>(stockMarket[0]);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});

  // Calculate current prices based on economy and time
  useEffect(() => {
    const updatedPrices: Record<string, number> = {};
    
    stockMarket.forEach(stock => {
      // Base price influenced by market health and stock volatility
      const volatilityFactor = 
        stock.volatility === 'extreme' ? 0.7 :
        stock.volatility === 'very_high' ? 0.5 : 
        stock.volatility === 'high' ? 0.3 : 
        stock.volatility === 'medium' ? 0.2 : 
        stock.volatility === 'low' ? 0.1 : 0.05; // very_low
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

  // Calculate the price change percentage for context-aware tips
  const priceChangePercent = selectedStock ? 
    ((stockPrices[selectedStock.id] - selectedStock.basePrice) / selectedStock.basePrice) * 100 : 0;
  
  // Determine investment opportunity level
  const isPotentialBuy = marketTrend === 'bull' && priceChangePercent < -5;
  const isPotentialSell = marketTrend === 'bear' && priceChangePercent > 5;
  const isVolatilityWarning = selectedStock.volatility === 'high' || 
                             selectedStock.volatility === 'very_high' ||
                             selectedStock.volatility === 'extreme';

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg animate-scale-in">
      <h2 className="text-2xl font-bold mb-4 flex items-center" aria-label={`Stock Market - ${marketTrend} market`}>
        <ChartBar className="mr-2" />
        Stock Market
        {marketTrend === 'bull' && <TrendingUp className="ml-2 text-accessible-green" aria-hidden="true" />}
        {marketTrend === 'bear' && <TrendingDown className="ml-2 text-accessible-red" aria-hidden="true" />}
      </h2>
      
      <div className="mb-4 bg-gray-50 p-3 rounded-md">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">Market Health:</p>
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className={`h-2 rounded-full ${
                  stockMarketHealth >= 70 ? 'bg-accessible-green' : 
                  stockMarketHealth >= 40 ? 'bg-accessible-yellow' : 
                  'bg-accessible-red'
                }`}
                style={{ width: `${stockMarketHealth}%` }}
                aria-hidden="true"
              ></div>
            </div>
            <span className="text-sm font-semibold">{stockMarketHealth}%</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm font-medium">Trend:</p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            marketTrend === 'bull' ? 'bg-accessible-green/20 text-accessible-green' : 
            marketTrend === 'bear' ? 'bg-accessible-red/20 text-accessible-red' : 
            'bg-gray-200 text-gray-700'
          }`}>
            {marketTrend.charAt(0).toUpperCase() + marketTrend.slice(1)} Market
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold mb-2 text-lg" id="available-stocks-heading">Available Stocks</h3>
          <div 
            className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
            aria-labelledby="available-stocks-heading"
            role="listbox"
          >
            {stockMarket.map(stock => (
              <div 
                key={stock.id}
                role="option"
                aria-selected={selectedStock.id === stock.id}
                className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                  selectedStock.id === stock.id 
                    ? 'bg-blue-50 border-accessible-blue shadow-sm' 
                    : 'hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-base">{stock.name} ({stock.symbol})</span>
                  <span className={`font-mono font-semibold ${
                    stockPrices[stock.id] > stock.basePrice 
                      ? 'text-accessible-green' 
                      : stockPrices[stock.id] < stock.basePrice 
                        ? 'text-accessible-red' 
                        : ''
                  }`}>
                    ${(stockPrices[stock.id] || stock.basePrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className={`px-2 py-0.5 rounded-full ${
                    stock.volatility === 'extreme' ? 'bg-purple-200 text-purple-800' :
                    stock.volatility === 'high' || stock.volatility === 'very_high'
                      ? 'bg-accessible-red/10 text-accessible-red'
                      : stock.volatility === 'medium'
                        ? 'bg-accessible-orange/10 text-accessible-orange'
                        : 'bg-accessible-green/10 text-accessible-green'
                  }`}>
                    Risk: {stock.volatility === 'extreme' ? 'Extreme' :
                          stock.volatility === 'very_high' ? 'Very High' : 
                          stock.volatility === 'high' ? 'High' : 
                          stock.volatility === 'medium' ? 'Medium' : 
                          stock.volatility === 'low' ? 'Low' : 'Very Low'}
                  </span>
                  <span className="text-gray-600">
                    Owned: <span className="font-medium">{getOwnedStockQuantity(stock.id).toFixed(2)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2 text-lg flex items-center">
            {selectedStock.name} ({selectedStock.symbol})
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              priceChangePercent > 0 
                ? 'bg-accessible-green/10 text-accessible-green' 
                : priceChangePercent < 0 
                  ? 'bg-accessible-red/10 text-accessible-red' 
                  : 'bg-gray-100'
            }`}>
              {priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
            </span>
          </h3>
          <div className="h-40 mb-3 border p-1 rounded-md bg-white">
            <StockChart 
              stockId={selectedStock.id}
              currentPrice={stockPrices[selectedStock.id] || selectedStock.basePrice}
              basePrice={selectedStock.basePrice}
              volatility={selectedStock.volatility}
            />
          </div>
          <p className="text-sm mb-3 bg-gray-50 p-2 rounded">{selectedStock.description}</p>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500">Current Price</p>
              <p className="font-semibold">${(stockPrices[selectedStock.id] || selectedStock.basePrice).toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500">Owned Value</p>
              <p className="font-semibold">{formatCurrency(getOwnedStockValue(selectedStock.id))}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Context-sensitive tips */}
      {isPotentialBuy && (
        <div className="mb-4 p-3 bg-accessible-green/10 rounded-md border border-accessible-green animate-slide-in-left">
          <p className="text-sm flex items-center font-medium text-accessible-green">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Tip: This stock is currently undervalued in a bull market - might be a good buying opportunity!
          </p>
        </div>
      )}
      
      {isPotentialSell && (
        <div className="mb-4 p-3 bg-accessible-red/10 rounded-md border border-accessible-red animate-slide-in-left">
          <p className="text-sm flex items-center font-medium text-accessible-red">
            <TrendingDown className="h-4 w-4 mr-2" />
            Market Tip: Stock price is high during a bear market - consider selling while the price is favorable!
          </p>
        </div>
      )}
      
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 text-lg">Make Investment</h3>
        <div className="mb-4 bg-gray-50 p-3 rounded-md">
          <label className="block text-sm font-medium mb-2" id="investment-amount-label">
            Investment Amount: <span className="font-semibold">{formatCurrency(investmentAmount)}</span>
          </label>
          <div className="flex items-center gap-3">
            <Slider
              value={[investmentAmount]}
              max={Math.min(100000, wealth)}
              step={100}
              onValueChange={(vals) => setInvestmentAmount(vals[0])}
              aria-labelledby="investment-amount-label"
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setInvestmentAmount(wealth)}
              className="px-4"
              aria-label={`Set maximum investment amount of ${formatCurrency(wealth)}`}
            >
              Max
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your available funds: {formatCurrency(wealth)}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleBuy}
            disabled={investmentAmount <= 0 || investmentAmount > wealth}
            className="flex-1 py-3 text-base font-medium"
            aria-label={`Buy shares of ${selectedStock.name} for ${formatCurrency(investmentAmount)}`}
          >
            <span className="flex items-center">
              Buy Shares
              <TrendingUp className="ml-2 h-4 w-4" />
            </span>
          </Button>
          <Button 
            onClick={handleSell}
            disabled={getOwnedStockQuantity(selectedStock.id) <= 0}
            variant="outline"
            className="flex-1 py-3 text-base font-medium"
            aria-label={`Sell all ${getOwnedStockQuantity(selectedStock.id).toFixed(2)} shares of ${selectedStock.name}`}
          >
            <span className="flex items-center">
              Sell All Shares
              <TrendingDown className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </div>
        
        {isVolatilityWarning && (
          <div className="mt-3 flex items-start gap-2 bg-accessible-orange/10 text-accessible-orange p-3 rounded-md">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{selectedStock.volatility === 'extreme' ? 'Extreme' : 'High'} Volatility Warning</p>
              <p className="text-sm mt-1">
                This stock has {
                  selectedStock.volatility === 'extreme' ? 'extremely unpredictable' : 
                  selectedStock.volatility === 'very_high' ? 'extremely high' : 'high'
                } volatility. While potential returns may be significant, there's also a greater risk of substantial losses.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Investments;
