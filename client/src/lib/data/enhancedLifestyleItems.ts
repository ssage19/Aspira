// Enhanced lifestyle items with deeper consequences and interactions
import { LifestyleAttributes } from './lifestyleItems';

// Extended attributes for enhanced lifestyle items
export interface EnhancedLifestyleAttributes extends LifestyleAttributes {
  // Long-term health effects
  chronicHealthCondition?: {
    name: string;
    description: string;
    severityLevel: 'mild' | 'moderate' | 'severe';
    healthImpactPerMonth: number;
    treatmentCostPerMonth?: number;
    reversible: boolean;
    reversalTimeInMonths?: number;
  }[];
  
  // Mental wellbeing impacts
  mentalHealthEffects?: {
    type: 'positive' | 'negative';
    description: string;
    happinessImpactPerMonth: number;
    stressImpactPerMonth: number;
    cumulativeEffect: boolean; // Whether the effect builds up over time
  }[];
  
  // Relationship impact
  relationshipEffects?: {
    area: 'romantic' | 'family' | 'friends' | 'professional';
    description: string;
    socialConnectionsImpact: number;
  }[];
  
  // Career consequences
  careerEffects?: {
    aspect: 'reputation' | 'opportunities' | 'skill development' | 'networking';
    description: string;
    prestigeImpact: number;
    incomeMultiplier?: number; // Multiplier for income potential
  }[];
  
  // Personal development
  personalGrowth?: {
    area: 'knowledge' | 'wisdom' | 'creativity' | 'discipline' | 'resilience';
    description: string;
    skillImpact: {
      skillName: 'intelligence' | 'creativity' | 'charisma' | 'technical' | 'leadership';
      value: number;
    }[];
  }[];
  
  // Financial wisdom consequences
  financialWisdom?: {
    aspect: 'saving' | 'investing' | 'spending' | 'budgeting';
    description: string;
    wealthGrowthMultiplier?: number; // Affects passive income and investment returns
    expenseReductionPercentage?: number; // Reduces monthly expenses by percentage
  }[];
  
  // Special triggers and thresholds
  specialTriggers?: {
    triggerType: 'time-based' | 'health-based' | 'stress-based' | 'financial-based' | 'social-based';
    threshold: number; // The value that triggers this effect
    eventId: string; // Reference to a special event that can be triggered
    description: string;
    probability: number; // Chance of triggering each check (0-1)
  }[];
  
  // Synergy effects with other lifestyle choices
  synergies?: {
    itemId: string; // The ID of another lifestyle item that creates synergy
    description: string;
    bonusEffects: {
      attribute: 'happiness' | 'health' | 'prestige' | 'stress' | 'socialConnections' | 'wealth';
      value: number;
    }[];
  }[];
  
  // Conflicts with other lifestyle choices
  conflicts?: {
    itemId: string; // The ID of another lifestyle item that creates conflict
    description: string;
    penaltyEffects: {
      attribute: 'happiness' | 'health' | 'prestige' | 'stress' | 'socialConnections' | 'wealth';
      value: number;
    }[];
  }[];
}

// Extended interfaces for enhanced lifestyle items
export interface EnhancedLifestyleItem {
  id: string;
  name: string;
  type: string;
  category?: string; // Optional subcategory
  price: number;
  maintenanceCost: number;
  description: string;
  prestige: number;
  happiness: number;
  unique: boolean;
  durationInDays?: number;
  attributes: EnhancedLifestyleAttributes;
  
  // New properties for enhanced items
  tier: 'basic' | 'premium' | 'luxury' | 'elite';
  sustainabilityRating: number; // 1-100 scale, higher is more sustainable
  requires?: { // Prerequisites for this lifestyle choice
    netWorth?: number;
    itemIds?: string[];
    attributes?: { [key: string]: number }; // Minimum attribute values required
  };
  excludes?: string[]; // IDs of lifestyle items that cannot be owned simultaneously
  unlocks?: string[]; // IDs of lifestyle items or opportunities this unlocks
}

