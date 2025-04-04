// This file contains data about various asset types

// Stock market sectors
export const marketSectors = [
  {
    id: 'tech',
    name: 'Technology',
    volatility: 'high',
    description: 'High growth potential but more volatile'
  },
  {
    id: 'finance',
    name: 'Financial',
    volatility: 'medium',
    description: 'Moderate growth with some stability'
  },
  {
    id: 'energy',
    name: 'Energy',
    volatility: 'medium',
    description: 'Affected by global resource demand'
  },
  {
    id: 'consumer',
    name: 'Consumer Goods',
    volatility: 'low',
    description: 'Stable sector with moderate returns'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    volatility: 'medium',
    description: 'Resilient sector with growth potential'
  },
  {
    id: 'real_estate',
    name: 'Real Estate Investment',
    volatility: 'low',
    description: 'Stable income with appreciation potential'
  }
];

// Bond types
export const bondTypes = [
  {
    id: 'treasury',
    name: 'Treasury Bonds',
    risk: 'very_low',
    returnRate: 0.03,
    description: 'Government bonds with guaranteed but low returns'
  },
  {
    id: 'corporate',
    name: 'Corporate Bonds',
    risk: 'low',
    returnRate: 0.05,
    description: 'Issued by corporations with slightly higher yields'
  },
  {
    id: 'municipal',
    name: 'Municipal Bonds',
    risk: 'low',
    returnRate: 0.04,
    description: 'Tax advantages with moderate returns'
  },
  {
    id: 'junk',
    name: 'High-Yield Bonds',
    risk: 'medium',
    returnRate: 0.08,
    description: 'Higher returns but greater risk of default'
  }
];

// Cryptocurrency types
export const cryptoTypes = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    volatility: 'very_high',
    basePrice: 45000,
    description: 'The original cryptocurrency known for store of value'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    volatility: 'high',
    basePrice: 3000,
    description: 'Smart contract platform with diverse applications'
  },
  {
    id: 'stablecoin',
    name: 'Stablecoin',
    symbol: 'USDC',
    volatility: 'very_low',
    basePrice: 1,
    description: 'Pegged to fiat currency for stability'
  },
  {
    id: 'altcoin',
    name: 'Alternative Coin',
    symbol: 'ALT',
    volatility: 'extreme',
    basePrice: 10,
    description: 'Newer coins with high risk and potential reward'
  }
];

// Startup investment rounds
export const startupRounds = [
  {
    id: 'seed',
    name: 'Seed Round',
    minInvestment: 10000,
    risk: 'extreme',
    returnMultiplier: { min: 0, max: 100 },
    description: 'Earliest stage with highest risk and potential return'
  },
  {
    id: 'series_a',
    name: 'Series A',
    minInvestment: 50000,
    risk: 'very_high',
    returnMultiplier: { min: 0, max: 30 },
    description: 'Early growth stage with proven concept'
  },
  {
    id: 'series_b',
    name: 'Series B',
    minInvestment: 100000,
    risk: 'high',
    returnMultiplier: { min: 0, max: 15 },
    description: 'Established startups expanding their market reach'
  },
  {
    id: 'pre_ipo',
    name: 'Pre-IPO',
    minInvestment: 250000,
    risk: 'medium',
    returnMultiplier: { min: 0.5, max: 5 },
    description: 'Late stage before public offering with lower risk'
  }
];
