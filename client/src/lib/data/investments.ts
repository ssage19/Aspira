// This file contains data for stock market investments

export type VolatilityLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'extreme';

export type Stock = {
  id: string;
  name: string;
  symbol: string;
  sector: string;
  volatility: VolatilityLevel;
  basePrice: number;
  description: string;
};

export const stockMarket: Stock[] = [
  {
    id: 'tech_giant',
    name: 'Tech Giant Inc.',
    symbol: 'TGNT',
    sector: 'tech',
    volatility: 'medium',
    basePrice: 350,
    description: 'Leading technology company with diversified products and services.'
  },
  {
    id: 'future_systems',
    name: 'Future Systems',
    symbol: 'FSYS',
    sector: 'tech',
    volatility: 'high',
    basePrice: 180,
    description: 'Innovative AI and machine learning solutions provider.'
  },
  {
    id: 'global_bank',
    name: 'Global Bank Holdings',
    symbol: 'GBNK',
    sector: 'finance',
    volatility: 'low',
    basePrice: 120,
    description: 'International financial institution with stable dividend history.'
  },
  {
    id: 'energy_corp',
    name: 'Energy Corp International',
    symbol: 'ECOR',
    sector: 'energy',
    volatility: 'medium',
    basePrice: 75,
    description: 'Major energy producer with both traditional and renewable assets.'
  },
  {
    id: 'green_energy',
    name: 'Green Energy Solutions',
    symbol: 'GRNS',
    sector: 'energy',
    volatility: 'high',
    basePrice: 45,
    description: 'Renewable energy company focusing on solar and wind power.'
  },
  {
    id: 'consumer_brands',
    name: 'Consumer Brands Co',
    symbol: 'CBCO',
    sector: 'consumer',
    volatility: 'low',
    basePrice: 90,
    description: 'Established consumer goods company with a portfolio of trusted brands.'
  },
  {
    id: 'luxe_retail',
    name: 'Luxe Retail Group',
    symbol: 'LUXE',
    sector: 'consumer',
    volatility: 'medium',
    basePrice: 65,
    description: 'High-end retail company with global luxury brand presence.'
  },
  {
    id: 'med_innovations',
    name: 'Medical Innovations',
    symbol: 'MEDI',
    sector: 'healthcare',
    volatility: 'high',
    basePrice: 110,
    description: 'Cutting-edge medical technology and pharmaceutical research.'
  },
  {
    id: 'property_trust',
    name: 'Property Trust REIT',
    symbol: 'REIT',
    sector: 'real_estate',
    volatility: 'low',
    basePrice: 50,
    description: 'Real Estate Investment Trust with diverse property holdings.'
  },
  {
    id: 'startup_fund',
    name: 'Startup Fund ETF',
    symbol: 'STUP',
    sector: 'tech',
    volatility: 'very_high',
    basePrice: 25,
    description: 'ETF focusing on early-stage technology companies with high growth potential.'
  }
];

export interface StartupInvestment {
  id: string;
  name: string;
  round: 'seed' | 'series_a' | 'series_b' | 'pre_ipo';
  industry: string;
  minInvestment: number;
  description: string;
  successChance: number;
  potentialReturnMultiple: number;
  // Time-based properties
  maturityTimeInDays: number; // How many days until outcome is determined
  possibleOutcomes: {
    success: {
      message: string;
      returnMultiplier: number; // Actual multiplier used on success (within range)
    };
    failure: {
      message: string;
    };
  };
  isAvailable: boolean; // Whether this startup is still available for investment
}

