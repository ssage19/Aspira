import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { formatCurrency, getRandomElement } from '../utils';
import { registerStore } from '../utils/storeRegistry';
import { useCharacter } from './useCharacter';
import { useTime } from './useTime';
import { usePrestige } from './usePrestige';
import { useBusiness } from './useBusiness';

// Types of social connections
export type ConnectionType = 
  'mentor' | 
  'rival' | 
  'businessContact' | 
  'investor' | 
  'industry' | 
  'celebrity' | 
  'influencer';

// Areas of expertise or industry
export type ExpertiseArea = 
  'finance' | 
  'technology' | 
  'realestate' | 
  'retail' | 
  'creative' | 
  'healthcare' | 
  'manufacturing' | 
  'hospitality' | 
  'education' | 
  'consulting';

// Social connection status
export type ConnectionStatus = 
  'acquaintance' | 
  'contact' | 
  'associate' | 
  'friend' | 
  'close';

// Benefit types that connections can provide
export type ConnectionBenefitType = 
  'investmentTip' | 
  'businessOpportunity' | 
  'skillBoost' | 
  'lifestyleDiscount' | 
  'regulationInsight' | 
  'marketIntelligence' | 
  'networkIntroduction' | 
  'reputationBoost';

// A benefit provided by a connection
export interface ConnectionBenefit {
  id: string;
  type: ConnectionBenefitType;
  description: string;
  value: number; // Financial value or percentage boost
  used: boolean;
  expiresAt?: number; // Timestamp when this expires
}

// Social connection interface
export interface SocialConnection {
  id: string;
  name: string;
  type: ConnectionType;
  status: ConnectionStatus;
  expertise: ExpertiseArea;
  relationshipLevel: number; // 1-100
  lastInteractionDate: number; // Timestamp
  pendingMeeting: boolean;
  benefits: ConnectionBenefit[];
  image?: string; // Path to avatar image
  biography: string;
  rivalryScore?: number; // For rivals: 1-100, how intense the rivalry is
  mentorshipLevel?: number; // For mentors: 1-100, how good they are
  influenceLevel?: number; // For influencers/celebrities: 1-100, their reach
  businessSuccessLevel?: number; // For business contacts: 1-100, how successful they are
}

// Social event interface
export type EventType = 
  'charity' | 
  'business' | 
  'gala' | 
  'conference' | 
  'club' | 
  'party' | 
  'networking' | 
  'workshop' | 
  'seminar' | 
  'award' | 
  'product_launch' | 
  'trade_show' | 
  'retreat' | 
  'vip_dinner' | 
  'sporting_event';

export interface SocialEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  date: number; // When the event will occur
  attendees: string[]; // IDs of connections who will attend
  prestigeRequired: number; // Minimum prestige level to attend
  entryFee: number; // Cost to attend
  location: string;
  benefits: {
    networkingPotential: number; // 1-100
    reputationGain: number; // 1-100
    potentialConnections: number; // How many new connections can be made
    skillBoost?: string; // Which skill it might boost
    skillBoostAmount?: number; // Amount of boost
  };
  attended: boolean;
  reserved: boolean; // Whether player has reserved to attend this event
  availableUntil: number; // When the event expires if not attended
}

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// Pre-defined connection templates for different types - 10 per category
const connectionTemplates: Record<ConnectionType, Partial<SocialConnection>[]> = {
  mentor: [
    {
      name: "Dr. Elizabeth Warren",
      expertise: "finance",
      biography: "Former economics professor with decades of experience in wealth management. Known for her conservative but effective investment strategies.",
      mentorshipLevel: 85
    },
    {
      name: "Michael Chen",
      expertise: "technology",
      biography: "Serial tech entrepreneur who sold his startup for $200M. Now mentors promising tech innovators and makes strategic investments.",
      mentorshipLevel: 90
    },
    {
      name: "Robert Kiyosaki",
      expertise: "realestate",
      biography: "Real estate mogul with a portfolio spanning commercial and residential properties across the country. Author of several books on wealth creation.",
      mentorshipLevel: 80
    },
    {
      name: "Sarah Johnson",
      expertise: "retail",
      biography: "Built a retail empire from a single boutique store. Expert in scaling businesses and creating customer-centric experiences.",
      mentorshipLevel: 75
    },
    {
      name: "David Washington",
      expertise: "consulting",
      biography: "Former management consultant who now advises Fortune 500 CEOs. His network spans every major industry.",
      mentorshipLevel: 95
    },
    {
      name: "Dr. Maria Rodriguez",
      expertise: "healthcare",
      biography: "Healthcare entrepreneur who built a network of specialized clinics. Expert in navigating complex regulatory environments while maintaining profitability.",
      mentorshipLevel: 88
    },
    {
      name: "James Wilson",
      expertise: "manufacturing",
      biography: "Former manufacturing executive who transformed traditional factories with innovative automation. Now helps others modernize their operations.",
      mentorshipLevel: 82
    },
    {
      name: "Sophia Patel",
      expertise: "education",
      biography: "Founded and scaled an education technology company valued at $500M. Passionate about helping entrepreneurs in knowledge-based industries.",
      mentorshipLevel: 78
    },
    {
      name: "Jonathan Blake",
      expertise: "hospitality",
      biography: "Renowned hospitality expert who has launched successful luxury hotels worldwide. Teaches the art of exceptional customer service.",
      mentorshipLevel: 87
    },
    {
      name: "Dr. Thomas Lee",
      expertise: "creative",
      biography: "Former creative director turned business strategist. Specializes in helping artists and creators transform their talents into sustainable businesses.",
      mentorshipLevel: 80
    }
  ],
  rival: [
    {
      name: "Alexander Pierce",
      expertise: "finance",
      biography: "Aggressive hedge fund manager known for hostile takeovers. Your success has caught his attention, not in a good way.",
      rivalryScore: 70
    },
    {
      name: "Victoria Stone",
      expertise: "realestate",
      biography: "Real estate developer who always seems to bid on the same properties as you. Ruthless in business but maintains a charming public persona.",
      rivalryScore: 65
    },
    {
      name: "Ethan Carter",
      expertise: "technology",
      biography: "Tech entrepreneur who views business as a zero-sum game. Has been known to poach talent and copy innovative ideas.",
      rivalryScore: 75
    },
    {
      name: "Natalie Zhao",
      expertise: "retail",
      biography: "Owns a competing business empire. Will undercut prices to drive competitors out, then raise them once she dominates a market.",
      rivalryScore: 80
    },
    {
      name: "James Richardson",
      expertise: "consulting",
      biography: "Consultant who specializes in identifying weak businesses for acquisition. Has you on his radar as a potential target or competitor.",
      rivalryScore: 60
    },
    {
      name: "Maxwell Grant",
      expertise: "hospitality",
      biography: "Owner of a competing hospitality chain who enjoys poaching your best staff with aggressive salary offers and signing bonuses.",
      rivalryScore: 68
    },
    {
      name: "Olivia Blackwell",
      expertise: "creative",
      biography: "Media mogul who uses her influence to promote competitors while subtly undermining your business in industry publications.",
      rivalryScore: 72
    },
    {
      name: "Raymond Zhang",
      expertise: "manufacturing",
      biography: "Manufacturing executive who specializes in reverse-engineering competitors' products and releasing cheaper alternatives.",
      rivalryScore: 77
    },
    {
      name: "Sophia Rodriguez",
      expertise: "healthcare",
      biography: "Healthcare entrepreneur whose company directly competes with yours. Known for aggressive marketing that targets your customer base.",
      rivalryScore: 82
    },
    {
      name: "Daniel Edwards",
      expertise: "education",
      biography: "Education industry competitor who frequently spreads misinformation about your business model and teaching methods.",
      rivalryScore: 63
    }
  ],
  businessContact: [
    {
      name: "Thomas Reynolds",
      expertise: "finance",
      biography: "Investment banker with connections to major capital sources. Can help arrange financing for large ventures.",
      businessSuccessLevel: 85
    },
    {
      name: "Linda Garcia",
      expertise: "technology",
      biography: "CTO of a growing tech firm. Has insider knowledge of emerging technologies and market trends.",
      businessSuccessLevel: 75
    },
    {
      name: "Richard Branson",
      expertise: "hospitality",
      biography: "Hospitality industry veteran who knows everyone worth knowing in the business. Can open doors to exclusive partnerships.",
      businessSuccessLevel: 90
    },
    {
      name: "Karen Walker",
      expertise: "retail",
      biography: "Supply chain optimization expert. Can help reduce costs and improve efficiency in retail operations.",
      businessSuccessLevel: 80
    },
    {
      name: "Daniel Kim",
      expertise: "manufacturing",
      biography: "Manufacturing consultant specializing in automation and efficiency. Can help scale production while maintaining quality.",
      businessSuccessLevel: 85
    },
    {
      name: "Jennifer Lopez",
      expertise: "creative",
      biography: "Entertainment industry executive with extensive connections in media and advertising. Can help secure promotional opportunities.",
      businessSuccessLevel: 88
    },
    {
      name: "Marcus Brown",
      expertise: "healthcare",
      biography: "Healthcare industry insider who understands complex regulations and compliance requirements. Invaluable for navigating the healthcare market.",
      businessSuccessLevel: 77
    },
    {
      name: "Sophia Chen",
      expertise: "education",
      biography: "Education technology specialist who connects businesses with academic institutions for research partnerships and talent recruitment.",
      businessSuccessLevel: 82
    },
    {
      name: "Robert Wilson",
      expertise: "consulting",
      biography: "Business strategy consultant with expertise in organizational transformation and crisis management. Can help navigate business challenges.",
      businessSuccessLevel: 93
    },
    {
      name: "Emily Johnson",
      expertise: "realestate",
      biography: "Commercial real estate broker with access to off-market properties and development opportunities. Knows the hidden gems before they're public.",
      businessSuccessLevel: 86
    }
  ],
  investor: [
    {
      name: "Howard Morgan",
      expertise: "finance",
      biography: "Angel investor looking for promising entrepreneurs. Provides not just capital but strategic advice and connections.",
      businessSuccessLevel: 90
    },
    {
      name: "Patricia Rollings",
      expertise: "technology",
      biography: "Venture capitalist specializing in fintech startups. Has a keen eye for disruptive business models.",
      businessSuccessLevel: 85
    },
    {
      name: "Gregory Wu",
      expertise: "realestate",
      biography: "Real estate investment trust manager with access to substantial capital for property development.",
      businessSuccessLevel: 80
    },
    {
      name: "Isabella Martinez",
      expertise: "hospitality",
      biography: "Restaurant group investor who has funded some of the most successful food establishments in the city.",
      businessSuccessLevel: 75
    },
    {
      name: "Benjamin Goldstein",
      expertise: "creative",
      biography: "Producer and investor in media projects. Understands the business side of creative industries.",
      businessSuccessLevel: 70
    },
    {
      name: "Sophia Park",
      expertise: "healthcare",
      biography: "Healthcare venture capitalist who has funded breakthrough medical technology companies. Expert at navigating regulatory hurdles.",
      businessSuccessLevel: 87
    },
    {
      name: "Michael Torres",
      expertise: "education",
      biography: "Impact investor focused on education technologies that improve learning outcomes. Seeks both financial returns and social impact.",
      businessSuccessLevel: 82
    },
    {
      name: "Rachel Goldman",
      expertise: "retail",
      biography: "Private equity investor specializing in retail turnarounds. Has a talent for identifying undervalued retail operations.",
      businessSuccessLevel: 88
    },
    {
      name: "David Chen",
      expertise: "manufacturing",
      biography: "Industrial investor with deep pockets for scaling manufacturing operations. Prioritizes sustainability and efficiency.",
      businessSuccessLevel: 92
    },
    {
      name: "Alexandra Kim",
      expertise: "consulting",
      biography: "Former management consultant turned investor. Specializes in business services and B2B software investments.",
      businessSuccessLevel: 84
    }
  ],
  industry: [
    {
      name: "Olivia Williams",
      expertise: "healthcare",
      biography: "Healthcare industry insider with knowledge of regulatory changes before they're announced publicly.",
      businessSuccessLevel: 80
    },
    {
      name: "Marcus Jordan",
      expertise: "technology",
      biography: "Former tech journalist with deep connections across Silicon Valley. Knows which startups are about to break out.",
      businessSuccessLevel: 75
    },
    {
      name: "Sophia Lee",
      expertise: "finance",
      biography: "Financial analyst specializing in market forecasting. Her predictions have an uncanny accuracy rate.",
      businessSuccessLevel: 85
    },
    {
      name: "Ryan Matthews",
      expertise: "realestate",
      biography: "Urban development specialist with insight into upcoming zoning changes and neighborhood transformations.",
      businessSuccessLevel: 80
    },
    {
      name: "Hannah Davis",
      expertise: "retail",
      biography: "Trend forecaster for consumer goods. Can predict which products will be in high demand next season.",
      businessSuccessLevel: 75
    },
    {
      name: "Andrew Wilson",
      expertise: "manufacturing",
      biography: "Supply chain expert who understands global manufacturing trends and potential disruptions before they impact the market.",
      businessSuccessLevel: 82
    },
    {
      name: "Mia Chen",
      expertise: "creative",
      biography: "Former creative director who now consults on emerging design trends and consumer preferences in the luxury goods market.",
      businessSuccessLevel: 78
    },
    {
      name: "Jonathan Kim",
      expertise: "hospitality",
      biography: "Food and beverage industry insider who tracks consumer dining habits and identifies emerging cuisine trends.",
      businessSuccessLevel: 76
    },
    {
      name: "Dr. Elena Rodriguez",
      expertise: "education",
      biography: "Education policy expert who advises on upcoming regulatory changes affecting educational institutions and technologies.",
      businessSuccessLevel: 83
    },
    {
      name: "William Johnson",
      expertise: "consulting",
      biography: "Business intelligence specialist who analyzes competitor strategies and market positioning across multiple industries.",
      businessSuccessLevel: 87
    }
  ],
  celebrity: [
    {
      name: "Jason Michaels",
      expertise: "creative",
      biography: "A-list actor looking to diversify his income through strategic investments. Association with him can boost your brand visibility.",
      influenceLevel: 95
    },
    {
      name: "Serena Williams",
      expertise: "hospitality",
      biography: "Sports star with her own line of lifestyle products. Partners with select businesses for endorsements and collaborations.",
      influenceLevel: 90
    },
    {
      name: "Carlos Santana",
      expertise: "creative",
      biography: "Legendary musician with investments in entertainment venues and premium alcohol brands.",
      influenceLevel: 85
    },
    {
      name: "Amara Johnson",
      expertise: "retail",
      biography: "Fashion icon and designer whose endorsement can make a product sell out overnight.",
      influenceLevel: 80
    },
    {
      name: "Derek Chang",
      expertise: "technology",
      biography: "Tech celebrity and thought leader whose recommendations influence purchasing decisions and technology adoption.",
      influenceLevel: 75
    },
    {
      name: "Olivia Taylor",
      expertise: "healthcare",
      biography: "Wellness-focused celebrity with a massive following among health-conscious consumers. Her endorsements drive significant sales.",
      influenceLevel: 83
    },
    {
      name: "Marcus Johnson",
      expertise: "finance",
      biography: "Former athlete turned financial literacy advocate. His business book recommendations can create instant bestsellers.",
      influenceLevel: 78
    },
    {
      name: "Sofia Rodriguez",
      expertise: "education",
      biography: "Celebrity academic whose online courses and educational content reach millions of followers worldwide.",
      influenceLevel: 82
    },
    {
      name: "James Wilson",
      expertise: "realestate",
      biography: "Reality TV star famous for luxury real estate shows. His properties and developments become instant landmarks.",
      influenceLevel: 88
    },
    {
      name: "Victoria Chen",
      expertise: "manufacturing",
      biography: "Industrial design celebrity known for creating iconic products. Her touch can transform ordinary items into must-have pieces.",
      influenceLevel: 86
    }
  ],
  influencer: [
    {
      name: "Zoe Rodriguez",
      expertise: "creative",
      biography: "Social media personality with millions of followers. Her audience trusts her product recommendations implicitly.",
      influenceLevel: 80
    },
    {
      name: "Tyler Brooks",
      expertise: "finance",
      biography: "Financial education influencer who simplifies complex investment concepts for his massive online audience.",
      influenceLevel: 75
    },
    {
      name: "Aisha Patel",
      expertise: "retail",
      biography: "Lifestyle influencer specializing in home goods and interior design. Products she features often sell out quickly.",
      influenceLevel: 85
    },
    {
      name: "Brandon Wilson",
      expertise: "technology",
      biography: "Tech reviewer whose opinions can make or break new product launches. Known for his honest, in-depth analysis.",
      influenceLevel: 90
    },
    {
      name: "Emma Thompson",
      expertise: "hospitality",
      biography: "Travel and food influencer who can drive significant traffic to new establishments with a single post.",
      influenceLevel: 80
    },
    {
      name: "David Chen",
      expertise: "realestate",
      biography: "Real estate influencer showcasing luxury properties worldwide. His virtual tours generate serious buyer interest.",
      influenceLevel: 83
    },
    {
      name: "Sophia Lee",
      expertise: "healthcare",
      biography: "Health and wellness influencer with a devoted following. Her recommendations on health products drive immediate sales spikes.",
      influenceLevel: 87
    },
    {
      name: "Marcus Johnson",
      expertise: "manufacturing",
      biography: "Workshop and DIY influencer who showcases manufacturing processes and tools to millions of fans.",
      influenceLevel: 79
    },
    {
      name: "Olivia Garcia",
      expertise: "education",
      biography: "Education content creator whose study methods and learning resources are followed by students worldwide.",
      influenceLevel: 82
    },
    {
      name: "Ryan Kim",
      expertise: "consulting",
      biography: "Business advice influencer providing strategic insights to entrepreneurs. His business tips regularly go viral.",
      influenceLevel: 88
    }
  ]
};

