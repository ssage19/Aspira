import { useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
import { useAudio } from '../lib/stores/useAudio';
import { useResponsive } from '../lib/hooks/useResponsive';
import { useNavigate } from 'react-router-dom';
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
  Check,
  ChevronLeft,
  ChevronDown,
  Menu
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { formatCurrency } from '../lib/utils';
import { 
  residentialProperties, 
  luxuryProperties, 
  commercialProperties, 
  industrialProperties,
  calculateMortgage
} from '../lib/data/properties';
import { PropertyType } from '../lib/types/PropertyTypes';

export function Properties() {
  const { wealth, addWealth, addProperty, sellProperty, properties: ownedProperties } = useCharacter();
  const { interestRate, realEstateMarketHealth } = useEconomy();
  const { currentDay, currentMonth, currentYear } = useTime();
  const { playSuccess, playHit } = useAudio();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  const [activeTab, setActiveTab] = useState('residential');
  const [selectedProperty, setSelectedProperty] = useState<PropertyType>(residentialProperties[0]);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  
  // Adjust property values based on market health
  const getAdjustedPrice = (basePrice: number) => {
    // Use 65 as the baseline market health (represent a neutral market)
    // Market factor should be 1.0 at 65% health, higher above, lower below
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
    
    // For a full purchase, the down payment is the full price
    // For a mortgage, it's just the down payment percentage
    const downPaymentAmount = downPaymentPercent === 100 
      ? adjustedPrice 
      : adjustedPrice * (downPaymentPercent / 100);
    
    if (wealth < downPaymentAmount) {
      toast.error("You don't have enough funds for the down payment");
      playHit();
      return;
    }
    
    // Display a warning for low down payments - these are riskier
    if (downPaymentPercent < 20) {
      toast.warning(
        `Low down payment (${downPaymentPercent}%) means higher monthly payments and more interest paid over time`, 
        { duration: 5000 }
      );
    }
    
    // Store property count before adding
    const propertiesCountBefore = ownedProperties.length;
    
    // Calculate loan details based on down payment percentage
    // We already calculated downPaymentAmount above, so just use it
    const loanAmount = adjustedPrice - downPaymentAmount;
    
    // Calculate the monthly payment using the formula: P = L[i(1 + i)^n]/[(1 + i)^n - 1]
    const interestRateDecimal = interestRate / 100;
    const monthlyInterestRate = interestRateDecimal / 12;
    const loanTermMonths = 30 * 12; // 30-year fixed mortgage
    
    const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths);
    const denominator = Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1;
    const monthlyPayment = loanAmount * (numerator / denominator);
    
    // Format the purchase date properly (YYYY-MM-DD format)
    // This ensures proper date comparison when calculating months owned
    const formattedDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    
    // Add property to owned properties with mortgage details
    addProperty({
      id: selectedProperty.id,
      name: selectedProperty.name,
      type: selectedProperty.type as "residential" | "commercial" | "industrial" | "mansion", // Cast to valid type
      value: adjustedPrice, // Current value for display
      purchasePrice: adjustedPrice, // Full purchase price
      downPayment: downPaymentAmount, // Amount paid upfront
      loanAmount: loanAmount, // Remaining loan balance
      loanTerm: 30, // 30-year fixed
      interestRate: interestRate, // Current mortgage rate
      monthlyPayment: monthlyPayment, // Monthly mortgage payment
      income: selectedProperty.income,
      expenses: selectedProperty.expenses,
      purchaseDate: formattedDate,
      currentValue: adjustedPrice, // For future value calculations and selling
      location: selectedProperty.location,
      appreciationRate: selectedProperty.appreciationRate,
      squareFeet: selectedProperty.squareFeet,
      ...(('bedrooms' in selectedProperty) ? { 
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms 
      } : {}),
      description: selectedProperty.description,
      ...('roi' in selectedProperty ? { roi: selectedProperty.roi } : {}),
      ...('prestige' in selectedProperty ? { prestige: selectedProperty.prestige } : {})
    });
    
    // Check if the property was successfully added by checking if the property count increased
    if (useCharacter.getState().properties.length > propertiesCountBefore) {
      playSuccess();
      toast.success(`Purchased ${selectedProperty.name} for ${formatCurrency(adjustedPrice)}`);
      
      // Display finance details
      if (downPaymentPercent < 100) {
        toast(`Down payment: ${formatCurrency(downPaymentAmount)}, Loan: ${formatCurrency(loanAmount)}, Monthly payment: ${formatCurrency(monthlyPayment)}`, {
          duration: 5000
        });
      }
    } else {
      // The purchase failed (likely due to insufficient funds check in addProperty)
      playHit();
    }
  };
  
  // Handle property sale
  const handleSell = (propertyId: string) => {
    const property = ownedProperties.find(p => p.id === propertyId);
    if (!property) return;
    
    // Log original property values for debugging
    console.log(`Starting sale process for ${property.name}`);
    console.log(`Original purchase price: ${property.purchasePrice}, Current value: ${property.currentValue}`);
    console.log(`Purchase date: ${property.purchaseDate}`);
    
    // Calculate current market value based on market health
    const marketFactor = realEstateMarketHealth / 65;
    
    // Use currentValue if available, or fallback to value and finally purchasePrice
    const propertyValue = property.currentValue || (property.value ?? property.purchasePrice);
    const currentMarketValue = Math.round(propertyValue * marketFactor);
    
    // Update the property's currentValue to reflect current market conditions
    property.currentValue = currentMarketValue;
    
    // Calculate the time since purchase to check for quick-flip penalties
    const purchaseDate = new Date(property.purchaseDate);
    const currentDate = new Date();
    
    // Calculate months between dates - a proper calculation accounting for actual months
    let monthsSincePurchase = 
      (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
      (currentDate.getMonth() - purchaseDate.getMonth());
    
    // Ensure months is never negative (can happen if system clock is off)
    monthsSincePurchase = Math.max(0, monthsSincePurchase);
    
    console.log(`Months since purchase: ${monthsSincePurchase}`);
    
    // Calculate remaining loan amount
    const outstandingLoan = property.loanAmount || 0;
    
    // Calculate initial investment (down payment)
    const originalPurchasePrice = property.purchasePrice;
    const downPayment = originalPurchasePrice - outstandingLoan;
    
    // Show appropriate warning based on how long the property has been owned
    if (monthsSincePurchase < 1) {
      // Very quick flip - severe penalties will apply
      toast.warning(
        `Warning: Selling after less than 1 month will result in significant financial loss due to penalties and transaction costs.`, 
        { duration: 5000 }
      );
      
      // Show specific breakdown of penalties
      toast.warning(
        `You will incur: 15% reduction in property value, 50% increased closing costs, and additional transaction fees.`, 
        { duration: 5000 }
      );
      
      // Confirm with clear warning about financial impact
      if (!confirm(`Are you sure you want to sell ${property.name}? This is a very quick flip (less than 1 month) and WILL result in financial loss compared to your initial investment.`)) {
        return; // User canceled the sale
      }
    } else if (monthsSincePurchase < 6) {
      // Moderately quick flip - moderate penalties will apply
      const displayMonths = Math.max(0, monthsSincePurchase);
      toast.warning(
        `Warning: Selling after only ${displayMonths} months will result in reduced profits due to penalties and transaction costs.`, 
        { duration: 5000 }
      );
      
      // Show specific breakdown of penalties
      toast.warning(
        `You will incur: 8% reduction in property value, 25% increased closing costs, and additional transaction fees.`, 
        { duration: 5000 }
      );
      
      // Confirm with clear warning about financial impact
      if (!confirm(`Are you sure you want to sell ${property.name}? This is a quick flip (${displayMonths} months) and may result in reduced profits or even loss due to transaction costs.`)) {
        return; // User canceled the sale
      }
    } else {
      // Normal sale, just confirm
      if (!confirm(`Are you sure you want to sell ${property.name}?`)) {
        return; // User canceled the sale
      }
    }
    
    // Process sale (quick-flip penalties and calculations are handled inside sellProperty)
    const actualSaleProceeds = sellProperty(propertyId);
    
    // The detailed breakdown and toast messages are now handled in the useCharacter.sellProperty function
    // We don't need to show any additional messages here to avoid duplicate/conflicting information
    
    playSuccess();
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
    <div className={`p-4 ${isMobile ? 'pt-20' : ''} bg-background rounded-lg shadow-lg border border-border`}>
      {/* Header with mobile navigation */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold flex items-center">
            <Home className="mr-2" />
            Real Estate Portfolio
          </h2>
        </div>
        
        {isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/')}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/investments')}>
                Investments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/lifestyle')}>
                Lifestyle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/social')}>
                Social
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/career')}>
                Career
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Market Health: {realEstateMarketHealth}%</p>
        <p className="text-sm text-gray-500">Current Mortgage Rate: {interestRate.toFixed(1)}%</p>
      </div>
      
      <Tabs value={activeTab} defaultValue="residential" onValueChange={setActiveTab}>
        {isMobile ? (
          <div className="mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center justify-between border border-input bg-background rounded-md px-3 py-2 text-sm font-medium">
                {activeTab === 'residential' && <><Home className="h-4 w-4 mr-2" /> Residential</>}
                {activeTab === 'mansion' && <><Castle className="h-4 w-4 mr-2" /> Luxury</>}
                {activeTab === 'commercial' && <><Building2 className="h-4 w-4 mr-2" /> Commercial</>}
                {activeTab === 'industrial' && <><Warehouse className="h-4 w-4 mr-2" /> Industrial</>}
                <ChevronDown className="h-4 w-4 ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                <DropdownMenuItem 
                  onClick={() => {
                    console.log("Selecting residential tab");
                    setActiveTab('residential');
                  }} 
                  className="cursor-pointer"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Residential
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    console.log("Selecting luxury tab");
                    setActiveTab('mansion');
                  }} 
                  className="cursor-pointer"
                >
                  <Castle className="h-4 w-4 mr-2" />
                  Luxury
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    console.log("Selecting commercial tab");
                    setActiveTab('commercial');
                  }} 
                  className="cursor-pointer"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Commercial
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    console.log("Selecting industrial tab");
                    setActiveTab('industrial');
                  }} 
                  className="cursor-pointer"
                >
                  <Warehouse className="h-4 w-4 mr-2" />
                  Industrial
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
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
        )}
        
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
                      {'bedrooms' in property && property.bedrooms ? ` • ${property.bedrooms} bd, ${property.bathrooms} ba` : ''}
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
                        <span className="font-semibold">{formatCurrency(property.currentValue || property.purchasePrice)}</span>
                      </div>
                      
                      {/* Mortgage Information */}
                      {property.loanAmount > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>Mortgage Balance:</span>
                            <span className="font-semibold text-red-600">{formatCurrency(property.loanAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Equity:</span>
                            <span className="font-semibold">{formatCurrency(property.currentValue - property.loanAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Payment:</span>
                            <span className="font-semibold text-red-600">-{formatCurrency(property.monthlyPayment)}</span>
                          </div>
                        </>
                      )}
                      
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
                          property.income - property.expenses - (property.monthlyPayment || 0) > 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(property.income - property.expenses - (property.monthlyPayment || 0))}
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
