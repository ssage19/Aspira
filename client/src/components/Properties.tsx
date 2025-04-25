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
  const [portfolioView, setPortfolioView] = useState('all');
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  const [selectedProperty, setSelectedProperty] = useState(residentialProperties[0]);

  // Calculate adjusted property price based on market conditions
  const getAdjustedPrice = (basePrice: number) => {
    // Market factor ranges from 0.8 to 1.2 based on economic conditions
    const marketFactor = 0.8 + (realEstateMarketHealth / 100) * 0.4;
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
    const downPayment = (downPaymentPercent / 100) * adjustedPrice;
    const loanAmount = adjustedPrice - downPayment;
    
    if (isPropertyOwned(selectedProperty.id)) {
      toast.error("You already own this property");
      return;
    }
    
    if (wealth < downPayment) {
      toast.error("Insufficient funds for down payment");
      return;
    }
    
    // Display a warning for low down payments - these are riskier
    if (downPaymentPercent < 20) {
      toast.warning(
        <div className="flex flex-col">
          <div className="flex items-center font-semibold">
            <AlertCircle className="h-4 w-4 mr-2" />
            Low Down Payment Warning
          </div>
          <p className="text-sm mt-1">
            Down payments below 20% typically result in higher interest rates and may be riskier.
          </p>
        </div>,
        { duration: 4000 }
      );
    }
    
    // Calculate mortgage details
    const monthlyPayment = loanAmount > 0 ? mortgageDetails.monthlyPayment : 0;
    
    // Create new property object compatible with the Property interface in useCharacter
    const newProperty = {
      id: selectedProperty.id,
      name: selectedProperty.name,
      type: activeTab as 'residential' | 'commercial' | 'industrial' | 'mansion',
      location: selectedProperty.location,
      description: selectedProperty.description,
      purchaseDate: `${currentMonth}/${currentDay}/${currentYear}`,
      // Required fields for Property interface
      purchasePrice: adjustedPrice,
      currentValue: adjustedPrice,
      downPayment: downPayment,
      loanAmount: loanAmount,
      loanTerm: 30, // Default to 30 years
      interestRate: interestRate,
      monthlyPayment: monthlyPayment,
      income: selectedProperty.income,
      expenses: selectedProperty.expenses,
      appreciationRate: selectedProperty.appreciationRate,
      squareFeet: selectedProperty.squareFeet,
      // Optional fields that exist in PropertyType
      ...(activeTab === 'residential' && 'bedrooms' in selectedProperty) && {
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms
      },
      ...(activeTab === 'commercial' && 'roi' in selectedProperty) && {
        roi: selectedProperty.roi
      }
    };
    
    // For debugging
    console.log("Creating new property:", newProperty);
    
    // Process purchase
    addWealth(-downPayment);
    
    // Explicitly convert to Property interface type that useCharacter expects
    addProperty(newProperty);
    playSuccess();
    
    toast.success(
      <div className="flex flex-col">
        <div className="flex items-center font-semibold">
          Property Purchased!
        </div>
        <p className="text-sm mt-1">
          You have successfully purchased {selectedProperty.name}.
        </p>
      </div>,
      { duration: 3000 }
    );
  };
  
  // Handle selling a property
  const handleSell = (propertyId: string) => {
    const property = ownedProperties.find(p => p.id === propertyId);
    if (!property) return;
    
    // Log original property values for debugging
    console.log(`Starting sale process for ${property.name}`);
    console.log(`Original purchase price: ${property.purchasePrice}, Current value: ${property.currentValue}`);
    console.log(`Purchase date: ${property.purchaseDate}`);
    
    // Calculate how long the property has been owned
    const purchaseDateParts = property.purchaseDate.split('/');
    const purchaseMonth = parseInt(purchaseDateParts[0]);
    const purchaseDay = parseInt(purchaseDateParts[1]);
    const purchaseYear = parseInt(purchaseDateParts[2]);
    
    // Calculate months since purchase (this is rough, but sufficient for gameplay)
    const currentDateValue = currentYear * 12 + currentMonth;
    const purchaseDateValue = purchaseYear * 12 + purchaseMonth;
    const monthsSincePurchase = currentDateValue - purchaseDateValue;
    
    // Different selling scenarios based on how long property has been owned
    if (monthsSincePurchase < 1) {
      // Very quick flip - significant penalties will apply
      toast.warning(
        <div className="flex flex-col">
          <div className="flex items-center font-semibold">
            <AlertCircle className="h-4 w-4 mr-2" />
            Quick-Flip Warning
          </div>
          <p className="text-sm mt-1">
            You've only owned this property for less than a month. Selling now will result in significant losses due to transaction costs and market penalties.
          </p>
        </div>,
        { duration: 5000 }
      );
      
      if (!confirm(`Are you sure you want to sell ${property.name} so quickly? You will take a significant loss on this transaction.`)) {
        return; // User canceled the sale
      }
    } else if (monthsSincePurchase < 6) {
      // Moderately quick flip - moderate penalties will apply
      const displayMonths = Math.max(0, monthsSincePurchase);
      toast.warning(
        <div className="flex flex-col">
          <div className="flex items-center font-semibold">
            <AlertCircle className="h-4 w-4 mr-2" />
            Early Sale Warning
          </div>
          <p className="text-sm mt-1">
            You've only owned this property for {displayMonths} {displayMonths === 1 ? 'month' : 'months'}. Selling now may result in some losses due to transaction costs.
          </p>
        </div>,
        { duration: 4000 }
      );
      
      if (!confirm(`Are you sure you want to sell ${property.name} after only ${displayMonths} ${displayMonths === 1 ? 'month' : 'months'}? You may take a moderate loss on this transaction.`)) {
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
    playHit();
    
    toast.success(
      <div className="flex flex-col">
        <div className="flex items-center font-semibold">
          Property Sold!
        </div>
        <p className="text-sm mt-1">
          You have sold {property.name} for {formatCurrency(actualSaleProceeds)}.
        </p>
      </div>,
      { duration: 3000 }
    );
  };
  
  // Calculate monthly mortgage payment
  const calculateMonthlyPayment = () => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const downPayment = (downPaymentPercent / 100) * adjustedPrice;
    
    // Fixed the function call to match the expected parameters
    const result = calculateMortgage(adjustedPrice, downPaymentPercent, interestRate, 30);
    return result;
  };
  
  // Calculate ROI (Return on Investment)
  const calculateROI = () => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const downPayment = (downPaymentPercent / 100) * adjustedPrice;
    const annualIncome = selectedProperty.income * 12;
    const annualExpenses = selectedProperty.expenses * 12;
    const annualMortgage = mortgageDetails.monthlyPayment * 12;
    
    const annualCashFlow = annualIncome - annualExpenses - annualMortgage;
    const roi = (annualCashFlow / downPayment) * 100;
    
    return roi.toFixed(1);
  };
  
  // Calculate cap rate (capitalization rate)
  const calculateCapRate = () => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const annualIncome = selectedProperty.income * 12;
    const annualExpenses = selectedProperty.expenses * 12;
    
    const annualNetOperatingIncome = annualIncome - annualExpenses;
    const capRate = (annualNetOperatingIncome / adjustedPrice) * 100;
    
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
              className="mr-2"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold">Real Estate</h2>
        </div>
        <div className="text-xl font-semibold text-green-600">{formatCurrency(wealth)}</div>
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
                {activeTab === 'portfolio' && <><TrendingUp className="h-4 w-4 mr-2" /> Portfolio</>}
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
                <DropdownMenuItem 
                  onClick={() => {
                    console.log("Selecting portfolio tab");
                    setActiveTab('portfolio');
                  }} 
                  className="cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Portfolio
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
            <TabsTrigger value="portfolio">
              <TrendingUp className="h-4 w-4 mr-2" />
              Portfolio
            </TabsTrigger>
          </TabsList>
        )}
        
        {/* Residential Properties Tab */}
        <TabsContent value="residential">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Available Properties</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getPropertiesForTab().map(property => (
                  <div 
                    key={property.id}
                    className={`p-2 border rounded cursor-pointer transition-all duration-200 ${
                      selectedProperty.id === property.id ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' : 'hover:bg-muted hover:border-border'
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
                  
                  {/* Display images for residential properties */}
                  {selectedProperty.id === 'single_family' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/single_family_home.jpg" 
                        alt="Single Family Home" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'apartment_basic' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/city_apartment.jpg" 
                        alt="City Apartment" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'apartment_luxury' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/luxury_city_apartment.jpg" 
                        alt="Luxury City Apartment" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'townhouse' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/suburban_townhome.jpg" 
                        alt="Suburban Townhouse" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'studio_apartment' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/urban_studio.jpg" 
                        alt="Urban Studio" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'urban_loft' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/converted_loft.jpg" 
                        alt="Converted Loft" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'garden_apartment' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/garden_apartment.jpg" 
                        alt="Garden Apartment" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'highrise_1br' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/highrise_one_bedroom.jpg" 
                        alt="Highrise 1-Bedroom" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'suburban_condo' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/suburban_condo.jpg" 
                        alt="Suburban Condo" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'duplex' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/residential_duplex.jpg" 
                        alt="Residential Duplex" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'garden_condo' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/garden_district_condo.jpg" 
                        alt="Garden District Condo" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'modern_townhome' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/modern_townhome.jpg" 
                        alt="Modern Townhome" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'colonial_home' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/colonial_style_home.jpg" 
                        alt="Colonial Style Home" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'vacation_cottage' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/weekend_cottage.jpg" 
                        alt="Weekend Cottage" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {selectedProperty.id === 'ranch_style' && (
                    <div className="mb-3">
                      <img 
                        src="/images/properties/ranch_style_home.jpg" 
                        alt="Ranch Style Home" 
                        className="rounded-md w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
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
        </TabsContent>
        
        {/* Luxury Properties Tab */}
        <TabsContent value="mansion">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Available Properties</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getPropertiesForTab().map(property => (
                  <div 
                    key={property.id}
                    className={`p-2 border rounded cursor-pointer transition-all duration-200 ${
                      selectedProperty.id === property.id ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' : 'hover:bg-muted hover:border-border'
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
        </TabsContent>
        
        {/* Commercial Properties Tab */}
        <TabsContent value="commercial">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Available Properties</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getPropertiesForTab().map(property => (
                  <div 
                    key={property.id}
                    className={`p-2 border rounded cursor-pointer transition-all duration-200 ${
                      selectedProperty.id === property.id ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' : 'hover:bg-muted hover:border-border'
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
        </TabsContent>
        
        {/* Industrial Properties Tab */}
        <TabsContent value="industrial">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Available Properties</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getPropertiesForTab().map(property => (
                  <div 
                    key={property.id}
                    className={`p-2 border rounded cursor-pointer transition-all duration-200 ${
                      selectedProperty.id === property.id ? 'bg-primary/10 border-primary shadow-sm dark:bg-primary/20' : 'hover:bg-muted hover:border-border'
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
        </TabsContent>
        
        {/* Property Portfolio Tab */}
        <TabsContent value="portfolio">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Your Property Portfolio</h3>
              {ownedProperties.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 flex items-center gap-1 px-3">
                      {portfolioView === 'all' && "All Properties"}
                      {portfolioView === 'residential' && <><Home className="h-3 w-3" /> Residential</>}
                      {portfolioView === 'commercial' && <><Building2 className="h-3 w-3" /> Commercial</>}
                      {portfolioView === 'luxury' && <><Castle className="h-3 w-3" /> Luxury</>}
                      {portfolioView === 'industrial' && <><Warehouse className="h-3 w-3" /> Industrial</>}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setPortfolioView('all')}>
                      All Properties
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPortfolioView('residential')}>
                      <Home className="h-4 w-4 mr-2" />
                      Residential
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPortfolioView('commercial')}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Commercial
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPortfolioView('luxury')}>
                      <Castle className="h-4 w-4 mr-2" />
                      Luxury
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPortfolioView('industrial')}>
                      <Warehouse className="h-4 w-4 mr-2" />
                      Industrial
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {ownedProperties.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500">You don't own any properties yet. Start building your real estate empire!</p>
              </Card>
            ) : (
              <>
                {/* Portfolio Overview */}
                <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Card className="p-3">
                    <p className="text-xs text-gray-500">Total Properties</p>
                    <p className="text-lg font-semibold">{ownedProperties.length}</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-500">Portfolio Value</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(ownedProperties.reduce((sum, prop) => sum + (prop.currentValue || prop.purchasePrice), 0))}
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-500">Monthly Income</p>
                    <p className="text-lg font-semibold text-green-600">
                      +{formatCurrency(ownedProperties.reduce((sum, prop) => sum + prop.income, 0))}
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-500">Monthly Expenses</p>
                    <p className="text-lg font-semibold text-red-600">
                      -{formatCurrency(ownedProperties.reduce((sum, prop) => sum + prop.expenses + (prop.monthlyPayment || 0), 0))}
                    </p>
                  </Card>
                </div>
                
                {/* Property List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ownedProperties
                    .filter(property => 
                      portfolioView === 'all' || 
                      (portfolioView === 'residential' && property.type === 'residential') ||
                      (portfolioView === 'commercial' && property.type === 'commercial') ||
                      (portfolioView === 'luxury' && property.type === 'mansion') ||
                      (portfolioView === 'industrial' && property.type === 'industrial')
                    )
                    .map(property => (
                      <Card key={property.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            {property.type === 'residential' && <Home className="h-4 w-4 mr-2 text-blue-500" />}
                            {property.type === 'commercial' && <Building2 className="h-4 w-4 mr-2 text-green-500" />}
                            {property.type === 'mansion' && <Castle className="h-4 w-4 mr-2 text-purple-500" />}
                            {property.type === 'industrial' && <Warehouse className="h-4 w-4 mr-2 text-orange-500" />}
                            {property.name}
                          </CardTitle>
                          <CardDescription>Purchased: {property.purchaseDate}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2 text-sm">
                            {/* Property Image */}
                            {property.id === 'single_family' && (
                              <div className="mb-2">
                                <img 
                                  src="/images/properties/single_family_home.jpg" 
                                  alt="Single Family Home" 
                                  className="rounded-md w-full h-32 object-cover"
                                />
                              </div>
                            )}
                            
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
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}