// Random events that can occur in the game, triggering various effects on the player's finances, assets, etc.

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  category: "economic" | "personal" | "global" | "market" | "technological" | "political" | "environmental";
  
  // The probability of this event occurring (0-1), can be modified by other factors
  baseProbability: number;
  
  // Can this event repeat? If false, it only happens once per game
  repeatable: boolean;
  
  // Minimum days between occurrences of this event
  cooldownDays?: number;
  
  // Duration of the event's effects in days (if it's a long-term event)
  duration?: number;
  
  // The direct impact of this event on the player's state
  // For events with choices, this can be the baseline impact that happens regardless of choice
  impact: EventImpact;
  
  // Optional choices the player can make
  choices?: EventChoice[];
  
  // Optional requirement function to determine if this event can trigger
  requirementFn?: () => boolean;
}

export interface EventChoice {
  text: string;
  impact: EventImpact;
  
  // Optional requirement function for this choice to be available
  requirementsFn?: () => boolean;
}

export interface EventImpact {
  // Basic financial impact
  wealth?: number; // Direct change to cash
  income?: number; // Change to income (per day/week)
  
  // Character stats impact
  happiness?: number; // -100 to 100
  stress?: number; // -100 to 100
  prestige?: number; // -100 to 100
  health?: number; // -100 to 100
  
  // Asset impact - can affect specific assets or all assets of a type
  assets?: {
    type: "stock" | "bond" | "crypto" | "all";
    valueChange: number; // Multiplier (0.9 = 10% decrease, 1.1 = 10% increase)
    idFilter?: string[]; // If present, only affects these specific assets
  }[];
  
  // Property impact
  properties?: {
    type: "residential" | "commercial" | "industrial" | "mansion" | "all";
    valueChange: number; // Multiplier (0.9 = 10% decrease, 1.1 = 10% increase)
    incomeChange?: number; // Multiplier for property income
    idFilter?: string[]; // If present, only affects these specific properties
  }[];
  
  // Skill impact
  skills?: {
    type: "intelligence" | "creativity" | "charisma" | "technical" | "leadership";
    valueChange: number; // Direct points change
  }[];
  
  // Economic impact (affects global economic indicators)
  economy?: {
    marketTrend?: "bull" | "bear" | "stable";
    stockMarketHealth?: number; // -100 to 100
    realEstateMarketHealth?: number; // -100 to 100
    inflation?: number; // Percentage change
    interestRate?: number; // Percentage change
  };
}

