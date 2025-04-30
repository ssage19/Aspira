import { useState, useCallback, useEffect, useMemo } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useEconomy } from '../lib/stores/useEconomy';
import { useTime } from '../lib/stores/useTime';
// Audio removed
import { useResponsive } from '../lib/hooks/useResponsive';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { formatCurrency, getPropertyImagePath } from '../lib/utils';
import PropertyDescriptionWithImage from './PropertyDescriptionWithImage';
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
import { 
  residentialProperties, 
  luxuryProperties, 
  commercialProperties, 
  industrialProperties,
  calculateMortgage
} from '../lib/data/properties';
import { PropertyType } from '../lib/types/PropertyTypes';

export function Properties() {
  // Use a direct reference to avoid stale state
  const characterState = useCharacter();
  const { addWealth, addProperty, sellProperty, properties: ownedProperties } = characterState;
  // Get wealth directly from the store each time to ensure freshness
  const wealth = useCharacter(state => state.wealth);
  const { interestRate, realEstateMarketHealth } = useEconomy();
  const { currentDay, currentMonth, currentYear } = useTime();
  // Audio removed - using empty functions
  const playSuccess = () => {};
  const playHit = () => {};
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  const [activeTab, setActiveTab] = useState('residential');
  const [portfolioView, setPortfolioView] = useState('all');
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  // Cache property data for each tab to prevent unnecessary rebuilding
  const cachedPropertyData = useMemo(() => {
    return {
      residential: residentialProperties,
      mansion: luxuryProperties,
      luxury: luxuryProperties, // Add this line to map both "luxury" and "mansion" to the same data
      commercial: commercialProperties,
      industrial: industrialProperties
    };
  }, []);
  
  // Function to get properties for the active tab - using cached data
  const getPropertiesForActiveTab = useCallback((tab: string) => {
    return cachedPropertyData[tab as keyof typeof cachedPropertyData] || cachedPropertyData.residential;
  }, [cachedPropertyData]);
  
  const [selectedProperty, setSelectedProperty] = useState(residentialProperties[0]);
  
  // Calculate adjusted property price based on market conditions - memoized
  const getAdjustedPrice = useCallback((basePrice: number) => {
    // Market factor ranges from 0.8 to 1.2 based on economic conditions
    const marketFactor = 0.8 + (realEstateMarketHealth / 100) * 0.4;
    return Math.round(basePrice * marketFactor);
  }, [realEstateMarketHealth]);
  
  // Memoized version of getPropertiesForActiveTab with cached property data
  const getPropertiesForTab = useCallback(() => getPropertiesForActiveTab(activeTab), [activeTab, getPropertiesForActiveTab]);
  
  // Update selected property when tab changes
  useEffect(() => {
    const properties = getPropertiesForTab();
    if (properties && properties.length > 0) {
      setSelectedProperty(properties[0]);
    }
  }, [activeTab, getPropertiesForTab]);
  
  // Check if user already owns this property
  const isPropertyOwned = (id: string) => {
    return ownedProperties.some(property => property.id === id);
  };
  
  // Completely redesigned property purchase function
  const handlePurchase = () => {
    console.log("============= PROPERTY PURCHASE TRANSACTION START =============");
    console.log(`Current tab: ${activeTab}, Property: ${selectedProperty.name}, ID: ${selectedProperty.id}`);
    
    // STEP 1: Check if already owned
    if (isPropertyOwned(selectedProperty.id)) {
      console.log("PURCHASE ERROR: Property already owned");
      toast.error("You already own this property");
      return;
    }
    
    // STEP 2: Calculate price and down payment
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const downPayment = (downPaymentPercent / 100) * adjustedPrice;
    const loanAmount = adjustedPrice - downPayment;
    
    console.log(`Property price details: 
      Base price: ${selectedProperty.price}
      Adjusted price: ${adjustedPrice}
      Down payment percentage: ${downPaymentPercent}%
      Down payment amount: ${downPayment}
      Loan amount: ${loanAmount}
    `);
    
    // STEP 3: Get latest player cash from ALL sources
    // Get character store wealth directly
    const characterStore = useCharacter.getState();
    let playerCash = characterStore.wealth;
    
    // Also check localStorage as backup
    try {
      const savedCharacter = localStorage.getItem('luxury_lifestyle_character');
      if (savedCharacter) {
        const parsedCharacter = JSON.parse(savedCharacter);
        if (parsedCharacter && typeof parsedCharacter.wealth === 'number') {
          // Use the higher of the two values for maximum safety
          if (parsedCharacter.wealth > playerCash) {
            console.log(`Using localStorage wealth (${parsedCharacter.wealth}) instead of store wealth (${playerCash})`);
            playerCash = parsedCharacter.wealth;
          }
        }
      }
    } catch (error) {
      console.error("Error parsing localStorage character:", error);
    }
    
    // Access directly for simplicity - this is still helpful for wealth checking
    try {
      // Try to access the global asset tracker if available
      if (typeof window !== 'undefined' && 
          (window as any).useAssetTracker && 
          typeof (window as any).useAssetTracker.getState === 'function') {
        const assetState = (window as any).useAssetTracker.getState();
        if (assetState && typeof assetState.cash === 'number') {
          console.log(`Asset tracker cash found: ${assetState.cash}`);
          // Use the higher value for safety
          if (assetState.cash > playerCash) {
            console.log(`Using asset tracker cash (${assetState.cash}) instead of character cash (${playerCash})`);
            playerCash = assetState.cash;
          }
        }
      }
    } catch (error) {
      console.error("Error checking asset tracker:", error);
      // Non-fatal, continue with character store cash
    }
    
    // STEP 4: Comprehensive funds check
    console.log(`FUNDS CHECK: Player cash: ${playerCash}, Down payment required: ${downPayment}`);
    
    if (playerCash < downPayment) {
      console.error(`PURCHASE ERROR: Insufficient funds - Player cash: ${playerCash}, Down payment: ${downPayment}`);
      toast.error("Insufficient funds for down payment");
      console.log("============= PROPERTY PURCHASE TRANSACTION ABORTED: INSUFFICIENT FUNDS =============");
      return;
    }
    
    console.log(`FUNDS CHECK PASSED: Player has sufficient funds`);
    
    // STEP 5: Display warnings if applicable
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
    
    // STEP 6: Calculate mortgage payment
    const monthlyPayment = loanAmount > 0 ? mortgageDetails.monthlyPayment : 0;
    console.log(`Mortgage monthly payment: ${monthlyPayment}`);
    
    // STEP 7: Handle property type mapping
    // Ensure property type is correct (mansion for luxury tab)
    let propertyType = activeTab;
    if (activeTab === 'luxury') {
      propertyType = 'mansion';
      console.log(`Converting tab type 'luxury' to property type 'mansion'`);
    }
    
    // STEP 8: Create the property object
    const purchaseDateStr = `${currentMonth}/${currentDay}/${currentYear}`;
    console.log(`Purchase date: ${purchaseDateStr}`);
    
    const newProperty = {
      id: selectedProperty.id,
      name: selectedProperty.name,
      type: propertyType as 'residential' | 'commercial' | 'industrial' | 'mansion',
      location: selectedProperty.location,
      description: selectedProperty.description,
      purchaseDate: purchaseDateStr,
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
      
      // Optional fields based on property type
      ...(activeTab === 'residential' && 'bedrooms' in selectedProperty) && {
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms
      },
      ...((activeTab === 'mansion' || activeTab === 'luxury') && 'bedrooms' in selectedProperty) && {
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms,
        prestige: (selectedProperty as any).prestige || 0
      },
      ...(activeTab === 'commercial' && 'roi' in selectedProperty) && {
        roi: typeof selectedProperty.roi === 'number' ? selectedProperty.roi : 0
      },
      ...(activeTab === 'industrial' && 'roi' in selectedProperty) && {
        roi: typeof selectedProperty.roi === 'number' ? selectedProperty.roi : 0
      }
    };
    
    console.log("Property object created:", newProperty);
    
    // STEP 9: Execute the transaction - direct store operations for maximum reliability
    try {
      console.log("Beginning transaction execution...");
      
      // 9.1 - First deduct player wealth directly (most important step)
      console.log(`Deducting ${downPayment} from player wealth of ${playerCash}`);
      
      // We'll use the direct Zustand API for the most reliable update
      console.log("Executing wealth deduction via direct state update");
      useCharacter.setState(state => ({
        ...state,
        wealth: state.wealth - downPayment
      }));
      
      const updatedCash = useCharacter.getState().wealth;
      console.log(`Wealth deduction complete. New wealth: ${updatedCash}`);
      
      // 9.2 - Add the property to the player's properties collection
      console.log("Adding property to player's portfolio");
      useCharacter.setState(state => ({
        ...state,
        properties: [...state.properties, newProperty],
        // Also update monthly expenses for mortgage payment
        expenses: state.expenses + newProperty.monthlyPayment,
        // Update income from property
        income: state.income + newProperty.income
      }));
      
      // 9.3 - Verify property was added
      const updatedPortfolio = useCharacter.getState().properties;
      const propertyAdded = updatedPortfolio.some(p => p.id === newProperty.id);
      
      if (!propertyAdded) {
        throw new Error("Property was not added to portfolio");
      }
      
      console.log(`Property successfully added to portfolio (now ${updatedPortfolio.length} properties)`);
      
      // 9.4 - Update asset tracker as well for consistency
      try {
        console.log("Updating asset tracker...");
        // Try to access the global asset tracker if available
        if (typeof window !== 'undefined' && 
            (window as any).useAssetTracker && 
            typeof (window as any).useAssetTracker.getState === 'function') {
          const assetTracker = (window as any).useAssetTracker.getState();
          
          if (assetTracker) {
            // Update cash in asset tracker
            if (typeof assetTracker.updateCash === 'function') {
              assetTracker.updateCash(updatedCash);
              console.log(`Asset tracker cash updated to ${updatedCash}`);
            }
            
            // Add property to asset tracker
            if (typeof assetTracker.addProperty === 'function') {
              assetTracker.addProperty({
                id: newProperty.id,
                name: newProperty.name,
                purchasePrice: newProperty.purchasePrice,
                currentValue: newProperty.currentValue,
                mortgage: newProperty.loanAmount,
                purchaseDate: newProperty.purchaseDate
              });
              console.log(`Property added to asset tracker: ${newProperty.name}`);
            }
            
            // Force recalculation
            if (typeof assetTracker.recalculateTotals === 'function') {
              assetTracker.recalculateTotals();
              console.log("Asset tracker totals recalculated");
            }
            
            console.log("Asset tracker updated successfully");
          }
        }
      } catch (assetError) {
        console.error("Error updating asset tracker:", assetError);
        // Non-fatal error, continue with transaction
      }
      
      // 9.5 - Recalculate net worth
      console.log("Recalculating net worth");
      const character = useCharacter.getState();
      const netWorth = character.calculateNetWorth();
      useCharacter.setState({ netWorth });
      console.log(`Net worth updated to ${netWorth}`);
      
      // 9.6 - Save everything to localStorage
      console.log("Saving updated state to localStorage");
      localStorage.setItem('luxury_lifestyle_character', JSON.stringify(useCharacter.getState()));
      
      // 9.7 - Transaction complete, show success message
      console.log("============= PROPERTY PURCHASE TRANSACTION COMPLETED SUCCESSFULLY =============");
      playSuccess();
      
      toast.success(
        <div className="flex flex-col">
          <div className="flex items-center font-semibold">
            Property Purchased!
          </div>
          <p className="text-sm mt-1">
            You have successfully purchased {selectedProperty.name} for {formatCurrency(adjustedPrice)}.
          </p>
        </div>,
        { duration: 3000 }
      );
      
    } catch (error) {
      // If any part of the transaction fails, try to roll back
      console.error("TRANSACTION ERROR:", error);
      
      // Attempt to refund the down payment
      console.log(`Attempting to refund ${downPayment} to player`);
      useCharacter.setState(state => ({
        ...state,
        wealth: state.wealth + downPayment
      }));
      
      // Show error to player
      toast.error(
        <div className="flex flex-col">
          <div className="flex items-center font-semibold">
            Purchase Failed
          </div>
          <p className="text-sm mt-1">
            There was an error processing your purchase. Your funds have been returned.
          </p>
        </div>,
        { duration: 4000 }
      );
      
      console.log("============= PROPERTY PURCHASE TRANSACTION FAILED AND ROLLED BACK =============");
    }
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
  
  // Property image component for reuse - memoized to prevent unnecessary rerenders
  const PropertyImage = useCallback(({ propertyId, propertyName }: { propertyId: string; propertyName: string }) => {
    // Get property image path using our utility function
    const imagePath = getPropertyImagePath(propertyId) || getPropertyImagePath(propertyName);
    
    // Return the image if we have a path
    return imagePath ? (
      <div className="mb-3">
        <img 
          src={imagePath}
          alt={propertyName}
          className="rounded-md w-full h-auto object-cover"
          onError={(e) => {
            // Handle error silently
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    ) : null;
  }, []);
  
  // Calculate monthly mortgage payment using memoization
  const calculateMonthlyPayment = useCallback(() => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const downPayment = (downPaymentPercent / 100) * adjustedPrice;
    
    // Fixed the function call to match the expected parameters
    const result = calculateMortgage(adjustedPrice, downPaymentPercent, interestRate, 30);
    return result;
  }, [selectedProperty.price, downPaymentPercent, interestRate, getAdjustedPrice]);
  
  // Calculate ROI (Return on Investment) - memoized
  const calculateROI = useCallback(() => {
    const mortgageDetails = calculateMonthlyPayment();
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const downPayment = (downPaymentPercent / 100) * adjustedPrice;
    const annualIncome = selectedProperty.income * 12;
    const annualExpenses = selectedProperty.expenses * 12;
    const annualMortgage = mortgageDetails.monthlyPayment * 12;
    
    const annualCashFlow = annualIncome - annualExpenses - annualMortgage;
    const roi = (annualCashFlow / downPayment) * 100;
    
    return roi.toFixed(1);
  }, [selectedProperty.price, selectedProperty.income, selectedProperty.expenses, downPaymentPercent, calculateMonthlyPayment, getAdjustedPrice]);
  
  // Calculate cap rate (capitalization rate) - memoized
  const calculateCapRate = useCallback(() => {
    const adjustedPrice = getAdjustedPrice(selectedProperty.price);
    const annualIncome = selectedProperty.income * 12;
    const annualExpenses = selectedProperty.expenses * 12;
    
    const annualNetOperatingIncome = annualIncome - annualExpenses;
    const capRate = (annualNetOperatingIncome / adjustedPrice) * 100;
    
    return capRate.toFixed(1);
  }, [selectedProperty.price, selectedProperty.income, selectedProperty.expenses, getAdjustedPrice]);
  
  // Enhanced property description section with image
  const PropertyDescriptionWithImage = useCallback(({ description, id, name }: { description: string; id: string; name: string }) => {
    return (
      <>
        <p className="text-sm">{description}</p>
        <PropertyImage propertyId={id} propertyName={name} />
      </>
    );
  }, []);
  
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
                {(activeTab === 'mansion' || activeTab === 'luxury') && <><Castle className="h-4 w-4 mr-2" /> Luxury</>}
                {activeTab === 'commercial' && <><Building2 className="h-4 w-4 mr-2" /> Commercial</>}
                {activeTab === 'industrial' && <><Warehouse className="h-4 w-4 mr-2" /> Industrial</>}
                {activeTab === 'portfolio' && <><TrendingUp className="h-4 w-4 mr-2" /> Portfolio</>}
                <ChevronDown className="h-4 w-4 ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                <DropdownMenuItem 
                  onClick={() => setActiveTab('residential')} 
                  className="cursor-pointer"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Residential
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setActiveTab('luxury')} 
                  className="cursor-pointer"
                >
                  <Castle className="h-4 w-4 mr-2" />
                  Luxury
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setActiveTab('commercial')} 
                  className="cursor-pointer"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Commercial
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setActiveTab('industrial')} 
                  className="cursor-pointer"
                >
                  <Warehouse className="h-4 w-4 mr-2" />
                  Industrial
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setActiveTab('portfolio')} 
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
            <TabsTrigger value="luxury">
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
                  <PropertyDescriptionWithImage 
                    description={selectedProperty.description}
                    id={selectedProperty.id}
                    name={selectedProperty.name}
                  />
                  
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
        <TabsContent value="luxury">
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
                  <PropertyDescriptionWithImage 
                    description={selectedProperty.description}
                    id={selectedProperty.id}
                    name={selectedProperty.name}
                  />
                  
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
                  <PropertyDescriptionWithImage 
                    description={selectedProperty.description}
                    id={selectedProperty.id}
                    name={selectedProperty.name}
                  />
                  
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
                  <PropertyDescriptionWithImage 
                    description={selectedProperty.description}
                    id={selectedProperty.id}
                    name={selectedProperty.name}
                  />
                  
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
                          <CardDescription>
                            Purchased: {property.purchaseDate}
                            {property.holdingPeriodInDays !== undefined && (
                              <span className="block text-xs text-muted-foreground">
                                Holding Period: {property.holdingPeriodInDays} days 
                                {property.holdingPeriodInDays > 365 ? 
                                  ` (${(property.holdingPeriodInDays / 365).toFixed(1)} years)` : ''}
                              </span>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2 text-sm">
                            {/* Property Image */}
                            {(() => {
                              // Get property image using our utility function
                              const imagePath = getPropertyImagePath(property.id) || getPropertyImagePath(property.name);
                              
                              // Log for debugging
                              console.log(`Portfolio property image check - ID: ${property.id}, Name: ${property.name}, Path: ${imagePath}`);
                              
                              return imagePath ? (
                                <div className="mb-2">
                                  <img 
                                    src={imagePath} 
                                    alt={property.name} 
                                    className="rounded-md w-full h-32 object-cover"
                                  />
                                </div>
                              ) : null;
                            })()}
                            
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