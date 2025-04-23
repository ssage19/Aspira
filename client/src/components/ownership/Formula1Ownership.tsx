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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
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
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
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
  Award,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Timer,
  ArrowRight,
  User,
  HeartPulse,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
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
  drivers: {
    primary: F1Driver | null;
    secondary: F1Driver | null;
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
  performancePoints: number;
  raceSimulations: {
    [raceId: string]: number; // Tracks number of simulations per race
  };
}

interface F1Driver {
  id: string;
  name: string;
  nationality: string;
  skill: number;
  consistency: number;
  experience: number;
  adaptability: number;
  salary: number;
  image: string;
  age: number;
}

interface TeamOption {
  name: string;
  description: string;
  price: number;
  operatingCost: number;
  performance: number;
  engine: number;
  chassis: number;
  aerodynamics: number;
  reliability: number;
}

// Team upgrade options
interface UpgradeOption {
  id: string;
  name: string;
  area: 'aerodynamics' | 'engine' | 'chassis' | 'reliability';
  cost: number;
  improvement: number;
  category: string;
  description: string;
  timeToImplement: number; // days
}

// Available team options to purchase
const teamOptions: TeamOption[] = [
  {
    name: "Nova Racing",
    description: "A new team with promising technology and ambitious goals. Limited resources but high potential.",
    price: 950000,
    operatingCost: 5000000,
    performance: 65,
    engine: 60,
    chassis: 65,
    aerodynamics: 60,
    reliability: 70
  },
  {
    name: "Velocity GP",
    description: "Mid-tier team with consistent results and solid engineering. Good balance of cost and performance.",
    price: 80000000,
    operatingCost: 15000000,
    performance: 75,
    engine: 75,
    chassis: 70,
    aerodynamics: 75,
    reliability: 80
  },
  {
    name: "Apex Motorsport",
    description: "Elite racing team with championship history. Top-tier technology and staff, but expensive to maintain.",
    price: 120000000,
    operatingCost: 30000000,
    performance: 85,
    engine: 85,
    chassis: 80,
    aerodynamics: 90,
    reliability: 85
  }
];

// Upgrade options categorized
const aerodynamicsUpgrades: UpgradeOption[] = [
  {
    id: "aero_1",
    name: "Front Wing Redesign",
    area: "aerodynamics",
    cost: 2000000,
    improvement: 3,
    category: "Front Wing",
    description: "Improved front wing profile for better downforce",
    timeToImplement: 7
  },
  {
    id: "aero_2",
    name: "DRS Enhancement",
    area: "aerodynamics",
    cost: 1500000,
    improvement: 2,
    category: "DRS System",
    description: "More efficient DRS system for higher straight-line speed",
    timeToImplement: 5
  },
  {
    id: "aero_3",
    name: "Floor Edge Winglets",
    area: "aerodynamics",
    cost: 2500000,
    improvement: 4,
    category: "Underfloor",
    description: "Advanced floor edge design to improve ground effect",
    timeToImplement: 10
  },
  {
    id: "aero_4",
    name: "Rear Wing Efficiency",
    area: "aerodynamics",
    cost: 1800000,
    improvement: 3,
    category: "Rear Wing",
    description: "Optimized rear wing shape to reduce drag while maintaining downforce",
    timeToImplement: 6
  },
  {
    id: "aero_5",
    name: "Diffuser Channels",
    area: "aerodynamics",
    cost: 3000000,
    improvement: 5,
    category: "Diffuser",
    description: "Redesigned diffuser with additional channels for enhanced airflow",
    timeToImplement: 14
  },
  {
    id: "aero_6",
    name: "Barge Board Refinement",
    area: "aerodynamics",
    cost: 1200000,
    improvement: 2,
    category: "Barge Boards",
    description: "Refined barge board design to better direct airflow around sidepods",
    timeToImplement: 4
  },
  {
    id: "aero_7",
    name: "Sidepod Undercut",
    area: "aerodynamics",
    cost: 2200000,
    improvement: 3,
    category: "Sidepods",
    description: "Aggressive undercut on sidepods to optimize airflow to the rear",
    timeToImplement: 8
  },
  {
    id: "aero_8",
    name: "Airbox Redesign",
    area: "aerodynamics",
    cost: 1000000,
    improvement: 2,
    category: "Airbox",
    description: "Streamlined airbox design for reduced drag",
    timeToImplement: 3
  },
  {
    id: "aero_9",
    name: "Mirror Wing Integration",
    area: "aerodynamics",
    cost: 800000,
    improvement: 1,
    category: "Mirrors",
    description: "Aerodynamically optimized mirrors that contribute to overall downforce",
    timeToImplement: 2
  },
  {
    id: "aero_10",
    name: "Advanced CFD Package",
    area: "aerodynamics",
    cost: 4000000,
    improvement: 6,
    category: "Development Tools",
    description: "Cutting-edge computational fluid dynamics software for comprehensive aero development",
    timeToImplement: 21
  }
];

const engineUpgrades: UpgradeOption[] = [
  {
    id: "engine_1",
    name: "Advanced Combustion System",
    area: "engine",
    cost: 3000000,
    improvement: 4,
    category: "Combustion",
    description: "Optimized combustion chamber design for improved efficiency",
    timeToImplement: 14
  },
  {
    id: "engine_2",
    name: "Turbocharger Upgrade",
    area: "engine",
    cost: 2500000,
    improvement: 3,
    category: "Turbocharging",
    description: "Enhanced turbocharger with reduced lag and improved response",
    timeToImplement: 10
  },
  {
    id: "engine_3",
    name: "Fuel Efficiency Optimization",
    area: "engine",
    cost: 1800000,
    improvement: 2,
    category: "Fuel System",
    description: "Refined fuel injection system for better fuel economy and power delivery",
    timeToImplement: 7
  },
  {
    id: "engine_4",
    name: "Hybrid Energy Recovery",
    area: "engine",
    cost: 3500000,
    improvement: 5,
    category: "Energy Recovery",
    description: "Improved MGU-K and MGU-H systems for better energy harvesting and deployment",
    timeToImplement: 16
  },
  {
    id: "engine_5",
    name: "Cooling System Redesign",
    area: "engine",
    cost: 2000000,
    improvement: 3,
    category: "Cooling",
    description: "More efficient cooling system allowing engine to run at optimal temperatures",
    timeToImplement: 8
  },
  {
    id: "engine_6",
    name: "Lightweight Internals",
    area: "engine",
    cost: 2800000,
    improvement: 4,
    category: "Weight Reduction",
    description: "Titanium and carbon composite internal components to reduce weight",
    timeToImplement: 12
  },
  {
    id: "engine_7",
    name: "Advanced Lubricants",
    area: "engine",
    cost: 1000000,
    improvement: 1,
    category: "Lubrication",
    description: "Custom-developed engine oil for reduced friction and increased durability",
    timeToImplement: 3
  },
  {
    id: "engine_8",
    name: "Exhaust System Optimization",
    area: "engine",
    cost: 1500000,
    improvement: 2,
    category: "Exhaust",
    description: "Redesigned exhaust manifold and system for improved gas flow",
    timeToImplement: 5
  },
  {
    id: "engine_9",
    name: "Power Unit Electronics",
    area: "engine",
    cost: 2200000,
    improvement: 3,
    category: "Electronics",
    description: "Updated ECU and power electronics for better energy management",
    timeToImplement: 9
  },
  {
    id: "engine_10",
    name: "Engine Mapping Refinement",
    area: "engine",
    cost: 1200000,
    improvement: 2,
    category: "Engine Mapping",
    description: "Optimized engine maps for various track conditions and race scenarios",
    timeToImplement: 4
  }
];