// Templates for different types of social events
const eventTemplates: Record<EventType, Partial<SocialEvent>[]> = {
  charity: [
    {
      name: "Local Charity Fun Run",
      description: "A community event raising money for local causes. Perfect for beginners looking to network while supporting a good cause.",
      prestigeRequired: 0,
      entryFee: 100,
      location: "City Park",
      benefits: {
        networkingPotential: 50,
        reputationGain: 40,
        potentialConnections: 1
      }
    },
    {
      name: "Annual Children's Hospital Gala",
      description: "A black-tie fundraiser supporting the Children's Hospital. Attended by wealthy philanthropists and local celebrities.",
      prestigeRequired: 5,
      entryFee: 5000,
      location: "Grand Ballroom, Ritz-Carlton",
      benefits: {
        networkingPotential: 85,
        reputationGain: 70,
        potentialConnections: 3
      }
    },
    {
      name: "Oceanic Conservation Benefit",
      description: "An elegant evening supporting ocean cleanup efforts. Draws environmentally-conscious wealthy individuals and corporate sponsors.",
      prestigeRequired: 10,
      entryFee: 7500,
      location: "Waterfront Aquarium",
      benefits: {
        networkingPotential: 80,
        reputationGain: 75,
        potentialConnections: 2
      }
    },
    {
      name: "Art for Education Auction",
      description: "A sophisticated art auction where proceeds support underfunded schools. Attracts art collectors and education advocates.",
      prestigeRequired: 3,
      entryFee: 3000,
      location: "Metropolitan Art Gallery",
      benefits: {
        networkingPotential: 70,
        reputationGain: 65,
        potentialConnections: 2
      }
    }
  ],
  business: [
    {
      name: "Local Business Meetup",
      description: "An informal gathering of local business owners and entrepreneurs. A great starting point for those new to networking.",
      prestigeRequired: 0,
      entryFee: 50,
      location: "Community Center",
      benefits: {
        networkingPotential: 40,
        reputationGain: 30,
        potentialConnections: 1,
        skillBoost: "communication",
        skillBoostAmount: 2
      }
    },
    {
      name: "Venture Capital Pitch Night",
      description: "An exclusive event where promising startups pitch to a room of investors. Great for connecting with the financial community.",
      prestigeRequired: 7,
      entryFee: 2000,
      location: "Innovation Hub",
      benefits: {
        networkingPotential: 90,
        reputationGain: 60,
        potentialConnections: 3,
        skillBoost: "negotiation",
        skillBoostAmount: 5
      }
    },
    {
      name: "Industry Leaders Luncheon",
      description: "A quarterly gathering of C-suite executives from major corporations. The perfect place to make high-level business connections.",
      prestigeRequired: 15,
      entryFee: 10000,
      location: "Executive Club",
      benefits: {
        networkingPotential: 95,
        reputationGain: 85,
        potentialConnections: 4,
        skillBoost: "leadership",
        skillBoostAmount: 8
      }
    },
    {
      name: "Small Business Alliance Mixer",
      description: "A casual networking event for local business owners. A friendly environment to find potential partners and collaborators.",
      prestigeRequired: 2,
      entryFee: 500,
      location: "Downtown Business Center",
      benefits: {
        networkingPotential: 75,
        reputationGain: 50,
        potentialConnections: 2,
        skillBoost: "communication",
        skillBoostAmount: 3
      }
    }
  ],
  gala: [
    {
      name: "Local Business Association Awards",
      description: "A modest annual celebration honoring local business achievements. A great first networking event for new entrepreneurs.",
      prestigeRequired: 0,
      entryFee: 150,
      location: "Community Hall",
      benefits: {
        networkingPotential: 50,
        reputationGain: 30,
        potentialConnections: 1
      }
    },
    {
      name: "Mayor's Annual Business Excellence Gala",
      description: "The city's premier event recognizing outstanding business achievements. Attended by political figures and business elites.",
      prestigeRequired: 12,
      entryFee: 15000,
      location: "City Hall Grand Ballroom",
      benefits: {
        networkingPotential: 90,
        reputationGain: 90,
        potentialConnections: 4
      }
    },
    {
      name: "Innovation Awards Ceremony",
      description: "A glamorous celebration of technological innovation and disruption. Connect with tech pioneers and potential investors.",
      prestigeRequired: 8,
      entryFee: 8000,
      location: "Tech Museum Grand Hall",
      benefits: {
        networkingPotential: 85,
        reputationGain: 80,
        potentialConnections: 3
      }
    },
    {
      name: "Fashion Industry Celebration",
      description: "A stylish gathering of fashion entrepreneurs, designers, and influencers. Perfect for those in retail or luxury goods.",
      prestigeRequired: 6,
      entryFee: 6000,
      location: "Metropolitan Fashion Center",
      benefits: {
        networkingPotential: 80,
        reputationGain: 75,
        potentialConnections: 3
      }
    }
  ],
  conference: [
    {
      name: "Free Career Development Workshop",
      description: "A community-sponsored workshop featuring local business owners sharing their journeys and advice. Perfect for beginners.",
      prestigeRequired: 0,
      entryFee: 0,
      location: "Public Library Conference Room",
      benefits: {
        networkingPotential: 40,
        reputationGain: 25,
        potentialConnections: 1,
        skillBoost: "business",
        skillBoostAmount: 3
      }
    },
    {
      name: "Global Investment Summit",
      description: "A three-day conference featuring talks from financial leaders and investment workshops. Essential for serious investors.",
      prestigeRequired: 10,
      entryFee: 5000,
      location: "Financial District Convention Center",
      benefits: {
        networkingPotential: 85,
        reputationGain: 70,
        potentialConnections: 5,
        skillBoost: "investing",
        skillBoostAmount: 10
      }
    },
    {
      name: "Future of Real Estate Conference",
      description: "The leading event for property development trends and real estate investment strategies. Includes property tours and deal-making sessions.",
      prestigeRequired: 8,
      entryFee: 4000,
      location: "Real Estate Board Headquarters",
      benefits: {
        networkingPotential: 80,
        reputationGain: 65,
        potentialConnections: 3,
        skillBoost: "realestate",
        skillBoostAmount: 8
      }
    },
    {
      name: "Entrepreneurs' Masterclass Weekend",
      description: "An intensive program of workshops and mentoring sessions led by successful business founders. Limited to 50 participants for a personalized experience.",
      prestigeRequired: 5,
      entryFee: 3500,
      location: "Entrepreneur's Retreat Center",
      benefits: {
        networkingPotential: 75,
        reputationGain: 60,
        potentialConnections: 2,
        skillBoost: "business",
        skillBoostAmount: 12
      }
    }
  ],
  club: [
    {
      name: "Community Book Club",
      description: "A relaxed gathering of readers and thinkers discussing business and self-improvement books. Many attendees are aspiring entrepreneurs.",
      prestigeRequired: 0,
      entryFee: 20,
      location: "Local Bookstore",
      benefits: {
        networkingPotential: 30,
        reputationGain: 20,
        potentialConnections: 1
      }
    },
    {
      name: "The Excelsior Club Monthly Dinner",
      description: "A tradition-rich gathering at the city's most exclusive private club. Membership is by invitation only, and the connections made here can last a lifetime.",
      prestigeRequired: 20,
      entryFee: 25000,
      location: "The Excelsior Club",
      benefits: {
        networkingPotential: 95,
        reputationGain: 95,
        potentialConnections: 2
      }
    },
    {
      name: "Young Entrepreneurs Club Meeting",
      description: "A dynamic group of under-40 business leaders sharing ideas and opportunities. More accessible than traditional clubs but still selective.",
      prestigeRequired: 5,
      entryFee: 2000,
      location: "Innovation Loft",
      benefits: {
        networkingPotential: 80,
        reputationGain: 65,
        potentialConnections: 3,
        skillBoost: "entrepreneurship",
        skillBoostAmount: 5
      }
    },
    {
      name: "International Business Council Gathering",
      description: "A sophisticated event connecting business leaders with global interests. Excellent for forming international partnerships.",
      prestigeRequired: 15,
      entryFee: 12000,
      location: "International Trade Center",
      benefits: {
        networkingPotential: 90,
        reputationGain: 85,
        potentialConnections: 3
      }
    }
  ],
  party: [
    {
      name: "Community Center Opening Celebration",
      description: "A simple gathering to celebrate the opening of a new community center. Local business owners and residents will attend.",
      prestigeRequired: 0,
      entryFee: 25,
      location: "New Community Center",
      benefits: {
        networkingPotential: 35,
        reputationGain: 20,
        potentialConnections: 1
      }
    },
    {
      name: "Billionaire's Birthday Bash",
      description: "An extravagant celebration at the mansion of a well-known billionaire. Invitation is a mark of having 'arrived' in high society.",
      prestigeRequired: 18,
      entryFee: 20000,
      location: "Private Mansion, Hillside Estates",
      benefits: {
        networkingPotential: 90,
        reputationGain: 80,
        potentialConnections: 3
      }
    },
    {
      name: "Tech Startup Launch Party",
      description: "A high-energy celebration of a promising new tech venture. Attended by investors, tech journalists, and industry insiders.",
      prestigeRequired: 6,
      entryFee: 3000,
      location: "Rooftop Lounge, Tech District",
      benefits: {
        networkingPotential: 85,
        reputationGain: 60,
        potentialConnections: 2
      }
    },
    {
      name: "Yacht Club Summer Social",
      description: "A relaxed but exclusive gathering of yacht owners and maritime enthusiasts. Business deals are often made over cocktails on the deck.",
      prestigeRequired: 12,
      entryFee: 8000,
      location: "Bayside Yacht Club",
      benefits: {
        networkingPotential: 80,
        reputationGain: 75,
        potentialConnections: 2
      }
    }
  ],
  networking: [
    {
      name: "Neighborhood Coffee Connections",
      description: "A casual morning coffee meetup for local professionals to exchange ideas and make connections in a relaxed atmosphere.",
      prestigeRequired: 0,
      entryFee: 10,
      location: "Local Coffee Shop",
      benefits: {
        networkingPotential: 45,
        reputationGain: 25,
        potentialConnections: 1,
        skillBoost: "communication",
        skillBoostAmount: 2
      }
    },
    {
      name: "Executive Breakfast Series",
      description: "A monthly morning meetup of executives sharing insights over gourmet breakfast. Known for its quality conversations and absence of hard selling.",
      prestigeRequired: 8,
      entryFee: 1500,
      location: "Downtown Executive Club",
      benefits: {
        networkingPotential: 85,
        reputationGain: 65,
        potentialConnections: 2,
        skillBoost: "leadership",
        skillBoostAmount: 4
      }
    },
    {
      name: "Women in Business Empowerment Dinner",
      description: "A supportive environment for female entrepreneurs and executives to connect and mentor each other.",
      prestigeRequired: 5,
      entryFee: 2000,
      location: "Skyline Restaurant, Private Dining Room",
      benefits: {
        networkingPotential: 80,
        reputationGain: 70,
        potentialConnections: 2,
        skillBoost: "leadership",
        skillBoostAmount: 5
      }
    },
    {
      name: "Industry Disruptors Meetup",
      description: "A gathering of innovative thinkers challenging the status quo in their fields. Ideal for those looking to stay ahead of industry trends.",
      prestigeRequired: 7,
      entryFee: 2500,
      location: "Innovation Hub Lounge",
      benefits: {
        networkingPotential: 75,
        reputationGain: 65,
        potentialConnections: 3,
        skillBoost: "innovation",
        skillBoostAmount: 6
      }
    }
  ],
  workshop: [
    {
      name: "Community Financial Literacy Workshop",
      description: "A free workshop teaching basic financial concepts to community members. A great opportunity to network with people interested in improving their financial knowledge.",
      prestigeRequired: 0,
      entryFee: 0,
      location: "Community Center",
      benefits: {
        networkingPotential: 40,
        reputationGain: 30,
        potentialConnections: 1,
        skillBoost: "finance",
        skillBoostAmount: 5
      }
    },
    {
      name: "Advanced Investing Strategies Workshop",
      description: "A focused workshop led by top investment professionals sharing advanced techniques for portfolio management.",
      prestigeRequired: 5,
      entryFee: 1000,
      location: "Financial District Learning Center",
      benefits: {
        networkingPotential: 75,
        reputationGain: 50,
        potentialConnections: 2,
        skillBoost: "investing",
        skillBoostAmount: 12
      }
    },
    {
      name: "Executive Leadership Workshop",
      description: "An intensive two-day program focused on leadership skills for C-suite executives and aspiring leaders.",
      prestigeRequired: 10,
      entryFee: 5000,
      location: "Executive Training Institute",
      benefits: {
        networkingPotential: 85,
        reputationGain: 70,
        potentialConnections: 3,
        skillBoost: "leadership",
        skillBoostAmount: 15
      }
    },
    {
      name: "Negotiation Mastery Workshop",
      description: "Learn advanced negotiation techniques from experienced business negotiators who have closed multi-million dollar deals.",
      prestigeRequired: 7,
      entryFee: 3000,
      location: "Business School Executive Education Center",
      benefits: {
        networkingPotential: 70,
        reputationGain: 60,
        potentialConnections: 2,
        skillBoost: "negotiation",
        skillBoostAmount: 10
      }
    }
  ],
  seminar: [
    {
      name: "First-Time Entrepreneur Seminar",
      description: "A beginner-friendly seminar covering the basics of starting your first business, with networking opportunities afterward.",
      prestigeRequired: 0,
      entryFee: 50,
      location: "Small Business Development Center",
      benefits: {
        networkingPotential: 50,
        reputationGain: 30,
        potentialConnections: 1,
        skillBoost: "entrepreneurship",
        skillBoostAmount: 4
      }
    },
    {
      name: "Wealth Management Strategies Seminar",
      description: "A comprehensive overview of advanced wealth preservation and growth strategies for high-net-worth individuals.",
      prestigeRequired: 12,
      entryFee: 7500,
      location: "Luxury Hotel Ballroom",
      benefits: {
        networkingPotential: 90,
        reputationGain: 75,
        potentialConnections: 3,
        skillBoost: "wealth_management",
        skillBoostAmount: 12
      }
    },
    {
      name: "Commercial Real Estate Investment Seminar",
      description: "A detailed exploration of commercial real estate opportunities, featuring industry experts and property developers.",
      prestigeRequired: 8,
      entryFee: 4000,
      location: "Real Estate Investors Association",
      benefits: {
        networkingPotential: 80,
        reputationGain: 60,
        potentialConnections: 2,
        skillBoost: "realestate",
        skillBoostAmount: 10
      }
    },
    {
      name: "Digital Marketing Excellence Seminar",
      description: "An in-depth seminar on cutting-edge digital marketing strategies to help grow your business online.",
      prestigeRequired: 5,
      entryFee: 2000,
      location: "Digital Marketing Academy",
      benefits: {
        networkingPotential: 70,
        reputationGain: 50,
        potentialConnections: 2,
        skillBoost: "marketing",
        skillBoostAmount: 8
      }
    }
  ],
  award: [
    {
      name: "Community Small Business Recognition",
      description: "A modest ceremony recognizing local small businesses for their contributions to the community.",
      prestigeRequired: 0,
      entryFee: 75,
      location: "Town Hall",
      benefits: {
        networkingPotential: 45,
        reputationGain: 40,
        potentialConnections: 1
      }
    },
    {
      name: "Global Innovation Awards",
      description: "A prestigious ceremony recognizing breakthrough innovations across multiple industries, attended by tech leaders and venture capitalists.",
      prestigeRequired: 15,
      entryFee: 10000,
      location: "Grand Convention Center",
      benefits: {
        networkingPotential: 95,
        reputationGain: 90,
        potentialConnections: 4
      }
    },
    {
      name: "Industry Excellence Awards",
      description: "A well-respected award ceremony highlighting exceptional achievements in specific industry sectors.",
      prestigeRequired: 10,
      entryFee: 7500,
      location: "Luxury Hotel Grand Ballroom",
      benefits: {
        networkingPotential: 85,
        reputationGain: 80,
        potentialConnections: 3
      }
    },
    {
      name: "Entrepreneurial Spirit Awards",
      description: "An inspiring celebration of entrepreneurial achievement, particularly for founders who overcame significant challenges.",
      prestigeRequired: 7,
      entryFee: 5000,
      location: "Business School Auditorium",
      benefits: {
        networkingPotential: 80,
        reputationGain: 75,
        potentialConnections: 2
      }
    }
  ],
  product_launch: [
    {
      name: "Local Store Grand Opening",
      description: "A celebration of a new small business opening in the community. A good opportunity to meet local entrepreneurs and customers.",
      prestigeRequired: 0,
      entryFee: 0,
      location: "New Retail Space, Downtown",
      benefits: {
        networkingPotential: 40,
        reputationGain: 25,
        potentialConnections: 1
      }
    },
    {
      name: "Luxury Vehicle Launch Gala",
      description: "An exclusive unveiling of a new luxury car model, attended by high-net-worth individuals and industry executives.",
      prestigeRequired: 15,
      entryFee: 15000,
      location: "Luxury Automobile Showroom",
      benefits: {
        networkingPotential: 90,
        reputationGain: 75,
        potentialConnections: 3
      }
    },
    {
      name: "Tech Startup Product Reveal",
      description: "An exciting unveiling of a new technology product with potential to disrupt its market. Attended by tech insiders and investors.",
      prestigeRequired: 8,
      entryFee: 5000,
      location: "Innovation Hub Presentation Space",
      benefits: {
        networkingPotential: 85,
        reputationGain: 60,
        potentialConnections: 3,
        skillBoost: "technology",
        skillBoostAmount: 7
      }
    },
    {
      name: "Investment Fund Launch Reception",
      description: "A sophisticated gathering to announce a new investment fund, with opportunities to meet fund managers and early investors.",
      prestigeRequired: 10,
      entryFee: 8000,
      location: "Financial District Penthouse",
      benefits: {
        networkingPotential: 80,
        reputationGain: 65,
        potentialConnections: 2,
        skillBoost: "finance",
        skillBoostAmount: 8
      }
    }
  ],
  trade_show: [
    {
      name: "Community Business Expo",
      description: "A small-scale exhibition of local businesses showcasing their products and services. A good place to meet local entrepreneurs.",
      prestigeRequired: 0,
      entryFee: 25,
      location: "Community Center Exhibition Hall",
      benefits: {
        networkingPotential: 50,
        reputationGain: 30,
        potentialConnections: 2
      }
    },
    {
      name: "International Technology Trade Show",
      description: "A massive showcase of the latest technology innovations from around the world, attended by industry leaders and investors.",
      prestigeRequired: 10,
      entryFee: 5000,
      location: "Convention Center",
      benefits: {
        networkingPotential: 90,
        reputationGain: 70,
        potentialConnections: 4,
        skillBoost: "technology",
        skillBoostAmount: 10
      }
    },
    {
      name: "Luxury Goods Exhibition",
      description: "An elegant showcase of high-end products and services, from yachts to private jets to exclusive real estate opportunities.",
      prestigeRequired: 15,
      entryFee: 12000,
      location: "Luxury Exhibition Center",
      benefits: {
        networkingPotential: 85,
        reputationGain: 75,
        potentialConnections: 3
      }
    },
    {
      name: "Sustainable Business Innovation Fair",
      description: "A forward-thinking exhibition focused on eco-friendly business practices and sustainable product innovations.",
      prestigeRequired: 5,
      entryFee: 2000,
      location: "Green Business Center",
      benefits: {
        networkingPotential: 75,
        reputationGain: 65,
        potentialConnections: 3,
        skillBoost: "innovation",
        skillBoostAmount: 8
      }
    }
  ],
  retreat: [
    {
      name: "Weekend Business Vision Retreat",
      description: "A modest weekend retreat for small business owners to reflect on their business goals and connect with peers.",
      prestigeRequired: 0,
      entryFee: 500,
      location: "Local Retreat Center",
      benefits: {
        networkingPotential: 60,
        reputationGain: 40,
        potentialConnections: 2,
        skillBoost: "business",
        skillBoostAmount: 5
      }
    },
    {
      name: "Billionaire's Exclusive Mountain Retreat",
      description: "An ultra-exclusive gathering of the world's wealthiest individuals at a remote mountain resort, with activities and discussions.",
      prestigeRequired: 25,
      entryFee: 50000,
      location: "Private Mountain Resort",
      benefits: {
        networkingPotential: 100,
        reputationGain: 95,
        potentialConnections: 3,
        skillBoost: "wealth_management",
        skillBoostAmount: 20
      }
    },
    {
      name: "Executive Leadership Desert Retreat",
      description: "A transformative five-day experience for C-suite executives focused on strategic thinking and leadership renewal.",
      prestigeRequired: 15,
      entryFee: 20000,
      location: "Luxury Desert Resort",
      benefits: {
        networkingPotential: 90,
        reputationGain: 80,
        potentialConnections: 3,
        skillBoost: "leadership",
        skillBoostAmount: 15
      }
    },
    {
      name: "Innovation Think Tank Island Getaway",
      description: "A creative retreat bringing together innovative thinkers from various industries to brainstorm future trends and opportunities.",
      prestigeRequired: 12,
      entryFee: 15000,
      location: "Private Island Resort",
      benefits: {
        networkingPotential: 85,
        reputationGain: 70,
        potentialConnections: 4,
        skillBoost: "innovation",
        skillBoostAmount: 12
      }
    }
  ],
  vip_dinner: [
    {
      name: "Local Business Leaders Dinner",
      description: "A modest dinner gathering with successful local entrepreneurs sharing their experiences and advice.",
      prestigeRequired: 0,
      entryFee: 200,
      location: "Local Restaurant Private Room",
      benefits: {
        networkingPotential: 55,
        reputationGain: 35,
        potentialConnections: 1,
        skillBoost: "business",
        skillBoostAmount: 3
      }
    },
    {
      name: "Private Dinner with Billionaire Investor",
      description: "An extremely exclusive dinner with one of the world's most successful investors, limited to just 10 guests.",
      prestigeRequired: 20,
      entryFee: 25000,
      location: "Secret Luxury Venue",
      benefits: {
        networkingPotential: 95,
        reputationGain: 90,
        potentialConnections: 2,
        skillBoost: "investing",
        skillBoostAmount: 20
      }
    },
    {
      name: "CEO Roundtable Dinner",
      description: "An intimate dinner with CEOs from major corporations discussing current business challenges and opportunities.",
      prestigeRequired: 15,
      entryFee: 15000,
      location: "5-Star Restaurant Private Dining Suite",
      benefits: {
        networkingPotential: 90,
        reputationGain: 85,
        potentialConnections: 3,
        skillBoost: "leadership",
        skillBoostAmount: 12
      }
    },
    {
      name: "Tech Visionaries Supper Club",
      description: "A forward-looking dinner with technology pioneers discussing the future of innovation and digital transformation.",
      prestigeRequired: 10,
      entryFee: 10000,
      location: "Modernist Restaurant Experience",
      benefits: {
        networkingPotential: 85,
        reputationGain: 75,
        potentialConnections: 2,
        skillBoost: "technology",
        skillBoostAmount: 10
      }
    }
  ],
  sporting_event: [
    {
      name: "Charity Golf Tournament",
      description: "A community golf event raising funds for local charities. A relaxed environment to meet other business people.",
      prestigeRequired: 0,
      entryFee: 300,
      location: "Public Golf Course",
      benefits: {
        networkingPotential: 60,
        reputationGain: 40,
        potentialConnections: 2
      }
    },
    {
      name: "Championship Tennis Match VIP Box",
      description: "Exclusive box seats at a major tennis championship, with opportunity to mingle with celebrity athletes and executives.",
      prestigeRequired: 12,
      entryFee: 15000,
      location: "National Tennis Center",
      benefits: {
        networkingPotential: 85,
        reputationGain: 75,
        potentialConnections: 2
      }
    },
    {
      name: "Private Yacht Racing Experience",
      description: "Join a competitive yacht racing team for a day of sailing and socializing with wealthy sailing enthusiasts.",
      prestigeRequired: 18,
      entryFee: 20000,
      location: "Exclusive Yacht Club",
      benefits: {
        networkingPotential: 80,
        reputationGain: 85,
        potentialConnections: 2
      }
    },
    {
      name: "VIP Box at the Championship Game",
      description: "Premium access to a major sporting event in a luxury box, with gourmet catering and exclusive networking opportunities.",
      prestigeRequired: 15,
      entryFee: 18000,
      location: "Major Sports Stadium",
      benefits: {
        networkingPotential: 75,
        reputationGain: 80,
        potentialConnections: 3
      }
    }
  ]
};

