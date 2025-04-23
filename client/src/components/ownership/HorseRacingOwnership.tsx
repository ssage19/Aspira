import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { formatCurrency } from '../../lib/utils';
import { useCharacter } from '../../lib/stores/useCharacter';

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
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [horseName, setHorseName] = useState('');

  const purchaseHorse = (breed: string) => {
    // Find the selected breed
    const breedInfo = horseBreeds.find(b => b.name === breed);
    if (!breedInfo) return;
    
    // Check if player can afford the horse
    if (wealth < breedInfo.price) {
      alert("You don't have enough funds to purchase this horse.");
      return;
    }
    
    // Create the new horse
    const newHorse: Horse = {
      id: `horse_${Date.now()}`,
      name: horseName || `${breed} ${horses.length + 1}`,
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
    
    // Close dialog and reset form
    setPurchaseDialogOpen(false);
    setSelectedBreed(null);
    setHorseName('');
  };

  const trainHorse = (id: string) => {
    setHorses(currentHorses => 
      currentHorses.map(horse => {
        if (horse.id === id) {
          return {
            ...horse,
            training: Math.min(100, horse.training + 5),
            speed: Math.min(100, horse.speed + 1),
            stamina: Math.min(100, horse.stamina + 1),
            morale: Math.max(50, horse.morale - 5), // Training reduces morale slightly
            hydration: Math.max(50, horse.hydration - 5) // Training reduces hydration
          };
        }
        return horse;
      })
    );
  };

  const restHorse = (id: string) => {
    setHorses(currentHorses => 
      currentHorses.map(horse => {
        if (horse.id === id) {
          return {
            ...horse,
            morale: Math.min(100, horse.morale + 10),
            health: Math.min(100, horse.health + 5)
          };
        }
        return horse;
      })
    );
  };
  
  const feedHorse = (id: string) => {
    setHorses(currentHorses => 
      currentHorses.map(horse => {
        if (horse.id === id) {
          return {
            ...horse,
            nutrition: Math.min(100, horse.nutrition + 15),
            health: Math.min(100, horse.health + 2),
            morale: Math.min(100, horse.morale + 3)
          };
        }
        return horse;
      })
    );
  };
  
  const hydrateHorse = (id: string) => {
    setHorses(currentHorses => 
      currentHorses.map(horse => {
        if (horse.id === id) {
          return {
            ...horse,
            hydration: Math.min(100, horse.hydration + 20)
          };
        }
        return horse;
      })
    );
  };

  // Register for a race
  const registerForRace = (horseId: string, raceId: string) => {
    const race = upcomingRaces.find(r => r.id === raceId);
    const horse = horses.find(h => h.id === horseId);
    
    if (!race || !horse) return;
    
    // Check if player can afford the entry fee
    if (wealth < race.entryFee) {
      alert("You don't have enough funds for the entry fee.");
      return;
    }
    
    // Charge entry fee
    addWealth(-race.entryFee);
    
    // Update horse with next race information
    setHorses(currentHorses => 
      currentHorses.map(h => {
        if (h.id === horseId) {
          return {
            ...h,
            nextRaceDate: race.date
          };
        }
        return h;
      })
    );
  };

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
                    
                    {/* Race information */}
                    <div className="bg-muted/30 rounded-md p-4 mt-4 space-y-2">
                      <h4 className="font-semibold flex items-center mb-2">
                        <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                        Racing Record
                      </h4>
                      
                      {horse.lastRaceDate ? (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Race:</span>
                            <span>{horse.lastRaceDate} (Position: {horse.lastRacePosition})</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No previous races</div>
                      )}
                      
                      {horse.nextRaceDate ? (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Race:</span>
                            <span className="font-medium">{horse.nextRaceDate}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="text-muted-foreground">No upcoming races scheduled</span>
                        </div>
                      )}
                      
                      <div className="text-sm flex justify-between pt-1">
                        <span className="text-muted-foreground">Career Earnings:</span>
                        <span className="font-medium">{formatCurrency(horse.earnings)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button size="sm" onClick={() => trainHorse(horse.id)}>
                        <Dumbbell className="h-4 w-4 mr-1" />
                        Train
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => restHorse(horse.id)}>
                        <Clock className="h-4 w-4 mr-1" />
                        Rest
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => feedHorse(horse.id)}>
                        <Drumstick className="h-4 w-4 mr-1" />
                        Feed
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => hydrateHorse(horse.id)}>
                        <Droplets className="h-4 w-4 mr-1" />
                        Hydrate
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="purchase">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Purchase a Racing Horse</h3>
            <p className="text-muted-foreground">
              Select from premium racing breeds. Each horse requires monthly maintenance and care.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {horseBreeds.map((breed) => (
                <Card key={breed.name} className="border-primary/30 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{breed.name}</CardTitle>
                    <CardDescription>{breed.description}</CardDescription>
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
                    
                    <div className="text-sm space-y-1 bg-muted/30 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Price:</span>
                        <span className="font-medium">{formatCurrency(breed.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Maintenance:</span>
                        <span className="font-medium">{formatCurrency(Math.round(breed.price * 0.01))}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedBreed(breed.name);
                        setHorseName('');
                        purchaseHorse(breed.name);
                      }}
                      disabled={wealth < breed.price}
                    >
                      {wealth < breed.price ? 'Insufficient Funds' : `Purchase (${formatCurrency(breed.price)})`}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="races">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Upcoming Races</h3>
            <p className="text-muted-foreground mb-6">
              Register your horses for upcoming races to earn prestige and prize money.
            </p>
            
            <div className="space-y-4">
              {upcomingRaces.map(race => (
                <Card key={race.id} className="border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{race.name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {race.date} · {race.distance}
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        {Array(race.prestige).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                        {Array(5 - race.prestige).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500/30" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-muted/30 p-3 rounded-md space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prize Pool:</span>
                          <span className="font-medium">{formatCurrency(race.prize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry Fee:</span>
                          <span className="font-medium">{formatCurrency(race.entryFee)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        {horses.length > 0 ? (
                          <select 
                            className="w-full p-2 rounded-md border border-input bg-background"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                registerForRace(e.target.value, race.id);
                              }
                            }}
                          >
                            <option value="" disabled>Select a horse</option>
                            {horses.map(horse => (
                              <option 
                                key={horse.id} 
                                value={horse.id}
                                disabled={!!horse.nextRaceDate}
                              >
                                {horse.name} {horse.nextRaceDate ? '(Already registered)' : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-center text-muted-foreground">
                            Purchase a horse to register for races
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}