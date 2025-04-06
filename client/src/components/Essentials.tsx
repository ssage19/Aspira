import { useState, useEffect } from "react";
import { useCharacter } from "../lib/stores/useCharacter";
import { useAudio } from "../lib/stores/useAudio";
import { useTime } from "../lib/stores/useTime";
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
  Progress 
} from "./ui/progress";
import { 
  Coffee,
  Droplets,
  Utensils,
  Battery,
  Dumbbell, 
  Heart,
  Brain,
  Users,
  BedDouble,
  AlertCircle,
  Wine,
  Clock,
  Apple
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { 
  EssentialItem, 
  foodItems, 
  drinkItems, 
  exerciseActivities, 
  restActivities, 
  socialActivities 
} from "../lib/data/essentials";
import { Alert, AlertDescription } from "./ui/alert";

export function Essentials() {
  const { 
    wealth, 
    addWealth, 
    hunger, 
    thirst, 
    energy, 
    health, 
    stress,
    socialConnections,
    updateHunger,
    updateThirst,
    updateEnergy,
    addHealth,
    addStress,
    updateSocialConnections
  } = useCharacter();
  
  const { playSound } = useAudio();
  const { advanceTime } = useTime();
  const [activeTab, setActiveTab] = useState('food');
  // Default to auto-maintenance being ON for better user experience
  const [autoMaintain, setAutoMaintain] = useState<boolean>(() => {
    const savedPreference = localStorage.getItem('auto-maintain-needs');
    // If user has a saved preference, use that; otherwise default to true
    return savedPreference === null ? true : savedPreference === 'true';
  });
  
  // Function to handle consuming essential items
  const handleConsumeEssential = (item: EssentialItem) => {
    // Check if user has enough money
    if (item.price > wealth) {
      // Just play a sound for insufficient funds, no message
      playSound('hit');
      return;
    }
    
    // Deduct cost
    if (item.price > 0) {
      addWealth(-item.price);
    }
    
    // Apply the effects
    const effects = item.effects;
    
    if (effects.hunger) {
      updateHunger(effects.hunger);
    }
    
    if (effects.thirst) {
      updateThirst(effects.thirst);
    }
    
    if (effects.energy) {
      updateEnergy(effects.energy);
    }
    
    if (effects.health) {
      addHealth(effects.health);
    }
    
    if (effects.stress) {
      // Apply stress effect directly - in our data:
      // negative value = stress reduction, positive value = stress increase
      addStress(effects.stress);
    }
    
    if (effects.socialConnections) {
      updateSocialConnections(effects.socialConnections);
    }
    
    // Advance time if applicable
    if (item.timeRequired && item.timeRequired > 0) {
      // Since advanceTime() advances by one day, we'll advance based on the time required
      // For example, if an activity takes 2 hours, that's 1/12 of a day, so we'll advance less often
      advanceTime();
      
      // No toast notification for time passage
    }
    
    // Play sound
    playSound('success');
    
    // No toast message for completion to avoid annoying players
  };
  
  // Render needs status bars
  const renderNeedsStatusBars = () => {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Utensils className="h-4 w-4 mr-2 text-orange-500" />
              Hunger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Starving</span>
                <span className="font-medium">{hunger}%</span>
                <span className="text-muted-foreground">Full</span>
              </div>
              <Progress 
                value={hunger} 
                className={`h-2 ${
                  hunger < 20 ? "bg-red-500/20" : 
                  hunger < 50 ? "bg-yellow-500/20" : 
                  "bg-green-500/20"
                }`}
              />
              {hunger < 20 && (
                <Alert variant="destructive" className="py-2 mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <AlertDescription className="text-xs">
                    You need to eat something soon!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Droplets className="h-4 w-4 mr-2 text-blue-500" />
              Thirst
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dehydrated</span>
                <span className="font-medium">{thirst}%</span>
                <span className="text-muted-foreground">Hydrated</span>
              </div>
              <Progress 
                value={thirst} 
                className={`h-2 ${
                  thirst < 20 ? "bg-red-500/20" : 
                  thirst < 50 ? "bg-yellow-500/20" : 
                  "bg-blue-500/20"
                }`}
              />
              {thirst < 20 && (
                <Alert variant="destructive" className="py-2 mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <AlertDescription className="text-xs">
                    You're dehydrated, drink something!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Battery className="h-4 w-4 mr-2 text-green-500" />
              Energy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exhausted</span>
                <span className="font-medium">{energy}%</span>
                <span className="text-muted-foreground">Energetic</span>
              </div>
              <Progress 
                value={energy} 
                className={`h-2 ${
                  energy < 20 ? "bg-red-500/20" : 
                  energy < 50 ? "bg-yellow-500/20" : 
                  "bg-green-500/20"
                }`}
              />
              {energy < 20 && (
                <Alert variant="destructive" className="py-2 mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <AlertDescription className="text-xs">
                    You need to rest soon!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Users className="h-4 w-4 mr-2 text-violet-500" />
              Social
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Isolated</span>
                <span className="font-medium">{socialConnections}%</span>
                <span className="text-muted-foreground">Connected</span>
              </div>
              <Progress 
                value={socialConnections} 
                className={`h-2 ${
                  socialConnections < 20 ? "bg-red-500/20" : 
                  socialConnections < 50 ? "bg-yellow-500/20" : 
                  "bg-violet-500/20"
                }`}
              />
              {socialConnections < 20 && (
                <Alert variant="destructive" className="py-2 mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <AlertDescription className="text-xs">
                    You should socialize more!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render essential items
  const renderEssentialItems = (items: EssentialItem[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id} className="overflow-hidden h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center justify-between">
                <div className="flex items-center">
                  {getItemIcon(item.type)}
                  <span className="ml-2">{item.name}</span>
                </div>
                {item.timeRequired && (
                  <div className="text-xs flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.timeRequired}h
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {item.price > 0 ? (
                  <>Price: {formatCurrency(item.price)}</>
                ) : (
                  <>Free</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              
              <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
                {renderEffectItem(item.effects.hunger, "Hunger", <Utensils className="h-3 w-3 text-orange-500" />)}
                {renderEffectItem(item.effects.thirst, "Thirst", <Droplets className="h-3 w-3 text-blue-500" />)}
                {renderEffectItem(item.effects.energy, "Energy", <Battery className="h-3 w-3 text-green-500" />)}
                {renderEffectItem(item.effects.health, "Health", <Heart className="h-3 w-3 text-red-500" />)}
                {renderEffectItem(item.effects.stress, "Stress", <Brain className="h-3 w-3 text-teal-500" />)}
                {renderEffectItem(item.effects.socialConnections, "Social", <Users className="h-3 w-3 text-violet-500" />)}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                onClick={() => handleConsumeEssential(item)}
                disabled={item.price > wealth}
                className="w-full"
                variant="default"
                size="sm"
              >
                {getActionText(item.type)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  // Helper function to render effect item
  const renderEffectItem = (value: number | undefined, label: string, icon: React.ReactNode) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center gap-1">
        {icon}
        <span>{label}: {value > 0 ? '+' : ''}{value}</span>
      </div>
    );
  };
  
  // Helper function to get icon for item type
  const getItemIcon = (type: EssentialItem['type']) => {
    switch (type) {
      case 'food':
        return <Utensils className="h-4 w-4 text-orange-500" />;
      case 'drink':
        return <Wine className="h-4 w-4 text-blue-500" />;
      case 'exercise':
        return <Dumbbell className="h-4 w-4 text-green-500" />;
      case 'rest':
        return <BedDouble className="h-4 w-4 text-indigo-500" />;
      case 'social':
        return <Users className="h-4 w-4 text-violet-500" />;
      default:
        return <Utensils className="h-4 w-4" />;
    }
  };
  
  // Helper function to get action text for buttons
  const getActionText = (type: EssentialItem['type']) => {
    switch (type) {
      case 'food':
        return 'Eat';
      case 'drink':
        return 'Drink';
      case 'exercise':
        return 'Exercise';
      case 'rest':
        return 'Rest';
      case 'social':
        return 'Socialize';
      default:
        return 'Use';
    }
  };
  
  // Function to find the most cost-effective item for a specific need
  const findBestItemForNeed = (
    needType: 'hunger' | 'thirst' | 'energy' | 'socialConnections' | 'stress',
    itemList: EssentialItem[]
  ): EssentialItem | null => {
    // Filter items that restore the specific need and are affordable
    const validItems = itemList.filter(item => 
      item.effects[needType] && 
      // For stress, we want negative values (stress reduction)
      (needType === 'stress' ? 
        item.effects[needType]! < 0 : 
        item.effects[needType]! > 0) && 
      item.price <= wealth
    );
    
    if (validItems.length === 0) return null;
    
    // Find the most cost-effective item (highest effect per dollar)
    return validItems.reduce((best, current) => {
      // For stress, we want the most negative value (more stress reduction)
      const bestValue = needType === 'stress' ? 
        Math.abs(best.effects[needType]!) : 
        best.effects[needType]!;
        
      const currentValue = needType === 'stress' ? 
        Math.abs(current.effects[needType]!) : 
        current.effects[needType]!;
      
      const bestEfficiency = bestValue / Math.max(1, best.price);
      const currentEfficiency = currentValue / Math.max(1, current.price);
      
      return currentEfficiency > bestEfficiency ? current : best;
    }, validItems[0]);
  };
  
  // Function to auto-consume essentials when needs get low
  const handleAutoMaintenance = () => {
    if (!autoMaintain) return;
    
    // Get the most up-to-date state values directly from the store
    const {
      hunger: currentHunger,
      thirst: currentThirst,
      energy: currentEnergy,
      socialConnections: currentSocial,
      stress: currentStress,
      wealth: currentWealth
    } = useCharacter.getState();
    
    // Track if any actions were taken
    let actionsTaken = 0;
    const maxActionsPerCycle = 12; // Maintain the increased action limit per cycle
    
    // Check and address all needs in order of priority
    
    // First check the most critical needs: hunger and thirst
    // Check hunger level - maintain threshold at 70%
    if (currentHunger <= 70 && actionsTaken < maxActionsPerCycle) {
      const bestFood = findBestItemForNeed('hunger', foodItems);
      if (bestFood && bestFood.price <= currentWealth) {
        handleConsumeEssential(bestFood);
        actionsTaken++;
      }
    }
    
    // Check thirst level - maintain threshold at 70%
    if (currentThirst <= 70 && actionsTaken < maxActionsPerCycle) {
      const bestDrink = findBestItemForNeed('thirst', drinkItems);
      if (bestDrink && bestDrink.price <= currentWealth) {
        handleConsumeEssential(bestDrink);
        actionsTaken++;
      }
    }
    
    // Check energy level - maintain threshold at 70%
    if (currentEnergy <= 70 && actionsTaken < maxActionsPerCycle) {
      const bestRest = findBestItemForNeed('energy', restActivities);
      if (bestRest && bestRest.price <= currentWealth) {
        handleConsumeEssential(bestRest);
        actionsTaken++;
      }
    }
    
    // Check social connections level - maintain threshold at 70%
    if (currentSocial <= 70 && actionsTaken < maxActionsPerCycle) {
      const bestSocial = findBestItemForNeed('socialConnections', socialActivities);
      if (bestSocial && bestSocial.price <= currentWealth) {
        handleConsumeEssential(bestSocial);
        actionsTaken++;
      }
    }
    
    // Check stress level - manage when it gets high (above 50%)
    if (currentStress >= 50 && actionsTaken < maxActionsPerCycle) {
      // Look for stress reduction in different activities
      let bestStressReliever = findBestItemForNeed('stress', restActivities);
      
      // If no suitable rest activity found, check exercise activities
      if (!bestStressReliever) {
        bestStressReliever = findBestItemForNeed('stress', exerciseActivities);
      }
      
      // If still no suitable activity found, check social activities
      if (!bestStressReliever) {
        bestStressReliever = findBestItemForNeed('stress', socialActivities);
      }
      
      // As a last resort, check food items that might reduce stress
      if (!bestStressReliever) {
        bestStressReliever = findBestItemForNeed('stress', foodItems);
      }
      
      if (bestStressReliever && bestStressReliever.price <= currentWealth) {
        handleConsumeEssential(bestStressReliever);
        actionsTaken++;
      }
    }
    
    // If any actions were taken, only log to console for debugging
    if (actionsTaken > 0) {
      // Log to console for debugging, but don't show any user notifications
      console.log(`Auto-maintenance addressed ${actionsTaken} needs`);
    }
  };
  
  // Toggle auto-maintenance
  const toggleAutoMaintain = () => {
    const newValue = !autoMaintain;
    setAutoMaintain(newValue);
    localStorage.setItem('auto-maintain-needs', newValue.toString());
    // No toast notifications to avoid annoying the player
  };
  
  // Run auto-maintenance check once when component mounts
  useEffect(() => {
    // If auto-maintain is enabled, run a check immediately
    if (autoMaintain) {
      handleAutoMaintenance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Force component to update regularly to reflect state changes
  const [_, forceUpdate] = useState({});
  
  // Always refresh the component state every 100ms for UI updates and run auto-maintenance
  useEffect(() => {
    // Set up two different intervals:
    // 1. For auto-maintenance (only runs when enabled)
    // 2. For state refresh (always runs)
    
    // Auto-maintenance interval - only active when enabled
    let autoMaintainInterval: NodeJS.Timeout | null = null;
    if (autoMaintain) {
      // Run the auto-maintenance function on a timer (every 1 second)
      autoMaintainInterval = setInterval(() => {
        // Get the latest state values directly from the store
        const currentState = useCharacter.getState();
        
        // Only run auto-maintenance if we need to maintain something
        // This helps avoid unnecessary actions when all needs are met
        if (currentState.hunger <= 70 || currentState.thirst <= 70 || 
            currentState.energy <= 70 || currentState.socialConnections <= 70 || 
            currentState.stress >= 50) {
          handleAutoMaintenance();
        }
      }, 1000);
    }
    
    // State refresh interval - always active to ensure UI stays updated
    // This ensures values are consistent with other components like Dashboard
    const stateRefreshInterval = setInterval(() => {
      // Using getState() to force a refresh of state
      const currentState = useCharacter.getState();
      // Force component to rerender by updating state
      // This is needed to ensure the component updates when values increase
      forceUpdate({});
    }, 100); // Even more frequent updates (100ms instead of 250ms) for smoother UI
    
    // Subscribe to state changes directly
    const unsubscribe = useCharacter.subscribe(
      // Include the lastUpdated field in the subscription
      (state) => [state.hunger, state.thirst, state.energy, state.comfort, state.lastUpdated],
      () => {
        // Force an immediate update whenever any basic need changes
        forceUpdate({});
      }
    );
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (autoMaintainInterval) clearInterval(autoMaintainInterval);
      clearInterval(stateRefreshInterval);
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMaintain]);
  
  return (
    <div className="mb-8">
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-blue-800 font-medium mb-2">Basic Needs Management</h3>
        <p className="text-blue-700 text-sm">
          Taking care of your basic needs improves your character's health, energy levels, and overall well-being.
          Low levels of food, water, rest, or social interaction will negatively impact your health over time.
        </p>
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm text-blue-700 mr-2">Auto-maintain needs:</span>
            <Button 
              variant={autoMaintain ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoMaintain}
              className={autoMaintain ? 
                "bg-green-500 hover:bg-green-600" : 
                "border-gray-400 text-gray-600"}
            >
              {autoMaintain ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <p className="text-xs text-blue-600 italic">
            {autoMaintain ? 
              "Needs will be automatically maintained when they drop below 70%, and stress will be managed when above 50% (checks every second)" : 
              "You need to manually maintain your needs"}
          </p>
        </div>
      </div>
      
      {renderNeedsStatusBars()}
      
      <Tabs defaultValue="food" onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4 grid grid-cols-5 max-w-md mx-auto">
          <TabsTrigger value="food">
            <Utensils className="h-4 w-4 mr-2" />
            Food
          </TabsTrigger>
          <TabsTrigger value="drink">
            <Coffee className="h-4 w-4 mr-2" />
            Drinks
          </TabsTrigger>
          <TabsTrigger value="exercise">
            <Dumbbell className="h-4 w-4 mr-2" />
            Exercise
          </TabsTrigger>
          <TabsTrigger value="rest">
            <BedDouble className="h-4 w-4 mr-2" />
            Rest
          </TabsTrigger>
          <TabsTrigger value="social">
            <Users className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="food">
          {renderEssentialItems(foodItems)}
        </TabsContent>
        
        <TabsContent value="drink">
          {renderEssentialItems(drinkItems)}
        </TabsContent>
        
        <TabsContent value="exercise">
          {renderEssentialItems(exerciseActivities)}
        </TabsContent>
        
        <TabsContent value="rest">
          {renderEssentialItems(restActivities)}
        </TabsContent>
        
        <TabsContent value="social">
          {renderEssentialItems(socialActivities)}
        </TabsContent>
      </Tabs>
    </div>
  );
}