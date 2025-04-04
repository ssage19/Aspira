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
  ),
  createStock(
    'qualcomm_mobile',
    'Qualcomm Mobile Technologies',
    'QCOM',
    'tech',
    134.76,
    'medium',
    'Semiconductor and telecommunications equipment company specializing in mobile technologies.'
  ),
  createStock(
    'micron_memory',
    'Micron Memory Solutions',
    'MCRN',
    'tech',
    78.42,
    'high',
    'Semiconductor company producing memory and data storage solutions.'
  ),
  createStock(
    'autodesk_design',
    'Autodesk Design Suite',
    'ADSK',
    'tech',
    236.84,
    'medium',
    'Software company specializing in design and engineering software.'
  ),
  createStock(
    'intuit_finance',
    'Intuit Finance Software',
    'INTU',
    'tech',
    498.75,
    'low',
    'Business and financial software company providing accounting and tax preparation solutions.'
  ),
  createStock(
    'service_now',
    'ServiceNow Inc',
    'SNOW',
    'tech',
    670.32,
    'medium',
    'Cloud computing platform providing technical management support and digital workflow products.'
  ),
  createStock(
    'activision_games',
    'Activision Games',
    'ATVI',
    'tech',
    92.45,
    'medium',
    'Interactive entertainment and video game development company.'
  ),
  createStock(
    'electronic_arts',
    'Electronic Arts Interactive',
    'EINT',
    'tech',
    127.38,
    'medium',
    'Video game company developing and distributing games and entertainment content.'
  ),
  createStock(
    'palo_alto_networks',
    'Palo Alto Networks',
    'PANW',
    'tech',
    245.76,
    'medium',
    'Cybersecurity company providing advanced firewall and cloud-based security solutions.'
  ),
  createStock(
    'crowdstrike_security',
    'CrowdStrike Security',
    'CRWD',
    'tech',
    176.32,
    'high',
    'Cybersecurity technology company providing cloud workload and endpoint security solutions.'
  ),
  createStock(
    'zscaler_cloud',
    'Zscaler Cloud Security',
    'ZSCL',
    'tech',
    148.95,
    'high',
    'Cloud security company providing web and mobile security solutions.'
  ),
  createStock(
    'verisign_internet',
    'Verisign Internet Services',
    'VRSN',
    'tech',
    210.87,
    'low',
    'Internet infrastructure provider managing domain name registries and DNS infrastructure.'
  ),
  createStock(
    'cadence_design',
    'Cadence Design Systems',
    'CDNS',
    'tech',
    234.56,
    'medium',
    'Software and engineering services company focused on electronic systems design.'
  ),
  createStock(
    'synopsys_software',
    'Synopsys Software Tools',
    'SNPS',
    'tech',
    315.78,
    'medium',
    'Electronic design automation company for chip design and software security.'
  ),
  createStock(
    'akamai_technologies',
    'Akamai Technologies',
    'AKAM',
    'tech',
    108.45,
    'low',
    'Content delivery network and cloud service provider for web security and performance.'
  ),
  createStock(
    'fortinet_security',
    'Fortinet Security',
    'FTNT',
    'tech',
    65.23,
    'medium',
    'Cybersecurity solutions company providing firewalls and network security products.'
  ),
  createStock(
    'citrix_systems',
    'Citrix Systems',
    'CTRX',
    'tech',
    97.32,
    'low',
    'Cloud computing and virtualization technology company for workspace solutions.'
  ),
  createStock(
    'square_payments',
    'Square Payments',
    'SQRE',
    'tech',
    155.78,
    'high',
    'Financial services and mobile payment company providing hardware and software solutions.'
  ),
  createStock(
    'workday_hr',
    'Workday HR Solutions',
    'WDAY',
    'tech',
    220.45,
    'medium',
    'Cloud-based platform for financial management and human capital management.'
  ),
  createStock(
    'zendesk_support',
    'Zendesk Support Systems',
    'ZNDK',
    'tech',
    76.89,
    'medium',
    'Customer service software and support ticket system company.'
  ),
  createStock(
    'docusign_digital',
    'DocuSign Digital',
    'DOCU',
    'tech',
    52.30,
    'high',
    'Electronic signature and digital transaction management services.'
  ),
  createStock(
    'datadog_monitoring',
    'Datadog Monitoring',
    'DDOG',
    'tech',
    95.65,
    'high',
    'Monitoring and analytics platform for cloud-scale applications and infrastructure.'
  ),
  createStock(
    'splunk_data',
    'Splunk Data Analytics',
    'SPLK',
    'tech',
    120.78,
    'medium',
    'Software platform for searching, monitoring, and analyzing machine-generated big data.'
  ),
  createStock(
    'dropbox_storage',
    'Dropbox Storage Solutions',
    'DRPB',
    'tech',
    28.95,
    'medium',
    'File hosting service offering cloud storage and file synchronization services.'
  ),
  createStock(
    'spotify_music',
    'Spotify Music Streaming',
    'SPOT',
    'tech',
    146.78,
    'high',
    'Audio streaming and media services provider with a freemium business model.'
  ),
  createStock(
    'ring_security',
    'Ring Home Security',
    'RING',
    'tech',
    65.45,
    'medium',
    'Smart home security products including video doorbells and surveillance cameras.'
  ),
  createStock(
    'roku_streaming',
    'Roku Streaming',
    'ROKU',
    'tech',
    72.89,
    'very_high',
    'Digital media player manufacturer providing streaming devices and services.'
  ),
  createStock(
    'shopify_ecommerce',
    'Shopify E-commerce',
    'SHOP',
    'tech',
    62.38,
    'high',
    'E-commerce platform for online stores and retail point-of-sale systems.'
  ),
  createStock(
    'zoom_video',
    'Zoom Video Communications',
    'ZOOM',
    'tech',
    68.54,
    'high',
    'Video teleconferencing software company providing remote communication services.'
  ),
  createStock(
    'pinterest_social',
    'Pinterest Social Media',
    'PINS',
    'tech',
    28.67,
    'high',
    'Image sharing and social media service designed for discovery of information via pinboards.'
  ),
  createStock(
    'snap_chat',
    'SnapChat Social',
    'SNAP',
    'tech',
    13.78,
    'very_high',
    'Camera and social media company with multimedia messaging app.'
  ),
  createStock(
    'twitch_streaming',
    'Twitch Interactive',
    'TWTC',
    'tech',
    45.67,
    'high',
    'Video live streaming service focusing on video game livestreaming and esports competitions.'
  ),
  createStock(
    'unity_software',
    'Unity Software',
    'UNTY',
    'tech',
    35.45,
    'high',
    'Video game software development company providing a game engine for multiplatform games.'
  ),
  createStock(
    'snowflake_data',
    'Snowflake Data Cloud',
    'SNOW',
    'tech',
    165.87,
    'high',
    'Cloud-based data-warehousing company providing data storage and analytics services.'
  ),
  createStock(
    'elastic_search',
    'Elastic Search',
    'ELAS',
    'tech',
    78.32,
    'medium',
    'Search and data analytics company providing enterprise search, observability, and security.'
  ),
  createStock(
    'mongodb_database',
    'MongoDB Database',
    'MDBS',
    'tech',
    345.67,
    'medium',
    'Source-available cross-platform document-oriented database program for modern applications.'
  ),
  createStock(
    'roblox_gaming',
    'Roblox Gaming Platform',
    'RBLX',
    'tech',
    41.23,
    'high',
    'Online game platform and game creation system for user-created games.'
  ),
  createStock(
    'duolingo_learning',
    'Duolingo Learning',
    'DUOL',
    'tech',
    178.94,
    'high',
    'Language-learning platform and educational application with free and premium features.'
  ),
  createStock(
    'box_storage',
    'Box Cloud Storage',
    'BOXX',
    'tech',
    29.75,
    'medium',
    'Cloud content management and file sharing service for businesses.'
  ),
  createStock(
    'nintendo_games',
    'Nintendo Games',
    'NTDO',
    'tech',
    320.45,
    'medium',
    'Consumer electronics and video game company with hardware and game development.'
  ),
  createStock(
    'sony_entertainment',
    'Sony Entertainment',
    'SONY',
    'tech',
    87.65,
    'medium',
    'Multinational conglomerate with gaming, electronics, and entertainment divisions.'
  ),
  createStock(
    'palantir_data',
    'Palantir Data Analytics',
    'PLTR',
    'tech',
    16.78,
    'high',
    'Software company specializing in big data analytics and government contracts.'
  ),
  createStock(
    'tradingview_finance',
    'TradingView Finance',
    'TRDV',
    'tech',
    23.45,
    'high',
    'Financial platform and social network for traders and investors with charting tools.'
  ),
  createStock(
    'hubspot_marketing',
    'HubSpot Marketing',
    'HUBS',
    'tech',
    450.78,
    'medium',
    'Developer and marketer of software products for marketing, sales, and customer service.'
  ),
  createStock(
    'okta_identity',
    'Okta Identity',
    'OKTA',
    'tech',
    85.67,
    'medium',
    'Identity and access management company providing cloud software for secure access.'
  ),
  createStock(
    'asana_project',
    'Asana Project Management',
    'ASAN',
    'tech',
    21.34,
    'high',
    'Web and mobile application designed to help teams organize, track, and manage their work.'
  ),
  createStock(
    'monday_com',
    'Monday.com Work OS',
    'MNDY',
    'tech',
    175.89,
    'high',
    'Cloud-based work operating system for team management and workflow optimization.'
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
  ),
  createStock(
    'citigroup_financial',
    'Citigroup Financial',
    'CITI',
    'finance',
    52.39,
    'medium',
    'Multinational investment bank and financial services corporation with global presence.'
  ),
  createStock(
    'capital_one_financial',
    'Capital One Financial',
    'CAPF',
    'finance',
    106.78,
    'medium',
    'Bank holding company specializing in credit cards, auto loans, and banking services.'
  ),
  createStock(
    'state_street_corp',
    'State Street Corporation',
    'STSC',
    'finance',
    71.25,
    'low',
    'Financial services company providing investment management, research, and trading services.'
  ),
  createStock(
    'fidelity_investments',
    'Fidelity Investments',
    'FIDL',
    'finance',
    321.45,
    'low',
    'Financial services corporation providing investment management and retirement planning services.'
  ),
  createStock(
    'vanguard_group',
    'Vanguard Group',
    'VANG',
    'finance',
    298.76,
    'low',
    'Investment management company offering mutual funds and ETFs with low expense ratios.'
  ),
  createStock(
    'allstate_insurance',
    'Allstate Insurance',
    'ALST',
    'finance',
    134.56,
    'low',
    'Insurance company providing auto, home, and life insurance products and services.'
  ),
  createStock(
    'progressive_insurance',
    'Progressive Insurance',
    'PRGR',
    'finance',
    148.92,
    'low',
    'Insurance company specializing in auto insurance and other personal line insurance products.'
  ),
  createStock(
    'metlife_insurance',
    'MetLife Insurance',
    'METL',
    'finance',
    67.83,
    'low',
    'Global provider of insurance, annuities, and employee benefit programs.'
  ),
  createStock(
    'travelers_insurance',
    'Travelers Insurance Group',
    'TRVL',
    'finance',
    175.29,
    'low',
    'Insurance company providing property and casualty insurance products and services.'
  ),
  createStock(
    'chubb_limited',
    'Chubb Limited Insurance',
    'CHUB',
    'finance',
    216.74,
    'low',
    'Global insurance company providing commercial and personal property and casualty insurance.'
  ),
  createStock(
    'aon_insurance',
    'Aon Insurance Brokers',
    'AONB',
    'finance',
    325.67,
    'low',
    'Professional services firm providing risk, retirement, and health solutions.'
  ),
  createStock(
    'prudential_financial',
    'Prudential Financial',
    'PRUD',
    'finance',
    104.53,
    'medium',
    'Financial services company providing insurance, investment management, and other financial products.'
  ),
  createStock(
    'charles_schwab',
    'Charles Schwab Corp',
    'SCHW',
    'finance',
    65.38,
    'medium',
    'Banking and brokerage company providing financial services and investment management.'
  ),
  createStock(
    'ameriprise_financial',
    'Ameriprise Financial',
    'AMPR',
    'finance',
    348.75,
    'medium',
    'Financial planning and services company providing wealth management and asset management.'
  ),
  createStock(
    'intercontinental_exchange',
    'Intercontinental Exchange',
    'ICE',
    'finance',
    132.54,
    'medium',
    'Fortune 500 company operating global exchanges and clearing houses for financial markets.'
  ),
  createStock(
    'cme_group',
    'CME Group',
    'CMEG',
    'finance',
    198.43,
    'medium',
    'Global markets company operating derivatives exchange trading futures contracts and options.'
  ),
  createStock(
    'nasdaq_inc',
    'Nasdaq Inc',
    'NSDQ',
    'finance',
    56.78,
    'medium',
    'American stock exchange providing trading, clearing, securities listing, and information services.'
  ),
  createStock(
    'moodys_corporation',
    'Moodys Corporation',
    'MODC',
    'finance',
    382.54,
    'low',
    'Business and financial services company providing credit ratings, research, and risk analysis.'
  ),
  createStock(
    'sp_global',
    'S&P Global',
    'SPGI',
    'finance',
    412.87,
    'low',
    'American publicly traded corporation providing financial information and analytics.'
  ),
  createStock(
    'pnc_financial',
    'PNC Financial Services',
    'PNCF',
    'finance',
    148.26,
    'low',
    'Bank holding company and financial services corporation.'
  ),
  createStock(
    'truist_financial',
    'Truist Financial',
    'TRST',
    'finance',
    35.64,
    'medium',
    'Bank holding company formed by the merger of BB&T and SunTrust Banks.'
  ),
  createStock(
    'us_bancorp',
    'US Bancorp',
    'USBK',
    'finance',
    43.26,
    'low',
    'American bank holding company providing banking, investment, mortgage, and trust services.'
  ),
  createStock(
    'fifth_third_bancorp',
    'Fifth Third Bancorp',
    'FITB',
    'finance',
    36.54,
    'medium',
    'Diversified financial services company operating as a bank holding company.'
  ),
  createStock(
    'synchrony_financial',
    'Synchrony Financial',
    'SYNF',
    'finance',
    31.67,
    'high',
    'Consumer financial services company providing credit services and private label credit cards.'
  ),
  createStock(
    'paypal_holdings',
    'PayPal Holdings',
    'PYPL',
    'finance',
    64.23,
    'high',
    'Financial technology company operating an online payments system and digital wallet service.'
  ),
  createStock(
    'discover_financial',
    'Discover Financial Services',
    'DISC',
    'finance',
    112.34,
    'medium',
    'Financial services company providing banking and payment services through Discover Card.'
  ),
  createStock(
    'goldman_global',
    'Goldman Global Management',
    'GSGL',
    'finance',
    427.83,
    'medium',
    'Global investment banking, securities, and investment management firm.'
  ),
  createStock(
    'hartford_financial',
    'Hartford Financial Services',
    'HART',
    'finance',
    74.62,
    'low',
    'Investment and insurance company providing property and casualty insurance, group benefits, and mutual funds.'
  ),
  createStock(
    'lincoln_financial',
    'Lincoln Financial Group',
    'LFGP',
    'finance',
    28.45,
    'medium',
    'American holding company operating multiple insurance and investment businesses.'
  ),
  createStock(
    'principal_financial',
    'Principal Financial Group',
    'PRIN',
    'finance',
    78.93,
    'low',
    'Global financial investment management and insurance company providing retirement services.'
  ),
  createStock(
    'northern_trust',
    'Northern Trust Corp',
    'NTRS',
    'finance',
    76.45,
    'low',
    'Financial services company providing wealth management, asset servicing, and asset management.'
  ),
  createStock(
    'lazard_investment',
    'Lazard Investment Bank',
    'LAZR',
    'finance',
    35.67,
    'medium',
    'Financial advisory and asset management firm providing advice on mergers and acquisitions.'
  ),
  createStock(
    'raymond_james',
    'Raymond James Financial',
    'RAYM',
    'finance',
    107.45,
    'medium',
    'Financial services and investment banking company providing securities brokerage services.'
  ),
  createStock(
    'edwardjones_investments',
    'Edward Jones Investments',
    'EDJN',
    'finance',
    85.34,
    'low',
    'Financial services firm providing financial products and services to individual investors.'
  ),
  createStock(
    'coinbase_crypto',
    'Coinbase Crypto Exchange',
    'COIN',
    'finance',
    142.67,
    'extreme',
    'Cryptocurrency exchange platform for buying, selling, and storing cryptocurrency.'
  ),
  createStock(
    'robinhood_markets',
    'Robinhood Markets',
    'HOOD',
    'finance',
    18.75,
    'very_high',
    'Financial services company providing commission-free trades of stocks and ETFs via mobile app.'
  ),
  createStock(
    'etrade_financial',
    'E*Trade Financial',
    'ETRD',
    'finance',
    58.93,
    'medium',
    'Financial services company providing online brokerage and banking services.'
  ),
  createStock(
    'hsbc_holdings',
    'HSBC Holdings',
    'HSBC',
    'finance',
    40.23,
    'medium',
    'British multinational investment bank and financial services holding company.'
  ),
  createStock(
    'barclays_bank',
    'Barclays International',
    'BARC',
    'finance',
    8.56,
    'medium',
    'British multinational investment bank and financial services company.'
  ),
  createStock(
    'deutsche_bank',
    'Deutsche Bank',
    'DBAG',
    'finance',
    12.87,
    'medium',
    'German multinational investment bank and financial services company.'
  ),
  createStock(
    'credit_suisse',
    'Credit Suisse Group',
    'CSGP',
    'finance',
    3.45,
    'high',
    'Global investment bank and financial services firm providing wealth management services.'
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
  ),
  createStock(
    'gilead_sciences',
    'Gilead Sciences Inc',
    'GILD',
    'healthcare',
    76.45,
    'medium',
    'Biopharmaceutical company researching and developing antiviral drugs for treatments.'
  ),
  createStock(
    'bristol_myers',
    'Bristol Myers Squibb',
    'BMYQ',
    'healthcare',
    54.32,
    'medium',
    'Global biopharmaceutical company focusing on discovering, developing, and delivering medicines.'
  ),
  createStock(
    'eli_lilly',
    'Eli Lilly & Co',
    'LILY',
    'healthcare',
    435.67,
    'medium',
    'Pharmaceutical company developing and manufacturing prescription drugs and medications.'
  ),
  createStock(
    'novonordisk',
    'NovoNordisk AS',
    'NOVO',
    'healthcare',
    92.43,
    'medium',
    'Danish pharmaceutical company specializing in diabetes and other chronic diseases treatments.'
  ),
  createStock(
    'astrazeneca_pharma',
    'AstraZeneca Pharma',
    'AZPN',
    'healthcare',
    66.78,
    'medium',
    'British-Swedish pharmaceutical company developing prescription medications globally.'
  ),
  createStock(
    'sanofi_health',
    'Sanofi Health',
    'SNFH',
    'healthcare',
    52.34,
    'low',
    'French multinational pharmaceutical company specializing in prescription medications and vaccines.'
  ),
  createStock(
    'medtronic_devices',
    'Medtronic Medical Devices',
    'MDTD',
    'healthcare',
    87.45,
    'low',
    'Medical technology and services company developing devices and therapies for chronic diseases.'
  ),
  createStock(
    'boston_scientific',
    'Boston Scientific Corp',
    'BSCI',
    'healthcare',
    57.83,
    'medium',
    'Medical device manufacturer developing minimally invasive medical devices for various conditions.'
  ),
  createStock(
    'stryker_medical',
    'Stryker Medical',
    'STRK',
    'healthcare',
    290.76,
    'low',
    'Medical technologies corporation specializing in medical and surgical equipment.'
  ),
  createStock(
    'intuitive_surgical',
    'Intuitive Surgical Systems',
    'ISRG',
    'healthcare',
    378.92,
    'high',
    'Medical device company developing robotic-assisted surgical systems for minimally invasive surgery.'
  ),
  createStock(
    'edwards_lifesciences',
    'Edwards Lifesciences',
    'EDLS',
    'healthcare',
    87.32,
    'medium',
    'Medical equipment company specializing in artificial heart valves and hemodynamic monitoring.'
  ),
  createStock(
    'zimmer_biomet',
    'Zimmer Biomet Holdings',
    'ZBMT',
    'healthcare',
    119.67,
    'low',
    'Medical device company specializing in orthopedic reconstructive products.'
  ),
  createStock(
    'idexx_laboratories',
    'IDEXX Laboratories',
    'IDXX',
    'healthcare',
    523.45,
    'medium',
    'Developer of products and services for veterinary, food, and water testing applications.'
  ),
  createStock(
    'humana_health',
    'Humana Health',
    'HUMA',
    'healthcare',
    367.89,
    'low',
    'Health insurance company providing medical, dental, and vision insurance plans.'
  ),
  createStock(
    'cigna_health',
    'Cigna Health & Life',
    'CIGN',
    'healthcare',
    294.56,
    'low',
    'Global health services organization providing health insurance and related services.'
  ),
  createStock(
    'cardinal_health',
    'Cardinal Health',
    'CRDH',
    'healthcare',
    98.76,
    'low',
    'Healthcare services and products company providing pharmaceuticals and medical products.'
  ),
  createStock(
    'mckesson_corp',
    'McKesson Corporation',
    'MCKS',
    'healthcare',
    432.87,
    'low',
    'Distribution and technology company providing medical supplies and healthcare technology.'
  ),
  createStock(
    'amerisource_bergen',
    'AmerisourceBergen Corp',
    'AMBC',
    'healthcare',
    203.45,
    'low',
    'Drug wholesale company distributing pharmaceutical products to healthcare providers.'
  ),
  createStock(
    'cerner_health',
    'Cerner Health Technologies',
    'CERN',
    'healthcare',
    92.34,
    'medium',
    'Supplier of health information technology services, devices, and hardware.'
  ),
  createStock(
    'laboratory_corp',
    'Laboratory Corp of America',
    'LABX',
    'healthcare',
    220.87,
    'low',
    'Life sciences company providing clinical laboratory and drug development services.'
  ),
  createStock(
    'quest_diagnostics',
    'Quest Diagnostics Inc',
    'QDGX',
    'healthcare',
    137.65,
    'low',
    'Clinical laboratory services company providing diagnostic testing and information services.'
  ),
  createStock(
    'iqvia_holdings',
    'IQVIA Holdings',
    'IQVI',
    'healthcare',
    240.32,
    'medium',
    'Healthcare data science company providing advanced analytics, technology, and services.'
  ),
  createStock(
    'illumina_genomics',
    'Illumina Genomics',
    'ILMN',
    'healthcare',
    125.43,
    'high',
    'Biotechnology company developing integrated systems for genetic and genomic analysis.'
  ),
  createStock(
    'danaher_corporation',
    'Danaher Corporation',
    'DANH',
    'healthcare',
    254.67,
    'medium',
    'Global science and technology company with businesses in life sciences and diagnostics.'
  ),
  createStock(
    'thermo_fisher',
    'Thermo Fisher Scientific',
    'TMFS',
    'healthcare',
    567.89,
    'medium',
    'Scientific equipment and services company providing laboratory supplies and analytical instruments.'
  ),
  createStock(
    'agilent_technologies',
    'Agilent Technologies',
    'AGNT',
    'healthcare',
    134.56,
    'medium',
    'Research, development, and manufacturing company focused on life sciences and diagnostics.'
  ),
  createStock(
    'align_technology',
    'Align Technology',
    'ALGN',
    'healthcare',
    290.75,
    'high',
    'Medical device company specializing in clear dental aligners and digital scanning systems.'
  ),
  createStock(
    'biogen_idec',
    'Biogen Idec',
    'BIIB',
    'healthcare',
    218.43,
    'high',
    'Biotechnology company specializing in treatments for neurological diseases.'
  ),
  createStock(
    'hca_healthcare',
    'HCA Healthcare',
    'HCAH',
    'healthcare',
    257.85,
    'medium',
    'Healthcare facilities operator managing hospitals and related healthcare facilities.'
  ),
  createStock(
    'davita_healthcare',
    'DaVita Healthcare',
    'DVTA',
    'healthcare',
    98.76,
    'medium',
    'Kidney care provider specializing in dialysis services and related treatments.'
  ),
  createStock(
    'universal_health',
    'Universal Health Services',
    'UHSV',
    'healthcare',
    154.32,
    'medium',
    'Hospital management company operating acute care and behavioral health facilities.'
  ),
  createStock(
    'tenet_healthcare',
    'Tenet Healthcare Corp',
    'TENT',
    'healthcare',
    78.34,
    'high',
    'Multinational healthcare services company operating hospitals and related healthcare facilities.'
  ),
  createStock(
    'becton_dickinson',
    'Becton Dickinson & Co',
    'BDCO',
    'healthcare',
    237.65,
    'low',
    'Medical technology company manufacturing and selling medical devices and equipment.'
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
  ),
  createStock(
    'target_corp',
    'Target Corporation',
    'TRGT',
    'consumer',
    156.32,
    'medium',
    'General merchandise retailer operating department stores throughout North America.'
  ),
  createStock(
    'lowes_companies',
    'Lowes Companies',
    'LOWS',
    'consumer',
    228.76,
    'medium',
    'Home improvement retailer offering products for construction, maintenance, and remodeling.'
  ),
  createStock(
    'tj_max',
    'TJ Max Inc',
    'TJMX',
    'consumer',
    92.15,
    'medium',
    'Off-price department store chain offering apparel and home fashions at discount prices.'
  ),
  createStock(
    'best_buy',
    'Best Buy Electronics',
    'BSBY',
    'consumer',
    72.43,
    'medium',
    'Electronics retailer providing consumer electronics, home office products, and services.'
  ),
  createStock(
    'dollar_general',
    'Dollar General Corp',
    'DLGN',
    'consumer',
    145.67,
    'low',
    'Discount retailer offering products at low prices primarily in rural and suburban areas.'
  ),
  createStock(
    'dollar_tree',
    'Dollar Tree Stores',
    'DLTR',
    'consumer',
    124.32,
    'low',
    'Discount variety store chain offering products at fixed price points.'
  ),
  createStock(
    'kroger_groceries',
    'Kroger Groceries',
    'KRGR',
    'consumer',
    45.78,
    'low',
    'Supermarket and retail company operating grocery stores and multi-department stores.'
  ),
  createStock(
    'walgreens_boots',
    'Walgreens Boots Alliance',
    'WLBA',
    'consumer',
    32.46,
    'low',
    'Pharmacy store chain operating retail drugstores selling prescription and non-prescription drugs.'
  ),
  createStock(
    'cvs_health',
    'CVS Health Corp',
    'CVSH',
    'consumer',
    74.23,
    'low',
    'Healthcare company operating pharmacy stores and offering healthcare services.'
  ),
  createStock(
    'adidos_sportswear',
    'Adidos Sportswear',
    'ADDO',
    'consumer',
    178.34,
    'medium',
    'Athletic apparel, footwear, and accessories manufacturer with global distribution.'
  ),
  createStock(
    'under_armour',
    'Under Armour Inc',
    'UARM',
    'consumer',
    9.72,
    'high',
    'Athletic apparel, footwear, and accessories company targeting athletes and active lifestyles.'
  ),
  createStock(
    'lululemon_athletica',
    'Lululemon Athletica',
    'LULU',
    'consumer',
    352.87,
    'high',
    'Athletic apparel retailer specializing in yoga-inspired clothing and accessories.'
  ),
  createStock(
    'gap_clothing',
    'Gap Clothing Inc',
    'GAPC',
    'consumer',
    20.34,
    'medium',
    'Clothing and accessories retailer operating multiple brands and store concepts.'
  ),
  createStock(
    'ross_stores',
    'Ross Stores Inc',
    'ROST',
    'consumer',
    137.89,
    'medium',
    'Off-price retail apparel and home accessories chain operating discount stores.'
  ),
  createStock(
    'bed_bath_beyond',
    'Bed Bath & Beyond',
    'BBBY',
    'consumer',
    0.78,
    'extreme',
    'Domestic merchandise retail chain selling home goods, furniture, and decor.'
  ),
  createStock(
    'ikea_furnishings',
    'IKEA Furnishings',
    'IKEA',
    'consumer',
    145.32,
    'low',
    'Furniture retailer providing ready-to-assemble furniture, kitchenware, and home accessories.'
  ),
  createStock(
    'wayfair_home',
    'Wayfair Home Goods',
    'WAYR',
    'consumer',
    56.78,
    'high',
    'E-commerce company selling furniture and home goods through its online platform.'
  ),
  createStock(
    'etsy_marketplace',
    'Etsy Marketplace',
    'ETSY',
    'consumer',
    76.45,
    'high',
    'E-commerce website focused on handmade, vintage items, and craft supplies.'
  ),
  createStock(
    'chewy_pets',
    'Chewy Pet Supplies',
    'CHWY',
    'consumer',
    19.87,
    'high',
    'Online retailer of pet food, supplies, medications, and other pet-related products.'
  ),
  createStock(
    'estee_lauder',
    'Estee Lauder Companies',
    'ESTL',
    'consumer',
    143.56,
    'medium',
    'Manufacturer and marketer of skincare, makeup, fragrance, and hair care products.'
  ),
  createStock(
    'colgate_palmolive',
    'Colgate-Palmolive Co',
    'CLGT',
    'consumer',
    87.32,
    'low',
    'Consumer products company focused on oral care, personal care, and home care products.'
  ),
  createStock(
    'kimberly_clark',
    'Kimberly-Clark Corp',
    'KMBC',
    'consumer',
    132.45,
    'low',
    'Personal care corporation producing paper-based consumer products and medical supplies.'
  ),
  createStock(
    'hershey_chocolate',
    'Hershey Chocolate Co',
    'HSHY',
    'consumer',
    195.67,
    'low',
    'Food processing company and one of the largest chocolate manufacturers in the world.'
  ),
  createStock(
    'campbell_soup',
    'Campbell Soup Company',
    'CMPS',
    'consumer',
    45.32,
    'low',
    'Food processing company producing canned soups, snacks, and other prepared foods.'
  ),
  createStock(
    'general_mills',
    'General Mills Inc',
    'GENM',
    'consumer',
    67.34,
    'low',
    'Food company producing and marketing branded consumer foods worldwide.'
  ),
  createStock(
    'kraft_heinz',
    'Kraft Heinz Company',
    'KRHZ',
    'consumer',
    36.78,
    'low',
    'Food company with a portfolio of iconic food and beverage brands.'
  ),
  createStock(
    'kelloggs_company',
    'Kelloggs Company',
    'KELG',
    'consumer',
    76.54,
    'low',
    'Food manufacturing company producing cereal and convenience foods.'
  ),
  createStock(
    'conagra_brands',
    'Conagra Brands Inc',
    'CNGR',
    'consumer',
    29.87,
    'low',
    'Consumer packaged goods food company with a portfolio of branded food products.'
  ),
  createStock(
    'mondelez_international',
    'Mondelez International',
    'MDLZ',
    'consumer',
    72.34,
    'low',
    'Multinational confectionery, food, and beverage company manufacturing snacks.'
  ),
  createStock(
    'tyson_foods',
    'Tyson Foods Inc',
    'TYSN',
    'consumer',
    52.67,
    'medium',
    'Food processing company producing chicken, beef, and pork products.'
  ),
  createStock(
    'bjs_wholesale',
    'BJs Wholesale Club',
    'BJWC',
    'consumer',
    68.75,
    'medium',
    'Membership warehouse club chain providing bulk groceries and general merchandise.'
  ),
  createStock(
    'sysco_corporation',
    'Sysco Corporation',
    'SYSC',
    'consumer',
    78.43,
    'low',
    'Food distributor marketing and distributing food products to restaurants and institutions.'
  ),
  createStock(
    'yum_brands',
    'Yum! Brands Inc',
    'YUMB',
    'consumer',
    132.56,
    'medium',
    'Fast food corporation operating global restaurant chains including KFC, Pizza Hut, and Taco Bell.'
  ),
  createStock(
    'chipotle_mexican',
    'Chipotle Mexican Grill',
    'CHPT',
    'consumer',
    2321.43,
    'high',
    'Fast casual restaurant chain specializing in bowls, tacos, and burritos made to order.'
  ),
  createStock(
    'dominos_pizza',
    'Dominos Pizza Inc',
    'DMPZ',
    'consumer',
    456.78,
    'medium',
    'Pizza restaurant chain and international franchise with delivery and takeout operations.'
  ),
  createStock(
    'wendys_company',
    'Wendys Company',
    'WNDY',
    'consumer',
    19.54,
    'medium',
    'Fast food restaurant company operating quick-service hamburger restaurants.'
  ),
  createStock(
    'darden_restaurants',
    'Darden Restaurants Inc',
    'DRDN',
    'consumer',
    156.32,
    'medium',
    'Restaurant operator owning multiple full-service restaurant chains.'
  ),
  createStock(
    'marriott_international',
    'Marriott International',
    'MRRI',
    'consumer',
    245.67,
    'medium',
    'Hotel and resort chain operating and franchising hotels and lodging facilities.'
  ),
  createStock(
    'hilton_worldwide',
    'Hilton Worldwide Holdings',
    'HLTN',
    'consumer',
    187.45,
    'medium',
    'Hospitality company managing and franchising hotels and resorts.'
  ),
  createStock(
    'carnival_corporation',
    'Carnival Corporation',
    'CRNV',
    'consumer',
    15.87,
    'very_high',
    'Cruise line operator providing vacation experiences through various cruise brands.'
  ),
  createStock(
    'norwegian_cruise',
    'Norwegian Cruise Line',
    'NCLH',
    'consumer',
    17.54,
    'very_high',
    'Cruise line company operating vessels offering cruise vacations.'
  ),
  createStock(
    'royal_caribbean',
    'Royal Caribbean Cruises',
    'RCCL',
    'consumer',
    103.78,
    'high',
    'Global cruise vacation company operating ships and offering unique travel experiences.'
  ),
  createStock(
    'vf_corporation',
    'VF Corporation',
    'VFCR',
    'consumer',
    19.32,
    'medium',
    'Apparel and footwear company with a portfolio of lifestyle and workwear brands.'
  ),
  createStock(
    'hasbro_toys',
    'Hasbro Toys Inc',
    'HSBR',
    'consumer',
    56.78,
    'medium',
    'Toy and board game company with products ranging from toys to digital gaming.'
  ),
  createStock(
    'mattel_inc',
    'Mattel Inc',
    'MATL',
    'consumer',
    19.67,
    'medium',
    'Toy manufacturing company producing dolls, vehicles, puzzles, and games.'
  ),
  createStock(
    'sony_entertainment',
    'Sony Group Corporation',
    'SNYG',
    'consumer',
    87.45,
    'medium',
    'Multinational conglomerate with businesses in entertainment, electronics, and financial services.'
  ),
  createStock(
    'beyond_meat',
    'Beyond Meat Inc',
    'BYND',
    'consumer',
    7.65,
    'very_high',
    'Plant-based meat substitute producer developing alternatives to animal protein products.'
  ),
  createStock(
    'impossible_foods',
    'Impossible Foods Inc',
    'IMPF',
    'consumer',
    12.34,
    'very_high',
    'Food company developing plant-based substitutes for meat products.'
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
  ),
  createStock(
    'bp_global',
    'BP Global Energy',
    'BPGE',
    'energy',
    39.85,
    'medium',
    'International oil and gas company engaged in exploration, production, and refining.'
  ),
  createStock(
    'shell_petroleum',
    'Shell Petroleum',
    'SHEL',
    'energy',
    71.26,
    'medium',
    'Multinational oil and gas company with operations in over 70 countries.'
  ),
  createStock(
    'total_energies',
    'Total Energies SE',
    'TTSE',
    'energy',
    65.78,
    'medium',
    'Integrated energy company producing and marketing fuels, natural gas, and electricity.'
  ),
  createStock(
    'marathon_petroleum',
    'Marathon Petroleum Corp',
    'MPCR',
    'energy',
    156.78,
    'medium',
    'Petroleum refining, marketing, and transportation company.'
  ),
  createStock(
    'valero_energy',
    'Valero Energy Corp',
    'VLRO',
    'energy',
    132.56,
    'medium',
    'International manufacturer and marketer of transportation fuels and petrochemical products.'
  ),
  createStock(
    'phillips_66',
    'Phillips 66',
    'PSIX',
    'energy',
    145.67,
    'medium',
    'Diversified energy manufacturing and logistics company.'
  ),
  createStock(
    'occidental_petroleum',
    'Occidental Petroleum',
    'OXPT',
    'energy',
    62.45,
    'high',
    'Hydrocarbon exploration company with operations in the United States and Middle East.'
  ),
  createStock(
    'hess_corporation',
    'Hess Corporation',
    'HESS',
    'energy',
    147.53,
    'high',
    'Exploration and production company focused on offshore crude oil and natural gas.'
  ),
  createStock(
    'devon_energy',
    'Devon Energy Corp',
    'DVEN',
    'energy',
    46.78,
    'high',
    'Independent oil and natural gas exploration and production company.'
  ),
  createStock(
    'pioneer_natural',
    'Pioneer Natural Resources',
    'PION',
    'energy',
    236.95,
    'medium',
    'Independent oil and gas exploration and production company focused on the Permian Basin.'
  ),
  createStock(
    'dominion_energy',
    'Dominion Energy Inc',
    'DOME',
    'energy',
    48.23,
    'low',
    'Power and energy company providing electricity and natural gas.'
  ),
  createStock(
    'sempra_energy',
    'Sempra Energy',
    'SEMP',
    'energy',
    71.65,
    'low',
    'Energy infrastructure company with utilities and operations in North America.'
  ),
  createStock(
    'consolidated_edison',
    'Consolidated Edison',
    'COED',
    'energy',
    89.76,
    'low',
    'Energy delivery company providing electricity, gas, and steam services.'
  ),
  createStock(
    'exelon_corp',
    'Exelon Corporation',
    'EXLN',
    'energy',
    39.85,
    'low',
    'Utility services holding company providing energy distribution and generation.'
  ),
  createStock(
    'public_service_enterprise',
    'Public Service Enterprise',
    'PSEG',
    'energy',
    64.32,
    'low',
    'Energy company with operations in electric transmission and gas distribution.'
  ),
  createStock(
    'american_electric_power',
    'American Electric Power',
    'AMEP',
    'energy',
    82.56,
    'low',
    'Electric utility company providing generation, transmission, and distribution.'
  ),
  createStock(
    'xcel_energy',
    'Xcel Energy Inc',
    'XCEL',
    'energy',
    56.73,
    'low',
    'Utility holding company providing electricity and natural gas.'
  ),
  createStock(
    'halliburton_company',
    'Halliburton Company',
    'HALL',
    'energy',
    36.42,
    'high',
    'Oilfield services company providing products and services to the energy industry.'
  ),
  createStock(
    'schlumberger_oilfield',
    'Schlumberger Oilfield',
    'SLMB',
    'energy',
    52.67,
    'medium',
    'Oilfield services company providing technology and information solutions.'
  ),
  createStock(
    'baker_hughes',
    'Baker Hughes Company',
    'BHCO',
    'energy',
    32.54,
    'medium',
    'Industrial service company providing oilfield products, services, and digital solutions.'
  ),
  createStock(
    'enphase_energy',
    'Enphase Energy Inc',
    'ENPH',
    'energy',
    115.67,
    'very_high',
    'Energy technology company providing solar microinverters, battery systems, and software.'
  ),
  createStock(
    'sunrun_solar',
    'Sunrun Solar',
    'SUNR',
    'energy',
    13.56,
    'very_high',
    'Residential solar panels and home battery storage provider.'
  ),
  createStock(
    'sunpower_corp',
    'SunPower Corporation',
    'SPWR',
    'energy',
    4.65,
    'extreme',
    'Solar technology and energy services provider for residential and commercial customers.'
  ),
  createStock(
    'plug_power',
    'Plug Power Inc',
    'PLUG',
    'energy',
    3.98,
    'extreme',
    'Provider of hydrogen fuel cell turnkey solutions for the electric mobility market.'
  ),
  createStock(
    'bloom_energy',
    'Bloom Energy Corp',
    'BLOM',
    'energy',
    10.45,
    'very_high',
    'Manufacturer of solid oxide fuel cells used for on-site power generation.'
  ),
  createStock(
    'fuelcell_energy',
    'FuelCell Energy Inc',
    'FCEL',
    'energy',
    1.24,
    'extreme',
    'Fuel cell power plant manufacturer providing clean energy solutions.'
  ),
  createStock(
    'nextera_energy_partners',
    'NextEra Energy Partners',
    'NEEP',
    'energy',
    32.45,
    'high',
    'Renewable energy company acquiring, managing, and owning clean energy projects.'
  ),
  createStock(
    'clearway_energy',
    'Clearway Energy Inc',
    'CLWY',
    'energy',
    24.67,
    'medium',
    'Renewable energy company operating wind, solar, and natural gas facilities.'
  ),
  createStock(
    'brookfield_renewable',
    'Brookfield Renewable',
    'BREN',
    'energy',
    28.76,
    'medium',
    'Renewable power platform operating hydroelectric, wind, solar, and storage facilities.'
  ),
  createStock(
    'orsted_renewable',
    'Orsted Renewable Energy',
    'ORST',
    'energy',
    47.32,
    'high',
    'Renewable energy company specializing in offshore wind power development.'
  ),
  createStock(
    'vestas_wind',
    'Vestas Wind Systems',
    'VSTS',
    'energy',
    21.43,
    'high',
    'Wind turbine manufacturer, installer, and servicer for wind power plants.'
  ),
  createStock(
    'cheniere_energy',
    'Cheniere Energy Inc',
    'CHEN',
    'energy',
    176.89,
    'medium',
    'Energy company primarily engaged in liquefied natural gas-related businesses.'
  ),
  createStock(
    'williams_companies',
    'Williams Companies Inc',
    'WLLM',
    'energy',
    34.56,
    'low',
    'Energy infrastructure company focused on natural gas processing and transportation.'
  ),
  createStock(
    'kinder_morgan',
    'Kinder Morgan Inc',
    'KMGI',
    'energy',
    17.65,
    'low',
    'Energy infrastructure company operating pipelines and terminals.'
  ),
  createStock(
    'oneok_inc',
    'ONEOK Inc',
    'ONEK',
    'energy',
    76.43,
    'low',
    'Natural gas company operating gathering, processing, storage, and transportation assets.'
  ),
  createStock(
    'tc_energy',
    'TC Energy Corporation',
    'TCEN',
    'energy',
    39.45,
    'low',
    'Energy infrastructure company with operations in natural gas, oil, and power generation.'
  ),
  createStock(
    'eog_resources',
    'EOG Resources Inc',
    'EOGR',
    'energy',
    121.34,
    'medium',
    'Oil and natural gas exploration and production company focusing on unconventional resources.'
  ),
  createStock(
    'conocophillips',
    'ConocoPhillips',
    'COP',
    'energy',
    116.32,
    'medium',
    'Oil and gas exploration and production company with operations worldwide.'
  ),
  createStock(
    'diamondback_energy',
    'Diamondback Energy',
    'FANG',
    'energy',
    156.78,
    'high',
    'Independent oil and natural gas company focused on the Permian Basin.'
  ),
  createStock(
    'marathon_oil',
    'Marathon Oil Corporation',
    'MOCO',
    'energy',
    25.43,
    'high',
    'Independent exploration and production company focused on high-return U.S. resources.'
  ),
  createStock(
    'coterra_energy',
    'Coterra Energy Inc',
    'CTRA',
    'energy',
    27.65,
    'medium',
    'Independent oil and gas company engaged in exploration, development, and production.'
  ),
  createStock(
    'antero_resources',
    'Antero Resources Corp',
    'ANTR',
    'energy',
    23.45,
    'high',
    'Independent oil and natural gas company engaged in acquisition and development of properties.'
  ),
  createStock(
    'canadian_natural',
    'Canadian Natural Resources',
    'CNRL',
    'energy',
    65.34,
    'medium',
    'Oil and natural gas exploration, development, and production company.'
  ),
  createStock(
    'suncor_energy',
    'Suncor Energy Inc',
    'SUNE',
    'energy',
    35.67,
    'medium',
    'Integrated energy company developing petroleum resource basins.'
  ),
  createStock(
    'imperial_oil',
    'Imperial Oil Limited',
    'IMPL',
    'energy',
    67.54,
    'medium',
    'Integrated oil company engaged in exploration, production, and refining of crude oil.'
  ),
  createStock(
    'enbridge_inc',
    'Enbridge Inc',
    'ENBR',
    'energy',
    35.78,
    'low',
    'Pipeline and energy transportation company operating crude oil and liquids pipelines.'
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
  ),
  createStock(
    'northrop_grumman',
    'Northrop Grumman Corp',
    'NORP',
    'industrial',
    467.32,
    'medium',
    'Aerospace and defense technology company providing systems and solutions.'
  ),
  createStock(
    'general_dynamics',
    'General Dynamics Corp',
    'GEDY',
    'industrial',
    276.54,
    'medium',
    'Global aerospace and defense company with business aviation and combat systems.'
  ),
  createStock(
    'l3harris_technologies',
    'L3Harris Technologies',
    'LHRT',
    'industrial',
    210.45,
    'medium',
    'Technology company and defense contractor specializing in surveillance solutions.'
  ),
  createStock(
    'textron_industries',
    'Textron Industries',
    'TEXT',
    'industrial',
    87.43,
    'medium',
    'Multi-industry company with operations in aircraft, defense, and industrial products.'
  ),
  createStock(
    'emerson_electric',
    'Emerson Electric Co',
    'EMRS',
    'industrial',
    98.45,
    'low',
    'Manufacturing company providing products and services for industrial and commercial markets.'
  ),
  createStock(
    'eaton_corporation',
    'Eaton Corporation',
    'EATN',
    'industrial',
    235.67,
    'low',
    'Power management company providing energy-efficient solutions.'
  ),
  createStock(
    'illinois_tool_works',
    'Illinois Tool Works',
    'ILTW',
    'industrial',
    254.32,
    'low',
    'Manufacturer of industrial products and equipment for various industries.'
  ),
  createStock(
    'parker_hannifin',
    'Parker Hannifin Corp',
    'PKHN',
    'industrial',
    452.67,
    'low',
    'Motion and control technologies company providing precision engineered solutions.'
  ),
  createStock(
    'rockwell_automation',
    'Rockwell Automation',
    'RKWA',
    'industrial',
    278.43,
    'medium',
    'Industrial automation and information company providing solutions worldwide.'
  ),
  createStock(
    'johnson_controls',
    'Johnson Controls Intl',
    'JCIN',
    'industrial',
    63.45,
    'low',
    'Technology company providing building systems and solutions for efficiency and sustainability.'
  ),
  createStock(
    'carrier_global',
    'Carrier Global Corp',
    'CAGC',
    'industrial',
    57.34,
    'low',
    'Building and refrigeration solutions company providing HVAC and cold chain products.'
  ),
  createStock(
    'trane_technologies',
    'Trane Technologies',
    'TNRT',
    'industrial',
    278.56,
    'low',
    'Climate innovation company providing sustainable solutions for buildings and transportation.'
  ),
  createStock(
    'otis_worldwide',
    'Otis Worldwide Corp',
    'OTIS',
    'industrial',
    89.67,
    'low',
    'Elevator and escalator manufacturing, installation, and service company.'
  ),
  createStock(
    'roper_technologies',
    'Roper Technologies Inc',
    'ROPT',
    'industrial',
    528.90,
    'medium',
    'Software and engineered products company serving global niche markets.'
  ),
  createStock(
    'fortive_corporation',
    'Fortive Corporation',
    'FORT',
    'industrial',
    78.34,
    'medium',
    'Industrial technology company providing critical technical equipment and solutions.'
  ),
  createStock(
    'waste_management',
    'Waste Management Inc',
    'WSTM',
    'industrial',
    195.67,
    'low',
    'Provider of comprehensive waste management environmental services in North America.'
  ),
  createStock(
    'republic_services',
    'Republic Services Inc',
    'RPSV',
    'industrial',
    178.54,
    'low',
    'Environmental services company providing waste collection and recycling services.'
  ),
  createStock(
    'paccar_inc',
    'PACCAR Inc',
    'PACR',
    'industrial',
    100.32,
    'medium',
    'Designer and manufacturer of premium trucks, parts and related services.'
  ),
  createStock(
    'cummins_engines',
    'Cummins Engines Inc',
    'CUMN',
    'industrial',
    267.54,
    'medium',
    'Engine and power system design, manufacturing, distribution, and servicing company.'
  ),
  createStock(
    'deere_company',
    'Deere & Company',
    'DEER',
    'industrial',
    375.89,
    'medium',
    'Agricultural machinery manufacturing company providing equipment and services.'
  ),
  createStock(
    'stanley_black_decker',
    'Stanley Black & Decker',
    'SBDK',
    'industrial',
    92.34,
    'medium',
    'Manufacturer of industrial tools, household hardware, and security products.'
  ),
  createStock(
    'dover_corporation',
    'Dover Corporation',
    'DOVR',
    'industrial',
    145.67,
    'low',
    'Diversified global manufacturer with businesses in pumps, process solutions, and refrigeration.'
  ),
  createStock(
    'wabtec_corporation',
    'Wabtec Corporation',
    'WABT',
    'industrial',
    123.45,
    'medium',
    'Provider of equipment, systems, and services for the rail and transit industries.'
  ),
  createStock(
    'expeditors_intl',
    'Expeditors International',
    'EXPD',
    'industrial',
    123.67,
    'low',
    'Global logistics company providing customs brokerage and freight forwarding services.'
  ),
  createStock(
    'c_h_robinson',
    'C.H. Robinson Worldwide',
    'CHRW',
    'industrial',
    73.45,
    'medium',
    'Third-party logistics provider delivering multimodal transportation and logistics services.'
  ),
  createStock(
    'jb_hunt_transport',
    'J.B. Hunt Transport',
    'JBHT',
    'industrial',
    195.67,
    'medium',
    'Transportation and logistics company providing intermodal, dedicated, and other services.'
  ),
  createStock(
    'union_pacific',
    'Union Pacific Corp',
    'UNPC',
    'industrial',
    234.56,
    'low',
    'Rail transportation company operating North American premier railroad franchise.'
  ),
  createStock(
    'norfolk_southern',
    'Norfolk Southern Corp',
    'NFSC',
    'industrial',
    245.78,
    'low',
    'Rail transportation company providing services across the Eastern United States.'
  ),
  createStock(
    'csx_corporation',
    'CSX Corporation',
    'CSXC',
    'industrial',
    34.56,
    'low',
    'Rail-based freight transportation company providing rail, intermodal, and rail-to-truck services.'
  ),
  createStock(
    'delta_airlines',
    'Delta Airlines Inc',
    'DELT',
    'industrial',
    45.67,
    'high',
    'Airline company providing passenger and cargo transportation services.'
  ),
  createStock(
    'united_airlines',
    'United Airlines Holdings',
    'UAHL',
    'industrial',
    49.87,
    'high',
    'Airline holding company operating transportation services domestically and internationally.'
  ),
  createStock(
    'american_airlines',
    'American Airlines Group',
    'AMAG',
    'industrial',
    13.45,
    'very_high',
    'Airline company providing passenger and cargo transportation services worldwide.'
  ),
  createStock(
    'southwest_airlines',
    'Southwest Airlines Co',
    'SWAC',
    'industrial',
    28.76,
    'high',
    'Airline company providing passenger transportation services primarily in the United States.'
  ),
  createStock(
    'avis_budget_group',
    'Avis Budget Group',
    'AVIS',
    'industrial',
    187.54,
    'high',
    'Vehicle rental company providing car and truck rentals and car sharing services.'
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
  ),
  createStock(
    'realty_income',
    'Realty Income Corp',
    'RLTY',
    'real_estate',
    56.78,
    'low',
    'Real estate investment trust investing in freestanding commercial properties.'
  ),
  createStock(
    'digital_realty',
    'Digital Realty Trust',
    'DGRL',
    'real_estate',
    135.42,
    'medium',
    'Real estate investment trust supporting data center, colocation, and interconnection strategies.'
  ),
  createStock(
    'welltower_health',
    'Welltower Health Properties',
    'WELL',
    'real_estate',
    92.34,
    'low',
    'Real estate investment trust focused on healthcare infrastructure including senior housing.'
  ),
  createStock(
    'equity_residential',
    'Equity Residential',
    'EQRS',
    'real_estate',
    63.45,
    'low',
    'Real estate investment trust investing in apartments in urban and high-density suburban markets.'
  ),
  createStock(
    'avalonbay_communities',
    'AvalonBay Communities',
    'AVBC',
    'real_estate',
    182.56,
    'low',
    'Real estate investment trust focusing on developing apartment communities in metropolitan areas.'
  ),
  createStock(
    'boston_properties',
    'Boston Properties Inc',
    'BOSP',
    'real_estate',
    62.87,
    'medium',
    'Real estate investment trust developing and managing office properties in major markets.'
  ),
  createStock(
    'vornado_realty',
    'Vornado Realty Trust',
    'VRNT',
    'real_estate',
    28.12,
    'medium',
    'Real estate investment trust focused on office and retail properties in New York City.'
  ),
  createStock(
    'host_hotels',
    'Host Hotels & Resorts',
    'HSTR',
    'real_estate',
    19.43,
    'medium',
    'Lodging real estate investment trust with luxury and upscale hotels.'
  ),
  createStock(
    'park_hotels',
    'Park Hotels & Resorts',
    'PKHR',
    'real_estate',
    15.67,
    'high',
    'Real estate investment trust with a portfolio of hotels and resorts.'
  ),
  createStock(
    'kimco_realty',
    'Kimco Realty Corp',
    'KMCO',
    'real_estate',
    19.87,
    'medium',
    'Real estate investment trust owning and operating open-air shopping centers.'
  ),
  createStock(
    'federal_realty',
    'Federal Realty Investment',
    'FRLT',
    'real_estate',
    102.45,
    'low',
    'Real estate investment trust specializing in the ownership and management of retail properties.'
  ),
  createStock(
    'regency_centers',
    'Regency Centers Corp',
    'RGCY',
    'real_estate',
    62.34,
    'low',
    'Real estate investment trust owning, operating, and developing shopping centers.'
  ),
  createStock(
    'extra_space_storage',
    'Extra Space Storage',
    'EXSS',
    'real_estate',
    143.56,
    'low',
    'Real estate investment trust focused on self-storage properties.'
  ),
  createStock(
    'iron_mountain',
    'Iron Mountain Inc',
    'IRON',
    'real_estate',
    67.34,
    'medium',
    'Storage and information management company structured as a real estate investment trust.'
  ),
  createStock(
    'ventas_healthcare',
    'Ventas Healthcare Properties',
    'VTAS',
    'real_estate',
    46.78,
    'low',
    'Real estate investment trust with a portfolio focused on healthcare facilities.'
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
  ),
  createStock(
    'disney_entertainment',
    'Walt Disney Co',
    'DISN',
    'communication',
    98.76,
    'medium',
    'Entertainment company engaged in film, media networks, parks, and streaming services.'
  ),
  createStock(
    'netflix_streaming',
    'Netflix Inc',
    'NFLX',
    'communication',
    423.87,
    'high',
    'Streaming entertainment service offering movies, TV shows, and original content.'
  ),
  createStock(
    'warner_bros_discovery',
    'Warner Bros Discovery',
    'WBDV',
    'communication',
    10.43,
    'high',
    'Media company creating and distributing entertainment content across multiple platforms.'
  ),
  createStock(
    'paramount_global',
    'Paramount Global',
    'PARA',
    'communication',
    12.54,
    'high',
    'Media company producing and distributing entertainment content through various channels.'
  ),
  createStock(
    'fox_corporation',
    'Fox Corporation',
    'FOXC',
    'communication',
    31.25,
    'medium',
    'Media company focused on news, sports, and entertainment programming.'
  ),
  createStock(
    'dish_network',
    'Dish Network Corp',
    'DISH',
    'communication',
    5.78,
    'high',
    'Satellite television provider and wireless service carrier.'
  ),
  createStock(
    'lumen_technologies',
    'Lumen Technologies Inc',
    'LUMN',
    'communication',
    1.54,
    'very_high',
    'Technology and communications company providing platform services and fiber infrastructure.'
  ),
  createStock(
    'liberty_media',
    'Liberty Media Corp',
    'LMCA',
    'communication',
    67.89,
    'medium',
    'Media, communications, and entertainment company owning interests in various businesses.'
  ),
  createStock(
    'take_two_interactive',
    'Take-Two Interactive',
    'TTWO',
    'communication',
    148.32,
    'high',
    'Video game holding company developing and publishing interactive entertainment.'
  ),
  createStock(
    'electronic_arts',
    'Electronic Arts Inc',
    'EAIN',
    'communication',
    134.56,
    'medium',
    'Video game company developing, publishing, and distributing games and services.'
  ),
  createStock(
    'activision_blizzard',
    'Activision Blizzard Inc',
    'ATVI',
    'communication',
    94.32,
    'low',
    'Video game developer and publisher with popular franchises worldwide.'
  ),
  createStock(
    'new_york_times',
    'New York Times Co',
    'NYTC',
    'communication',
    43.21,
    'medium',
    'News and media company publishing newspapers and operating digital platforms.'
  ),
  createStock(
    'news_corp',
    'News Corporation',
    'NWSC',
    'communication',
    21.65,
    'medium',
    'Global media and information services company operating in various sectors.'
  ),
  createStock(
    'interpublic_group',
    'Interpublic Group',
    'IPGC',
    'communication',
    32.45,
    'medium',
    'Advertising and marketing services company operating globally.'
  ),
  createStock(
    'omnicom_group',
    'Omnicom Group Inc',
    'OMCG',
    'communication',
    87.65,
    'medium',
    'Marketing communications company providing advertising, media, and public relations services.'
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
  ),
  createStock(
    'ecolab_inc',
    'Ecolab Inc',
    'ECOL',
    'materials',
    192.67,
    'low',
    'Provider of water, hygiene, and infection prevention solutions and services.'
  ),
  createStock(
    'international_paper',
    'International Paper Co',
    'IPCO',
    'materials',
    35.87,
    'medium',
    'Global producer of renewable fiber-based packaging, pulp and paper products.'
  ),
  createStock(
    'ball_corporation',
    'Ball Corporation',
    'BALL',
    'materials',
    56.78,
    'medium',
    'Supplier of metal packaging for beverages, foods, and household products.'
  ),
  createStock(
    'packaging_corp_america',
    'Packaging Corp of America',
    'PKGA',
    'materials',
    168.43,
    'low',
    'Producer of containerboard and corrugated packaging products.'
  ),
  createStock(
    'westrock_company',
    'WestRock Company',
    'WRCK',
    'materials',
    45.67,
    'medium',
    'Provider of paper and packaging solutions for consumer and corrugated packaging markets.'
  ),
  createStock(
    'avery_dennison',
    'Avery Dennison Corp',
    'AVDN',
    'materials',
    178.95,
    'low',
    'Global materials science company specializing in the design and manufacture of labeling materials.'
  ),
  createStock(
    'vulcan_materials',
    'Vulcan Materials Company',
    'VLCN',
    'materials',
    234.56,
    'low',
    'Producer of construction aggregates and aggregates-based construction materials.'
  ),
  createStock(
    'martin_marietta',
    'Martin Marietta Materials',
    'MRMR',
    'materials',
    434.56,
    'low',
    'American-based company and a leading supplier of building materials including aggregates.'
  ),
  createStock(
    'nucor_corporation',
    'Nucor Corporation',
    'NUCR',
    'materials',
    167.89,
    'medium',
    'Steel production company manufacturing steel and related products.'
  ),
  createStock(
    'steel_dynamics',
    'Steel Dynamics Inc',
    'STLD',
    'materials',
    123.45,
    'high',
    'Steel producer and metal recycler with fabrication operations.'
  ),
  createStock(
    'reliance_steel',
    'Reliance Steel & Aluminum',
    'RLST',
    'materials',
    267.54,
    'medium',
    'Metals service center company processing and distributing metals.'
  ),
  createStock(
    'cf_industries',
    'CF Industries Holdings',
    'CFIH',
    'materials',
    78.32,
    'high',
    'Manufacturer and distributor of agricultural fertilizers including nitrogen products.'
  ),
  createStock(
    'mosaic_company',
    'Mosaic Company',
    'MOSC',
    'materials',
    34.56,
    'high',
    'Producer and marketer of concentrated phosphate and potash crop nutrients.'
  ),
  createStock(
    'corteva_agriscience',
    'Corteva Agriscience',
    'CTVA',
    'materials',
    56.78,
    'medium',
    'Agricultural chemical and seed company providing products and services to farmers.'
  ),
  createStock(
    'celanese_corporation',
    'Celanese Corporation',
    'CLNS',
    'materials',
    145.32,
    'medium',
    'Technology and specialty materials company producing engineered materials and specialty food ingredients.'
  ),
  createStock(
    'eastman_chemical',
    'Eastman Chemical Company',
    'EMCC',
    'materials',
    87.65,
    'medium',
    'Global specialty materials company producing a broad range of advanced materials and specialty additives.'
  ),
  createStock(
    'lyondellbasell_industries',
    'LyondellBasell Industries',
    'LYBI',
    'materials',
    96.45,
    'medium',
    'Plastics, chemicals, and refining company producing materials and products for various industries.'
  ),
  createStock(
    'ppg_industries',
    'PPG Industries Inc',
    'PPGI',
    'materials',
    134.56,
    'low',
    'Global supplier of paints, coatings, and specialty materials for industries and consumers.'
  ),
  createStock(
    'albemarle_corporation',
    'Albemarle Corporation',
    'ALBE',
    'materials',
    123.43,
    'high',
    'Developer, manufacturer, and marketer of specialty chemicals primarily for lithium batteries.'
  ),
  createStock(
    'alcoa_corporation',
    'Alcoa Corporation',
    'ALCO',
    'materials',
    32.45,
    'high',
    'Producer of aluminum, with operations in bauxite, alumina, and aluminum manufacturing.'
  ),
  createStock(
    'southern_copper',
    'Southern Copper Corp',
    'SCOP',
    'materials',
    76.54,
    'high',
    'Copper producer with mining operations in Peru and Mexico.'
  ),
  createStock(
    'barrick_gold',
    'Barrick Gold Corporation',
    'BARG',
    'materials',
    17.43,
    'high',
    'Gold and copper mining company with operating mines and projects in various countries.'
  ),
  createStock(
    'franco_nevada',
    'Franco-Nevada Corp',
    'FRNV',
    'materials',
    134.56,
    'medium',
    'Gold-focused royalty and streaming company with a diversified portfolio of assets.'
  ),
  createStock(
    'royal_gold',
    'Royal Gold Inc',
    'RGLD',
    'materials',
    112.34,
    'medium',
    'Precious metals stream and royalty company engaged in acquisition and management of metals interests.'
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
  ),
  createStock(
    'duke_energy',
    'Duke Energy Corp',
    'DUKE',
    'utilities',
    98.34,
    'low',
    'Electric and natural gas holding company providing utility services.'
  ),
  createStock(
    'sempra_energy',
    'Sempra Energy',
    'SEMP',
    'utilities',
    73.54,
    'low',
    'Energy infrastructure company focusing on utilities and the energy industry.'
  ),
  createStock(
    'public_service_enterprise',
    'Public Service Enterprise Group',
    'PSEG',
    'utilities',
    65.78,
    'low',
    'Energy company with operations in electric and gas utility services.'
  ),
  createStock(
    'consolidated_edison',
    'Consolidated Edison Inc',
    'COED',
    'utilities',
    91.23,
    'low',
    'Energy services company providing electric, gas, and steam services.'
  ),
  createStock(
    'xcel_energy',
    'Xcel Energy Inc',
    'XCEL',
    'utilities',
    59.87,
    'low',
    'Utility holding company providing electricity and natural gas services.'
  ),
  createStock(
    'wec_energy',
    'WEC Energy Group',
    'WECG',
    'utilities',
    82.45,
    'low',
    'Electric and natural gas delivery company serving Midwest customers.'
  ),
  createStock(
    'eversource_energy',
    'Eversource Energy',
    'EVRS',
    'utilities',
    61.23,
    'low',
    'Energy delivery company serving customers in New England.'
  ),
  createStock(
    'dteenergy',
    'DTE Energy Company',
    'DTEE',
    'utilities',
    112.34,
    'low',
    'Energy company providing electricity and natural gas services in Michigan.'
  ),
  createStock(
    'firstenergy_corp',
    'FirstEnergy Corp',
    'FSTE',
    'utilities',
    37.89,
    'low',
    'Electric utility company serving customers in the Midwest and Mid-Atlantic regions.'
  ),
  createStock(
    'ameren_corp',
    'Ameren Corporation',
    'AMRN',
    'utilities',
    74.32,
    'low',
    'Power and energy company providing electric and natural gas services.'
  ),
  createStock(
    'cms_energy',
    'CMS Energy Corp',
    'CMSE',
    'utilities',
    58.76,
    'low',
    'Energy company providing electricity and natural gas to Michigan customers.'
  ),
  createStock(
    'entergy_corp',
    'Entergy Corporation',
    'ENTG',
    'utilities',
    103.45,
    'low',
    'Electric power producer and retail energy services company.'
  ),
  createStock(
    'edison_international',
    'Edison International',
    'EDIW',
    'utilities',
    67.89,
    'low',
    'Electric utility holding company providing services in California.'
  ),
  createStock(
    'centerpoint_energy',
    'CenterPoint Energy Inc',
    'CNPT',
    'utilities',
    28.76,
    'low',
    'Electric and natural gas utility serving several states in the US.'
  ),
  createStock(
    'pgecorp',
    'PG&E Corporation',
    'PGEC',
    'utilities',
    17.65,
    'medium',
    'Utility company providing natural gas and electric service in California.'
  ),
  createStock(
    'nisource_inc',
    'NiSource Inc',
    'NISR',
    'utilities',
    26.54,
    'low',
    'Utility company providing natural gas and electricity to customers in several states.'
  ),
  createStock(
    'aes_corp',
    'The AES Corporation',
    'AESC',
    'utilities',
    18.34,
    'medium',
    'Global power company generating and distributing electricity in multiple countries.'
  ),
  createStock(
    'alliant_energy',
    'Alliant Energy Corp',
    'ALLC',
    'utilities',
    51.23,
    'low',
    'Public utility holding company providing regulated electricity and natural gas service.'
  ),
  createStock(
    'pinnacle_west_capital',
    'Pinnacle West Capital',
    'PNCW',
    'utilities',
    72.34,
    'low',
    'Utility holding company providing electricity services in Arizona.'
  ),
  createStock(
    'american_water_works',
    'American Water Works',
    'AMWW',
    'utilities',
    130.45,
    'low',
    'Water and wastewater utility company serving residential and commercial customers.'
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