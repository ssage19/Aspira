// Living Situation options that affects core aspects of the character
// This includes housing and transportation options that provide long-term benefits

import { formatCurrency } from "../utils";

export type HousingType = 'homeless' | 'shared' | 'rental' | 'owned' | 'luxury';
export type VehicleType = 'none' | 'bicycle' | 'economy' | 'standard' | 'luxury' | 'premium';

export interface HousingOption {
  id: string;
  type: HousingType;
  name: string;
  description: string;
  price: number;        // Purchase price (one-time cost)
  monthlyExpense: number; // Monthly expense (for maintenance, mortgage, rent, etc.)
  effects: {
    comfort: number;      // Boost to comfort stat
    health: number;       // Health impact
    stress: number;       // Stress impact (negative is good)
    prestige: number;     // Social prestige impact
  };
  benefits: string[];   // List of benefits in text form
  downsides?: string[]; // List of downsides in text form
  image?: string;       // Optional image URL
  tier: number;         // Tier level (1-5, with 5 being the highest)
}

export interface VehicleOption {
  id: string;
  type: VehicleType;
  name: string;
  description: string;
  price: number;        // Purchase price (one-time cost)
  monthlyExpense: number; // Monthly expense (for maintenance, gas, insurance, etc.)
  effects: {
    comfort: number;    // Boost to comfort stat
    stress: number;     // Stress impact (negative is good)
    prestige: number;   // Social prestige impact
  };
  benefits: string[];   // List of benefits in text form
  downsides?: string[]; // List of downsides in text form
  image?: string;       // Optional image URL
  tier: number;         // Tier level (1-5, with 5 being the highest)
}

// Housing options - sorted from basic to luxury
export const housingOptions: HousingOption[] = [
  {
    id: 'homeless',
    type: 'homeless',
    name: 'No Fixed Housing',
    description: 'Living without permanent housing, either on the streets or in temporary shelters.',
    price: 0,
    monthlyExpense: 0,
    effects: {
      comfort: -50,
      health: -20,
      stress: 50,
      prestige: -40
    },
    benefits: [
      'No housing expenses',
      'Complete location flexibility'
    ],
    downsides: [
      'Major negative impact on health',
      'High stress levels',
      'Difficulty maintaining employment',
      'Low social status'
    ],
    tier: 1
  },
  {
    id: 'shared-housing',
    type: 'shared',
    name: 'Shared Housing',
    description: 'A room in a shared apartment or house with roommates.',
    price: 1500, // Security deposit
    monthlyExpense: 800,
    effects: {
      comfort: 20,
      health: 5,
      stress: 10,
      prestige: 0
    },
    benefits: [
      'Low monthly cost',
      'Potential for social connections',
      'Shared utility expenses'
    ],
    downsides: [
      'Limited privacy',
      'Potential roommate conflicts',
      'Shared responsibilities'
    ],
    tier: 2
  },
  {
    id: 'rental-apartment',
    type: 'rental',
    name: 'Rental Apartment',
    description: 'A private apartment rented on a monthly basis.',
    price: 4000, // First/last month + security deposit
    monthlyExpense: 2000,
    effects: {
      comfort: 40,
      health: 10,
      stress: -10,
      prestige: 10
    },
    benefits: [
      'Privacy and independence',
      'No long-term commitment',
      'Less maintenance responsibility'
    ],
    downsides: [
      'No equity building',
      'Rent increases over time',
      'Rental restrictions'
    ],
    tier: 3
  },
  {
    id: 'owned-home',
    type: 'owned',
    name: 'Owned Home',
    description: 'A house or condo that you own with a mortgage.',
    price: 50000, // Down payment
    monthlyExpense: 3500,
    effects: {
      comfort: 60,
      health: 15,
      stress: -20,
      prestige: 30
    },
    benefits: [
      'Building equity',
      'Freedom to modify property',
      'Potential tax benefits',
      'Stability and security'
    ],
    downsides: [
      'Maintenance responsibilities',
      'Property taxes and insurance',
      'Less flexibility to relocate'
    ],
    tier: 4
  },
  {
    id: 'luxury-residence',
    type: 'luxury',
    name: 'Luxury Residence',
    description: 'A high-end home or penthouse with premium amenities and services.',
    price: 200000, // Down payment or partial payment
    monthlyExpense: 8000,
    effects: {
      comfort: 90,
      health: 25,
      stress: -40,
      prestige: 60
    },
    benefits: [
      'Premium location and views',
      'High-end appliances and finishes',
      'Concierge and maintenance services',
      'Resort-style amenities',
      'High social status'
    ],
    downsides: [
      'Very high costs',
      'Potentially higher property taxes',
      'Expensive upkeep'
    ],
    tier: 5
  }
];

