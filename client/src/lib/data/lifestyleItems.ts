// This file contains data for lifestyle and luxury items

export type LifestyleAttributes = {
  socialStatus?: number; // Social status impact
  healthImpact?: number; // Health impact (positive or negative)
  timeCommitment?: number; // Time required to maintain this lifestyle
  environmentalImpact?: number; // Environmental impact
  stressReduction?: number; // Stress reduction potential
  skillDevelopment?: number; // Skills developed
  locationRestrictions?: string[]; // Locations where this item can be used/accessed
  specialBenefits?: string[]; // Special perks or consequences
};

// Enhance existing interfaces with additional attributes
export interface LuxuryItem {
  id: string;
  name: string;
  type: 'luxury';
  price: number;
  brand?: string;
  maintenanceCost: number;
  description: string;
  prestige: number;
  happiness: number;
  unique: boolean;
  attributes?: LifestyleAttributes;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'vehicles';
  price: number;
  maintenanceCost: number;
  description: string;
  prestige: number;
  happiness: number;
  unique: boolean;
  attributes?: LifestyleAttributes;
}

export interface Vacation {
  id: string;
  name: string;
  type: 'vacations';
  price: number;
  duration: string;
  description: string;
  prestige: number;
  happiness: number;
  unique: boolean;
  attributes?: LifestyleAttributes;
}

export interface Experience {
  id: string;
  name: string;
  type: 'experiences';
  price: number;
  description: string;
  prestige: number;
  happiness: number;
  unique: boolean;
  attributes?: LifestyleAttributes;
}

export const luxuryItems: LuxuryItem[] = [
  {
    id: 'watch_entry',
    name: 'Entry Luxury Watch',
    type: 'luxury',
    price: 2500,
    brand: 'Various',
    maintenanceCost: 100, // Annual maintenance
    description: 'Well-crafted timepiece from a respected manufacturer.',
    prestige: 5,
    happiness: 10,
    unique: false,
    attributes: {
      socialStatus: 5,
      healthImpact: 0,
      timeCommitment: 0,
      environmentalImpact: -2,
      stressReduction: 5,
      specialBenefits: ['Small conversation starter with colleagues']
    }
  },
  {
    id: 'watch_mid',
    name: 'Mid-Range Luxury Watch',
    type: 'luxury',
    price: 10000,
    brand: 'Various',
    maintenanceCost: 200,
    description: 'Fine timepiece with excellent craftsmanship and brand heritage.',
    prestige: 15,
    happiness: 15,
    unique: false
  },
  {
    id: 'watch_high',
    name: 'High-End Luxury Watch',
    type: 'luxury',
    price: 50000,
    brand: 'Various',
    maintenanceCost: 500,
    description: 'Exceptional timepiece with superior mechanics and precious materials.',
    prestige: 30,
    happiness: 20,
    unique: false
  },
  {
    id: 'jewelry_entry',
    name: 'Fine Jewelry Piece',
    type: 'luxury',
    price: 5000,
    brand: 'Various',
    maintenanceCost: 100,
    description: 'Beautiful jewelry crafted with precious metals and gemstones.',
    prestige: 10,
    happiness: 15,
    unique: false
  },
  {
    id: 'jewelry_high',
    name: 'Signature Jewelry Collection',
    type: 'luxury',
    price: 100000,
    brand: 'Various',
    maintenanceCost: 1000,
    description: 'Exquisite collection of rare and valuable jewelry pieces.',
    prestige: 40,
    happiness: 25,
    unique: false
  },
  {
    id: 'art_print',
    name: 'Limited Edition Art Print',
    type: 'luxury',
    price: 3000,
    maintenanceCost: 50,
    description: 'Limited edition print from a recognized contemporary artist.',
    prestige: 5,
    happiness: 10,
    unique: false
  },
  {
    id: 'art_painting',
    name: 'Original Painting',
    type: 'luxury',
    price: 25000,
    maintenanceCost: 200,
    description: 'Original artwork from an established artist.',
    prestige: 20,
    happiness: 15,
    unique: false
  },
  {
    id: 'art_collection',
    name: 'Fine Art Collection',
    type: 'luxury',
    price: 500000,
    maintenanceCost: 5000,
    description: 'Curated collection of significant artworks with investment value.',
    prestige: 50,
    happiness: 25,
    unique: false
  },
  {
    id: 'designer_wardrobe',
    name: 'Designer Wardrobe',
    type: 'luxury',
    price: 50000,
    maintenanceCost: 5000,
    description: 'Complete wardrobe of high-end designer clothing and accessories.',
    prestige: 25,
    happiness: 20,
    unique: true
  },
  {
    id: 'wine_collection',
    name: 'Fine Wine Collection',
    type: 'luxury',
    price: 75000,
    maintenanceCost: 2000,
    description: 'Extensive collection of rare and vintage wines from around the world.',
    prestige: 20,
    happiness: 25,
    unique: true
  }
];

