// This file contains hobby-related lifestyle choices and their consequences

export type HobbyAttributes = {
  timeCommitment: number; // Hours per week (affects time management)
  socialValue: number; // Effect on social connections
  skillDevelopment: number; // Skills developed 
  healthImpact: number; // Impact on health (negative values for sedentary hobbies)
  stressReduction: number; // Stress relief potential
  costPerMonth: number; // Ongoing costs
  initialInvestment: number; // Setup costs
};

export interface Hobby {
  id: string;
  name: string;
  type: 'hobbies';
  category: 'physical' | 'creative' | 'intellectual' | 'social' | 'leisure';
  description: string;
  prestige: number;
  happiness: number;
  unique: boolean;
  attributes: HobbyAttributes;
  // Special conditions or benefits specific to this hobby
  benefits?: string[];
  unlocks?: string[];
}

export const hobbies: Hobby[] = [
  // PHYSICAL HOBBIES
  {
    id: 'hobby_golf',
    name: 'Golf Membership',
    type: 'hobbies',
    category: 'physical',
    description: 'Join an exclusive golf club with premium facilities and networking opportunities.',
    prestige: 25,
    happiness: 15,
    unique: true,
    attributes: {
      timeCommitment: 8,
      socialValue: 30,
      skillDevelopment: 15,
      healthImpact: 15,
      stressReduction: 20,
      costPerMonth: 500,
      initialInvestment: 5000
    },
    benefits: [
      'Access to business networking events',
      'Potential for valuable business connections',
      '15% increased chance of successful business deals'
    ],
    unlocks: ['Limited access to exclusive events']
  },
  {
    id: 'hobby_tennis',
    name: 'Tennis Club Membership',
    type: 'hobbies',
    category: 'physical',
    description: 'Regular tennis with coaching at a premium club.',
    prestige: 15,
    happiness: 20,
    unique: true,
    attributes: {
      timeCommitment: 6,
      socialValue: 20,
      skillDevelopment: 20,
      healthImpact: 25,
      stressReduction: 15,
      costPerMonth: 300,
      initialInvestment: 2000
    },
    benefits: [
      'Improved physical fitness',
      'Social connections with other high-income individuals'
    ]
  },
  {
    id: 'hobby_yacht',
    name: 'Yacht Racing',
    type: 'hobbies',
    category: 'physical',
    description: 'Participate in competitive yacht racing events.',
    prestige: 40,
    happiness: 25,
    unique: true,
    attributes: {
      timeCommitment: 12,
      socialValue: 35,
      skillDevelopment: 25,
      healthImpact: 15,
      stressReduction: 20,
      costPerMonth: 2000,
      initialInvestment: 50000
    },
    benefits: [
      'Access to ultra-wealthy social circles',
      'Invitations to exclusive maritime events',
      'Networking with industry leaders'
    ],
    unlocks: ['Access to certain luxury investment opportunities']
  },
  {
    id: 'hobby_equestrian',
    name: 'Equestrian Pursuits',
    type: 'hobbies',
    category: 'physical',
    description: 'Own horses and participate in equestrian events.',
    prestige: 35,
    happiness: 20,
    unique: true,
    attributes: {
      timeCommitment: 10,
      socialValue: 25,
      skillDevelopment: 20,
      healthImpact: 15,
      stressReduction: 25,
      costPerMonth: 3000,
      initialInvestment: 25000
    },
    benefits: [
      'Access to high-society events',
      'Connections with land owners',
      'Potential real estate investment opportunities'
    ]
  },
  {
    id: 'hobby_extreme_sports',
    name: 'Extreme Sports',
    type: 'hobbies',
    category: 'physical',
    description: 'Engage in adventure sports like heli-skiing, scuba diving, and paragliding.',
    prestige: 20,
    happiness: 35,
    unique: false,
    attributes: {
      timeCommitment: 8,
      socialValue: 15,
      skillDevelopment: 25,
      healthImpact: 20,
      stressReduction: 30,
      costPerMonth: 1000,
      initialInvestment: 15000
    },
    benefits: [
      'Improved stress management',
      'Connection with adventure-oriented entrepreneurs',
      'Potential sponsorship opportunities'
    ]
  },
  
  // CREATIVE HOBBIES
  {
    id: 'hobby_art_collecting',
    name: 'Art Collection',
    type: 'hobbies',
    category: 'creative',
    description: 'Curate a personal collection of fine art with investment value.',
    prestige: 40,
    happiness: 25,
    unique: true,
    attributes: {
      timeCommitment: 6,
      socialValue: 30,
      skillDevelopment: 20,
      healthImpact: 0,
      stressReduction: 15,
      costPerMonth: 5000,
      initialInvestment: 100000
    },
    benefits: [
      'Investment value appreciation',
      'Access to exclusive gallery previews',
      'Social connections with cultural elites'
    ],
    unlocks: ['Special art investment opportunities']
  },
  {
    id: 'hobby_music',
    name: 'Music Performance',
    type: 'hobbies',
    category: 'creative',
    description: 'Learn to play a classical instrument with private tutoring.',
    prestige: 20,
    happiness: 30,
    unique: false,
    attributes: {
      timeCommitment: 10,
      socialValue: 15,
      skillDevelopment: 30,
      healthImpact: 5,
      stressReduction: 25,
      costPerMonth: 500,
      initialInvestment: 10000
    },
    benefits: [
      'Cognitive benefits and stress relief',
      'Connections with cultural patrons',
      'Invitations to cultural events'
    ]
  },
  {
    id: 'hobby_culinary',
    name: 'Gourmet Cooking',
    type: 'hobbies',
    category: 'creative',
    description: 'Study with renowned chefs and develop culinary skills.',
    prestige: 15,
    happiness: 25,
    unique: false,
    attributes: {
      timeCommitment: 8,
      socialValue: 20,
      skillDevelopment: 25,
      healthImpact: 10,
      stressReduction: 20,
      costPerMonth: 1000,
      initialInvestment: 15000
    },
    benefits: [
      'Entertainment of business associates',
      'Connections with restaurant industry',
      'Access to food and beverage investment opportunities'
    ]
  },
  {
    id: 'hobby_photography',
    name: 'Fine Art Photography',
    type: 'hobbies',
    category: 'creative',
    description: 'Develop skills in high-end photography with premium equipment.',
    prestige: 15,
    happiness: 25,
    unique: false,
    attributes: {
      timeCommitment: 8,
      socialValue: 15,
      skillDevelopment: 25,
      healthImpact: 5,
      stressReduction: 20,
      costPerMonth: 500,
      initialInvestment: 20000
    },
    benefits: [
      'Travel opportunities', 
      'Connections with media professionals'
    ]
  },
  
  // INTELLECTUAL HOBBIES
  {
    id: 'hobby_collecting',
    name: 'Rare Collectibles',
    type: 'hobbies',
    category: 'intellectual',
    description: 'Collect rare items such as watches, coins, or first editions.',
    prestige: 20,
    happiness: 25,
    unique: false,
    attributes: {
      timeCommitment: 6,
      socialValue: 15,
      skillDevelopment: 20,
      healthImpact: 0,
      stressReduction: 15,
      costPerMonth: 2000,
      initialInvestment: 50000
    },
    benefits: [
      'Alternative investments with appreciation potential',
      'Connections with auction houses and dealers',
      'Potential for significant returns'
    ]
  },
  {
    id: 'hobby_language',
    name: 'Language Study with Immersion',
    type: 'hobbies',
    category: 'intellectual',
    description: 'Learn languages with private tutors and international immersion trips.',
    prestige: 15,
    happiness: 20,
    unique: false,
    attributes: {
      timeCommitment: 10,
      socialValue: 15,
      skillDevelopment: 30,
      healthImpact: 0,
      stressReduction: 10,
      costPerMonth: 1000,
      initialInvestment: 10000
    },
    benefits: [
      'International business opportunities',
      'Cultural connections abroad',
      'Enhanced negotiation skills in foreign markets'
    ]
  },
  {
    id: 'hobby_wine',
    name: 'Wine Connoisseurship',
    type: 'hobbies',
    category: 'intellectual',
    description: 'Develop expertise in fine wines with a premium cellar collection.',
    prestige: 25,
    happiness: 20,
    unique: false,
    attributes: {
      timeCommitment: 5,
      socialValue: 25,
      skillDevelopment: 20,
      healthImpact: -5,
      stressReduction: 15,
      costPerMonth: 2000,
      initialInvestment: 30000
    },
    benefits: [
      'Entertainment value for business associates',
      'Wine investment opportunities', 
      'Access to exclusive wine events and auctions'
    ]
  },
  {
    id: 'hobby_chess',
    name: 'Chess Mastery',
    type: 'hobbies',
    category: 'intellectual',
    description: 'Develop strategic thinking through chess with grandmaster coaching.',
    prestige: 10,
    happiness: 15,
    unique: false,
    attributes: {
      timeCommitment: 8,
      socialValue: 10,
      skillDevelopment: 35,
      healthImpact: 0,
      stressReduction: 15,
      costPerMonth: 500,
      initialInvestment: 5000
    },
    benefits: [
      'Enhanced strategic thinking',
      'Improved decision-making abilities',
      'International tournament opportunities'
    ],
    unlocks: ['Improved results from strategic investments']
  },
  
  // SOCIAL HOBBIES
  {
    id: 'hobby_charity',
    name: 'Philanthropy & Charity Board',
    type: 'hobbies',
    category: 'social',
    description: 'Get involved with high-profile charities and serve on non-profit boards.',
    prestige: 35,
    happiness: 30,
    unique: false,
    attributes: {
      timeCommitment: 10,
      socialValue: 40,
      skillDevelopment: 15,
      healthImpact: 0,
      stressReduction: 10,
      costPerMonth: 5000,
      initialInvestment: 50000
    },
    benefits: [
      'Connections with influential people',
      'Tax benefits', 
      'Enhanced public image', 
      'Corporate sponsorship opportunities'
    ],
    unlocks: ['Access to certain exclusive social circles and events']
  },
  {
    id: 'hobby_events',
    name: 'Gala Event Circuit',
    type: 'hobbies',
    category: 'social',
    description: 'Attend and host exclusive social events and galas.',
    prestige: 30,
    happiness: 20,
    unique: false,
    attributes: {
      timeCommitment: 8,
      socialValue: 35,
      skillDevelopment: 10,
      healthImpact: -5,
      stressReduction: 10,
      costPerMonth: 10000,
      initialInvestment: 25000
    },
    benefits: [
      'Business networking at the highest levels',
      'Media exposure',
      'Access to political and industry leaders'
    ]
  },
  {
    id: 'hobby_club',
    name: 'Private Club Membership',
    type: 'hobbies',
    category: 'social',
    description: 'Join exclusive members-only clubs in major cities.',
    prestige: 35,
    happiness: 20,
    unique: true,
    attributes: {
      timeCommitment: 6,
      socialValue: 40,
      skillDevelopment: 10,
      healthImpact: 0,
      stressReduction: 15,
      costPerMonth: 2000,
      initialInvestment: 100000
    },
    benefits: [
      'Business deals conducted in private settings',
      'Access to influential networks',
      'Global reciprocal club privileges'
    ],
    unlocks: ['Access to private investment opportunities']
  },
  {
    id: 'hobby_polo',
    name: 'Polo & Social Events',
    type: 'hobbies',
    category: 'social',
    description: 'Participate in the polo social scene with the ultra-wealthy.',
    prestige: 45,
    happiness: 25,
    unique: true,
    attributes: {
      timeCommitment: 10,
      socialValue: 45,
      skillDevelopment: 15,
      healthImpact: 15,
      stressReduction: 10,
      costPerMonth: 5000,
      initialInvestment: 150000
    },
    benefits: [
      'Access to old money networks',
      'International social connections',
      'Potential partnerships with wealthy individuals'
    ],
    unlocks: ['Access to ultra-exclusive investment opportunities']
  },
  
  // LEISURE HOBBIES
  {
    id: 'hobby_travel',
    name: 'Luxury World Travel',
    type: 'hobbies',
    category: 'leisure',
    description: 'Experience the world\'s most exclusive destinations and accommodations.',
    prestige: 30,
    happiness: 35,
    unique: false,
    attributes: {
      timeCommitment: 40, // Substantial time away
      socialValue: 25,
      skillDevelopment: 20,
      healthImpact: 15,
      stressReduction: 35,
      costPerMonth: 10000,
      initialInvestment: 50000
    },
    benefits: [
      'International business connections',
      'Cultural exposure and knowledge',
      'Property investment opportunities abroad'
    ]
  },
  {
    id: 'hobby_gaming',
    name: 'High-Stakes Gaming',
    type: 'hobbies',
    category: 'leisure',
    description: 'Participate in high-stakes card games and casino events.',
    prestige: 15,
    happiness: 20,
    unique: false,
    attributes: {
      timeCommitment: 8,
      socialValue: 20,
      skillDevelopment: 15,
      healthImpact: -10,
      stressReduction: 10,
      costPerMonth: 5000,
      initialInvestment: 25000
    },
    benefits: [
      'Potential winnings',
      'Connections with wealthy players',
      'Risk assessment skill development'
    ]
  },
  {
    id: 'hobby_fishing',
    name: 'Deep Sea Fishing',
    type: 'hobbies',
    category: 'leisure',
    description: 'Charter luxury vessels for deep sea fishing expeditions worldwide.',
    prestige: 20,
    happiness: 25,
    unique: false,
    attributes: {
      timeCommitment: 16, // Weekend trips
      socialValue: 15,
      skillDevelopment: 15,
      healthImpact: 10,
      stressReduction: 30,
      costPerMonth: 3000,
      initialInvestment: 50000
    },
    benefits: [
      'Mental refreshment',
      'Connections with boat owners and marine industry',
      'Potential fishing tourism investment opportunities'
    ]
  },
  {
    id: 'hobby_hunting',
    name: 'International Hunting Expeditions',
    type: 'hobbies',
    category: 'leisure',
    description: 'Participate in exclusive, ethical hunting expeditions globally.',
    prestige: 20,
    happiness: 20,
    unique: false,
    attributes: {
      timeCommitment: 20, // Several trips per year
      socialValue: 15,
      skillDevelopment: 15,
      healthImpact: 10,
      stressReduction: 25,
      costPerMonth: 2000,
      initialInvestment: 75000
    },
    benefits: [
      'Land owner connections',
      'Real estate investment opportunities in hunting regions',
      'Conservation-related networking'
    ]
  }
];