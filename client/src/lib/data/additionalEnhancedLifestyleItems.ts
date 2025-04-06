import { EnhancedLifestyleItem } from './enhancedLifestyleItems';

// =========================================
// ADDITIONAL WELLNESS ITEMS
// =========================================
export const additionalWellnessItems: EnhancedLifestyleItem[] = [
  {
    id: 'wellness_cold_plunge',
    name: 'Daily Cold Plunge Routine',
    type: 'wellness',
    category: 'physical',
    price: 3000, // Setup cost
    maintenanceCost: 100, // Monthly maintenance
    description: 'Daily cold water immersion therapy with ice bath equipment for home use.',
    prestige: 12,
    happiness: 18,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 75,
    attributes: {
      socialStatus: 10,
      healthImpact: 35,
      timeCommitment: 3, // 3 hours per week
      environmentalImpact: -5,
      stressReduction: 30,
      skillDevelopment: 0,
      chronicHealthCondition: [
        {
          name: 'Enhanced immune function',
          description: 'Regular cold exposure strengthens immune response and circulation',
          severityLevel: 'mild',
          healthImpactPerMonth: 3,
          reversible: true,
          reversalTimeInMonths: 2
        }
      ],
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Cold exposure cultivates mental resilience and stress tolerance',
          happinessImpactPerMonth: 2,
          stressImpactPerMonth: -10,
          cumulativeEffect: true
        }
      ],
      specialTriggers: [
        {
          triggerType: 'health-based',
          threshold: 50, // When health drops to 50%
          eventId: 'recovery_boost',
          description: 'Your cold plunge routine helps you recover more quickly from health issues',
          probability: 0.5
        }
      ]
    }
  },
  {
    id: 'wellness_functional_medicine',
    name: 'Functional Medicine Program',
    type: 'wellness',
    category: 'health',
    price: 8000,
    maintenanceCost: 1000, // Monthly cost for supplements, testing
    description: 'Personalized health optimization with advanced testing, supplements, and individualized protocols.',
    prestige: 25,
    happiness: 20,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 90,
    attributes: {
      socialStatus: 15,
      healthImpact: 40,
      timeCommitment: 5,
      environmentalImpact: 10,
      stressReduction: 20,
      skillDevelopment: 5,
      chronicHealthCondition: [
        {
          name: 'Optimized metabolic health',
          description: 'Personalized protocols improve cellular function and energy production',
          severityLevel: 'moderate',
          healthImpactPerMonth: 4,
          reversible: true,
          reversalTimeInMonths: 3
        }
      ],
      careerEffects: [
        {
          aspect: 'reputation',
          description: 'Increased energy and mental clarity improves work performance',
          prestigeImpact: 5,
          incomeMultiplier: 1.05
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 6, // After 6 months
          eventId: 'health_transformation',
          description: 'Biomarkers show significant improvement in overall health metrics',
          probability: 0.7
        }
      ]
    }
  },
  {
    id: 'wellness_sleep_optimization',
    name: 'Sleep Optimization System',
    type: 'wellness',
    category: 'sleep',
    price: 7500,
    maintenanceCost: 200,
    description: 'Complete sleep system with smart mattress, environmental controls, and recovery tracking technology.',
    prestige: 15,
    happiness: 30,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 70,
    attributes: {
      socialStatus: 10,
      healthImpact: 35,
      timeCommitment: 0, // Saves time by improving sleep efficiency
      environmentalImpact: -10,
      stressReduction: 40,
      skillDevelopment: 15,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Quality sleep dramatically improves cognitive function and emotional regulation',
          happinessImpactPerMonth: 5,
          stressImpactPerMonth: -15,
          cumulativeEffect: true
        }
      ],
      careerEffects: [
        {
          aspect: 'skill development',
          description: 'Enhanced cognitive processing and memory consolidation during sleep',
          prestigeImpact: 8,
          incomeMultiplier: 1.08
        }
      ],
      synergies: [
        {
          itemId: 'wellness_functional_medicine',
          description: 'Sleep optimization enhances the benefits of functional medicine',
          bonusEffects: [
            { attribute: 'health', value: 10 },
            { attribute: 'stress', value: -10 }
          ]
        }
      ]
    }
  },
  {
    id: 'wellness_red_light_therapy',
    name: 'Red Light Therapy Chamber',
    type: 'wellness',
    category: 'recovery',
    price: 12000,
    maintenanceCost: 100,
    description: 'Full-body red light therapy system for cellular regeneration, pain relief, and skin health.',
    prestige: 20,
    happiness: 15,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 80,
    attributes: {
      socialStatus: 15,
      healthImpact: 25,
      timeCommitment: 2,
      environmentalImpact: -10,
      stressReduction: 15,
      skillDevelopment: 0,
      chronicHealthCondition: [
        {
          name: 'Enhanced cellular repair',
          description: 'Red and near-infrared light stimulates mitochondrial function and tissue repair',
          severityLevel: 'mild',
          healthImpactPerMonth: 3,
          reversible: true,
          reversalTimeInMonths: 1
        }
      ],
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Light therapy helps regulate circadian rhythm and mood',
          happinessImpactPerMonth: 2,
          stressImpactPerMonth: -5,
          cumulativeEffect: false
        }
      ],
      synergies: [
        {
          itemId: 'wellness_gym_membership',
          description: 'Red light therapy accelerates workout recovery',
          bonusEffects: [
            { attribute: 'health', value: 8 }
          ]
        }
      ]
    }
  },
  {
    id: 'wellness_health_coach',
    name: 'Elite Health Coach',
    type: 'wellness',
    category: 'mentorship',
    price: 10000,
    maintenanceCost: 1500,
    description: 'Personalized guidance from a world-class health coach with expertise in longevity and performance.',
    prestige: 20,
    happiness: 20,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 95,
    attributes: {
      socialStatus: 15,
      healthImpact: 30,
      timeCommitment: 4,
      environmentalImpact: 15,
      stressReduction: 25,
      skillDevelopment: 10,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Accountability and support system improves consistency in healthy habits',
          happinessImpactPerMonth: 3,
          stressImpactPerMonth: -8,
          cumulativeEffect: true
        }
      ],
      careerEffects: [
        {
          aspect: 'reputation',
          description: 'Improved energy and vitality enhances professional presence',
          prestigeImpact: 10,
          incomeMultiplier: 1.05
        }
      ],
      synergies: [
        {
          itemId: 'wellness_nutrition_coaching',
          description: 'Health coach works collaboratively with nutrition specialist',
          bonusEffects: [
            { attribute: 'health', value: 10 },
            { attribute: 'happiness', value: 5 }
          ]
        }
      ]
    }
  },
  {
    id: 'wellness_float_tank',
    name: 'Home Flotation Therapy Tank',
    type: 'wellness',
    category: 'relaxation',
    price: 20000,
    maintenanceCost: 300,
    description: 'Private sensory deprivation float tank for deep relaxation and mental clarity.',
    prestige: 25,
    happiness: 30,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 65,
    attributes: {
      socialStatus: 20,
      healthImpact: 15,
      timeCommitment: 5,
      environmentalImpact: -15,
      stressReduction: 50,
      skillDevelopment: 10,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Sensory deprivation creates deep meditative states and mental recovery',
          happinessImpactPerMonth: 5,
          stressImpactPerMonth: -20,
          cumulativeEffect: false
        }
      ],
      personalGrowth: [
        {
          area: 'creativity',
          description: 'Float tank sessions enhance creative thinking and problem-solving',
          skillImpact: [
            { skillName: 'creativity', value: 3 }
          ]
        }
      ],
      synergies: [
        {
          itemId: 'wellness_meditation_retreat',
          description: 'Float tank practice deepens meditation capabilities',
          bonusEffects: [
            { attribute: 'stress', value: -15 },
            { attribute: 'happiness', value: 8 }
          ]
        }
      ]
    }
  }
];

