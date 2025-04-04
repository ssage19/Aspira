// This file contains data for a simulated version of the S&P 500 index
// All company names and symbols have been modified to avoid copyright infringement

import { Stock, VolatilityLevel } from './investments';

// Helper function to create a stock with appropriate volatility levels
const createStock = (
  id: string,
  name: string,
  symbol: string,
  sector: string,
  basePrice: number,
  volatility: VolatilityLevel,
  description: string
): Stock => ({
  id,
  name,
  symbol,
  sector,
  basePrice,
  volatility,
  description
});

// Technology Sector
const technologyStocks: Stock[] = [
  createStock(
    'apricot_tech',
    'Apricot Technologies',
    'APCT',
    'tech',
    175.42,
    'medium',
    'Consumer electronics, software, and online services company.'
  ),
  createStock(
    'macrosoft',
    'Macrosoft Inc.',
    'MSFT',
    'tech',
    320.65,
    'low',
    'Software and cloud computing giant.'
  ),
  createStock(
    'amazonia',
    'Amazonia Corp',
    'AMZN',
    'tech',
    132.89,
    'medium',
    'E-commerce, cloud computing, digital streaming, and artificial intelligence company.'
  ),
  createStock(
    'alphabit',
    'Alphabit Inc.',
    'ALPH',
    'tech',
    140.35,
    'medium',
    'Internet search, advertising, cloud computing, and software company.'
  ),
  createStock(
    'meta_worlds',
    'Meta Worlds',
    'META',
    'tech',
    318.62,
    'high',
    'Social technology company focused on virtual reality and social networking.'
  ),
  createStock(
    'nvidia_studios',
    'Nvidia Studios',
    'NVDS',
    'tech',
    450.75,
    'high',
    'Graphics processing unit and artificial intelligence company.'
  ),
  createStock(
    'broadcom_systems',
    'Broadcom Systems',
    'BRCS',
    'tech',
    120.30,
    'medium',
    'Semiconductor and infrastructure software solutions provider.'
  ),
  createStock(
    'adobo_creative',
    'Adobo Creative Cloud',
    'ADBC',
    'tech',
    530.25,
    'medium',
    'Creative software and digital marketing company.'
  ),
  createStock(
    'sales_power',
    'Sales Power',
    'SPWR',
    'tech',
    235.83,
    'medium',
    'Enterprise customer relationship management software company.'
  ),
  createStock(
    'oracle_systems',
    'Oracle Systems Corp',
    'ORCL',
    'tech',
    109.63,
    'low',
    'Enterprise software and cloud engineering company.'
  ),
  createStock(
    'intel_inside',
    'Intel Inside',
    'INTL',
    'tech',
    38.90,
    'medium',
    'Semiconductor chip manufacturer focusing on processors and computing technology.'
  ),
  createStock(
    'advanced_micro_devices',
    'Advanced Micro Devices Corp',
    'AMDC',
    'tech',
    100.58,
    'high',
    'Semiconductor company specializing in processors and graphics technologies.'
  ),
  createStock(
    'cisco_webs',
    'Cisco Webs',
    'CICW',
    'tech',
    47.95,
    'low',
    'Networking hardware, software, and telecommunications equipment company.'
  ),
  createStock(
    'ibm_global',
    'IBM Global',
    'IBMG',
    'tech',
    172.90,
    'low',
    'Technology and consulting firm with cloud and cognitive solutions.'
  ),
  createStock(
    'texas_instruments',
    'Texas Instruments Inc',
    'TXI',
    'tech',
    168.53,
    'low',
    'Semiconductor design and manufacturing company.'
  )
];

