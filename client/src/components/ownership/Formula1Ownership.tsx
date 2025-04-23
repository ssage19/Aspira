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
  TrendingUp, 
  Trophy, 
  Settings, 
  Users, 
  Calendar, 
  DollarSign, 
  Zap, 
  Wrench, 
  Flag,
  Gauge,
  Landmark,
  BarChart4,
  Award
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useCharacter } from '../../lib/stores/useCharacter';

interface F1Team {
  id: string;
  name: string;
  purchasePrice: number;
  operatingCost: number;
  performance: number;
  aerodynamics: number;
  engine: number;
  chassis: number;
  reliability: number;
  staff: {
    engineers: number;
    mechanics: number;
    strategists: number;
  };
  sponsors: {
    name: string;
    logo: string;
    contribution: number;
  }[];
  races: {
    position: number;
    track: string;
    date: string;
  }[];
  upgrades: {
    aerodynamics: number;
    engine: number;
    chassis: number;
    reliability: number;
  };
  budget: number;
  standings: number;
  points: number;
}

interface TeamOption {
  name: string;
  description: string;
  price: number;
  performance: number;
  aerodynamics: number;
  engine: number;
  chassis: number;
  reliability: number;
  operatingCost: number;
}

// Available teams for purchase
const teamOptions: TeamOption[] = [
  {
    name: "Phoenix Racing",
    description: "A newly formed team with potential but requires significant investment to compete.",
    price: 500000,
    performance: 60,
    aerodynamics: 55,
    engine: 60,
    chassis: 65,
    reliability: 70,
    operatingCost: 50000
  },
  {
    name: "Velocity Motorsport",
    description: "A mid-tier team with decent technology and occasional podium finishes.",
    price: 1500000,
    performance: 75,
    aerodynamics: 70,
    engine: 80,
    chassis: 75,
    reliability: 70,
    operatingCost: 100000
  },
  {
    name: "Apex Formula",
    description: "A top-tier team with cutting-edge technology and championship potential.",
    price: 5000000,
    performance: 90,
    aerodynamics: 85,
    engine: 90,
    chassis: 85,
    reliability: 80,
    operatingCost: 250000
  }
];

// Upgrade options
const upgradeOptions = [
  {
    id: "aero1",
    name: "Advanced Winglets",
    description: "Improves aerodynamic efficiency by adding sophisticated winglets.",
    area: "aerodynamics",
    improvement: 5,
    cost: 100000
  },
  {
    id: "aero2",
    name: "Diffuser Redesign",
    description: "Complete redesign of the diffuser for better downforce.",
    area: "aerodynamics",
    improvement: 10,
    cost: 250000
  },
  {
    id: "engine1",
    name: "Turbocharger Enhancement",
    description: "Improved turbocharger design for better power delivery.",
    area: "engine",
    improvement: 5,
    cost: 150000
  },
  {
    id: "engine2",
    name: "Complete Power Unit Upgrade",
    description: "Major overhaul of the entire power unit for significant performance gains.",
    area: "engine",
    improvement: 12,
    cost: 350000
  },
  {
    id: "chassis1",
    name: "Carbon Fiber Reinforcement",
    description: "Lighter and stronger chassis components for better handling.",
    area: "chassis",
    improvement: 7,
    cost: 120000
  },
  {
    id: "chassis2",
    name: "Suspension Geometry Optimization",
    description: "Complete redesign of suspension geometry for better tire management.",
    area: "chassis",
    improvement: 9,
    cost: 200000
  },
  {
    id: "reliability1",
    name: "Cooling System Upgrade",
    description: "Enhanced cooling systems to prevent overheating issues.",
    area: "reliability",
    improvement: 8,
    cost: 80000
  },
  {
    id: "reliability2",
    name: "Advanced Materials Implementation",
    description: "Integration of cutting-edge materials for better durability.",
    area: "reliability",
    improvement: 10,
    cost: 180000
  }
];

// Upcoming races
const upcomingRaces = [
  { id: "r1", name: "Monaco Grand Prix", date: "6/20/2025", prestige: 5, difficulty: 4 },
  { id: "r2", name: "British Grand Prix", date: "7/5/2025", prestige: 4, difficulty: 3 },
  { id: "r3", name: "Italian Grand Prix", date: "8/12/2025", prestige: 5, difficulty: 3 },
  { id: "r4", name: "Singapore Grand Prix", date: "9/18/2025", prestige: 4, difficulty: 5 }
];