export const randomEvents: RandomEvent[] = [
  // Economic Events
  {
    id: "economic_boom",
    title: "Economic Boom",
    description: "A sudden surge in the economy has created a wealth of opportunities for investors.",
    category: "economic",
    baseProbability: 0.05,
    repeatable: true,
    cooldownDays: 180,
    duration: 30,
    impact: {
      economy: {
        marketTrend: "bull",
        stockMarketHealth: 15,
        realEstateMarketHealth: 10
      },
      assets: [
        { type: "stock", valueChange: 1.05 }
      ],
      properties: [
        { type: "all", valueChange: 1.03 }
      ]
    }
  },
  {
    id: "market_crash",
    title: "Market Crash",
    description: "A sudden drop in market confidence has led to a widespread sell-off.",
    category: "economic",
    baseProbability: 0.03,
    repeatable: true,
    cooldownDays: 365,
    duration: 30,
    impact: {
      economy: {
        marketTrend: "bear",
        stockMarketHealth: -25,
        realEstateMarketHealth: -10
      },
      assets: [
        { type: "stock", valueChange: 0.8 }
      ],
      properties: [
        { type: "all", valueChange: 0.95 }
      ],
      happiness: -10,
      stress: 15
    }
  },
  {
    id: "interest_rate_hike",
    title: "Interest Rate Hike",
    description: "The central bank has increased interest rates to combat inflation.",
    category: "economic",
    baseProbability: 0.08,
    repeatable: true,
    cooldownDays: 120,
    duration: 60,
    impact: {
      economy: {
        interestRate: 0.5,
        stockMarketHealth: -5,
        realEstateMarketHealth: -10
      },
      assets: [
        { type: "bond", valueChange: 0.97 },
        { type: "stock", valueChange: 0.98 }
      ],
      properties: [
        { type: "all", valueChange: 0.97 }
      ]
    }
  },
  {
    id: "tech_sector_boom",
    title: "Tech Sector Boom",
    description: "A wave of innovation has caused tech stocks to soar in value.",
    category: "technological",
    baseProbability: 0.07,
    repeatable: true,
    cooldownDays: 150,
    duration: 30,
    impact: {
      assets: [
        { type: "stock", valueChange: 1.12, idFilter: ["TECH", "AAPL", "GOOGL", "MSFT"] }
      ]
    }
  },
  {
    id: "real_estate_bubble",
    title: "Real Estate Bubble",
    description: "Property prices have become significantly inflated.",
    category: "market",
    baseProbability: 0.05,
    repeatable: true,
    cooldownDays: 240,
    duration: 60,
    impact: {
      properties: [
        { type: "all", valueChange: 1.15 }
      ],
      economy: {
        realEstateMarketHealth: 20
      }
    },
    choices: [
      {
        text: "Sell your properties to capitalize on the high prices",
        impact: {
          properties: [
            { type: "all", valueChange: 1.25 } // Better selling price
          ],
          wealth: 25000 // Bonus for taking action
        }
      },
      {
        text: "Buy more properties, betting the bubble will continue",
        impact: {
          properties: [
            { type: "all", valueChange: 1.05 } // Small immediate gain
          ],
          wealth: -50000 // Cost of additional investment
        }
      },
      {
        text: "Take no action and monitor the situation",
        impact: {
          // No additional impact
        }
      }
    ]
  },
  {
    id: "crypto_surge",
    title: "Cryptocurrency Surge",
    description: "Cryptocurrencies have seen a dramatic increase in value.",
    category: "market",
    baseProbability: 0.06,
    repeatable: true,
    cooldownDays: 90,
    duration: 14,
    impact: {
      assets: [
        { type: "crypto", valueChange: 1.4 }
      ]
    },
    choices: [
      {
        text: "Invest heavily in cryptocurrencies",
        impact: {
          wealth: -20000,
          assets: [
            { type: "crypto", valueChange: 1.5 } // Better return but risky
          ]
        }
      },
      {
        text: "Invest cautiously in cryptocurrencies",
        impact: {
          wealth: -5000,
          assets: [
            { type: "crypto", valueChange: 1.3 } // Smaller return but less risk
          ]
        }
      },
      {
        text: "Avoid cryptocurrencies due to their volatility",
        impact: {
          stress: -5 // Lower stress from avoiding risk
        }
      }
    ]
  },
  
  // Personal Events
  {
    id: "unexpected_inheritance",
    title: "Unexpected Inheritance",
    description: "A distant relative has left you a surprising inheritance.",
    category: "personal",
    baseProbability: 0.02,
    repeatable: false,
    impact: {
      wealth: 100000,
      happiness: 15,
      prestige: 5
    }
  },
  {
    id: "health_issue",
    title: "Health Issue",
    description: "You're experiencing health problems that require attention and treatment.",
    category: "personal",
    baseProbability: 0.05,
    repeatable: true,
    cooldownDays: 180,
    duration: 30,
    impact: {
      health: -20,
      happiness: -15,
      stress: 25,
      wealth: -10000 // Medical expenses
    },
    choices: [
      {
        text: "Seek premium medical care",
        impact: {
          wealth: -25000, // High-quality healthcare costs
          health: 15, // Better recovery
          stress: -10
        }
      },
      {
        text: "Follow standard treatment plan",
        impact: {
          wealth: -5000, // Standard healthcare costs
          health: 5 // Average recovery
        }
      },
      {
        text: "Minimize medical expenses",
        impact: {
          wealth: -1000, // Minimal healthcare costs
          health: -5, // Worse recovery
          stress: 5
        }
      }
    ]
  },
  {
    id: "job_promotion",
    title: "Career Advancement",
    description: "Your hard work has opened up a promising career opportunity.",
    category: "personal",
    baseProbability: 0.04,
    repeatable: true,
    cooldownDays: 180,
    impact: {
      prestige: 10,
      happiness: 15,
      income: 1000, // Monthly income increase
      skills: [
        { type: "leadership", valueChange: 5 }
      ]
    }
  },
  {
    id: "networking_opportunity",
    title: "Valuable Networking Opportunity",
    description: "You've been invited to an exclusive event with potential valuable connections.",
    category: "personal",
    baseProbability: 0.08,
    repeatable: true,
    cooldownDays: 90,
    impact: {
      skills: [
        { type: "charisma", valueChange: 2 }
      ]
    },
    choices: [
      {
        text: "Attend and focus on making high-value business connections",
        impact: {
          wealth: -1000, // Cost of attendance
          prestige: 5,
          skills: [
            { type: "charisma", valueChange: 3 }
          ]
        }
      },
      {
        text: "Attend and enjoy the social aspects",
        impact: {
          wealth: -1000, // Cost of attendance
          happiness: 10,
          stress: -5
        }
      },
      {
        text: "Skip the event to focus on current projects",
        impact: {
          skills: [
            { type: "technical", valueChange: 2 }
          ]
        }
      }
    ]
  },
  
  // Global Events
  {
    id: "global_pandemic",
    title: "Global Health Crisis",
    description: "A worldwide health emergency has disrupted economies and daily life.",
    category: "global",
    baseProbability: 0.01,
    repeatable: false,
    duration: 180,
    impact: {
      economy: {
        marketTrend: "bear",
        stockMarketHealth: -30,
        realEstateMarketHealth: -15
      },
      assets: [
        { type: "stock", valueChange: 0.7 }
      ],
      properties: [
        { type: "commercial", valueChange: 0.6 },
        { type: "residential", valueChange: 0.9 }
      ],
      happiness: -20,
      stress: 30
    },
    choices: [
      {
        text: "Invest in healthcare and technology sectors",
        impact: {
          wealth: -30000,
          assets: [
            { type: "stock", valueChange: 1.2, idFilter: ["HEALTH", "TECH"] }
          ]
        }
      },
      {
        text: "Conserve cash and wait for recovery",
        impact: {
          stress: -10
        }
      },
      {
        text: "Diversify your investments across sectors",
        impact: {
          wealth: -15000,
          assets: [
            { type: "stock", valueChange: 1.05 }
          ]
        }
      }
    ]
  },
  {
    id: "technological_breakthrough",
    title: "Major Technological Breakthrough",
    description: "A revolutionary technology has been announced that could transform multiple industries.",
    category: "technological",
    baseProbability: 0.03,
    repeatable: true,
    cooldownDays: 365,
    duration: 60,
    impact: {
      economy: {
        stockMarketHealth: 15
      },
      assets: [
        { type: "stock", valueChange: 1.08, idFilter: ["TECH"] }
      ]
    }
  },
  {
    id: "political_unrest",
    title: "Political Instability",
    description: "Political tensions have led to uncertainty in global markets.",
    category: "political",
    baseProbability: 0.05,
    repeatable: true,
    cooldownDays: 180,
    duration: 45,
    impact: {
      economy: {
        stockMarketHealth: -10
      },
      assets: [
        { type: "stock", valueChange: 0.93 }
      ],
      stress: 10
    }
  },
  {
    id: "natural_disaster",
    title: "Natural Disaster",
    description: "A significant natural disaster has occurred, causing widespread damage.",
    category: "environmental",
    baseProbability: 0.03,
    repeatable: true,
    cooldownDays: 180,
    duration: 30,
    impact: {
      economy: {
        realEstateMarketHealth: -15
      },
      properties: [
        { type: "all", valueChange: 0.9 }
      ],
      happiness: -5,
      stress: 15
    },
    choices: [
      {
        text: "Donate to relief efforts",
        impact: {
          wealth: -5000,
          happiness: 10,
          prestige: 5,
          stress: -5
        }
      },
      {
        text: "Invest in reconstruction companies",
        impact: {
          wealth: -10000,
          assets: [
            { type: "stock", valueChange: 1.15, idFilter: ["BUILD", "INFRA"] }
          ]
        }
      },
      {
        text: "Take no action",
        impact: {
          // No additional impact
        }
      }
    ]
  },
  
  // Industry-Specific Events
  {
    id: "housing_shortage",
    title: "Housing Shortage",
    description: "A shortage of available housing has driven up property values in residential areas.",
    category: "market",
    baseProbability: 0.06,
    repeatable: true,
    cooldownDays: 120,
    duration: 90,
    impact: {
      properties: [
        { type: "residential", valueChange: 1.12, incomeChange: 1.08 }
      ]
    }
  },
  {
    id: "commercial_property_slump",
    title: "Commercial Property Slump",
    description: "Commercial real estate is experiencing a significant downturn.",
    category: "market",
    baseProbability: 0.05,
    repeatable: true,
    cooldownDays: 150,
    duration: 60,
    impact: {
      properties: [
        { type: "commercial", valueChange: 0.85, incomeChange: 0.9 }
      ]
    },
    choices: [
      {
        text: "Sell commercial properties at a loss to avoid further depreciation",
        impact: {
          properties: [
            { type: "commercial", valueChange: 0.9 } // Better selling price than holding
          ]
        }
      },
      {
        text: "Hold commercial properties and wait for recovery",
        impact: {
          stress: 10
        }
      },
      {
        text: "Convert commercial properties to mixed-use to mitigate losses",
        impact: {
          wealth: -20000, // Conversion costs
          properties: [
            { type: "commercial", valueChange: 0.95, incomeChange: 1.05 }
          ]
        }
      }
    ]
  },
  {
    id: "luxury_market_boom",
    title: "Luxury Market Boom",
    description: "High-end properties and luxury assets are seeing unprecedented demand.",
    category: "market",
    baseProbability: 0.04,
    repeatable: true,
    cooldownDays: 180,
    duration: 30,
    impact: {
      properties: [
        { type: "mansion", valueChange: 1.18 }
      ],
      prestige: 5
    }
  },
  
  // Personal Financial Events
  {
    id: "tax_audit",
    title: "Tax Audit",
    description: "You're being audited by the tax authority.",
    category: "personal",
    baseProbability: 0.03,
    repeatable: true,
    cooldownDays: 365,
    impact: {
      stress: 25
    },
    choices: [
      {
        text: "Hire a premium tax attorney",
        impact: {
          wealth: -15000,
          stress: -15
        }
      },
      {
        text: "Handle it yourself with careful documentation",
        impact: {
          wealth: -5000,
          stress: 10,
          skills: [
            { type: "technical", valueChange: 3 }
          ]
        }
      },
      {
        text: "Settle and pay penalties",
        impact: {
          wealth: -25000,
          stress: -5
        }
      }
    ]
  },
  {
    id: "investment_opportunity",
    title: "Exclusive Investment Opportunity",
    description: "You've been approached with a potentially lucrative investment opportunity.",
    category: "personal",
    baseProbability: 0.07,
    repeatable: true,
    cooldownDays: 120,
    impact: {},
    choices: [
      {
        text: "Invest substantially",
        impact: {
          wealth: -50000,
          assets: [
            { type: "stock", valueChange: 1.3 }
          ],
          stress: 15
        }
      },
      {
        text: "Make a modest investment",
        impact: {
          wealth: -10000,
          assets: [
            { type: "stock", valueChange: 1.15 }
          ],
          stress: 5
        }
      },
      {
        text: "Decline the opportunity",
        impact: {
          stress: -5
        }
      }
    ]
  },
  
  // Reputation/Lifestyle Events
  {
    id: "charity_gala",
    title: "Charity Gala Invitation",
    description: "You've been invited to a high-profile charity event.",
    category: "personal",
    baseProbability: 0.06,
    repeatable: true,
    cooldownDays: 90,
    impact: {},
    choices: [
      {
        text: "Attend and make a generous donation",
        impact: {
          wealth: -25000,
          prestige: 15,
          happiness: 10
        }
      },
      {
        text: "Attend and make a modest donation",
        impact: {
          wealth: -5000,
          prestige: 5,
          happiness: 5
        }
      },
      {
        text: "Decline the invitation",
        impact: {
          prestige: -5,
          happiness: -5
        }
      }
    ]
  },
  {
    id: "public_scandal",
    title: "Public Relations Issue",
    description: "A controversy has emerged that could affect your public image.",
    category: "personal",
    baseProbability: 0.03,
    repeatable: true,
    cooldownDays: 180,
    impact: {
      prestige: -15,
      happiness: -10,
      stress: 20
    },
    choices: [
      {
        text: "Hire a PR firm to manage the situation",
        impact: {
          wealth: -30000,
          prestige: 10,
          stress: -15
        }
      },
      {
        text: "Issue a public apology",
        impact: {
          prestige: 5,
          stress: -5
        }
      },
      {
        text: "Maintain a low profile until it blows over",
        impact: {
          income: -500, // Temporary income reduction
          stress: 5
        }
      }
    ]
  }
];

// Default export
export default randomEvents;