// =========================================
// WELLNESS & SELF-CARE LIFESTYLE ITEMS
// =========================================
export const wellnessItems: EnhancedLifestyleItem[] = [
  {
    id: 'wellness_gym_membership',
    name: 'Premium Gym Membership',
    type: 'wellness',
    category: 'fitness',
    price: 2000, // Annual membership paid upfront
    maintenanceCost: 0, // Monthly maintenance already covered in annual fee
    description: 'Access to a high-end fitness center with premium equipment, classes, and amenities.',
    prestige: 5,
    happiness: 15,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 70,
    attributes: {
      socialStatus: 5,
      healthImpact: 25,
      timeCommitment: 8, // 8 hours per week
      environmentalImpact: -5,
      stressReduction: 30,
      skillDevelopment: 5,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Regular exercise improves mood and reduces anxiety',
          happinessImpactPerMonth: 2,
          stressImpactPerMonth: -5,
          cumulativeEffect: true
        }
      ],
      chronicHealthCondition: [
        {
          name: 'Improved cardiovascular health',
          description: 'Regular exercise strengthens your heart and improves overall fitness',
          severityLevel: 'mild',
          healthImpactPerMonth: 2,
          reversible: true,
          reversalTimeInMonths: 3
        }
      ],
      personalGrowth: [
        {
          area: 'discipline',
          description: 'Maintaining a workout routine builds discipline and mental fortitude',
          skillImpact: [
            { skillName: 'leadership', value: 0.5 }
          ]
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 6, // 6 months of consistent gym usage
          eventId: 'fitness_transformation',
          description: 'Significant physical transformation that others notice',
          probability: 0.7
        }
      ],
      synergies: [
        {
          itemId: 'wellness_nutrition_coaching',
          description: 'Combining exercise with proper nutrition amplifies results',
          bonusEffects: [
            { attribute: 'health', value: 5 },
            { attribute: 'happiness', value: 3 }
          ]
        }
      ]
    }
  },
  {
    id: 'wellness_nutrition_coaching',
    name: 'Personalized Nutrition Coaching',
    type: 'wellness',
    category: 'nutrition',
    price: 1500,
    maintenanceCost: 250, // Monthly coaching sessions
    description: 'One-on-one guidance from a certified nutritionist with customized meal plans and ongoing support.',
    prestige: 8,
    happiness: 12,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 85,
    attributes: {
      socialStatus: 7,
      healthImpact: 30,
      timeCommitment: 4, // 4 hours per week for meal prep and consultations
      environmentalImpact: 20, // Positive impact from healthier food choices
      stressReduction: 15,
      skillDevelopment: 10,
      chronicHealthCondition: [
        {
          name: 'Improved metabolic health',
          description: 'Balanced nutrition improves energy levels and metabolic markers',
          severityLevel: 'moderate',
          healthImpactPerMonth: 3,
          reversible: true,
          reversalTimeInMonths: 2
        }
      ],
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Balanced nutrition improves mood stability and cognitive function',
          happinessImpactPerMonth: 1,
          stressImpactPerMonth: -3,
          cumulativeEffect: true
        }
      ],
      financialWisdom: [
        {
          aspect: 'spending',
          description: 'Learning to meal plan reduces food waste and impulse purchases',
          expenseReductionPercentage: 0.05 // 5% reduction in food expenses
        }
      ],
      synergies: [
        {
          itemId: 'wellness_gym_membership',
          description: 'Proper nutrition maximizes physical training results',
          bonusEffects: [
            { attribute: 'health', value: 5 },
            { attribute: 'prestige', value: 2 }
          ]
        }
      ],
      conflicts: [
        {
          itemId: 'lifestyle_fast_food_habit',
          description: 'Fast food undermines nutrition coaching benefits',
          penaltyEffects: [
            { attribute: 'health', value: -10 },
            { attribute: 'happiness', value: -5 }
          ]
        }
      ]
    }
  },
  {
    id: 'wellness_meditation_retreat',
    name: 'Luxury Meditation Retreat',
    type: 'wellness',
    category: 'mental health',
    price: 5000,
    maintenanceCost: 0,
    description: 'A week-long immersive meditation experience at a remote luxury retreat center.',
    prestige: 15,
    happiness: 25,
    unique: false,
    durationInDays: 7, // One week duration
    tier: 'luxury',
    sustainabilityRating: 90,
    attributes: {
      socialStatus: 15,
      healthImpact: 15,
      timeCommitment: 168, // Full week (168 hours)
      environmentalImpact: 5, // Minor positive impact
      stressReduction: 50,
      skillDevelopment: 8,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Intensive meditation practice reduces anxiety and improves emotional regulation',
          happinessImpactPerMonth: 5,
          stressImpactPerMonth: -20,
          cumulativeEffect: false // One-time effect
        }
      ],
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Deepened self-awareness and mindfulness that persists after the retreat',
          skillImpact: [
            { skillName: 'leadership', value: 2 },
            { skillName: 'charisma', value: 1 }
          ]
        }
      ],
      specialTriggers: [
        {
          triggerType: 'stress-based',
          threshold: 80, // When stress reaches 80%
          eventId: 'wellness_breakthrough',
          description: 'Profound mental clarity that helps resolve a persistent life challenge',
          probability: 0.4
        }
      ]
    }
  },
  {
    id: 'wellness_therapy',
    name: 'Executive Therapy Sessions',
    type: 'wellness',
    category: 'mental health',
    price: 2000, // Initial commitment
    maintenanceCost: 800, // Monthly sessions
    description: 'Regular sessions with a top psychologist specializing in high-performance individuals.',
    prestige: 5,
    happiness: 20,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 100,
    attributes: {
      socialStatus: 0, // Neutral or private
      healthImpact: 10,
      timeCommitment: 6, // 6 hours per month including homework
      environmentalImpact: 0,
      stressReduction: 40,
      skillDevelopment: 15,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Professional guidance helps resolve deep-seated issues and improve emotional intelligence',
          happinessImpactPerMonth: 3,
          stressImpactPerMonth: -8,
          cumulativeEffect: true
        }
      ],
      relationshipEffects: [
        {
          area: 'romantic',
          description: 'Improved communication skills and emotional awareness benefit relationships',
          socialConnectionsImpact: 10
        },
        {
          area: 'professional',
          description: 'Better stress management and interpersonal skills improve workplace dynamics',
          socialConnectionsImpact: 15
        }
      ],
      careerEffects: [
        {
          aspect: 'reputation',
          description: 'Improved emotional regulation leads to better decision-making at work',
          prestigeImpact: 5,
          incomeMultiplier: 1.05
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 12, // After 12 months of therapy
          eventId: 'personal_breakthrough',
          description: 'Major psychological breakthrough that transforms your outlook on life',
          probability: 0.6
        }
      ]
    }
  },
  {
    id: 'wellness_spa_membership',
    name: 'Private Spa Membership',
    type: 'wellness',
    category: 'relaxation',
    price: 5000,
    maintenanceCost: 500,
    description: 'Exclusive access to a luxury spa with premium treatments, amenities, and private areas.',
    prestige: 20,
    happiness: 30,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 60,
    attributes: {
      socialStatus: 25,
      healthImpact: 15,
      timeCommitment: 8,
      environmentalImpact: -15,
      stressReduction: 45,
      skillDevelopment: 0,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Regular relaxation rituals improve sleep quality and reduce cortisol levels',
          happinessImpactPerMonth: 4,
          stressImpactPerMonth: -10,
          cumulativeEffect: false
        }
      ],
      relationshipEffects: [
        {
          area: 'romantic',
          description: 'Option for couples treatments enhances relationship bonding',
          socialConnectionsImpact: 8
        }
      ],
      synergies: [
        {
          itemId: 'wellness_therapy',
          description: 'Physical relaxation enhances mental health treatment effectiveness',
          bonusEffects: [
            { attribute: 'stress', value: -10 },
            { attribute: 'happiness', value: 5 }
          ]
        }
      ]
    }
  }
];

