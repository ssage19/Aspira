import { useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import { useAudio } from '../lib/stores/useAudio';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { 
  Home, 
  Building2, 
  Warehouse, 
  Castle,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Check 
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { 
  residentialProperties, 
  luxuryProperties, 
  commercialProperties, 
  industrialProperties,
  calculateMortgage
} from '../lib/data/properties';

export function Properties() {
  const { wealth, addWealth, addProperty, sellProperty, properties: ownedProperties } = useCharacter();
  const { interestRate, realEstateMarketHealth } = useEconomy();
  const { currentDay, currentMonth, currentYear } = useTime();
  const { playSuccess, playHit } = useAudio();
  
  const [activeTab, setActiveTab] = useState('residential');
  const [selectedProperty, setSelectedProperty] = useState(residentialProperties[0]);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  
  // Adjust property values based on market health
  const getAdjustedPrice = (basePrice: number) => {
    const marketFactor = realEstateMarketHealth / 65; // Normalize around 65% as baseline
    return Math.round(basePrice * marketFactor);
  };
  
  // Get properties for the active tab
  const getPropertiesForTab = () => {
    switch(activeTab) {
      case 'residential':
        return residentialProperties;
      case 'mansion':
        return luxuryProperties;
      case 'commercial':
        return commercialProperties;
      case 'industrial':
        return industrialProperties;
      default:
        return residentialProperties;
    }
  };
  
  // Check if user already owns this property
  const isPropertyOwned = (id: string) => {
    return ownedProperties.some(property => property.id === id);
  };
  
  // Handle property purchase
  const handlePurchase = () => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const downPayment = adjustedPrice * (downPaymentPercent / 100);
    
    if (wealth < downPayment) {
      toast.error("You don't have enough funds for the down payment");
      playHit();
      return;
    }
    
    // Process purchase
    addWealth(-downPayment);
    
    // Add property to owned properties
    addProperty({
      id: selectedProperty.id,
      name: selectedProperty.name,
      type: selectedProperty.type,
      value: adjustedPrice,
      purchasePrice: adjustedPrice, // Adding purchasePrice which is expected in useCharacter
      income: selectedProperty.income,
      expenses: selectedProperty.expenses,
      purchaseDate: `${currentMonth}/${currentDay}/${currentYear}`,
      currentValue: adjustedPrice // Adding currentValue which is used in sellProperty
    });
    
    playSuccess();
    toast.success(`Purchased ${selectedProperty.name}`);
  };
  
  // Handle property sale
  const handleSell = (propertyId: string) => {
    const property = ownedProperties.find(p => p.id === propertyId);
    if (!property) return;
    
    // Calculate current value (could be more or less than purchase price)
    const marketFactor = realEstateMarketHealth / 65;
    const sellingValue = Math.round(property.value * marketFactor);
    
    // Update the property's currentValue to match what we're selling it for
    // This ensures the useCharacter store has the correct value
    if (property.currentValue === undefined) {
      property.currentValue = sellingValue;
    } else {
      property.currentValue = sellingValue;
    }
    
    // Process sale - sellProperty will use the currentValue from the property
    sellProperty(propertyId);
    // Don't add wealth here, as sellProperty already updates wealth
    // Instead of: addWealth(sellingValue);
    
    playSuccess();
    toast.success(`Sold ${property.name} for ${formatCurrency(sellingValue)}`);
  };
  
  // Calculate monthly payment for a mortgage
  const calculateMonthlyPayment = () => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const result = calculateMortgage(
      adjustedPrice, 
      downPaymentPercent, 
      interestRate, 
      30 // 30-year fixed mortgage
    );
    
    return result;
  };
  
  // Calculate ROI (Return on Investment)
  const calculateROI = () => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const downPayment = adjustedPrice * (downPaymentPercent / 100);
    const annualIncome = selectedProperty.income * 12;
    const annualExpenses = selectedProperty.expenses * 12;
    const mortgage = calculateMonthlyPayment().monthlyPayment * 12;
    
    const netIncome = annualIncome - annualExpenses - mortgage;
    const roi = (netIncome / downPayment) * 100;
    
    return roi.toFixed(1);
  };
  
  // Calculate cap rate (capitalization rate)
  const calculateCapRate = () => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const annualIncome = selectedProperty.income * 12;
    const annualExpenses = selectedProperty.expenses * 12;
    
    const netOperatingIncome = annualIncome - annualExpenses;
    const capRate = (netOperatingIncome / adjustedPrice) * 100;
    
    return capRate.toFixed(1);
  };
  
  const mortgageDetails = calculateMonthlyPayment();
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Home className="mr-2" />
        Real Estate Portfolio
      </h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Market Health: {realEstateMarketHealth}%</p>
        <p className="text-sm text-gray-500">Current Mortgage Rate: {interestRate.toFixed(1)}%</p>
      </div>
      
      <Tabs defaultValue="residential" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="residential">
            <Home className="h-4 w-4 mr-2" />
            Residential
          </TabsTrigger>
          <TabsTrigger value="mansion">
            <Castle className="h-4 w-4 mr-2" />
            Luxury
          </TabsTrigger>
          <TabsTrigger value="commercial">
            <Building2 className="h-4 w-4 mr-2" />
            Commercial
          </TabsTrigger>
          <TabsTrigger value="industrial">
            <Warehouse className="h-4 w-4 mr-2" />
            Industrial
          </TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold mb-2">Available Properties</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getPropertiesForTab().map(property => (
                <div 
                  key={property.id}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    selectedProperty.id === property.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{property.name}</span>
                    <span className="font-semibold">{formatCurrency(getAdjustedPrice(property.price))}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{property.location}</span>
                    <span>
                      {property.squareFeet} sq ft
                      {property.bedrooms ? ` • ${property.bedrooms} bd, ${property.bathrooms} ba` : ''}
                    </span>
                  </div>
                  {isPropertyOwned(property.id) && (
                    <div className="mt-1 flex items-center text-xs text-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Owned
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Property Details</h3>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{selectedProperty.name}</CardTitle>
                <CardDescription>{selectedProperty.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pb-2">
                <p className="text-sm">{selectedProperty.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Purchase Price</p>
                    <p className="font-semibold">{formatCurrency(getAdjustedPrice(selectedProperty.price))}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Size</p>
                    <p className="font-semibold">{selectedProperty.squareFeet} sq ft</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monthly Income</p>
                    <p className="font-semibold text-green-600">+{formatCurrency(selectedProperty.income)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monthly Expenses</p>
                    <p className="font-semibold text-red-600">-{formatCurrency(selectedProperty.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cap Rate</p>
                    <p className="font-semibold">{calculateCapRate()}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Est. Annual Appreciation</p>
                    <p className="font-semibold">{(selectedProperty.appreciationRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2">Financing Options</h4>
              <Card>
                <CardContent className="pt-4">
                  <label className="block text-sm mb-1">
                    Down Payment: {downPaymentPercent}% (
                    {formatCurrency(getAdjustedPrice(selectedProperty.price) * (downPaymentPercent / 100))})
                  </label>
                  <Slider
                    value={[downPaymentPercent]}
                    min={5}
                    max={100}
                    step={5}
                    onValueChange={(vals) => setDownPaymentPercent(vals[0])}
                    className="mb-4"
                  />
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Loan Amount</p>
                      <p className="font-semibold">
                        {formatCurrency(mortgageDetails.loanAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Interest Rate</p>
                      <p className="font-semibold">{interestRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monthly Payment</p>
                      <p className="font-semibold">
                        {formatCurrency(mortgageDetails.monthlyPayment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cash ROI</p>
                      <p className={`font-semibold ${
                        parseFloat(calculateROI()) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {calculateROI()}%
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    onClick={handlePurchase}
                    disabled={
                      isPropertyOwned(selectedProperty.id) || 
                      wealth < getAdjustedPrice(selectedProperty.price) * (downPaymentPercent / 100)
                    }
                    className="w-full"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {isPropertyOwned(selectedProperty.id) ? 'Already Owned' : 'Purchase Property'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Your Property Portfolio</h3>
          {ownedProperties.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">You don't own any properties yet. Start building your real estate empire!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ownedProperties.map(property => (
                <Card key={property.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <CardDescription>Purchased: {property.purchaseDate}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Value:</span>
                        <span className="font-semibold">{formatCurrency(property.value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Income:</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(property.income)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Expenses:</span>
                        <span className="font-semibold text-red-600">-{formatCurrency(property.expenses)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Monthly:</span>
                        <span className={`font-semibold ${
                          property.income - property.expenses > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(property.income - property.expenses)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSell(property.id)}
                      className="w-full"
                    >
                      Sell Property
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

export default Properties;