// Financial Sector
const financialStocks: Stock[] = [
  createStock(
    'jp_chase',
    'JP Chase & Co',
    'JPMC',
    'finance',
    152.89,
    'medium',
    'Global financial services firm and banking institution.'
  ),
  createStock(
    'bank_of_america',
    'Bank of Americas',
    'BOAM',
    'finance',
    39.27,
    'medium',
    'Multinational investment bank and financial services company.'
  ),
  createStock(
    'wells_fargo_express',
    'Wells Fargo Express',
    'WFEX',
    'finance',
    53.12,
    'medium',
    'Financial services company providing banking, investment, and mortgage products.'
  ),
  createStock(
    'morgan_stanley_smith',
    'Morgan Stanley Smith',
    'MSST',
    'finance',
    88.34,
    'medium',
    'Global investment bank and financial services company.'
  ),
  createStock(
    'goldberg_sachs',
    'Goldberg Sachs Group',
    'GBSG',
    'finance',
    348.10,
    'medium',
    'Multinational investment bank and financial services company.'
  ),
  createStock(
    'american_express_card',
    'American Express Card',
    'AMXC',
    'finance',
    168.75,
    'low',
    'Financial services corporation specializing in payment cards.'
  ),
  createStock(
    'visa_world',
    'Visa World',
    'VISW',
    'finance',
    245.60,
    'low',
    'Global payments technology company facilitating electronic funds transfers.'
  ),
  createStock(
    'mastercard_intl',
    'Mastercard International',
    'MCIN',
    'finance',
    400.35,
    'low',
    'Global payment technology company operating worldwide.'
  ),
  createStock(
    'berkshire_investment',
    'Berkshire Investment Holdings',
    'BRKH',
    'finance',
    356.27,
    'low',
    'Multinational conglomerate holding company with diverse investments.'
  ),
  createStock(
    'blackrock_asset',
    'Blackrock Asset Management',
    'BKAM',
    'finance',
    780.92,
    'medium',
    'Global investment management corporation and financial planning company.'
  )
];

// Healthcare Sector
const healthcareStocks: Stock[] = [
  createStock(
    'united_health_group',
    'United Health Group Inc',
    'UHGI',
    'healthcare',
    480.25,
    'low',
    'Healthcare and insurance company providing medical benefits.'
  ),
  createStock(
    'johnson_brothers',
    'Johnson Brothers',
    'JNBR',
    'healthcare',
    156.33,
    'low',
    'Medical devices, pharmaceutical, and consumer packaged goods manufacturer.'
  ),
  createStock(
    'pfeiffer_pharma',
    'Pfeiffer Pharmaceuticals',
    'PFPH',
    'healthcare',
    37.80,
    'medium',
    'Pharmaceutical corporation developing and producing medicines and vaccines.'
  ),
  createStock(
    'merx_pharmaceuticals',
    'Merx Pharmaceuticals',
    'MERX',
    'healthcare',
    98.65,
    'medium',
    'Multinational pharmaceutical company focused on prescription medications.'
  ),
  createStock(
    'abbott_labs',
    'Abbott Scientific Labs',
    'ABSL',
    'healthcare',
    109.28,
    'low',
    'Medical devices and healthcare products company with global reach.'
  ),
  createStock(
    'moderna_therapeutics',
    'Moderna Therapeutics Inc',
    'MRNT',
    'healthcare',
    110.75,
    'very_high',
    'Pharmaceutical and biotechnology company focused on RNA therapeutics.'
  ),
  createStock(
    'amgen_bioscience',
    'Amgen Bioscience',
    'AMBS',
    'healthcare',
    275.93,
    'medium',
    'Biopharmaceutical company developing innovative human therapeutics.'
  ),
  createStock(
    'elevance_health',
    'Elevance Health Services',
    'ELHS',
    'healthcare',
    452.15,
    'low',
    'Health insurance provider offering a range of medical plans.'
  ),
  createStock(
    'vertex_pharmaceuticals',
    'Vertex Pharmaceuticals',
    'VRTX',
    'healthcare',
    365.10,
    'high',
    'Biotechnology company focused on developing treatments for serious diseases.'
  ),
  createStock(
    'regeneron_biolabs',
    'Regeneron BioLabs',
    'RGNB',
    'healthcare',
    825.30,
    'high',
    'Biotechnology company developing medications for serious medical conditions.'
  )
];

