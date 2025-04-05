// Essential items that restore basic needs (hunger, thirst, energy, social)

export interface EssentialItem {
  id: string;
  name: string;
  type: 'food' | 'drink' | 'rest' | 'exercise' | 'social';
  description: string;
  price: number;
  effects: {
    hunger?: number;
    thirst?: number;
    energy?: number;
    health?: number;
    stress?: number;
    socialConnections?: number;
  };
  timeRequired?: number; // in hours
  duration?: number; // Time this activity takes (hours)
  needsPrerequisite?: boolean;
  prerequisite?: string;
  image?: string;
}

// Food items
export const foodItems: EssentialItem[] = [
  {
    id: 'basic-meal',
    name: 'Basic Meal',
    type: 'food',
    description: 'A simple, affordable meal that satisfies basic hunger needs.',
    price: 8.99,
    effects: {
      hunger: 30,
      energy: 5
    }
  },
  {
    id: 'quality-meal',
    name: 'Quality Meal',
    type: 'food',
    description: 'A well-balanced meal with better nutrition and taste.',
    price: 18.99,
    effects: {
      hunger: 50,
      energy: 10,
      health: 2
    }
  },
  {
    id: 'gourmet-meal',
    name: 'Gourmet Meal',
    type: 'food',
    description: 'A high-end dining experience with excellent nutrition and taste.',
    price: 45.99,
    effects: {
      hunger: 75,
      energy: 15,
      health: 5,
      stress: -5
    }
  },
  {
    id: 'snack',
    name: 'Quick Snack',
    type: 'food',
    description: 'A small snack to hold you over between meals.',
    price: 3.99,
    effects: {
      hunger: 15,
      energy: 3
    }
  },
  {
    id: 'health-food',
    name: 'Health Food Package',
    type: 'food',
    description: 'Organic, nutrient-rich foods that improve overall health.',
    price: 29.99,
    effects: {
      hunger: 60,
      health: 8,
      energy: 12
    }
  }
];

// Drink items
export const drinkItems: EssentialItem[] = [
  {
    id: 'water',
    name: 'Water',
    type: 'drink',
    description: 'Stay hydrated with pure, refreshing water.',
    price: 1.99,
    effects: {
      thirst: 40
    }
  },
  {
    id: 'coffee',
    name: 'Coffee',
    type: 'drink',
    description: 'A boost of caffeine to start your day.',
    price: 4.99,
    effects: {
      thirst: 15,
      energy: 20,
      stress: 3
    }
  },
  {
    id: 'tea',
    name: 'Herbal Tea',
    type: 'drink',
    description: 'A calming tea to relieve stress and improve focus.',
    price: 3.99,
    effects: {
      thirst: 25,
      stress: -8,
      energy: 5
    }
  },
  {
    id: 'juice',
    name: 'Fresh Juice',
    type: 'drink',
    description: 'Vitamin-packed fresh juice.',
    price: 6.99,
    effects: {
      thirst: 35,
      health: 5
    }
  },
  {
    id: 'premium-water',
    name: 'Premium Mineral Water',
    type: 'drink',
    description: 'High-quality mineral water with essential nutrients.',
    price: 5.99,
    effects: {
      thirst: 60,
      health: 3
    }
  }
];

// Exercise activities
export const exerciseActivities: EssentialItem[] = [
  {
    id: 'quick-workout',
    name: 'Quick Home Workout',
    type: 'exercise',
    description: 'A 30-minute workout you can do at home.',
    price: 0,
    timeRequired: 0.5,
    effects: {
      energy: -5,
      health: 5,
      stress: -10
    }
  },
  {
    id: 'gym-session',
    name: 'Gym Session',
    type: 'exercise',
    description: 'A full workout at a local gym.',
    price: 15,
    timeRequired: 1.5,
    effects: {
      energy: -15,
      health: 12,
      stress: -20
    }
  },
  {
    id: 'run',
    name: 'Outdoor Run',
    type: 'exercise',
    description: 'A refreshing run through a park or neighborhood.',
    price: 0,
    timeRequired: 1,
    effects: {
      energy: -10,
      health: 8,
      stress: -15
    }
  },
  {
    id: 'yoga',
    name: 'Yoga Class',
    type: 'exercise',
    description: 'A rejuvenating yoga session for mind and body.',
    price: 20,
    timeRequired: 1,
    effects: {
      energy: 10,
      health: 7,
      stress: -25
    }
  },
  {
    id: 'personal-trainer',
    name: 'Personal Training',
    type: 'exercise',
    description: 'One-on-one session with a fitness professional.',
    price: 75,
    timeRequired: 2,
    effects: {
      energy: -20,
      health: 15,
      stress: -15
    }
  }
];