const chassisUpgrades: UpgradeOption[] = [
  {
    id: "chassis_1",
    name: "Lightweight Monocoque",
    area: "chassis",
    cost: 2800000,
    improvement: 4,
    category: "Chassis Structure",
    description: "Advanced carbon fiber monocoque with optimized layup for weight reduction",
    timeToImplement: 14
  },
  {
    id: "chassis_2",
    name: "Suspension Geometry",
    area: "chassis",
    cost: 2000000,
    improvement: 3,
    category: "Suspension",
    description: "Revised suspension geometry for improved handling and tire management",
    timeToImplement: 9
  },
  {
    id: "chassis_3",
    name: "Advanced Damper System",
    area: "chassis",
    cost: 1800000,
    improvement: 3,
    category: "Dampers",
    description: "Hydraulic damper system with adjustable response characteristics",
    timeToImplement: 7
  },
  {
    id: "chassis_4",
    name: "Brake System Overhaul",
    area: "chassis",
    cost: 2200000,
    improvement: 3,
    category: "Brakes",
    description: "Carbon ceramic brakes with improved cooling and fade resistance",
    timeToImplement: 10
  },
  {
    id: "chassis_5",
    name: "Crash Structure Optimization",
    area: "chassis",
    cost: 1500000,
    improvement: 2,
    category: "Safety",
    description: "Improved crash structures that maintain safety while reducing weight",
    timeToImplement: 6
  },
  {
    id: "chassis_6",
    name: "Pushrod to Pullrod Conversion",
    area: "chassis",
    cost: 2500000,
    improvement: 4,
    category: "Suspension Layout",
    description: "Conversion to pullrod suspension for lower center of gravity",
    timeToImplement: 12
  },
  {
    id: "chassis_7",
    name: "Gearbox Housing Redesign",
    area: "chassis",
    cost: 3000000,
    improvement: 5,
    category: "Transmission",
    description: "Lightweight titanium and carbon composite gearbox housing",
    timeToImplement: 15
  },
  {
    id: "chassis_8",
    name: "Wheel Bearing Performance",
    area: "chassis",
    cost: 800000,
    improvement: 1,
    category: "Wheel Bearings",
    description: "Low-friction ceramic wheel bearings for reduced rolling resistance",
    timeToImplement: 3
  },
  {
    id: "chassis_9",
    name: "Torsional Rigidity Enhancement",
    area: "chassis",
    cost: 2000000,
    improvement: 3,
    category: "Stiffness",
    description: "Structural reinforcements to improve torsional rigidity for better handling",
    timeToImplement: 8
  },
  {
    id: "chassis_10",
    name: "Active Ballast System",
    area: "chassis",
    cost: 1200000,
    improvement: 2,
    category: "Weight Distribution",
    description: "System to dynamically shift ballast weight for optimal balance",
    timeToImplement: 5
  }
];

const reliabilityUpgrades: UpgradeOption[] = [
  {
    id: "reliability_1",
    name: "Cooling System Efficiency",
    area: "reliability",
    cost: 1500000,
    improvement: 3,
    category: "Cooling",
    description: "Enhanced radiator design and cooling channels to prevent overheating",
    timeToImplement: 6
  },
  {
    id: "reliability_2",
    name: "Wiring Harness Protection",
    area: "reliability",
    cost: 800000,
    improvement: 2,
    category: "Electrical",
    description: "Improved insulation and routing of wiring harnesses to prevent failures",
    timeToImplement: 3
  },
  {
    id: "reliability_3",
    name: "Hydraulic System Redundancy",
    area: "reliability",
    cost: 1200000,
    improvement: 3,
    category: "Hydraulics",
    description: "Backup hydraulic systems for critical components to prevent DNFs",
    timeToImplement: 5
  },
  {
    id: "reliability_4",
    name: "Engine Component Durability",
    area: "reliability",
    cost: 2800000,
    improvement: 5,
    category: "Engine Durability",
    description: "Reinforced engine components to extend lifetime between rebuilds",
    timeToImplement: 14
  },
  {
    id: "reliability_5",
    name: "Transmission Reinforcement",
    area: "reliability",
    cost: 2000000,
    improvement: 4,
    category: "Gearbox",
    description: "Strengthened gearbox components to reduce risk of failures",
    timeToImplement: 10
  },
  {
    id: "reliability_6",
    name: "Sensor Network Optimization",
    area: "reliability",
    cost: 1000000,
    improvement: 2,
    category: "Sensors",
    description: "Improved sensor placement and redundancy for better monitoring",
    timeToImplement: 4
  },
  {
    id: "reliability_7",
    name: "Vibration Dampening",
    area: "reliability",
    cost: 1500000,
    improvement: 3,
    category: "Vibration",
    description: "Advanced vibration isolation techniques to reduce component fatigue",
    timeToImplement: 7
  },
  {
    id: "reliability_8",
    name: "Heat Shield Technology",
    area: "reliability",
    cost: 1800000,
    improvement: 3,
    category: "Heat Management",
    description: "Ceramic and composite heat shields to protect sensitive components",
    timeToImplement: 8
  },
  {
    id: "reliability_9",
    name: "Fuel System Redundancy",
    area: "reliability",
    cost: 1300000,
    improvement: 2,
    category: "Fuel System",
    description: "Backup fuel pumps and filters to prevent fuel delivery failures",
    timeToImplement: 6
  },
  {
    id: "reliability_10",
    name: "Quality Control Protocol",
    area: "reliability",
    cost: 2500000,
    improvement: 4,
    category: "Manufacturing",
    description: "Enhanced QC and testing procedures for all manufactured parts",
    timeToImplement: 12
  }
];