// =========================================
// ADDITIONAL SOCIAL LIFESTYLE ITEMS
// =========================================
export const additionalSocialItems: EnhancedLifestyleItem[] = [
  {
    id: 'social_exclusive_retreats',
    name: 'Private Island Retreats Circle',
    type: 'social',
    category: 'exclusive experiences',
    price: 100000, // Annual membership
    maintenanceCost: 5000, // Monthly dues
    description: 'Access to a global network of private island retreats exclusively for members.',
    prestige: 70,
    happiness: 40,
    unique: true,
    tier: 'elite',
    sustainabilityRating: 30,
    requires: {
      netWorth: 5000000, // 5 million minimum net worth
    },
    attributes: {
      socialStatus: 70,
      healthImpact: 15,
      timeCommitment: 20,
      environmentalImpact: -40,
      stressReduction: 45,
      skillDevelopment: 10,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Network with the ultra-wealthy and influential global leaders',
          socialConnectionsImpact: 50
        }
      ],
      careerEffects: [
        {
          aspect: 'opportunities',
          description: 'Access to exclusive investment opportunities not available to the public',
          prestigeImpact: 25,
          incomeMultiplier: 1.25
        }
      ],
      specialTriggers: [
        {
          triggerType: 'financial-based',
          threshold: 10000000, // 10 million net worth 
          eventId: 'elite_investment_offer',
          description: 'A fellow member offers you participation in a highly exclusive investment',
          probability: 0.5
        }
      ]
    }
  },
  {
    id: 'social_political_contributions',
    name: 'Major Political Donor Status',
    type: 'social',
    category: 'influence',
    price: 250000,
    maintenanceCost: 10000,
    description: 'Regular major contributions to political campaigns with access to high-level events and policy influence.',
    prestige: 60,
    happiness: 20,
    unique: true,
    tier: 'elite',
    sustainabilityRating: 40,
    requires: {
      netWorth: 3000000,
    },
    attributes: {
      socialStatus: 60,
      healthImpact: 0,
      timeCommitment: 15,
      environmentalImpact: 0,
      stressReduction: -10, // Comes with some stress
      skillDevelopment: 10,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Access to government and political influencers',
          socialConnectionsImpact: 40
        }
      ],
      careerEffects: [
        {
          aspect: 'opportunities',
          description: 'Policy influence can benefit business interests',
          prestigeImpact: 30,
          incomeMultiplier: 1.15
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 24, // After 2 years
          eventId: 'policy_influence',
          description: 'Your political connections allow you to influence policy in your favor',
          probability: 0.3
        }
      ],
      conflicts: [
        {
          itemId: 'social_charity_board',
          description: 'Political activities can conflict with charity neutrality',
          penaltyEffects: [
            { attribute: 'prestige', value: -15 },
            { attribute: 'stress', value: 20 }
          ]
        }
      ]
    }
  },
  {
    id: 'social_art_patron',
    name: 'Major Art Patron',
    type: 'social',
    category: 'culture',
    price: 150000,
    maintenanceCost: 7500,
    description: 'Significant financial support of the arts with board positions at museums and cultural institutions.',
    prestige: 50,
    happiness: 35,
    unique: true,
    tier: 'elite',
    sustainabilityRating: 85,
    requires: {
      netWorth: 2000000,
    },
    attributes: {
      socialStatus: 55,
      healthImpact: 5,
      timeCommitment: 12,
      environmentalImpact: 20,
      stressReduction: 15,
      skillDevelopment: 15,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Access to cultural elite and institutional leadership',
          socialConnectionsImpact: 35
        }
      ],
      personalGrowth: [
        {
          area: 'creativity',
          description: 'Immersion in arts develops aesthetic sense and creative thinking',
          skillImpact: [
            { skillName: 'creativity', value: 5 }
          ]
        }
      ],
      synergies: [
        {
          itemId: 'social_charity_board',
          description: 'Cultural philanthropy complements charitable work',
          bonusEffects: [
            { attribute: 'prestige', value: 15 },
            { attribute: 'socialConnections', value: 10 }
          ]
        }
      ]
    }
  },
  {
    id: 'social_sports_box',
    name: 'Professional Sports Team Box Suite',
    type: 'social',
    category: 'entertainment',
    price: 200000,
    maintenanceCost: 5000,
    description: 'Private luxury box at a major professional sports venue with exclusive catering and access.',
    prestige: 40,
    happiness: 30,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 30,
    attributes: {
      socialStatus: 35,
      healthImpact: 0,
      timeCommitment: 8,
      environmentalImpact: -25,
      stressReduction: 25,
      skillDevelopment: 0,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Entertainment venue for clients and business relationships',
          socialConnectionsImpact: 25
        },
        {
          area: 'friends',
          description: 'Popular venue for entertaining friends and family',
          socialConnectionsImpact: 15
        }
      ],
      careerEffects: [
        {
          aspect: 'networking',
          description: 'Sports events are major business networking opportunities',
          prestigeImpact: 10,
          incomeMultiplier: 1.08
        }
      ]
    }
  },
  {
    id: 'social_music_festival_vip',
    name: 'Global Music Festival VIP Access',
    type: 'social',
    category: 'entertainment',
    price: 50000,
    maintenanceCost: 2000,
    description: 'VIP access to the world\'s top music festivals with backstage privileges and artist interactions.',
    prestige: 30,
    happiness: 40,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 40,
    attributes: {
      socialStatus: 30,
      healthImpact: -5,
      timeCommitment: 15,
      environmentalImpact: -30,
      stressReduction: 30,
      skillDevelopment: 5,
      relationshipEffects: [
        {
          area: 'friends',
          description: 'Shared experiences build stronger friendships',
          socialConnectionsImpact: 30
        }
      ],
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Music and cultural experiences provide emotional release and joy',
          happinessImpactPerMonth: 4,
          stressImpactPerMonth: -10,
          cumulativeEffect: false
        }
      ],
      conflicts: [
        {
          itemId: 'lifestyle_digital_minimalism',
          description: 'Festival culture promotes heavy social media usage',
          penaltyEffects: [
            { attribute: 'stress', value: 20 },
            { attribute: 'happiness', value: -10 }
          ]
        }
      ]
    }
  },
  {
    id: 'social_wine_society',
    name: 'International Wine Society Membership',
    type: 'social',
    category: 'cultural',
    price: 30000,
    maintenanceCost: 1000,
    description: 'Exclusive membership in a global wine society with rare tastings and vineyard access.',
    prestige: 35,
    happiness: 25,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 60,
    attributes: {
      socialStatus: 25,
      healthImpact: -5,
      timeCommitment: 8,
      environmentalImpact: -15,
      stressReduction: 15,
      skillDevelopment: 10,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Wine events provide sophisticated networking opportunities',
          socialConnectionsImpact: 20
        }
      ],
      personalGrowth: [
        {
          area: 'knowledge',
          description: 'Developing a refined palate and cultural knowledge',
          skillImpact: [
            { skillName: 'charisma', value: 2 }
          ]
        }
      ]
    }
  }
];