// =========================================
// SOCIAL LIFESTYLE CHOICES
// =========================================
export const socialLifestyleItems: EnhancedLifestyleItem[] = [
  {
    id: 'social_country_club',
    name: 'Exclusive Country Club Membership',
    type: 'social',
    category: 'elite networking',
    price: 50000, // Initiation fee
    maintenanceCost: 2000, // Monthly dues
    description: 'Membership to a prestigious country club with golf, tennis, dining, and exclusive events.',
    prestige: 40,
    happiness: 25,
    unique: false,
    tier: 'elite',
    sustainabilityRating: 40,
    requires: {
      netWorth: 1000000, // Minimum net worth requirement
    },
    attributes: {
      socialStatus: 50,
      healthImpact: 10,
      timeCommitment: 16, // 16 hours per week
      environmentalImpact: -35,
      stressReduction: 20,
      skillDevelopment: 5,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Access to business leaders and potential partners in a relaxed setting',
          socialConnectionsImpact: 35
        }
      ],
      careerEffects: [
        {
          aspect: 'networking',
          description: 'Regular interaction with influential individuals creates career opportunities',
          prestigeImpact: 15,
          incomeMultiplier: 1.15
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 6, // After 6 months of membership
          eventId: 'elite_business_opportunity',
          description: 'A chance to invest in an exclusive deal only available to members',
          probability: 0.3
        }
      ]
    }
  },
  {
    id: 'social_charity_board',
    name: 'Charity Foundation Board Position',
    type: 'social',
    category: 'philanthropy',
    price: 25000, // Expected annual donation
    maintenanceCost: 0,
    description: 'Board membership on a respected charitable foundation with significant influence.',
    prestige: 45,
    happiness: 35,
    unique: true,
    tier: 'elite',
    sustainabilityRating: 95,
    requires: {
      netWorth: 500000,
      attributes: { prestige: 30 }
    },
    attributes: {
      socialStatus: 45,
      healthImpact: 5,
      timeCommitment: 10,
      environmentalImpact: 40, // Very positive impact
      stressReduction: -5, // Slight increase in stress from responsibility
      skillDevelopment: 15,
      careerEffects: [
        {
          aspect: 'reputation',
          description: 'Recognized public service enhances professional reputation',
          prestigeImpact: 25,
          incomeMultiplier: 1.1
        }
      ],
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Exposure to complex social problems develops wisdom and perspective',
          skillImpact: [
            { skillName: 'leadership', value: 3 },
            { skillName: 'charisma', value: 2 }
          ]
        }
      ],
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Sense of purpose and contribution improves overall life satisfaction',
          happinessImpactPerMonth: 3,
          stressImpactPerMonth: 2, // Some stress but fulfilling
          cumulativeEffect: true
        }
      ]
    }
  },
  {
    id: 'social_private_members_club',
    name: 'Private Urban Club Membership',
    type: 'social',
    category: 'networking',
    price: 15000, // Initiation fee
    maintenanceCost: 1000, // Monthly dues
    description: 'Access to an exclusive downtown social club frequented by industry leaders and cultural elites.',
    prestige: 35,
    happiness: 20,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 65,
    attributes: {
      socialStatus: 40,
      healthImpact: 0,
      timeCommitment: 12,
      environmentalImpact: -15,
      stressReduction: 15,
      skillDevelopment: 10,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Urban networking hub connects you with diverse professionals',
          socialConnectionsImpact: 30
        },
        {
          area: 'friends',
          description: 'Regular events provide opportunities to build meaningful friendships',
          socialConnectionsImpact: 25
        }
      ],
      careerEffects: [
        {
          aspect: 'opportunities',
          description: 'Inside access to new ventures and opportunities before they go public',
          prestigeImpact: 10,
          incomeMultiplier: 1.08
        }
      ],
      synergies: [
        {
          itemId: 'social_charity_board',
          description: 'Club connections enhance your charitable influence',
          bonusEffects: [
            { attribute: 'prestige', value: 15 },
            { attribute: 'socialConnections', value: 10 }
          ]
        }
      ]
    }
  },
  {
    id: 'social_luxury_events',
    name: 'VIP Event Circuit Access',
    type: 'social',
    category: 'entertainment',
    price: 0, // No upfront cost, pay per event
    maintenanceCost: 5000, // Average monthly spending on events
    description: 'Regular attendance at premium galas, exclusive openings, and celebrity events.',
    prestige: 30,
    happiness: 25,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 30,
    attributes: {
      socialStatus: 35,
      healthImpact: -5, // Late nights and drinking
      timeCommitment: 16,
      environmentalImpact: -25,
      stressReduction: 10,
      skillDevelopment: 5,
      relationshipEffects: [
        {
          area: 'friends',
          description: 'Expands your social circle with high-status individuals',
          socialConnectionsImpact: 20
        }
      ],
      mentalHealthEffects: [
        {
          type: 'negative',
          description: 'FOMO (fear of missing out) and social comparison can cause anxiety',
          happinessImpactPerMonth: -1,
          stressImpactPerMonth: 3,
          cumulativeEffect: true
        }
      ],
      chronicHealthCondition: [
        {
          name: 'Social exhaustion',
          description: 'Constant social obligations can lead to burnout',
          severityLevel: 'mild',
          healthImpactPerMonth: -1,
          reversible: true,
          reversalTimeInMonths: 1
        }
      ],
      conflicts: [
        {
          itemId: 'wellness_meditation_retreat',
          description: 'Hectic social calendar undermines mindfulness practice',
          penaltyEffects: [
            { attribute: 'stress', value: 15 },
            { attribute: 'health', value: -5 }
          ]
        }
      ]
    }
  }
];

