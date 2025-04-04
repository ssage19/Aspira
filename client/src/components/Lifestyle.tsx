import { useState } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { useAudio } from '../lib/stores/useAudio';
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
import { toast } from 'sonner';
import { 
  ShoppingBag, 
  Car, 
  Plane, 
  Watch, 
  Home, 
  HeartPulse,
  Check,
  X
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { 
  luxuryItems, 
  vehicles, 
  vacations,
  experiences 
} from '../lib/data/lifestyleItems';

export function Lifestyle() {
  const { wealth, addWealth, addLifestyleItem, lifestyleItems: ownedItems } = useCharacter();
  const { playSuccess, playHit } = useAudio();
  const [activeTab, setActiveTab] = useState('luxury');
  
  const handlePurchase = (item: any) => {
    if (wealth < item.price) {
      toast.error("Not enough funds to purchase this item");
      playHit();
      return;
    }
    
    // Check if item is already owned (for unique items)
    if (item.unique && ownedItems.some(owned => owned.id === item.id)) {
      toast.error("You already own this item");
      return;
    }
    
    // Process purchase
    addWealth(-item.price);
    addLifestyleItem({
      id: item.id,
      name: item.name,
      type: activeTab,
      purchasePrice: item.price,
      maintenanceCost: item.maintenanceCost || 0,
      happiness: item.happiness || 10,
      prestige: item.prestige || 5
    });
    
    playSuccess();
    toast.success(`Purchased ${item.name}`);
  };
  
  const isItemOwned = (id: string) => {
    return ownedItems.some(item => item.id === id);
  };
  
  const renderItems = (items: any[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>
                Price: {formatCurrency(item.price)}
                {item.maintenanceCost > 0 && (
                  <span className="ml-2 text-amber-600">
                    +{formatCurrency(item.maintenanceCost)}/day
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-20 flex flex-col justify-between">
                <p className="text-sm line-clamp-2">{item.description}</p>
                <div className="flex justify-between text-sm mt-2">
                  <span className="flex items-center">
                    <HeartPulse className="h-4 w-4 mr-1 text-pink-500" />
                    Happiness: +{item.happiness}
                  </span>
                  <span>Prestige: +{item.prestige}</span>
                </div>
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
                  disabled={wealth < item.price}
                  className="w-full"
                >
                  Purchase
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <ShoppingBag className="mr-2" />
        Lifestyle & Luxury
      </h2>
      
      <Tabs defaultValue="luxury" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
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
            <Home className="h-4 w-4 mr-2" />
            Experiences
          </TabsTrigger>
        </TabsList>
        
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
      </Tabs>
    </div>
  );
}

export default Lifestyle;