// Generate a benefit based on connection type and expertise
function generateBenefit(connection: SocialConnection): ConnectionBenefit {
  const now = Date.now();
  const oneMonthFromNow = now + (30 * 24 * 60 * 60 * 1000); // 30 days in the future
  
  // Benefit types based on connection type
  const benefitTypesByConnectionType: Record<ConnectionType, ConnectionBenefitType[]> = {
    mentor: ['skillBoost', 'marketIntelligence', 'networkIntroduction'],
    rival: ['marketIntelligence', 'regulationInsight'],
    businessContact: ['businessOpportunity', 'networkIntroduction', 'reputationBoost'],
    investor: ['investmentTip', 'businessOpportunity', 'marketIntelligence'],
    industry: ['regulationInsight', 'marketIntelligence', 'reputationBoost'],
    celebrity: ['reputationBoost', 'lifestyleDiscount', 'networkIntroduction'],
    influencer: ['reputationBoost', 'lifestyleDiscount', 'marketIntelligence']
  };
  
  // Get appropriate benefit types for this connection
  const possibleBenefitTypes = benefitTypesByConnectionType[connection.type];
  const benefitType = getRandomElement(possibleBenefitTypes);
  
  // Generate benefit value based on relationship level and connection type
  const baseValue = 1000 + (connection.relationshipLevel * 100);
  
  // Adjust value based on connection type and expertise
  const typeMultiplier = connection.type === 'investor' ? 3.0 :
                         connection.type === 'mentor' ? 2.5 :
                         connection.type === 'businessContact' ? 2.0 :
                         connection.type === 'industry' ? 1.8 :
                         connection.type === 'celebrity' ? 1.5 :
                         connection.type === 'influencer' ? 1.3 :
                         1.0;
  
  const expertiseMultiplier = connection.expertise === 'finance' ? 1.5 :
                             connection.expertise === 'technology' ? 1.4 :
                             connection.expertise === 'realestate' ? 1.3 :
                             1.2;
  
  const value = Math.round(baseValue * typeMultiplier * expertiseMultiplier);
  
  // Descriptions based on benefit type
  const descriptions: Record<ConnectionBenefitType, string[]> = {
    investmentTip: [
      `${connection.name} shared a tip about an upcoming IPO in the ${connection.expertise} sector.`,
      `${connection.name} revealed information about a promising investment opportunity worth around ${formatCurrency(value)}.`,
      `${connection.name} tipped you off about a potentially undervalued ${connection.expertise} company.`
    ],
    businessOpportunity: [
      `${connection.name} offered to connect you with a potential business partner that could increase your revenue.`,
      `${connection.name} shared an exclusive business opportunity that could yield approximately ${formatCurrency(value)}.`,
      `${connection.name} invited you to participate in a new venture with potential returns of ${formatCurrency(value)}.`
    ],
    skillBoost: [
      `${connection.name} offered to mentor you in ${connection.expertise} skills, which could increase your earning potential.`,
      `${connection.name} shared industry best practices that could improve your business efficiency by ${(value/10000).toFixed(1)}%.`,
      `${connection.name} is willing to coach you on advanced ${connection.expertise} strategies.`
    ],
    lifestyleDiscount: [
      `${connection.name} offered you a VIP discount on luxury goods worth approximately ${formatCurrency(value)}.`,
      `${connection.name} can get you exclusive access to premium ${connection.expertise} services at a significant discount.`,
      `${connection.name} shared a member's discount code for high-end products worth about ${formatCurrency(value)}.`
    ],
    regulationInsight: [
      `${connection.name} warned you about upcoming regulatory changes in the ${connection.expertise} industry that could affect your investments.`,
      `${connection.name} shared insider information about policy changes that could save you approximately ${formatCurrency(value)}.`,
      `${connection.name} tipped you off about regulatory loopholes in the ${connection.expertise} sector.`
    ],
    marketIntelligence: [
      `${connection.name} shared market research data about emerging trends in ${connection.expertise} worth approximately ${formatCurrency(value)}.`,
      `${connection.name} revealed consumer behavior insights that could help optimize your business strategy.`,
      `${connection.name} provided competitive intelligence about market leaders in the ${connection.expertise} space.`
    ],
    networkIntroduction: [
      `${connection.name} offered to introduce you to their high-value contacts in the ${connection.expertise} industry.`,
      `${connection.name} can connect you with key decision-makers who could potentially generate ${formatCurrency(value)} in opportunities.`,
      `${connection.name} is willing to recommend you to their exclusive professional network.`
    ],
    reputationBoost: [
      `${connection.name} offered to publicly endorse you, potentially increasing your business reputation significantly.`,
      `${connection.name} invited you to co-author content that would boost your visibility in the ${connection.expertise} sector.`,
      `${connection.name} is willing to feature you in their high-profile ${connection.expertise} industry events.`
    ]
  };
  
  return {
    id: generateId(),
    type: benefitType,
    description: getRandomElement(descriptions[benefitType]),
    value,
    used: false,
    expiresAt: oneMonthFromNow
  };
}

