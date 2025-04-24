import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../ui/tabs";
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { 
  Heart, 
  Trophy, 
  Clock, 
  Star, 
  Calendar, 
  DollarSign, 
  Drumstick, 
  Droplets, 
  Activity,
  Dumbbell,
  ShieldCheck,
  Award,
  Plus,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';
import { useCharacter } from '../../lib/stores/useCharacter';
import { HORSE_RACING_STORAGE_KEY } from '../../lib/utils/ownershipUtils';

interface Horse {
  id: string;
  name: string;
  breed: string;
  age: number;
  price: number;
  maintenance: number;
  speed: number;
  stamina: number;
  health: number;
  morale: number;
  training: number;
  nutrition: number;
  hydration: number;
  lastRaceDate?: string;
  lastRacePosition?: number;
  nextRaceDate?: string;
  earnings: number;
  image: string;
}

const horseBreeds = [
  {
    name: 'Thoroughbred',
    description: 'The most popular breed for horse racing, known for speed and agility.',
    price: 175000,
    stats: { speed: 85, stamina: 75, health: 70 }
  },
  {
    name: 'Arabian',
    description: 'Known for endurance and elegance, excels in longer races.',
    price: 150000,
    stats: { speed: 75, stamina: 90, health: 80 }
  },
  {
    name: 'Quarter Horse',
    description: 'Excels at sprinting short distances with incredible acceleration.',
    price: 120000,
    stats: { speed: 90, stamina: 65, health: 75 }
  },
  {
    name: 'Standardbred',
    description: 'Popular for harness racing, known for consistent performance.',
    price: 100000,
    stats: { speed: 70, stamina: 85, health: 85 }
  }
];

// Sample races
const upcomingRaces = [
  { id: 'r1', name: 'Golden Gate Derby', date: '6/15/2025', prestige: 4, prize: 250000, entryFee: 15000, distance: '1.5 miles' },
  { id: 'r2', name: 'Emerald Stakes', date: '6/22/2025', prestige: 3, prize: 175000, entryFee: 10000, distance: '1.25 miles' },
  { id: 'r3', name: 'Summer Classic', date: '7/4/2025', prestige: 5, prize: 500000, entryFee: 25000, distance: '2 miles' },
  { id: 'r4', name: 'Coastal Sprint', date: '7/12/2025', prestige: 2, prize: 100000, entryFee: 5000, distance: '0.75 miles' }
];

export function HorseRacingOwnership() {
  const { wealth, addWealth } = useCharacter();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [activeTab, setActiveTab] = useState('stable');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [horseName, setHorseName] = useState('');
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedHorseForRace, setSelectedHorseForRace] = useState<string | null>(null);
  const [showRaceRegistrationDialog, setShowRaceRegistrationDialog] = useState(false);

  // Define costs for horse care
  const TRAINING_COST = 2000;
  const FEEDING_COST = 500;
  const HYDRATION_COST = 300;
  const REST_COST = 1000;

  // Check if player already owns a horse of a specific breed
  const ownsBreed = (breed: string) => {
    return horses.some(horse => horse.breed === breed);
  };

  const purchaseHorse = (breed: string) => {
    // Find the selected breed
    const breedInfo = horseBreeds.find(b => b.name === breed);
    if (!breedInfo) return;
    
    // Check if player already owns this breed
    if (ownsBreed(breed)) {
      toast.error(`You already own a ${breed}. You can only own one of each breed.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Check if player can afford the horse
    if (wealth < breedInfo.price) {
      toast.error(`You don't have enough funds to purchase this horse.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Create the new horse
    const newHorse: Horse = {
      id: `horse_${Date.now()}`,
      name: horseName || `${breed} ${Math.floor(Math.random() * 1000)}`,
      breed: breed,
      age: 3, // Start with a 3-year-old horse
      price: breedInfo.price,
      maintenance: Math.round(breedInfo.price * 0.01), // Monthly maintenance cost
      speed: breedInfo.stats.speed,
      stamina: breedInfo.stats.stamina,
      health: breedInfo.stats.health,
      morale: 75,
      training: 50,
      nutrition: 70,
      hydration: 70,
      earnings: 0,
      image: `/horses/${breed.toLowerCase().replace(' ', '_')}.jpg` // Placeholder
    };
    
    // Update player wealth
    addWealth(-breedInfo.price);
    
    // Add horse to stable
    setHorses([...horses, newHorse]);
    
    // Show success message
    setSuccessMessage(`You have successfully purchased ${newHorse.name} for ${formatCurrency(breedInfo.price)}!`);
    setShowSuccessDialog(true);
    
    // Reset form
    setHorseName('');
    
    // Toast notification
    toast.success(`${newHorse.name} has been added to your stable!`, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    });
  };

  const trainHorse = (id: string) => {
    // Check if player can afford training
    if (wealth < TRAINING_COST) {
      toast.error(`Training costs ${formatCurrency(TRAINING_COST)}. You don't have enough funds.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Charge player
    addWealth(-TRAINING_COST);
    
    setHorses(currentHorses => 
      currentHorses.map(horse => {
        if (horse.id === id) {
          const updatedHorse = {
            ...horse,
            training: Math.min(100, horse.training + 5),
            speed: Math.min(100, horse.speed + 1),
            stamina: Math.min(100, horse.stamina + 1),
            morale: Math.max(50, horse.morale - 5), // Training reduces morale slightly
            hydration: Math.max(50, horse.hydration - 5) // Training reduces hydration
          };
          
          toast.success(`${horse.name} completed training! Speed +1, Stamina +1`, {
            icon: <Dumbbell className="h-5 w-5 text-amber-500" />
          });
          
          return updatedHorse;
        }
        return horse;
      })
    );
  };

  const restHorse = (id: string) => {
    // Check if player can afford rest
    if (wealth < REST_COST) {
      toast.error(`Rest and recovery costs ${formatCurrency(REST_COST)}. You don't have enough funds.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Charge player
    addWealth(-REST_COST);
    
    setHorses(currentHorses => 
      currentHorses.map(horse => {
        if (horse.id === id) {
          const updatedHorse = {
            ...horse,
            morale: Math.min(100, horse.morale + 10),
            health: Math.min(100, horse.health + 5)
          };
          
          toast.success(`${horse.name} is well-rested! Morale +10, Health +5`, {
            icon: <Clock className="h-5 w-5 text-blue-500" />
          });
          
          return updatedHorse;
        }
        return horse;
      })
    );
  };
  
  const feedHorse = (id: string) => {
    // Check if player can afford feeding
    if (wealth < FEEDING_COST) {
      toast.error(`Feeding costs ${formatCurrency(FEEDING_COST)}. You don't have enough funds.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Charge player
    addWealth(-FEEDING_COST);
    
    setHorses(currentHorses => 
      currentHorses.map(horse => {
        if (horse.id === id) {
          const updatedHorse = {
            ...horse,
            nutrition: Math.min(100, horse.nutrition + 15),
            health: Math.min(100, horse.health + 2),
            morale: Math.min(100, horse.morale + 3)
          };
          
          toast.success(`${horse.name} has been fed! Nutrition +15, Health +2, Morale +3`, {
            icon: <Drumstick className="h-5 w-5 text-orange-500" />
          });
          
          return updatedHorse;
        }
        return horse;
      })
    );
  };
  
  const hydrateHorse = (id: string) => {
    // Check if player can afford hydration
    if (wealth < HYDRATION_COST) {
      toast.error(`Hydration costs ${formatCurrency(HYDRATION_COST)}. You don't have enough funds.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Charge player
    addWealth(-HYDRATION_COST);
    
    setHorses(currentHorses => 
      currentHorses.map(horse => {
        if (horse.id === id) {
          const updatedHorse = {
            ...horse,
            hydration: Math.min(100, horse.hydration + 20)
          };
          
          toast.success(`${horse.name} has been hydrated! Hydration +20`, {
            icon: <Droplets className="h-5 w-5 text-blue-500" />
          });
          
          return updatedHorse;
        }
        return horse;
      })
    );
  };

  // Prepare race registration
  const prepareRaceRegistration = (horseId: string, raceId: string) => {
    const race = upcomingRaces.find(r => r.id === raceId);
    const horse = horses.find(h => h.id === horseId);
    
    if (!race || !horse) return;
    
    // Check if player can afford the entry fee
    if (wealth < race.entryFee) {
      toast.error(`The entry fee for ${race.name} is ${formatCurrency(race.entryFee)}. You don't have enough funds.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Check if horse is already registered for a race
    if (horse.nextRaceDate) {
      toast.error(`${horse.name} is already registered for a race on ${horse.nextRaceDate}.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Set selected race and horse for confirmation dialog
    setSelectedRace(raceId);
    setSelectedHorseForRace(horseId);
    setShowRaceRegistrationDialog(true);
  };

  // Register for a race after confirmation
  const registerForRace = () => {
    if (!selectedRace || !selectedHorseForRace) return;
    
    const race = upcomingRaces.find(r => r.id === selectedRace);
    const horse = horses.find(h => h.id === selectedHorseForRace);
    
    if (!race || !horse) return;
    
    // Charge entry fee
    addWealth(-race.entryFee);
    
    // Update horse with next race information
    setHorses(currentHorses => 
      currentHorses.map(h => {
        if (h.id === selectedHorseForRace) {
          return {
            ...h,
            nextRaceDate: race.date
          };
        }
        return h;
      })
    );
    
    // Close dialog
    setShowRaceRegistrationDialog(false);
    
    // Show success message
    toast.success(`${horse.name} has been registered for ${race.name} on ${race.date}!`, {
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      duration: 5000,
    });
  };

  // Save horses to localStorage whenever they change
  const saveHorses = (horsesToSave: Horse[]) => {
    try {
      localStorage.setItem(HORSE_RACING_STORAGE_KEY, JSON.stringify(horsesToSave));
      console.log('Horses saved to localStorage:', horsesToSave);
    } catch (error) {
      console.error('Error saving horses to localStorage:', error);
    }
  };

  // Load horses from localStorage on component mount
  useEffect(() => {
    try {
      const savedHorses = localStorage.getItem(HORSE_RACING_STORAGE_KEY);
      if (savedHorses) {
        setHorses(JSON.parse(savedHorses));
        console.log('Horses loaded from localStorage');
      }
    } catch (error) {
      console.error('Error loading horses from localStorage:', error);
    }
  }, []);
  
  // Save horses to localStorage whenever they change
  useEffect(() => {
    if (horses.length > 0) {
      saveHorses(horses);
    }
  }, [horses]);

  useEffect(() => {
    // Reset dialog flags when tab changes
    setShowSuccessDialog(false);
    setShowRaceRegistrationDialog(false);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Horse Racing</h2>
          <p className="text-muted-foreground">Purchase and manage racing horses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Available Funds:</div>
          <div className="font-bold text-lg">{formatCurrency(wealth)}</div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="stable">Your Stable</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Horse</TabsTrigger>
          <TabsTrigger value="races">Upcoming Races</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stable">
          {horses.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary/30">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Horses Yet</h3>
              <p className="text-muted-foreground mb-6">
                Your stable is empty. Purchase your first horse to begin your racing career.
              </p>
              <Button onClick={() => setActiveTab('purchase')}>
                Purchase Your First Horse
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {horses.map(horse => (
                <Card key={horse.id} className="border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{horse.name}</CardTitle>
                        <CardDescription>{horse.breed} · {horse.age} years old</CardDescription>
                      </div>
                      <Badge className="bg-primary/90">{formatCurrency(horse.maintenance)}/mo</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Activity className="h-4 w-4 mr-1 text-red-500" />
                              Speed
                            </span>
                            <span>{horse.speed}%</span>
                          </div>
                          <Progress value={horse.speed} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Dumbbell className="h-4 w-4 mr-1 text-amber-500" />
                              Stamina
                            </span>
                            <span>{horse.stamina}%</span>
                          </div>
                          <Progress value={horse.stamina} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <ShieldCheck className="h-4 w-4 mr-1 text-green-500" />
                              Health
                            </span>
                            <span>{horse.health}%</span>
                          </div>
                          <Progress value={horse.health} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1 text-pink-500" />
                              Morale
                            </span>
                            <span>{horse.morale}%</span>
                          </div>
                          <Progress value={horse.morale} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Drumstick className="h-4 w-4 mr-1 text-orange-500" />
                              Nutrition
                            </span>
                            <span>{horse.nutrition}%</span>
                          </div>
                          <Progress value={horse.nutrition} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                              Hydration
                            </span>
                            <span>{horse.hydration}%</span>
                          </div>
                          <Progress value={horse.hydration} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Price:</span>
                        <span className="font-semibold">{formatCurrency(horse.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Earnings:</span>
                        <span className="font-semibold">{formatCurrency(horse.earnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Race:</span>
                        <span className="font-semibold">{horse.lastRaceDate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Race:</span>
                        <span className="font-semibold">{horse.nextRaceDate || 'Not Scheduled'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-primary/10 text-xs text-muted-foreground mb-2">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <div className="flex items-center">
                          <Dumbbell className="h-3 w-3 mr-1" /> Training: {formatCurrency(TRAINING_COST)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> Rest: {formatCurrency(REST_COST)}
                        </div>
                        <div className="flex items-center">
                          <Drumstick className="h-3 w-3 mr-1" /> Feed: {formatCurrency(FEEDING_COST)}
                        </div>
                        <div className="flex items-center">
                          <Droplets className="h-3 w-3 mr-1" /> Hydrate: {formatCurrency(HYDRATION_COST)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => trainHorse(horse.id)}
                      variant="outline" 
                      size="sm"
                      className="flex-1 min-w-[120px]"
                      disabled={wealth < TRAINING_COST}
                    >
                      <Dumbbell className="h-4 w-4 mr-2" /> Train
                    </Button>
                    <Button 
                      onClick={() => restHorse(horse.id)}
                      variant="outline" 
                      size="sm"
                      className="flex-1 min-w-[120px]"
                      disabled={wealth < REST_COST}
                    >
                      <Clock className="h-4 w-4 mr-2" /> Rest
                    </Button>
                    <Button 
                      onClick={() => feedHorse(horse.id)}
                      variant="outline" 
                      size="sm"
                      className="flex-1 min-w-[120px]"
                      disabled={wealth < FEEDING_COST}
                    >
                      <Drumstick className="h-4 w-4 mr-2" /> Feed
                    </Button>
                    <Button 
                      onClick={() => hydrateHorse(horse.id)}
                      variant="outline" 
                      size="sm"
                      className="flex-1 min-w-[120px]"
                      disabled={wealth < HYDRATION_COST}
                    >
                      <Droplets className="h-4 w-4 mr-2" /> Hydrate
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="purchase">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Horse Breeds</h3>
            <p className="text-muted-foreground">
              Select a breed to purchase a new racing horse for your stable. You can own one horse of each breed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {horseBreeds.map(breed => {
              const alreadyOwned = ownsBreed(breed.name);
              return (
                <Card key={breed.name} className={`border-primary/30 ${alreadyOwned ? 'opacity-75' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{breed.name}</CardTitle>
                        <CardDescription>{breed.description}</CardDescription>
                      </div>
                      {alreadyOwned && (
                        <Badge className="bg-green-600">Owned</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Activity className="h-4 w-4 mr-1 text-red-500" />
                            Speed
                          </span>
                          <span>{breed.stats.speed}%</span>
                        </div>
                        <Progress value={breed.stats.speed} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Dumbbell className="h-4 w-4 mr-1 text-amber-500" />
                            Stamina
                          </span>
                          <span>{breed.stats.stamina}%</span>
                        </div>
                        <Progress value={breed.stats.stamina} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-1 text-green-500" />
                            Health
                          </span>
                          <span>{breed.stats.health}%</span>
                        </div>
                        <Progress value={breed.stats.health} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4 pt-3 border-t border-primary/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Purchase Price:</span>
                        <span className="font-semibold">{formatCurrency(breed.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Maintenance:</span>
                        <span className="font-semibold">{formatCurrency(Math.round(breed.price * 0.01))}</span>
                      </div>
                    </div>
                    
                    {!alreadyOwned && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-1 mb-2">
                          <label htmlFor={`horse-name-${breed.name}`} className="text-sm">
                            Name your horse (optional):
                          </label>
                        </div>
                        <input 
                          type="text"
                          id={`horse-name-${breed.name}`}
                          className="w-full p-2 text-sm rounded-md border border-primary/30 mb-2 bg-background"
                          placeholder={`${breed.name} Runner`}
                          onChange={(e) => setHorseName(e.target.value)}
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => purchaseHorse(breed.name)}
                      className="w-full"
                      disabled={wealth < breed.price || alreadyOwned}
                    >
                      {alreadyOwned ? 'Already Owned' : 
                       wealth < breed.price ? 'Insufficient Funds' : 
                       'Purchase'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="races">
          {horses.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary/30">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Horses in Your Stable</h3>
              <p className="text-muted-foreground mb-6">
                You need to purchase a horse before you can enter races.
              </p>
              <Button onClick={() => setActiveTab('purchase')}>
                Purchase Your First Horse
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Upcoming Race Calendar</h3>
                <p className="text-muted-foreground mb-6">
                  Register your horses for upcoming races to earn prize money and build their reputation.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingRaces.map(race => (
                    <Card key={race.id} className="border-primary/30">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{race.name}</CardTitle>
                            <CardDescription className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {race.date} • {race.distance}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            {Array(race.prestige).fill(0).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ))}
                            {Array(5 - race.prestige).fill(0).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-gray-300" />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prize Pool:</span>
                            <span className="font-semibold">{formatCurrency(race.prize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Entry Fee:</span>
                            <span className="font-semibold">{formatCurrency(race.entryFee)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Distance:</span>
                            <span className="font-semibold">{race.distance}</span>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div>
                          <div className="text-sm font-medium mb-3 flex items-center">
                            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                            Register Your Horses:
                          </div>
                          
                          <div className="space-y-3">
                            {horses.map(horse => {
                              const isRegistered = horse.nextRaceDate === race.date;
                              const isRegisteredForOther = horse.nextRaceDate && horse.nextRaceDate !== race.date;
                              
                              return (
                                <div 
                                  key={horse.id} 
                                  className={`flex justify-between items-center py-3 px-4 rounded-md
                                    ${isRegistered ? 'bg-green-500/10 border border-green-500/30' : 
                                     isRegisteredForOther ? 'bg-amber-500/10 border border-amber-500/30' : 
                                     'bg-muted/50'}`}
                                >
                                  <div>
                                    <div className="font-medium">{horse.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Speed: {horse.speed}% • Stamina: {horse.stamina}%
                                    </div>
                                  </div>
                                  
                                  {isRegistered ? (
                                    <Badge className="bg-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Registered
                                    </Badge>
                                  ) : isRegisteredForOther ? (
                                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                                      <Info className="h-3 w-3 mr-1" />
                                      Racing on {horse.nextRaceDate}
                                    </Badge>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      onClick={() => prepareRaceRegistration(horse.id, race.id)}
                                      disabled={wealth < race.entryFee}
                                    >
                                      Register for {formatCurrency(race.entryFee)}
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {horses.some(h => h.lastRacePosition !== undefined) && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Past Results</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {horses.filter(h => h.lastRacePosition !== undefined).map(horse => (
                      <Card key={horse.id + "_result"} className="border-primary/30">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-semibold">{horse.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                {horse.lastRaceDate}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {horse.lastRacePosition === 1 ? '🥇' : 
                                 horse.lastRacePosition === 2 ? '🥈' : 
                                 horse.lastRacePosition === 3 ? '🥉' : 
                                 `#${horse.lastRacePosition}`}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {horse.lastRacePosition === 1 ? 'Winner' : 
                                 horse.lastRacePosition === 2 ? 'Second Place' : 
                                 horse.lastRacePosition === 3 ? 'Third Place' : 
                                 'Finished'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Purchase Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              Purchase Successful!
            </AlertDialogTitle>
            <AlertDialogDescription>
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Race Registration Confirmation Dialog */}
      <AlertDialog open={showRaceRegistrationDialog} onOpenChange={setShowRaceRegistrationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              Confirm Race Registration
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRace && selectedHorseForRace && (
                <>
                  <p className="mb-2">
                    You are about to register{' '}
                    <span className="font-semibold">
                      {horses.find(h => h.id === selectedHorseForRace)?.name}
                    </span>{' '}
                    for the{' '}
                    <span className="font-semibold">
                      {upcomingRaces.find(r => r.id === selectedRace)?.name}
                    </span>.
                  </p>
                  <p className="mb-2">
                    The entry fee is{' '}
                    <span className="font-semibold">
                      {formatCurrency(upcomingRaces.find(r => r.id === selectedRace)?.entryFee || 0)}
                    </span>
                    , which will be deducted from your funds.
                  </p>
                  <p>Do you want to proceed with the registration?</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRaceRegistrationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={registerForRace}>
              Confirm Registration
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}