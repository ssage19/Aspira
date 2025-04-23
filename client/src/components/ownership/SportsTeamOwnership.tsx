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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Trophy, 
  Users, 
  Building, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  BarChart4,
  Calendar,
  Star,
  Activity,
  Heart,
  Zap,
  LayoutGrid,
  Edit,
  MapPin,
  X
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useCharacter } from '../../lib/stores/useCharacter';

// Types
interface Player {
  id: string;
  name: string;
  position: string;
  rating: number;
  salary: number;
  age: number;
  experience: number;
  potential: number;
  happiness: number;
  energy: number;
  contract: {
    years: number;
    salary: number;
  };
}

type SportType = 'basketball' | 'football' | 'soccer' | 'baseball' | 'hockey' | 'golf' | 'tennis' | 'rugby' | 'volleyball';

interface SportsTeam {
  id: string;
  name: string;
  sport: SportType;
  league: string;
  city: string;
  purchasePrice: number;
  value: number;
  operatingCost: number;
  stadiumName: string;
  stadiumCapacity: number;
  fanSatisfaction: number;
  revenue: {
    ticketSales: number;
    merchandise: number;
    sponsorships: number;
    mediaRights: number;
  };
  staff: {
    coaches: number;
    medical: number;
    scouts: number;
  };
  facilities: {
    training: number;
    medical: number;
    stadium: number;
    academies: number;
  };
  performance: {
    offense: number;
    defense: number;
    teamwork: number;
    morale: number;
  };
  roster: Player[];
  schedule: {
    opponent: string;
    date: string;
    home: boolean;
    result?: {
      win: boolean;
      score: string;
    };
  }[];
  standing: {
    position: number;
    wins: number;
    losses: number;
    ties?: number;
  };
  budget: number;
}

interface TeamOption {
  name: string;
  city: string;
  sport: SportType;
  league: string;
  description: string;
  price: number;
  stadiumName: string;
  stadiumCapacity: number;
  performance: {
    offense: number;
    defense: number;
    teamwork: number;
    morale: number;
  };
  operatingCost: number;
}

// Available teams for purchase
const teamOptions: TeamOption[] = [
  {
    name: "River Kings",
    city: "Portland",
    sport: 'basketball',
    league: "Pro Basketball League",
    description: "A rising basketball team with young talent and dedicated fans.",
    price: 400000000,
    stadiumName: "River Arena",
    stadiumCapacity: 18500,
    performance: {
      offense: 75,
      defense: 70,
      teamwork: 80,
      morale: 85
    },
    operatingCost: 5000000
  },
  {
    name: "Skyline Falcons",
    city: "Denver",
    sport: 'football',
    league: "National Football Conference",
    description: "A football franchise with a storied history and large fan base.",
    price: 800000000,
    stadiumName: "Skyline Stadium",
    stadiumCapacity: 75000,
    performance: {
      offense: 80,
      defense: 85,
      teamwork: 75,
      morale: 80
    },
    operatingCost: 9000000
  },
  {
    name: "Coastal United",
    city: "Miami",
    sport: 'soccer',
    league: "Premier Soccer Association",
    description: "An up-and-coming soccer club with international appeal.",
    price: 250000000,
    stadiumName: "Coastal Field",
    stadiumCapacity: 35000,
    performance: {
      offense: 70,
      defense: 65,
      teamwork: 75,
      morale: 80
    },
    operatingCost: 3000000
  },
  {
    name: "Harbor Mariners",
    city: "Seattle",
    sport: 'baseball',
    league: "American Baseball League",
    description: "A baseball franchise with passionate fans and a beautiful ballpark.",
    price: 350000000,
    stadiumName: "Harbor Park",
    stadiumCapacity: 42000,
    performance: {
      offense: 78,
      defense: 72,
      teamwork: 75,
      morale: 82
    },
    operatingCost: 4500000
  },
  {
    name: "Frost Blades",
    city: "Minneapolis",
    sport: 'hockey',
    league: "National Hockey Association",
    description: "A hockey team with a strong defensive style and loyal fanbase.",
    price: 320000000,
    stadiumName: "Ice Center",
    stadiumCapacity: 19000,
    performance: {
      offense: 72,
      defense: 85,
      teamwork: 78,
      morale: 75
    },
    operatingCost: 4000000
  },
  {
    name: "Summit Climbers",
    city: "Salt Lake City",
    sport: 'basketball',
    league: "Pro Basketball League",
    description: "A basketball team known for their fast-paced style and high-altitude advantage.",
    price: 380000000,
    stadiumName: "Summit Center",
    stadiumCapacity: 19500,
    performance: {
      offense: 82,
      defense: 68,
      teamwork: 75,
      morale: 80
    },
    operatingCost: 4800000
  },
  {
    name: "Capital Commanders",
    city: "Washington D.C.",
    sport: 'football',
    league: "National Football Conference",
    description: "A football team with national recognition and a storied history.",
    price: 750000000,
    stadiumName: "Capital Field",
    stadiumCapacity: 82000,
    performance: {
      offense: 75,
      defense: 80,
      teamwork: 70,
      morale: 75
    },
    operatingCost: 8500000
  },
  {
    name: "Desert Scorpions",
    city: "Phoenix",
    sport: 'soccer',
    league: "Premier Soccer Association",
    description: "A soccer team with a growing fanbase in an expanding market.",
    price: 230000000,
    stadiumName: "Desert Stadium",
    stadiumCapacity: 32000,
    performance: {
      offense: 75,
      defense: 68,
      teamwork: 72,
      morale: 78
    },
    operatingCost: 2800000
  },
  {
    name: "Golden Links",
    city: "Scottsdale",
    sport: 'golf',
    league: "Professional Golf Tour",
    description: "A prestigious golf club that hosts major tournaments and attracts top talent.",
    price: 180000000,
    stadiumName: "Golden Fairways Club",
    stadiumCapacity: 25000,
    performance: {
      offense: 70,
      defense: 75,
      teamwork: 65,
      morale: 85
    },
    operatingCost: 2200000
  },
  {
    name: "Bay Racquets",
    city: "San Francisco",
    sport: 'tennis',
    league: "Global Tennis Association",
    description: "A tennis club with state-of-the-art facilities and a roster of promising players.",
    price: 150000000,
    stadiumName: "Bay Tennis Center",
    stadiumCapacity: 20000,
    performance: {
      offense: 76,
      defense: 72,
      teamwork: 68,
      morale: 82
    },
    operatingCost: 1800000
  },
  {
    name: "Thunder Scrum",
    city: "Auckland",
    sport: 'rugby',
    league: "International Rugby Championship",
    description: "A powerful rugby team with a tradition of excellence and physical play.",
    price: 220000000,
    stadiumName: "Thunder Stadium",
    stadiumCapacity: 40000,
    performance: {
      offense: 82,
      defense: 88,
      teamwork: 85,
      morale: 80
    },
    operatingCost: 2600000
  },
  {
    name: "Beach Spikers",
    city: "Los Angeles",
    sport: 'volleyball',
    league: "Pro Volleyball League",
    description: "A dynamic volleyball team with young talent and a growing fan following.",
    price: 120000000,
    stadiumName: "Beach Arena",
    stadiumCapacity: 15000,
    performance: {
      offense: 78,
      defense: 70,
      teamwork: 85,
      morale: 90
    },
    operatingCost: 1500000
  }
];