export function Formula1Ownership() {
  const { wealth, addWealth } = useCharacter();
  const [team, setTeam] = useState<F1Team | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const purchaseTeam = (option: TeamOption) => {
    // Check if player can afford the team
    if (wealth < option.price) {
      alert("You don't have enough funds to purchase this team.");
      return;
    }
    
    // Create new team
    const newTeam: F1Team = {
      id: `team_${Date.now()}`,
      name: option.name,
      purchasePrice: option.price,
      operatingCost: option.operatingCost,
      performance: option.performance,
      aerodynamics: option.aerodynamics,
      engine: option.engine,
      chassis: option.chassis,
      reliability: option.reliability,
      staff: {
        engineers: 20,
        mechanics: 30,
        strategists: 10,
      },
      sponsors: [
        {
          name: "TechDrive",
          logo: "/sponsors/techdrive.png",
          contribution: option.operatingCost * 0.4 // 40% of operating costs
        }
      ],
      races: [],
      upgrades: {
        aerodynamics: 0,
        engine: 0,
        chassis: 0,
        reliability: 0
      },
      budget: option.operatingCost, // Initial budget matches operating cost
      standings: 10, // Start in 10th position
      points: 0
    };
    
    // Update player wealth
    updateWealth(-option.price);
    
    // Set the team
    setTeam(newTeam);
  };

  const hireStaff = (staffType: 'engineers' | 'mechanics' | 'strategists', count: number) => {
    if (!team) return;
    
    // Calculate cost (different types have different costs)
    const costPerPerson = {
      engineers: 12000,
      mechanics: 8000,
      strategists: 15000
    };
    
    const totalCost = costPerPerson[staffType] * count;
    
    // Check if team can afford it
    if (team.budget < totalCost) {
      alert("Your team doesn't have the budget for this hire.");
      return;
    }
    
    // Update team
    setTeam({
      ...team,
      staff: {
        ...team.staff,
        [staffType]: team.staff[staffType] + count
      },
      budget: team.budget - totalCost,
      // Staff increases reliability and overall performance
      reliability: Math.min(100, team.reliability + (count * 0.5)),
      performance: Math.min(100, team.performance + (count * 0.3))
    });
  };

  const purchaseUpgrade = (upgradeId: string) => {
    if (!team) return;
    
    // Find the upgrade
    const upgrade = upgradeOptions.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    // Check if team can afford it
    if (team.budget < upgrade.cost) {
      alert("Your team doesn't have the budget for this upgrade.");
      return;
    }
    
    // Apply the upgrade
    setTeam({
      ...team,
      budget: team.budget - upgrade.cost,
      [upgrade.area]: Math.min(100, team[upgrade.area as keyof F1Team] as number + upgrade.improvement),
      upgrades: {
        ...team.upgrades,
        [upgrade.area]: (team.upgrades[upgrade.area as keyof typeof team.upgrades] as number) + upgrade.improvement
      },
      // Also increase overall performance
      performance: Math.min(100, team.performance + (upgrade.improvement * 0.3))
    });
  };

  // Calculate expected race position based on performance
  const calculateExpectedPosition = (race: { difficulty: number }) => {
    if (!team) return '-';
    
    // Formula = 10 - (performance / 10) + race difficulty adjustment
    const position = Math.max(1, Math.min(20, Math.floor(10 - (team.performance / 10) + (race.difficulty / 5))));
    return position;
  };
  
  // Function to simulate race results
  const simulateRace = (raceId: string) => {
    if (!team) return;
    
    const race = upcomingRaces.find(r => r.id === raceId);
    if (!race) return;
    
    // Calculate expected position
    const expectedPosition = calculateExpectedPosition(race);
    
    // Add some randomness (±3 positions)
    const randomFactor = Math.floor(Math.random() * 7) - 3;
    let actualPosition = Math.max(1, Math.min(20, expectedPosition + randomFactor));
    
    // Reliability can cause DNF (Did Not Finish)
    const reliabilityCheck = Math.random() * 100;
    const didFinish = reliabilityCheck < team.reliability;
    
    if (!didFinish) {
      actualPosition = 20; // DNF is considered last place
    }
    
    // Calculate points earned
    // F1 points system: 1st=25, 2nd=18, 3rd=15, 4th=12, 5th=10, 6th=8, 7th=6, 8th=4, 9th=2, 10th=1
    const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const pointsEarned = actualPosition <= 10 ? pointsSystem[actualPosition - 1] : 0;
    
    // Update race history and points
    const updatedRaces = [
      ...team.races,
      {
        position: actualPosition,
        track: race.name,
        date: race.date
      }
    ];
    
    // Update team data
    setTeam({
      ...team,
      races: updatedRaces,
      points: team.points + pointsEarned,
      // Update standings based on total points (simplified)
      standings: Math.max(1, Math.min(20, 10 - Math.floor(team.points / 10)))
    });
  };

  // Add sponsor
  const addSponsor = (sponsorName: string, contribution: number) => {
    if (!team) return;
    
    setTeam({
      ...team,
      sponsors: [
        ...team.sponsors,
        {
          name: sponsorName,
          logo: `/sponsors/${sponsorName.toLowerCase().replace(/\s/g, '_')}.png`,
          contribution: contribution
        }
      ],
      budget: team.budget + contribution
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Formula 1 Team</h2>
          <p className="text-muted-foreground">Manage your own racing team on the Formula 1 circuit</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Available Funds:</div>
          <div className="font-bold text-lg">{formatCurrency(wealth)}</div>
        </div>
      </div>
      
      {!team ? (
        <div className="space-y-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Purchase a Formula 1 Team</CardTitle>
              <CardDescription>
                Enter the world of high-speed racing by acquiring your own Formula 1 team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamOptions.map((option) => (
                  <Card key={option.name} className="border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{option.name}</CardTitle>
                      <CardDescription className="text-sm">{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                              Performance
                            </span>
                            <span>{option.performance}%</span>
                          </div>
                          <Progress value={option.performance} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                              Engine
                            </span>
                            <span>{option.engine}%</span>
                          </div>
                          <Progress value={option.engine} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Wrench className="h-4 w-4 mr-1 text-purple-500" />
                              Chassis
                            </span>
                            <span>{option.chassis}%</span>
                          </div>
                          <Progress value={option.chassis} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Settings className="h-4 w-4 mr-1 text-green-500" />
                              Reliability
                            </span>
                            <span>{option.reliability}%</span>
                          </div>
                          <Progress value={option.reliability} className="h-1.5" />
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-primary/10 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purchase Price:</span>
                          <span className="font-semibold">{formatCurrency(option.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Costs:</span>
                          <span className="font-semibold">{formatCurrency(option.operatingCost)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => purchaseTeam(option)}
                        disabled={wealth < option.price}
                      >
                        {wealth < option.price ? 'Insufficient Funds' : `Purchase Team`}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Team Dashboard</TabsTrigger>
            <TabsTrigger value="development">Car Development</TabsTrigger>
            <TabsTrigger value="staff">Staff & Sponsors</TabsTrigger>
            <TabsTrigger value="races">Race Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-primary/30 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>
                      <span className="text-primary">{team.name}</span> Performance
                    </span>
                    <Badge className="bg-primary/90">
                      P{team.standings} ({team.points} pts)
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Overall team and vehicle performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                            Overall Performance
                          </span>
                          <span>{team.performance}%</span>
                        </div>
                        <Progress value={team.performance} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                            Engine Power
                          </span>
                          <span>{team.engine}%</span>
                        </div>
                        <Progress value={team.engine} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Gauge className="h-4 w-4 mr-1 text-red-500" />
                            Aerodynamics
                          </span>
                          <span>{team.aerodynamics}%</span>
                        </div>
                        <Progress value={team.aerodynamics} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Wrench className="h-4 w-4 mr-1 text-purple-500" />
                            Chassis
                          </span>
                          <span>{team.chassis}%</span>
                        </div>
                        <Progress value={team.chassis} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Settings className="h-4 w-4 mr-1 text-green-500" />
                            Reliability
                          </span>
                          <span>{team.reliability}%</span>
                        </div>
                        <Progress value={team.reliability} className="h-2" />
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-md space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Team Budget:</span>
                          <span className="font-semibold">{formatCurrency(team.budget)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Operations:</span>
                          <span className="font-semibold">{formatCurrency(team.operatingCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Team Personnel</CardTitle>
                  <CardDescription>Staff breakdown and expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Engineers</span>
                      </div>
                      <span className="font-semibold">{team.staff.engineers}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Wrench className="h-5 w-5 mr-2 text-purple-500" />
                        <span>Mechanics</span>
                      </div>
                      <span className="font-semibold">{team.staff.mechanics}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <BarChart4 className="h-5 w-5 mr-2 text-green-500" />
                        <span>Strategists</span>
                      </div>
                      <span className="font-semibold">{team.staff.strategists}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-primary/10">
                      <h4 className="text-sm font-semibold mb-2">Sponsors</h4>
                      {team.sponsors.map((sponsor, index) => (
                        <div key={index} className="flex justify-between items-center mb-2 text-sm">
                          <span>{sponsor.name}</span>
                          <span>{formatCurrency(sponsor.contribution)}/mo</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('staff')}
                  >
                    Manage Team
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Recent Race Results */}
              <Card className="border-primary/30 md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Race Results</CardTitle>
                  <CardDescription>Performance in the latest Grand Prix events</CardDescription>
                </CardHeader>
                <CardContent>
                  {team.races.length === 0 ? (
                    <div className="text-center py-6">
                      <Trophy className="h-10 w-10 text-primary/50 mx-auto mb-2" />
                      <p className="text-muted-foreground">No races completed yet</p>
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab('races')}
                        className="mt-2"
                      >
                        View Race Calendar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {team.races.slice(-3).reverse().map((race, index) => (
                        <div key={index} className="bg-muted/30 p-3 rounded-md flex justify-between items-center">
                          <div>
                            <div className="font-medium">{race.track}</div>
                            <div className="text-sm text-muted-foreground">{race.date}</div>
                          </div>
                          <div className="flex items-center">
                            <div className={`text-lg font-bold ${
                              race.position <= 3 ? 'text-yellow-500' : 
                              race.position <= 10 ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              P{race.position}
                            </div>
                            {race.position <= 3 && (
                              <Trophy className="ml-2 h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="development">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Car Development</h3>
                <div className="text-lg font-semibold">Budget: {formatCurrency(team.budget)}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upgradeOptions.map((upgrade) => (
                  <Card key={upgrade.id} className="border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                      <CardDescription>{upgrade.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Area:</span>
                          <span className="font-medium capitalize">{upgrade.area}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Improvement:</span>
                          <span className="font-medium">+{upgrade.improvement} points</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{formatCurrency(upgrade.cost)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={team.budget < upgrade.cost ? "outline" : "default"}
                        disabled={team.budget < upgrade.cost}
                        onClick={() => purchaseUpgrade(upgrade.id)}
                      >
                        {team.budget < upgrade.cost ? "Insufficient Budget" : "Purchase Upgrade"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Development Progress</CardTitle>
                  <CardDescription>Tracking all improvements made to your car</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <Gauge className="h-4 w-4 mr-1 text-red-500" />
                        Aerodynamics
                      </h4>
                      <Progress value={team.upgrades.aerodynamics} max={50} className="h-2" />
                      <div className="text-xs text-right">+{team.upgrades.aerodynamics} points</div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                        Engine
                      </h4>
                      <Progress value={team.upgrades.engine} max={50} className="h-2" />
                      <div className="text-xs text-right">+{team.upgrades.engine} points</div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <Wrench className="h-4 w-4 mr-1 text-purple-500" />
                        Chassis
                      </h4>
                      <Progress value={team.upgrades.chassis} max={50} className="h-2" />
                      <div className="text-xs text-right">+{team.upgrades.chassis} points</div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <Settings className="h-4 w-4 mr-1 text-green-500" />
                        Reliability
                      </h4>
                      <Progress value={team.upgrades.reliability} max={50} className="h-2" />
                      <div className="text-xs text-right">+{team.upgrades.reliability} points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="staff">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Staff Management</CardTitle>
                  <CardDescription>Hire and manage your team personnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Engineers</div>
                        <div className="text-sm text-muted-foreground">
                          Currently: {team.staff.engineers}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => hireStaff('engineers', 1)}
                          disabled={team.budget < 12000}
                        >
                          Hire (+$12,000)
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Mechanics</div>
                        <div className="text-sm text-muted-foreground">
                          Currently: {team.staff.mechanics}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => hireStaff('mechanics', 1)}
                          disabled={team.budget < 8000}
                        >
                          Hire (+$8,000)
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Strategists</div>
                        <div className="text-sm text-muted-foreground">
                          Currently: {team.staff.strategists}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => hireStaff('strategists', 1)}
                          disabled={team.budget < 15000}
                        >
                          Hire (+$15,000)
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Hiring staff improves reliability and performance
                  </div>
                </CardFooter>
              </Card>
              
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sponsorships</CardTitle>
                  <CardDescription>Manage team sponsorships and partnerships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {team.sponsors.map((sponsor, index) => (
                      <div key={index} className="bg-muted/20 p-3 rounded-md flex justify-between items-center">
                        <div>
                          <div className="font-medium">{sponsor.name}</div>
                          <div className="text-sm text-muted-foreground">{formatCurrency(sponsor.contribution)}/month</div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 border-primary/30">Active</Badge>
                      </div>
                    ))}
                    
                    <div className="pt-3 border-t border-primary/10">
                      <h4 className="text-sm font-semibold mb-3">Available Sponsors</h4>
                      
                      {/* New sponsor offers based on performance */}
                      <div className="space-y-3">
                        <div className="bg-muted/20 p-3 rounded-md">
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">GreenEnergy</div>
                            <div className="text-sm">{formatCurrency(50000)}/month</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-muted-foreground">
                              Requires P10 or better
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={team.standings > 10}
                              onClick={() => addSponsor('GreenEnergy', 50000)}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-muted/20 p-3 rounded-md">
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">LuxuryMotors</div>
                            <div className="text-sm">{formatCurrency(120000)}/month</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-muted-foreground">
                              Requires P5 or better
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={team.standings > 5}
                              onClick={() => addSponsor('LuxuryMotors', 120000)}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-muted/20 p-3 rounded-md">
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">GlobalTech</div>
                            <div className="text-sm">{formatCurrency(200000)}/month</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-sm text-muted-foreground">
                              Requires P3 or better
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={team.standings > 3}
                              onClick={() => addSponsor('GlobalTech', 200000)}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="races">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Race Calendar</h3>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">Season Points:</div>
                  <Badge className="bg-primary text-lg py-1 px-3">{team.points}</Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                {upcomingRaces.map((race) => (
                  <Card key={race.id} className="border-primary/30">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{race.name}</CardTitle>
                          <CardDescription className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {race.date}
                          </CardDescription>
                        </div>
                        <div className="flex items-center">
                          {Array(race.prestige).fill(0).map((_, i) => (
                            <Trophy key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Circuit Difficulty:</div>
                          <div className="flex">
                            {Array(race.difficulty).fill(0).map((_, i) => (
                              <Flag key={i} className="h-4 w-4 text-red-500 fill-red-500" />
                            ))}
                            {Array(5 - race.difficulty).fill(0).map((_, i) => (
                              <Flag key={i} className="h-4 w-4 text-red-500/30" />
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Expected Position:</span>
                            <span className="font-semibold">P{calculateExpectedPosition(race)}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Win Chance:</span>
                            <span className="font-semibold">
                              {team.performance > 85 ? "High" : team.performance > 70 ? "Medium" : "Low"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => simulateRace(race.id)}
                      >
                        Simulate Race
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {team.races.length > 0 && (
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Race History</CardTitle>
                    <CardDescription>Previous race results and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {team.races.map((race, index) => (
                        <div key={index} className="flex justify-between items-center bg-muted/20 p-3 rounded-md">
                          <div>
                            <div className="font-medium">{race.track}</div>
                            <div className="text-sm text-muted-foreground">{race.date}</div>
                          </div>
                          <div className={`text-lg font-bold ${
                            race.position <= 3 ? 'text-yellow-500' : 
                            race.position <= 10 ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            P{race.position}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}