// Vehicle options - sorted from basic to luxury
export const vehicleOptions: VehicleOption[] = [
  {
    id: 'no-vehicle',
    type: 'none',
    name: 'Public Transportation',
    description: 'Relying on public transit, rideshares, and walking.',
    price: 0,
    monthlyExpense: 150,
    effects: {
      comfort: -10,
      stress: 20,
      prestige: -10
    },
    benefits: [
      'No vehicle purchase cost',
      'No maintenance responsibilities',
      'Environmentally friendly'
    ],
    downsides: [
      'Limited flexibility',
      'Dependent on transit schedules',
      'Inconvenient for some destinations'
    ],
    tier: 1
  },
  {
    id: 'bicycle',
    type: 'bicycle',
    name: 'Bicycle',
    description: 'A reliable bicycle for shorter commutes and recreation.',
    price: 500,
    monthlyExpense: 30,
    effects: {
      comfort: 0,
      stress: -5,
      prestige: 0
    },
    benefits: [
      'Health benefits from exercise',
      'Very low operating costs',
      'No parking hassles',
      'Environmentally friendly'
    ],
    downsides: [
      'Limited range',
      'Weather dependent',
      'Not suitable for all transportation needs'
    ],
    tier: 2
  },
  {
    id: 'economy-car',
    type: 'economy',
    name: 'Economy Car',
    description: 'A basic, fuel-efficient vehicle for everyday transportation.',
    price: 20000,
    monthlyExpense: 350,
    effects: {
      comfort: 30,
      stress: -10,
      prestige: 5
    },
    benefits: [
      'Reliable transportation',
      'Good fuel efficiency',
      'Lower insurance costs',
      'Affordable maintenance'
    ],
    downsides: [
      'Basic features only',
      'Less comfortable for long trips',
      'Limited style options'
    ],
    tier: 3
  },
  {
    id: 'standard-car',
    type: 'standard',
    name: 'Standard Car',
    description: 'A mid-range vehicle with a good balance of features and cost.',
    price: 35000,
    monthlyExpense: 500,
    effects: {
      comfort: 50,
      stress: -20,
      prestige: 15
    },
    benefits: [
      'Better comfort and features',
      'Higher reliability',
      'More style options',
      'Good resale value'
    ],
    downsides: [
      'Higher initial cost',
      'Increased maintenance expenses',
      'Higher insurance premiums'
    ],
    tier: 4
  },
  {
    id: 'luxury-car',
    type: 'luxury',
    name: 'Luxury Car',
    description: 'A high-end vehicle with premium features and comfort.',
    price: 75000,
    monthlyExpense: 1200,
    effects: {
      comfort: 75,
      stress: -35,
      prestige: 40
    },
    benefits: [
      'Premium comfort and features',
      'Advanced technology',
      'High status symbol',
      'Superior driving experience'
    ],
    downsides: [
      'High purchase price',
      'Expensive maintenance',
      'Higher insurance and fuel costs'
    ],
    tier: 5
  },
  {
    id: 'premium-car',
    type: 'premium',
    name: 'Premium Sports Car',
    description: 'An elite vehicle that offers ultimate performance, luxury, and status.',
    price: 150000,
    monthlyExpense: 2500,
    effects: {
      comfort: 90,
      stress: -50,
      prestige: 70
    },
    benefits: [
      'Ultimate performance and luxury',
      'Highest status symbol',
      'Exclusive features and technology',
      'Exceptional driving experience'
    ],
    downsides: [
      'Very high purchase price',
      'Extremely expensive maintenance',
      'High insurance premiums',
      'Poor fuel efficiency'
    ],
    tier: 6
  }
];

// Helper function to get a housing option by type
export const getHousingOptionByType = (type: HousingType): HousingOption => {
  const option = housingOptions.find(option => option.type === type);
  if (!option) {
    throw new Error(`Housing option with type ${type} not found`);
  }
  return option;
};

// Helper function to get a vehicle option by type
export const getVehicleOptionByType = (type: VehicleType): VehicleOption => {
  const option = vehicleOptions.find(option => option.type === type);
  if (!option) {
    throw new Error(`Vehicle option with type ${type} not found`);
  }
  return option;
};

// Format the monthly expense for display
export const formatMonthlyExpense = (option: HousingOption | VehicleOption): string => {
  return `${formatCurrency(option.monthlyExpense)}/month`;
};

// Format the purchase price for display
export const formatPurchasePrice = (option: HousingOption | VehicleOption): string => {
  return formatCurrency(option.price);
};