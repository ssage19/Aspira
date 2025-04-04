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

export const startupInvestments = [
  {
    id: 'ai_startup',
    name: 'NeuraTech AI',
    round: 'seed',
    industry: 'Artificial Intelligence',
    minInvestment: 25000,
    description: 'Developing next-generation natural language processing algorithms.',
    successChance: 0.15,
    potentialReturnMultiple: 50
  },
  {
    id: 'biotech_startup',
    name: 'Genome Solutions',
    round: 'series_a',
    industry: 'Biotechnology',
    minInvestment: 75000,
    description: 'Novel gene therapy approaches for rare diseases.',
    successChance: 0.25,
    potentialReturnMultiple: 20
  },
  {
    id: 'fintech_startup',
    name: 'CryptoBank',
    round: 'series_b',
    industry: 'Financial Technology',
    minInvestment: 150000,
    description: 'Blockchain-based banking platform for cross-border transactions.',
    successChance: 0.40,
    potentialReturnMultiple: 10
  },
  {
    id: 'saas_startup',
    name: 'Cloud Enterprise Solutions',
    round: 'pre_ipo',
    industry: 'Software as a Service',
    minInvestment: 300000,
    description: 'Enterprise resource planning software with AI integration.',
    successChance: 0.65,
    potentialReturnMultiple: 4
  },
  {
    id: 'vr_startup',
    name: 'Virtual Worlds',
    round: 'seed',
    industry: 'Virtual Reality',
    minInvestment: 30000,
    description: 'Immersive virtual reality platform for education and training.',
    successChance: 0.20,
    potentialReturnMultiple: 40
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