// Consumer Sector
const consumerStocks: Stock[] = [
  createStock(
    'cola_company',
    'Cola Company',
    'COLA',
    'consumer',
    62.47,
    'low',
    'Beverage corporation manufacturing and retailing nonalcoholic drinks.'
  ),
  createStock(
    'pepso_corp',
    'Pepso Corporation',
    'PEPC',
    'consumer',
    172.56,
    'low',
    'Food, snack, and beverage corporation with global operations.'
  ),
  createStock(
    'procter_gamble',
    'Procter & Gamble Co.',
    'PRGM',
    'consumer',
    150.82,
    'low',
    'Consumer goods corporation specializing in personal care and hygiene products.'
  ),
  createStock(
    'walmart_stores',
    'Walmart Stores Inc',
    'WMST',
    'consumer',
    58.97,
    'low',
    'Multinational retail corporation operating discount department stores.'
  ),
  createStock(
    'costmoore',
    'Costmoore Inc',
    'CSTM',
    'consumer',
    570.35,
    'low',
    'Membership-based retail warehouse club with global operations.'
  ),
  createStock(
    'nikke_sportswear',
    'Nikke Sportswear',
    'NKSP',
    'consumer',
    98.65,
    'medium',
    'Athletic footwear, apparel, equipment, and accessories manufacturer.'
  ),
  createStock(
    'mcdouglas',
    'McDouglas Corp',
    'MCDG',
    'consumer',
    268.32,
    'low',
    'Global fast food restaurant chain with franchises worldwide.'
  ),
  createStock(
    'starbeans_coffee',
    'Starbeans Coffee Company',
    'SBCF',
    'consumer',
    95.37,
    'medium',
    'Coffee company and coffeehouse chain operating globally.'
  ),
  createStock(
    'disney_entertainment',
    'Disney Entertainment Corp',
    'DSNC',
    'consumer',
    112.68,
    'medium',
    'Mass media and entertainment conglomerate with diverse business segments.'
  ),
  createStock(
    'tesla_motors',
    'Tesla Motors Inc',
    'TSLM',
    'consumer',
    186.92,
    'very_high',
    'Electric vehicle and clean energy company with automotive and energy solutions.'
  ),
  createStock(
    'netflicks',
    'Netflicks Inc',
    'NFLX',
    'consumer',
    540.18,
    'high',
    'Subscription streaming service and production company offering online entertainment.'
  ),
  createStock(
    'home_deport',
    'Home Deport Inc',
    'HDEP',
    'consumer',
    325.75,
    'medium',
    'Home improvement retail corporation selling construction products and services.'
  )
];

// Energy Sector
const energyStocks: Stock[] = [
  createStock(
    'chevrone_corp',
    'Chevrone Corporation',
    'CHVR',
    'energy',
    156.83,
    'medium',
    'Multinational energy corporation involved in oil, gas, and petroleum products.'
  ),
  createStock(
    'exxonmobile',
    'ExxonMobile Corp',
    'EXMO',
    'energy',
    106.37,
    'medium',
    'Oil and gas corporation engaged in exploration, production, and refining.'
  ),
  createStock(
    'conoco_phillips',
    'Conoco Phillips Oil',
    'CNCO',
    'energy',
    118.54,
    'medium',
    'Exploration and production company focused on oil and natural gas.'
  ),
  createStock(
    'duke_energy',
    'Duke Energy Corp',
    'DUKE',
    'energy',
    96.80,
    'low',
    'Electric power and natural gas holding company with generation assets.'
  ),
  createStock(
    'next_era_energy',
    'Next Era Energy Inc',
    'NEER',
    'energy',
    72.43,
    'low',
    'Energy company with renewable and traditional power generation.'
  ),
  createStock(
    'southern_company',
    'Southern Company Electric',
    'SCEL',
    'energy',
    70.25,
    'low',
    'Gas and electric utility holding company servicing multiple states.'
  ),
  createStock(
    'solar_edge',
    'Solar Edge Technologies',
    'SLRD',
    'energy',
    75.89,
    'very_high',
    'Photovoltaic inverters and power optimizers for solar energy systems.'
  ),
  createStock(
    'first_solar',
    'First Solar Inc',
    'FSLR',
    'energy',
    165.73,
    'high',
    'Solar panel manufacturer specializing in thin-film modules.'
  )
];