// Create a new random connection based on the type
function createRandomConnection(type: ConnectionType, existingConnections: SocialConnection[] = []): SocialConnection {
  // Get all templates for this connection type
  const templates = connectionTemplates[type];
  
  // Filter templates to exclude those already in the player's network
  const existingNames = new Set(existingConnections.map(c => c.name));
  const availableTemplates = templates.filter(template => !existingNames.has(template.name || ''));
  
  // If all templates of this type are already connected, fall back to the original list
  // This should rarely happen with 10 templates per type
  const filteredTemplates = availableTemplates.length > 0 ? availableTemplates : templates;
  
  // Get a random template from the filtered list
  const template = getRandomElement(filteredTemplates);
  
  // Create base connection object
  const connection: SocialConnection = {
    id: generateId(),
    name: template.name || 'Unknown Contact',
    type,
    status: 'acquaintance',
    expertise: template.expertise as ExpertiseArea || 'finance',
    relationshipLevel: 10 + Math.floor(Math.random() * 20), // 10-30 initial value
    lastInteractionDate: Date.now(),
    pendingMeeting: false,
    benefits: [],
    biography: template.biography || 'A professional in their field.',
    // Copy specific properties based on connection type
    ...(template.mentorshipLevel && { mentorshipLevel: template.mentorshipLevel }),
    ...(template.rivalryScore && { rivalryScore: template.rivalryScore }),
    ...(template.influenceLevel && { influenceLevel: template.influenceLevel }),
    ...(template.businessSuccessLevel && { businessSuccessLevel: template.businessSuccessLevel })
  };
  
  // Generate an initial benefit
  const initialBenefit = generateBenefit(connection);
  connection.benefits = [initialBenefit];
  
  return connection;
}