// Rest activities
export const restActivities: EssentialItem[] = [
  {
    id: 'short-nap',
    name: 'Short Nap',
    type: 'rest',
    description: 'A quick 30-minute nap to recharge.',
    price: 0,
    timeRequired: 0.5,
    effects: {
      energy: 20,
      stress: -5
    }
  },
  {
    id: 'meditation',
    name: 'Meditation Session',
    type: 'rest',
    description: 'A guided meditation to calm your mind.',
    price: 0,
    timeRequired: 0.5,
    effects: {
      energy: 10,
      stress: -15
    }
  },
  {
    id: 'full-night-sleep',
    name: 'Full Night Sleep',
    type: 'rest',
    description: 'A complete 8-hour sleep cycle.',
    price: 0,
    timeRequired: 8,
    effects: {
      energy: 80,
      health: 5,
      stress: -20
    }
  },
  {
    id: 'spa-day',
    name: 'Spa Day',
    type: 'rest',
    description: 'A relaxing day at the spa with various treatments.',
    price: 150,
    timeRequired: 3,
    effects: {
      energy: 40,
      health: 8,
      stress: -40
    }
  },
  {
    id: 'massage',
    name: 'Professional Massage',
    type: 'rest',
    description: 'A therapeutic massage to release tension.',
    price: 80,
    timeRequired: 1,
    effects: {
      energy: 25,
      health: 5,
      stress: -30
    }
  }
];

// Social activities
export const socialActivities: EssentialItem[] = [
  {
    id: 'coffee-friend',
    name: 'Coffee with a Friend',
    type: 'social',
    description: 'Catch up with a friend over coffee.',
    price: 10,
    timeRequired: 1,
    effects: {
      socialConnections: 10,
      stress: -8,
      energy: 5,
      thirst: 15
    }
  },
  {
    id: 'dinner-out',
    name: 'Dinner Outing',
    type: 'social',
    description: 'Enjoy dinner at a restaurant with people.',
    price: 35,
    timeRequired: 2,
    effects: {
      socialConnections: 15,
      stress: -10,
      hunger: 60
    }
  },
  {
    id: 'movie-night',
    name: 'Movie Night',
    type: 'social',
    description: 'Watch a movie with friends.',
    price: 20,
    timeRequired: 3,
    effects: {
      socialConnections: 12,
      stress: -15
    }
  },
  {
    id: 'house-party',
    name: 'House Party',
    type: 'social',
    description: 'Attend or host a house party.',
    price: 50,
    timeRequired: 4,
    effects: {
      socialConnections: 25,
      stress: -5,
      energy: -15
    }
  },
  {
    id: 'networking-event',
    name: 'Networking Event',
    type: 'social',
    description: 'Attend a professional networking event.',
    price: 30,
    timeRequired: 2,
    effects: {
      socialConnections: 20,
      stress: 10,
      energy: -10
    }
  }
];

// Get all essentials
export const getAllEssentials = (): EssentialItem[] => {
  return [
    ...foodItems,
    ...drinkItems,
    ...exerciseActivities,
    ...restActivities,
    ...socialActivities
  ];
};

// Get essentials by type
export const getEssentialsByType = (type: EssentialItem['type']): EssentialItem[] => {
  switch (type) {
    case 'food':
      return foodItems;
    case 'drink':
      return drinkItems;
    case 'exercise':
      return exerciseActivities;
    case 'rest':
      return restActivities;
    case 'social':
      return socialActivities;
    default:
      return [];
  }
};