// =========================================
// ADDITIONAL LIFESTYLE HABITS
// =========================================
export const additionalLifestyleHabits: EnhancedLifestyleItem[] = [
  {
    id: 'lifestyle_intermittent_fasting',
    name: 'Intermittent Fasting Regimen',
    type: 'habit',
    category: 'nutrition',
    price: 500, // Apps, books, monitoring tools
    maintenanceCost: 50,
    description: 'Structured eating pattern with time-restricted feeding and metabolic health benefits.',
    prestige: 5,
    happiness: 15,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 100,
    attributes: {
      socialStatus: 5,
      healthImpact: 25,
      timeCommitment: -3, // Saves time on meal preparation
      environmentalImpact: 15, // Reduces food consumption
      stressReduction: 10,
      skillDevelopment: 5,
      chronicHealthCondition: [
        {
          name: 'Improved metabolic flexibility',
          description: 'Regular fasting enhances fat adaptation and metabolic health',
          severityLevel: 'moderate',
          healthImpactPerMonth: 3,
          reversible: true,
          reversalTimeInMonths: 1
        }
      ],
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Improved mental clarity from stable blood sugar',
          happinessImpactPerMonth: 2,
          stressImpactPerMonth: -5,
          cumulativeEffect: true
        }
      ],
      synergies: [
        {
          itemId: 'wellness_nutrition_coaching',
          description: 'Professional guidance optimizes fasting protocols',
          bonusEffects: [
            { attribute: 'health', value: 10 }
          ]
        }
      ],
      conflicts: [
        {
          itemId: 'lifestyle_fast_food_habit',
          description: 'Processed food undermines metabolic benefits of fasting',
          penaltyEffects: [
            { attribute: 'health', value: -15 }
          ]
        }
      ]
    }
  },
  {
    id: 'lifestyle_journaling',
    name: 'Daily Journaling Practice',
    type: 'habit',
    category: 'mental',
    price: 200, // Journal, pens, apps
    maintenanceCost: 20,
    description: 'Structured daily reflection and writing practice for mental clarity and personal growth.',
    prestige: 5,
    happiness: 20,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 100,
    attributes: {
      socialStatus: 5,
      healthImpact: 10,
      timeCommitment: 3,
      environmentalImpact: 0,
      stressReduction: 30,
      skillDevelopment: 15,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Daily reflection builds self-awareness and emotional intelligence',
          happinessImpactPerMonth: 3,
          stressImpactPerMonth: -10,
          cumulativeEffect: true
        }
      ],
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Processing experiences through writing builds wisdom',
          skillImpact: [
            { skillName: 'leadership', value: 2 },
            { skillName: 'creativity', value: 3 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'skill development',
          description: 'Improved communication through regular writing practice',
          prestigeImpact: 5
        }
      ]
    }
  },
  {
    id: 'lifestyle_meditation',
    name: 'Daily Meditation Practice',
    type: 'habit',
    category: 'mental',
    price: 300, // Cushion, apps, guides
    maintenanceCost: 20,
    description: 'Daily mindfulness meditation practice with guided programs and progress tracking.',
    prestige: 8,
    happiness: 25,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 100,
    attributes: {
      socialStatus: 8,
      healthImpact: 15,
      timeCommitment: 5,
      environmentalImpact: 5,
      stressReduction: 40,
      skillDevelopment: 10,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Regular meditation reduces anxiety and improves emotional regulation',
          happinessImpactPerMonth: 4,
          stressImpactPerMonth: -15,
          cumulativeEffect: true
        }
      ],
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Mindfulness practice develops self-awareness and equanimity',
          skillImpact: [
            { skillName: 'leadership', value: 3 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'skill development',
          description: 'Improved focus and decision-making from mental clarity',
          prestigeImpact: 8
        }
      ],
      synergies: [
        {
          itemId: 'wellness_meditation_retreat',
          description: 'Retreat experience deepens daily practice',
          bonusEffects: [
            { attribute: 'happiness', value: 10 },
            { attribute: 'stress', value: -15 }
          ]
        }
      ]
    }
  },
  {
    id: 'lifestyle_volunteering',
    name: 'Regular Volunteering',
    type: 'habit',
    category: 'social',
    price: 500, // Transportation, materials
    maintenanceCost: 100,
    description: 'Consistent engagement with charitable organizations and community service.',
    prestige: 20,
    happiness: 30,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 100,
    attributes: {
      socialStatus: 15,
      healthImpact: 10,
      timeCommitment: 8,
      environmentalImpact: 15,
      stressReduction: 20,
      skillDevelopment: 15,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Contributing to others creates meaning and purpose',
          happinessImpactPerMonth: 5,
          stressImpactPerMonth: -10,
          cumulativeEffect: true
        }
      ],
      relationshipEffects: [
        {
          area: 'friends',
          description: 'Meet like-minded people who share your values',
          socialConnectionsImpact: 20
        }
      ],
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Exposure to different life circumstances builds empathy',
          skillImpact: [
            { skillName: 'charisma', value: 2 },
            { skillName: 'leadership', value: 3 }
          ]
        }
      ],
      synergies: [
        {
          itemId: 'social_charity_board',
          description: 'Hands-on experience complements leadership role',
          bonusEffects: [
            { attribute: 'prestige', value: 10 },
            { attribute: 'happiness', value: 10 }
          ]
        }
      ]
    }
  },
  {
    id: 'lifestyle_digital_sabbath',
    name: 'Weekly Digital Sabbath',
    type: 'habit',
    category: 'mental',
    price: 0,
    maintenanceCost: 0,
    description: 'One full day per week completely disconnected from all digital devices and screens.',
    prestige: 8,
    happiness: 22,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 100,
    attributes: {
      socialStatus: 5,
      healthImpact: 12,
      timeCommitment: 0,
      environmentalImpact: 10,
      stressReduction: 35,
      skillDevelopment: 8,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Regular disconnection promotes deeper thinking and presence',
          happinessImpactPerMonth: 4,
          stressImpactPerMonth: -15,
          cumulativeEffect: true
        }
      ],
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Space for reflection leads to greater clarity and insight',
          skillImpact: [
            { skillName: 'creativity', value: 3 },
            { skillName: 'leadership', value: 2 }
          ]
        }
      ],
      synergies: [
        {
          itemId: 'lifestyle_digital_minimalism',
          description: 'Regular breaks enhance sustainable technology habits',
          bonusEffects: [
            { attribute: 'happiness', value: 8 },
            { attribute: 'stress', value: -10 }
          ]
        }
      ],
      conflicts: [
        {
          itemId: 'social_luxury_events',
          description: 'Regular disconnection conflicts with constant social media presence',
          penaltyEffects: [
            { attribute: 'socialConnections', value: -5 }
          ]
        }
      ]
    }
  },
  {
    id: 'lifestyle_reading_habit',
    name: 'Daily Reading Habit',
    type: 'habit',
    category: 'education',
    price: 1000, // Book budget, reader, subscriptions
    maintenanceCost: 100,
    description: 'Dedicated daily reading practice with curated book selections and reading groups.',
    prestige: 10,
    happiness: 25,
    unique: true,
    tier: 'basic',
    sustainabilityRating: 95,
    attributes: {
      socialStatus: 10,
      healthImpact: 5,
      timeCommitment: 7,
      environmentalImpact: 5,
      stressReduction: 25,
      skillDevelopment: 25,
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Regular reading improves focus and provides mental escape',
          happinessImpactPerMonth: 3,
          stressImpactPerMonth: -8,
          cumulativeEffect: true
        }
      ],
      personalGrowth: [
        {
          area: 'knowledge',
          description: 'Continual learning through diverse reading material',
          skillImpact: [
            { skillName: 'intelligence', value: 4 },
            { skillName: 'leadership', value: 2 },
            { skillName: 'creativity', value: 2 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'skill development',
          description: 'Knowledge accumulation provides career advantage',
          prestigeImpact: 10,
          incomeMultiplier: 1.05
        }
      ]
    }
  }
];

