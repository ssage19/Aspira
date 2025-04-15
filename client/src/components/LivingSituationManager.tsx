import { useState, useEffect } from "react";
import { useCharacter } from "../lib/stores/useCharacter";
import { useNotification } from "../lib/stores/useNotification";
import { useAudio } from "../lib/stores/useAudio";
import { useTime } from "../lib/stores/useTime";
import { useAssetRefresh } from "./AssetRefreshProvider";
import { 
  HousingOption, 
  VehicleOption, 
  HousingType, 
  VehicleType,
  housingOptions, 
  vehicleOptions,
  getHousingOptionByType,
  getVehicleOptionByType,
  formatMonthlyExpense,
  formatPurchasePrice
} from "../lib/data/livingSituation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "./ui/card";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./ui/tabs";
import { Button } from "./ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Car,
  Heart,
  Brain,
  Users,
  BadgeCheck,
  BedDouble,
  AlertCircle,
  DollarSign,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Star
} from "lucide-react";
import { formatCurrency, formatPercentage } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

export function LivingSituationManager() {
  const { 
    wealth,
    addWealth,
    health,
    stress,
    comfort,
    prestige,
    addHealth,
    addStress,
    updateComfort,
    addPrestige,
    addHappiness,
    updateSocialConnections, 
    housingType,
    vehicleType,
    setHousing,
    setVehicle,
    getHousingExpense,
    getTransportationExpense,
    addTimeCommitment,
    reduceTimeCommitment
  } = useCharacter();
  
  const { showNotification } = useNotification();
  const { playSound } = useAudio();
  const { advanceTime } = useTime();
  const { triggerRefresh } = useAssetRefresh();
  
  const [activeTab, setActiveTab] = useState('housing');
  const [confirmPurchaseOpen, setConfirmPurchaseOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<HousingOption | VehicleOption | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsOption, setDetailsOption] = useState<HousingOption | VehicleOption | null>(null);
  
  // Current housing and vehicle options
  const currentHousing = getHousingOptionByType(housingType);
  const currentVehicle = getVehicleOptionByType(vehicleType);
  
  // Function to handle opening purchase confirmation
  const handleOpenPurchaseConfirm = (option: HousingOption | VehicleOption) => {
    console.log(`Opening purchase confirmation for ${option.name}`);
    // Use React's batched updates to ensure both state changes happen in one render cycle
    // This helps with button responsiveness
    setSelectedOption(option);
    setTimeout(() => {
      setConfirmPurchaseOpen(true);
    }, 10);
  };
  
  // Function to handle opening details dialog
  const handleOpenDetails = (option: HousingOption | VehicleOption) => {
    console.log(`Opening details for ${option.name}`);
    // Use setTimeout to improve responsiveness
    setDetailsOption(option);
    setTimeout(() => {
      setDetailsOpen(true);
    }, 10);
  };
  
  // Function to purchase housing option
  const purchaseHousingOption = (option: HousingOption) => {
    // Check if user has enough money
    if (option.price > wealth) {
      showNotification({
        title: "Insufficient Funds",
        message: `You need ${formatCurrency(option.price)} to purchase this housing option.`,
        type: "error"
      });
      playSound('error');
      return;
    }
    
    // If user is downgrading, apply smaller benefit and no cost
    const isDowngrade = housingOptions.findIndex(h => h.type === option.type) < 
                        housingOptions.findIndex(h => h.type === housingType);
    
    // Apply purchase cost only if upgrading
    if (!isDowngrade) {
      addWealth(-option.price);
    }
    
    // Update housing type
    setHousing(option.type);
    
    // Apply effects
    updateComfort(option.effects.comfort / 2); // Apply immediately half of the effect
    addHealth(option.effects.health / 2);
    addStress(option.effects.stress / 2);
    addPrestige(option.effects.prestige / 2);
    
    // Time passes during move
    advanceTime();
    
    // Show success notification
    showNotification({
      title: "Housing Updated",
      message: `You are now living in ${option.name}. Monthly expense: ${formatCurrency(option.monthlyExpense)}.`,
      type: "success"
    });
    
    // Play sound
    playSound('success');
    
    // Trigger asset refresh
    triggerRefresh();
    
    // Close confirmation dialog
    setConfirmPurchaseOpen(false);
  };
  
  // Function to purchase vehicle option
  const purchaseVehicleOption = (option: VehicleOption) => {
    // Check if user has enough money
    if (option.price > wealth) {
      showNotification({
        title: "Insufficient Funds",
        message: `You need ${formatCurrency(option.price)} to purchase this vehicle option.`,
        type: "error"
      });
      playSound('error');
      return;
    }
    
    // If user is downgrading, apply smaller benefit and no cost
    const isDowngrade = vehicleOptions.findIndex(v => v.type === option.type) < 
                        vehicleOptions.findIndex(v => v.type === vehicleType);
    
    // Apply purchase cost only if upgrading
    if (!isDowngrade) {
      addWealth(-option.price);
    }
    
    // Update vehicle type
    setVehicle(option.type);
    
    // Apply all effects from the vehicle
    updateComfort(option.effects.comfort);
    addStress(option.effects.stress);
    addPrestige(option.effects.prestige);
    
    // Apply additional effects (if available)
    if (option.additionalEffects) {
      // Apply health effects
      if (option.additionalEffects.health !== undefined) {
        addHealth(option.additionalEffects.health);
      }
      
      // Apply social effects
      if (option.additionalEffects.social !== undefined) {
        updateSocialConnections(option.additionalEffects.social);
      }
      
      // Apply environmental impact
      if (option.additionalEffects && option.additionalEffects.environmental !== undefined) {
        // Directly update the environmental impact through state setter
        useCharacter.setState(state => ({
          environmentalImpact: Math.max(0, Math.min(100, state.environmentalImpact + option.additionalEffects.environmental))
        }));
        console.log(`Updated environmental impact by ${option.additionalEffects.environmental}. New value: ${useCharacter.getState().environmentalImpact}`);
      }
      
      // Apply happiness effects
      if (option.additionalEffects.happiness !== undefined) {
        addHappiness(option.additionalEffects.happiness);
      }
    }
    
    // Time passes during purchase
    advanceTime();
    
    // Show success notification
    showNotification({
      title: "Transportation Updated",
      message: `You now use ${option.name}. Monthly expense: ${formatCurrency(option.monthlyExpense)}.`,
      type: "success"
    });
    
    // Play sound
    playSound('success');
    
    // Trigger asset refresh
    triggerRefresh();
    
    // Close confirmation dialog
    setConfirmPurchaseOpen(false);
  };
  
  // Function to handle purchase confirmation
  const handleConfirmPurchase = () => {
    if (!selectedOption) return;
    
    console.log("Confirming purchase for option:", selectedOption.name);
    
    // Determine if this is a housing or vehicle option by checking the id against each list
    const isHousingOption = housingOptions.some(o => o.id === selectedOption.id);
    
    // Use setTimeout to improve button responsiveness
    setTimeout(() => {
      if (isHousingOption) {
        console.log("Processing as housing option");
        purchaseHousingOption(selectedOption as HousingOption);
      } else {
        console.log("Processing as vehicle option");
        purchaseVehicleOption(selectedOption as VehicleOption);
      }
    }, 10);
  };
  
  // Function to render tier indicators
  const renderTierStars = (tier: number, maxTier: number = 5) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: tier }).map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-current text-yellow-500" />
        ))}
        {Array.from({ length: maxTier - tier }).map((_, i) => (
          <Star key={i + tier} className="h-3 w-3 text-gray-300" />
        ))}
      </div>
    );
  };
  
  // Component to render pros and cons
  const OptionBenefits = ({ option }: { option: HousingOption | VehicleOption }) => {
    return (
      <div className="grid grid-cols-1 gap-2 mt-2">
        <div>
          <h4 className="text-sm font-medium flex items-center mb-1">
            <ThumbsUp className="h-3 w-3 mr-2 text-green-500" />
            Benefits
          </h4>
          <ul className="text-xs space-y-1">
            {option.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-1">•</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        
        {option.downsides && option.downsides.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center mb-1">
              <ThumbsDown className="h-3 w-3 mr-2 text-red-500" />
              Downsides
            </h4>
            <ul className="text-xs space-y-1">
              {option.downsides.map((downside, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-1">•</span>
                  {downside}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Component to render effects
  const OptionEffects = ({ option }: { option: HousingOption | VehicleOption }) => {
    // Use type assertion to get the correct type
    const effects = option.effects;
    const isHousing = 'health' in effects;
    
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
        <div className="flex items-center">
          <BedDouble className="h-3 w-3 mr-1 text-blue-500" />
          <span>Comfort: {effects.comfort > 0 ? '+' : ''}{effects.comfort}</span>
        </div>
        
        <div className="flex items-center">
          <Brain className="h-3 w-3 mr-1 text-teal-500" />
          <span>Stress: {effects.stress <= 0 ? '' : '+'}{effects.stress}</span>
        </div>
        
        <div className="flex items-center">
          <BadgeCheck className="h-3 w-3 mr-1 text-purple-500" />
          <span>Prestige: {effects.prestige > 0 ? '+' : ''}{effects.prestige}</span>
        </div>
        
        {isHousing && (
          <div className="flex items-center">
            <Heart className="h-3 w-3 mr-1 text-red-500" />
            <span>Health: {(effects as HousingOption['effects']).health > 0 ? '+' : ''}
            {(effects as HousingOption['effects']).health}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Component to render housing options
  const HousingOptions = () => {
    return (
      <div className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold flex items-center mb-2">
            <Home className="h-5 w-5 mr-2" />
            Current Housing
          </h3>
          <p className="text-sm mb-2">{currentHousing.name}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatMonthlyExpense(currentHousing)}
              </span>
            </Badge>
            <Badge variant="outline">
              <span className="flex items-center">
                {renderTierStars(currentHousing.tier)}
              </span>
            </Badge>
          </div>
          <Separator className="my-3" />
          <OptionEffects option={currentHousing} />
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {housingOptions.map(option => (
            <Card key={option.id} className={`overflow-hidden ${option.type === housingType ? 'border-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {option.name}
                    </CardTitle>
                    <div className="flex mt-1">
                      {renderTierStars(option.tier)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenDetails(option)}
                  >
                    Details
                  </Button>
                </div>
                <CardDescription className="flex gap-2 mt-1 text-sm">
                  <span className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatPurchasePrice(option)}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatMonthlyExpense(option)}
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm">{option.description}</p>
                <OptionEffects option={option} />
              </CardContent>
              
              <CardFooter className="pt-0 flex justify-between">
                {option.type === housingType ? (
                  <Badge variant="outline" className="ml-auto">Current</Badge>
                ) : (
                  <Button 
                    className="ml-auto"
                    onClick={() => handleOpenPurchaseConfirm(option)}
                    disabled={option.price > wealth}
                    variant={option.price > wealth ? "outline" : "default"}
                  >
                    {getHousingButtonText(option)}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  // Helper to get appropriate button text for housing options
  const getHousingButtonText = (option: HousingOption): string => {
    const currentIndex = housingOptions.findIndex(h => h.type === housingType);
    const optionIndex = housingOptions.findIndex(h => h.type === option.type);
    
    if (optionIndex > currentIndex) {
      return "Upgrade";
    } else if (optionIndex < currentIndex) {
      return "Downgrade";
    } else {
      return "Select";
    }
  };
  
  // Helper to get appropriate button text for vehicle options
  const getVehicleButtonText = (option: VehicleOption): string => {
    const currentIndex = vehicleOptions.findIndex(v => v.type === vehicleType);
    const optionIndex = vehicleOptions.findIndex(v => v.type === option.type);
    
    if (optionIndex > currentIndex) {
      return "Upgrade";
    } else if (optionIndex < currentIndex) {
      return "Downgrade";
    } else {
      return "Select";
    }
  };
  
  // Component to render vehicle options
  const VehicleOptions = () => {
    return (
      <div className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold flex items-center mb-2">
            <Car className="h-5 w-5 mr-2" />
            Current Transportation
          </h3>
          <p className="text-sm mb-2">{currentVehicle.name}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatMonthlyExpense(currentVehicle)}
              </span>
            </Badge>
            <Badge variant="outline">
              <span className="flex items-center">
                {renderTierStars(currentVehicle.tier, 6)}
              </span>
            </Badge>
          </div>
          <Separator className="my-3" />
          <OptionEffects option={currentVehicle} />
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicleOptions.map(option => (
            <Card key={option.id} className={`overflow-hidden ${option.type === vehicleType ? 'border-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {option.name}
                    </CardTitle>
                    <div className="flex mt-1">
                      {renderTierStars(option.tier, 6)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenDetails(option)}
                  >
                    Details
                  </Button>
                </div>
                <CardDescription className="flex gap-2 mt-1 text-sm">
                  <span className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatPurchasePrice(option)}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatMonthlyExpense(option)}
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm">{option.description}</p>
                <OptionEffects option={option} />
              </CardContent>
              
              <CardFooter className="pt-0 flex justify-between">
                {option.type === vehicleType ? (
                  <Badge variant="outline" className="ml-auto">Current</Badge>
                ) : (
                  <Button 
                    className="ml-auto"
                    onClick={() => handleOpenPurchaseConfirm(option)}
                    disabled={option.price > wealth}
                    variant={option.price > wealth ? "outline" : "default"}
                  >
                    {getVehicleButtonText(option)}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Living Situation</h2>
        <div className="text-right">
          <div className="text-lg font-semibold">{formatCurrency(wealth)}</div>
          <div className="text-sm text-muted-foreground">Available funds</div>
        </div>
      </div>
      
      <Tabs defaultValue="housing" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="housing" className="flex items-center justify-center">
            <Home className="h-4 w-4 mr-2" />
            Housing
          </TabsTrigger>
          <TabsTrigger value="transportation" className="flex items-center justify-center">
            <Car className="h-4 w-4 mr-2" />
            Transportation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="housing">
          <HousingOptions />
        </TabsContent>
        
        <TabsContent value="transportation">
          <VehicleOptions />
        </TabsContent>
      </Tabs>
      
      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={confirmPurchaseOpen} onOpenChange={setConfirmPurchaseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedOption && (
                <div className="space-y-4">
                  <p>
                    Are you sure you want to {
                      selectedOption.price > 0 ? 'purchase' : 'switch to'
                    } {selectedOption.name}?
                  </p>
                  
                  {selectedOption.price > 0 && (
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span>Purchase Price:</span>
                        <span className="font-semibold">{formatCurrency(selectedOption.price)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span>Monthly Expense:</span>
                        <span className="font-semibold">{formatCurrency(selectedOption.monthlyExpense)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span>After Purchase:</span>
                        <span className="font-semibold">{formatCurrency(wealth - selectedOption.price)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchase}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailsOption?.name}</DialogTitle>
            <DialogDescription>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">
                  <span className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {detailsOption ? formatPurchasePrice(detailsOption) : '$0'}
                  </span>
                </Badge>
                <Badge variant="outline">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {detailsOption ? formatMonthlyExpense(detailsOption) : '$0/month'}
                  </span>
                </Badge>
                <Badge variant="outline">
                  <span className="flex items-center">
                    {detailsOption ? renderTierStars(
                      detailsOption.tier, 
                      housingOptions.some(h => h.id === detailsOption.id) ? 5 : 6
                    ) : null}
                  </span>
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-sm">{detailsOption?.description}</p>
            
            <Separator className="my-3" />
            
            {detailsOption && (
              <>
                <h4 className="text-sm font-medium mb-2">Effects</h4>
                <OptionEffects option={detailsOption} />
                
                <Separator className="my-3" />
                
                <OptionBenefits option={detailsOption} />
              </>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}