// Industrial Sector
const industrialStocks: Stock[] = [
  createStock(
    'caterpillar_machines',
    'Caterpillar Machines Inc',
    'CTPM',
    'industrial',
    276.49,
    'medium',
    'Construction equipment, engines, and machinery manufacturer.'
  ),
  createStock(
    'general_power',
    'General Power Corporation',
    'GPWR',
    'industrial',
    145.87,
    'medium',
    'Multinational conglomerate with aerospace, power, and renewable energy divisions.'
  ),
  createStock(
    'united_global',
    'United Global Delivery',
    'UGD',
    'industrial',
    186.25,
    'low',
    'Package delivery and supply chain management company operating worldwide.'
  ),
  createStock(
    'fedex_shipping',
    'Fedex Shipping Service',
    'FEDX',
    'industrial',
    275.60,
    'medium',
    'Logistics services company specializing in transportation and e-commerce.'
  ),
  createStock(
    'boeing_aerospace',
    'Boeing Aerospace Corp',
    'BNAC',
    'industrial',
    218.45,
    'high',
    'Aerospace manufacturer producing commercial aircraft, defense products, and space systems.'
  ),
  createStock(
    'lockheed_martin',
    'Lockheed Martin Technologies',
    'LKMT',
    'industrial',
    456.38,
    'medium',
    'Aerospace, defense, security, and advanced technologies company.'
  ),
  createStock(
    'raytheon_defense',
    'Raytheon Defense Systems',
    'RTDS',
    'industrial',
    87.52,
    'medium',
    'Aerospace and defense company specializing in military technologies.'
  ),
  createStock(
    'honeywell_intl',
    'Honeywell International',
    'HONW',
    'industrial',
    200.57,
    'low',
    'Conglomerate with aerospace, building technologies, and safety solutions.'
  )
];

// Real Estate Sector
const realEstateStocks: Stock[] = [
  createStock(
    'american_tower',
    'American Tower REIT',
    'AMTR',
    'real_estate',
    195.27,
    'medium',
    'Real estate investment trust that owns and operates wireless communications infrastructure.'
  ),
  createStock(
    'prologis_industrial',
    'Prologis Industrial REIT',
    'PLGI',
    'real_estate',
    123.85,
    'medium',
    'Real estate investment trust focused on logistics facilities and warehouses.'
  ),
  createStock(
    'crown_castle',
    'Crown Castle Properties',
    'CWCP',
    'real_estate',
    106.27,
    'medium',
    'Real estate investment trust specializing in shared communications infrastructure.'
  ),
  createStock(
    'simon_property',
    'Simon Property Group',
    'SMPG',
    'real_estate',
    148.35,
    'medium',
    'Real estate investment trust engaged in shopping, dining, and entertainment destinations.'
  ),
  createStock(
    'public_storage',
    'Public Storage Inc',
    'PBST',
    'real_estate',
    285.73,
    'low',
    'Real estate investment trust that acquires, develops, and operates self-storage facilities.'
  )
];

// Communication Services Sector
const communicationStocks: Stock[] = [
  createStock(
    'verizon_wireless',
    'Verizon Wireless Communications',
    'VRWC',
    'communication',
    40.89,
    'low',
    'Telecommunications company providing wireless network and communications services.'
  ),
  createStock(
    'at&t_telecom',
    'AT&T Telecom Inc',
    'ATTT',
    'communication',
    17.38,
    'medium',
    'Telecommunications and media organization with global operations.'
  ),
  createStock(
    'comcast_media',
    'Comcast Media Corp',
    'CMMC',
    'communication',
    45.72,
    'medium',
    'Media and technology company providing communications and entertainment services.'
  ),
  createStock(
    'charter_communications',
    'Charter Communications',
    'CHCM',
    'communication',
    325.64,
    'medium',
    'Cable operator providing video, internet, and voice services to residential customers.'
  ),
  createStock(
    't_mobile_us',
    'T-Mobile US',
    'TMUS',
    'communication',
    140.53,
    'medium',
    'Wireless network operator providing mobile communications services.'
  )
];

