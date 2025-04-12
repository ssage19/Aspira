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
  // Top Market Cap Cryptocurrencies
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'bitcoin',
    basePrice: 65000,
    volatility: 'very_high',
    description: 'The original and largest cryptocurrency by market cap.'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'ethereum',
    basePrice: 3500,
    volatility: 'high',
    description: 'Smart contract platform enabling decentralized applications.'
  },
  // Stablecoins
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    type: 'stablecoin',
    basePrice: 1,
    volatility: 'very_low',
    description: 'Largest stablecoin by market cap, pegged to the US Dollar.'
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
  // Top 10 by Market Cap
  {
    id: 'bnb',
    name: 'Binance Coin',
    symbol: 'BNB',
    type: 'altcoin',
    basePrice: 480,
    volatility: 'high',
    description: 'Native token of Binance exchange with utility across its ecosystem.'
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    type: 'altcoin',
    basePrice: 140,
    volatility: 'very_high',
    description: 'High-performance blockchain optimized for decentralized applications.'
  },
  {
    id: 'xrp',
    name: 'XRP',
    symbol: 'XRP',
    type: 'altcoin',
    basePrice: 0.55,
    volatility: 'high',
    description: 'Digital payment protocol focused on fast, low-cost international transfers.'
  },
  {
    id: 'ada',
    name: 'Cardano',
    symbol: 'ADA',
    type: 'altcoin',
    basePrice: 0.45,
    volatility: 'high',
    description: 'Proof-of-stake blockchain platform with academic research background.'
  },
  {
    id: 'avax',
    name: 'Avalanche',
    symbol: 'AVAX',
    type: 'altcoin',
    basePrice: 35,
    volatility: 'very_high',
    description: 'Platform for decentralized applications with high transaction throughput.'
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    type: 'altcoin',
    basePrice: 0.12,
    volatility: 'extreme',
    description: 'Originally created as a meme, now one of the most recognized cryptocurrencies.'
  },
  // 11-20 by Market Cap
  {
    id: 'dot',
    name: 'Polkadot',
    symbol: 'DOT',
    type: 'altcoin',
    basePrice: 7.8,
    volatility: 'high',
    description: 'Multi-chain protocol enabling different blockchains to transfer messages and value.'
  },
  {
    id: 'matic',
    name: 'Polygon',
    symbol: 'MATIC',
    type: 'altcoin',
    basePrice: 0.85,
    volatility: 'very_high',
    description: 'Ethereum scaling solution providing faster and cheaper transactions.'
  },
  {
    id: 'shib',
    name: 'Shiba Inu',
    symbol: 'SHIB',
    type: 'altcoin',
    basePrice: 0.00002,
    volatility: 'extreme',
    description: 'Meme-based cryptocurrency with a passionate community.'
  },
  {
    id: 'trx',
    name: 'TRON',
    symbol: 'TRX',
    type: 'altcoin',
    basePrice: 0.12,
    volatility: 'high',
    description: 'Decentralized platform focused on content sharing and entertainment.'
  },
  {
    id: 'dai',
    name: 'Dai',
    symbol: 'DAI',
    type: 'stablecoin',
    basePrice: 1,
    volatility: 'very_low',
    description: 'Decentralized stablecoin maintained through automated smart contracts.'
  },
  {
    id: 'link',
    name: 'Chainlink',
    symbol: 'LINK',
    type: 'altcoin',
    basePrice: 15,
    volatility: 'high',
    description: 'Decentralized oracle network connecting smart contracts with real-world data.'
  },
  {
    id: 'uni',
    name: 'Uniswap',
    symbol: 'UNI',
    type: 'altcoin',
    basePrice: 8.5,
    volatility: 'high',
    description: 'Governance token for Uniswap, a leading decentralized exchange protocol.'
  },
  {
    id: 'atom',
    name: 'Cosmos',
    symbol: 'ATOM',
    type: 'altcoin',
    basePrice: 9.2,
    volatility: 'high',
    description: 'Ecosystem of blockchains designed for scalability and interoperability.'
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    symbol: 'LTC',
    type: 'altcoin',
    basePrice: 75,
    volatility: 'high',
    description: 'Peer-to-peer cryptocurrency designed for fast, low-cost payments.'
  },
  {
    id: 'bch',
    name: 'Bitcoin Cash',
    symbol: 'BCH',
    type: 'altcoin',
    basePrice: 290,
    volatility: 'high',
    description: 'Bitcoin fork focused on scaling for everyday transactions.'
  },
  // 21-30 by Market Cap
  {
    id: 'etc',
    name: 'Ethereum Classic',
    symbol: 'ETC',
    type: 'altcoin',
    basePrice: 25,
    volatility: 'very_high',
    description: 'Original Ethereum blockchain that maintains the unaltered history.'
  },
  {
    id: 'near',
    name: 'NEAR Protocol',
    symbol: 'NEAR',
    type: 'altcoin',
    basePrice: 5.8,
    volatility: 'very_high',
    description: 'Layer 1 blockchain designed for usability and scalability.'
  },
  {
    id: 'algo',
    name: 'Algorand',
    symbol: 'ALGO',
    type: 'altcoin',
    basePrice: 0.18,
    volatility: 'high',
    description: 'Pure proof-of-stake blockchain with focus on security and decentralization.'
  },
  {
    id: 'vet',
    name: 'VeChain',
    symbol: 'VET',
    type: 'altcoin',
    basePrice: 0.032,
    volatility: 'high',
    description: 'Blockchain platform focused on supply chain management and business processes.'
  },
  {
    id: 'fil',
    name: 'Filecoin',
    symbol: 'FIL',
    type: 'altcoin',
    basePrice: 5.5,
    volatility: 'very_high',
    description: 'Decentralized storage network allowing users to rent out spare storage space.'
  },
  {
    id: 'xlm',
    name: 'Stellar',
    symbol: 'XLM',
    type: 'altcoin',
    basePrice: 0.11,
    volatility: 'high',
    description: 'Platform connecting financial institutions for large transactions with minimal fees.'
  },
  {
    id: 'icp',
    name: 'Internet Computer',
    symbol: 'ICP',
    type: 'altcoin',
    basePrice: 12.5,
    volatility: 'very_high',
    description: 'Blockchain network extending the internet with computation capabilities.'
  },
  {
    id: 'hbar',
    name: 'Hedera',
    symbol: 'HBAR',
    type: 'altcoin',
    basePrice: 0.07,
    volatility: 'high',
    description: 'Enterprise-grade public network for decentralized applications.'
  },
  {
    id: 'apt',
    name: 'Aptos',
    symbol: 'APT',
    type: 'altcoin',
    basePrice: 8.3,
    volatility: 'very_high',
    description: 'Layer 1 blockchain designed for safe, scalable applications.'
  },
  {
    id: 'sand',
    name: 'The Sandbox',
    symbol: 'SAND',
    type: 'altcoin',
    basePrice: 0.45,
    volatility: 'very_high',
    description: 'Virtual world where players can build, own, and monetize experiences.'
  },
  // 31-40 by Market Cap
  {
    id: 'egld',
    name: 'MultiversX',
    symbol: 'EGLD',
    type: 'altcoin',
    basePrice: 45,
    volatility: 'very_high',
    description: 'Blockchain platform for distributed apps, enterprise use cases, and smart contracts.'
  },
  {
    id: 'theta',
    name: 'Theta Network',
    symbol: 'THETA',
    type: 'altcoin',
    basePrice: 1.3,
    volatility: 'high',
    description: 'Decentralized video delivery network powered by blockchain technology.'
  },
  {
    id: 'axs',
    name: 'Axie Infinity',
    symbol: 'AXS',
    type: 'altcoin',
    basePrice: 7.2,
    volatility: 'extreme',
    description: 'Governance token for the Axie Infinity game universe.'
  },
  {
    id: 'flow',
    name: 'Flow',
    symbol: 'FLOW',
    type: 'altcoin',
    basePrice: 0.78,
    volatility: 'high',
    description: 'Blockchain designed for games, apps, and digital assets.'
  },
  {
    id: 'xmr',
    name: 'Monero',
    symbol: 'XMR',
    type: 'altcoin',
    basePrice: 170,
    volatility: 'high',
    description: 'Privacy-focused cryptocurrency concealing sender, recipient, and amount.'
  },
  {
    id: 'grt',
    name: 'The Graph',
    symbol: 'GRT',
    type: 'altcoin',
    basePrice: 0.15,
    volatility: 'high',
    description: 'Indexing protocol for querying networks like Ethereum and IPFS.'
  },
  {
    id: 'ftm',
    name: 'Fantom',
    symbol: 'FTM',
    type: 'altcoin',
    basePrice: 0.48,
    volatility: 'very_high',
    description: 'Directed acyclic graph smart contract platform providing DeFi services.'
  },
  {
    id: 'ar',
    name: 'Arweave',
    symbol: 'AR',
    type: 'altcoin',
    basePrice: 18,
    volatility: 'very_high',
    description: 'Data storage network enabling permanent, low-cost storage of data.'
  },
  {
    id: 'cake',
    name: 'PancakeSwap',
    symbol: 'CAKE',
    type: 'altcoin',
    basePrice: 2.9,
    volatility: 'very_high',
    description: 'Governance token for PancakeSwap, a decentralized exchange on BNB Chain.'
  },
  {
    id: 'aave',
    name: 'Aave',
    symbol: 'AAVE',
    type: 'altcoin',
    basePrice: 95,
    volatility: 'high',
    description: 'Decentralized lending protocol allowing users to lend and borrow crypto assets.'
  },
  // 41-50 by Market Cap
  {
    id: 'gmt',
    name: 'STEPN',
    symbol: 'GMT',
    type: 'altcoin',
    basePrice: 0.24,
    volatility: 'extreme',
    description: 'Governance token for a web3 lifestyle app with game elements.'
  },
  {
    id: 'kcs',
    name: 'KuCoin Token',
    symbol: 'KCS',
    type: 'altcoin',
    basePrice: 10.8,
    volatility: 'high',
    description: 'Native token of the KuCoin cryptocurrency exchange.'
  },
  {
    id: 'eos',
    name: 'EOS',
    symbol: 'EOS',
    type: 'altcoin',
    basePrice: 0.72,
    volatility: 'high',
    description: 'Blockchain protocol powered by the EOS token for secure data transfer.'
  },
  {
    id: 'kava',
    name: 'Kava',
    symbol: 'KAVA',
    type: 'altcoin',
    basePrice: 0.85,
    volatility: 'very_high',
    description: 'Layer 1 blockchain combining Ethereum and Cosmos ecosystems.'
  },
  {
    id: 'qnt',
    name: 'Quant',
    symbol: 'QNT',
    type: 'altcoin',
    basePrice: 120,
    volatility: 'high',
    description: 'Network facilitating interoperability between different blockchains and networks.'
  },
  {
    id: 'mana',
    name: 'Decentraland',
    symbol: 'MANA',
    type: 'altcoin',
    basePrice: 0.43,
    volatility: 'very_high',
    description: 'Virtual reality platform where users own and create content and experiences.'
  },
  {
    id: 'snx',
    name: 'Synthetix',
    symbol: 'SNX',
    type: 'altcoin',
    basePrice: 3.1,
    volatility: 'very_high',
    description: 'Derivatives liquidity protocol enabling the creation of synthetic assets.'
  },
  {
    id: 'rune',
    name: 'THORChain',
    symbol: 'RUNE',
    type: 'altcoin',
    basePrice: 5.5,
    volatility: 'very_high',
    description: 'Decentralized liquidity protocol allowing for native cross-chain swaps.'
  },
  {
    id: 'ldo',
    name: 'Lido DAO',
    symbol: 'LDO',
    type: 'altcoin',
    basePrice: 2.9,
    volatility: 'very_high',
    description: 'Governance token for the Lido liquid staking protocol.'
  },
  {
    id: 'neo',
    name: 'NEO',
    symbol: 'NEO',
    type: 'altcoin',
    basePrice: 11.2,
    volatility: 'high',
    description: 'Open-source blockchain platform with digital asset and smart contract capabilities.'
  },
  // Next 50 Cryptocurrencies (51-100)
  {
    id: 'pepe',
    name: 'Pepe',
    symbol: 'PEPE',
    type: 'altcoin',
    basePrice: 0.000002,
    volatility: 'extreme',
    description: 'Meme token based on the Pepe the Frog character.'
  },
  {
    id: 'chz',
    name: 'Chiliz',
    symbol: 'CHZ',
    type: 'altcoin',
    basePrice: 0.09,
    volatility: 'high',
    description: 'Platform for sports and entertainment tokenization.'
  },
  {
    id: 'crv',
    name: 'Curve DAO Token',
    symbol: 'CRV',
    type: 'altcoin',
    basePrice: 0.55,
    volatility: 'very_high',
    description: 'Governance token of Curve, a decentralized exchange for stablecoins.'
  },
  {
    id: 'ren',
    name: 'Ren',
    symbol: 'REN',
    type: 'altcoin',
    basePrice: 0.055,
    volatility: 'high',
    description: 'Open protocol providing access to inter-blockchain liquidity.'
  },
  {
    id: 'bat',
    name: 'Basic Attention Token',
    symbol: 'BAT',
    type: 'altcoin',
    basePrice: 0.26,
    volatility: 'high',
    description: 'Token for the Brave web browser, rewarding users for their attention.'
  },
  {
    id: 'comp',
    name: 'Compound',
    symbol: 'COMP',
    type: 'altcoin',
    basePrice: 55,
    volatility: 'high',
    description: 'Governance token for the Compound lending protocol.'
  },
  {
    id: 'enj',
    name: 'Enjin Coin',
    symbol: 'ENJ',
    type: 'altcoin',
    basePrice: 0.33,
    volatility: 'high',
    description: 'Cryptocurrency for virtual goods on the Ethereum blockchain.'
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