export const vehicles = [
  {
    id: 'sedan_entry',
    name: 'Entry-Level Luxury Sedan',
    type: 'vehicles',
    price: 45000,
    maintenanceCost: 200,
    description: 'A comfortable entry into luxury vehicles with good features and reliability.',
    prestige: 10,
    happiness: 15,
    unique: true
  },
  {
    id: 'sedan_high',
    name: 'High-End Luxury Sedan',
    type: 'vehicles',
    price: 120000,
    maintenanceCost: 500,
    description: 'Flagship luxury sedan with cutting-edge technology and exceptional comfort.',
    prestige: 35,
    happiness: 25,
    unique: true
  },
  {
    id: 'sports_car',
    name: 'Sports Car',
    type: 'vehicles',
    price: 180000,
    maintenanceCost: 800,
    description: 'Powerful sports car with exhilarating performance and head-turning design.',
    prestige: 45,
    happiness: 35,
    unique: true,
    attributes: {
      socialStatus: 40,
      healthImpact: 0,
      timeCommitment: 5,
      environmentalImpact: -35,
      stressReduction: 25,
      specialBenefits: [
        'Immediate attention in social settings',
        'Easier access to exclusive clubs and venues',
        'Favorable impression on first business meetings'
      ]
    }
  },
  {
    id: 'exotic_car',
    name: 'Exotic Supercar',
    type: 'vehicles',
    price: 500000,
    maintenanceCost: 3000,
    description: 'Ultra-premium exotic car representing the pinnacle of automotive engineering and exclusivity.',
    prestige: 80,
    happiness: 45,
    unique: true
  },
  {
    id: 'yacht',
    name: 'Luxury Yacht',
    type: 'vehicles',
    price: 3000000,
    maintenanceCost: 20000,
    description: 'Opulent yacht with multiple cabins, entertainment areas, and professional crew.',
    prestige: 90,
    happiness: 55,
    unique: true,
    attributes: {
      socialStatus: 65,
      healthImpact: 10, // Relaxation and ocean air
      timeCommitment: 15, // Management and planning
      environmentalImpact: -45, // Significant fuel consumption
      stressReduction: 45,
      skillDevelopment: 10, // Navigation and maritime knowledge
      specialBenefits: [
        'Access to exclusive marina clubs worldwide',
        'Ability to host high-profile business gatherings',
        'Prestigious social networking opportunities',
        'Access to restricted islands and coastal areas'
      ]
    }
  },
  {
    id: 'private_jet',
    name: 'Private Jet',
    type: 'vehicles',
    price: 15000000,
    maintenanceCost: 50000,
    description: 'Luxurious private jet offering ultimate travel convenience and comfort.',
    prestige: 95,
    happiness: 60,
    unique: true,
    attributes: {
      socialStatus: 85,
      healthImpact: 15, // Reduced travel stress, better rest
      timeCommitment: 10, // Maintenance and crew management
      environmentalImpact: -75, // Extremely high carbon footprint
      stressReduction: 65, // Elimination of commercial travel hassles
      skillDevelopment: 5,
      specialBenefits: [
        'Ability to conduct private business meetings in-flight',
        'Access to restricted VIP terminals at airports',
        'Complete travel privacy and security',
        'Global mobility without commercial flight constraints',
        'Status symbol recognized by global elite'
      ]
    }
  }
];