// Combined upgrade options for easy reference
const upgradeOptions: UpgradeOption[] = [
  ...aerodynamicsUpgrades,
  ...engineUpgrades, 
  ...chassisUpgrades, 
  ...reliabilityUpgrades
];

// Available F1 Drivers
const availableDrivers: F1Driver[] = [
  {
    id: "driver_1",
    name: "Max Verstappen",
    nationality: "Netherlands",
    skill: 95,
    consistency: 90,
    experience: 88,
    adaptability: 92,
    salary: 30000000,
    image: "/drivers/max_verstappen.jpg",
    age: 28
  },
  {
    id: "driver_2",
    name: "Lewis Hamilton",
    nationality: "United Kingdom",
    skill: 94,
    consistency: 95,
    experience: 98,
    adaptability: 90,
    salary: 35000000,
    image: "/drivers/lewis_hamilton.jpg",
    age: 40
  },
  {
    id: "driver_3",
    name: "Charles Leclerc",
    nationality: "Monaco",
    skill: 90,
    consistency: 85,
    experience: 82,
    adaptability: 88,
    salary: 25000000,
    image: "/drivers/charles_leclerc.jpg",
    age: 27
  },
  {
    id: "driver_4",
    name: "Lando Norris",
    nationality: "United Kingdom",
    skill: 88,
    consistency: 86,
    experience: 80,
    adaptability: 89,
    salary: 20000000,
    image: "/drivers/lando_norris.jpg",
    age: 26
  },
  {
    id: "driver_5",
    name: "Fernando Alonso",
    nationality: "Spain",
    skill: 89,
    consistency: 88,
    experience: 99,
    adaptability: 95,
    salary: 18000000,
    image: "/drivers/fernando_alonso.jpg",
    age: 43
  },
  {
    id: "driver_6",
    name: "George Russell",
    nationality: "United Kingdom",
    skill: 87,
    consistency: 85,
    experience: 78,
    adaptability: 86,
    salary: 18000000,
    image: "/drivers/george_russell.jpg",
    age: 28
  },
  {
    id: "driver_7",
    name: "Carlos Sainz",
    nationality: "Spain",
    skill: 86,
    consistency: 84,
    experience: 85,
    adaptability: 87,
    salary: 15000000,
    image: "/drivers/carlos_sainz.jpg",
    age: 31
  },
  {
    id: "driver_8",
    name: "Oscar Piastri",
    nationality: "Australia",
    skill: 85,
    consistency: 82,
    experience: 75,
    adaptability: 90,
    salary: 12000000,
    image: "/drivers/oscar_piastri.jpg",
    age: 25
  },
  {
    id: "driver_9",
    name: "Sergio Perez",
    nationality: "Mexico",
    skill: 84,
    consistency: 80,
    experience: 90,
    adaptability: 82,
    salary: 16000000,
    image: "/drivers/sergio_perez.jpg",
    age: 35
  },
  {
    id: "driver_10",
    name: "Alex Albon",
    nationality: "Thailand",
    skill: 82,
    consistency: 78,
    experience: 82,
    adaptability: 85,
    salary: 9000000,
    image: "/drivers/alex_albon.jpg",
    age: 29
  },
  {
    id: "driver_11",
    name: "Pierre Gasly",
    nationality: "France",
    skill: 83,
    consistency: 79,
    experience: 84,
    adaptability: 83,
    salary: 8000000,
    image: "/drivers/pierre_gasly.jpg",
    age: 29
  },
  {
    id: "driver_12",
    name: "Marco Rossi",
    nationality: "Italy",
    skill: 79,
    consistency: 75,
    experience: 70,
    adaptability: 82,
    salary: 5000000,
    image: "/drivers/new_driver1.jpg",
    age: 24
  }
];

// Upcoming races
const upcomingRaces = [
  { id: 'r1', name: 'Monaco Grand Prix', date: '6/15/2025', prestige: 5, difficulty: 5, track: 'Monaco', country: 'Monaco' },
  { id: 'r2', name: 'British Grand Prix', date: '6/29/2025', prestige: 4, difficulty: 3, track: 'Silverstone', country: 'United Kingdom' },
  { id: 'r3', name: 'Italian Grand Prix', date: '7/13/2025', prestige: 4, difficulty: 2, track: 'Monza', country: 'Italy' },
  { id: 'r4', name: 'Belgian Grand Prix', date: '7/27/2025', prestige: 3, difficulty: 4, track: 'Spa-Francorchamps', country: 'Belgium' }
];