// Create a random social event
function createRandomEvent(type: SocialEvent['type'], prestigeLevel: number): SocialEvent {
  // Get templates for this event type
  const templates = eventTemplates[type];
  
  // Filter templates based on prestige level
  const eligibleTemplates = templates.filter(t => (t.prestigeRequired || 0) <= prestigeLevel);
  
  // If no eligible templates, adjust the first template to match the prestige level
  // Allow for prestigeLevel 0 (no stars) by removing the Math.max constraint
  const template = eligibleTemplates.length > 0 
    ? getRandomElement(eligibleTemplates) 
    : { ...templates[0], prestigeRequired: prestigeLevel > 0 ? Math.max(0, prestigeLevel - 2) : 0 };
  
  // Get the current game time to make sure events are scheduled relative to game time, not system time
  const { currentGameDate } = useTime.getState();
  const gameTime = currentGameDate.getTime();
  
  // Calculate event date (5-25 days in the future)
  // This spreads events better across the month rather than clustering them
  const daysInFuture = 5 + Math.floor(Math.random() * 20);
  
  // Create a base date for the event using game time
  const baseDate = new Date(gameTime + (daysInFuture * 24 * 60 * 60 * 1000));
  
  // Generate a random time between 8:00 AM and 7:00 PM
  // 8 + 0-11 hours = 8:00 AM to 7:00 PM
  const hours = 8 + Math.floor(Math.random() * 12);
  
  // Generate random minutes (0, 15, 30, or 45)
  const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  
  // Set the time on the date
  baseDate.setHours(hours, minutes, 0, 0);
  
  // Get the timestamp
  const eventDate = baseDate.getTime();
  
  // Event is available until 1 day after the event date
  const availableUntil = eventDate + (24 * 60 * 60 * 1000);
  
  return {
    id: generateId(),
    name: template.name || 'Networking Event',
    description: template.description || 'An opportunity to connect with others in your industry.',
    type,
    date: eventDate,
    attendees: [],
    prestigeRequired: template.prestigeRequired !== undefined ? template.prestigeRequired : 0, // Default to 0 instead of 1
    entryFee: template.entryFee || 1000,
    location: template.location || 'Convention Center',
    benefits: template.benefits || {
      networkingPotential: 50,
      reputationGain: 50,
      potentialConnections: 1
    },
    attended: false,
    reserved: false, // Events start as not reserved
    availableUntil
  };
}

// Store interface
interface SocialNetworkState {
  connections: SocialConnection[];
  events: SocialEvent[];
  networkingLevel: number; // 1-100, increases with successful networking
  socialCapital: number; // A resource used for networking activities
  lastNetworkingActivity: number; // Timestamp
  
