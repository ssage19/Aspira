import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../lib/stores/useCharacter';
import { useTime } from '../lib/stores/useTime';
import { useEconomy } from '../lib/stores/useEconomy';
import { useAudio } from '../lib/stores/useAudio';
import { 
  DollarSign, 
  TrendingUp, 
  ChartBar, 
  Calendar, 
  Home,
  Briefcase,
  HeartPulse,
  Crown,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import GameUI from '../components/GameUI';
import MainScene from '../components/MainScene';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { name, wealth, netWorth, happiness, prestige, assets, properties, lifestyleItems } = useCharacter();
  const { currentDay, currentMonth, currentYear } = useTime();
  const { 
    marketTrend, 
    economyState, 
    stockMarketHealth, 
    realEstateMarketHealth,
    inflation,
    interestRate
  } = useEconomy();
  const { backgroundMusic, isMuted } = useAudio();
  
  // Start background music when dashboard loads
  useEffect(() => {
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(err => {
        console.log("Audio autoplay was prevented:", err);
      });
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [backgroundMusic, isMuted]);
  
  // Calculate portfolio stats
  const stocksValue = assets
    .filter(asset => asset.type === 'stock')
    .reduce((sum, asset) => sum + (asset.purchasePrice * asset.quantity), 0);
  
  const propertiesValue = properties.reduce((sum, property) => sum + property.value, 0);
  
  const lifestyleValue = lifestyleItems.reduce((sum, item) => sum + item.purchasePrice * 0.5, 0);
  
  // Format the date
  const formattedDate = new Date(currentYear, currentMonth - 1, currentDay)
    .toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  
  return (
    <div className="w-full min-h-screen bg-gray-100 pt-20 pb-32">
      {/* 3D Scene - Fixed Position */}
      <div className="fixed inset-0 z-0">
        <MainScene />
      </div>
      
      {/* Dashboard UI */}
      <div className="relative z-10">
        <GameUI />
        
        {/* Central Dashboard - scrollable */}
        <div className="relative w-full max-w-4xl mx-auto p-4">
          <Card className="bg-white bg-opacity-90 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                Welcome, {name}
              </CardTitle>
              <CardDescription>
                {formattedDate} | {economyState.charAt(0).toUpperCase() + economyState.slice(1)} Economy
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Wealth Overview */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="h-5 w-5 mr-1 text-green-500" />
                      Wealth Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Cash:</span>
                        <span className="font-semibold">{formatCurrency(wealth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Worth:</span>
                        <span className="font-semibold">{formatCurrency(netWorth)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Portfolio Growth:</span>
                        <span className={netWorth > wealth ? "text-green-600" : "text-red-600"}>
                          {((netWorth / Math.max(wealth, 1) - 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Status Overview */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg flex items-center">
                      <Crown className="h-5 w-5 mr-1 text-amber-500" />
                      Status Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm flex items-center">
                            <HeartPulse className="h-4 w-4 mr-1 text-pink-500" />
                            Happiness
                          </span>
                          <span className="text-sm font-medium">{happiness}%</span>
                        </div>
                        <Progress value={happiness} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm flex items-center">
                            <Crown className="h-4 w-4 mr-1 text-amber-500" />
                            Prestige
                          </span>
                          <span className="text-sm font-medium">{prestige} points</span>
                        </div>
                        <Progress value={Math.min(prestige, 100)} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Portfolio Breakdown */}
              <Card className="mb-6">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex items-center">
                    <Briefcase className="h-5 w-5 mr-1 text-blue-500" />
                    Portfolio Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto text-green-500" />
                      <p className="text-sm text-gray-500">Cash</p>
                      <p className="font-semibold">{formatCurrency(wealth)}</p>
                      <p className="text-xs">{((wealth / netWorth) * 100).toFixed(1)}% of total</p>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <ChartBar className="h-6 w-6 mx-auto text-blue-500" />
                      <p className="text-sm text-gray-500">Stocks</p>
                      <p className="font-semibold">{formatCurrency(stocksValue)}</p>
                      <p className="text-xs">{((stocksValue / netWorth) * 100).toFixed(1)}% of total</p>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Home className="h-6 w-6 mx-auto text-purple-500" />
                      <p className="text-sm text-gray-500">Properties</p>
                      <p className="font-semibold">{formatCurrency(propertiesValue)}</p>
                      <p className="text-xs">{((propertiesValue / netWorth) * 100).toFixed(1)}% of total</p>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Crown className="h-6 w-6 mx-auto text-amber-500" />
                      <p className="text-sm text-gray-500">Lifestyle</p>
                      <p className="font-semibold">{formatCurrency(lifestyleValue)}</p>
                      <p className="text-xs">{((lifestyleValue / netWorth) * 100).toFixed(1)}% of total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Market Indicators */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-1 text-blue-500" />
                    Market Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Stock Market</p>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium flex items-center">
                          {marketTrend === 'bull' ? (
                            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                          ) : marketTrend === 'bear' ? (
                            <TrendingUp className="h-4 w-4 mr-1 text-red-500 transform rotate-180" />
                          ) : (
                            <span className="h-4 w-4 mr-1" />
                          )}
                          {marketTrend.charAt(0).toUpperCase() + marketTrend.slice(1)}
                        </span>
                        <span className="text-sm">{stockMarketHealth}%</span>
                      </div>
                      <Progress value={stockMarketHealth} className="h-2" />
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Real Estate Market</p>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Health</span>
                        <span className="text-sm">{realEstateMarketHealth}%</span>
                      </div>
                      <Progress value={realEstateMarketHealth} className="h-2" />
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Inflation Rate</p>
                      <p className="font-medium">{inflation.toFixed(1)}%</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Interest Rate</p>
                      <p className="font-medium">{interestRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => navigate('/investments')}
                className="flex items-center"
              >
                <ChartBar className="h-4 w-4 mr-2" />
                Investments
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/properties')}
                className="flex items-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Properties
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/lifestyle')}
                className="flex items-center"
              >
                <Crown className="h-4 w-4 mr-2" />
                Lifestyle
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