// =========================================
// HABIT-BASED LIFESTYLE CHOICES
// =========================================
export const lifestyleHabits: EnhancedLifestyleItem[] = [
  {
    id: 'lifestyle_digital_minimalism',
    name: 'Digital Minimalism Practice',
    type: 'habit',
    category: 'mental health',
    price: 0, // Free to adopt
    maintenanceCost: 0,
    description: 'Deliberate reduction of screen time and digital distractions in favor of high-quality activities.',
    prestige: 5,
    happiness: 25,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 100,
    attributes: {
      socialStatus: 5,
      healthImpact: 15,
      timeCommitment: -10, // Actually frees up time
      environmentalImpact: 20,
      stressReduction: 35,
      skillDevelopment: 10,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Reduced information overload improves focus and mental clarity',
          happinessImpactPerMonth: 3,
          stressImpactPerMonth: -5,
          cumulativeEffect: true
        }
      ],
      personalGrowth: [
        {
          area: 'discipline',
          description: 'Resisting technological distractions builds willpower',
          skillImpact: [
            { skillName: 'intelligence', value: 2 },
            { skillName: 'creativity', value: 2 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'skill development',
          description: 'Increased deep work capacity improves professional output quality',
          prestigeImpact: 10,
          incomeMultiplier: 1.05
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 3, // After 3 months
          eventId: 'productivity_breakthrough',
          description: 'Significant productivity improvement noticed by supervisors',
          probability: 0.5
        }
      ]
    }
  },
  {
    id: 'lifestyle_fast_food_habit',
    name: 'Fast Food Dependency',
    type: 'habit',
    category: 'nutrition',
    price: 0,
    maintenanceCost: 400, // Monthly cost
    description: 'Regular consumption of convenient but unhealthy fast food options.',
    prestige: -10,
    happiness: 5, // Short-term pleasure
    unique: true,
    tier: 'basic',
    sustainabilityRating: 20,
    attributes: {
      socialStatus: -5,
      healthImpact: -25,
      timeCommitment: -5, // Saves time
      environmentalImpact: -30,
      stressReduction: 5, // Convenience reduces stress
      skillDevelopment: -5, // Reduces cooking skills
      chronicHealthCondition: [
        {
          name: 'Poor metabolic health',
          description: 'Processed food consumption leads to decreased energy and health markers',
          severityLevel: 'moderate',
          healthImpactPerMonth: -3,
          reversible: true,
          reversalTimeInMonths: 6
        }
      ],
      mentalHealthEffects: [
        {
          type: 'negative',
          description: 'Poor nutrition impacts mood stability and cognitive function',
          happinessImpactPerMonth: -2,
          stressImpactPerMonth: 2,
          cumulativeEffect: true
        }
      ],
      specialTriggers: [
        {
          triggerType: 'health-based',
          threshold: 40, // When health drops to 40%
          eventId: 'health_warning',
          description: 'Doctor raises concerns about your health indicators',
          probability: 0.7
        }
      ],
      conflicts: [
        {
          itemId: 'wellness_nutrition_coaching',
          description: 'Fast food undermines nutrition program effectiveness',
          penaltyEffects: [
            { attribute: 'health', value: -15 },
            { attribute: 'happiness', value: -5 }
          ]
        }
      ]
    }
  },
  {
    id: 'lifestyle_mindful_spending',
    name: 'Mindful Spending Practice',
    type: 'habit',
    category: 'financial',
    price: 0,
    maintenanceCost: 0,
    description: 'Intentional approach to purchasing decisions based on value alignment and necessity.',
    prestige: 0,
    happiness: 15,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 90,
    attributes: {
      socialStatus: 0,
      healthImpact: 5,
      timeCommitment: 2,
      environmentalImpact: 25,
      stressReduction: 20,
      skillDevelopment: 5,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Reduced financial anxiety and increased satisfaction with purchases',
          happinessImpactPerMonth: 2,
          stressImpactPerMonth: -4,
          cumulativeEffect: true
        }
      ],
      financialWisdom: [
        {
          aspect: 'spending',
          description: 'More conscious consumption reduces waste and unnecessary expenses',
          expenseReductionPercentage: 0.15 // 15% reduction in discretionary spending
        },
        {
          aspect: 'saving',
          description: 'Naturally increases savings rate through reduced impulse purchases',
          wealthGrowthMultiplier: 1.1
        }
      ],
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Develops ability to distinguish between wants and needs',
          skillImpact: [
            { skillName: 'intelligence', value: 1 }
          ]
        }
      ],
      conflicts: [
        {
          itemId: 'social_luxury_events',
          description: 'Conspicuous consumption culture clashes with mindful spending values',
          penaltyEffects: [
            { attribute: 'happiness', value: -10 },
            { attribute: 'stress', value: 15 }
          ]
        }
      ]
    }
  },
  {
    id: 'lifestyle_early_riser',
    name: '5AM Club Routine',
    type: 'habit',
    category: 'productivity',
    price: 0,
    maintenanceCost: 50, // Small cost for supplies
    description: 'Morning routine involving early rising, exercise, planning, and focused work before most people wake up.',
    prestige: 10,
    happiness: 20,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 95,
    attributes: {
      socialStatus: 10,
      healthImpact: 20,
      timeCommitment: 0, // Neutral (shifts time, doesn't add or remove)
      environmentalImpact: 10,
      stressReduction: 25,
      skillDevelopment: 15,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Sense of accomplishment and control over your day',
          happinessImpactPerMonth: 3,
          stressImpactPerMonth: -5,
          cumulativeEffect: true
        }
      ],
      personalGrowth: [
        {
          area: 'discipline',
          description: 'Daily practice of self-discipline becomes a cornerstone habit',
          skillImpact: [
            { skillName: 'leadership', value: 2 },
            { skillName: 'intelligence', value: 1 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'skill development',
          description: 'Dedicated learning time compounds professional growth',
          prestigeImpact: 8,
          incomeMultiplier: 1.08
        }
      ],
      chronicHealthCondition: [
        {
          name: 'Improved sleep quality',
          description: 'Consistent sleep schedule regulates circadian rhythm',
          severityLevel: 'mild',
          healthImpactPerMonth: 2,
          reversible: true,
          reversalTimeInMonths: 1
        }
      ],
      conflicts: [
        {
          itemId: 'social_luxury_events',
          description: 'Late-night events disrupt early morning routine',
          penaltyEffects: [
            { attribute: 'health', value: -10 },
            { attribute: 'stress', value: 15 }
          ]
        }
      ]
    }
  }
];