  // Actions
  addConnection: (type: ConnectionType) => SocialConnection;
  removeConnection: (connectionId: string) => boolean; // New method to remove connections
  addRandomConnections: (count?: number) => SocialConnection[];
  scheduleInteraction: (connectionId: string) => boolean;
  attendMeeting: (connectionId: string) => {success: boolean, benefit?: ConnectionBenefit};
  useBenefit: (connectionId: string, benefitId: string) => boolean;
  generateNewEvents: (count?: number) => SocialEvent[];
  removeEvent: (eventId: string) => boolean; // New method to remove/cancel events
  reserveEvent: (eventId: string) => {success: boolean}; // New method to reserve events
  attendEvent: (eventId: string) => {success: boolean, newConnections: SocialConnection[]};
  checkForExpiredContent: (showNotifications?: boolean) => void;
  regenerateSocialCapital: (isMonthlyBoost?: boolean) => void;
  resetSocialNetwork: () => void;
}

// Main store
export const useSocialNetwork = create<SocialNetworkState>()(
  persist(
    (set, get) => ({
      connections: [],
      events: [],
      networkingLevel: 10,
      socialCapital: 100,
      lastNetworkingActivity: Date.now(),
      
      // Add a new connection of specified type (with maximum limit of 10 connections)
      addConnection: (type: ConnectionType) => {
        const { connections } = get();
        
        // Enforce connection limit of 10
        const MAX_CONNECTIONS = 10;
        
        // Check if we're at the connection limit
        if (connections.length >= MAX_CONNECTIONS) {
          toast.info(`Network at capacity (${MAX_CONNECTIONS} max). Remove connections to add new ones.`, {
            duration: 5000
          });
          // Return a dummy connection that shouldn't be added to state
          // We need to return something to keep our types consistent
          return createRandomConnection(type, connections);
        }
        
        // Create a new connection, avoiding duplicates
        const newConnection = createRandomConnection(type, connections);
        
        set(state => ({
          connections: [...state.connections, newConnection]
        }));
        
        toast.success(`Added ${newConnection.name} to your network!`);
        return newConnection;
      },
      
      // Remove a connection from your network
      removeConnection: (connectionId: string) => {
        const { connections } = get();
        
        // Find the connection to remove
        const connection = connections.find(c => c.id === connectionId);
        if (!connection) {
          toast.error("Connection not found.");
          return false;
        }
        
        // Filter out the connection
        const updatedConnections = connections.filter(c => c.id !== connectionId);
        
        // Update state
        set({ 
          connections: updatedConnections
        });
        
        toast.success(`Removed ${connection.name} from your network.`);
        return true;
      },
      
      // Remove/cancel an event
      removeEvent: (eventId: string) => {
        const { events } = get();
        
        // Find the event to remove
        const event = events.find(e => e.id === eventId);
        if (!event) {
          toast.error("Event not found.");
          return false;
        }
        
        // Don't allow removing already attended events
        if (event.attended) {
          toast.error("Cannot remove an event you've already attended.");
          return false;
        }
        
        // Filter out the event
        const updatedEvents = events.filter(e => e.id !== eventId);
        
        // Update state
        set({ events: updatedEvents });
        
        toast.success(`Removed "${event.name}" from your calendar.`);
        return true;
      },
      
      // Schedule a meeting with a connection
      scheduleInteraction: (connectionId: string) => {
        const { connections, socialCapital } = get();
        
        // Find the connection
        const connection = connections.find(c => c.id === connectionId);
        if (!connection) {
          toast.error("Connection not found.");
          return false;
        }
        
        // Social capital cost based on connection type and status
        const baseInteractionCost = 10;
        const typeMultiplier = 
          connection.type === 'celebrity' ? 3.0 :
          connection.type === 'investor' ? 2.5 :
          connection.type === 'mentor' ? 2.0 :
          1.0;
        
        const statusMultiplier =
          connection.status === 'close' ? 0.7 : // Closer connections are easier to meet
          connection.status === 'friend' ? 0.8 :
          connection.status === 'associate' ? 1.0 :
          connection.status === 'contact' ? 1.2 :
          1.5; // Acquaintances are hardest to meet
        
        const interactionCost = Math.round(baseInteractionCost * typeMultiplier * statusMultiplier);
        
        // Check if player has enough social capital
        if (socialCapital < interactionCost) {
          toast.error(`You need ${interactionCost} social capital to schedule this meeting.`);
          return false;
        }
        
        // Calculate relationship increase for scheduling
        const scheduleRelationshipIncrease = 2; // Small increase just for scheduling
        
        // Update connection - increase relationship and set pending meeting
        const updatedConnections = connections.map(c => 
          c.id === connectionId
            ? { 
                ...c, 
                pendingMeeting: true,
                relationshipLevel: Math.min(100, c.relationshipLevel + scheduleRelationshipIncrease)
              }
            : c
        );
        
        set({ 
          connections: updatedConnections,
          socialCapital: socialCapital - interactionCost,
          lastNetworkingActivity: Date.now()
        });
        
        toast.success(`Meeting scheduled with ${connection.name}.`);
        return true;
      },
      
      // Attend a scheduled meeting
      attendMeeting: (connectionId: string) => {
        const { connections, networkingLevel } = get();
        const character = useCharacter.getState();
        
        // Find the connection
        const connection = connections.find(c => c.id === connectionId);
        if (!connection || !connection.pendingMeeting) {
          toast.error("No scheduled meeting found with this connection.");
          return { success: false };
        }
        
        // Determine relationship level increase based on networking level
        const baseIncrease = 5;
        const levelBonus = Math.floor(networkingLevel / 10); // +1 per 10 levels
        const relationshipIncrease = baseIncrease + levelBonus;
        
        // Generate a new benefit
        const newBenefit = generateBenefit(connection);
        
        // Determine if relationship status should improve
        let newStatus = connection.status;
        let newRelationshipLevel = Math.min(100, connection.relationshipLevel + relationshipIncrease);
        
        // Status progression thresholds
        if (newRelationshipLevel >= 80 && connection.status !== 'close') {
          newStatus = 'close';
        } else if (newRelationshipLevel >= 60 && connection.status !== 'friend' && connection.status !== 'close') {
          newStatus = 'friend';
        } else if (newRelationshipLevel >= 40 && connection.status !== 'associate' && connection.status !== 'friend' && connection.status !== 'close') {
          newStatus = 'associate';
        } else if (newRelationshipLevel >= 20 && connection.status === 'acquaintance') {
          newStatus = 'contact';
        }
        
        // Special handling for rivals
        if (connection.type === 'rival') {
          // Rivals get less relationship improvement
          newRelationshipLevel = Math.min(100, connection.relationshipLevel + Math.floor(relationshipIncrease / 2));
          
          // Rivals never become closer than "associate" regardless of level
          if (newStatus === 'friend' || newStatus === 'close') {
            newStatus = 'associate';
          }
          
          // Rivals become more intense as you interact with them
          const rivalryIncrease = 2 + Math.floor(Math.random() * 4); // 2-5 points
          const newRivalryScore = Math.min(100, (connection.rivalryScore || 50) + rivalryIncrease);
          
          // Update the connection with rivalry-specific changes
          const updatedConnections = connections.map(c => 
            c.id === connectionId
              ? { 
                  ...c, 
                  pendingMeeting: false,
                  relationshipLevel: newRelationshipLevel,
                  status: newStatus,
                  lastInteractionDate: Date.now(),
                  benefits: [...c.benefits, newBenefit],
                  rivalryScore: newRivalryScore
                }
              : c
          );
          
          // Meeting with rivals can sometimes affect your reputation negatively
          if (Math.random() < 0.3) { // 30% chance
            // Add reputation penalty logic here when reputation system is implemented
            toast.warning(`${connection.name} subtly undermined you during your meeting.`);
          }
          
          set({ 
            connections: updatedConnections,
            networkingLevel: Math.min(500, networkingLevel + 1)
            // Removed social capital reward to slow down relationship progression
          });
        } else {
          // Update the connection for non-rivals
          const updatedConnections = connections.map(c => 
            c.id === connectionId
              ? { 
                  ...c, 
                  pendingMeeting: false,
                  relationshipLevel: newRelationshipLevel,
                  status: newStatus,
                  lastInteractionDate: Date.now(),
                  benefits: [...c.benefits, newBenefit]
                }
              : c
          );
          
          // Larger networking gain for non-rivals (but no social capital gain)
          set({ 
            connections: updatedConnections,
            networkingLevel: Math.min(500, networkingLevel + 2)
            // Removed social capital reward to slow down relationship progression
          });
          
          // Special bonuses based on connection type
          if (connection.type === 'mentor') {
            // Mentors can give skill-equivalent value
            const skillValue = 1 + Math.floor((connection.mentorshipLevel || 50) / 20); // 1-5 points based on mentorship level
            character.addWealth(skillValue * 1000);
            toast.success(`${connection.name} taught you valuable skills worth ${formatCurrency(skillValue * 1000)}.`);
          }
        }
        
        toast.success(`Meeting with ${connection.name} was successful!`);
        return { success: true, benefit: newBenefit };
      },
      
      // Use a benefit from a connection
      useBenefit: (connectionId: string, benefitId: string) => {
        const { connections } = get();
        const character = useCharacter.getState();
        
        // Find the connection and benefit
        const connection = connections.find(c => c.id === connectionId);
        if (!connection) {
          toast.error("Connection not found.");
          return false;
        }
        
        const benefit = connection.benefits.find(b => b.id === benefitId);
        if (!benefit) {
          toast.error("Benefit not found.");
          return false;
        }
        
        if (benefit.used) {
          toast.error("This benefit has already been used.");
          return false;
        }
        
        // Handle based on benefit type
        switch (benefit.type) {
          case 'investmentTip':
            // Add investment opportunity logic
            character.addWealth(benefit.value);
            toast.success(`Used investment tip from ${connection.name} for ${formatCurrency(benefit.value)}.`);
            break;
            
          case 'businessOpportunity':
            // Add business opportunity logic
            character.addWealth(benefit.value);
            toast.success(`Leveraged business opportunity from ${connection.name} for ${formatCurrency(benefit.value)}.`);
            break;
            
          case 'skillBoost':
            // Convert benefit to wealth boost
            const skillValue = Math.max(1, Math.floor(benefit.value / 5000));
            character.addWealth(skillValue * 1000);
            toast.success(`Used ${connection.name}'s advice to improve your skills, worth ${formatCurrency(skillValue * 1000)}.`);
            break;
            
          case 'lifestyleDiscount':
            // Add lifestyle discount logic
            character.addWealth(benefit.value / 2);
            toast.success(`Used exclusive discount from ${connection.name} worth ${formatCurrency(benefit.value / 2)}.`);
            break;
            
          case 'regulationInsight':
            // Add regulation insight logic
            character.addWealth(benefit.value);
            toast.success(`Used regulatory insight from ${connection.name} to avoid losses of ${formatCurrency(benefit.value)}.`);
            break;
            
          case 'marketIntelligence':
            // Add market intelligence logic
            character.addWealth(benefit.value);
            toast.success(`Applied market intelligence from ${connection.name} worth ${formatCurrency(benefit.value)}.`);
            break;
            
          case 'networkIntroduction':
            // Add network introduction logic - create a new random connection
            const connectionTypes: ConnectionType[] = ['businessContact', 'investor', 'industry'];
            const newConnectionType = getRandomElement(connectionTypes);
            get().addConnection(newConnectionType);
            toast.success(`${connection.name} introduced you to a valuable new contact.`);
            break;
            
          case 'reputationBoost':
            // Add reputation boost logic
            character.addWealth(benefit.value / 2);
            
            // If there's a prestige system, add a point
            const prestige = usePrestige.getState();
            if (prestige && prestige.addPrestigePoints) {
              prestige.addPrestigePoints(1);
              toast.success(`${connection.name}'s endorsement boosted your prestige!`);
            } else {
              toast.success(`${connection.name}'s endorsement improved your reputation.`);
            }
            break;
            
          default:
            toast.error("Unknown benefit type.");
            return false;
        }
        
        // Mark benefit as used
        const updatedConnections = connections.map(c => 
          c.id === connectionId
            ? { 
                ...c, 
                benefits: c.benefits.map(b => 
                  b.id === benefitId
                    ? { ...b, used: true }
                    : b
                )
              }
            : c
        );
        
        set({ connections: updatedConnections });
        return true;
      },
      
      // Add random connections to your network with a maximum limit of 10 connections
      addRandomConnections: (count = 1) => {
        const { connections } = get();
        const newConnections: SocialConnection[] = [];
        
        // Enforce connection limit of 10
        const MAX_CONNECTIONS = 10;
        
        // Check if we're at the connection limit
        if (connections.length >= MAX_CONNECTIONS) {
          // We're at capacity, can't add more without removing
          toast.info(`Network at capacity (${MAX_CONNECTIONS} max). Remove connections to add new ones.`, {
            duration: 5000
          });
          return [];
        }
        
        // Calculate how many connections we can still add
        const availableSlots = MAX_CONNECTIONS - connections.length;
        const actualCount = Math.min(availableSlots, count);
        
        // Get all possible connection types for random selection
        const connectionTypes: ConnectionType[] = [
          'businessContact', 
          'investor', 
          'industry', 
          'mentor',
          'celebrity', 
          'influencer'
        ];
        
        // Add possible rival (with lower chance)
        if (Math.random() < 0.2) { // 20% chance
          connectionTypes.push('rival');
        }
        
        // Keep track of all connections (existing + newly added) to prevent duplicates
        let updatedConnectionList = [...connections];
        
        for (let i = 0; i < actualCount; i++) {
          // Select a random connection type
          const randomType = getRandomElement(connectionTypes);
          
          // Create a new connection of this type, preventing duplicates with both
          // existing connections and connections we've already added in this batch
          const newConnection = createRandomConnection(randomType, updatedConnectionList);
          newConnections.push(newConnection);
          
          // Add to our running list to prevent duplicates in subsequent iterations
          updatedConnectionList.push(newConnection);
        }
        
        set({ 
          connections: [...connections, ...newConnections],
          socialCapital: Math.max(0, get().socialCapital - (10 * actualCount)) // Cost social capital to add connections
        });
        
        // Show notification about connection limit if we couldn't add all requested connections
        if (actualCount < count) {
          toast.info(`Added ${actualCount} connections. Network limit is ${MAX_CONNECTIONS} connections.`, {
            duration: 5000
          });
        }
        
        return newConnections;
      },
      
      // Generate new social events (with maximum limit of 10 events)
      generateNewEvents: (count = 3) => {
        const { events } = get();
        const { level: prestigeLevel = 1 } = usePrestige.getState() || { level: 1 };
        
        // Enforce event limit of 10
        const MAX_EVENTS = 10;
        
        // Calculate unattended events only (ones the player can still attend)
        const unattendedEvents = events.filter(e => !e.attended);
        
        // Check if we're at the event limit
        if (unattendedEvents.length >= MAX_EVENTS) {
          toast.info(`Event calendar full (${MAX_EVENTS} max). Cancel events or wait for them to expire.`, {
            duration: 5000
          });
          return [];
        }
        
        // Calculate how many events we can still add
        const availableSlots = MAX_EVENTS - unattendedEvents.length;
        const actualCount = Math.min(availableSlots, count);
        
        // Event types weighted by frequency
        const eventTypeWeights: [EventType, number][] = [
          ['business', 3],
          ['networking', 3],
          ['charity', 2],
          ['conference', 2],
          ['workshop', 2.5],
          ['seminar', 2],
          ['gala', 1.5],
          ['club', 1],
          ['party', 1],
          ['award', 1],
          ['product_launch', 1.5],
          ['trade_show', 1.5],
          ['retreat', 0.8],
          ['vip_dinner', 1.2],
          ['sporting_event', 1]
        ];
        
        // Build weighted list
        const weightedTypes: EventType[] = [];
        eventTypeWeights.forEach(([type, weight]) => {
          for (let i = 0; i < weight; i++) {
            weightedTypes.push(type);
          }
        });
        
        // Generate new events
        const newEvents: SocialEvent[] = [];
        for (let i = 0; i < actualCount; i++) {
          const eventType = getRandomElement(weightedTypes);
          const newEvent = createRandomEvent(eventType, prestigeLevel);
          newEvents.push(newEvent);
        }
        
        set({ events: [...events, ...newEvents] });
        
        // No longer showing notifications about new events being added
        // Users will need to check the events tab to discover them
        
        return newEvents;
      },

      // Reserve a social event
      reserveEvent: (eventId: string) => {
        const { events } = get();
        const character = useCharacter.getState();
        const { level: prestigeLevel = 1 } = usePrestige.getState() || { level: 1 };
        const { currentDay, currentMonth, currentYear } = useTime.getState();
        
        // Find the event
        const event = events.find(e => e.id === eventId);
        if (!event) {
          toast.error("Event not found.");
          return { success: false };
        }
        
        // Check if event has already been attended
        if (event.attended) {
          toast.error("You've already attended this event.");
          return { success: false };
        }
        
        // Check if event is already reserved
        if (event.reserved) {
          toast.info("You've already reserved this event.");
          return { success: false };
        }
        
        // Check if player can afford the entry fee
        if (character.wealth < event.entryFee) {
          toast.error(`You need ${formatCurrency(event.entryFee)} to reserve this event.`);
          return { success: false };
        }
        
        // Check prestige requirement
        if (event.prestigeRequired > prestigeLevel) {
          toast.error(`You need prestige level ${event.prestigeRequired} to attend this event.`);
          return { success: false };
        }
        
        // Get dates for comparison
        const eventDate = new Date(event.date);
        const currentGameDate = new Date(currentYear, currentMonth - 1, currentDay);
        const daysUntil = Math.ceil((eventDate.getTime() - currentGameDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if event is in the past
        if (currentGameDate > eventDate) {
          toast.error("This event has already passed.");
          return { success: false };
        }
        
        // Charge the entry fee
        character.addWealth(-event.entryFee);
        
        // Mark as reserved in our state
        const updatedEvents = events.map(e => 
          e.id === eventId
            ? { ...e, reserved: true }
            : e
        );
        
        set({ events: updatedEvents });
        
        toast.success(`Event reserved! You'll attend "${event.name}" in ${daysUntil} days.`);
        return { success: true };
      },
      
      // Attend a social event
      attendEvent: (eventId: string) => {
        const { events, connections } = get();
        const character = useCharacter.getState();
        const { level: prestigeLevel = 1 } = usePrestige.getState() || { level: 1 };
        const { currentDay, currentMonth, currentYear } = useTime.getState();
        
        // Find the event
        const event = events.find(e => e.id === eventId);
        if (!event) {
          toast.error("Event not found.");
          return { success: false, newConnections: [] };
        }
        
        // Check if event has already been attended
        if (event.attended) {
          toast.error("You've already attended this event.");
          return { success: false, newConnections: [] };
        }
        
        // Check if player can afford the entry fee 
        // (we charge at reservation time)
        if (!event.reserved && character.wealth < event.entryFee) {
          toast.error(`You need ${formatCurrency(event.entryFee)} to reserve this event.`);
          return { success: false, newConnections: [] };
        }
        
        // Check prestige requirement
        if (event.prestigeRequired > prestigeLevel) {
          toast.error(`You need prestige level ${event.prestigeRequired} to attend this event.`);
          return { success: false, newConnections: [] };
        }
        
        // Get dates for comparison
        const eventDate = new Date(event.date);
        const currentGameDate = new Date(currentYear, currentMonth - 1, currentDay);
        const daysUntil = Math.ceil((eventDate.getTime() - currentGameDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Handle reservation case
        if (currentGameDate < eventDate && !event.reserved) {
          // Reserve the event and charge the fee
          character.addWealth(-event.entryFee);
          
          // Mark as reserved in our state
          const updatedEvents = events.map(e => 
            e.id === eventId
              ? { ...e, reserved: true }
              : e
          );
          
          set({ events: updatedEvents });
          
          toast.success(`Event reserved! You'll attend "${event.name}" in ${daysUntil} days.`);
          return { success: true, newConnections: [] };
        }
        
        // Handle attendance case - both automatic (time reached) and manual attendance
        if ((event.reserved && currentGameDate >= eventDate) || 
            (!event.reserved && currentGameDate >= eventDate)) {
          
          // Charge entry fee if not already reserved
          if (!event.reserved) {
            character.addWealth(-event.entryFee);
          }
          
          // Enforce connection limit of 10
          const MAX_CONNECTIONS = 10;
          
          // Calculate how many new connections to make based on event benefits AND the available network slots
          const baseConnectionCount = event.benefits.potentialConnections;
          const networkingBonus = Math.floor(get().networkingLevel / 20); // +1 per 20 levels
          const potentialConnections = Math.min(5, baseConnectionCount + networkingBonus);
          
          // Check how many connection slots are available
          const availableSlots = Math.max(0, MAX_CONNECTIONS - connections.length);
          const actualConnectionCount = Math.min(availableSlots, potentialConnections);
          
          // Create new connections
          const newConnections: SocialConnection[] = [];
          const connectionTypes: ConnectionType[] = ['businessContact', 'investor', 'industry', 'mentor'];
          
          // Add possible celebrity or influencer for high-prestige events
          if (event.prestigeRequired >= 10) {
            connectionTypes.push('celebrity', 'influencer');
          }
          
          // Add possible rival (with lower chance)
          if (Math.random() < 0.2) { // 20% chance
            connectionTypes.push('rival');
          }
          
          // Keep track of all connections (existing + newly added) to prevent duplicates
          let updatedConnectionList = [...connections];
          
          for (let i = 0; i < actualConnectionCount; i++) {
            const type = getRandomElement(connectionTypes);
            
            // Create a connection that doesn't duplicate existing ones or ones we just added
            const newConnection = createRandomConnection(type, updatedConnectionList);
            newConnections.push(newConnection);
            
            // Add to our running list to prevent duplicates in subsequent iterations
            updatedConnectionList.push(newConnection);
          }
          
          // Mark event as attended and add new connections
          const updatedEvents = events.map(e => 
            e.id === eventId
              ? { ...e, attended: true }
              : e
          );
          
          // Apply networking level increase based on event benefits
          const networkingLevelBoost = Math.floor(event.benefits.networkingPotential / 10);
          const newNetworkingLevel = Math.min(500, get().networkingLevel + networkingLevelBoost);
          
          // Apply social capital boost
          const socialCapitalBoost = 20 + Math.floor(event.benefits.networkingPotential / 5);
          
          // Apply skill boost if applicable
          if (event.benefits.skillBoost && event.benefits.skillBoostAmount) {
            // Add wealth as a fallback if skill system isn't fully implemented
            character.addWealth(event.benefits.skillBoostAmount * 500);
            toast.success(`You gained valuable ${event.benefits.skillBoost} skills at the event worth ${formatCurrency(event.benefits.skillBoostAmount * 500)}!`);
          }
          
          // Update state
          set({ 
            events: updatedEvents,
            connections: [...connections, ...newConnections],
            networkingLevel: newNetworkingLevel,
            socialCapital: get().socialCapital + socialCapitalBoost,
            lastNetworkingActivity: Date.now()
          });
          
          // Show notification about connections gained, or if some were missed due to network capacity
          if (potentialConnections > availableSlots) {
            toast.success(`You attended ${event.name} and met ${newConnections.length} new contacts! (Network at ${connections.length + newConnections.length}/${MAX_CONNECTIONS} capacity)`);
          } else {
            toast.success(`You attended ${event.name} and met ${newConnections.length} new contacts!`);
          }
          
          return { success: true, newConnections: newConnections };
        }
        
        // Should not reach here - event is in the future and not reserved
        toast.info(`This event is scheduled for ${daysUntil} days from now. You can reserve it now and attend when the date arrives.`);
        return { success: false, newConnections: [] };
      },
      
      // Check for expired content and handle due events
      checkForExpiredContent: (showNotifications?: boolean) => {
        const { events, connections } = get();
        const now = Date.now();
        const { currentDay, currentMonth, currentYear } = useTime.getState();
        const currentGameDate = new Date(currentYear, currentMonth - 1, currentDay);
        
        // Process events that are reserved and the date has arrived
        const dueEvents = events.filter(event => 
          event.reserved && !event.attended && 
          new Date(event.date) <= currentGameDate
        );
        
        // Automatically attend due events (silently, without notifications)
        if (dueEvents.length > 0) {
          for (const event of dueEvents) {
            // If showNotifications is false, we'll skip toasts by wrapping the attendEvent call
            if (!showNotifications) {
              // Store original toast functions
              const originalSuccessToast = toast.success;
              const originalInfoToast = toast.info;
              const originalErrorToast = toast.error;
              
              // Replace with silent versions
              toast.success = (() => 'silent') as typeof toast.success;
              toast.info = (() => 'silent') as typeof toast.info;
              toast.error = (() => 'silent') as typeof toast.error;
              
              // Call the function
              get().attendEvent(event.id);
              
              // Restore original toast functions
              toast.success = originalSuccessToast;
              toast.info = originalInfoToast;
              toast.error = originalErrorToast;
            } else {
              // Regular call with notifications
              get().attendEvent(event.id);
            }
          }
        }
        
        // Keep track of events that are removed due to passing their date without reservation
        const missedEvents: SocialEvent[] = [];
        
        // Remove expired events: both events that have passed their availableUntil time
        // AND events whose scheduled date has passed (regardless of reservation status)
        const updatedEvents = events.filter(event => {
          // If already attended, filter it out
          if (event.attended) return false;
          
          // Check if scheduled date has passed based on game time
          const scheduledDate = new Date(event.date);
          const dateHasPassed = scheduledDate <= currentGameDate;
          
          // If the event date has passed, don't keep it (regardless of reservation status)
          if (dateHasPassed) {
            // If it was reserved, automatically attend it
            if (event.reserved) {
              // Will be handled by the dueEvents logic above
              return false;
            } else {
              // If not reserved, it's a missed event
              missedEvents.push(event);
              return false;
            }
          }
          
          // For future events, check if they're still available
          return event.availableUntil > now;
        });
        
        // Show notifications only when explicitly requested (for monthly summaries)
        if (showNotifications && missedEvents.length > 0) {
          // Only show notification for the first missed event if multiple
          const missedEvent = missedEvents[0];
          if (missedEvents.length === 1) {
            toast.info(`Last month, you missed the "${missedEvent.name}" event.`);
          } else {
            toast.info(`Last month, you missed ${missedEvents.length} events, including "${missedEvent.name}".`);
          }
        }
        
        // Process expired benefits
        const updatedConnections = connections.map(connection => {
          // Filter out expired benefits
          const validBenefits = connection.benefits.filter(benefit => 
            benefit.used || !benefit.expiresAt || benefit.expiresAt > now
          );
          
          return {
            ...connection,
            benefits: validBenefits
          };
        });
        
        // Only update state if something changed
        if (updatedEvents.length !== events.length || 
            JSON.stringify(updatedConnections) !== JSON.stringify(connections)) {
          set({ 
            events: updatedEvents,
            connections: updatedConnections
          });
          
          // Generate new events if needed
          if (events.length - updatedEvents.length > 0) {
            const newEventsCount = Math.min(3, events.length - updatedEvents.length);
            get().generateNewEvents(newEventsCount);
          }
        }
      },
      
      // Regenerate social capital over time
      regenerateSocialCapital: (isMonthlyBoost = false) => {
        const { socialCapital, lastNetworkingActivity, networkingLevel } = get();
        const now = Date.now();
        
        // For monthly boosts, provide a significant amount of social capital
        if (isMonthlyBoost) {
          // Base monthly amount set to 25 as requested (reduced from 100)
          const baseMonthlyAmount = 25; // 25 base social capital per month
          
          // Calculate monthly regeneration (no level bonus as requested)
          const regenerationAmount = baseMonthlyAmount; // Removed levelBonus
          
          // Update social capital (capped at 200)
          const newSocialCapital = Math.min(200, socialCapital + regenerationAmount);
          
          if (newSocialCapital > socialCapital) {
            set({ 
              socialCapital: newSocialCapital,
              lastNetworkingActivity: now
            });
            
            // Show notification to player
            toast.success(`Monthly Social Capital Boost: +${regenerationAmount} (Total: ${newSocialCapital})`, {
              duration: 5000
            });
            
            return { 
              success: true,
              amount: regenerationAmount, 
              newTotal: newSocialCapital 
            };
          }
        } 
        // For the standard time-based regeneration
        else {
          const timeSinceLastActivity = now - lastNetworkingActivity;
          
          // Only regenerate if it's been at least an hour
          if (timeSinceLastActivity >= 60 * 60 * 1000) {
            // Reduced base regeneration amount (since we now have the monthly boost)
            const baseRegeneration = 3;
            
            // Bonus based on networking level
            const levelBonus = Math.floor(networkingLevel / 20); // Reduced from /10 to /20
            
            // Calculate how many hours have passed (capped at 24)
            const hoursPassed = Math.min(24, timeSinceLastActivity / (60 * 60 * 1000));
            
            // Calculate total regeneration
            const regenerationAmount = Math.floor((baseRegeneration + levelBonus) * hoursPassed);
            
            // Update social capital (capped at 200)
            const newSocialCapital = Math.min(200, socialCapital + regenerationAmount);
            
            if (newSocialCapital > socialCapital) {
              set({ 
                socialCapital: newSocialCapital,
                lastNetworkingActivity: now
              });
              
              return { 
                success: true,
                amount: regenerationAmount, 
                newTotal: newSocialCapital 
              };
            }
          }
        }
        
        return { success: false, amount: 0, newTotal: socialCapital };
      },
      
      // Reset the social network system
      resetSocialNetwork: () => {
        set({
          connections: [], // Always start with 0 connections
          events: [],      // Start with 0 events
          networkingLevel: 10,
          socialCapital: 100,
          lastNetworkingActivity: Date.now()
        });
        
        // No longer generating initial events - all events must be found by the player
        // This makes the social network entirely player-driven
      }
    }),
    {
      name: 'business-empire-social-network',
      partialize: (state) => ({
        connections: state.connections,
        events: state.events,
        networkingLevel: state.networkingLevel,
        socialCapital: state.socialCapital,
        lastNetworkingActivity: state.lastNetworkingActivity
      }),
    }
  )
);

// Setup the initial state when the module is first imported
// This runs only once when the store is created
const initializeSocialNetwork = () => {
  const state = useSocialNetwork.getState();
  
  console.log('Initializing social network - checking if fresh install or game reset');
  
  // Check if this is a game reset or fresh install
  const isReset = sessionStorage.getItem('character_reset_completed') === 'true';
  const isForceReset = window.location.search.includes('reset=true');
  
  if (isReset || isForceReset) {
    console.log('Reset detected - ensuring social network is empty');
    state.resetSocialNetwork();
    return;
  }
  
  // If no connections exist but not due to reset (fresh install),
  // simply initialize with empty arrays
  if (state.connections.length === 0) {
    console.log('New game detected - starting with 0 social connections');
    // No initial connections or events - player must find them through gameplay
  }
};

// Call the initialization function
if (typeof window !== 'undefined') {
  initializeSocialNetwork();
}

// Register the store in the global registry with the correct name
registerStore('socialNetwork', useSocialNetwork);

// Log successful registration
console.log('✅ SocialNetwork Store: Registered in global store registry');

export default useSocialNetwork;