export const startupInvestments: StartupInvestment[] = [
  {
    id: 'ai_startup',
    name: 'NeuraTech AI',
    round: 'seed',
    industry: 'Artificial Intelligence',
    minInvestment: 25000,
    description: 'Developing next-generation natural language processing algorithms.',
    successChance: 0.15,
    potentialReturnMultiple: 50,
    maturityTimeInDays: 180, // 6 months
    possibleOutcomes: {
      success: {
        message: 'NeuraTech AI secured a major partnership with a tech giant, leading to a substantial acquisition offer!',
        returnMultiplier: 50
      },
      failure: {
        message: 'NeuraTech AI struggled to demonstrate viable technology and failed to secure additional funding.'
      }
    },
    isAvailable: true
  },
  {
    id: 'biotech_startup',
    name: 'Genome Solutions',
    round: 'series_a',
    industry: 'Biotechnology',
    minInvestment: 75000,
    description: 'Novel gene therapy approaches for rare diseases.',
    successChance: 0.25,
    potentialReturnMultiple: 20,
    maturityTimeInDays: 270, // 9 months
    possibleOutcomes: {
      success: {
        message: 'Genome Solutions completed successful clinical trials and received FDA fast-track approval for their therapy!',
        returnMultiplier: 20
      },
      failure: {
        message: 'Genome Solutions encountered unexpected complications in clinical trials and failed to progress to the next phase.'
      }
    },
    isAvailable: true
  },
  {
    id: 'fintech_startup',
    name: 'CryptoBank',
    round: 'series_b',
    industry: 'Financial Technology',
    minInvestment: 150000,
    description: 'Blockchain-based banking platform for cross-border transactions.',
    successChance: 0.40,
    potentialReturnMultiple: 10,
    maturityTimeInDays: 210, // 7 months
    possibleOutcomes: {
      success: {
        message: 'CryptoBank has successfully expanded to 15 countries and is preparing for an IPO!',
        returnMultiplier: 10
      },
      failure: {
        message: 'CryptoBank faced regulatory challenges in key markets and was unable to scale as planned.'
      }
    },
    isAvailable: true
  },
  {
    id: 'saas_startup',
    name: 'Cloud Enterprise Solutions',
    round: 'pre_ipo',
    industry: 'Software as a Service',
    minInvestment: 300000,
    description: 'Enterprise resource planning software with AI integration.',
    successChance: 0.65,
    potentialReturnMultiple: 4,
    maturityTimeInDays: 120, // 4 months
    possibleOutcomes: {
      success: {
        message: 'Cloud Enterprise Solutions successfully completed their IPO with shares priced above the expected range!',
        returnMultiplier: 4
      },
      failure: {
        message: 'Cloud Enterprise Solutions postponed their IPO indefinitely due to unfavorable market conditions.'
      }
    },
    isAvailable: true
  },
  {
    id: 'vr_startup',
    name: 'Virtual Worlds',
    round: 'seed',
    industry: 'Virtual Reality',
    minInvestment: 30000,
    description: 'Immersive virtual reality platform for education and training.',
    successChance: 0.20,
    potentialReturnMultiple: 40,
    maturityTimeInDays: 150, // 5 months
    possibleOutcomes: {
      success: {
        message: 'Virtual Worlds\' prototype gained viral attention and secured major Series A funding!',
        returnMultiplier: 40
      },
      failure: {
        message: 'Virtual Worlds faced technical limitations and was unable to deliver on their ambitious vision.'
      }
    },
    isAvailable: true
  },
  {
    id: 'green_energy',
    name: 'SolarFlow',
    round: 'series_a',
    industry: 'Renewable Energy',
    minInvestment: 60000,
    description: 'Revolutionary solar panel technology with 60% higher efficiency.',
    successChance: 0.30,
    potentialReturnMultiple: 25,
    maturityTimeInDays: 240, // 8 months
    possibleOutcomes: {
      success: {
        message: 'SolarFlow\'s technology breakthrough was verified by independent labs, attracting massive industry interest!',
        returnMultiplier: 25
      },
      failure: {
        message: 'SolarFlow struggled with manufacturing scale-up issues and couldn\'t deliver cost-effective production.'
      }
    },
    isAvailable: true
  },
  {
    id: 'space_tech',
    name: 'Orbital Dynamics',
    round: 'series_b',
    industry: 'Space Technology',
    minInvestment: 200000,
    description: 'Low-cost satellite launch system with reusable components.',
    successChance: 0.35,
    potentialReturnMultiple: 12,
    maturityTimeInDays: 300, // 10 months
    possibleOutcomes: {
      success: {
        message: 'Orbital Dynamics completed three successful launches and secured contracts with major telecommunications companies!',
        returnMultiplier: 12
      },
      failure: {
        message: 'Orbital Dynamics experienced a launch failure that caused significant setbacks in their development timeline.'
      }
    },
    isAvailable: true
  }
];

export const bonds = [
  {
    id: 'govt_bond',
    name: 'Government Bond 5-Year',
    type: 'treasury',
    term: 5, // years
    yieldRate: 0.03,
    minInvestment: 5000,
    description: 'Safe government-backed bonds with guaranteed returns.'
  },
  {
    id: 'corp_bond_a',
    name: 'AAA Corporate Bond',
    type: 'corporate',
    term: 3, // years
    yieldRate: 0.045,
    minInvestment: 10000,
    description: 'High-quality corporate bonds from established companies.'
  },
  {
    id: 'corp_bond_b',
    name: 'BBB Corporate Bond',
    type: 'corporate',
    term: 5, // years
    yieldRate: 0.065,
    minInvestment: 10000,
    description: 'Medium-risk corporate bonds with higher yields.'
  },
  {
    id: 'muni_bond',
    name: 'Municipal Bond Fund',
    type: 'municipal',
    term: 7, // years
    yieldRate: 0.038,
    minInvestment: 15000,
    description: 'Tax-advantaged bonds issued by local governments.'
  },
  {
    id: 'high_yield',
    name: 'High-Yield Corporate Bond',
    type: 'junk',
    term: 2, // years
    yieldRate: 0.085,
    minInvestment: 25000,
    description: 'Higher-risk bonds with significantly better returns.'
  }
];

export const cryptoCurrencies = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'bitcoin',
    basePrice: 45000,
    volatility: 'very_high',
    description: 'The original and largest cryptocurrency by market cap.'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'ethereum',
    basePrice: 3000,
    volatility: 'high',
    description: 'Smart contract platform enabling decentralized applications.'
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    type: 'stablecoin',
    basePrice: 1,
    volatility: 'very_low',
    description: 'Stablecoin pegged to the US Dollar with minimal price volatility.'
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    type: 'altcoin',
    basePrice: 100,
    volatility: 'very_high',
    description: 'High-performance blockchain optimized for decentralized applications.'
  },
  {
    id: 'meme',
    name: 'Meme Coin',
    symbol: 'MEME',
    type: 'altcoin',
    basePrice: 0.01,
    volatility: 'extreme',
    description: 'Highly speculative cryptocurrency with extreme price swings.'
  }
];