// =========================================
// ADDITIONAL EDUCATION LIFESTYLE ITEMS
// =========================================
export const additionalEducationItems: EnhancedLifestyleItem[] = [
  {
    id: 'education_elite_mba',
    name: 'Elite MBA Program',
    type: 'education',
    category: 'degree',
    price: 200000,
    maintenanceCost: 0,
    description: 'Full-time MBA from a top-tier global business school.',
    prestige: 50,
    happiness: 15,
    unique: true,
    tier: 'elite',
    sustainabilityRating: 80,
    attributes: {
      socialStatus: 40,
      healthImpact: -10, // Stress of program
      timeCommitment: 60, // Very time-intensive
      environmentalImpact: -20,
      stressReduction: -15, // Increases stress during program
      skillDevelopment: 50,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Powerful alumni network with global connections',
          socialConnectionsImpact: 40
        }
      ],
      personalGrowth: [
        {
          area: 'knowledge',
          description: 'Comprehensive business education and leadership development',
          skillImpact: [
            { skillName: 'leadership', value: 10 },
            { skillName: 'intelligence', value: 8 },
            { skillName: 'charisma', value: 5 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'opportunities',
          description: 'Prestigious degree opens doors to executive positions',
          prestigeImpact: 30,
          incomeMultiplier: 1.4
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 24, // After 2 years
          eventId: 'career_breakthrough',
          description: 'Your MBA leads to a major career advancement opportunity',
          probability: 0.7
        }
      ]
    }
  },
  {
    id: 'education_executive_program',
    name: 'Executive Education Program',
    type: 'education',
    category: 'professional',
    price: 50000,
    maintenanceCost: 0,
    description: 'Specialized executive program at an elite university, focused on leadership and strategy.',
    prestige: 30,
    happiness: 15,
    unique: false,
    tier: 'luxury',
    sustainabilityRating: 90,
    attributes: {
      socialStatus: 25,
      healthImpact: 0,
      timeCommitment: 20,
      environmentalImpact: -10,
      stressReduction: 5,
      skillDevelopment: 30,
      relationshipEffects: [
        {
          area: 'professional',
          description: 'Network with other executives and thought leaders',
          socialConnectionsImpact: 25
        }
      ],
      personalGrowth: [
        {
          area: 'knowledge',
          description: 'Cutting-edge business concepts and leadership strategies',
          skillImpact: [
            { skillName: 'leadership', value: 7 },
            { skillName: 'charisma', value: 3 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'reputation',
          description: 'Specialized knowledge builds authority in your field',
          prestigeImpact: 20,
          incomeMultiplier: 1.15
        }
      ]
    }
  },
  {
    id: 'education_tech_bootcamp',
    name: 'Premium Tech Bootcamp',
    type: 'education',
    category: 'professional',
    price: 25000,
    maintenanceCost: 0,
    description: 'Intensive technology training program with job placement and ongoing support.',
    prestige: 15,
    happiness: 20,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 85,
    attributes: {
      socialStatus: 10,
      healthImpact: -5,
      timeCommitment: 40,
      environmentalImpact: -5,
      stressReduction: -10,
      skillDevelopment: 40,
      personalGrowth: [
        {
          area: 'knowledge',
          description: 'Practical technical skills with immediate application',
          skillImpact: [
            { skillName: 'technical', value: 10 },
            { skillName: 'intelligence', value: 5 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'opportunities',
          description: 'In-demand skills open new career paths',
          prestigeImpact: 15,
          incomeMultiplier: 1.2
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 6, // After 6 months
          eventId: 'career_pivot',
          description: 'Your new tech skills enable a significant career change',
          probability: 0.6
        }
      ]
    }
  },
  {
    id: 'education_creative_writing',
    name: 'Creative Writing Program',
    type: 'education',
    category: 'creative',
    price: 15000,
    maintenanceCost: 0,
    description: 'Immersive writing program with accomplished authors and personalized feedback.',
    prestige: 10,
    happiness: 25,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 95,
    attributes: {
      socialStatus: 10,
      healthImpact: 5,
      timeCommitment: 15,
      environmentalImpact: 0,
      stressReduction: 20,
      skillDevelopment: 25,
      personalGrowth: [
        {
          area: 'creativity',
          description: 'Structured development of creative expression and narrative craft',
          skillImpact: [
            { skillName: 'creativity', value: 10 },
            { skillName: 'charisma', value: 3 }
          ]
        }
      ],
      mentalHealthEffects: [
        {
          type: 'positive',
          description: 'Creative expression provides emotional outlet and processing',
          happinessImpactPerMonth: 3,
          stressImpactPerMonth: -8,
          cumulativeEffect: true
        }
      ],
      specialTriggers: [
        {
          triggerType: 'time-based',
          threshold: 12, // After 1 year
          eventId: 'creative_success',
          description: 'Your writing receives recognition in a notable publication',
          probability: 0.3
        }
      ]
    }
  },
  {
    id: 'education_design_thinking',
    name: 'Design Thinking Certification',
    type: 'education',
    category: 'professional',
    price: 8000,
    maintenanceCost: 0,
    description: 'Comprehensive program in design thinking methodologies with practical applications.',
    prestige: 15,
    happiness: 18,
    unique: false,
    tier: 'premium',
    sustainabilityRating: 90,
    attributes: {
      socialStatus: 12,
      healthImpact: 0,
      timeCommitment: 10,
      environmentalImpact: 5,
      stressReduction: 0,
      skillDevelopment: 20,
      personalGrowth: [
        {
          area: 'creativity',
          description: 'Structured approach to creative problem-solving',
          skillImpact: [
            { skillName: 'creativity', value: 6 },
            { skillName: 'leadership', value: 4 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'skill development',
          description: 'Innovation methodologies applicable across industries',
          prestigeImpact: 12,
          incomeMultiplier: 1.08
        }
      ]
    }
  },
  {
    id: 'education_leadership_retreat',
    name: 'Transformational Leadership Retreat',
    type: 'education',
    category: 'professional',
    price: 15000,
    maintenanceCost: 0,
    description: 'Intensive leadership development experience with ongoing coaching.',
    prestige: 20,
    happiness: 25,
    unique: false,
    durationInDays: 5, // 5-day retreat
    tier: 'premium',
    sustainabilityRating: 85,
    attributes: {
      socialStatus: 15,
      healthImpact: 10,
      timeCommitment: 50, // Very intensive during the retreat
      environmentalImpact: -10,
      stressReduction: 20,
      skillDevelopment: 30,
      personalGrowth: [
        {
          area: 'wisdom',
          description: 'Deep personal insights about leadership style and patterns',
          skillImpact: [
            { skillName: 'leadership', value: 8 },
            { skillName: 'charisma', value: 5 }
          ]
        }
      ],
      careerEffects: [
        {
          aspect: 'reputation',
          description: 'Transformative leadership approach noticed by others',
          prestigeImpact: 15,
          incomeMultiplier: 1.1
        }
      ],
      synergies: [
        {
          itemId: 'education_executive_coach',
          description: 'Coaching reinforces and extends retreat insights',
          bonusEffects: [
            { attribute: 'prestige', value: 10 },
            { attribute: 'happiness', value: 5 }
          ]
        }
      ]
    }
  }
];