export function Formula1Ownership() {
  const { wealth, addWealth } = useCharacter();
  const [team, setTeam] = useState<F1Team | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fundAmount, setFundAmount] = useState(0);
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [optimizeCost, setOptimizeCost] = useState(0);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<F1Driver | null>(null);
  const [driverPosition, setDriverPosition] = useState<'primary' | 'secondary' | null>(null);

  // Staff salary calculations
  const calculateStaffSalaries = (): Record<string, number> => {
    if (!team) return { engineers: 0, mechanics: 0, strategists: 0 };
    
    const salaries = {
      engineers: team.staff.engineers * 12000,
      mechanics: team.staff.mechanics * 8000,
      strategists: team.staff.strategists * 15000
    };
    
    return salaries;
  };

  // Total monthly expenses calculation
  const calculateMonthlyExpenses = (): number => {
    if (!team) return 0;
    
    const staffSalaries = calculateStaffSalaries();
    const driverSalaries = (team.drivers.primary?.salary || 0) + (team.drivers.secondary?.salary || 0);
    
    // Monthly staff costs (annual salary / 12)
    const monthlySalaries = 
      (staffSalaries.engineers + 
       staffSalaries.mechanics + 
       staffSalaries.strategists + 
       driverSalaries) / 12;
    
    // Other operating costs (facilities, travel, etc.)
    const otherCosts = team.operatingCost * 0.4;
    
    return monthlySalaries + otherCosts;
  };

  // Monthly revenue calculation
  const calculateMonthlyRevenue = (): number => {
    if (!team) return 0;
    
    // Sum up sponsor contributions
    const sponsorIncome = team.sponsors.reduce((sum, sponsor) => sum + sponsor.contribution, 0);
    
    // Prize money based on standings
    const prizeMoney = ((20 - team.standings) / 20) * team.operatingCost * 0.5;
    
    return sponsorIncome + prizeMoney;
  };

  // Net monthly cash flow
  const calculateNetCashFlow = (): number => {
    return calculateMonthlyRevenue() - calculateMonthlyExpenses();
  };

  const purchaseTeam = (option: TeamOption) => {
    // Check if player can afford the team
    if (wealth < option.price) {
      toast.error("You don't have enough funds to purchase this team.", {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
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
      drivers: {
        primary: null,
        secondary: null
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
    addWealth(-option.price);
    
    // Set the team
    setTeam(newTeam);
    
    // Show success message
    setSuccessMessage(`You have successfully purchased ${newTeam.name} for ${formatCurrency(option.price)}!`);
    setShowSuccessDialog(true);
    
    // Notification
    toast.success(`You now own ${newTeam.name}!`, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    });
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
      toast.error(`Your team doesn't have the budget for this hire.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
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
    
    toast.success(`Hired ${count} new ${staffType}!`, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    });
  };

  const purchaseUpgrade = (upgradeId: string) => {
    if (!team) return;
    
    // Find the upgrade
    const upgrade = upgradeOptions.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    // Check if team can afford it
    if (team.budget < upgrade.cost) {
      toast.error(`Your team doesn't have the budget for this upgrade.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
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
    
    toast.success(`Purchased ${upgrade.name} upgrade!`, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    });
  };

  // Calculate expected race position based on performance
  const calculateExpectedPosition = (race: { difficulty: number }): number | string => {
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
    
    // Convert the expected position to a number if it's a string
    const numericPosition = typeof expectedPosition === 'string' ? 10 : expectedPosition;
    
    // Add some randomness (±3 positions)
    const randomFactor = Math.floor(Math.random() * 7) - 3;
    let actualPosition = Math.max(1, Math.min(20, numericPosition + randomFactor));
    
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
    
    // Prize money based on position
    const prizeMoney = actualPosition <= 3 ? 
                        (4 - actualPosition) * 1000000 : // 1st: 3M, 2nd: 2M, 3rd: 1M
                        actualPosition <= 10 ? 
                          500000 : // 4th-10th: 500k
                          100000;  // 11th-20th: 100k
    
    // Update team data
    setTeam({
      ...team,
      races: updatedRaces,
      points: team.points + pointsEarned,
      budget: team.budget + prizeMoney,
      // Update standings based on total points (simplified)
      standings: Math.max(1, Math.min(20, 10 - Math.floor(team.points / 10)))
    });
    
    toast.success(`Race completed! Position: ${actualPosition}, Points: ${pointsEarned}`, {
      icon: <Trophy className="h-5 w-5 text-yellow-500" />
    });
  };
  
  // Prepare to optimize car for a specific race
  const prepareOptimizeForRace = (raceId: string) => {
    if (!team) return;
    
    const race = upcomingRaces.find(r => r.id === raceId);
    if (!race) return;
    
    // Set race-specific optimization cost (based on track difficulty and prestige)
    const baseCost = 1000000;
    const costMultiplier = (race.difficulty * 0.5) + (race.prestige * 0.3);
    const finalCost = Math.round(baseCost * costMultiplier);
    
    setSelectedRace(raceId);
    setOptimizeCost(finalCost);
    setShowOptimizeDialog(true);
  };
  
  // Optimize car for selected race
  const optimizeForRace = () => {
    if (!team || !selectedRace) return;
    
    const race = upcomingRaces.find(r => r.id === selectedRace);
    if (!race) return;
    
    // Check if team can afford it
    if (team.budget < optimizeCost) {
      toast.error(`Your team doesn't have the budget for this optimization.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      setShowOptimizeDialog(false);
      return;
    }
    
    // Performance improvements based on track type
    let aeroImprovement = 0;
    let engineImprovement = 0;
    let chassisImprovement = 0;
    
    // Monaco is high downforce, low speed
    if (race.track === 'Monaco') {
      aeroImprovement = 3;
      chassisImprovement = 2;
    } 
    // Monza is low downforce, high speed
    else if (race.track === 'Monza') {
      engineImprovement = 3;
      aeroImprovement = 1;
    } 
    // Silverstone is balanced
    else if (race.track === 'Silverstone') {
      aeroImprovement = 2;
      engineImprovement = 2;
      chassisImprovement = 1;
    }
    // Spa has a mix of everything
    else if (race.track === 'Spa-Francorchamps') {
      aeroImprovement = 2;
      engineImprovement = 2;
      chassisImprovement = 2;
    }
    
    // Apply the optimization
    setTeam({
      ...team,
      budget: team.budget - optimizeCost,
      aerodynamics: Math.min(100, team.aerodynamics + aeroImprovement),
      engine: Math.min(100, team.engine + engineImprovement),
      chassis: Math.min(100, team.chassis + chassisImprovement),
      // Also increase overall performance
      performance: Math.min(100, team.performance + 2)
    });
    
    setShowOptimizeDialog(false);
    
    toast.success(`Car optimized for the ${race.name}!`, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    });
  };
  
  // Add funds to team budget from personal wealth
  const addFundsToTeam = () => {
    if (!team || fundAmount <= 0) return;
    
    // Check if player can afford it
    if (wealth < fundAmount) {
      toast.error(`You don't have enough personal funds for this investment.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      return;
    }
    
    // Transfer funds
    addWealth(-fundAmount);
    
    setTeam({
      ...team,
      budget: team.budget + fundAmount
    });
    
    setFundAmount(0);
    
    toast.success(`Added ${formatCurrency(fundAmount)} to team budget.`, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
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
    
    toast.success(`New sponsor agreement with ${sponsorName}!`, {
      icon: <DollarSign className="h-5 w-5 text-green-500" />
    });
  };
  
  // Prepare to hire a driver
  const prepareHireDriver = (driver: F1Driver, position: 'primary' | 'secondary') => {
    if (!team) return;
    
    setSelectedDriver(driver);
    setDriverPosition(position);
    setShowDriverDialog(true);
  };
  
  // Hire a driver
  const hireDriver = () => {
    if (!team || !selectedDriver || !driverPosition) return;
    
    // Check if team can afford it
    if (team.budget < selectedDriver.salary) {
      toast.error(`Your team doesn't have the budget to hire this driver.`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
      setShowDriverDialog(false);
      return;
    }
    
    // Update team
    setTeam({
      ...team,
      drivers: {
        ...team.drivers,
        [driverPosition]: selectedDriver
      },
      budget: team.budget - selectedDriver.salary / 12, // First month's salary
      // Driver skill improves team performance
      performance: Math.min(100, team.performance + (selectedDriver.skill - 80) / 10)
    });
    
    setShowDriverDialog(false);
    
    toast.success(`Hired ${selectedDriver.name} as your ${driverPosition} driver!`, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    });
  };

  useEffect(() => {
    // Reset dialog states when tab changes
    setShowSuccessDialog(false);
    setShowOptimizeDialog(false);
    setShowDriverDialog(false);
  }, [activeTab]);

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
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="dashboard">Team Dashboard</TabsTrigger>
            <TabsTrigger value="development">Car Development</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
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
                          <span className="text-muted-foreground">Monthly Cash Flow:</span>
                          <span className={`font-semibold ${calculateNetCashFlow() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(calculateNetCashFlow())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                  <CardDescription>Team budget and cash flow</CardDescription>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Team Budget:</span>
                      <span className="font-bold text-lg">{formatCurrency(team.budget)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Monthly Revenue</h4>
                      <div className="space-y-1 text-sm pl-2">
                        <div className="flex justify-between">
                          <span>Sponsorships</span>
                          <span>{formatCurrency(team.sponsors.reduce((sum, s) => sum + s.contribution, 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prize Money (est.)</span>
                          <span>{formatCurrency(((20 - team.standings) / 20) * team.operatingCost * 0.5)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-1">
                          <span>Total Revenue</span>
                          <span className="text-green-500">{formatCurrency(calculateMonthlyRevenue())}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Monthly Expenses</h4>
                      <div className="space-y-1 text-sm pl-2">
                        <div className="flex justify-between">
                          <span>Staff Salaries</span>
                          <span>{formatCurrency(Object.values(calculateStaffSalaries()).reduce((a, b) => a + b, 0) / 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Driver Salaries</span>
                          <span>{formatCurrency(((team.drivers.primary?.salary || 0) + (team.drivers.secondary?.salary || 0)) / 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operations</span>
                          <span>{formatCurrency(team.operatingCost * 0.4)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-1">
                          <span>Total Expenses</span>
                          <span className="text-red-500">{formatCurrency(calculateMonthlyExpenses())}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-medium">
                      <span>Net Cash Flow</span>
                      <span className={calculateNetCashFlow() >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatCurrency(calculateNetCashFlow())}
                      </span>
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Add Personal Funds</h4>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="max-w-[200px]"
                          min={0}
                          max={wealth}
                          value={fundAmount || ''}
                          onChange={(e) => setFundAmount(Number(e.target.value))}
                        />
                        <Button 
                          size="sm" 
                          onClick={addFundsToTeam}
                          disabled={fundAmount <= 0 || fundAmount > wealth}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Funds
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {team.races.length > 0 && (
                <Card className="border-primary/30 md:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Race Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {team.races.slice(-3).reverse().map((race, index) => (
                        <div key={index} className="bg-muted/20 p-4 rounded-md">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium">{race.track}</div>
                              <div className="text-xs text-muted-foreground">{race.date}</div>
                            </div>
                            <Badge className={
                              race.position <= 3 ? 'bg-green-500' : 
                              race.position <= 10 ? 'bg-blue-500' : 
                              'bg-red-500'
                            }>
                              P{race.position}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            {race.position <= 10 && (
                              <div className="flex items-center">
                                <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                                <span>
                                  {race.position === 1 ? '25 points (1st place)' :
                                   race.position === 2 ? '18 points (2nd place)' :
                                   race.position === 3 ? '15 points (3rd place)' :
                                   race.position === 4 ? '12 points (4th place)' :
                                   race.position === 5 ? '10 points (5th place)' :
                                   race.position === 6 ? '8 points (6th place)' :
                                   race.position === 7 ? '6 points (7th place)' :
                                   race.position === 8 ? '4 points (8th place)' :
                                   race.position === 9 ? '2 points (9th place)' :
                                   '1 point (10th place)'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="development">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Car Development Status</CardTitle>
                    <CardDescription>Current specifications and upgrades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Gauge className="h-4 w-4 mr-1 text-red-500" />
                            Aerodynamics
                          </span>
                          <span>{team.aerodynamics}% (+{team.upgrades.aerodynamics})</span>
                        </div>
                        <Progress value={team.aerodynamics} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                            Engine
                          </span>
                          <span>{team.engine}% (+{team.upgrades.engine})</span>
                        </div>
                        <Progress value={team.engine} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Wrench className="h-4 w-4 mr-1 text-purple-500" />
                            Chassis
                          </span>
                          <span>{team.chassis}% (+{team.upgrades.chassis})</span>
                        </div>
                        <Progress value={team.chassis} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Settings className="h-4 w-4 mr-1 text-green-500" />
                            Reliability
                          </span>
                          <span>{team.reliability}% (+{team.upgrades.reliability})</span>
                        </div>
                        <Progress value={team.reliability} className="h-2" />
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-md">
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">Available Budget:</span>
                          <span className="font-semibold">{formatCurrency(team.budget)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Allocate your budget to upgrade different aspects of your car.
                          Technical upgrades can take time to implement and show results.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Development Focus</CardTitle>
                    <CardDescription>Percentage allocation by area</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-center">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-500/10 p-4 rounded-md border border-red-500/30">
                          <Gauge className="h-8 w-8 mx-auto mb-2 text-red-500" />
                          <div className="font-medium">Aerodynamics</div>
                          <div className="text-sm text-muted-foreground">
                            {team.upgrades.aerodynamics > 0 ?
                              `+${team.upgrades.aerodynamics} points from upgrades` :
                              "No upgrades installed yet"
                            }
                          </div>
                        </div>
                        
                        <div className="bg-yellow-500/10 p-4 rounded-md border border-yellow-500/30">
                          <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                          <div className="font-medium">Engine</div>
                          <div className="text-sm text-muted-foreground">
                            {team.upgrades.engine > 0 ?
                              `+${team.upgrades.engine} points from upgrades` :
                              "No upgrades installed yet"
                            }
                          </div>
                        </div>
                        
                        <div className="bg-purple-500/10 p-4 rounded-md border border-purple-500/30">
                          <Wrench className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="font-medium">Chassis</div>
                          <div className="text-sm text-muted-foreground">
                            {team.upgrades.chassis > 0 ?
                              `+${team.upgrades.chassis} points from upgrades` :
                              "No upgrades installed yet"
                            }
                          </div>
                        </div>
                        
                        <div className="bg-green-500/10 p-4 rounded-md border border-green-500/30">
                          <Settings className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <div className="font-medium">Reliability</div>
                          <div className="text-sm text-muted-foreground">
                            {team.upgrades.reliability > 0 ?
                              `+${team.upgrades.reliability} points from upgrades` :
                              "No upgrades installed yet"
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mt-2">
                        Balance your development priorities based on upcoming races and team needs.
                        Reliability is crucial for finishing races, while performance upgrades help you climb positions.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="aero">
                  <AccordionTrigger className="text-lg font-medium">
                    <span className="flex items-center">
                      <Gauge className="h-5 w-5 mr-2 text-red-500" />
                      Aerodynamic Upgrades
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {aerodynamicsUpgrades.map(upgrade => (
                        <Card key={upgrade.id} className="border-red-500/30">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-base">{upgrade.name}</CardTitle>
                              <Badge className="bg-red-500/80">+{upgrade.improvement}</Badge>
                            </div>
                            <CardDescription className="text-xs">
                              {upgrade.category} | {upgrade.timeToImplement} days to implement
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm mb-3">{upgrade.description}</p>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Cost:</span>
                              <span className="font-semibold">{formatCurrency(upgrade.cost)}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-2">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => purchaseUpgrade(upgrade.id)}
                              disabled={team.budget < upgrade.cost}
                            >
                              {team.budget < upgrade.cost ? 'Insufficient Budget' : 'Purchase Upgrade'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="engine">
                  <AccordionTrigger className="text-lg font-medium">
                    <span className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                      Engine Upgrades
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {engineUpgrades.map(upgrade => (
                        <Card key={upgrade.id} className="border-yellow-500/30">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-base">{upgrade.name}</CardTitle>
                              <Badge className="bg-yellow-500/80">+{upgrade.improvement}</Badge>
                            </div>
                            <CardDescription className="text-xs">
                              {upgrade.category} | {upgrade.timeToImplement} days to implement
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm mb-3">{upgrade.description}</p>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Cost:</span>
                              <span className="font-semibold">{formatCurrency(upgrade.cost)}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-2">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => purchaseUpgrade(upgrade.id)}
                              disabled={team.budget < upgrade.cost}
                            >
                              {team.budget < upgrade.cost ? 'Insufficient Budget' : 'Purchase Upgrade'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="chassis">
                  <AccordionTrigger className="text-lg font-medium">
                    <span className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2 text-purple-500" />
                      Chassis Upgrades
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {chassisUpgrades.map(upgrade => (
                        <Card key={upgrade.id} className="border-purple-500/30">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-base">{upgrade.name}</CardTitle>
                              <Badge className="bg-purple-500/80">+{upgrade.improvement}</Badge>
                            </div>
                            <CardDescription className="text-xs">
                              {upgrade.category} | {upgrade.timeToImplement} days to implement
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm mb-3">{upgrade.description}</p>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Cost:</span>
                              <span className="font-semibold">{formatCurrency(upgrade.cost)}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-2">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => purchaseUpgrade(upgrade.id)}
                              disabled={team.budget < upgrade.cost}
                            >
                              {team.budget < upgrade.cost ? 'Insufficient Budget' : 'Purchase Upgrade'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="reliability">
                  <AccordionTrigger className="text-lg font-medium">
                    <span className="flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-green-500" />
                      Reliability Upgrades
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {reliabilityUpgrades.map(upgrade => (
                        <Card key={upgrade.id} className="border-green-500/30">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-base">{upgrade.name}</CardTitle>
                              <Badge className="bg-green-500/80">+{upgrade.improvement}</Badge>
                            </div>
                            <CardDescription className="text-xs">
                              {upgrade.category} | {upgrade.timeToImplement} days to implement
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm mb-3">{upgrade.description}</p>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Cost:</span>
                              <span className="font-semibold">{formatCurrency(upgrade.cost)}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-2">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => purchaseUpgrade(upgrade.id)}
                              disabled={team.budget < upgrade.cost}
                            >
                              {team.budget < upgrade.cost ? 'Insufficient Budget' : 'Purchase Upgrade'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="drivers">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Drivers</CardTitle>
                    <CardDescription>Current race drivers for your team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border rounded-md p-4">
                        <div className="font-medium mb-2">Primary Driver</div>
                        
                        {team.drivers.primary ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                              <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center mb-2">
                                <User className="h-16 w-16 text-muted-foreground" />
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{team.drivers.primary.name}</div>
                                <div className="text-sm text-muted-foreground">{team.drivers.primary.nationality}</div>
                              </div>
                            </div>
                            
                            <div className="md:col-span-2 space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="flex items-center">
                                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                    Skill
                                  </span>
                                  <span>{team.drivers.primary.skill}%</span>
                                </div>
                                <Progress value={team.drivers.primary.skill} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="flex items-center">
                                    <HeartPulse className="h-4 w-4 mr-1 text-red-500" />
                                    Consistency
                                  </span>
                                  <span>{team.drivers.primary.consistency}%</span>
                                </div>
                                <Progress value={team.drivers.primary.consistency} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="flex items-center">
                                    <Trophy className="h-4 w-4 mr-1 text-blue-500" />
                                    Experience
                                  </span>
                                  <span>{team.drivers.primary.experience}%</span>
                                </div>
                                <Progress value={team.drivers.primary.experience} className="h-2" />
                              </div>
                              
                              <div className="flex justify-between text-sm pt-2">
                                <span className="text-muted-foreground">Annual Salary:</span>
                                <span className="font-semibold">{formatCurrency(team.drivers.primary.salary)}</span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Age:</span>
                                <span>{team.drivers.primary.age} years</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-muted/20 rounded-lg">
                            <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">No primary driver signed yet</p>
                            <Button 
                              className="mt-4"
                              onClick={() => setActiveTab('drivers')}
                            >
                              Sign a Primary Driver
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <div className="font-medium mb-2">Secondary Driver</div>
                        
                        {team.drivers.secondary ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                              <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center mb-2">
                                <User className="h-16 w-16 text-muted-foreground" />
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{team.drivers.secondary.name}</div>
                                <div className="text-sm text-muted-foreground">{team.drivers.secondary.nationality}</div>
                              </div>
                            </div>
                            
                            <div className="md:col-span-2 space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="flex items-center">
                                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                    Skill
                                  </span>
                                  <span>{team.drivers.secondary.skill}%</span>
                                </div>
                                <Progress value={team.drivers.secondary.skill} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="flex items-center">
                                    <HeartPulse className="h-4 w-4 mr-1 text-red-500" />
                                    Consistency
                                  </span>
                                  <span>{team.drivers.secondary.consistency}%</span>
                                </div>
                                <Progress value={team.drivers.secondary.consistency} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="flex items-center">
                                    <Trophy className="h-4 w-4 mr-1 text-blue-500" />
                                    Experience
                                  </span>
                                  <span>{team.drivers.secondary.experience}%</span>
                                </div>
                                <Progress value={team.drivers.secondary.experience} className="h-2" />
                              </div>
                              
                              <div className="flex justify-between text-sm pt-2">
                                <span className="text-muted-foreground">Annual Salary:</span>
                                <span className="font-semibold">{formatCurrency(team.drivers.secondary.salary)}</span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Age:</span>
                                <span>{team.drivers.secondary.age} years</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-muted/20 rounded-lg">
                            <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">No secondary driver signed yet</p>
                            <Button 
                              className="mt-4"
                              onClick={() => setActiveTab('drivers')}
                            >
                              Sign a Secondary Driver
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Driver Market</CardTitle>
                    <CardDescription>
                      Available drivers for hire
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto">
                    <div className="space-y-4">
                      {availableDrivers.map(driver => (
                        <Card key={driver.id} className="border-muted/50">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <div>
                                <CardTitle className="text-base">{driver.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {driver.nationality} | {driver.age} years old
                                </CardDescription>
                              </div>
                              <Badge>
                                {driver.skill}% Skill
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 pb-2">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Consistency:</span>
                                  <span>{driver.consistency}%</span>
                                </div>
                                <Progress value={driver.consistency} className="h-1.5" />
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Experience:</span>
                                  <span>{driver.experience}%</span>
                                </div>
                                <Progress value={driver.experience} className="h-1.5" />
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Adaptability:</span>
                                  <span>{driver.adaptability}%</span>
                                </div>
                                <Progress value={driver.adaptability} className="h-1.5" />
                              </div>
                              
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground">Salary:</span>
                                <span className="text-xs ml-1 font-medium">{formatCurrency(driver.salary)}/yr</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between pt-2 border-t border-muted/30">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => prepareHireDriver(driver, 'primary')}
                                disabled={(team.drivers.primary !== null && team.drivers.primary.id === driver.id) || team.budget < driver.salary / 12}
                              >
                                Sign as Primary
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => prepareHireDriver(driver, 'secondary')}
                                disabled={(team.drivers.secondary !== null && team.drivers.secondary.id === driver.id) || team.budget < driver.salary / 12}
                              >
                                Sign as Secondary
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="staff">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Staff Management</CardTitle>
                  <CardDescription>Manage your team personnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Current Staff</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 mr-2 text-blue-500" />
                            <span>Engineers</span>
                          </div>
                          <div className="font-medium">{team.staff.engineers}</div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Wrench className="h-5 w-5 mr-2 text-orange-500" />
                            <span>Mechanics</span>
                          </div>
                          <div className="font-medium">{team.staff.mechanics}</div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <BarChart4 className="h-5 w-5 mr-2 text-purple-500" />
                            <span>Strategists</span>
                          </div>
                          <div className="font-medium">{team.staff.strategists}</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-3">Staff Costs</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Engineers ({team.staff.engineers})</span>
                          <span>{formatCurrency(calculateStaffSalaries().engineers)} annually</span>
                        </div>
                        <div className="text-xs text-muted-foreground pl-4">
                          {formatCurrency(12000)} per engineer
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Mechanics ({team.staff.mechanics})</span>
                          <span>{formatCurrency(calculateStaffSalaries().mechanics)} annually</span>
                        </div>
                        <div className="text-xs text-muted-foreground pl-4">
                          {formatCurrency(8000)} per mechanic
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Strategists ({team.staff.strategists})</span>
                          <span>{formatCurrency(calculateStaffSalaries().strategists)} annually</span>
                        </div>
                        <div className="text-xs text-muted-foreground pl-4">
                          {formatCurrency(15000)} per strategist
                        </div>
                        
                        <div className="pt-2 mt-2 border-t">
                          <div className="flex justify-between font-medium">
                            <span>Total Monthly Staff Cost</span>
                            <span>{formatCurrency(Object.values(calculateStaffSalaries()).reduce((a, b) => a + b, 0) / 12)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-3">Hire Staff</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Users className="h-5 w-5 mr-2 text-blue-500" />
                              <span>Engineers</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => hireStaff('engineers', 1)}
                              disabled={team.budget < 12000}
                            >
                              Hire (+1)
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cost: {formatCurrency(12000)} per engineer
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Wrench className="h-5 w-5 mr-2 text-orange-500" />
                              <span>Mechanics</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => hireStaff('mechanics', 1)}
                              disabled={team.budget < 8000}
                            >
                              Hire (+1)
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cost: {formatCurrency(8000)} per mechanic
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <BarChart4 className="h-5 w-5 mr-2 text-purple-500" />
                              <span>Strategists</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => hireStaff('strategists', 1)}
                              disabled={team.budget < 15000}
                            >
                              Hire (+1)
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cost: {formatCurrency(15000)} per strategist
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Sponsors</CardTitle>
                  <CardDescription>Current sponsorship deals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {team.sponsors.length > 0 ? (
                      <div className="space-y-4">
                        {team.sponsors.map((sponsor, index) => (
                          <div key={index} className="bg-muted/20 p-3 rounded-md flex justify-between items-center">
                            <div>
                              <div className="font-medium">{sponsor.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(sponsor.contribution)} annual contribution
                              </div>
                            </div>
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <DollarSign className="h-6 w-6 text-green-500" />
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-2 text-center">
                          <div className="font-medium">Total Sponsor Revenue</div>
                          <div className="text-xl font-bold text-green-500">
                            {formatCurrency(team.sponsors.reduce((sum, s) => sum + s.contribution, 0))}
                          </div>
                          <div className="text-xs text-muted-foreground">annual contribution</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No sponsors yet</p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Find New Sponsors</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Team performance and reputation affects sponsor interest.
                        Higher standings attract better sponsorship deals.
                      </p>
                      
                      <div className="space-y-3">
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={() => addSponsor("Quantum Racing", 2000000)}
                          disabled={team.sponsors.some(s => s.name === "Quantum Racing")}
                        >
                          {team.sponsors.some(s => s.name === "Quantum Racing") ? 
                            'Already Sponsored by Quantum Racing' : 
                            'Approach Quantum Racing'}
                        </Button>
                        
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={() => addSponsor("PetroDrive", 3500000)}
                          disabled={team.sponsors.some(s => s.name === "PetroDrive") || team.standings > 8}
                        >
                          {team.sponsors.some(s => s.name === "PetroDrive") ? 
                            'Already Sponsored by PetroDrive' : 
                            team.standings > 8 ? 
                            'Requires Top 8 Standing' : 
                            'Approach PetroDrive'}
                        </Button>
                        
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={() => addSponsor("GlobalTech", 5000000)}
                          disabled={team.sponsors.some(s => s.name === "GlobalTech") || team.standings > 5}
                        >
                          {team.sponsors.some(s => s.name === "GlobalTech") ? 
                            'Already Sponsored by GlobalTech' : 
                            team.standings > 5 ? 
                            'Requires Top 5 Standing' : 
                            'Approach GlobalTech'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Performance Impact</CardTitle>
                  <CardDescription>How staff affects team performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-500/10 p-4 rounded-md border border-blue-500/30">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="font-medium">Engineers</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <p>Each engineer improves car development efficiency and aerodynamic performance.</p>
                        <ul className="list-disc list-inside text-muted-foreground pl-2 text-xs">
                          <li>+0.3% to overall performance per engineer</li>
                          <li>+0.5% to aerodynamics per engineer</li>
                          <li>Faster development of new upgrades</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-orange-500/10 p-4 rounded-md border border-orange-500/30">
                      <div className="flex items-center mb-2">
                        <Wrench className="h-5 w-5 mr-2 text-orange-500" />
                        <span className="font-medium">Mechanics</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <p>Mechanics improve car reliability and maintenance during race weekends.</p>
                        <ul className="list-disc list-inside text-muted-foreground pl-2 text-xs">
                          <li>+0.5% to reliability per mechanic</li>
                          <li>Reduces pit stop times</li>
                          <li>Decreases chance of mechanical failures</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/10 p-4 rounded-md border border-purple-500/30">
                      <div className="flex items-center mb-2">
                        <BarChart4 className="h-5 w-5 mr-2 text-purple-500" />
                        <span className="font-medium">Strategists</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <p>Race strategists optimize race plans and respond to changing conditions.</p>
                        <ul className="list-disc list-inside text-muted-foreground pl-2 text-xs">
                          <li>Improves race day decision making</li>
                          <li>Better tire management</li>
                          <li>More effective race tactics</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Investing in the right balance of staff is crucial for success.
                      Engineers drive development, mechanics ensure reliability,
                      and strategists maximize race day performance.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="races">
            <div className="space-y-6">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Grand Prix</CardTitle>
                  <CardDescription>The next races on the Formula 1 calendar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingRaces.map((race) => (
                      <Card key={race.id} className="border-primary/20">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{race.name}</CardTitle>
                              <CardDescription className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {race.date} • {race.country}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="flex">
                              {Array(race.prestige).fill(0).map((_, i) => (
                                <Trophy key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              ))}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="text-sm">
                                <div className="text-muted-foreground">Expected result:</div>
                                <div className="font-medium">
                                  Position {calculateExpectedPosition(race)}
                                  {calculateExpectedPosition(race) <= 3 ? ' (Podium potential)' : 
                                   calculateExpectedPosition(race) <= 10 ? ' (Points finish)' : 
                                   ' (Outside points)'}
                                </div>
                              </div>
                              
                              <div className="text-sm text-right">
                                <div className="text-muted-foreground">Track Difficulty:</div>
                                <div className="font-medium flex items-center justify-end">
                                  {Array(race.difficulty).fill(0).map((_, i) => (
                                    <ArrowRight key={i} className="h-3 w-3 text-red-500" />
                                  ))}
                                  {Array(5 - race.difficulty).fill(0).map((_, i) => (
                                    <ArrowRight key={i} className="h-3 w-3 text-gray-300" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                              <Button 
                                className="flex-1"
                                onClick={() => prepareOptimizeForRace(race.id)}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Optimize Car Setup
                              </Button>
                              
                              <Button
                                className="flex-1"
                                onClick={() => simulateRace(race.id)}
                              >
                                <Flag className="h-4 w-4 mr-2" />
                                Simulate Race
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {team.races.length > 0 && (
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Race History</CardTitle>
                    <CardDescription>Past race results and earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Grand Prix</th>
                            <th className="text-center p-2 font-medium">Date</th>
                            <th className="text-center p-2 font-medium">Position</th>
                            <th className="text-center p-2 font-medium">Points</th>
                            <th className="text-right p-2 font-medium">Prize Money</th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.races.map((race, index) => {
                            // Calculate points earned
                            const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
                            const pointsEarned = race.position <= 10 ? pointsSystem[race.position - 1] : 0;
                            
                            // Calculate prize money
                            const prizeMoney = race.position <= 3 ? 
                                              (4 - race.position) * 1000000 : // 1st: 3M, 2nd: 2M, 3rd: 1M
                                              race.position <= 10 ? 
                                                500000 : // 4th-10th: 500k
                                                100000;  // 11th-20th: 100k
                            
                            return (
                              <tr key={index} className="border-b border-muted/20 hover:bg-muted/10">
                                <td className="p-2 text-left">{race.track}</td>
                                <td className="p-2 text-center text-sm">{race.date}</td>
                                <td className="p-2 text-center">
                                  <Badge className={
                                    race.position <= 3 ? 'bg-green-500' : 
                                    race.position <= 10 ? 'bg-blue-500' : 
                                    'bg-red-500'
                                  }>
                                    P{race.position}
                                  </Badge>
                                </td>
                                <td className="p-2 text-center">{pointsEarned}</td>
                                <td className="p-2 text-right">{formatCurrency(prizeMoney)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
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
      
      {/* Race Optimization Dialog */}
      <AlertDialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Settings className="h-5 w-5 text-blue-500 mr-2" />
              Optimize Car for Race
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRace && (
                <>
                  <p className="mb-2">
                    You are about to optimize your car setup for the {
                      upcomingRaces.find(r => r.id === selectedRace)?.name
                    }.
                  </p>
                  <p className="mb-2">
                    This will cost {formatCurrency(optimizeCost)} from your team budget.
                  </p>
                  <p>
                    The setup will be optimized specifically for the {
                      upcomingRaces.find(r => r.id === selectedRace)?.track
                    } circuit characteristics.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowOptimizeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={optimizeForRace}>
              Optimize Car ({formatCurrency(optimizeCost)})
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Driver Hiring Dialog */}
      <AlertDialog open={showDriverDialog} onOpenChange={setShowDriverDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              Hire Driver
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedDriver && driverPosition && (
                <>
                  <p className="mb-2">
                    You are about to hire {selectedDriver.name} as your {driverPosition} driver.
                  </p>
                  <p className="mb-2">
                    Annual salary: {formatCurrency(selectedDriver.salary)}
                  </p>
                  <p className="mb-2">
                    First month's payment: {formatCurrency(selectedDriver.salary / 12)}
                  </p>
                  {driverPosition === 'primary' && team.drivers.primary && (
                    <p className="text-amber-500">
                      This will replace your current primary driver {team.drivers.primary.name}.
                    </p>
                  )}
                  {driverPosition === 'secondary' && team.drivers.secondary && (
                    <p className="text-amber-500">
                      This will replace your current secondary driver {team.drivers.secondary.name}.
                    </p>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDriverDialog(false)}>
              Cancel
            </Button>
            <Button onClick={hireDriver}>
              Hire Driver
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}