// Materials Sector
const materialsStocks: Stock[] = [
  createStock(
    'linde_chemicals',
    'Linde Chemicals Inc',
    'LNDC',
    'materials',
    375.82,
    'low',
    'Industrial gases and engineering company with global operations.'
  ),
  createStock(
    'sherwin_williams',
    'Sherwin Williams Paints',
    'SHWP',
    'materials',
    290.35,
    'low',
    'Paint and coating manufacturer producing products for professional and retail customers.'
  ),
  createStock(
    'air_products',
    'Air Products & Chemicals',
    'APCH',
    'materials',
    270.43,
    'low',
    'Industrial gases and chemicals supplier serving various industries.'
  ),
  createStock(
    'dupont_materials',
    'Dupont Materials Science',
    'DPMS',
    'materials',
    75.28,
    'medium',
    'Materials science company developing specialty materials, chemicals, and agricultural products.'
  ),
  createStock(
    'newmont_mining',
    'Newmont Mining Corp',
    'NWMC',
    'materials',
    45.38,
    'high',
    'Gold mining company with operations in various countries.'
  ),
  createStock(
    'freeport_minerals',
    'Freeport Minerals',
    'FPMI',
    'materials',
    40.28,
    'high',
    'Mining company with significant copper, gold, and molybdenum reserves.'
  )
];

// Utilities Sector
const utilitiesStocks: Stock[] = [
  createStock(
    'nextera_utilities',
    'Nextera Utilities Corp',
    'NXUC',
    'utilities',
    75.38,
    'low',
    'Electric power and energy infrastructure company with renewable energy focus.'
  ),
  createStock(
    'southern_electric',
    'Southern Electric Company',
    'SOEC',
    'utilities',
    71.25,
    'low',
    'Gas and electric utility holding company operating power plants.'
  ),
  createStock(
    'dominion_energy',
    'Dominion Energy Inc',
    'DMEN',
    'utilities',
    51.73,
    'low',
    'Power and energy company producing and distributing electricity.'
  ),
  createStock(
    'american_electric',
    'American Electric Power',
    'AMEP',
    'utilities',
    83.27,
    'low',
    'Electric utility company delivering electricity to millions of customers.'
  ),
  createStock(
    'exelon_corp',
    'Exelon Corporation',
    'EXCN',
    'utilities',
    36.85,
    'low',
    'Utility services holding company with electricity and natural gas operations.'
  )
];

// Combine all sectors into the simulated S&P 500
export const sp500Stocks: Stock[] = [
  ...technologyStocks,
  ...financialStocks,
  ...healthcareStocks,
  ...consumerStocks,
  ...energyStocks,
  ...industrialStocks,
  ...realEstateStocks,
  ...communicationStocks,
  ...materialsStocks,
  ...utilitiesStocks
];

// Add some extreme volatility stocks for high-risk investors
export const specialtyStocks: Stock[] = [
  createStock(
    'cosmic_crypto',
    'Cosmic Cryptocurrency Exchange',
    'CCEX',
    'finance',
    85.37,
    'extreme',
    'Digital asset exchange platform specializing in cryptocurrency trading.'
  ),
  createStock(
    'quantum_computing',
    'Quantum Computing Solutions',
    'QCSL',
    'tech',
    124.83,
    'extreme',
    'Advanced computing company developing quantum processors and algorithms.'
  ),
  createStock(
    'gene_therapy',
    'GeneTech Therapy Inc',
    'GNTH',
    'healthcare',
    67.29,
    'extreme',
    'Biotechnology company pioneering gene editing and personalized medicine.'
  ),
  createStock(
    'asteroid_mining',
    'Asteroid Mining Ventures',
    'ASTM',
    'materials',
    32.75,
    'extreme',
    'Space resource company developing technologies for mining celestial bodies.'
  ),
  createStock(
    'virtual_worlds',
    'Virtual Worlds Metaverse',
    'VWMV',
    'tech',
    28.95,
    'extreme',
    'Virtual reality company building immersive digital environments and experiences.'
  )
];

// Export all stocks combined for the expanded stock market
export const expandedStockMarket: Stock[] = [
  ...sp500Stocks,
  ...specialtyStocks
];