// Facility upgrades
const facilityUpgrades = [
  {
    id: "training1",
    name: "Advanced Training Complex",
    description: "State-of-the-art training facilities to improve player development.",
    area: "training",
    improvement: 15,
    cost: 10000000
  },
  {
    id: "medical1",
    name: "Medical Center Enhancement",
    description: "Cutting-edge medical equipment and rehabilitation facilities.",
    area: "medical",
    improvement: 20,
    cost: 7500000
  },
  {
    id: "stadium1",
    name: "Stadium Renovation",
    description: "Improved fan experience with better seating and amenities.",
    area: "stadium",
    improvement: 10,
    capacityIncrease: 5000,
    cost: 25000000
  },
  {
    id: "academies1",
    name: "Youth Academy Development",
    description: "Enhanced youth development program to nurture future talent.",
    area: "academies",
    improvement: 25,
    cost: 15000000
  }
];

// Staff upgrades
const staffUpgrades = [
  {
    id: "coach1",
    name: "Elite Coaching Staff",
    description: "Hire top-tier coaches to improve team strategy and player development.",
    area: "coaches",
    improvement: 15,
    count: 5,
    cost: 8000000
  },
  {
    id: "medical2",
    name: "Medical Team Expansion",
    description: "Additional medical staff to better monitor player health and recovery.",
    area: "medical",
    improvement: 10,
    count: 10,
    cost: 5000000
  },
  {
    id: "scouts1",
    name: "Global Scouting Network",
    description: "Expanded scouting presence to identify talent worldwide.",
    area: "scouts",
    improvement: 20,
    count: 8,
    cost: 6000000
  }
];

// Free agents available for signing
const availablePlayers = [
  {
    id: "p1",
    name: "Marcus Johnson",
    position: "Forward",
    rating: 82,
    age: 28,
    experience: 6,
    potential: 85,
    salary: 12000000,
    contractYears: 3
  },
  {
    id: "p2",
    name: "Tyrone Williams",
    position: "Center",
    rating: 78,
    age: 24,
    experience: 3,
    potential: 88,
    salary: 8500000,
    contractYears: 4
  },
  {
    id: "p3",
    name: "Carlos Rodriguez",
    position: "Guard",
    rating: 84,
    age: 30,
    experience: 9,
    potential: 84,
    salary: 15000000,
    contractYears: 2
  }
];

// Upcoming games
const upcomingGames = [
  { id: "g1", opponent: "Golden Stars", date: "6/15/2025", home: true, difficulty: 3 },
  { id: "g2", opponent: "Metro Titans", date: "6/22/2025", home: false, difficulty: 4 },
  { id: "g3", opponent: "Southern Eagles", date: "6/29/2025", home: true, difficulty: 2 },
  { id: "g4", opponent: "Western Wolves", date: "7/6/2025", home: false, difficulty: 5 }
];