// =========================================
// EDUCATION & PERSONAL DEVELOPMENT
// =========================================
export const educationLifestyleItems: EnhancedLifestyleItem[] = [
  {
    id: 'education_executive_coach',
    name: 'Executive Leadership Coach',
    type: 'education',
    category: 'professional development',
    price: 10000, // Initial commitment
    maintenanceCost: 2000, // Monthly sessions
    description: 'One-on-one coaching with a world-class executive coach who has worked with Fortune 500 leaders.',
    prestige: 25,
    happiness: 15,
    unique: false,
    tier: 'elite',
    sustainabilityRating: 90,
    attributes: {
      socialStatus: 20,
      healthImpact: 5,
      timeCommitment: 8,
      environmentalImpact: 0,
      stressReduction: 15,
      skillDevelopment: 30,
      careerEffects: [
        {
          aspect: 'skill development',
          description: 'Targeted development of leadership blindspots and strengths',
          prestigeImpact: 20,
          incomeMultiplier: 1.2
        }
      ],
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Strategic guidance accelerates learning and avoids common pitfalls',
          skillImpact: [
            { skillName: 'leadership', value: 5 },
            { skillName: 'charisma', value: 3 }
          ]
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 6, // After 6 months
          eventId: 'promotion_opportunity',
          description: 'Newly developed skills catch attention of senior leadership',
          probability: 0.4
        }
      ]
    }
  },
  {
    id: 'education_language_immersion',
    name: 'Foreign Language Immersion',
    type: 'education',
    category: 'languages',
    price: 15000,
    maintenanceCost: 500, // Ongoing practice
    description: 'Intensive language learning program with immersion trips and private tutoring.',
    prestige: 15,
    happiness: 20,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 85,
    attributes: {
      socialStatus: 15,
      healthImpact: 0,
      timeCommitment: 10,
      environmentalImpact: -5,
      stressReduction: 5,
      skillDevelopment: 25,
      personalGrowth: [
        {
          area: 'knowledge',
          description: 'Learning a new language opens cultural understanding and neural pathways',
          skillImpact: [
            { skillName: 'intelligence', value: 3 },
            { skillName: 'charisma', value: 2 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'opportunities',
          description: 'Language skills open international career possibilities',
          prestigeImpact: 10,
          incomeMultiplier: 1.1
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 12, // After 12 months
          eventId: 'international_opportunity',
          description: 'Opportunity to work on an international project utilizing your language skills',
          probability: 0.3
        }
      ]
    }
  }
];

// Export all enhanced lifestyle item collections
import { 
  additionalWellnessItems, 
  additionalSocialItems, 
  additionalLifestyleHabits, 
  additionalEducationItems 
} from './additionalEnhancedLifestyleItems';

export const allEnhancedLifestyleItems = [
  ...wellnessItems,
  ...socialLifestyleItems,
  ...lifestyleHabits,
  ...educationLifestyleItems,
  ...additionalWellnessItems,
  ...additionalSocialItems,
  ...additionalLifestyleHabits,
  ...additionalEducationItems
];