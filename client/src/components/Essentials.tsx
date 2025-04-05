import { useState } from "react";
import { useCharacter } from "../lib/stores/useCharacter";
import { useAudio } from "../lib/stores/useAudio";
import { useTime } from "../lib/stores/useTime";
import { toast } from "sonner";
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
  
  // Function to handle consuming essential items
  const handleConsumeEssential = (item: EssentialItem) => {
    // Check if user has enough money
    if (item.price > wealth) {
      toast.error("Not enough funds available");
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
      addStress(-effects.stress); // Negative because stress reduction is positive in data
    }
    
    if (effects.socialConnections) {
      updateSocialConnections(effects.socialConnections);
    }
    
    // Advance time if applicable
    if (item.timeRequired && item.timeRequired > 0) {
      // Since advanceTime() advances by one day, we'll advance based on the time required
      // For example, if an activity takes 2 hours, that's 1/12 of a day, so we'll advance less often
      // For now, just advance by one day as a placeholder, will need to refine this
      advanceTime();
      
      toast.info(`Time passed: ${item.timeRequired} ${item.timeRequired === 1 ? 'hour' : 'hours'}`);
    }
    
    // Play sound
    playSound('success');
    
    // Show toast message
    toast.success(`${item.type === 'food' || item.type === 'drink' ? 'Consumed' : 'Completed'}: ${item.name}`);
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
                {renderEffectItem(item.effects.stress && -item.effects.stress, "Stress", <Brain className="h-3 w-3 text-teal-500" />)}
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
  
  return (
    <div className="mb-8">
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-blue-800 font-medium mb-2">Basic Needs Management</h3>
        <p className="text-blue-700 text-sm">
          Taking care of your basic needs improves your character's health, energy levels, and overall well-being.
          Low levels of food, water, rest, or social interaction will negatively impact your health over time.
        </p>
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