export function SportsTeamOwnership() {
  const { wealth, addWealth } = useCharacter();
  const [team, setTeam] = useState<SportsTeam | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState<TeamOption | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customTeamName, setCustomTeamName] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');
  const [customStadiumName, setCustomStadiumName] = useState('');

  // Opens the team customization modal
  const openCustomizeModal = (option: TeamOption) => {
    // Check if player can afford the team first
    if (wealth < option.price) {
      alert("You don't have enough funds to purchase this team.");
      return;
    }
    
    // Set initial values
    setSelectedTeam(option);
    setCustomTeamName(option.name);
    setCustomCity(option.city);
    setCustomState(''); // Default empty, user will fill
    setCustomStadiumName(option.stadiumName);
    setShowCustomizeModal(true);
  };

  // Handles team customization confirmation
  const confirmCustomization = () => {
    if (!selectedTeam) return;
    
    // Validate inputs
    if (!customTeamName.trim()) {
      alert("Please enter a team name.");
      return;
    }
    
    if (!customCity.trim()) {
      alert("Please enter a city name.");
      return;
    }
    
    if (!customStadiumName.trim()) {
      alert("Please enter a stadium name.");
      return;
    }
    
    // Format location with or without state
    const formattedLocation = customState.trim() 
      ? `${customCity}, ${customState}`
      : customCity;
    
    // Create customized team option
    const customizedOption = {
      ...selectedTeam,
      name: customTeamName,
      city: formattedLocation,
      stadiumName: customStadiumName
    };
    
    // Proceed with purchase
    purchaseTeam(customizedOption);
    
    // Close modal
    setShowCustomizeModal(false);
  };

  const purchaseTeam = (option: TeamOption) => {
    // Create sample roster with random players
    const roster: Player[] = [];
    
    // Generate positions based on sport
    const positions = getPositionsForSport(option.sport);
    
    // Create players for each position
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const rating = 65 + Math.floor(Math.random() * 20); // 65-85 rating
      
      roster.push({
        id: `player_${i}`,
        name: generatePlayerName(),
        position,
        rating,
        salary: calculateSalaryForRating(rating),
        age: 20 + Math.floor(Math.random() * 15), // 20-35 years old
        experience: 1 + Math.floor(Math.random() * 12), // 1-13 years experience
        potential: Math.min(99, rating + Math.floor(Math.random() * 10)), // potential higher than current rating
        happiness: 70 + Math.floor(Math.random() * 30), // 70-100 happiness
        energy: 70 + Math.floor(Math.random() * 30), // 70-100 energy
        contract: {
          years: 1 + Math.floor(Math.random() * 5), // 1-5 year contract
          salary: calculateSalaryForRating(rating)
        }
      });
    }
    
    // Create new team
    const newTeam: SportsTeam = {
      id: `team_${Date.now()}`,
      name: option.name,
      sport: option.sport,
      league: option.league,
      city: option.city,
      purchasePrice: option.price,
      value: option.price,
      operatingCost: option.operatingCost,
      stadiumName: option.stadiumName,
      stadiumCapacity: option.stadiumCapacity,
      fanSatisfaction: 75,
      revenue: {
        ticketSales: option.operatingCost * 0.4,
        merchandise: option.operatingCost * 0.2,
        sponsorships: option.operatingCost * 0.3,
        mediaRights: option.operatingCost * 0.4
      },
      staff: {
        coaches: 10,
        medical: 8,
        scouts: 5
      },
      facilities: {
        training: 60,
        medical: 50,
        stadium: 70,
        academies: 40
      },
      performance: option.performance,
      roster,
      schedule: generateSchedule(),
      standing: {
        position: 8, // mid-table position
        wins: 0,
        losses: 0,
        ties: option.sport === 'soccer' || option.sport === 'football' ? 0 : undefined
      },
      budget: option.operatingCost // Initial operating budget
    };
    
    // Update player wealth
    addWealth(-option.price);
    
    // Set the team
    setTeam(newTeam);
  };

  // Helper function to get positions based on sport
  const getPositionsForSport = (sport: string) => {
    switch (sport) {
      case 'basketball':
        return ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center', 
                'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center',
                'Guard', 'Forward', 'Center'];
      case 'football':
        return ['Quarterback', 'Running Back', 'Wide Receiver', 'Tight End', 'Offensive Tackle', 
                'Offensive Guard', 'Center', 'Defensive End', 'Defensive Tackle', 'Linebacker', 
                'Cornerback', 'Safety', 'Kicker', 'Punter', 'Wide Receiver', 'Linebacker',
                'Cornerback', 'Safety', 'Offensive Tackle', 'Defensive End', 'Running Back'];
      case 'soccer':
        return ['Goalkeeper', 'Right Back', 'Center Back', 'Center Back', 'Left Back', 
                'Defensive Midfielder', 'Central Midfielder', 'Central Midfielder', 
                'Right Winger', 'Striker', 'Left Winger', 'Goalkeeper', 'Defender',
                'Midfielder', 'Striker', 'Winger', 'Defender', 'Midfielder'];
      case 'baseball':
        return ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base', 
                'Shortstop', 'Left Field', 'Center Field', 'Right Field', 'Pitcher',
                'Pitcher', 'Pitcher', 'Pitcher', 'Relief Pitcher', 'Relief Pitcher',
                'Catcher', 'Outfielder', 'Infielder', 'Utility Player'];
      case 'hockey':
        return ['Goaltender', 'Defenseman', 'Defenseman', 'Left Wing', 'Center', 
                'Right Wing', 'Defenseman', 'Defenseman', 'Left Wing', 'Center', 
                'Right Wing', 'Goaltender', 'Defenseman', 'Forward', 'Center', 
                'Wing', 'Defenseman', 'Forward'];
      default:
        return ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
    }
  };

  // Helper function to generate a random player name
  const generatePlayerName = () => {
    const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 
                       'Joseph', 'Thomas', 'Charles', 'Anthony', 'Kevin', 'Mark', 'Jason',
                       'Luis', 'Juan', 'Carlos', 'Miguel', 'Jose', 'Antonio', 'Tyrone',
                       'Jamal', 'DeAndre', 'Marcus', 'Darius', 'Tyson', 'Trevor', 'Andre'];
    
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
                      'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor',
                      'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Young',
                      'Robinson', 'Lewis', 'Walker', 'Allen', 'King', 'Wright', 'Scott'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  };

  // Calculate salary based on rating
  const calculateSalaryForRating = (rating: number) => {
    // Base salary of $1M plus exponential increase based on rating
    return 1000000 + Math.pow(rating - 60, 2) * 5000;
  };

  // Generate a schedule of games
  const generateSchedule = () => {
    const opponents = ['Golden Stars', 'Metro Titans', 'Southern Eagles', 'Western Wolves',
                      'Northern Lights', 'Eastern Knights', 'Pacific Waves', 'Mountain Bears',
                      'Capital Kings', 'Coastal Sharks'];
    
    const schedule = [];
    const currentDate = new Date(2025, 5, 15); // June 15, 2025
    
    for (let i = 0; i < 10; i++) {
      const gameDate = new Date(currentDate);
      gameDate.setDate(currentDate.getDate() + (i * 7)); // Weekly games
      
      schedule.push({
        opponent: opponents[i % opponents.length],
        date: `${gameDate.getMonth() + 1}/${gameDate.getDate()}/${gameDate.getFullYear()}`,
        home: i % 2 === 0, // Alternate home and away games
      });
    }
    
    return schedule;
  };

  // Upgrade facilities
  const upgradeFacility = (upgradeId: string) => {
    if (!team) return;
    
    // Find the upgrade
    const upgrade = facilityUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    // Check if team can afford it
    if (team.budget < upgrade.cost) {
      alert("Your team doesn't have the budget for this upgrade.");
      return;
    }
    
    // Apply the upgrade
    const updatedTeam = { ...team };
    updatedTeam.budget -= upgrade.cost;
    updatedTeam.facilities[upgrade.area as keyof typeof team.facilities] = 
      Math.min(100, (updatedTeam.facilities[upgrade.area as keyof typeof team.facilities] as number) + upgrade.improvement);
    
    // If stadium upgrade, increase capacity
    if (upgrade.area === 'stadium' && upgrade.capacityIncrease) {
      updatedTeam.stadiumCapacity += upgrade.capacityIncrease;
    }
    
    // Overall facility improvements increase team value and performance
    updatedTeam.value = Math.floor(updatedTeam.value * 1.05); // 5% value increase
    updatedTeam.performance.teamwork = Math.min(100, updatedTeam.performance.teamwork + 5);
    updatedTeam.performance.morale = Math.min(100, updatedTeam.performance.morale + 3);
    
    // Update revenue projections for stadium upgrades
    if (upgrade.area === 'stadium') {
      updatedTeam.revenue.ticketSales *= 1.1; // 10% increase in ticket sales
      updatedTeam.fanSatisfaction += 5;
    }
    
    setTeam(updatedTeam);
  };

  // Upgrade staff
  const upgradeStaff = (upgradeId: string) => {
    if (!team) return;
    
    // Find the upgrade
    const upgrade = staffUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    // Check if team can afford it
    if (team.budget < upgrade.cost) {
      alert("Your team doesn't have the budget for this upgrade.");
      return;
    }
    
    // Apply the upgrade
    const updatedTeam = { ...team };
    updatedTeam.budget -= upgrade.cost;
    updatedTeam.staff[upgrade.area as keyof typeof team.staff] =
      (updatedTeam.staff[upgrade.area as keyof typeof team.staff] as number) + upgrade.count;
    
    // Staff improvements affect team performance
    if (upgrade.area === 'coaches') {
      updatedTeam.performance.offense = Math.min(100, updatedTeam.performance.offense + 7);
      updatedTeam.performance.defense = Math.min(100, updatedTeam.performance.defense + 7);
      updatedTeam.performance.teamwork = Math.min(100, updatedTeam.performance.teamwork + 10);
    } else if (upgrade.area === 'medical') {
      // Better medical staff = higher energy and happiness for players
      updatedTeam.roster = updatedTeam.roster.map(player => ({
        ...player,
        energy: Math.min(100, player.energy + 10),
        happiness: Math.min(100, player.happiness + 5)
      }));
    } else if (upgrade.area === 'scouts') {
      // Better scouts improve potential to find talent
      // We'll just increase team value slightly
      updatedTeam.value = Math.floor(updatedTeam.value * 1.02); // 2% value increase
    }
    
    setTeam(updatedTeam);
  };

  // Sign a player
  const signPlayer = (playerId: string) => {
    if (!team) return;
    
    // Find the player
    const player = availablePlayers.find(p => p.id === playerId);
    if (!player) return;
    
    // Check if team can afford the player
    if (team.budget < player.salary) {
      alert("Your team doesn't have the budget to sign this player.");
      return;
    }
    
    // Create player object
    const newPlayer: Player = {
      id: player.id,
      name: player.name,
      position: player.position,
      rating: player.rating,
      age: player.age,
      experience: player.experience,
      potential: player.potential,
      happiness: 90, // Happy to join the team
      energy: 100, // Fresh energy
      salary: player.salary,
      contract: {
        years: player.contractYears,
        salary: player.salary
      }
    };
    
    // Add to team roster
    const updatedTeam = { ...team };
    updatedTeam.roster.push(newPlayer);
    updatedTeam.budget -= player.salary;
    
    // Improve team's performance based on new player
    const performanceBoost = (player.rating - 75) / 10; // Each 10 points above 75 is a +1 boost
    if (performanceBoost > 0) {
      if (player.position.includes('Guard') || player.position.includes('Forward') || 
          player.position.includes('Striker') || player.position.includes('Quarterback')) {
        updatedTeam.performance.offense = Math.min(100, updatedTeam.performance.offense + performanceBoost);
      } else {
        updatedTeam.performance.defense = Math.min(100, updatedTeam.performance.defense + performanceBoost);
      }
    }
    
    setTeam(updatedTeam);
  };

  // Calculate expected game outcome based on performance
  const calculateExpectedOutcome = (game: { difficulty: number; home: boolean }) => {
    if (!team) return { result: '-', winChance: 0 };
    
    // Rating formula: (offense + defense + teamwork + morale) / 4
    const teamRating = (team.performance.offense + team.performance.defense + 
                         team.performance.teamwork + team.performance.morale) / 4;
    
    // Difficulty ranges from 1-5, where 5 is the toughest opponent
    // Convert to a rating: 5 = 90 rating, 1 = 70 rating
    const opponentRating = 70 + (game.difficulty - 1) * 5;
    
    // Home advantage gives +5 boost
    const homeBoost = game.home ? 5 : 0;
    
    // Compare ratings
    const difference = (teamRating + homeBoost) - opponentRating;
    
    // Win chance: 50% for equal ratings, +/- 10% for each 5 point difference
    let winChance = 50 + (difference * 2);
    
    // Cap between 10% and 90%
    winChance = Math.max(10, Math.min(90, winChance));
    
    // Expected result
    let result;
    if (winChance > 70) {
      result = 'Likely Win';
    } else if (winChance > 50) {
      result = 'Slight Favor';
    } else if (winChance > 30) {
      result = 'Slight Underdog';
    } else {
      result = 'Likely Loss';
    }
    
    return { result, winChance };
  };
  
  // Function to simulate a game
  const simulateGame = (gameId: string) => {
    if (!team) return;
    
    const gameIndex = team.schedule.findIndex(g => g.opponent === gameId);
    if (gameIndex === -1) return;
    
    const game = team.schedule[gameIndex];
    
    // Add difficulty level to the game object based on opponent name
    // We'll derive difficulty from the opponent's name (1-5 scale)
    const opponentName = game.opponent.toLowerCase();
    let difficulty = 3; // default medium difficulty
    
    if (opponentName.includes('stars') || opponentName.includes('titans') || opponentName.includes('kings')) {
      difficulty = 5; // toughest opponents
    } else if (opponentName.includes('eagles') || opponentName.includes('wolves')) {
      difficulty = 4; // hard opponents
    } else if (opponentName.includes('knights') || opponentName.includes('sharks')) {
      difficulty = 2; // easier opponents
    } else if (opponentName.includes('bears') || opponentName.includes('waves')) {
      difficulty = 1; // easiest opponents
    }
    
    const gameWithDifficulty = { ...game, difficulty };
    const { winChance } = calculateExpectedOutcome(gameWithDifficulty);
    
    // Random result based on win chance
    const randomResult = Math.random() * 100;
    const win = randomResult <= winChance;
    
    // Generate a realistic score based on sport
    let score;
    switch (team.sport) {
      case 'basketball':
        const teamScore = 85 + Math.floor(Math.random() * 30);
        const opponentScore = win ? teamScore - 5 - Math.floor(Math.random() * 15) : 
                                  teamScore + 5 + Math.floor(Math.random() * 15);
        score = `${teamScore}-${opponentScore}`;
        break;
      case 'football':
        const teamPoints = Math.floor(Math.random() * 5) * 7 + Math.floor(Math.random() * 2) * 3;
        const opponentPoints = win ? Math.max(0, teamPoints - 7 - Math.floor(Math.random() * 14)) : 
                                    teamPoints + 7 + Math.floor(Math.random() * 14);
        score = `${teamPoints}-${opponentPoints}`;
        break;
      case 'soccer':
        const teamGoals = Math.floor(Math.random() * 4);
        const opponentGoals = win ? Math.max(0, teamGoals - 1 - Math.floor(Math.random() * 2)) : 
                                  teamGoals + 1 + Math.floor(Math.random() * 2);
        score = `${teamGoals}-${opponentGoals}`;
        break;
      default:
        const team1 = 1 + Math.floor(Math.random() * 5);
        const team2 = win ? Math.max(0, team1 - 1 - Math.floor(Math.random() * 2)) : 
                          team1 + 1 + Math.floor(Math.random() * 2);
        score = `${team1}-${team2}`;
    }
    
    // Update schedule with result
    const updatedSchedule = [...team.schedule];
    updatedSchedule[gameIndex] = {
      ...game,
      result: {
        win,
        score
      }
    };
    
    // Update team standing
    const updatedStanding = { ...team.standing };
    if (win) {
      updatedStanding.wins += 1;
    } else {
      updatedStanding.losses += 1;
    }
    
    // Calculate new position (simplified)
    // In a real app, this would consider other teams' records
    const gamesPlayed = updatedStanding.wins + updatedStanding.losses + (updatedStanding.ties || 0);
    const winPercentage = updatedStanding.wins / Math.max(1, gamesPlayed);
    
    // Position is inversely related to win percentage
    // 1.0 win% = position 1, 0.0 win% = position 20
    updatedStanding.position = Math.max(1, Math.min(20, Math.round(20 - (winPercentage * 19))));
    
    // Update revenue based on game result
    const revenueUpdate = { ...team.revenue };
    const attendancePercent = 0.7 + (win ? 0.1 : 0) + (game.home ? 0.1 : 0);
    const attendance = Math.floor(team.stadiumCapacity * attendancePercent);
    
    // Average ticket price $50
    const ticketRevenue = attendance * 50;
    revenueUpdate.ticketSales += game.home ? ticketRevenue : 0;
    
    // Merchandise sales
    revenueUpdate.merchandise += game.home ? ticketRevenue * 0.2 : ticketRevenue * 0.05;
    
    // Fan satisfaction changes
    let fanSatisfactionChange = 0;
    if (win) {
      fanSatisfactionChange = game.home ? 3 : 2;
    } else {
      fanSatisfactionChange = game.home ? -3 : -1;
    }
    
    // Update team
    setTeam({
      ...team,
      schedule: updatedSchedule,
      standing: updatedStanding,
      revenue: revenueUpdate,
      fanSatisfaction: Math.max(0, Math.min(100, team.fanSatisfaction + fanSatisfactionChange)),
      budget: team.budget + (game.home ? ticketRevenue : 0) // Add ticket revenue to budget for home games
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Sports Team Ownership</h2>
          <p className="text-muted-foreground">Purchase and manage professional sports franchises</p>
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
              <CardTitle>Purchase a Sports Team</CardTitle>
              <CardDescription>
                Invest in a professional sports franchise and lead it to championship glory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamOptions.map((option) => (
                  <Card key={option.name} className="border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{option.name}</CardTitle>
                      <CardDescription>
                        {option.city} {option.sport.charAt(0).toUpperCase() + option.sport.slice(1)}
                      </CardDescription>
                      <div className="text-xs text-muted-foreground">{option.league}</div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm mb-4">{option.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                              Offense
                            </span>
                            <span>{option.performance.offense}%</span>
                          </div>
                          <Progress value={option.performance.offense} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Activity className="h-4 w-4 mr-1 text-red-500" />
                              Defense
                            </span>
                            <span>{option.performance.defense}%</span>
                          </div>
                          <Progress value={option.performance.defense} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-green-500" />
                              Teamwork
                            </span>
                            <span>{option.performance.teamwork}%</span>
                          </div>
                          <Progress value={option.performance.teamwork} className="h-1.5" />
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-primary/10 text-sm">
                        <div className="flex justify-between mb-1">
                          <span>Stadium:</span>
                          <span>{option.stadiumName}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Capacity:</span>
                          <span>{option.stadiumCapacity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Purchase Price:</span>
                          <span className="font-semibold">{formatCurrency(option.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Costs:</span>
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
            <TabsTrigger value="dashboard">Team Overview</TabsTrigger>
            <TabsTrigger value="roster">Roster Management</TabsTrigger>
            <TabsTrigger value="facilities">Facilities & Staff</TabsTrigger>
            <TabsTrigger value="games">Games & Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-primary/30 md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {team.city} {team.name}
                      </CardTitle>
                      <CardDescription>
                        {team.league} · {team.sport.charAt(0).toUpperCase() + team.sport.slice(1)}
                      </CardDescription>
                    </div>
                    <Badge className={`${
                      team.standing.position <= 3 ? 'bg-green-500' : 
                      team.standing.position <= 8 ? 'bg-primary' : 
                      'bg-orange-500'
                    }`}>
                      #{team.standing.position} in League
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                            Offense
                          </span>
                          <span>{team.performance.offense}%</span>
                        </div>
                        <Progress value={team.performance.offense} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Activity className="h-4 w-4 mr-1 text-red-500" />
                            Defense
                          </span>
                          <span>{team.performance.defense}%</span>
                        </div>
                        <Progress value={team.performance.defense} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-green-500" />
                            Teamwork
                          </span>
                          <span>{team.performance.teamwork}%</span>
                        </div>
                        <Progress value={team.performance.teamwork} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1 text-pink-500" />
                            Morale
                          </span>
                          <span>{team.performance.morale}%</span>
                        </div>
                        <Progress value={team.performance.morale} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="mb-3">
                        <h3 className="text-sm font-medium mb-1">Performance</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <div className="font-bold text-xl">{team.standing.wins}</div>
                            <div className="text-xs text-muted-foreground">Wins</div>
                          </div>
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <div className="font-bold text-xl">{team.standing.losses}</div>
                            <div className="text-xs text-muted-foreground">Losses</div>
                          </div>
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <div className="font-bold text-xl">
                              {team.standing.ties !== undefined ? team.standing.ties : '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">Ties</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-md space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Team Value:</span>
                          <span className="font-semibold">{formatCurrency(team.value)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Operations:</span>
                          <span className="font-semibold">{formatCurrency(team.operatingCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available Budget:</span>
                          <span className="font-semibold">{formatCurrency(team.budget)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fan Satisfaction:</span>
                          <span>{team.fanSatisfaction}%</span>
                        </div>
                        <Progress 
                          value={team.fanSatisfaction} 
                          className={`h-2 ${
                            team.fanSatisfaction > 75 ? 'bg-green-600' : 
                            team.fanSatisfaction > 50 ? 'bg-amber-600' : 'bg-red-600'
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Team Facilities</CardTitle>
                  <CardDescription>{team.stadiumName} ({team.stadiumCapacity.toLocaleString()} seats)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <Building className="h-4 w-4 mr-1 text-purple-500" />
                          Stadium
                        </span>
                        <span>{team.facilities.stadium}%</span>
                      </div>
                      <Progress value={team.facilities.stadium} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                          Training Facilities
                        </span>
                        <span>{team.facilities.training}%</span>
                      </div>
                      <Progress value={team.facilities.training} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1 text-red-500" />
                          Medical Facilities
                        </span>
                        <span>{team.facilities.medical}%</span>
                      </div>
                      <Progress value={team.facilities.medical} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <LayoutGrid className="h-4 w-4 mr-1 text-green-500" />
                          Youth Academies
                        </span>
                        <span>{team.facilities.academies}%</span>
                      </div>
                      <Progress value={team.facilities.academies} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('facilities')}
                  >
                    Manage Facilities
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Revenue & Finance */}
              <Card className="border-primary/30 md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Revenue Sources</CardTitle>
                  <CardDescription>
                    Team financial breakdown and income streams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                        <h3 className="font-medium">Ticket Sales</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(team.revenue.ticketSales)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Per Season
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium">Merchandise</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(team.revenue.merchandise)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Per Season
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-5 w-5 text-purple-500 mr-2" />
                        <h3 className="font-medium">Sponsorships</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(team.revenue.sponsorships)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Per Season
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
                        <h3 className="font-medium">Media Rights</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(team.revenue.mediaRights)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Per Season
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="roster">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Team Roster</h3>
                <div className="text-lg font-semibold">Budget: {formatCurrency(team.budget)}</div>
              </div>
              
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Current Players</CardTitle>
                  <CardDescription>Manage your team's roster and player contracts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm">
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Position</th>
                          <th className="pb-2 text-center">Rating</th>
                          <th className="pb-2 text-center">Age</th>
                          <th className="pb-2 text-center">Experience</th>
                          <th className="pb-2 text-center">Potential</th>
                          <th className="pb-2 text-center">Happiness</th>
                          <th className="pb-2 text-center">Energy</th>
                          <th className="pb-2 text-right">Salary</th>
                          <th className="pb-2 text-right">Contract</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {team.roster.slice(0, 6).map((player) => (
                          <tr key={player.id} className="border-t border-primary/10">
                            <td className="py-2 font-medium">{player.name}</td>
                            <td className="py-2">{player.position}</td>
                            <td className="py-2 text-center">
                              <Badge className={`${
                                player.rating >= 85 ? 'bg-green-500' : 
                                player.rating >= 75 ? 'bg-blue-500' : 
                                player.rating >= 65 ? 'bg-primary' : 'bg-muted'
                              }`}>
                                {player.rating}
                              </Badge>
                            </td>
                            <td className="py-2 text-center">{player.age}</td>
                            <td className="py-2 text-center">{player.experience} yrs</td>
                            <td className="py-2 text-center">{player.potential}</td>
                            <td className="py-2 text-center">
                              <div className="w-16 mx-auto">
                                <Progress 
                                  value={player.happiness} 
                                  className={`h-1.5 ${
                                    player.happiness >= 80 ? 'bg-green-500' : 
                                    player.happiness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} 
                                />
                              </div>
                            </td>
                            <td className="py-2 text-center">
                              <div className="w-16 mx-auto">
                                <Progress 
                                  value={player.energy} 
                                  className={`h-1.5 ${
                                    player.energy >= 80 ? 'bg-green-500' : 
                                    player.energy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} 
                                />
                              </div>
                            </td>
                            <td className="py-2 text-right">{formatCurrency(player.salary)}</td>
                            <td className="py-2 text-right">{player.contract.years} yrs</td>
                          </tr>
                        ))}
                        
                        {team.roster.length > 6 && (
                          <tr>
                            <td colSpan={10} className="py-2 text-center text-muted-foreground">
                              +{team.roster.length - 6} more players
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Available Free Agents</CardTitle>
                  <CardDescription>
                    Sign new players to strengthen your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availablePlayers.map(player => (
                      <Card key={player.id} className="border-primary/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{player.name}</CardTitle>
                          <CardDescription>
                            {player.position} · {player.age} years old
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Rating:</span>
                              <Badge className={`${
                                player.rating >= 85 ? 'bg-green-500' : 
                                player.rating >= 75 ? 'bg-blue-500' : 'bg-primary'
                              }`}>
                                {player.rating}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span>Experience:</span>
                              <span>{player.experience} years</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span>Potential:</span>
                              <Badge variant="outline" className="bg-primary/10">
                                {player.potential}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span>Salary Request:</span>
                              <span className="font-semibold">{formatCurrency(player.salary)}/yr</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span>Contract Length:</span>
                              <span>{player.contractYears} years</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            variant={team.budget < player.salary ? "outline" : "default"}
                            disabled={team.budget < player.salary}
                            onClick={() => signPlayer(player.id)}
                          >
                            {team.budget < player.salary ? "Insufficient Budget" : "Sign Player"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="facilities">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Facility Upgrades</h3>
                
                <div className="space-y-4">
                  {facilityUpgrades.map(upgrade => (
                    <Card key={upgrade.id} className="border-primary/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                        <CardDescription>{upgrade.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Area:</span>
                            <span className="font-medium capitalize">{upgrade.area}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>Improvement:</span>
                            <span className="font-medium">+{upgrade.improvement} points</span>
                          </div>
                          
                          {upgrade.capacityIncrease && (
                            <div className="flex justify-between text-sm">
                              <span>Capacity Increase:</span>
                              <span className="font-medium">+{upgrade.capacityIncrease.toLocaleString()} seats</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-sm">
                            <span>Cost:</span>
                            <span className="font-medium">{formatCurrency(upgrade.cost)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={team.budget < upgrade.cost ? "outline" : "default"}
                          disabled={team.budget < upgrade.cost}
                          onClick={() => upgradeFacility(upgrade.id)}
                        >
                          {team.budget < upgrade.cost ? "Insufficient Budget" : "Purchase Upgrade"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Staff Improvements</h3>
                
                <Card className="border-primary/30 mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Current Staff</CardTitle>
                    <CardDescription>Your team's personnel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-500" />
                          <span>Coaches</span>
                        </div>
                        <span className="font-semibold">{team.staff.coaches}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 mr-2 text-red-500" />
                          <span>Medical Team</span>
                        </div>
                        <span className="font-semibold">{team.staff.medical}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 mr-2 text-yellow-500" />
                          <span>Scouts</span>
                        </div>
                        <span className="font-semibold">{team.staff.scouts}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  {staffUpgrades.map(upgrade => (
                    <Card key={upgrade.id} className="border-primary/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                        <CardDescription>{upgrade.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Department:</span>
                            <span className="font-medium capitalize">{upgrade.area}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>New Staff:</span>
                            <span className="font-medium">+{upgrade.count} people</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>Performance Boost:</span>
                            <span className="font-medium">+{upgrade.improvement} points</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>Cost:</span>
                            <span className="font-medium">{formatCurrency(upgrade.cost)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={team.budget < upgrade.cost ? "outline" : "default"}
                          disabled={team.budget < upgrade.cost}
                          onClick={() => upgradeStaff(upgrade.id)}
                        >
                          {team.budget < upgrade.cost ? "Insufficient Budget" : "Hire Staff"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="games">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Season Schedule</h3>
                <div className="flex gap-2">
                  <Badge className="bg-green-500">{team.standing.wins} W</Badge>
                  <Badge className="bg-red-500">{team.standing.losses} L</Badge>
                  {team.standing.ties !== undefined && (
                    <Badge className="bg-blue-500">{team.standing.ties} T</Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Upcoming games */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Upcoming Games</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.schedule.filter(game => !game.result).map((game, index) => {
                      const expectedOutcome = calculateExpectedOutcome(game);
                      
                      return (
                        <Card key={index} className="border-primary/30">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg flex items-center">
                                  {game.home ? (
                                    <span>
                                      <span className="text-primary">{team.name}</span> vs {game.opponent}
                                    </span>
                                  ) : (
                                    <span>
                                      {game.opponent} vs <span className="text-primary">{team.name}</span>
                                    </span>
                                  )}
                                </CardTitle>
                                <CardDescription className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {game.date} · {game.home ? 'Home' : 'Away'}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="flex justify-between items-center">
                              <div className="text-sm">
                                <div>Expected outcome:</div>
                                <div className={`font-medium ${
                                  calculateExpectedOutcome({
                                    difficulty: game.opponent.toLowerCase().includes('stars') ? 5 :
                                             game.opponent.toLowerCase().includes('titans') ? 5 :
                                             game.opponent.toLowerCase().includes('kings') ? 5 :
                                             game.opponent.toLowerCase().includes('eagles') ? 4 :
                                             game.opponent.toLowerCase().includes('wolves') ? 4 :
                                             game.opponent.toLowerCase().includes('knights') ? 2 :
                                             game.opponent.toLowerCase().includes('sharks') ? 2 :
                                             game.opponent.toLowerCase().includes('bears') ? 1 :
                                             game.opponent.toLowerCase().includes('waves') ? 1 : 3,
                                    home: game.home
                                  }).winChance > 70 ? 'text-green-500' : 
                                  calculateExpectedOutcome({
                                    difficulty: game.opponent.toLowerCase().includes('stars') ? 5 :
                                             game.opponent.toLowerCase().includes('titans') ? 5 :
                                             game.opponent.toLowerCase().includes('kings') ? 5 :
                                             game.opponent.toLowerCase().includes('eagles') ? 4 :
                                             game.opponent.toLowerCase().includes('wolves') ? 4 :
                                             game.opponent.toLowerCase().includes('knights') ? 2 :
                                             game.opponent.toLowerCase().includes('sharks') ? 2 :
                                             game.opponent.toLowerCase().includes('bears') ? 1 :
                                             game.opponent.toLowerCase().includes('waves') ? 1 : 3,
                                    home: game.home
                                  }).winChance > 50 ? 'text-blue-500' : 
                                  calculateExpectedOutcome({
                                    difficulty: game.opponent.toLowerCase().includes('stars') ? 5 :
                                             game.opponent.toLowerCase().includes('titans') ? 5 :
                                             game.opponent.toLowerCase().includes('kings') ? 5 :
                                             game.opponent.toLowerCase().includes('eagles') ? 4 :
                                             game.opponent.toLowerCase().includes('wolves') ? 4 :
                                             game.opponent.toLowerCase().includes('knights') ? 2 :
                                             game.opponent.toLowerCase().includes('sharks') ? 2 :
                                             game.opponent.toLowerCase().includes('bears') ? 1 :
                                             game.opponent.toLowerCase().includes('waves') ? 1 : 3,
                                    home: game.home
                                  }).winChance > 30 ? 'text-amber-500' : 'text-red-500'
                                }`}>
                                  {calculateExpectedOutcome({
                                    difficulty: game.opponent.toLowerCase().includes('stars') ? 5 :
                                             game.opponent.toLowerCase().includes('titans') ? 5 :
                                             game.opponent.toLowerCase().includes('kings') ? 5 :
                                             game.opponent.toLowerCase().includes('eagles') ? 4 :
                                             game.opponent.toLowerCase().includes('wolves') ? 4 :
                                             game.opponent.toLowerCase().includes('knights') ? 2 :
                                             game.opponent.toLowerCase().includes('sharks') ? 2 :
                                             game.opponent.toLowerCase().includes('bears') ? 1 :
                                             game.opponent.toLowerCase().includes('waves') ? 1 : 3,
                                    home: game.home
                                  }).result} ({Math.round(calculateExpectedOutcome({
                                    difficulty: game.opponent.toLowerCase().includes('stars') ? 5 :
                                             game.opponent.toLowerCase().includes('titans') ? 5 :
                                             game.opponent.toLowerCase().includes('kings') ? 5 :
                                             game.opponent.toLowerCase().includes('eagles') ? 4 :
                                             game.opponent.toLowerCase().includes('wolves') ? 4 :
                                             game.opponent.toLowerCase().includes('knights') ? 2 :
                                             game.opponent.toLowerCase().includes('sharks') ? 2 :
                                             game.opponent.toLowerCase().includes('bears') ? 1 :
                                             game.opponent.toLowerCase().includes('waves') ? 1 : 3,
                                    home: game.home
                                  }).winChance)}% win chance)
                                </div>
                              </div>
                              <Button 
                                onClick={() => simulateGame(game.opponent)}
                              >
                                Simulate Game
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {team.schedule.filter(game => !game.result).length === 0 && (
                      <div className="col-span-2 text-center py-6 bg-muted/20 rounded-lg">
                        <Trophy className="h-10 w-10 text-primary/50 mx-auto mb-2" />
                        <p className="text-muted-foreground">Season complete! All games have been played.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Past games results */}
                {team.schedule.some(game => game.result) && (
                  <div className="space-y-4 mt-8">
                    <h4 className="text-lg font-medium">Results</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {team.schedule
                        .filter(game => game.result)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((game, index) => (
                          <Card key={index} className={`border-${game.result?.win ? 'green' : 'red'}-500/30`}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg flex items-center">
                                    {game.home ? (
                                      <span>
                                        <span className="text-primary">{team.name}</span> vs {game.opponent}
                                      </span>
                                    ) : (
                                      <span>
                                        {game.opponent} vs <span className="text-primary">{team.name}</span>
                                      </span>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {game.date} · {game.home ? 'Home' : 'Away'}
                                  </CardDescription>
                                </div>
                                <Badge className={game.result?.win ? 'bg-green-500' : 'bg-red-500'}>
                                  {game.result?.win ? 'WIN' : 'LOSS'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center text-2xl font-bold">
                                {game.result?.score}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}