export const vacations = [
  {
    id: 'luxury_resort',
    name: 'Luxury Resort Getaway',
    type: 'vacations',
    price: 15000,
    duration: '1 week',
    description: 'All-inclusive stay at a premium resort with world-class amenities.',
    prestige: 10,
    happiness: 30,
    unique: false
  },
  {
    id: 'european_tour',
    name: 'European Tour',
    type: 'vacations',
    price: 35000,
    duration: '2 weeks',
    description: 'First-class journey through the finest destinations in Europe.',
    prestige: 15,
    happiness: 35,
    unique: false
  },
  {
    id: 'private_island',
    name: 'Private Island Retreat',
    type: 'vacations',
    price: 75000,
    duration: '1 week',
    description: 'Exclusive vacation on a private island with dedicated staff.',
    prestige: 40,
    happiness: 40,
    unique: false,
    attributes: {
      socialStatus: 35,
      healthImpact: 25, // Complete rejuvenation and relaxation
      timeCommitment: 7, // Full week plus travel
      environmentalImpact: -20, // Remote location travel
      stressReduction: 70, // Complete privacy and serenity
      skillDevelopment: 5, // Water sports, local culture
      specialBenefits: [
        'Complete digital detox opportunity',
        'Exclusive memories and photos for social sharing',
        'Potential to host select friends for unique experiences',
        'Refreshed perspective and creativity boost'
      ]
    }
  },
  {
    id: 'world_cruise',
    name: 'Luxury World Cruise',
    type: 'vacations',
    price: 200000,
    duration: '3 months',
    description: 'Around-the-world journey on an ultra-luxury cruise ship visiting exotic ports.',
    prestige: 50,
    happiness: 45,
    unique: false
  },
  {
    id: 'space_tourism',
    name: 'Space Tourism Experience',
    type: 'vacations',
    price: 500000,
    duration: '1 week',
    description: 'Groundbreaking journey to the edge of space for an unforgettable experience.',
    prestige: 100,
    happiness: 50,
    unique: false,
    attributes: {
      socialStatus: 80,
      healthImpact: -5, // Mild physical stress
      timeCommitment: 14, // Training and preparation time
      environmentalImpact: -40,
      stressReduction: 60, // Perspective-changing experience
      skillDevelopment: 20,
      specialBenefits: [
        'Membership in the exclusive space travelers club',
        'Speaking engagement opportunities',
        'Media coverage potential',
        'Automatic entry to select scientific and futurist circles'
      ]
    }
  }
];

export const experiences = [
  {
    id: 'fine_dining',
    name: 'Michelin Star Restaurant Tour',
    type: 'experiences',
    price: 25000,
    description: 'Experience the world\'s best restaurants with a curated dining journey.',
    prestige: 20,
    happiness: 25,
    unique: false
  },
  {
    id: 'supercar_track',
    name: 'Supercar Track Day',
    type: 'experiences',
    price: 15000,
    description: 'Drive a selection of the world\'s finest supercars on a professional race track.',
    prestige: 15,
    happiness: 35,
    unique: false
  },
  {
    id: 'luxury_safari',
    name: 'Private Luxury Safari',
    type: 'experiences',
    price: 50000,
    description: 'Exclusive wildlife experience with private guides and luxury accommodations.',
    prestige: 30,
    happiness: 40,
    unique: false
  },
  {
    id: 'yacht_week',
    name: 'Mediterranean Yacht Week',
    type: 'experiences',
    price: 100000,
    description: 'Charter a crewed yacht to explore the most beautiful Mediterranean destinations.',
    prestige: 45,
    happiness: 45,
    unique: false
  },
  {
    id: 'exclusive_event',
    name: 'VIP Access to Exclusive Event',
    type: 'experiences',
    price: 50000,
    description: 'Behind-the-scenes access and VIP treatment at a major global event.',
    prestige: 35,
    happiness: 30,
    unique: false
  },
  {
    id: 'personal_concert',
    name: 'Private Performance by Famous Artist',
    type: 'experiences',
    price: 250000,
    description: 'Personal concert by a famous artist for you and your guests.',
    prestige: 60,
    happiness: 40,
    unique: false,
    attributes: {
      socialStatus: 60,
      healthImpact: 5, // Joy and wellbeing
      timeCommitment: 5, // Planning and hosting
      environmentalImpact: -15,
      stressReduction: 35,
      skillDevelopment: 5,
      specialBenefits: [
        'Significant social media exposure potential',
        'Industry connections to entertainment business',
        'Enhanced personal brand and status',
        'Potential long-term relationship with the artist'
      ]
    }
  }
];
