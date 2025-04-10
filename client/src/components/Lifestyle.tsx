import { useState, useEffect } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useAudio } from '../lib/stores/useAudio';
import { useTime } from '../lib/stores/useTime';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog";
import { toast } from 'sonner';
import { 
  ShoppingBag, 
  Car, 
  Plane,
  ChevronLeft,
  Watch, 
  Home, 
  HeartPulse,
  Check,
  Award,
  X,
  Clock,
  Wind,
  Leaf,
  Heart,
  Sparkles,
  BookOpen,
  Users,
  Briefcase,
  Smartphone,
  Shirt,
  Palette,
  Camera,
  Gamepad
} from 'lucide-react';
import { formatCurrency, formatInteger } from '../lib/utils';
import { 
  luxuryItems, 
  vehicles, 
  vacations,
  experiences 
} from '../lib/data/lifestyleItems';
import { 
  techProducts,
  fashionItems,
  tattoos
} from '../lib/data/additionalLifestyleItems';
import { hobbies } from '../lib/data/hobbies';

export function Lifestyle() {
  const { wealth, addWealth, addLifestyleItem, removeLifestyleItem, lifestyleItems: ownedItems } = useCharacter();
  const { playSuccess, playHit } = useAudio();
  const { currentGameDate, dayCounter } = useTime(); // Access game time
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('luxury');
  const [, forceUpdate] = useState({});
  
  // Force component to re-render when game time changes, to update countdowns
  useEffect(() => {
    // Re-render the component whenever the day changes
    forceUpdate({});
  }, [dayCounter, currentGameDate]);
  
  const handlePurchase = (item: any) => {
    // Check cost based on item type
    const cost = item.type === 'hobbies' ? item.attributes.initialInvestment : item.price;
    
    if (wealth < cost) {
      toast.error("Not enough funds to purchase this item");
      playHit();
      return;
    }
    
    // Check if item is already owned (for unique items)
    if (item.unique && ownedItems.some(owned => owned.id === item.id)) {
      toast.error("You already own this item");
      return;
    }
    
    // Time commitment check for hobbies
    if (item.type === 'hobbies') {
      // Get total time commitment from current hobbies
      const timeCommitment = ownedItems
        .filter(owned => owned.type === 'hobbies')
        .reduce((total, hobby) => {
          const foundHobby = hobbies.find(h => h.id === hobby.id);
          return total + (foundHobby?.attributes?.timeCommitment || 0);
        }, 0);
      
      // Check if adding this hobby would exceed time limitations (80 hours per week max)
      const newTimeCommitment = timeCommitment + (item.attributes.timeCommitment || 0);
      if (newTimeCommitment > 80) {
        toast.error("You don't have enough time for this hobby. Consider abandoning another hobby first.");
        playHit();
        return;
      }
    }
    
    // Process purchase
    addWealth(-cost);
    
    // Create different structures based on item type
    let lifestyleItem;
    
    if (item.type === 'hobbies') {
      lifestyleItem = {
        id: item.id,
        name: item.name,
        type: 'hobbies', // Use exact type not activeTab
        purchasePrice: item.attributes.initialInvestment,
        // Set both maintenanceCost and monthlyCost for compatibility
        maintenanceCost: item.attributes.costPerMonth,
        monthlyCost: item.attributes.costPerMonth,
        happiness: item.happiness || 10,
        prestige: item.prestige || 5,
        // Add purchase date
        purchaseDate: new Date().toISOString(),
        
        // Add attributes from the hobby
        timeCommitment: item.attributes.timeCommitment,
        healthImpact: item.attributes.healthImpact,
        stressReduction: item.attributes.stressReduction,
        socialStatus: item.attributes.socialStatus,
        skillDevelopment: item.attributes.skillDevelopment,
        environmentalImpact: item.attributes.environmentalImpact,
        specialBenefits: item.attributes.specialBenefits || []
      };
    } else {
      // Convert daily maintenance to monthly cost (30 days per month)
      const monthlyMaintenance = (item.maintenanceCost || 0) * 30;
      
      lifestyleItem = {
        id: item.id,
        name: item.name,
        type: item.type, // Use exact type from the item, not activeTab
        purchasePrice: item.price,
        // Set both maintenanceCost and monthlyCost for compatibility
        maintenanceCost: item.maintenanceCost || 0,
        monthlyCost: monthlyMaintenance,
        happiness: item.happiness || 10,
        prestige: item.prestige || 5,
        // Add purchase date
        purchaseDate: new Date().toISOString(),
        // For duration-based items, pass the durationInDays to the store
        // The store's addLifestyleItem function will calculate the endDate
        ...(item.durationInDays && { durationInDays: item.durationInDays }),
        
        // Add attributes from the item if they exist
        ...(item.attributes && {
          timeCommitment: item.attributes.timeCommitment,
          healthImpact: item.attributes.healthImpact,
          stressReduction: item.attributes.stressReduction,
          socialStatus: item.attributes.socialStatus,
          skillDevelopment: item.attributes.skillDevelopment,
          environmentalImpact: item.attributes.environmentalImpact,
          specialBenefits: item.attributes.specialBenefits || []
        })
      };
    }
    
    // Add item to character
    addLifestyleItem(lifestyleItem);
    
    // Play success sound
    playSuccess();
    
    // Show different toasts with different messages based on type
    if (item.type === 'hobbies') {
      // Display item-specific benefits info
      if (item.attributes.specialBenefits && item.attributes.specialBenefits.length > 0) {
        toast.success(
          <div>
            <p className="font-bold">Started new hobby: {item.name}</p>
            <p className="text-sm mt-1">Key benefit: {item.attributes.specialBenefits[0]}</p>
          </div>,
          { duration: 4000 }
        );
      } else {
        toast.success(`Started new hobby: ${item.name}`);
      }
      
      // Show consequence notifications if applicable
      if (item.attributes.healthImpact && item.attributes.healthImpact < -10) {
        toast.warning(
          "This hobby may have some negative health impacts if pursued long-term.",
          { duration: 3000 }
        );
      }
      
      if (item.attributes.timeCommitment > 20) {
        toast.warning(
          "This hobby requires significant time commitment.",
          { duration: 3000 }
        );
      }
      
      // Show special unlocks if available
      if (item.unlocks && item.unlocks.length > 0) {
        setTimeout(() => {
          toast.success(
            <div>
              <p className="font-bold">New opportunities unlocked!</p>
              <p className="text-sm mt-1">{item.unlocks?.[0]}</p>
            </div>,
            { duration: 4000 }
          );
        }, 1000);
      }
    } else {
      // Special message for vacation and experience items with duration
      if ((item.type === 'vacations' || item.type === 'experiences') && item.durationInDays) {
        toast.success(
          <div>
            <p className="font-bold">Purchased {item.name}</p>
            <p className="text-sm mt-1">
              Duration: {item.durationInDays} {item.durationInDays === 1 ? 'day' : 'days'}
            </p>
          </div>,
          { duration: 4000 }
        );
      } else {
        // Standard purchase message for other non-hobby items
        toast.success(`Purchased ${item.name}`);
      }
      
      // Show environmental impact warning for very negative items
      if (item.attributes?.environmentalImpact && item.attributes.environmentalImpact < -30) {
        setTimeout(() => {
          toast.warning(
            "This purchase has a significant environmental footprint.",
            { duration: 3000 }
          );
        }, 1000);
      }
    }
  };
  
  const isItemOwned = (id: string) => {
    return ownedItems.some(item => item.id === id);
  };
  
  // Helper function to render attribute icons with values
  const renderAttribute = (icon: React.ReactNode, label: string, value: number | undefined, color: string) => {
    if (value === undefined) return null;
    
    // Only show non-zero values
    if (value === 0) return null;
    
    const formattedValue = value > 0 ? `+${formatInteger(value)}` : formatInteger(value);
    
    return (
      <div className={`flex items-center ${color} text-xs`}>
        {icon}
        <span className="ml-1">{label}: {formattedValue}</span>
      </div>
    );
  };
  
  // Helper function to render benefits list
  const renderBenefits = (benefits: string[] | undefined) => {
    if (!benefits || benefits.length === 0) return null;
    
    return (
      <div className="mt-2 text-xs text-gray-700">
        <div className="font-medium mb-1">Benefits:</div>
        <ul className="list-disc list-inside space-y-1">
          {benefits.slice(0, 2).map((benefit, index) => (
            <li key={index} className="line-clamp-1">{benefit}</li>
          ))}
          {benefits.length > 2 && (
            <li className="text-blue-500">+{benefits.length - 2} more benefits</li>
          )}
        </ul>
      </div>
    );
  };
  
  // Determine if an item has any attributes
  const hasAttributes = (item: any) => {
    return item.attributes && Object.keys(item.attributes).length > 0;
  };

  const renderItems = (items: any[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id} className={`overflow-hidden ${hasAttributes(item) ? 'border-blue-200 hover:border-blue-300' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                {item.name}
                {item.unique && (
                  <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                    Unique
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {item.type === 'hobbies' ? (
                  <>
                    Initial: {formatCurrency(item.attributes.initialInvestment)}
                    <span className="ml-2 text-amber-600">
                      +{formatCurrency(item.attributes.costPerMonth)}/month
                    </span>
                  </>
                ) : (
                  <>
                    Price: {formatCurrency(item.price)}
                    {item.maintenanceCost > 0 && (
                      <span className="ml-2 text-amber-600">
                        +{formatCurrency(item.maintenanceCost)}/month
                      </span>
                    )}
                  </>
                )}
              </CardDescription>
              
              {/* Show duration for vacation and experience items */}
              {(item.type === 'vacations' || item.type === 'experiences') && item.durationInDays && (
                <div className="mt-1 text-xs flex items-center text-orange-600">
                  <Clock className="h-3 w-3 mr-1 text-orange-500" />
                  <span>Duration: {item.durationInDays} {item.durationInDays === 1 ? 'day' : 'days'}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="pb-2">
              <div className={`${hasAttributes(item) ? 'min-h-[160px]' : 'h-20'} flex flex-col justify-between`}>
                <p className="text-sm line-clamp-2">{item.description}</p>
                
                {/* Basic stats everyone sees */}
                <div className="flex justify-between text-sm mt-2">
                  <span className="flex items-center">
                    <HeartPulse className="h-4 w-4 mr-1 text-pink-500" />
                    Happiness: +{formatInteger(item.happiness)}
                  </span>
                  <span className="flex items-center">
                    <Award className="h-4 w-4 mr-1 text-purple-500" />
                    Prestige: +{formatInteger(item.prestige)}
                  </span>
                </div>
                
                {/* Detailed attributes section */}
                {hasAttributes(item) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {renderAttribute(
                        <Users className="h-3 w-3" />, 
                        "Social", 
                        item.attributes.socialStatus, 
                        "text-blue-600"
                      )}
                      {renderAttribute(
                        <Heart className="h-3 w-3" />, 
                        "Health", 
                        item.attributes.healthImpact, 
                        item.attributes.healthImpact >= 0 ? "text-green-600" : "text-red-500"
                      )}
                      {renderAttribute(
                        <Clock className="h-3 w-3" />, 
                        "Time", 
                        item.attributes.timeCommitment, 
                        "text-orange-500"
                      )}
                      {renderAttribute(
                        <Leaf className="h-3 w-3" />, 
                        "Enviro", 
                        item.attributes.environmentalImpact, 
                        item.attributes.environmentalImpact >= 0 ? "text-green-600" : "text-gray-500"
                      )}
                      {renderAttribute(
                        <Wind className="h-3 w-3" />, 
                        "Stress", 
                        item.attributes.stressReduction, 
                        "text-teal-600"
                      )}
                      {renderAttribute(
                        <BookOpen className="h-3 w-3" />, 
                        "Skills", 
                        item.attributes.skillDevelopment, 
                        "text-indigo-600"
                      )}
                    </div>
                    
                    {/* Special benefits */}
                    {renderBenefits(item.attributes.specialBenefits)}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {isItemOwned(item.id) ? (
                <Button variant="secondary" className="w-full" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  Owned
                </Button>
              ) : (
                <Button 
                  onClick={() => handlePurchase(item)} 
                  disabled={wealth < (item.price || item.attributes?.initialInvestment)}
                  className="w-full"
                >
                  {item.type === 'hobbies' ? 'Pursue' : 'Purchase'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="p-4 bg-background rounded-lg shadow-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="secondary" 
          onClick={() => navigate('/')}
          className="bg-white hover:bg-gray-100 text-black"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <ShoppingBag className="mr-2" />
        Lifestyle & Luxury
      </h2>
      
      <Tabs defaultValue="luxury" onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="owned">
            <Check className="h-4 w-4 mr-2" />
            My Items
          </TabsTrigger>
          <TabsTrigger value="luxury">
            <Watch className="h-4 w-4 mr-2" />
            Luxury Items
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            <Car className="h-4 w-4 mr-2" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="vacations">
            <Plane className="h-4 w-4 mr-2" />
            Vacations
          </TabsTrigger>
          <TabsTrigger value="experiences">
            <Sparkles className="h-4 w-4 mr-2" />
            Experiences
          </TabsTrigger>
          <TabsTrigger value="tech">
            <Smartphone className="h-4 w-4 mr-2" />
            Tech
          </TabsTrigger>
          <TabsTrigger value="fashion">
            <Shirt className="h-4 w-4 mr-2" />
            Fashion
          </TabsTrigger>
          <TabsTrigger value="tattoos">
            <Palette className="h-4 w-4 mr-2" />
            Tattoos
          </TabsTrigger>
          <TabsTrigger value="hobbies">
            <Briefcase className="h-4 w-4 mr-2" />
            Hobbies
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="owned">
          {ownedItems.length === 0 ? (
            <div className="text-center p-6">
              <div className="text-muted-foreground mb-2">
                <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
                <p>You don't own any lifestyle items yet.</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Browse the categories to purchase luxury items, vehicles, and more.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-secondary/10 border border-border rounded-md text-sm">
                <h3 className="font-medium mb-1">About Lifestyle Choices</h3>
                <p className="text-muted-foreground text-xs">
                  Your lifestyle items affect your character attributes. Removing items will reverse their effects on your stats.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {ownedItems.map(item => {
                  // Determine item type for styling with dark mode compatibility
                  const itemTypeColors = {
                    'luxury': 'border-amber-500/30 bg-amber-500/5',
                    'vehicles': 'border-blue-500/30 bg-blue-500/5',
                    'vacations': 'border-purple-500/30 bg-purple-500/5',
                    'experiences': 'border-pink-500/30 bg-pink-500/5',
                    'hobbies': 'border-green-500/30 bg-green-500/5'
                  };
                  
                  const colorClass = itemTypeColors[item.type as keyof typeof itemTypeColors] || 'border-border';
                  
                  return (
                    <Card key={item.id} className={`overflow-hidden ${colorClass}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-xs px-2 py-1 bg-secondary/20 rounded-full">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {/* Handle potentially undefined purchase price - now selling at 85% value */}
                          Resale value: {formatCurrency((item.purchasePrice || 0) * 0.85)}
                          {/* Only show maintenance if it exists and is greater than zero - always show as monthly now */}
                          {item.maintenanceCost && item.maintenanceCost > 0 && (
                            <span className="ml-2 text-amber-600">
                              +{formatCurrency(item.maintenanceCost)}/month
                            </span>
                          )}
                          
                          {/* Display duration information for time-limited items */}
                          {(item.type === 'vacations' || item.type === 'experiences') && item.endDate && (
                            <div className="mt-1 flex items-center text-xs">
                              <Clock className="h-3 w-3 mr-1 text-orange-500" />
                              {(() => {
                                // Use the game time instead of actual time for consistent countdown
                                const endDate = new Date(item.endDate);
                                // Use the current game date for calculating days remaining
                                const daysRemaining = Math.ceil(
                                  (endDate.getTime() - currentGameDate.getTime()) / (1000 * 3600 * 24)
                                );
                                
                                if (daysRemaining > 0) {
                                  return (
                                    <span className="text-orange-600">
                                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                                    </span>
                                  );
                                } else {
                                  return <span className="text-red-600">Expires soon</span>;
                                }
                              })()}
                            </div>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              <HeartPulse className="h-4 w-4 mr-1 text-pink-500" />
                              Happiness: +{formatInteger(item.happiness || 0)}
                            </span>
                            <span className="flex items-center">
                              <Award className="h-4 w-4 mr-1 text-purple-500" />
                              Prestige: +{formatInteger(item.prestige || 0)}
                            </span>
                          </div>
                          
                          {/* Attribute effects if any */}
                          {(item.timeCommitment || item.healthImpact || item.stressReduction || 
                            item.socialStatus || item.skillDevelopment || item.environmentalImpact) && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-1">Effects on your attributes:</p>
                              <div className="grid grid-cols-2 gap-1">
                                {item.timeCommitment && (
                                  <div className="text-xs flex items-center text-orange-600">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>Time: -{formatInteger(item.timeCommitment)}h</span>
                                  </div>
                                )}
                                {item.healthImpact && (
                                  <div className={`text-xs flex items-center ${item.healthImpact > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    <Heart className="h-3 w-3 mr-1" />
                                    <span>Health: {item.healthImpact > 0 ? '+' : ''}{formatInteger(item.healthImpact)}</span>
                                  </div>
                                )}
                                {item.stressReduction && (
                                  <div className="text-xs flex items-center text-teal-600">
                                    <Wind className="h-3 w-3 mr-1" />
                                    <span>Stress: -{formatInteger(item.stressReduction)}</span>
                                  </div>
                                )}
                                {item.socialStatus && (
                                  <div className="text-xs flex items-center text-blue-600">
                                    <Users className="h-3 w-3 mr-1" />
                                    <span>Social: {item.socialStatus > 0 ? '+' : ''}{formatInteger(item.socialStatus)}</span>
                                  </div>
                                )}
                                {item.skillDevelopment && (
                                  <div className="text-xs flex items-center text-indigo-600">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    <span>Skills: {item.skillDevelopment > 0 ? '+' : ''}{formatInteger(item.skillDevelopment)}</span>
                                  </div>
                                )}
                                {item.environmentalImpact && (
                                  <div className={`text-xs flex items-center ${item.environmentalImpact > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                    <Leaf className="h-3 w-3 mr-1" />
                                    <span>Enviro: {item.environmentalImpact > 0 ? '+' : ''}{formatInteger(item.environmentalImpact)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full text-green-600 hover:bg-green-500/10">
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Sell
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Sell {item.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Selling this item will give you {formatCurrency((item.purchasePrice || 0) * 0.85)} (85% of purchase price) and reverse its effects on your character attributes.
                              </AlertDialogDescription>
                              <div className="mt-3 mb-3 text-sm text-muted-foreground">
                                {item.type === 'hobbies' && item.timeCommitment !== undefined && (
                                  <div className="mt-2">You'll gain back {formatInteger(item.timeCommitment || 0)} hours of free time per week.</div>
                                )}
                                {item.healthImpact !== undefined && item.healthImpact !== 0 && (
                                  <div className="mt-1">Your health will {item.healthImpact > 0 ? 'decrease' : 'increase'} by {formatInteger(Math.abs(item.healthImpact))} points.</div>
                                )}
                                {item.stressReduction !== undefined && item.stressReduction !== 0 && (
                                  <div className="mt-1">Your stress will increase by {formatInteger(Math.abs(item.stressReduction))} points.</div>
                                )}
                                {item.socialStatus !== undefined && item.socialStatus !== 0 && (
                                  <div className="mt-1">Your social connections will {item.socialStatus > 0 ? 'decrease' : 'increase'} by {formatInteger(Math.abs(item.socialStatus))} points.</div>
                                )}
                                {item.skillDevelopment !== undefined && item.skillDevelopment !== 0 && (
                                  <div className="mt-1">Your skills will {item.skillDevelopment > 0 ? 'decrease' : 'increase'} by {formatInteger(Math.abs(item.skillDevelopment))} points.</div>
                                )}
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => {
                                // Calculate 85% of the purchase price as resale value
                                const resaleValue = (item.purchasePrice || 0) * 0.85;
                                // Add the resale value to the player's wealth
                                addWealth(resaleValue);
                                // Remove the item from the player's inventory
                                removeLifestyleItem(item.id);
                                toast.success(`Sold ${item.name} for ${formatCurrency(resaleValue)}`);
                                playSuccess();
                              }}>
                                Sell for {formatCurrency((item.purchasePrice || 0) * 0.85)}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="luxury">
          {renderItems(luxuryItems)}
        </TabsContent>
        
        <TabsContent value="vehicles">
          {renderItems(vehicles)}
        </TabsContent>
        
        <TabsContent value="vacations">
          {renderItems(vacations)}
        </TabsContent>
        
        <TabsContent value="experiences">
          {renderItems(experiences)}
        </TabsContent>
        
        <TabsContent value="tech">
          <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/30 rounded-md text-sm">
            <h3 className="font-medium mb-1">About Tech Products</h3>
            <p className="text-muted-foreground text-xs">
              Premium technology enhances productivity, entertainment, and quality of life. 
              These items may become outdated over time, so choose based on your needs and budget.
            </p>
          </div>
          {renderItems(techProducts)}
        </TabsContent>
        
        <TabsContent value="fashion">
          <div className="mb-4 p-3 bg-pink-500/5 border border-pink-500/30 rounded-md text-sm">
            <h3 className="font-medium mb-1">About Fashion Items</h3>
            <p className="text-muted-foreground text-xs">
              Fashion items boost social status and prestige while expressing your personal style.
              Trendy items may go out of style over time while luxury pieces maintain value longer.
            </p>
          </div>
          {renderItems(fashionItems)}
        </TabsContent>
        
        <TabsContent value="tattoos">
          <div className="mb-4 p-3 bg-purple-500/5 border border-purple-500/30 rounded-md text-sm">
            <h3 className="font-medium mb-1">About Tattoos</h3>
            <p className="text-muted-foreground text-xs">
              Tattoos are permanent body art that can represent personal meaning, style, and status.
              Consider carefully as these permanent modifications reflect your character's identity.
            </p>
          </div>
          {renderItems(tattoos)}
        </TabsContent>
        
        <TabsContent value="hobbies">
          <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/30 rounded-md text-sm">
            <h3 className="font-medium mb-1">About Hobbies</h3>
            <p className="text-muted-foreground text-xs">
              Hobbies represent long-term lifestyle choices requiring time investment and commitment. 
              They provide unique benefits beyond standard purchases, including skills development, 
              social connections, and special opportunities. Choose wisely based on your goals!
            </p>
          </div>
          
          {/* Render all hobbies without categories */}
          {renderItems(hobbies)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Lifestyle;
